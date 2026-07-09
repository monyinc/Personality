import type { ProviderConfig, ProviderId, RunResult, Track } from "../types";
import { callProvider } from "./providers";
import { TRAITS, TRAIT_ORDER, bucketFor, generateSystemPrompt } from "./traits";
import { compareTraits, type TraitReading } from "./scoring";

/**
 * LLM-in-the-loop prompt optimizer, in the style of OpenAI's Playground
 * "Optimize" / eval-driven prompt tuning: instead of assembling template
 * fragments, a model *writes* a coherent persona prompt for the target Big
 * Five profile, the candidate is auditioned against a probe message, the
 * response is scored with the same LIWC-style lexicon the playground radar
 * uses, and the measured drift (plus any human ratings from the playground)
 * is fed back for a targeted revision. The best-scoring candidate wins.
 */

const OPTIMIZER_SYSTEM_PROMPT = `You are an expert prompt engineer specializing in AI persona design. You write system prompts that make an AI assistant embody a precise Big Five (NEO-PI-R) personality profile.

You will receive:
- TARGET PROFILE: five trait dials from 0-100, each grounded in two named NEO-PI-R facets.
- BASELINE PROMPT: the mechanical template currently in use. Treat it as a spec of intent, not text to copy.
- AUDITION FEEDBACK (optional): a previous candidate prompt, the test response it produced, and per-trait drift (measured minus intended, on the 0-100 dial scale).
- HUMAN FEEDBACK (optional): thumbs and notes a person left on earlier responses produced with this personality.

Write ONE new system prompt that:
1. Reads as a coherent character, not a rule list: open with a short identity paragraph in second person ("You are ..."), then give concrete behavioral guidance that weaves the traits into a single voice.
2. Expresses each dial at its intensity. Settings near 0 or 100 get vivid, unmistakable instructions; moderate settings get proportionally subtle guidance; dials in the neutral band are left unconstrained.
3. Shows rather than tells: include one or two short in-voice example phrasings so the assistant can hear the register it should hit.
4. Resolves tension between traits deliberately (e.g. blunt but warm, curious but disciplined) instead of listing contradictory rules.
5. When AUDITION FEEDBACK shows drift, makes targeted revisions that push the drifted traits back toward their intended values while preserving what already worked. When HUMAN FEEDBACK is present, treat it as the highest-priority signal.

Rules: Output only the system prompt text itself - no preamble, no code fences, no commentary, no meta-headings. Keep it under 250 words.`;

/**
 * One neutral workplace probe that gives all five dials room to show:
 * planning (C), risk and worry (N), other people (E/A), and open-ended
 * problem framing (O).
 */
const PROBE_MESSAGE =
  "My team's project deadline just moved up two weeks and I don't think we can make it. What should we do?";

/** Dial-band adjectives so the model reads 83 as "high", not just a number. */
function describeTarget(track: Track): string {
  return TRAIT_ORDER.map((id) => {
    const def = TRAITS[id];
    const value = track.traits[id];
    const bucket = bucketFor(value);
    const band =
      bucket === "mid"
        ? "neutral - leave this dimension unconstrained"
        : `${bucket} (toward "${value < 50 ? def.leftLabel : def.rightLabel}")`;
    return `- ${def.label} = ${value}/100, ${band}. NEO-PI-R facets: ${def.facets.join(", ")}.`;
  }).join("\n");
}

function describeDrift(readings: TraitReading[]): string {
  return readings
    .map((r) => {
      const def = TRAITS[r.id];
      const sign = r.delta > 0 ? "+" : "";
      return `- ${def.label}: intended ${r.intended}, measured ${r.measured} (drift ${sign}${r.delta})`;
    })
    .join("\n");
}

function describeHumanFeedback(rated: RunResult[]): string {
  return rated
    .map((r) => {
      const vote = r.rating.vote === "up" ? "Thumbs up" : r.rating.vote === "down" ? "Thumbs down" : "No vote";
      const note = r.rating.note.trim() ? ` Note: "${r.rating.note.trim()}"` : "";
      const excerpt = (r.text ?? "").trim();
      return `- ${vote} on a response${excerpt ? ` that began: "${truncate(excerpt, 300)}"` : ""}.${note}`;
    })
    .join("\n");
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

/** Strip code fences or a stray "System prompt:" label if the model adds one anyway. */
function cleanCandidate(raw: string): string {
  let text = raw.trim();
  const fence = text.match(/^```[a-z]*\n([\s\S]*?)\n```$/i);
  if (fence) text = fence[1].trim();
  text = text.replace(/^system prompt:?\s*/i, "");
  return text.trim();
}

function meanAbsDrift(readings: TraitReading[]): number {
  return readings.reduce((n, r) => n + Math.abs(r.delta), 0) / readings.length;
}

export interface OptimizeProgress {
  round: number;
  maxRounds: number;
  phase: "drafting" | "auditioning" | "scoring";
}

export interface OptimizeOutcome {
  prompt: string;
  rounds: number;
  readings: TraitReading[];
  converged: boolean;
}

export interface OptimizeOptions {
  provider: ProviderId;
  config: ProviderConfig;
  track: Track;
  /** Rated playground takes for this track, used as human preference signal. */
  ratedTakes?: RunResult[];
  maxRounds?: number;
  /** Max acceptable per-trait |measured - intended| before we stop refining. */
  tolerance?: number;
  onProgress?: (progress: OptimizeProgress) => void;
}

export async function optimizeTrackPrompt(opts: OptimizeOptions): Promise<OptimizeOutcome> {
  const { provider, config, track, onProgress } = opts;
  const maxRounds = opts.maxRounds ?? 3;
  const tolerance = opts.tolerance ?? 15;

  const baseline = generateSystemPrompt(track.name, track.traits);
  const rated = (opts.ratedTakes ?? []).filter((r) => r.rating.vote !== null || r.rating.note.trim());

  let best: { prompt: string; readings: TraitReading[] } | null = null;
  let previous: { prompt: string; response: string; readings: TraitReading[] } | null = null;

  for (let round = 1; round <= maxRounds; round++) {
    onProgress?.({ round, maxRounds, phase: "drafting" });

    const sections = [
      `TARGET PROFILE for an assistant named "${track.name || "the assistant"}":\n${describeTarget(track)}`,
      `BASELINE PROMPT:\n${baseline}`,
    ];
    if (rated.length > 0) {
      sections.push(`HUMAN FEEDBACK on earlier responses with this personality:\n${describeHumanFeedback(rated)}`);
    }
    if (previous) {
      sections.push(
        `AUDITION FEEDBACK on your previous candidate.\nPrevious candidate prompt:\n${previous.prompt}\n\nTest message: "${PROBE_MESSAGE}"\nTest response:\n${truncate(previous.response, 900)}\n\nMeasured drift per trait (0-100 dial scale):\n${describeDrift(previous.readings)}\n\nRevise so the drifted traits land closer to their intended values.`,
      );
    }

    const candidate = cleanCandidate(
      await callProvider(provider, {
        apiKey: config.apiKey,
        model: config.model,
        systemPrompt: OPTIMIZER_SYSTEM_PROMPT,
        userMessage: sections.join("\n\n"),
      }),
    );
    if (!candidate) throw new Error("The optimizer model returned an empty prompt.");

    onProgress?.({ round, maxRounds, phase: "auditioning" });
    const response = await callProvider(provider, {
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: candidate,
      userMessage: PROBE_MESSAGE,
    });

    onProgress?.({ round, maxRounds, phase: "scoring" });
    const readings = compareTraits(track.traits, response);

    if (!best || meanAbsDrift(readings) < meanAbsDrift(best.readings)) {
      best = { prompt: candidate, readings };
    }
    if (readings.every((r) => Math.abs(r.delta) <= tolerance)) {
      return { prompt: candidate, rounds: round, readings, converged: true };
    }
    previous = { prompt: candidate, response, readings };
  }

  // Never converged inside the budget: ship the best-scoring candidate, not the last one.
  return { prompt: best!.prompt, rounds: maxRounds, readings: best!.readings, converged: false };
}

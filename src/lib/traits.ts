import type { TraitId, TraitValues } from "../types";

/**
 * Personality dimensions follow the Five-Factor Model / Big Five (Costa &
 * McCrae, NEO-PI-R, 1992), the most replicated taxonomy of personality
 * structure in trait psychology. Each dial's behavioral instructions are
 * derived from two of that domain's real NEO-PI-R facets rather than
 * invented adjectives, so a given dial position corresponds to a specific,
 * named construct instead of a made-up "vibe."
 *
 * Neuroticism is scored in its standard psychological direction (high =
 * more anxious/reactive, low = more emotionally stable) and translated here
 * into assistant behavior via its Anxiety and Self-Consciousness facets:
 * how much a response hedges, qualifies, and dwells on what could go wrong.
 */
export interface TraitDef {
  id: TraitId;
  label: string;
  tag: string;
  leftLabel: string;
  rightLabel: string;
  facets: [string, string];
  fragments: {
    veryLow: string;
    low: string;
    lowMid: string;
    highMid: string;
    high: string;
    veryHigh: string;
  };
}

export const TRAIT_ORDER: TraitId[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

export const TRAITS: Record<TraitId, TraitDef> = {
  openness: {
    id: "openness",
    label: "Openness",
    tag: "OPEN",
    leftLabel: "Conventional",
    rightLabel: "Curious",
    facets: ["Ideas", "Aesthetics"],
    fragments: {
      veryLow:
        "Stick to conventional, well-established approaches. Do not speculate, brainstorm alternatives, or introduce tangents; give the standard, expected answer only.",
      low: "Favor practical, tried-and-tested framings over novel ones. Mention alternatives only if they are directly useful.",
      lowMid:
        "Keep mostly to the direct, familiar approach, with at most a brief nod to one alternative if it is clearly relevant.",
      highMid:
        "Where it helps, offer one alternative framing or angle on the problem in addition to the direct answer.",
      high: "Bring intellectual curiosity to the response: offer an alternative framing, a relevant analogy, or a less obvious angle alongside the direct answer.",
      veryHigh:
        "Treat the question as an invitation to explore: offer multiple framings, draw an analogy from an unrelated domain, and flag where convention might be worth questioning.",
    },
  },
  conscientiousness: {
    id: "conscientiousness",
    label: "Conscientiousness",
    tag: "CONS",
    leftLabel: "Loose",
    rightLabel: "Disciplined",
    facets: ["Order", "Achievement Striving"],
    fragments: {
      veryLow:
        "Keep it loose and impressionistic: a quick take is enough, do not organize into steps or double-check details.",
      low: "Give a light, unstructured answer; only mention structure if the content is inherently a sequence.",
      lowMid:
        "Default to plain prose; add structure only where the content is naturally a list or sequence of steps.",
      highMid:
        "Organize the response so it is easy to follow, using structure (steps, grouping) where it aids clarity.",
      high: "Be thorough and well-organized: structure the response clearly, cover the necessary detail, and check that nothing material is missing.",
      veryHigh:
        "Be meticulous: structure the response into clear sections or steps, verify details before stating them, and explicitly note any completeness caveats (what was and wasn't covered).",
    },
  },
  extraversion: {
    id: "extraversion",
    label: "Extraversion",
    tag: "EXTR",
    leftLabel: "Reserved",
    rightLabel: "Outgoing",
    facets: ["Assertiveness", "Positive Emotions"],
    fragments: {
      veryLow:
        "Stay reserved and minimal: state the answer plainly, with no enthusiasm, elaboration, or social framing.",
      low: "Keep an even, low-key tone. Say what's needed without extra energy or embellishment.",
      lowMid:
        "Answer in a measured, matter-of-fact register, saving elaboration for where it is actually needed.",
      highMid: "Bring a bit of energy to the response, and state your view plainly rather than staying neutral.",
      high: "Be outgoing and assertive: lead with your view, sound engaged and energetic, and don't hedge on a stance you can back.",
      veryHigh:
        "Be highly assertive and enthusiastic: open with a confident, energetic take, take a clear stance, and let genuine engagement with the topic come through.",
    },
  },
  agreeableness: {
    id: "agreeableness",
    label: "Agreeableness",
    tag: "AGRE",
    leftLabel: "Challenging",
    rightLabel: "Accommodating",
    facets: ["Altruism", "Straightforwardness"],
    fragments: {
      veryLow:
        "Prioritize candor over comfort: state the blunt truth even if unwelcome, and do not soften criticism or disagreement.",
      low: "Be direct about problems or disagreement; don't spend effort cushioning the message.",
      lowMid: "State disagreement or bad news plainly, with only minimal softening.",
      highMid:
        "Deliver the substance clearly, but frame criticism or bad news with some consideration for how it lands.",
      high: "Be cooperative and considerate: acknowledge the person's position, soften criticism, and look for common ground before disagreeing.",
      veryHigh:
        "Prioritize the relationship: validate the person's effort or position first, deliver any criticism gently and constructively, and actively look for ways to agree or help.",
    },
  },
  neuroticism: {
    id: "neuroticism",
    label: "Neuroticism",
    tag: "NEUR",
    leftLabel: "Stable",
    rightLabel: "Reactive",
    facets: ["Anxiety", "Self-Consciousness"],
    fragments: {
      veryLow:
        "Be unflappable: state conclusions plainly with no hedging, and treat uncertainty as a minor footnote rather than a caveat to dwell on.",
      low: "Stay calm and steady; note uncertainty briefly if it is material, without dwelling on it.",
      lowMid: "Keep an even, composed tone; flag real uncertainty once, briefly, then move on.",
      highMid: "Where there is genuine uncertainty, flag it clearly rather than glossing over it.",
      high: "Be attentive to what could go wrong: surface uncertainty, edge cases, and caveats explicitly, and qualify claims that aren't fully certain.",
      veryHigh:
        "Treat uncertainty and risk as central: qualify claims heavily, call out what could go wrong in detail, and check the response for ways it could be misread before finalizing it.",
    },
  },
};

export const NEUTRAL_VALUE = 50;

export function defaultTraitValues(): TraitValues {
  return TRAIT_ORDER.reduce((acc, id) => {
    acc[id] = NEUTRAL_VALUE;
    return acc;
  }, {} as TraitValues);
}

type Bucket = "veryLow" | "low" | "lowMid" | "mid" | "highMid" | "high" | "veryHigh";

/** Seven-level graduated scale (six behavioral steps plus a neutral band) rather than a hard low/high split. */
export function bucketFor(value: number): Bucket {
  if (value < 15) return "veryLow";
  if (value < 29) return "low";
  if (value < 43) return "lowMid";
  if (value < 58) return "mid";
  if (value < 72) return "highMid";
  if (value < 86) return "high";
  return "veryHigh";
}

export function traitFragments(traits: TraitValues): string[] {
  const lines: string[] = [];
  for (const id of TRAIT_ORDER) {
    const bucket = bucketFor(traits[id]);
    if (bucket === "mid") continue;
    lines.push(TRAITS[id].fragments[bucket]);
  }
  return lines;
}

export function generateSystemPrompt(name: string, traits: TraitValues): string {
  const fragments = traitFragments(traits);
  const header = `You are ${name || "the assistant"}. Follow these behavioral rules in every response:`;
  if (fragments.length === 0) {
    return `${header}\n\n- Respond naturally with no strong stylistic bias; use ordinary, balanced judgment about tone, length, and format.`;
  }
  return `${header}\n\n${fragments.map((f) => `- ${f}`).join("\n")}`;
}

/**
 * The single source of truth for "what prompt does this track actually send."
 * Manual-override tracks fall back to the generated prompt until the person
 * has actually typed something, so the notepad, the copy button, and a live
 * run never disagree about what's in effect.
 */
export function effectiveSystemPrompt(track: { name: string; traits: TraitValues; manualOverride: boolean; manualPrompt: string }): string {
  const generated = generateSystemPrompt(track.name, track.traits);
  if (!track.manualOverride) return generated;
  return track.manualPrompt || generated;
}

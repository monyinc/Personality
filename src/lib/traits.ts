import type { TraitId, TraitValues } from "../types";

export interface TraitDef {
  id: TraitId;
  label: string;
  tag: string; // short fader-cap label, like hardware silkscreen
  leftLabel: string;
  rightLabel: string;
  fragments: {
    veryLow: string;
    low: string;
    high: string;
    veryHigh: string;
  };
}

export const TRAIT_ORDER: TraitId[] = [
  "warmth",
  "formality",
  "verbosity",
  "directness",
  "structure",
  "proactivity",
  "playfulness",
  "confidence",
];

export const TRAITS: Record<TraitId, TraitDef> = {
  warmth: {
    id: "warmth",
    label: "Warmth",
    tag: "WARM",
    leftLabel: "Clinical",
    rightLabel: "Empathetic",
    fragments: {
      veryLow:
        "Stay strictly neutral and impersonal. Do not use warmth, encouragement, or emotional language, report facts and next steps only.",
      low: "Keep an even, businesslike tone. Acknowledge the person briefly without dwelling on feelings.",
      high: "Use a warm, personable tone. Acknowledge how the person might be feeling before getting to the substance.",
      veryHigh:
        "Lead with genuine warmth and empathy. Validate the person's situation or effort explicitly before addressing the task, and check in on how they're doing.",
    },
  },
  formality: {
    id: "formality",
    label: "Formality",
    tag: "FORM",
    leftLabel: "Casual",
    rightLabel: "Formal",
    fragments: {
      veryLow:
        "Write like a text to a close colleague: contractions, casual phrasing, no stiffness.",
      low: "Keep language relaxed and conversational.",
      high: "Use professional, businesslike language. Avoid slang and contractions.",
      veryHigh:
        "Use a formal, precise register throughout: complete sentences, no contractions, no colloquialisms, as if drafting an official document.",
    },
  },
  verbosity: {
    id: "verbosity",
    label: "Verbosity",
    tag: "VERB",
    leftLabel: "Terse",
    rightLabel: "Elaborate",
    fragments: {
      veryLow:
        "Answer in the fewest words that fully address the request, a sentence or short fragment when possible. No preamble, no summary.",
      low: "Keep responses short: one or two sentences unless more detail is explicitly requested.",
      high: "Give thorough, well-developed responses with supporting detail and context.",
      veryHigh:
        "Be expansive: cover context, reasoning, caveats, and related considerations in full before concluding.",
    },
  },
  directness: {
    id: "directness",
    label: "Directness",
    tag: "DRCT",
    leftLabel: "Diplomatic",
    rightLabel: "Blunt",
    fragments: {
      veryLow:
        "Soften every claim, offer multiple options deferentially, and let the person decide.",
      low: "Frame recommendations gently, leaving room for the person's own judgment.",
      high: "State your recommendation plainly and say what you'd do. Don't bury the answer in caveats.",
      veryHigh:
        "Be blunt. Lead with the answer or verdict in the first sentence. Say directly when something is a bad idea, without softening it.",
    },
  },
  structure: {
    id: "structure",
    label: "Structure",
    tag: "STRC",
    leftLabel: "Prose",
    rightLabel: "Structured",
    fragments: {
      veryLow:
        "Write in flowing prose. Do not use bullet points, numbered lists, or headers.",
      low: "Prefer prose; use a list only if the content is truly a sequence of steps.",
      high: "Default to structured formatting (headers, bullets, or numbered steps) when it improves scanability.",
      veryHigh:
        "Always format with clear headers and bulleted or numbered lists. Break every response into labeled sections.",
    },
  },
  proactivity: {
    id: "proactivity",
    label: "Proactivity",
    tag: "PROA",
    leftLabel: "Reactive",
    rightLabel: "Proactive",
    fragments: {
      veryLow:
        "Answer exactly what was asked and stop. Do not suggest additional steps or unrequested improvements.",
      low: "Stay focused on the literal request; mention extras only if directly relevant.",
      high: "After answering, proactively flag related risks, gaps, or next steps the person may not have asked about.",
      veryHigh:
        "Anticipate what the person will need next. Answer the question, then actively surface risks, alternatives, and a recommended next action without being asked.",
    },
  },
  playfulness: {
    id: "playfulness",
    label: "Playfulness",
    tag: "PLAY",
    leftLabel: "Serious",
    rightLabel: "Playful",
    fragments: {
      veryLow: "Stay strictly serious. No jokes, wordplay, or exclamation points.",
      low: "Keep tone even and professional; light warmth is fine but avoid jokes.",
      high: "Let some personality and light humor come through where appropriate.",
      veryHigh:
        "Be playful: use humor, light wordplay, and an upbeat voice, while still fully answering the question.",
    },
  },
  confidence: {
    id: "confidence",
    label: "Confidence",
    tag: "CONF",
    leftLabel: "Hedged",
    rightLabel: "Assertive",
    fragments: {
      veryLow:
        "Hedge claims explicitly (\"it's possible that…\", \"I'm not fully certain\"). Flag uncertainty prominently.",
      low: "Note uncertainty where it meaningfully exists, but don't over-hedge.",
      high: "State conclusions with confidence when the evidence supports it. Reserve hedging for genuine uncertainty.",
      veryHigh:
        "Speak with full confidence and authority. State conclusions as fact when supported; only flag uncertainty for genuinely unresolved questions, and do so once, briefly.",
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

type Bucket = "veryLow" | "low" | "mid" | "high" | "veryHigh";

export function bucketFor(value: number): Bucket {
  if (value <= 15) return "veryLow";
  if (value <= 38) return "low";
  if (value < 62) return "mid";
  if (value < 85) return "high";
  return "veryHigh";
}

/** Builds the ordered list of instruction fragments implied by the dial positions. */
export function traitFragments(traits: TraitValues): string[] {
  const lines: string[] = [];
  for (const id of TRAIT_ORDER) {
    const bucket = bucketFor(traits[id]);
    if (bucket === "mid") continue;
    lines.push(TRAITS[id].fragments[bucket]);
  }
  return lines;
}

/** Composes the full generated system prompt text from a name + dial positions. */
export function generateSystemPrompt(name: string, traits: TraitValues): string {
  const fragments = traitFragments(traits);
  const header = `You are ${name || "the assistant"}. Follow these behavioral rules in every response:`;
  if (fragments.length === 0) {
    return `${header}\n\n- Respond naturally with no strong stylistic bias; use ordinary, balanced judgment about tone, length, and format.`;
  }
  return `${header}\n\n${fragments.map((f) => `- ${f}`).join("\n")}`;
}

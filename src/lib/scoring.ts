import type { TraitId, TraitValues } from "../types";
import { TRAIT_ORDER } from "./traits";

/**
 * Rough, explainable text heuristics that estimate where a *response* landed
 * on each dial. Not ground truth, just a fast proxy so a person can see
 * whether a fader move actually moved the output before trusting it further.
 */

const HEDGE_WORDS = [
  "might", "could", "perhaps", "possibly", "may", "i think", "i believe",
  "it's possible", "not entirely sure", "probably", "seems like", "somewhat",
];
const ASSERTIVE_WORDS = [
  "definitely", "certainly", "will", "is the", "the answer is", "clearly", "always", "never",
];
const WARM_WORDS = [
  "feel", "understand", "here for you", "great job", "no worries", "i'm sorry",
  "congrat", "appreciate", "that sounds", "you're doing", "thank you for",
];
const PLAYFUL_MARKERS = ["!", "😄", "😊", "🎉", "haha", "lol", ":)", "fun ", "yay"];
const CONTRACTIONS = ["don't", "can't", "it's", "i'm", "we're", "you're", "that's", "isn't", "won't", "let's"];
const FORMAL_CONNECTORS = ["furthermore", "in accordance with", "therefore", "hereby", "accordingly", "pursuant"];
const PROACTIVE_MARKERS = [
  "you might also", "additionally", "next step", "one thing to consider",
  "worth noting", "i'd also", "you may want to", "keep in mind",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function countHits(haystack: string, needles: string[]): number {
  return needles.reduce((n, needle) => n + (haystack.includes(needle) ? 1 : 0), 0);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasListStructure(text: string): boolean {
  const lines = text.split("\n");
  const listLines = lines.filter((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l)).length;
  const headerLines = lines.filter((l) => /^\s*#{1,4}\s+/.test(l)).length;
  return listLines + headerLines > 0;
}

export function measureTraits(text: string): Partial<TraitValues> {
  const lower = text.toLowerCase();
  const words = wordCount(text);
  const listy = hasListStructure(text);
  const listRatio =
    text.split("\n").filter((l) => /^\s*([-*•]|\d+[.)]|#{1,4}\s)/.test(l)).length /
    Math.max(1, text.split("\n").length);

  const hedges = countHits(lower, HEDGE_WORDS);
  const assertive = countHits(lower, ASSERTIVE_WORDS);
  const warm = countHits(lower, WARM_WORDS);
  const playful = countHits(lower, PLAYFUL_MARKERS);
  const contractions = countHits(lower, CONTRACTIONS);
  const formalWords = countHits(lower, FORMAL_CONNECTORS);
  const proactive = countHits(lower, PROACTIVE_MARKERS);

  const measured: Partial<TraitValues> = {
    verbosity: clamp(12 * Math.log2(words + 1)), // ~0 words -> 0, ~300 words -> ~97
    structure: clamp(listy ? 55 + listRatio * 120 : 20),
    directness: clamp(50 + assertive * 10 - hedges * 10),
    confidence: clamp(50 + assertive * 9 - hedges * 12),
    warmth: clamp(35 + warm * 13),
    playfulness: clamp(15 + playful * 14),
    formality: clamp(55 - contractions * 9 + formalWords * 10),
    proactivity: clamp(30 + proactive * 14),
  };
  return measured;
}

export interface TraitReading {
  id: TraitId;
  intended: number;
  measured: number;
  delta: number;
}

export function compareTraits(intended: TraitValues, text: string): TraitReading[] {
  const measured = measureTraits(text);
  return TRAIT_ORDER.map((id) => {
    const m = measured[id] ?? 50;
    return { id, intended: intended[id], measured: m, delta: m - intended[id] };
  });
}

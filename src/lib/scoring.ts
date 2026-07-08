import type { TraitId, TraitValues } from "../types";
import { TRAIT_ORDER } from "./traits";

/**
 * Estimates where a *response* landed on each Big Five dial from its text.
 *
 * This is a small, hand-built, open word-category lexicon in the style of
 * LIWC (Linguistic Inquiry and Word Count), not the licensed LIWC dictionary
 * itself. The *direction* each category is combined in is grounded in
 * published findings relating language use to the Big Five:
 *
 *  - Pennebaker & King (1999), "Linguistic styles: Language use as an
 *    individual difference marker" — social words and positive emotion
 *    words track Extraversion and Agreeableness; negations and negative
 *    emotion words track Neuroticism; tentative/insight language and
 *    longer words track Openness.
 *  - Yarkoni (2010), "Personality in 100,000 words" — replicates the
 *    negative-emotion/Neuroticism and social-word/Extraversion links at
 *    scale, and ties achievement language to Conscientiousness.
 *  - Park et al. (2015), "Automatic Personality Assessment Through Social
 *    Media Language" — corroborates the same five directions in a modern
 *    large-sample setting.
 *
 * The absolute 0-100 scale below is a heuristic calibration, not a fitted
 * model, so treat a reading as a directional signal (did this dial move
 * the output at all, and which way), not a validated personality score.
 */

const POSITIVE_EMOTION = [
  "happy", "great", "good", "glad", "wonderful", "love", "nice", "enjoy",
  "pleased", "excited", "delighted", "appreciate", "thank you", "thanks",
  "awesome", "fantastic",
];
const NEGATIVE_EMOTION = [
  "bad", "sad", "angry", "hate", "terrible", "awful", "unfortunately",
  "sorry", "upset", "frustrat", "annoy",
];
const ANXIETY = [
  "worried", "worry", "nervous", "anxious", "afraid", "scared", "concern",
  "risk", "danger", "uncertain", "caution",
];
const SOCIAL = [
  "we ", "us ", "our ", "you ", "your ", "someone", "people", "friend",
  "team", "together", "everyone",
];
const ASSENT = ["yes", "agree", "sure", "absolutely", "definitely", "exactly", "right,"];
const ACHIEVEMENT = [
  "achieve", "accomplish", "complete", "finish", "succeed", "goal",
  "milestone", "deliver", "win", "progress",
];
const NEGATION = ["not ", "no ", "never", "none", "cannot", "can't", "won't", "don't", "isn't"];
const TENTATIVE = [
  "maybe", "perhaps", "might", "could", "possibly", "somewhat", "seem",
  "appear", "probably", "it's possible",
];
const INSIGHT = [
  "think", "know", "understand", "realize", "consider", "believe",
  "reason", "because", "therefore", "suggests",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function countHits(haystack: string, needles: string[]): number {
  return needles.reduce((n, needle) => n + (haystack.includes(needle) ? 1 : 0), 0);
}

function averageWordLength(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const totalLetters = words.reduce((n, w) => n + w.replace(/[^a-zA-Z]/g, "").length, 0);
  return totalLetters / words.length;
}

export function measureTraits(text: string): Partial<TraitValues> {
  const lower = text.toLowerCase();

  const posEmotion = countHits(lower, POSITIVE_EMOTION);
  const negEmotion = countHits(lower, NEGATIVE_EMOTION);
  const anxiety = countHits(lower, ANXIETY);
  const social = countHits(lower, SOCIAL);
  const assent = countHits(lower, ASSENT);
  const achievement = countHits(lower, ACHIEVEMENT);
  const negation = countHits(lower, NEGATION);
  const tentative = countHits(lower, TENTATIVE);
  const insight = countHits(lower, INSIGHT);
  const wordLen = averageWordLength(text);

  const measured: Partial<TraitValues> = {
    // Openness: tentative/insight (exploratory, reflective) language and longer average words (Pennebaker & King, 1999).
    openness: clamp(30 + tentative * 8 + insight * 6 + Math.max(0, wordLen - 4.2) * 12),
    // Conscientiousness: achievement/work-goal language, penalized by negation (Yarkoni, 2010).
    conscientiousness: clamp(40 + achievement * 11 - negation * 4),
    // Extraversion: social words and positive emotion, penalized by tentative language (Pennebaker & King, 1999).
    extraversion: clamp(35 + social * 8 + posEmotion * 6 - tentative * 5),
    // Agreeableness: positive emotion and assent, penalized by negative emotion (Pennebaker & King, 1999; Park et al., 2015).
    agreeableness: clamp(40 + posEmotion * 8 + assent * 9 - negEmotion * 9),
    // Neuroticism: negative emotion, anxiety, and negation language (Pennebaker & King, 1999; Yarkoni, 2010).
    neuroticism: clamp(30 + negEmotion * 10 + anxiety * 11 + negation * 4),
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

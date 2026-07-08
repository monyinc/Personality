export type TraitId =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export type TraitValues = Record<TraitId, number>;

export type ProviderId = "anthropic" | "openai" | "gemini" | "openrouter";

export interface Track {
  id: string;
  name: string;
  color: string;
  traits: TraitValues;
  manualOverride: boolean;
  manualPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export interface Scenario {
  id: string;
  label: string;
  prompt: string;
}

export interface Rating {
  vote: "up" | "down" | null;
  note: string;
}

export interface RunResult {
  trackId: string;
  trackName: string;
  trackColor: string;
  systemPrompt: string;
  traits: TraitValues;
  manualOverride: boolean;
  model: string;
  provider: ProviderId;
  status: "pending" | "done" | "error";
  text?: string;
  error?: string;
  latencyMs?: number;
  rating: Rating;
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
}

export type ProviderSettings = Record<ProviderId, ProviderConfig>;

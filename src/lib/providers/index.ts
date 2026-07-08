import type { ProviderId } from "../../types";
import { callAnthropic } from "./anthropic";
import { callOpenAI } from "./openai";
import { callGemini } from "./gemini";
import { callOpenRouter } from "./openrouter";
import type { ProviderCallArgs, ProviderMeta } from "./types";

export const PROVIDER_META: Record<ProviderId, ProviderMeta> = {
  anthropic: {
    label: "Anthropic",
    defaultModel: "claude-sonnet-5",
    modelHint: "e.g. claude-sonnet-5, claude-opus-4-8, claude-haiku-4-5-20251001",
    corsNote: "Supports direct browser calls via Anthropic's browser-access header.",
    keyPlaceholder: "sk-ant-…",
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-5",
    modelHint: "e.g. gpt-5, gpt-5-mini",
    corsNote:
      "OpenAI's API does not officially support direct browser calls — this may fail with a CORS error even with a valid key.",
    keyPlaceholder: "sk-…",
  },
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    modelHint: "e.g. gemini-2.5-flash, gemini-2.5-pro",
    corsNote: "Generally supports direct browser calls.",
    keyPlaceholder: "AIza…",
  },
  openrouter: {
    label: "OpenRouter",
    defaultModel: "openai/gpt-5",
    modelHint: "any OpenRouter model id, e.g. anthropic/claude-sonnet-5, meta-llama/llama-4",
    corsNote: "Built for browser apps — routes to almost any model with one key.",
    keyPlaceholder: "sk-or-…",
  },
};

const CALLERS: Record<ProviderId, (args: ProviderCallArgs) => Promise<string>> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  gemini: callGemini,
  openrouter: callOpenRouter,
};

export async function callProvider(
  provider: ProviderId,
  args: ProviderCallArgs,
): Promise<string> {
  if (!args.apiKey.trim()) {
    throw new Error(
      `No API key set for ${PROVIDER_META[provider].label}. Add one in Settings.`,
    );
  }
  return CALLERS[provider](args);
}

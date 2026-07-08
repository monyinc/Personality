import { readJsonError, safeFetch, type ProviderCallArgs } from "./types";

export async function callOpenRouter({
  apiKey,
  model,
  systemPrompt,
  userMessage,
}: ProviderCallArgs): Promise<string> {
  const res = await safeFetch(
    "OpenRouter",
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Personality Studio",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    },
  );

  if (!res.ok) throw new Error(`OpenRouter: ${await readJsonError(res)}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenRouter returned an empty response.");
  return text;
}

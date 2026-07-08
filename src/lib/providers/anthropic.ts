import { readJsonError, safeFetch, type ProviderCallArgs } from "./types";

export async function callAnthropic({
  apiKey,
  model,
  systemPrompt,
  userMessage,
}: ProviderCallArgs): Promise<string> {
  const res = await safeFetch("Anthropic", "https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic: ${await readJsonError(res)}`);
  const data = await res.json();
  const text = data?.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";
  if (!text) throw new Error("Anthropic returned an empty response.");
  return text;
}

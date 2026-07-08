import { readJsonError, safeFetch, type ProviderCallArgs } from "./types";

export async function callOpenAI({
  apiKey,
  model,
  systemPrompt,
  userMessage,
}: ProviderCallArgs): Promise<string> {
  const res = await safeFetch(
    "OpenAI",
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
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

  if (!res.ok) throw new Error(`OpenAI: ${await readJsonError(res)}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

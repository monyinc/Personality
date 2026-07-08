import { readJsonError, safeFetch, type ProviderCallArgs } from "./types";

export async function callGemini({
  apiKey,
  model,
  systemPrompt,
  userMessage,
}: ProviderCallArgs): Promise<string> {
  const res = await safeFetch(
    "Gemini",
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini: ${await readJsonError(res)}`);
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

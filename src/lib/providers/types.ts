export interface ProviderCallArgs {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
}

export interface ProviderMeta {
  label: string;
  defaultModel: string;
  modelHint: string;
  corsNote: string;
  keyPlaceholder: string;
}

/** Wraps fetch failures (network/CORS) into a message that actually tells the person what to do. */
export async function safeFetch(
  providerLabel: string,
  input: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    throw new Error(
      `${providerLabel} request failed before reaching the server — this is almost always the browser blocking a cross-origin request (CORS), not a bad key. ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

export async function readJsonError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const msg =
      body?.error?.message ?? body?.error ?? body?.message ?? JSON.stringify(body);
    return `${res.status} ${res.statusText}: ${msg}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

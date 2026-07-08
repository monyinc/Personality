# Personality Studio

A GarageBand-style studio for tuning an AI's system-prompt "personality" — mix
behavioral traits on faders, audition the result live against a real model,
and A/B multiple personalities side by side before shipping a system prompt
into a product.

Everything runs client-side. There is no backend: your API key is stored only
in this browser's local storage and requests go straight from your browser to
the provider you pick.

## Concepts

- **Track** — a saved personality: a name, 8 trait dial positions, and the
  system prompt they generate (or a hand-written override).
- **Mixer** — the fader bank for the active track. Each fader nudges one
  behavioral dimension (warmth, formality, verbosity, directness, structure,
  proactivity, playfulness, confidence) and the generated system prompt
  updates live below it. Flip "hand-edit override" to write the prompt
  yourself instead — the faders disengage, like disabling automation on a
  channel strip.
- **Playground** — run a scenario (or your own message) through the active
  track ("Single"), or through several tracks at once ("Multitrack A/B") to
  compare takes side by side.
- **Trait readout** — after a take, a small meter per trait shows the amber
  dialed position against a teal heuristic estimate of where the actual
  response landed (word count, hedging language, list structure, etc.). It's
  a rough proxy, not ground truth — use it to sanity-check that a fader move
  actually changed the output, not as a scientific measurement.

## Running locally

```bash
npm install
npm run dev
```

## Providers

Add your own key per provider in Settings (⚙). "Any model" is supported by
typing the model id for whichever provider you use:

| Provider | Direct browser calls |
| --- | --- |
| Anthropic | Supported (uses Anthropic's browser-access header) |
| Google Gemini | Generally supported |
| OpenRouter | Built for browser apps, routes to most models with one key |
| OpenAI | Not officially supported — may fail with a CORS error even with a valid key |

If a provider's request fails immediately with no server-side error detail,
that's almost always CORS, not a bad key.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set Source to **GitHub Actions**.
3. `vite.config.ts` sets `base: '/Personality/'` for project-page routing
   (`https://<user>.github.io/Personality/`). **If your GitHub repo name is
   not `Personality`, update `base` to match it** (or to `'/'` if this is a
   user/org root page, e.g. `<user>.github.io`).
4. Push to `main` — `.github/workflows/deploy.yml` builds and publishes
   `dist/` automatically.

## Notes

- The 8 trait dials are a starting vocabulary, not a fixed taxonomy — the
  fragments each dial writes into the prompt live in `src/lib/traits.ts` and
  are easy to extend or rephrase.
- Heuristic scoring (`src/lib/scoring.ts`) is keyword/structure based and
  intentionally simple so it stays instant and explainable. Treat it as a
  directional signal alongside your own reading of the output, not a
  replacement for it.

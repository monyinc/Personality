# Personality

A Windows 98-styled volume mixer for an AI's system-prompt personality: five
dials taken from the Big Five personality model, a live-generated system
prompt, and a playground to audition and A/B test the result against a real
model before shipping it into a product.

Everything runs client-side. There is no backend: your API key is stored only
in this browser's local storage and requests go straight from your browser to
the provider you pick.

## Method

The five dials are the Big Five / Five-Factor Model (Costa & McCrae,
NEO-PI-R, 1992), the most replicated taxonomy in personality-trait
psychology: Openness, Conscientiousness, Extraversion, Agreeableness, and
Neuroticism. Each dial's behavioral instructions are written from two of
that trait's real NEO-PI-R facets rather than invented adjectives (see
`src/lib/traits.ts` for the exact facets and instruction text).

After a take, the trait readout estimates where the response actually
landed using a small LIWC-style word-category count (`src/lib/scoring.ts`).
The direction each category is combined in follows published
language-personality findings, not guesswork:

- Pennebaker & King (1999), "Linguistic styles: Language use as an
  individual difference marker"
- Yarkoni (2010), "Personality in 100,000 words"
- Park et al. (2015), "Automatic Personality Assessment Through Social
  Media Language"

This readout is a heuristic estimate, not a validated psychometric score.
Use it to sanity-check that a dial move actually changed the output, not as
ground truth. The in-app Help menu has an About dialog with the same
summary.

## Concepts

- **Track**: a saved personality, a name, five Big Five dial positions, and
  the system prompt they generate (or a hand-written override).
- **Mixer**: the dial bank for the active track, styled after the classic
  Windows volume-control applet. Each dial nudges one Big Five dimension and
  the generated system prompt updates live below it. Check "Edit as text" to
  write the prompt yourself instead; the dials disengage while you do.
- **Playground**: run a scenario (or your own message) through the active
  track ("Single"), or through several tracks at once ("Multitrack A/B") to
  compare takes side by side.

## Running locally

```bash
npm install
npm run dev
```

## Providers

Add your own key per provider in Provider keys (File menu, or the button in
the Playground). "Any model" is supported by typing the model id for
whichever provider you use:

| Provider | Direct browser calls |
| --- | --- |
| Anthropic | Supported (uses Anthropic's browser-access header) |
| Google Gemini | Generally supported |
| OpenRouter | Built for browser apps, routes to most models with one key |
| OpenAI | Not officially supported, may fail with a CORS error even with a valid key |

If a provider's request fails immediately with no server-side error detail,
that's almost always CORS, not a bad key.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In Settings, then Pages, set Source to GitHub Actions.
3. `vite.config.ts` sets `base: '/Personality/'` for project-page routing
   (`https://<user>.github.io/Personality/`). If your GitHub repo name is not
   `Personality`, update `base` to match it (or to `'/'` if this is a
   user/org root page, e.g. `<user>.github.io`).
4. Push to `main`. `.github/workflows/deploy.yml` builds and publishes
   `dist/` automatically.

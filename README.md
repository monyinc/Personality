#Personality

A Windows 98-styled mixer for tuning an AI's system-prompt personality. Five
dials, taken from the Big Five (Five-Factor Model), generate a system prompt
live; a Notepad-style panel beside them shows the exact prompt in effect; and
a playground lets you audition it, or A/B up to four tracks at once, against
a real model. Runs entirely client-side, no backend: bring your own API key.

## What's in it

- **Tracks** — saved personalities (name + five dial positions), listed in
  the sidebar. Duplicate, rename, or delete them.
- **Mixer** — the five Big Five dials (Openness, Conscientiousness,
  Extraversion, Agreeableness, Neuroticism), each grounded in real NEO-PI-R
  facets rather than invented adjectives.
- **Notepad** — the generated system prompt, live. Check "Edit as text" to
  hand-write it instead; the dials disengage while you do.
- **Playground** — run a scenario or your own message through one track, or
  compare several side by side, then rate each take and view a Big Five
  radar chart plus a word-level affect breakdown for it.

See the in-app Help > About Personality for the psychology and language
research behind the dials and the trait readout.

## Running locally

```bash
npm install
npm run dev
```

## Deploying

Pushing to `main` builds and publishes to GitHub Pages automatically via
`.github/workflows/deploy.yml`. If you fork this under a different repo
name, update `base` in `vite.config.ts` to match.

# Obscura — how obscure can you get?

A daily game about the obscure. Seven shared prompts a day ("Name a cheese"), 30 seconds each. Type any answer that fits: the rarer it is, the more points it earns, and your points lift you on an ascent: a microbe on the sea floor, then a jellyfish, fish, dolphin, a human walking down a street, a bird (200 pts), a helicopter (300), a plane, a rocket, a satellite, an astronaut and, for a perfect 700, the whole solar system. The whole screen is one continuous low-poly world (Three.js, faceted flat-shaded shapes, muted colours, one strong key light): the sea floor, the surface, a seaside town, the sky and space are all the same place. Each form lives at its own fixed height and never floats above where it belongs; the camera only travels up when a new form takes over. There is also an **Endless** mode in early access: two fixed practice dives that never touch your streak or stats, with a visible "in development" block (see `ENDLESS_DIVES` in `src/lib/daily.ts`).

## Run it

```bash
npm install
npm run dev          # Next.js dev server (admin tools ON in dev)
npm run build        # production build (static export, admin tools stripped)
npm test             # engine unit tests
```

Environments where `next` can't be installed can use the equivalent esbuild + Tailwind build of the same components:

```bash
npm run build:static          # production bundle -> dist/
npm run build:static:admin    # with admin tools -> set OBSCURA_OUT=dist-admin
npm run serve:static
npm run test:e2e              # Playwright suite (needs both builds, see tests/e2e.ts)
```

## Architecture

| Path | Purpose |
|---|---|
| `src/data/prompts/*` | The answer library. Each prompt lists every accepted answer as `Name\|rarity\|alias;alias` |
| `src/data/stages.ts` | The ascent: each form, its points threshold, place and altitude |
| `src/toy/*` | The 3D world (Three.js): `world.ts` is the engine (camera, lighting, climbing, hero swaps), `heroes-*.ts` the 12 forms, `biomes.ts` the scenery (sea floor, water, town, sky, space), `layout.ts` where each stage sits in the world, `kit.ts` shared materials and shapes |
| `src/lib/scoring.ts` | Rarity tiers → points, round timer, points → stage |
| `src/lib/match.ts` | Forgiving answer matching: case, accents, plurals, small typos, "did you mean" |
| `src/lib/daily.ts` | Date → seven prompts (pure function; each day mixes topics, weighted to general knowledge, dealt from seeded per-topic shuffles) |
| `src/lib/game.ts` | Pure rules: rounds, timer, finishing a day, streaks, stats |
| `src/lib/storage.ts` | `PlayerRepository` interface + localStorage implementation (swap for an API later) |
| `src/components/*` | UI. `WorldCanvas` is the full-screen 3D canvas behind every screen (loaded lazily); Home, Game and Result are overlays on it, with the answer box docked at the bottom. `AscentOverlay` is the card shown after a climb. `Emblem` is the logo (colour waves through an aperture) and `Wordmark` the name: its ink follows the scenery behind it (`ambienceAt` in `layout.ts` feeds the `--amb` CSS variable on the stage) |
| `app/` | Next.js App Router entry (`layout.tsx`, `page.tsx`, `globals.css`) |

### How scoring works
Every answer has a rarity from 1 (everyone says it) to 100 (almost nobody does). Tiers (each has a colour, shown as a small dot): Everyday 10 pts (grey), Familiar 20 (green), Uncommon 35 (yellow), Rare 55 (blue), Mythic 80 (purple), Obscure 100 (orange; at most two answers per prompt). The share text uses the matching coloured squares. Seven Obscure answers (700) is the ceiling. The first recognised answer ends a round (the results screen then shows the best possible answers for every prompt); an unrecognised answer is free (the clock just keeps running); running out of time or skipping scores 0.

### Adding prompts
Add a `PromptSeed` to a file in `src/data/prompts/` (or create a new file and list it in `index.ts`). Give it plenty of answers (40+), from everyday to obscure (score 92+ is the 100-point Obscure tier: give each prompt one or two of those, no more), with aliases for alternative spellings. `npx tsx tests/validate-prompts.ts src/data/prompts/<file>.ts` checks for duplicate spellings, score range, that every answer matches itself, and that each prompt has both easy and obscure answers.

Answers players type that the game doesn't recognise are logged locally (`obscura:v1:unrecognised`, visible in the admin Test tab) so the lists can be grown from real play.

### Admin / dev mode
Compiled in only for `next dev` or `NEXT_PUBLIC_OBSCURA_ADMIN=1`. Open with the gear button or **Ctrl/Cmd+Shift+A**: pick any date, swap which prompt appears in each of the day's seven rounds, test any answer against any prompt, instantly play a day, reset a day or all progress. A production build contains none of this code.

### Going to a backend later
- `PlayerRepository` → accounts, sync, leaderboards
- `getPrompts()` in `src/lib/prompts.ts` → fetch prompts from a database
- Real rarity: replace the editorial scores with measured data (how often other players submit each answer, as in leaderboards) once there is a backend
- NOTE: v1 ships the answer lists inside the client bundle. Before launching competitively, check answers server-side.

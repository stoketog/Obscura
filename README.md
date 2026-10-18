# Obscura — how obscure can you get?

A daily guessing game. One shared puzzle per day, 5–8 clues, 8 guesses. The rarer the answer you find, the more your creature grows: Microbe → … → Whale → Mythic Form.

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
| `src/data/lexicon/*` | Every guessable thing (`Entity`): domain, group, family, setting, traits, scale + obscurity factors |
| `src/data/puzzles.ts` | The puzzle dataset: answer, clues, accepted answers, category, tags, difficulty, explanation, source |
| `src/data/stages.ts` | The evolution ladder (swap this + `Creature.tsx` to re-theme) |
| `src/lib/obscurity.ts` | Obscurity model (familiarity, Wikipedia prominence, specificity, nicheness, common-word penalty) |
| `src/lib/growth.ts` | Non-linear reward curve, guess efficiency, stage resistance |
| `src/lib/similarity.ts` | Guess scoring: category / habitat / traits / size / family → warmth + feedback rows |
| `src/lib/puzzles.ts` | Date → puzzle (pure function; pinned dates; seeded reshuffle after each full cycle) |
| `src/lib/game.ts` | Pure rules: clue unlock, guess application, streaks, stats |
| `src/lib/storage.ts` | `PlayerRepository` interface + localStorage implementation (swap for an API later) |
| `src/components/*` | UI. `Creature.tsx` holds the 14 SVG creatures |
| `app/` | Next.js App Router entry (`layout.tsx`, `page.tsx`, `globals.css`) |

### Adding puzzles
Add an `Entity` to the lexicon (so it is guessable and scoreable), then a row in `puzzles.ts`. Obscurity and growth reward are computed from the entity's factors unless overridden. `npm test` checks clue count, source, that no clue contains the answer, and that the answer is "obscure but discoverable" (obscurity ≥ 45 and ≥ 4 independent sources).

### Admin / dev mode
Compiled in only for `next dev` or `NEXT_PUBLIC_OBSCURA_ADMIN=1`. Open with the gear button or **Ctrl/Cmd+Shift+A**: pick any date, preview/edit answer, clues and obscurity, test guesses against the answer, set growth, reset a day or all progress. A production build contains none of this code.

### Going to a backend later
- `PlayerRepository` → accounts, sync, leaderboards
- `getPuzzleSource()` in `src/lib/puzzles.ts` → fetch puzzles from a database
- `ObscurityFactors` already has the shape a pipeline (Wikipedia pageviews, search volume) would fill in
- NOTE: v1 ships the answers inside the client bundle. Before launching competitively, serve clues from an API and verify guesses server-side.

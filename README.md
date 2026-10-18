# Obscura — how obscure can you get?

A daily game about the obscure. Seven shared prompts a day ("Name a cheese"), 30 seconds each. Type any answer that fits: the rarer it is, the more points it earns, and your points evolve a creature from a Microbe to the Mythic Form.

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
| `src/data/stages.ts` | The evolution ladder and the points needed for each form (swap this + `Creature.tsx` to re-theme) |
| `src/lib/scoring.ts` | Rarity tiers → points, round timer, points → evolution stage |
| `src/lib/match.ts` | Forgiving answer matching: case, accents, plurals, small typos, "did you mean" |
| `src/lib/daily.ts` | Date → seven prompts (pure function; seeded reshuffle after each full pass of the library) |
| `src/lib/game.ts` | Pure rules: rounds, timer, penalties, finishing a day, streaks, stats |
| `src/lib/storage.ts` | `PlayerRepository` interface + localStorage implementation (swap for an API later) |
| `src/components/*` | UI. `Creature.tsx` holds the 14 SVG creatures |
| `app/` | Next.js App Router entry (`layout.tsx`, `page.tsx`, `globals.css`) |

### How scoring works
Every answer has a rarity from 1 (everyone says it) to 100 (almost nobody does). Tiers: Everyday 10 pts, Familiar 20, Uncommon 35, Rare 55, Obscure 80, Mythic 100. Seven mythic answers (700) is the ceiling. The first recognised answer ends a round; an unrecognised answer costs 2 seconds; running out of time or skipping scores 0.

### Adding prompts
Add a `PromptSeed` to a file in `src/data/prompts/` (or create a new file and list it in `index.ts`). Give it plenty of answers (40+), from everyday to obscure, with aliases for alternative spellings. `npm test` checks for duplicate spellings, score range, that every answer matches itself, and that each prompt has both easy and obscure answers.

Answers players type that the game doesn't recognise are logged locally (`obscura:v1:unrecognised`, visible in the admin Test tab) so the lists can be grown from real play.

### Admin / dev mode
Compiled in only for `next dev` or `NEXT_PUBLIC_OBSCURA_ADMIN=1`. Open with the gear button or **Ctrl/Cmd+Shift+A**: pick any date, swap which prompt appears in each of the day's seven rounds, test any answer against any prompt, instantly play a day, reset a day or all progress. A production build contains none of this code.

### Going to a backend later
- `PlayerRepository` → accounts, sync, leaderboards
- `getPrompts()` in `src/lib/prompts.ts` → fetch prompts from a database
- Real rarity: replace the editorial scores with measured data (how often other players submit each answer, as in leaderboards) once there is a backend
- NOTE: v1 ships the answer lists inside the client bundle. Before launching competitively, check answers server-side.

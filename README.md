# Obscura — one photograph, seven prompts, one guess

A daily game about the obscure. Every day a real photograph hangs in a dark room (the *camera obscura*). Seven shared prompts ("Name a cheese"), 30 seconds each: type any answer that fits, and the rarer it is, the more points it earns and the more light gets into the room. The photograph develops from a warm black blur to sharp as your points rise (700 points develops it fully). After the seventh prompt you get **one** guess at what the photograph shows; a right guess earns a bonus that is bigger the less you could see (100 at 0%, about 80 at 25%, 55 at 54%, 30 at 80%, never below 10). Then the photograph is revealed with its credit, and every accepted answer for every prompt is listed, cascaded by rarity.

There is also an **Endless** mode in early access: two fixed practice dives, each with its own photograph, that never touch your streak or stats, with a visible "in development" block (see `ENDLESS_DIVES` in `src/lib/daily.ts`).

Sister game: **Engineerle**, five daily engineering puzzles, now its own site (`github.com/stoketog/engineerle`, engineerle.io). The side menu links to it and carries the player's settings across (`?s=` in the address, read once and removed); old `/#engineerle` links are forwarded.

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
| `src/data/images.ts` | The photograph library: the answer, accepted names, a one-line story, joined with `image-credits.json` (licence, author, source) |
| `public/daily/*` | The photographs themselves, with hashed file names so the answer is not in the network log |
| `scripts/images/` | `fetch_images.py` downloads the picks in `picks.json` from Wikimedia Commons and refuses anything not safe for a commercial site |
| `src/lib/scoring.ts` | Rarity tiers → points, round timer, points → % developed, % developed → guess bonus |
| `src/lib/picture.ts` | How the photograph looks at each stage of development, and forgiving matching for the final guess |
| `src/lib/shareCard.ts` | The 1080×1350 share image, with the photograph blurred far past recognition |
| `src/lib/match.ts` | Forgiving answer matching: case, accents, plurals, small typos, "did you mean" |
| `src/lib/daily.ts` | Date → seven prompts (pure function; each day mixes topics, weighted to general knowledge, dealt from seeded per-topic shuffles) |
| `src/lib/game.ts` | Pure rules: rounds, timer, finishing a day, streaks, stats |
| `src/lib/storage.ts` | `PlayerRepository` interface + localStorage implementation (swap for an API later) |
| `src/components/*` | UI. `Chamber` is the photograph on the back wall at any stage of development; Home, Game (prompts) and Result (the guess, then the reveal and every answer) are the screens. `Emblem` is the logo (bands of light through an aperture) and `Wordmark` the name |
| `app/` | Next.js App Router entry (`layout.tsx`, `page.tsx`, `globals.css`) |

### How scoring works
Every answer has a rarity from 1 (everyone says it) to 100 (almost nobody does). Five tiers, coloured from dim to bright like light coming into the room: Everyday 10 pts (score under 18; **at most eight per prompt**), Uncommon 30 (18+), Rare 55 (38+), Mythic 80 (62+), Obscure 100 (92+; one or two per prompt). Seven Obscure answers (700) is the ceiling and develops the photograph fully. The first recognised answer ends a round; an unrecognised answer is free (the clock just keeps running); running out of time or skipping scores 0. The day's total is the prompt points plus the guess bonus.

`scripts/rebalance.ts` is the rule that keeps the library generous: only the eight most common answers of a prompt stay Everyday (the rest move to Uncommon), and every other answer is lifted to at least the tier its rank earns (lower 30% Uncommon, middle 35% Rare, top 35% Mythic). It never moves an answer down and never touches the Obscure tier. Run it again after adding prompts.

### The photographs
Only images that are safe to use on a commercial site with no conditions: CC0, or public domain for a reason that holds worldwide (author dead long enough, a US federal government work such as NASA, or released by the author). `scripts/images/fetch_images.py` reads each file's Commons record and refuses anything else, including US-only public domain, CC BY/BY-SA, ESA/ESO material and trademark or insignia warnings. Every reveal still credits the author and links to the source. To add photographs: add an entry to `src/data/images.ts`, add its Commons file to `scripts/images/picks.json`, run `python3 scripts/images/fetch_images.py`, look at the result, then `npm test`. The library is dealt in shuffled passes, so no photograph repeats until all have been used: add at least one a day to keep ahead.

### Where the answers come from

Beyond the hand-written core in `src/data/prompts/`, extra answers are plain lists in `scripts/answers/lists/<prompt-id>.<source>.txt`, scored for rarity and merged by `scripts/answers/build.py` (see its header; run `scripts/answers/dump-core.ts` first). Sources:

- `*.hand.txt`: written by hand.
- `*.data.txt`: open datasets via `scripts/answers/fetch_sources.py` (dariusk/corpora, CC0; GeoNames; PokeAPI).
- `*.corpora.txt`: dariusk/corpora (CC0) via `scripts/answers/from_corpora.py`: the Wikipedia lists of colours, cheeses and programming languages, IBA cocktails, herbs and spices, gods and monsters.
- `*.openfootball.txt`: football clubs from openfootball/clubs (CC0) via `scripts/answers/from_openfootball.py`.
- `*.wordnet.txt`: Princeton WordNet 3.0 via `scripts/answers/from_wordnet.py`, which takes every kind of thing (or named person or place) WordNet files under a category and filters out group labels, Latin names, vulgar words and off-topic senses.

WordNet licence notice: *WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANT- ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS. The name of Princeton University or Princeton may not be used in advertising or publicity pertaining to distribution of the software and/or database.* (Full licence: https://wordnet.princeton.edu/license-and-commercial-use; commercial use is permitted.)

### Adding prompts
Add a `PromptSeed` to a file in `src/data/prompts/` (or create a new file and list it in `index.ts`). Give it plenty of answers (40+), from everyday to obscure (no more than eight under 18; score 92+ is the 100-point Obscure tier: give each prompt one or two of those, no more), with aliases for alternative spellings. `npx tsx tests/validate-prompts.ts src/data/prompts/<file>.ts` checks for duplicate spellings, score range, that every answer matches itself, and that each prompt has both easy and obscure answers.

Answers players type that the game doesn't recognise are logged locally (`obscura:v1:unrecognised`, visible in the admin Test tab) so the lists can be grown from real play.

### Engineerle
Lives in its own repository and domain. Obscura only links to it (`src/lib/sites.ts`; set `NEXT_PUBLIC_ENGINEERLE_URL` at build time to change the target) and forwards old `/#engineerle` addresses. Settings travel in the link: `encodeSettings` / `adoptHandoff` in `src/lib/settings.ts`.

### Admin / dev mode
Compiled in only for `next dev` or `NEXT_PUBLIC_OBSCURA_ADMIN=1`. Open with the gear button or **Ctrl/Cmd+Shift+A**: pick any date, swap which prompt appears in each of the day's seven rounds, test any answer against any prompt, preview every photograph at any stage of development and test guesses against it, undo a guess, instantly play a day, reset a day or all progress. A production build contains none of this code.

### Going to a backend later
- `PlayerRepository` → accounts, sync, leaderboards
- `getPrompts()` in `src/lib/prompts.ts` → fetch prompts from a database
- Real rarity: replace the editorial scores with measured data (how often other players submit each answer, as in leaderboards) once there is a backend
- NOTE: v1 ships the answer lists inside the client bundle. Before launching competitively, check answers server-side.

# Obscura — one photograph, seven prompts, one guess

A daily game about the obscure. Every day a real photograph hangs in a dark room (the *camera obscura*). Seven shared prompts ("Name a cheese"), 30 seconds each: type any answer that fits, and the rarer it is, the more points it earns and the more light gets into the room. The photograph starts as a heavy blur (colours and rough shapes only) and sharpens as your points rise (700 points develops it fully). The photograph can be guessed at any time (`canGuess` in `src/lib/game.ts`): tap it, or guess after the last prompt. A right guess is worth 100, less 10% of that (10 points) for every wrong guess before it; after ten wrong guesses it is worth nothing and the guess closes (`guessWorth` in `src/lib/scoring.ts`). The picture is shown 10% further developed than the points say, so it is never fully dark (`REVEAL_HEAD_START` in `src/lib/picture.ts`; 100% is still fully sharp). Then the photograph is revealed with its credit, and every accepted answer for every prompt is listed, cascaded by rarity.

Coming back:
- **Archive**: every past day can be played (or its result looked at again). Archive days never move the streak, history or stats.
- **Streak freezes**: one is earned for every seven daily puzzles finished (hold up to two). Each covers one missed day, spent when the player comes back and finishes a day (`streakPlan` in `src/lib/game.ts`).
- **Darkroom**: every photograph the player has developed and seen revealed, plus **badges** (`src/lib/badges.ts`, worked out from the saved games).
- **Stats**: a distribution of how developed each day's photograph got, Wordle-style.
- **Daily reminder**: Settings downloads a repeating calendar event (.ics), so it works on every phone with no server. The site is an installable app (`public/manifest.webmanifest`, `public/sw.js`); the service worker already handles push notifications, ready for when a server can send them.

- **Friend challenges**: "Challenge a friend" on the results packs the day into a link (`?c=…`, `src/lib/challenge.ts`; no server). The friend sees it on their home screen, plays that day (archive if it has passed), and gets a side-by-side comparison.

**Endless** mode (two practice dives) is still in the code but hidden from the home screen (`SHOW_ENDLESS` in `HomeScreen.tsx`).

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
| `src/data/library.json`, `public/answers/*` | The library as the browser gets it: a small bundled index, and one answer file per prompt fetched only when played. Written by `scripts/answers/split.ts` (run by `scripts/check.sh`); `src/lib/library.ts` loads them |
| `src/data/images.ts` | The photograph library: the answer, accepted names, a one-line story, joined with `image-credits.json` (licence, author, source) |
| `public/daily/*` | The photographs themselves, with hashed file names so the answer is not in the network log |
| `scripts/images/` | `fetch_images.py` downloads the picks in `picks.json` from Wikimedia Commons and refuses anything not safe for a commercial site |
| `src/lib/scoring.ts` | Rarity tiers → points, round timer, points → % developed, wrong guesses → guess worth |
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
- `*.f1db.txt`: every Formula 1 race starter from F1DB (github.com/f1db/f1db, **CC BY 4.0**, credited in the game's help screen) via `scripts/answers/from_f1db.py`.
- `*.wordnet.txt`: Princeton WordNet 3.0 via `scripts/answers/from_wordnet.py`, which takes every kind of thing (or named person or place) WordNet files under a category and filters out group labels, Latin names, vulgar words and off-topic senses.

WordNet licence notice: *WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANT- ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS. The name of Princeton University or Princeton may not be used in advertising or publicity pertaining to distribution of the software and/or database.* (Full licence: https://wordnet.princeton.edu/license-and-commercial-use; commercial use is permitted.)

### Published days never change
`src/data/schedule.json` pins every day already published: its seven prompt ids and its photograph. Run `scripts/lock-schedule.ts --through <a date a day or two ahead>` BEFORE adding prompts or photographs, so the new library only changes days no one has seen. Days after the lock are dealt from the whole library, new photographs first, and never repeat a prompt from the three days before.

### Puzzle prompts and closed lists
- `src/data/prompts/puzzles.ts` is generated by `scripts/answers/puzzles.ts`: Krillion-style rules over the base lists ("a country with exactly seven letters", "an animal with a Z or an X"), with rarity re-ranked inside each prompt. Add a rule there and rerun it.
- `src/data/prompts/more.ts` holds hand-made closed lists (European Cup finalists, Premier League clubs, FA Cup winners, Olympic host cities, NATO members, African countries, US state capitals, ancient civilisations). Keep them complete: update them when a new club or host joins.

### Lists from Wikipedia
`src/data/prompts/wikilists.ts` is generated by `scripts/answers/wikilists.py` from Wikipedia's own lists (text available under CC BY-SA; the game uses the names as answers): films that have won an Oscar, men's Ballon d'Or winners, F1 world champions, London Underground stations, Eurovision winners, Grammy Best New Artist nominees, Booker Prize winners and Nobel Peace Prize laureates. Fame order comes from the tables (Oscars and nominations, titles, passenger numbers, how recent) with a few famous answers pinned first. Rerun it (without `--cached`) to pick up new winners. The closed lists in `more.ts` were checked against Wikipedia on 22 October 2026.

### Adding prompts
Add a `PromptSeed` to a file in `src/data/prompts/` (or create a new file and list it in `index.ts`). Give it plenty of answers (40+), from everyday to obscure (no more than eight under 18; score 92+ is the 100-point Obscure tier: give each prompt one or two of those, no more), with aliases for alternative spellings. `npx tsx tests/validate-prompts.ts src/data/prompts/<file>.ts` checks for duplicate spellings, score range, that every answer matches itself, and that each prompt has both easy and obscure answers.

A prompt can also carry `rejects: ['Iceland']`: wrong answers players are likely to type that the typo allowance would otherwise take for a real one (Iceland for Ireland). They always miss. Never list a spelling that is also an accepted answer (the engine tests check this); see `rejecting` in `src/data/prompts/days/2026-10-29.ts`.

Answers players type that the game doesn't recognise are logged locally (`obscura:v1:unrecognised`, visible in the admin Test tab) so the lists can be grown from real play.

### Engineerle
Lives in its own repository and domain. Obscura only links to it (`src/lib/sites.ts`; set `NEXT_PUBLIC_ENGINEERLE_URL` at build time to change the target) and forwards old `/#engineerle` addresses. Settings travel in the link: `encodeSettings` / `adoptHandoff` in `src/lib/settings.ts`.

### Admin / dev mode
Compiled in only for `next dev` or `NEXT_PUBLIC_OBSCURA_ADMIN=1`. Open with the gear button or **Ctrl/Cmd+Shift+A**: pick any date, swap which prompt appears in each of the day's seven rounds, test any answer against any prompt, preview every photograph at any stage of development and test guesses against it, undo a guess, instantly play a day, reset a day or all progress. A production build contains none of this code.

### The database (Supabase project `obscura`, London)
Optional by design: every call times out quickly and fails silently, so the game plays the same offline.
- **Stats** (`src/lib/online.ts`, plain fetch, no library): `record_answer`, `answer_stats`, `record_result`, `log_event` are database functions in `public` that validate input (dates within two days of today, short strings, a fixed list of event names) and write to tables in a `private` schema the Data API never exposes. They return only totals, never another player's rows. The advisor warnings about anonymous callers on these four functions are expected: they are the game's public API.
- **Accounts**: Google sign-in through Supabase Auth (supabase-js, loaded only when signing in or already signed in). `public.profiles` holds each player's saved game; row-level security lets a player read and write only their own row. Signing in merges this device's game with the account's (`src/lib/merge.ts`).
- Players are counted by a random id per device (`obscura:v1:player`), or their account id once signed in.
- Useful queries (SQL editor): players per day `select play_date, count(distinct player_key) from private.events where name = 'visit' group by 1 order by 1 desc;` · finishes `... where name = 'day_finished' ...` · shares `... where name in ('share_text','share_card','challenge_sent') ...`.

### Going to a backend later
- `PlayerRepository` → accounts, sync, leaderboards
- `getPrompts()` in `src/lib/prompts.ts` → fetch prompts from a database
- Real rarity: replace the editorial scores with measured data (how often other players submit each answer, as in leaderboards) once there is a backend
- NOTE: answer files are public (fetched per prompt). Before launching competitively, check answers server-side.
- Saved games record their photograph (`imageId`), so past days keep their picture as the library grows. Adding photographs or prompts still changes the deal for *future and unplayed* days.

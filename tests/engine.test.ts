import assert from 'node:assert/strict';
import { PROMPT_SEEDS } from '@/data/prompts';
import { IMAGES, IMAGE_EDITORIAL } from '@/data/images';
import CREDITS from '@/data/image-credits.json';
import SCHEDULE from '@/data/schedule.json';
import { existsSync, readFileSync } from 'node:fs';
import { getPrompts, parseAnswer, rarestEntry } from '@/lib/prompts';
import { matchAnswer } from '@/lib/match';
import { normalize } from '@/lib/text';
import { TIERS, MAX_POINTS, ROUND_MS, ROUNDS_PER_DAY, pointsFor, tierFor, tierById, developedFor, guessBonusFor } from '@/lib/scoring';
import { matchGuess } from '@/lib/picture';
import { getDaily, pickPrompts, imageForDay, asPlayed, archiveDates } from '@/lib/daily';
import { PROMPT_INDEX } from '@/lib/library';
import { earnedBadges, unseenBadges } from '@/lib/badges';
import { reminderIcs } from '@/lib/reminder';
import { mergeProfiles } from '@/lib/merge';
import { addDays, puzzleNumberFor, EPOCH } from '@/lib/dates';
import { developedBucket, streakOnIce, currentRoundIndex, dayTotal, deriveStats, effectiveStreak, expireRound, freshGame, getGame, remainingMs, skipRound, startRound, submitAnswer, submitGuess } from '@/lib/game';
import { emptyProfile } from '@/lib/storage';
import { buildShareText } from '@/lib/share';
import type { DailySet, PlayerProfile, Prompt } from '@/lib/types';

let passed = 0;
const test = (name: string, fn: () => void) => {
  try { fn(); passed++; console.log('  ✓', name); } catch (e) { console.error('  ✗', name, '\n   ', (e as Error).message); process.exitCode = 1; }
};

const prompts = getPrompts();
const byId = (id: string): Prompt => prompts.find((p) => p.id === id)!;

console.log('Data integrity');
test('prompt ids are unique and there are enough for several days', () => {
  assert.equal(new Set(PROMPT_SEEDS.map((p) => p.id)).size, PROMPT_SEEDS.length);
  assert.ok(prompts.length >= ROUNDS_PER_DAY * 4, `only ${prompts.length} prompts`);
});
test('every prompt has plenty of answers with valid scores', () => {
  for (const p of prompts) {
    assert.ok(p.entries.length >= 30, `${p.id} has only ${p.entries.length} answers`);
    for (const e of p.entries) assert.ok(e.score >= 1 && e.score <= 100, `${p.id}/${e.name} score ${e.score}`);
  }
});
test('at most two answers per prompt are worth the top 100 points (and at least one)', () => {
  for (const p of prompts) {
    const n = p.entries.filter((e) => pointsFor(e.score) === 100).length;
    assert.ok(n >= 1 && n <= 2, `${p.id} has ${n} top-tier answers`);
  }
});
test('every prompt spans easy to hard (a common answer and an obscure one)', () => {
  for (const p of prompts) {
    const scores = p.entries.map((e) => e.score);
    assert.ok(Math.min(...scores) <= 10, `${p.id} has no everyday answer`);
    assert.ok(Math.max(...scores) >= 85, `${p.id} has no obscure answer (max ${Math.max(...scores)})`);
    assert.ok(scores.filter((s) => s < 20).length >= 3, `${p.id} needs more everyday answers`);
  }
});
test('no two answers in a prompt share a spelling', () => {
  for (const p of prompts) {
    const seen = new Map<string, string>();
    for (const e of p.entries) {
      for (const s of [e.name, ...e.aliases]) {
        const n = normalize(s);
        const prior = seen.get(n);
        assert.ok(!prior || prior === e.name, `${p.id}: "${s}" is used by both "${prior}" and "${e.name}"`);
        seen.set(n, e.name);
      }
    }
  }
});
test('answers are not already wrongly resolved to another entry (each name finds itself)', () => {
  for (const p of prompts) for (const e of p.entries) {
    const m = matchAnswer(p, e.name);
    assert.ok(m.kind === 'hit' && m.entry === e, `${p.id}: "${e.name}" resolved to ${m.kind === 'hit' ? m.entry.name : m.kind}`);
  }
});
test('prompt text is a clear instruction', () => prompts.forEach((p) => assert.ok(/^Name /.test(p.text), p.id)));
test('parseAnswer parses aliases and rejects junk', () => {
  assert.deepEqual(parseAnswer('Brie|6'), { name: 'Brie', score: 6, aliases: [] });
  assert.deepEqual(parseAnswer('Parmesan|5|a;b'), { name: 'Parmesan', score: 5, aliases: ['a', 'b'] });
  assert.throws(() => parseAnswer('NoScore'));
});
test('no prompt has more than eight everyday answers', () => {
  for (const p of prompts) {
    const n = p.entries.filter((e) => tierFor(e.score).id === 'everyday').length;
    assert.ok(n <= 8, `${p.id} has ${n} everyday answers`);
  }
});
test('most answers are uncommon or rarer', () => {
  const all = prompts.flatMap((p) => p.entries);
  const everyday = all.filter((e) => tierFor(e.score).id === 'everyday').length;
  assert.ok(everyday / all.length < 0.1, `${everyday} of ${all.length} are everyday`);
});

console.log('Scoring');
test('tiers map scores to points steeply', () => {
  assert.equal(tierFor(1).id, 'everyday');
  assert.equal(tierFor(17).id, 'everyday');
  assert.equal(tierFor(18).id, 'uncommon');
  assert.equal(tierFor(37).id, 'uncommon');
  assert.equal(tierFor(38).id, 'rare');
  assert.equal(tierFor(61).id, 'rare');
  assert.equal(tierFor(62).id, 'obscure');
  assert.equal(tierFor(91).id, 'obscure');
  assert.equal(tierFor(92).id, 'mythic');
  assert.equal(TIERS.length, 5, 'Familiar is gone');
  assert.equal(tierById('familiar' as never).id, 'uncommon', 'old saved games still resolve');
  // players see the top (100 pt) tier as "Obscure" and the one below it (80 pt) as "Mythic"
  assert.equal(tierFor(95).label, 'Obscure');
  assert.equal(tierFor(80).label, 'Mythic');
  assert.equal(pointsFor(3), 10);
  assert.equal(pointsFor(99), 100);
  assert.equal(MAX_POINTS, 700);
  for (let i = 1; i < TIERS.length; i++) assert.ok(TIERS[i].points > TIERS[i - 1].points);
});
test('the photograph develops in step with the points, and the guess bonus shrinks as it does', () => {
  assert.equal(developedFor(0), 0);
  assert.equal(developedFor(MAX_POINTS), 100);
  assert.equal(developedFor(380), 54);
  assert.equal(guessBonusFor(0), 100);
  assert.equal(guessBonusFor(25), 80);
  assert.equal(guessBonusFor(54), 55);
  assert.equal(guessBonusFor(80), 30);
  assert.equal(guessBonusFor(100), 10);
  for (let d = 1; d <= 100; d++) assert.ok(guessBonusFor(d) <= guessBonusFor(d - 1));
});
test('every rarity tier has its own colour and square, dim to bright', () => {
  assert.equal(new Set(TIERS.map((t) => t.color)).size, TIERS.length);
  assert.equal(new Set(TIERS.map((t) => t.square)).size, TIERS.length);
  for (const t of TIERS) assert.match(t.color, /^#[0-9a-f]{6}$/i, t.id);
  const lum = (h: string) => [1, 3, 5].reduce((s, i) => s + parseInt(h.slice(i, i + 2), 16), 0);
  for (let i = 1; i < TIERS.length; i++) assert.ok(lum(TIERS[i].color) > lum(TIERS[i - 1].color), TIERS[i].id);
});

console.log('Answer matching');
const cheese = byId('cheese');
test('exact, case, accent and article insensitive', () => {
  for (const t of ['cheddar', 'CHEDDAR', '  Cheddar  ', 'the cheddar', 'Gruyere', 'GRUYÈRE']) {
    const m = matchAnswer(cheese, t);
    assert.equal(m.kind, 'hit', t);
  }
});
test('aliases resolve to the canonical answer', () => {
  const m = matchAnswer(cheese, 'parmigiano reggiano');
  assert.ok(m.kind === 'hit' && m.entry.name === 'Parmesan');
  const g = matchAnswer(cheese, 'goats cheese');
  assert.ok(g.kind === 'hit' && g.entry.name === 'Goat cheese');
});
test('plurals and spacing variants match', () => {
  const pasta = byId('pasta');
  assert.equal(matchAnswer(pasta, 'rigatonis').kind, 'hit');
  assert.equal(matchAnswer(pasta, 'bow ties').kind, 'hit');
  assert.equal(matchAnswer(byId('fruit'), 'strawberries').kind, 'hit');
  assert.equal(matchAnswer(byId('fruit'), 'passionfruit').kind, 'hit');
});
test('small typos are forgiven on longer words, not short ones', () => {
  const m = matchAnswer(cheese, 'gorgonzla');
  assert.ok(m.kind === 'hit' && m.fuzzy && m.entry.name === 'Gorgonzola');
  assert.equal(matchAnswer(cheese, 'chedar').kind, 'hit');
  assert.equal(matchAnswer(cheese, 'brix').kind, 'miss'); // 4 letters: no typo allowance
});
test('wrong-category and nonsense answers miss; empty is empty', () => {
  assert.equal(matchAnswer(cheese, 'hammer').kind, 'miss');
  assert.equal(matchAnswer(cheese, 'zzzzzz').kind, 'miss');
  assert.equal(matchAnswer(cheese, '   ').kind, 'empty');
  assert.equal(matchAnswer(cheese, '!!!').kind, 'empty');
});
test('a near miss suggests the closest answer', () => {
  const m = matchAnswer(cheese, 'brie cheeze');
  assert.equal(m.kind === 'miss' || m.kind === 'hit', true);
});
test('rarest entry of a prompt is its highest score', () => {
  const r = rarestEntry(cheese);
  assert.ok(cheese.entries.every((e) => e.score <= r.score));
});

console.log('Daily selection');
const D0 = EPOCH;
test('same date always gives the same seven prompts', () => {
  const a = pickPrompts('2026-11-03').map((p) => p.id);
  const b = pickPrompts('2026-11-03').map((p) => p.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, ROUNDS_PER_DAY);
});
test('seven distinct prompts each day', () => {
  for (let i = 0; i < 200; i++) assert.equal(new Set(pickPrompts(addDays(D0, i)).map((p) => p.id)).size, ROUNDS_PER_DAY, `day ${i}`);
});
test('consecutive days differ, topics are mixed and nothing repeats within three days', () => {
  assert.notDeepEqual(pickPrompts(D0).map((p) => p.id), pickPrompts(addDays(D0, 1)).map((p) => p.id));
  const groups = new Map<string, number>();
  for (let i = 0; i < 120; i++) {
    const today = pickPrompts(addDays(D0, i));
    const groupsToday = new Set(today.map((p) => p.group));
    assert.ok(groupsToday.size >= 4, `day ${i} only has ${groupsToday.size} topics`);
    today.forEach((p) => groups.set(p.group, (groups.get(p.group) ?? 0) + 1));
    if (i >= 3) {
      const recent = new Set<string>();
      for (let k = 1; k <= 3; k++) pickPrompts(addDays(D0, i - k)).forEach((p) => recent.add(p.id));
      today.forEach((p) => assert.ok(!recent.has(p.id), `${p.id} repeated within three days (day ${i})`));
    }
  }
  const total = [...groups.values()].reduce((a, b) => a + b, 0);
  const general = groups.get('general') ?? 0;
  assert.ok(general / total >= 0.28, 'general knowledge should be the focus');
  for (const [g, n] of groups) if (g !== 'general') assert.ok(n < general, `${g} outweighs general knowledge`);
  for (const g of ['geography', 'history', 'sport', 'screen']) assert.ok((groups.get(g) ?? 0) > 0, `${g} never appears`);
});
test('day numbers count from the epoch; admin overrides replace the list', () => {
  assert.equal(puzzleNumberFor(D0), 1);
  assert.equal(puzzleNumberFor(addDays(D0, 9)), 10);
  const ids = prompts.slice(0, 7).map((p) => p.id).reverse();
  const d = getDaily('2026-12-01', { '2026-12-01': ids }, getPrompts());
  assert.deepEqual(d.prompts.map((p) => p.id), ids);
  assert.equal(getDaily('2026-12-01', { '2026-12-01': ['nope'] }, getPrompts()).prompts.length, ROUNDS_PER_DAY);
});

console.log('Game rules');
const daily: DailySet = getDaily(addDays(D0, 3), undefined, getPrompts());
const T0 = 1_700_000_000_000;
const best = (p: Prompt) => rarestEntry(p).name;
const worst = (p: Prompt) => p.entries.reduce((a, b) => (b.score < a.score ? b : a)).name;

function playAll(profile: PlayerProfile, pick: (p: Prompt) => string, now = T0): PlayerProfile {
  let prof = profile;
  for (let i = 0; i < ROUNDS_PER_DAY; i++) {
    prof = startRound(prof, daily, now);
    prof = submitAnswer(prof, daily, pick(daily.prompts[i]), now + 1000).profile;
  }
  return prof;
}

test('a new day starts with seven pending rounds and no points', () => {
  const g = freshGame(daily);
  assert.equal(g.rounds.length, 7);
  assert.ok(g.rounds.every((r) => r.status === 'pending'));
  assert.equal(currentRoundIndex(g), 0);
});
test('answers are refused until the round is started', () => {
  const r = submitAnswer(emptyProfile(), daily, 'x', T0);
  assert.equal(r.outcome.kind, 'inactive');
});
test('starting a round runs the clock; time left counts down and persists', () => {
  const p = startRound(emptyProfile(), daily, T0);
  const r = getGame(p, daily).rounds[0];
  assert.equal(r.status, 'active');
  assert.equal(remainingMs(r, T0), ROUND_MS);
  assert.equal(remainingMs(r, T0 + 10_000), ROUND_MS - 10_000);
  assert.equal(remainingMs(r, T0 + 99_000), 0);
});
test('a correct answer scores its tier and closes the round', () => {
  const prompt = daily.prompts[0];
  const p = startRound(emptyProfile(), daily, T0);
  const entry = prompt.entries.find((e) => e.score >= 50 && e.score < 72)!;
  const res = submitAnswer(p, daily, entry.name, T0 + 2000);
  assert.ok(res.outcome.kind === 'hit');
  if (res.outcome.kind === 'hit') {
    assert.equal(res.outcome.points, 55);
    assert.equal(res.outcome.tier, 'rare');
  }
  const g = getGame(res.profile, daily);
  assert.equal(g.rounds[0].status, 'done');
  assert.equal(g.points, 55);
  assert.equal(currentRoundIndex(g), 1);
});
test('an unrecognised answer is free: no time lost, never ends the round; repeats are ignored', () => {
  const p = startRound(emptyProfile(), daily, T0);
  const a = submitAnswer(p, daily, 'definitely not a thing', T0 + 1000);
  assert.equal(a.outcome.kind, 'miss');
  const r = getGame(a.profile, daily).rounds[0];
  assert.equal(r.status, 'active');
  assert.equal(remainingMs(r, T0 + 1000), ROUND_MS - 1000);
  assert.deepEqual(r.misses, ['definitely not a thing']);
  const again = submitAnswer(a.profile, daily, 'Definitely  NOT a thing', T0 + 1500);
  assert.equal(again.outcome.kind, 'repeat');
  assert.equal(getGame(again.profile, daily).rounds[0].misses.length, 1);
});
test('answering after time is up scores nothing', () => {
  const p = startRound(emptyProfile(), daily, T0);
  const res = submitAnswer(p, daily, best(daily.prompts[0]), T0 + ROUND_MS + 50);
  assert.equal(res.outcome.kind, 'miss');
  const r = getGame(res.profile, daily).rounds[0];
  assert.equal(r.end, 'timeout');
  assert.equal(r.points, 0);
});
test('many wrong guesses never shorten the clock', () => {
  let p = startRound(emptyProfile(), daily, T0);
  for (let i = 0; i < 30; i++) p = submitAnswer(p, daily, `nonsense${i}x`, T0 + 10_000).profile;
  const r = getGame(p, daily).rounds[0];
  assert.equal(r.status, 'active');
  assert.equal(remainingMs(r, T0 + 10_000), ROUND_MS - 10_000);
});
test('expireRound only acts when the timer has really run out; skip scores zero', () => {
  const p = startRound(emptyProfile(), daily, T0);
  assert.equal(getGame(expireRound(p, daily, T0 + 5000), daily).rounds[0].status, 'active');
  assert.equal(getGame(expireRound(p, daily, T0 + ROUND_MS), daily).rounds[0].end, 'timeout');
  const s = getGame(skipRound(p, daily), daily).rounds[0];
  assert.equal(s.end, 'skipped');
  assert.equal(s.points, 0);
  // idempotent
  assert.equal(expireRound(expireRound(p, daily, T0 + ROUND_MS), daily, T0 + ROUND_MS + 1).games[daily.dateKey].rounds[0].end, 'timeout');
});
test('finishing all seven rounds closes the day, records history and starts a streak', () => {
  const prof = playAll(emptyProfile(), best);
  const g = getGame(prof, daily);
  assert.equal(g.status, 'done');
  assert.ok(g.outcome);
  assert.equal(g.outcome!.points, g.points);
  assert.equal(prof.currentStreak, 1);
  assert.equal(prof.history[daily.dateKey].points, g.points);
  assert.ok(g.points > 400, `rarest answers should score big, got ${g.points}`);
  assert.equal(g.outcome!.developed, developedFor(g.points));
});
test('everyday answers develop little of the photograph; rare ones develop most of it', () => {
  const low = getGame(playAll(emptyProfile(), worst), daily);
  const high = getGame(playAll(emptyProfile(), best), daily);
  assert.ok(low.points <= 70, `low=${low.points}`);
  assert.ok(low.outcome!.developed <= 10);
  assert.ok(high.outcome!.developed > 60);
  assert.ok(high.points <= MAX_POINTS);
});
test('one guess at the photograph, only once the day is over; the bonus depends on how developed it was', () => {
  const done = playAll(emptyProfile(), best);
  const early = submitGuess(startRound(emptyProfile(), daily, T0), daily, daily.image.answer);
  assert.equal(early.guess, null, 'no guessing mid-day');
  const right = submitGuess(done, daily, `the ${daily.image.answer.toUpperCase()}`);
  assert.ok(right.guess?.correct);
  const g = getGame(right.profile, daily);
  assert.equal(right.guess!.bonus, guessBonusFor(g.outcome!.developed));
  assert.equal(dayTotal(g), g.points + right.guess!.bonus);
  assert.equal(right.profile.history[daily.dateKey].guess?.bonus, right.guess!.bonus);
  assert.equal(submitGuess(right.profile, daily, 'again').guess, null, 'only one guess');
  const wrong = submitGuess(done, daily, 'definitely not it');
  assert.equal(wrong.guess?.correct, false);
  assert.equal(wrong.guess?.bonus, 0);
  const pass = submitGuess(done, daily, '  ');
  assert.equal(pass.guess?.correct, false);
  assert.equal(pass.guess?.text, '');
});
test('a finished day cannot be replayed', () => {
  const prof = playAll(emptyProfile(), best);
  assert.equal(submitAnswer(prof, daily, 'anything', T0).outcome.kind, 'inactive');
  assert.equal(startRound(prof, daily, T0), prof);
});
test('streak: consecutive days extend, a gap resets, display breaks silently', () => {
  const d1 = getDaily(addDays(D0, 10), undefined, getPrompts());
  const d2 = getDaily(addDays(D0, 11), undefined, getPrompts());
  const play = (profile: PlayerProfile, d: DailySet) => {
    let p = profile;
    for (let i = 0; i < 7; i++) {
      p = startRound(p, d, T0);
      p = skipRound(p, d);
    }
    return p;
  };
  let p = play(emptyProfile(), d1);
  assert.equal(p.currentStreak, 1);
  p = play(p, d2);
  assert.equal(p.currentStreak, 2);
  assert.equal(p.longestStreak, 2);
  assert.equal(effectiveStreak(p, d2.dateKey), 2);
  assert.equal(effectiveStreak(p, addDays(d2.dateKey, 1)), 2);
  assert.equal(effectiveStreak(p, addDays(d2.dateKey, 2)), 0);
  const d4 = getDaily(addDays(D0, 14), undefined, getPrompts());
  assert.equal(play(p, d4).currentStreak, 1);
});
test('stats summarise history', () => {
  const prof = playAll(emptyProfile(), best);
  const s = deriveStats(prof, daily.dateKey);
  assert.equal(s.played, 1);
  assert.equal(s.bestPoints, getGame(prof, daily).points);
  assert.ok(s.rarest && s.rarest.score >= 85);
  assert.equal(Object.values(s.tierCounts).reduce((a, b) => a + b, 0), 7);
});
test('share text is spoiler-free: no answers, no photograph name, one square per round', () => {
  const prof = submitGuess(playAll(emptyProfile(), best), daily, daily.image.answer).profile;
  const g = getGame(prof, daily);
  const text = buildShareText(g, daily, prof.currentStreak, 'obscura.example');
  assert.ok(text.startsWith(`Obscura No. ${daily.number}`));
  assert.ok(text.includes(`${dayTotal(g)} points`));
  assert.ok(text.includes('✓'));
  assert.ok(text.endsWith('obscura.example'));
  for (const name of [daily.image.answer, ...daily.image.aliases]) assert.ok(!text.toLowerCase().includes(name.toLowerCase()), `leaks ${name}`);
  for (const p of daily.prompts) for (const e of p.entries.slice(0, 100)) assert.ok(!text.toLowerCase().includes(e.name.toLowerCase()) || e.name.length < 4, `leaks ${e.name}`);
  const row = [...text.split('\n')[2]].filter((c) => c.trim() && c !== '\ufe0f');
  assert.equal(row.length, 7);
});

console.log('Photographs');
test('every photograph in use has an approved licence, a file and a credit', () => {
  assert.ok(IMAGES.length >= 20, `only ${IMAGES.length} photographs`);
  const credits = CREDITS as Record<string, { license: string; source: string; author: string; file: string }>;
  for (const img of IMAGES) {
    const c = credits[img.id];
    assert.ok(c.license === 'CC0' || c.license === 'Public domain', `${img.id}: ${c.license}`);
    assert.ok(/^https:\/\/(commons\.wikimedia\.org|www\.metmuseum\.org)\//.test(c.source), `${img.id}: source`); // Commons, or the Met (Open Access, CC0)
    assert.ok(c.author, `${img.id}: author`);
    assert.ok(existsSync(`public/daily/${c.file}`), `${img.id}: missing file`);
    assert.ok(!c.file.includes(img.id), `${img.id}: file name gives the answer away`);
  }
  for (const id of Object.keys(credits)) assert.ok(IMAGE_EDITORIAL.some((e) => e.id === id), `credit for unknown image ${id}`);
});
const asImage = (e: (typeof IMAGE_EDITORIAL)[number]) => ({ ...e, src: '', width: 1, height: 1, credit: { author: '', license: '', source: '' } });
test('every photograph accepts its own name and aliases, forgivingly, and refuses generic words', () => {
  for (const e of IMAGE_EDITORIAL) for (const n of [e.answer, ...e.aliases]) assert.ok(matchGuess(asImage(e), n), `${e.id}: ${n}`);
  const img = asImage(IMAGE_EDITORIAL.find((i) => i.id === 'colosseum')!);
  assert.ok(matchGuess(img, 'colloseum'));
  assert.ok(matchGuess(img, 'The Colosseum in Rome'));
  assert.ok(!matchGuess(img, 'amphitheatre'));
  assert.ok(!matchGuess(img, ''));
});
test('photographs are dealt without repeats until the library is used up', () => {
  const n = IMAGES.length;
  const seen = new Set(Array.from({ length: n }, (_, d) => imageForDay(d).id));
  assert.equal(seen.size, n);
  for (let d = 0; d < n * 3; d++) assert.notEqual(imageForDay(d).id, imageForDay(d + 1).id);
});

console.log('Library split, archive, freezes, badges');
test('the bundled index matches the library, in the same order, and every answer file exists', () => {
  assert.deepEqual(PROMPT_INDEX.map((p) => p.id), PROMPT_SEEDS.map((p) => p.id));
  for (const m of PROMPT_INDEX) {
    assert.ok(existsSync(`public/answers/${m.file}`), `${m.id}: missing ${m.file}`);
    const seed = PROMPT_SEEDS.find((s) => s.id === m.id)!;
    assert.deepEqual(JSON.parse(readFileSync(`public/answers/${m.file}`, 'utf8')), seed.answers, `${m.id}: answer file is stale (run scripts/answers/split.ts)`);
  }
});
test('the daily deal is the same from the index as from the full library', () => {
  for (let i = 0; i < 60; i++) {
    const key = addDays(D0, i);
    assert.deepEqual(pickPrompts(key).map((p) => p.id), pickPrompts(key, getPrompts()).map((p) => p.id));
  }
});
test('a saved game keeps its own prompts and photograph', () => {
  const day = getDaily(addDays(D0, 5));
  const other = getDaily(addDays(D0, 6));
  const saved = freshGame({ ...other, dateKey: day.dateKey });
  const played = asPlayed(day, saved, PROMPT_INDEX);
  assert.deepEqual(played.prompts.map((p) => p.id), other.prompts.map((p) => p.id));
  assert.equal(played.image.id, other.image.id);
  assert.equal(asPlayed(day, undefined, PROMPT_INDEX), day);
});
test('archive lists every past day, newest first, and never today', () => {
  const today = addDays(D0, 9);
  const dates = archiveDates(today);
  assert.equal(dates.length, 9);
  assert.equal(dates[0], addDays(today, -1));
  assert.equal(dates.at(-1), D0);
  assert.equal(archiveDates(D0).length, 0);
});
const skipDay = (profile: PlayerProfile, d: DailySet) => {
  let p = profile;
  for (let i = 0; i < 7; i++) p = skipRound(startRound(p, d, T0), d);
  return p;
};
const full = (n: number) => getDaily(addDays(D0, n), undefined, getPrompts());
test('archive days never touch the streak, history or stats', () => {
  let p = skipDay(emptyProfile(), full(20));
  const past = { ...full(15), archive: true };
  const after = skipDay(p, past);
  assert.equal(after.currentStreak, 1);
  assert.equal(after.lastCompletedDate, full(20).dateKey);
  assert.equal(Object.keys(after.history).length, 1);
  assert.equal(getGame(after, past).status, 'done');
  assert.equal(getGame(after, past).archive, true);
  const guessed = submitGuess(after, past, 'nothing').profile;
  assert.equal(guessed.history[past.dateKey], undefined);
});
test('a streak freeze is earned every seven days and covers a missed day', () => {
  let p = emptyProfile();
  for (let i = 0; i < 7; i++) p = skipDay(p, full(30 + i));
  assert.equal(p.currentStreak, 7);
  assert.equal(p.freezes, 1);
  assert.equal(getGame(p, full(36)).outcome?.freezeEarned, true);
  // Miss day 37, play day 38: the freeze covers it.
  assert.equal(effectiveStreak(p, full(38).dateKey), 7);
  assert.equal(streakOnIce(p, full(38).dateKey), true);
  const q = skipDay(p, full(38));
  assert.equal(q.currentStreak, 8);
  assert.equal(q.freezes, 0);
  assert.deepEqual(q.frozenDates, [full(37).dateKey]);
  assert.equal(getGame(q, full(38)).outcome?.freezesUsed, 1);
  // With no freeze left, a missed day breaks it.
  assert.equal(effectiveStreak(q, full(40).dateKey), 0);
  assert.equal(skipDay(q, full(40)).currentStreak, 1);
  // Two missed days need two freezes.
  const one = { ...p, freezes: 1 };
  assert.equal(skipDay(one, full(39)).currentStreak, 1);
  const two = { ...p, freezes: 2 };
  assert.equal(skipDay(two, full(39)).currentStreak, 8);
  assert.equal(deriveStats(p, full(36).dateKey).freezes, 1);
});
test('freezes are capped at two', () => {
  let p: PlayerProfile = { ...emptyProfile(), freezes: 2 };
  for (let i = 0; i < 7; i++) p = skipDay(p, full(50 + i));
  assert.equal(p.freezes, 2);
});
test('distribution counts days by how developed the photograph got', () => {
  const p = playAll(emptyProfile(), best);
  const s = deriveStats(p, daily.dateKey);
  assert.equal(s.distribution.reduce((a, b) => a + b, 0), 1);
  assert.equal(s.distribution[developedBucket(getGame(p, daily).outcome!.developed)], 1);
});
test('badges follow from the saved games, and new ones are reported once', () => {
  assert.equal(earnedBadges(emptyProfile()).length, 0);
  const p = submitGuess(playAll(emptyProfile(), best), daily, daily.image.answer).profile;
  const ids = earnedBadges(p).map((b) => b.id);
  for (const id of ['first-light', 'named', 'obscurist', 'no-blanks', 'nothing-common']) assert.ok(ids.includes(id), `missing ${id}`);
  assert.ok(!ids.includes('streak-3'));
  assert.equal(unseenBadges({ ...p, badgesSeen: ids }).length, 0);
});
test('a calendar reminder repeats daily at the chosen time', () => {
  const ics = reminderIcs('09:00', 'https://obscura.example/', new Date(2026, 9, 22, 11, 0));
  assert.ok(ics.includes('RRULE:FREQ=DAILY'));
  assert.ok(ics.includes('DTSTART:20261023T090000'), 'starts at the next 9am');
  assert.ok(ics.includes('BEGIN:VALARM'));
  assert.ok(reminderIcs('20:00', 'x', new Date(2026, 9, 22, 11, 0)).includes('DTSTART:20261022T200000'));
});

console.log('Guessing early');
const playRounds = (profile: PlayerProfile, n: number, pick: (p: Prompt) => string = best) => {
  let prof = profile;
  for (let i = 0; i < n; i++) {
    const at = currentRoundIndex(getGame(prof, daily));
    prof = startRound(prof, daily, T0);
    prof = submitAnswer(prof, daily, pick(daily.prompts[at]), T0 + 1000).profile;
  }
  return prof;
};
test('the one guess can be made between prompts, never before the first or while a clock runs', () => {
  assert.equal(submitGuess(emptyProfile(), daily, daily.image.answer).guess, null);
  const running = startRound(playRounds(emptyProfile(), 1), daily, T0);
  assert.equal(submitGuess(running, daily, daily.image.answer).guess, null);
  const between = playRounds(emptyProfile(), 2);
  assert.equal(submitGuess(between, daily, '').guess, null, 'no passing early');
  assert.ok(submitGuess(between, daily, 'a wrong guess').guess);
});
test('a right early guess earns the bonus for how little was showing, and the day plays on', () => {
  const p3 = playRounds(emptyProfile(), 3, worst);
  const dev = developedFor(getGame(p3, daily).points);
  const { profile, guess } = submitGuess(p3, daily, daily.image.answer);
  assert.ok(guess?.correct && guess.early);
  assert.equal(guess.bonus, guessBonusFor(dev));
  assert.equal(guess.afterRound, 3);
  assert.equal(submitGuess(profile, daily, daily.image.answer).guess, null, 'only one guess');
  const end = playRounds(profile, 4);
  const g = getGame(end, daily);
  assert.equal(g.status, 'done');
  assert.equal(dayTotal(g), g.points + guess.bonus);
  assert.deepEqual(end.history[daily.dateKey].guess, { correct: true, bonus: guess.bonus });
});
test('a wrong early guess costs no points, it just uses up the day’s only guess', () => {
  const p2 = playRounds(emptyProfile(), 2);
  const wrong = submitGuess(p2, daily, 'definitely not this').profile;
  const end = playRounds(wrong, 5);
  const g = getGame(end, daily);
  assert.equal(g.guess?.correct, false);
  assert.equal(dayTotal(g), g.points);
  assert.deepEqual(end.history[daily.dateKey].guess, { correct: false, bonus: 0 });
  assert.equal(submitGuess(end, daily, daily.image.answer).guess, null, 'no second guess at the end');
});
test('waiting until the end changes nothing: a wrong end guess costs nothing', () => {
  const p = submitGuess(playAll(emptyProfile(), best), daily, 'wrong').profile;
  const g = getGame(p, daily);
  assert.equal(dayTotal(g), g.points);
});

console.log('Published days stay put');
test('every pinned day keeps its own seven prompts and photograph', () => {
  const schedule = SCHEDULE as Record<string, { prompts: string[]; image: string }>;
  const ids = new Set(PROMPT_INDEX.map((p) => p.id));
  const keys = Object.keys(schedule);
  assert.ok(keys.length >= 30, 'schedule is locked');
  for (const k of keys) {
    const d = getDaily(k);
    assert.deepEqual(d.prompts.map((p) => p.id), schedule[k].prompts, k);
    assert.equal(d.image.id, schedule[k].image, k);
    schedule[k].prompts.forEach((id) => assert.ok(ids.has(id), `${k}: unknown prompt ${id}`));
    assert.ok(IMAGES.some((im) => im.id === schedule[k].image), `${k}: unknown photo`);
  }
});
test('the days after the pinned ones never repeat a prompt from the three days before', () => {
  const keys = Object.keys(SCHEDULE).sort();
  const last = keys[keys.length - 1];
  for (let i = 1; i <= 10; i++) {
    const d = addDays(last, i);
    const recent = new Set<string>();
    for (let k = 1; k <= 3; k++) getDaily(addDays(d, -k)).prompts.forEach((p) => recent.add(p.id));
    const today = getDaily(d).prompts.map((p) => p.id);
    assert.equal(new Set(today).size, 7, d);
    today.forEach((id) => assert.ok(!recent.has(id), `${id} repeats on ${d}`));
  }
});

console.log('Accounts');
test('merging two saved games keeps every day, the further-along copy of each, and the most recent streak', () => {
  const a = skipDay(skipDay(emptyProfile(), full(60)), full(61));
  const b0 = skipDay(emptyProfile(), full(70));
  const b = submitGuess(playAll(b0, best), daily, daily.image.answer).profile;
  const m = mergeProfiles(a, b);
  for (const k of [full(60).dateKey, full(61).dateKey, full(70).dateKey, daily.dateKey]) assert.ok(m.games[k], `missing ${k}`);
  assert.ok(m.games[daily.dateKey].guess, 'kept the finished copy');
  assert.equal(m.lastCompletedDate, a.lastCompletedDate, 'the side that played most recently leads');
  assert.equal(m.currentStreak, a.currentStreak);
  assert.equal(m.longestStreak, Math.max(a.longestStreak, b.longestStreak));
  assert.deepEqual(mergeProfiles(a, null), a);
  assert.deepEqual(Object.keys(mergeProfiles(a, a).games).sort(), Object.keys(a.games).sort());
});

console.log('Answers testers expected');
test('everyday jobs, birds and drinks that testers typed are accepted', () => {
  const ok = (id: string, list: string[]) => list.forEach((a) => assert.equal(matchAnswer(byId(id), a).kind, 'hit', `${id}: ${a}`));
  ok('job', ['Draughtsman', 'Draftsman', 'Diesel mechanic', 'Technician', 'Scaffolder', 'HGV driver', 'Lorry driver', 'Solicitor', 'Barrister', 'Bin man', 'Teaching assistant', 'Care worker', 'GP', 'Influencer']);
  ok('bird', ['Carrion crow', 'Red grouse', 'Hen', 'Rooster', 'Diver', 'Great northern diver']);
  ok('drink', ['Orange squash', 'Hot water', 'Energy drink', 'J2O', 'Fruit Shoot', 'Mocktail', 'Non-alcoholic beer']);
});
test('a specific kind of a listed job counts, as an Everyday answer; nonsense does not', () => {
  const m = matchAnswer(byId('job'), 'Forklift truck mechanic');
  assert.equal(m.kind, 'hit');
  assert.ok(m.kind === 'hit' && m.entry.score < 18);
  assert.equal(matchAnswer(byId('job'), 'mechanic mechanic mechanic mechanic mechanic').kind, 'miss');
  assert.equal(matchAnswer(byId('job'), '12 engineer').kind, 'miss');
  assert.equal(matchAnswer(byId('bird'), 'Diesel mechanic').kind, 'miss');
});

console.log(`\n${passed} tests passed${process.exitCode ? ' — with failures' : ''}`);

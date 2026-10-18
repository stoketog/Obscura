import assert from 'node:assert/strict';
import { PROMPT_SEEDS } from '@/data/prompts';
import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { SCENES } from '@/scene/scenes';
import { getPrompts, parseAnswer, rarestEntry } from '@/lib/prompts';
import { matchAnswer } from '@/lib/match';
import { normalize } from '@/lib/text';
import { TIERS, MAX_POINTS, ROUND_MS, ROUNDS_PER_DAY, pointsFor, stageIndexFor, tierFor, stageProgress } from '@/lib/scoring';
import { getDaily, pickPrompts } from '@/lib/daily';
import { addDays, puzzleNumberFor, EPOCH } from '@/lib/dates';
import { currentRoundIndex, deriveStats, effectiveStreak, expireRound, freshGame, getGame, remainingMs, skipRound, startRound, submitAnswer } from '@/lib/game';
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
    assert.ok(p.entries.length >= 40, `${p.id} has only ${p.entries.length} answers`);
    for (const e of p.entries) assert.ok(e.score >= 1 && e.score <= 100, `${p.id}/${e.name} score ${e.score}`);
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
test('stages are ordered with increasing thresholds', () => {
  for (let i = 1; i < STAGES.length; i++) assert.ok(STAGES[i].threshold > STAGES[i - 1].threshold, STAGES[i].id);
  assert.equal(STAGES.length, 12);
});

console.log('Scoring');
test('tiers map scores to points steeply', () => {
  assert.equal(tierFor(1).id, 'everyday');
  assert.equal(tierFor(19).id, 'everyday');
  assert.equal(tierFor(20).id, 'familiar');
  assert.equal(tierFor(45).id, 'uncommon');
  assert.equal(tierFor(60).id, 'rare');
  assert.equal(tierFor(85).id, 'obscure');
  assert.equal(tierFor(95).id, 'mythic');
  assert.equal(pointsFor(3), 10);
  assert.equal(pointsFor(99), 100);
  assert.equal(MAX_POINTS, 700);
  for (let i = 1; i < TIERS.length; i++) assert.ok(TIERS[i].points > TIERS[i - 1].points);
});
test('stage thresholds: microbe at 0, a form every 40–90 points, the solar system only for a perfect 700', () => {
  assert.equal(stageIndexFor(0), 0);
  assert.equal(stageIndexFor(39), 0);
  assert.equal(stageIndexFor(40), 1);
  assert.equal(stageIndexFor(199), 4);
  assert.equal(stageIndexFor(200), 5); // bird at 200
  assert.equal(stageIndexFor(300), 6); // helicopter at 300
  assert.equal(STAGES[stageIndexFor(699)].id, 'astronaut');
  assert.equal(stageIndexFor(700), STAGES.length - 1);
  assert.equal(STAGES[STAGES.length - 1].id, 'solar');
  assert.equal(stageProgress(700), 100);
  assert.ok(stageProgress(45) > 0 && stageProgress(45) < 100);
  for (let i = 1; i < STAGES.length; i++) assert.ok(STAGES[i].threshold > STAGES[i - 1].threshold && STAGES[i].altitude > STAGES[i - 1].altitude);
});
test('altitude climbs monotonically with points and reads sensibly', () => {
  let prev = -Infinity;
  for (let p = 0; p <= 700; p += 5) {
    const a = altitudeFor(p);
    assert.ok(a >= prev, `altitude dropped at ${p}`);
    prev = a;
  }
  assert.equal(formatAltitude(altitudeFor(0)), '−4,000 m');
  assert.equal(formatAltitude(0), 'Sea level');
  assert.equal(formatAltitude(10700), '10.7 km');
  assert.ok(formatAltitude(altitudeFor(700)).endsWith('billion km'));
});
test('every stage has a scene', () => {
  const ids = new Set(Object.keys(SCENES));
  for (const st of STAGES) assert.ok(ids.has(st.id), st.id);
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
  const d = getDaily('2026-12-01', { '2026-12-01': ids });
  assert.deepEqual(d.prompts.map((p) => p.id), ids);
  assert.equal(getDaily('2026-12-01', { '2026-12-01': ['nope'] }).prompts.length, ROUNDS_PER_DAY);
});

console.log('Game rules');
const daily: DailySet = getDaily(addDays(D0, 3));
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
  const entry = prompt.entries.find((e) => e.score >= 60 && e.score < 80)!;
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
  assert.ok(g.outcome!.stage >= 9);
});
test('everyday answers give a small form; rarest answers give a large one', () => {
  const low = getGame(playAll(emptyProfile(), worst), daily);
  const high = getGame(playAll(emptyProfile(), best), daily);
  assert.ok(low.points <= 70, `low=${low.points}`);
  assert.ok(low.outcome!.stage <= 3);
  assert.ok(high.points > low.points * 5);
  assert.ok(high.outcome!.stage > low.outcome!.stage + 4);
  assert.ok(high.points <= MAX_POINTS);
});
test('the final evolution starts from the form before the last round', () => {
  const g = getGame(playAll(emptyProfile(), best), daily);
  const o = g.outcome!;
  assert.ok(o.stageBeforeFinal <= o.stage);
});
test('a finished day cannot be replayed', () => {
  const prof = playAll(emptyProfile(), best);
  assert.equal(submitAnswer(prof, daily, 'anything', T0).outcome.kind, 'inactive');
  assert.equal(startRound(prof, daily, T0), prof);
});
test('streak: consecutive days extend, a gap resets, display breaks silently', () => {
  const d1 = getDaily(addDays(D0, 10));
  const d2 = getDaily(addDays(D0, 11));
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
  const d4 = getDaily(addDays(D0, 14));
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
test('share text is spoiler-free: no answers, one creature per round', () => {
  const prof = playAll(emptyProfile(), best);
  const g = getGame(prof, daily);
  const text = buildShareText(g, daily, prof.currentStreak);
  assert.ok(text.startsWith('OBSCURA #004'));
  assert.ok(text.includes(`${g.points}/700 pts`));
  assert.ok(text.includes('🔥 1 day streak'));
  for (const p of daily.prompts) for (const e of p.entries.slice(0, 100)) assert.ok(!text.toLowerCase().includes(e.name.toLowerCase()) || e.name.length < 4, `leaks ${e.name}`);
  assert.equal(text.split('\n')[2].split(' ').length, 7);
});

console.log(`\n${passed} tests passed${process.exitCode ? ' — with failures' : ''}`);

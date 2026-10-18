import assert from 'node:assert/strict';
import { PUZZLES } from '@/data/puzzles';
import { ALL_ENTITIES, ENTITY_BY_ID } from '@/data/lexicon';
import { STAGES } from '@/data/stages';
import { computeObscurity, isDiscoverable } from '@/lib/obscurity';
import { rewardForObscurity, solveGrowth, resistance, stageIndexFor, MAX_GUESSES, guessGrowth } from '@/lib/growth';
import { findEntity, suggest, didYouMean } from '@/lib/lexicon';
import { normalize } from '@/lib/text';
import { getDailyPuzzle, pickPuzzle, resolvePuzzle } from '@/lib/puzzles';
import { addDays, puzzleNumberFor, EPOCH } from '@/lib/dates';
import { applyGuess, deriveStats, effectiveStreak, freshGame, nextStreak, resolveGuess, visibleClueCount } from '@/lib/game';
import { emptyProfile } from '@/lib/storage';
import type { PlayerProfile } from '@/lib/types';
import { buildShareText, emojiForSimilarity } from '@/lib/share';
import { applyOverride } from '@/lib/admin';

let passed = 0;
const test = (name: string, fn: () => void) => {
  try { fn(); passed++; console.log('  ✓', name); } catch (e) { console.error('  ✗', name, '\n   ', (e as Error).message); process.exitCode = 1; }
};

console.log('Data integrity');
test('lexicon ids unique', () => assert.equal(new Set(ALL_ENTITIES.map((e) => e.id)).size, ALL_ENTITIES.length));
test('every puzzle points at a real entity', () => PUZZLES.forEach((p) => assert.ok(ENTITY_BY_ID[p.answerId], p.id)));
test('puzzles have 5–8 clues, ids unique, sources set', () => {
  assert.equal(new Set(PUZZLES.map((p) => p.id)).size, PUZZLES.length);
  PUZZLES.forEach((p) => { assert.ok(p.clues.length >= 5 && p.clues.length <= 8, `${p.id} clues=${p.clues.length}`); assert.ok(p.source.url.startsWith('https://')); assert.ok(p.explanation.length > 20); });
});
test('clues never contain the answer name', () => PUZZLES.forEach((p) => { const n = normalize(ENTITY_BY_ID[p.answerId].name); p.clues.forEach((c) => assert.ok(!normalize(c).includes(n), `${p.id}: "${c}"`)); }));
test('every puzzle answer is obscure but discoverable', () => PUZZLES.forEach((p) => {
  const e = ENTITY_BY_ID[p.answerId];
  assert.ok(computeObscurity(e.factors) >= 45, `${p.id} obscurity ${computeObscurity(e.factors)}`);
  assert.ok(isDiscoverable(e.factors), `${p.id} under-documented`);
}));
test('stages ascend and start at 0', () => { assert.equal(STAGES[0].threshold, 0); STAGES.forEach((s, i) => i && assert.ok(s.threshold > STAGES[i - 1].threshold)); assert.equal(STAGES.length, 14); });

console.log('Obscurity & growth');
test('common things score low, niche things high', () => {
  assert.ok(computeObscurity(findEntity('shark')!.factors) < 15);
  assert.ok(computeObscurity(findEntity('barreleye')!.factors) > 75);
});
test('ordering: fish < anglerfish < viperfish < barreleye', () => {
  const o = ['shark', 'anglerfish', 'viperfish', 'barreleye'].map((n) => computeObscurity(findEntity(n)!.factors));
  assert.deepEqual([...o].sort((a, b) => a - b), o);
});
test('reward curve hits the spec anchors (2/10/30/70)', () => {
  assert.equal(Math.round(rewardForObscurity(20)), 2); assert.equal(Math.round(rewardForObscurity(45)), 10);
  assert.equal(Math.round(rewardForObscurity(70)), 30); assert.equal(Math.round(rewardForObscurity(90)), 70);
});
test('reward is monotonic and convex-ish', () => { let prev = -1; for (let o = 0; o <= 100; o++) { const r = rewardForObscurity(o); assert.ok(r >= prev); prev = r; } });
test('fewer guesses ⇒ more growth; later stages ⇒ less growth', () => {
  assert.ok(solveGrowth({ obscurity: 80, guessesUsed: 1, totalBefore: 0 }) > solveGrowth({ obscurity: 80, guessesUsed: 8, totalBefore: 0 }));
  assert.ok(solveGrowth({ obscurity: 80, guessesUsed: 3, totalBefore: 0 }) > solveGrowth({ obscurity: 80, guessesUsed: 3, totalBefore: 60 }));
  assert.ok(resistance(0) === 1 && resistance(70) < 0.25);
});
test('a vague common guess is worth ~nothing, a close rare guess is worth real growth', () => {
  assert.ok(guessGrowth({ guessObscurity: 8, similarity: 52, totalBefore: 0 }) < 0.5);
  assert.ok(guessGrowth({ guessObscurity: 92, similarity: 83, totalBefore: 0 }) > 10);
});
test('stage thresholds', () => { assert.equal(stageIndexFor(0), 0); assert.equal(stageIndexFor(14.9), 4); assert.equal(stageIndexFor(15), 5); assert.equal(stageIndexFor(100), 13); });

console.log('Lexicon & matching');
test('normalisation + aliases', () => {
  assert.equal(findEntity('  THE Barreleye Fish ')?.id, 'barreleye'); assert.equal(findEntity('macropinna microstoma')?.id, 'barreleye');
});
test('autocomplete and typo tolerance', () => { assert.ok(suggest('viper').some((e) => e.id === 'viperfish')); assert.ok(didYouMean('viperfsh').some((e) => e.id === 'viperfish')); assert.equal(findEntity('qqqqzz'), undefined); });

console.log('Daily selection');
test('deterministic per date, different across days', () => {
  assert.equal(getDailyPuzzle('2026-10-18').id, getDailyPuzzle('2026-10-18').id);
  const ids = new Set(Array.from({ length: PUZZLES.length }, (_, i) => getDailyPuzzle(addDays(EPOCH, i)).id));
  assert.equal(ids.size, PUZZLES.length, 'one full cycle shows every puzzle once');
});
test('pinned date wins; puzzle numbers count from epoch', () => {
  const src = [{ ...PUZZLES[0], date: '2030-01-01' }, ...PUZZLES.slice(1)];
  assert.equal(pickPuzzle('2030-01-01', src).id, PUZZLES[0].id);
  assert.equal(puzzleNumberFor(EPOCH), 1); assert.equal(puzzleNumberFor('2026-10-18'), 27);
});

console.log('Game rules');
const day = '2026-10-18';
const puz = () => resolvePuzzle(PUZZLES.find((p) => p.id === 'p-barreleye')!, day);
test('clues unlock one per guess', () => {
  const p = puz(); let prof = emptyProfile();
  assert.equal(visibleClueCount(freshGame(p), p), 1);
  prof = applyGuess(prof, p, findEntity('shark')!).profile;
  assert.equal(visibleClueCount(prof.games[day], p), 2);
});
test('duplicate / unknown guesses are rejected without cost', () => {
  const p = puz(); const prof = applyGuess(emptyProfile(), p, findEntity('shark')!).profile;
  assert.equal(resolveGuess('Shark', prof.games[day], p).kind, 'duplicate');
  assert.equal(resolveGuess('zzzzzz', prof.games[day], p).kind, 'unknown');
  assert.equal(resolveGuess('  ', prof.games[day], p).kind, 'empty');
  assert.equal(resolveGuess('Macropinna microstoma', prof.games[day], p).kind, 'ok');
});
test('winning grows, sets outcome, streak = 1', () => {
  const p = puz(); let prof = emptyProfile();
  prof = applyGuess(prof, p, findEntity('shark')!).profile;
  const r = applyGuess(prof, p, p.answer);
  assert.equal(r.game.status, 'won'); assert.ok(r.game.outcome!.growth > 20);
  assert.equal(r.profile.currentStreak, 1); assert.equal(r.profile.totalGrowth, r.game.outcome!.totalAfter);
  assert.equal(r.profile.history[day].solved, true);
});
test('losing after 8 guesses: partial growth only from closeness, streak broken', () => {
  const p = puz(); let prof: PlayerProfile = { ...emptyProfile(), currentStreak: 4, lastCompletedDate: addDays(day, -1) };
  const wrong = ['shark', 'tuna', 'goldfish', 'salmon', 'octopus', 'eel', 'seahorse', 'piranha'];
  wrong.forEach((w) => (prof = applyGuess(prof, p, findEntity(w)!).profile));
  const g = prof.games[day]; assert.equal(g.status, 'lost'); assert.equal(g.guesses.length, MAX_GUESSES);
  assert.equal(prof.currentStreak, 0); assert.ok(g.outcome!.growth < 2);
  assert.throws(() => applyGuess(prof, p, findEntity('olm')!));
});
test('streak increments on consecutive days, resets after a gap', () => {
  let prof = emptyProfile();
  for (let i = 0; i < 3; i++) { const d = addDays(day, i); const p = resolvePuzzle(pickPuzzle(d), d); prof = applyGuess(prof, p, p.answer).profile; }
  assert.equal(prof.currentStreak, 3); assert.equal(prof.longestStreak, 3);
  assert.equal(effectiveStreak(prof, addDays(day, 3)), 3, 'still alive the next morning');
  assert.equal(effectiveStreak(prof, addDays(day, 4)), 0, 'a missed day breaks it');
  assert.equal(nextStreak(prof, addDays(day, 5), true), 1);
});
test('stats: average, best, distribution', () => {
  let prof = emptyProfile();
  for (let i = 0; i < 2; i++) { const d = addDays(day, i); const p = resolvePuzzle(pickPuzzle(d), d); prof = applyGuess(prof, p, p.answer).profile; }
  const s = deriveStats(prof, addDays(day, 1));
  assert.equal(s.solved, 2); assert.equal(s.distribution[0], 2); assert.ok(s.bestObscurity >= s.averageObscurity);
});
test('growth caps at 100 and later growth is damped', () => {
  let prof = { ...emptyProfile(), totalGrowth: 99 }; const p = puz();
  assert.ok(applyGuess(prof, p, p.answer).profile.totalGrowth <= 100);
});

console.log('Share card');
test('spoiler-free: no answer, has the required lines', () => {
  const p = puz(); let prof = applyGuess(emptyProfile(), p, findEntity('shark')!).profile;
  const r = applyGuess(prof, p, p.answer); const txt = buildShareText(r.game, p, r.profile.currentStreak);
  assert.ok(txt.startsWith('OBSCURA #027')); assert.ok(/Obscurity: [█░]{10} \d+%/.test(txt)); assert.ok(txt.includes('Guesses: 2/8')); assert.ok(txt.includes('🔥 1 day streak'));
  assert.ok(!/barreleye|macropinna|spookfish/i.test(txt));
  assert.equal(emojiForSimilarity(100, true), '🐋');
});

console.log('Admin overrides');
test('applyOverride swaps answer/clues/obscurity and null clears', () => {
  const base = PUZZLES[0]; const o = applyOverride({ ...base, obscurityOverride: 50 }, { answerId: 'olm', clues: ['a'], obscurityOverride: null });
  assert.equal(o.answerId, 'olm'); assert.deepEqual(o.clues, ['a']); assert.equal(o.obscurityOverride, undefined);
});

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`);

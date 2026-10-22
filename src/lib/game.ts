import type { DailySet, GameState, GuessRecord, HistoryEntry, Outcome, PlayerProfile, RoundState, TierId } from './types';
import { MAX_POINTS, ROUND_MS, ROUNDS_PER_DAY, developedFor, guessBonusFor, pointsFor, tierFor } from './scoring';
import { matchGuess } from './picture';
import { matchAnswer } from './match';
import { normalize } from './text';
import { addDays, daysBetween } from './dates';

/** Pure game rules. Nothing in here touches the DOM, the clock or storage: `now` is always passed in. */

/** What the rules need to know about a day: its date, number, prompt ids and photograph (answers not required). */
export type DayRef = Pick<DailySet, 'dateKey' | 'number' | 'endless' | 'archive'> & { prompts: Array<{ id: string }>; image: { id: string } };

/** Most streak freezes a player can hold at once. */
export const MAX_FREEZES = 2;
/** A freeze is earned for every this many daily puzzles finished. */
export const FREEZE_EVERY = 7;

export function freshGame(daily: DayRef): GameState {
  return {
    dateKey: daily.dateKey,
    puzzleNumber: daily.number,
    rounds: daily.prompts.map((p): RoundState => ({ promptId: p.id, status: 'pending', misses: [], points: 0 })),
    status: 'playing',
    points: 0,
    imageId: daily.image.id,
    ...(daily.archive ? { archive: true } : {}),
  };
}

export function getGame(profile: PlayerProfile, daily: DayRef): GameState {
  const saved = profile.games[daily.dateKey];
  // A saved game whose prompts no longer match (e.g. an editorial change) is replaced only if untouched.
  if (saved && saved.rounds.length === daily.prompts.length) return saved;
  return freshGame(daily);
}

/** Index of the round being played or about to be played; -1 once the day is over. */
export function currentRoundIndex(game: GameState): number {
  return game.rounds.findIndex((r) => r.status !== 'done');
}

/** Index of the most recently finished round; -1 if none. */
export function lastDoneIndex(game: GameState): number {
  for (let i = game.rounds.length - 1; i >= 0; i--) if (game.rounds[i].status === 'done') return i;
  return -1;
}

export function remainingMs(round: RoundState, now: number): number {
  if (round.status !== 'active' || round.startedAt === undefined) return ROUND_MS;
  return Math.max(0, ROUND_MS - (now - round.startedAt));
}

export function dayPoints(game: GameState): number {
  return game.rounds.reduce((s, r) => s + r.points, 0);
}

export function freezesHeld(profile: PlayerProfile): number {
  return Math.max(0, Math.min(MAX_FREEZES, profile.freezes ?? 0));
}

/** Days missed between the last finished daily and `dateKey` (not counting either). */
export function missedDays(profile: PlayerProfile, dateKey: string): number {
  const last = profile.lastCompletedDate;
  if (!last) return 0;
  return Math.max(0, daysBetween(last, dateKey) - 1);
}

/**
 * The streak after finishing `dateKey`, and how many freezes that spends. Missed days are covered by freezes, one
 * each, if there are enough of them; the streak then carries on (a covered day keeps the streak but doesn't add to
 * it). Too many missed days and the streak starts again at 1, keeping the freezes.
 */
export function streakPlan(profile: PlayerProfile, dateKey: string): { streak: number; spend: number; covered: string[] } {
  const last = profile.lastCompletedDate;
  if (last === dateKey) return { streak: profile.currentStreak || 1, spend: 0, covered: [] };
  if (!last || daysBetween(last, dateKey) < 0) return { streak: 1, spend: 0, covered: [] };
  const missed = missedDays(profile, dateKey);
  if (missed === 0) return { streak: profile.currentStreak + 1, spend: 0, covered: [] };
  if (missed <= freezesHeld(profile)) {
    const covered = Array.from({ length: missed }, (_, i) => addDays(last, i + 1));
    return { streak: profile.currentStreak + 1, spend: missed, covered };
  }
  return { streak: 1, spend: 0, covered: [] };
}

export function nextStreak(profile: PlayerProfile, dateKey: string): number {
  return streakPlan(profile, dateKey).streak;
}

/**
 * Streak as it should be *displayed* today. A missed day breaks it unless enough freezes are held to cover the gap
 * (they are only spent when the player comes back and finishes a day).
 */
export function effectiveStreak(profile: PlayerProfile, todayKey: string): number {
  const last = profile.lastCompletedDate;
  if (!last) return 0;
  if (last === todayKey || addDays(last, 1) === todayKey) return profile.currentStreak;
  return missedDays(profile, todayKey) <= freezesHeld(profile) ? profile.currentStreak : 0;
}

/** True when the streak is alive today only because freezes will cover the days missed. */
export function streakOnIce(profile: PlayerProfile, todayKey: string): boolean {
  const last = profile.lastCompletedDate;
  if (!last || last === todayKey || addDays(last, 1) === todayKey) return false;
  const missed = missedDays(profile, todayKey);
  return missed > 0 && missed <= freezesHeld(profile);
}

function withGame(profile: PlayerProfile, game: GameState): PlayerProfile {
  return { ...profile, games: { ...profile.games, [game.dateKey]: game } };
}

/** Start the timer on the current round (no-op if one is already running or the day is over). */
export function startRound(profile: PlayerProfile, daily: DayRef, now: number): PlayerProfile {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0 || game.rounds[i].status !== 'pending') return profile;
  const rounds = game.rounds.map((r, k): RoundState => (k === i ? { ...r, status: 'active', startedAt: now } : r));
  return withGame(profile, { ...game, rounds });
}

/** Close the current round and, if it was the last, close the day. */
function finishRound(profile: PlayerProfile, daily: DayRef, index: number, patch: Partial<RoundState>): PlayerProfile {
  const game = getGame(profile, daily);
  const rounds = game.rounds.map((r, k): RoundState => (k === index ? { ...r, ...patch, status: 'done' } : r));
  let next: GameState = { ...game, rounds, points: rounds.reduce((s, r) => s + r.points, 0) };
  let nextProfile = profile;

  if (rounds.every((r) => r.status === 'done')) {
    const points = next.points;
    // Endless dives and archive days are practice: they never move the streak or the daily history.
    const practice = !!daily.endless || !!daily.archive || !!game.archive;
    const plan = practice ? { streak: profile.currentStreak, spend: 0, covered: [] as string[] } : streakPlan(profile, daily.dateKey);
    const streakAfter = plan.streak;
    const tiers: Array<TierId | null> = rounds.map((r) => r.tier ?? null);
    const outcome: Outcome = { points, developed: developedFor(points), streakAfter, tiers };
    const best = rounds.reduce<{ name: string; score: number } | null>((b, r) => (r.answer && r.score !== undefined && (!b || r.score > b.score) ? { name: r.answer, score: r.score } : b), null);
    const entry: HistoryEntry = { dateKey: daily.dateKey, puzzleNumber: daily.number, points, developed: outcome.developed, tiers, best };
    if (next.guess) entry.guess = { correct: next.guess.correct, bonus: next.guess.bonus };
    if (!practice) {
      const history = { ...profile.history, [daily.dateKey]: entry };
      let freezes = freezesHeld(profile) - plan.spend;
      const isNew = !profile.history[daily.dateKey];
      const earned = isNew && Object.keys(history).length % FREEZE_EVERY === 0 && freezes < MAX_FREEZES;
      if (earned) freezes += 1;
      if (plan.spend) outcome.freezesUsed = plan.spend;
      if (earned) outcome.freezeEarned = true;
      nextProfile = {
        ...profile,
        currentStreak: streakAfter,
        longestStreak: Math.max(profile.longestStreak, streakAfter),
        lastCompletedDate: daily.dateKey,
        history,
        freezes,
        frozenDates: plan.covered.length ? [...(profile.frozenDates ?? []), ...plan.covered] : profile.frozenDates,
      };
    }
    next = { ...next, status: 'done', outcome };
  }
  return withGame(nextProfile, next);
}

export type SubmitOutcome =
  | { kind: 'empty' }
  | { kind: 'repeat' }
  | { kind: 'hit'; name: string; score: number; tier: TierId; points: number; fuzzy: boolean; finishedDay: boolean }
  | { kind: 'miss'; near?: string; remainingMs: number; expired: boolean }
  | { kind: 'inactive' };

export interface SubmitApplied {
  profile: PlayerProfile;
  outcome: SubmitOutcome;
}

export function submitAnswer(profile: PlayerProfile, daily: DailySet, raw: string, now: number): SubmitApplied {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0) return { profile, outcome: { kind: 'inactive' } };
  const round = game.rounds[i];
  if (round.status !== 'active') return { profile, outcome: { kind: 'inactive' } };

  // The clock is the source of truth: an answer that arrives after time is up doesn't count.
  if (remainingMs(round, now) <= 0) return { profile: finishRound(profile, daily, i, { end: 'timeout', points: 0 }), outcome: { kind: 'miss', remainingMs: 0, expired: true } };

  const prompt = daily.prompts[i];
  const m = matchAnswer(prompt, raw);
  if (m.kind === 'empty') return { profile, outcome: { kind: 'empty' } };

  if (m.kind === 'hit') {
    const tier = tierFor(m.entry.score);
    const points = pointsFor(m.entry.score);
    const next = finishRound(profile, daily, i, { end: 'answered', answer: m.entry.name, score: m.entry.score, tier: tier.id, points });
    const finishedDay = getGame(next, daily).status === 'done';
    return { profile: next, outcome: { kind: 'hit', name: m.entry.name, score: m.entry.score, tier: tier.id, points, fuzzy: m.fuzzy, finishedDay } };
  }

  const key = normalize(raw);
  if (round.misses.includes(key)) return { profile, outcome: { kind: 'repeat' } };
  // An unrecognised answer is free: the clock keeps running, nothing is lost.
  const noted: RoundState = { ...round, misses: [...round.misses, key] };
  const rounds = game.rounds.map((r, k) => (k === i ? noted : r));
  return {
    profile: withGame(profile, { ...game, rounds }),
    outcome: { kind: 'miss', near: m.near?.name, remainingMs: remainingMs(noted, now), expired: false },
  };
}

/** Called by the UI when the countdown reaches zero. Safe to call repeatedly. */
export function expireRound(profile: PlayerProfile, daily: DayRef, now: number): PlayerProfile {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0) return profile;
  const round = game.rounds[i];
  if (round.status !== 'active' || remainingMs(round, now) > 0) return profile;
  return finishRound(profile, daily, i, { end: 'timeout', points: 0 });
}

export function skipRound(profile: PlayerProfile, daily: DayRef): PlayerProfile {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0 || game.rounds[i].status !== 'active') return profile;
  return finishRound(profile, daily, i, { end: 'skipped', points: 0 });
}

/** Points for the day including the guess bonus. A wrong guess, early or late, costs nothing but the chance. */
export function dayTotal(game: GameState): number {
  return game.points + (game.guess?.bonus ?? 0);
}

/** What a history entry adds up to, guess included. */
export function entryTotal(h: HistoryEntry): number {
  return h.points + (h.guess?.bonus ?? 0);
}

/**
 * Whether the one guess can be made right now: once, between prompts (never while a clock is running, and not
 * before the first prompt), or after the last.
 */
export function canGuess(game: GameState): boolean {
  if (game.guess) return false;
  if (game.status === 'done') return !!game.outcome;
  const done = game.rounds.filter((r) => r.status === 'done').length;
  return done >= 1 && !game.rounds.some((r) => r.status === 'active');
}

/**
 * The one guess at the day's photograph, allowed once all seven rounds are over. An empty guess is a pass
 * (no bonus). The guess can never be changed.
 */
export function submitGuess(profile: PlayerProfile, daily: DailySet, raw: string): { profile: PlayerProfile; guess: GuessRecord | null } {
  const game = getGame(profile, daily);
  if (!canGuess(game)) return { profile, guess: null };
  const text = raw.trim().slice(0, 80);
  const early = game.status !== 'done';
  // An early guess must actually be a guess; passing is only for the end of the day.
  if (early && !text) return { profile, guess: null };
  const developed = early ? developedFor(game.points) : game.outcome!.developed;
  const correct = !!text && matchGuess(daily.image, text);
  const afterRound = game.rounds.filter((r) => r.status === 'done').length;
  const guess: GuessRecord = { text, correct, developed, bonus: correct ? guessBonusFor(developed) : 0, afterRound, ...(early ? { early: true } : {}) };
  let next = withGame(profile, { ...game, guess });
  const h = next.history[daily.dateKey];
  if (!daily.endless && !daily.archive && !game.archive && h) next = { ...next, history: { ...next.history, [daily.dateKey]: { ...h, guess: { correct, bonus: guess.bonus } } } };
  return { profile: next, guess };
}

export interface Stats {
  played: number;
  currentStreak: number;
  longestStreak: number;
  bestPoints: number;
  averagePoints: number;
  /** Best development of the photograph, 0–100. */
  bestDeveloped: number;
  /** Days with a correct guess at the photograph. */
  guessedRight: number;
  /** Days on which a guess was made. */
  guessed: number;
  totalPoints: number;
  /** Count of answers per tier across all days. */
  tierCounts: Record<TierId, number>;
  rarest: { name: string; score: number } | null;
  /** Days by how developed the photograph got: 0–19%, 20–39%, 40–59%, 60–79%, 80–100%. */
  distribution: number[];
  /** Streak freezes held. */
  freezes: number;
}

/** Which of the five distribution buckets a development % falls in. */
export function developedBucket(developed: number): number {
  return Math.min(4, Math.max(0, Math.floor(developed / 20)));
}
export const BUCKET_LABELS = ['0–19%', '20–39%', '40–59%', '60–79%', '80–100%'];

export function deriveStats(profile: PlayerProfile, todayKey: string): Stats {
  const all = Object.values(profile.history);
  const tierCounts: Record<TierId, number> = { everyday: 0, uncommon: 0, rare: 0, obscure: 0, mythic: 0 };
  let rarest: Stats['rarest'] = null;
  for (const h of all) {
    h.tiers.forEach((t) => t && (tierCounts[t] += 1));
    if (h.best && (!rarest || h.best.score > rarest.score)) rarest = h.best;
  }
  const total = all.reduce((s, h) => s + entryTotal(h), 0);
  return {
    played: all.length,
    currentStreak: effectiveStreak(profile, todayKey),
    longestStreak: profile.longestStreak,
    bestPoints: all.reduce((m, h) => Math.max(m, entryTotal(h)), 0),
    averagePoints: all.length ? Math.round(total / all.length) : 0,
    bestDeveloped: all.reduce((m, h) => Math.max(m, h.developed ?? developedFor(h.points)), 0),
    guessedRight: all.filter((h) => h.guess?.correct).length,
    guessed: all.filter((h) => h.guess).length,
    totalPoints: total,
    tierCounts,
    rarest,
    distribution: all.reduce((d, h) => {
      d[developedBucket(h.developed ?? developedFor(h.points))] += 1;
      return d;
    }, [0, 0, 0, 0, 0]),
    freezes: freezesHeld(profile),
  };
}

export { MAX_POINTS, ROUNDS_PER_DAY };

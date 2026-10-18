import type { DailySet, GameState, HistoryEntry, Outcome, PlayerProfile, RoundState, TierId } from './types';
import { MAX_POINTS, MISS_PENALTY_MS, ROUND_MS, ROUNDS_PER_DAY, pointsFor, stageIndexFor, tierFor } from './scoring';
import { matchAnswer } from './match';
import { normalize } from './text';
import { addDays } from './dates';

/** Pure game rules. Nothing in here touches the DOM, the clock or storage: `now` is always passed in. */

export function freshGame(daily: DailySet): GameState {
  return {
    dateKey: daily.dateKey,
    puzzleNumber: daily.number,
    rounds: daily.prompts.map((p): RoundState => ({ promptId: p.id, status: 'pending', penaltyMs: 0, misses: [], points: 0 })),
    status: 'playing',
    points: 0,
  };
}

export function getGame(profile: PlayerProfile, daily: DailySet): GameState {
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
  return Math.max(0, ROUND_MS - (now - round.startedAt) - round.penaltyMs);
}

export function dayPoints(game: GameState): number {
  return game.rounds.reduce((s, r) => s + r.points, 0);
}

export function nextStreak(profile: PlayerProfile, dateKey: string): number {
  if (profile.lastCompletedDate === dateKey) return profile.currentStreak || 1;
  if (profile.lastCompletedDate && addDays(profile.lastCompletedDate, 1) === dateKey) return profile.currentStreak + 1;
  return 1;
}

/** Streak as it should be *displayed* today (a missed day silently breaks it). */
export function effectiveStreak(profile: PlayerProfile, todayKey: string): number {
  const last = profile.lastCompletedDate;
  if (!last) return 0;
  if (last === todayKey || addDays(last, 1) === todayKey) return profile.currentStreak;
  return 0;
}

function withGame(profile: PlayerProfile, game: GameState): PlayerProfile {
  return { ...profile, games: { ...profile.games, [game.dateKey]: game } };
}

/** Start the timer on the current round (no-op if one is already running or the day is over). */
export function startRound(profile: PlayerProfile, daily: DailySet, now: number): PlayerProfile {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0 || game.rounds[i].status !== 'pending') return profile;
  const rounds = game.rounds.map((r, k): RoundState => (k === i ? { ...r, status: 'active', startedAt: now } : r));
  return withGame(profile, { ...game, rounds });
}

/** Close the current round and, if it was the last, close the day. */
function finishRound(profile: PlayerProfile, daily: DailySet, index: number, patch: Partial<RoundState>): PlayerProfile {
  const game = getGame(profile, daily);
  const rounds = game.rounds.map((r, k): RoundState => (k === index ? { ...r, ...patch, status: 'done' } : r));
  let next: GameState = { ...game, rounds, points: rounds.reduce((s, r) => s + r.points, 0) };
  let nextProfile = profile;

  if (rounds.every((r) => r.status === 'done')) {
    const points = next.points;
    const finalPts = rounds[rounds.length - 1].points;
    const streakAfter = nextStreak(profile, daily.dateKey);
    const tiers: Array<TierId | null> = rounds.map((r) => r.tier ?? null);
    const outcome: Outcome = {
      points,
      stage: stageIndexFor(points),
      stageBeforeFinal: stageIndexFor(points - finalPts),
      streakAfter,
      tiers,
    };
    next = { ...next, status: 'done', outcome };
    const best = rounds.reduce<{ name: string; score: number } | null>((b, r) => (r.answer && r.score !== undefined && (!b || r.score > b.score) ? { name: r.answer, score: r.score } : b), null);
    const entry: HistoryEntry = { dateKey: daily.dateKey, puzzleNumber: daily.number, points, stage: outcome.stage, tiers, best };
    nextProfile = {
      ...profile,
      currentStreak: streakAfter,
      longestStreak: Math.max(profile.longestStreak, streakAfter),
      lastCompletedDate: daily.dateKey,
      history: { ...profile.history, [daily.dateKey]: entry },
    };
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
  const penalised: RoundState = { ...round, penaltyMs: round.penaltyMs + MISS_PENALTY_MS, misses: [...round.misses, key] };
  const left = remainingMs(penalised, now);
  const rounds = game.rounds.map((r, k) => (k === i ? penalised : r));
  const nextProfile = withGame(profile, { ...game, rounds });
  if (left <= 0) {
    return { profile: finishRound(nextProfile, daily, i, { end: 'timeout', points: 0 }), outcome: { kind: 'miss', near: m.near?.name, remainingMs: 0, expired: true } };
  }
  return { profile: nextProfile, outcome: { kind: 'miss', near: m.near?.name, remainingMs: left, expired: false } };
}

/** Called by the UI when the countdown reaches zero. Safe to call repeatedly. */
export function expireRound(profile: PlayerProfile, daily: DailySet, now: number): PlayerProfile {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0) return profile;
  const round = game.rounds[i];
  if (round.status !== 'active' || remainingMs(round, now) > 0) return profile;
  return finishRound(profile, daily, i, { end: 'timeout', points: 0 });
}

export function skipRound(profile: PlayerProfile, daily: DailySet): PlayerProfile {
  const game = getGame(profile, daily);
  const i = currentRoundIndex(game);
  if (game.status !== 'playing' || i < 0 || game.rounds[i].status !== 'active') return profile;
  return finishRound(profile, daily, i, { end: 'skipped', points: 0 });
}

export interface Stats {
  played: number;
  currentStreak: number;
  longestStreak: number;
  bestPoints: number;
  averagePoints: number;
  bestStage: number;
  totalPoints: number;
  /** Count of answers per tier across all days. */
  tierCounts: Record<TierId, number>;
  rarest: { name: string; score: number } | null;
}

export function deriveStats(profile: PlayerProfile, todayKey: string): Stats {
  const all = Object.values(profile.history);
  const tierCounts: Record<TierId, number> = { everyday: 0, familiar: 0, uncommon: 0, rare: 0, obscure: 0, mythic: 0 };
  let rarest: Stats['rarest'] = null;
  for (const h of all) {
    h.tiers.forEach((t) => t && (tierCounts[t] += 1));
    if (h.best && (!rarest || h.best.score > rarest.score)) rarest = h.best;
  }
  const total = all.reduce((s, h) => s + h.points, 0);
  return {
    played: all.length,
    currentStreak: effectiveStreak(profile, todayKey),
    longestStreak: profile.longestStreak,
    bestPoints: all.reduce((m, h) => Math.max(m, h.points), 0),
    averagePoints: all.length ? Math.round(total / all.length) : 0,
    bestStage: all.reduce((m, h) => Math.max(m, h.stage), 0),
    totalPoints: total,
    tierCounts,
    rarest,
  };
}

export { MAX_POINTS, ROUNDS_PER_DAY };

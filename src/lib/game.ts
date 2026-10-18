import type { Entity, GameState, GuessResult, HistoryEntry, Outcome, PlayerProfile, ResolvedPuzzle } from './types';
import { MAX_GUESSES, clampTotal, solveGrowth, stageIndexFor } from './growth';
import { evaluateGuess } from './similarity';
import { didYouMean, findEntity } from './lexicon';
import { normalize } from './text';
import { addDays } from './dates';

/** Pure game rules. Nothing in here touches the DOM or storage. */

export function freshGame(puzzle: ResolvedPuzzle): GameState {
  return { dateKey: puzzle.dateKey, puzzleNumber: puzzle.number, guesses: [], status: 'playing' };
}

export function getGame(profile: PlayerProfile, puzzle: ResolvedPuzzle): GameState {
  return profile.games[puzzle.dateKey] ?? freshGame(puzzle);
}

/** Clue 1 is free; every guess unlocks the next. A finished game shows them all. */
export function visibleClueCount(game: GameState, puzzle: ResolvedPuzzle): number {
  if (game.status !== 'playing') return puzzle.clues.length;
  return Math.min(puzzle.clues.length, 1 + game.guesses.length);
}

export type Resolution =
  | { kind: 'ok'; entity: Entity }
  | { kind: 'duplicate'; entity: Entity }
  | { kind: 'empty' }
  | { kind: 'unknown'; suggestions: Entity[] };

/** Turn typed text into an entity (or a polite refusal that costs no guess). */
export function resolveGuess(raw: string, game: GameState, puzzle: ResolvedPuzzle): Resolution {
  const text = normalize(raw);
  if (!text) return { kind: 'empty' };
  let entity = findEntity(raw);
  if (!entity && puzzle.accepted.some((a) => normalize(a) === text)) entity = puzzle.answer;
  if (!entity) return { kind: 'unknown', suggestions: didYouMean(raw) };
  if (game.guesses.some((g) => g.entityId === entity!.id)) return { kind: 'duplicate', entity };
  return { kind: 'ok', entity };
}

export function nextStreak(profile: PlayerProfile, dateKey: string, solved: boolean): number {
  if (!solved) return 0;
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

export interface GuessApplied {
  profile: PlayerProfile;
  game: GameState;
  result: GuessResult;
}

export function applyGuess(profile: PlayerProfile, puzzle: ResolvedPuzzle, entity: Entity): GuessApplied {
  const game = getGame(profile, puzzle);
  if (game.status !== 'playing') throw new Error('Game already finished');

  const result = evaluateGuess({
    guess: entity,
    target: puzzle.answer,
    index: game.guesses.length,
    totalBefore: profile.totalGrowth,
    targetObscurity: puzzle.obscurity,
  });
  const guesses = [...game.guesses, result];
  const solved = result.correct;
  const outOfGuesses = guesses.length >= MAX_GUESSES;

  let next: GameState = { ...game, guesses };
  let nextProfile: PlayerProfile = profile;

  if (solved || outOfGuesses) {
    const growth = solved
      ? solveGrowth({
          obscurity: puzzle.obscurity,
          guessesUsed: guesses.length,
          totalBefore: profile.totalGrowth,
          rewardOverride: puzzle.growthRewardOverride ?? puzzle.growthReward,
        })
      : Math.max(0, ...guesses.map((g) => g.provisionalGrowth));
    const totalAfter = clampTotal(profile.totalGrowth + growth);
    const streakAfter = nextStreak(profile, puzzle.dateKey, solved);
    const outcome: Outcome = {
      solved,
      guessesUsed: guesses.length,
      obscurity: puzzle.obscurity,
      growth,
      stageBefore: stageIndexFor(profile.totalGrowth),
      stageAfter: stageIndexFor(totalAfter),
      totalBefore: profile.totalGrowth,
      totalAfter,
      answerName: puzzle.answer.name,
      streakAfter,
    };
    next = { ...next, status: solved ? 'won' : 'lost', outcome };
    const entry: HistoryEntry = { ...outcome, dateKey: puzzle.dateKey, puzzleNumber: puzzle.number };
    nextProfile = {
      ...profile,
      totalGrowth: totalAfter,
      currentStreak: streakAfter,
      longestStreak: Math.max(profile.longestStreak, streakAfter),
      lastCompletedDate: solved ? puzzle.dateKey : profile.lastCompletedDate,
      history: { ...profile.history, [puzzle.dateKey]: entry },
    };
  }
  nextProfile = { ...nextProfile, games: { ...nextProfile.games, [puzzle.dateKey]: next } };
  return { profile: nextProfile, game: next, result };
}

export interface Stats {
  played: number;
  solved: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  averageObscurity: number;
  bestObscurity: number;
  bestName: string | null;
  totalGrowth: number;
  stageIndex: number;
  /** guess-count distribution of solved games, index 0 = solved in 1 */
  distribution: number[];
}

export function deriveStats(profile: PlayerProfile, todayKey: string): Stats {
  const all = Object.values(profile.history);
  const wins = all.filter((h) => h.solved);
  const best = wins.reduce<HistoryEntry | null>((b, h) => (!b || h.obscurity > b.obscurity ? h : b), null);
  const distribution = Array.from({ length: MAX_GUESSES }, () => 0);
  wins.forEach((w) => (distribution[Math.min(MAX_GUESSES, w.guessesUsed) - 1] += 1));
  return {
    played: all.length,
    solved: wins.length,
    winRate: all.length ? Math.round((wins.length / all.length) * 100) : 0,
    currentStreak: effectiveStreak(profile, todayKey),
    longestStreak: profile.longestStreak,
    averageObscurity: wins.length ? Math.round(wins.reduce((s, h) => s + h.obscurity, 0) / wins.length) : 0,
    bestObscurity: best?.obscurity ?? 0,
    bestName: best?.answerName ?? null,
    totalGrowth: profile.totalGrowth,
    stageIndex: stageIndexFor(profile.totalGrowth),
    distribution,
  };
}

import type { Puzzle, ResolvedPuzzle } from './types';
import { PUZZLES } from '@/data/puzzles';
import { computeObscurity } from './obscurity';
import { rewardForObscurity } from './growth';
import { getEntity } from './lexicon';
import { puzzleNumberFor } from './dates';

/**
 * DAILY SELECTION
 * ---------------
 * 1. A puzzle with `date` pinned to the requested day always wins.
 * 2. Otherwise puzzles rotate in order, one per day, from the epoch.
 *    Cycle 1 plays the list as written; later cycles replay it in a
 *    seeded-shuffled order, so a library of N puzzles never feels periodic.
 *
 * It is a pure function of the date and the puzzle list: everyone sees the
 * same puzzle with no server involved. A backend can later replace
 * `getPuzzleSource()` and keep everything else unchanged.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledOrder(n: number, cycle: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(0x0b5c * (cycle + 1));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export function getPuzzleSource(): Puzzle[] {
  return PUZZLES;
}

export function pickPuzzle(dateKey: string, source: Puzzle[] = getPuzzleSource()): Puzzle {
  const pinned = source.find((p) => p.date === dateKey);
  if (pinned) return pinned;
  const rotating = source.filter((p) => !p.date);
  const pool = rotating.length ? rotating : source;
  const day = Math.max(0, puzzleNumberFor(dateKey) - 1);
  const cycle = Math.floor(day / pool.length);
  const pos = day % pool.length;
  const order = cycle === 0 ? pool.map((_, i) => i) : shuffledOrder(pool.length, cycle);
  return pool[order[pos]];
}

/** Attach the answer entity, computed obscurity and growth reward. */
export function resolvePuzzle(puzzle: Puzzle, dateKey: string): ResolvedPuzzle {
  const answer = getEntity(puzzle.answerId);
  if (!answer) throw new Error(`Puzzle ${puzzle.id} references unknown entity "${puzzle.answerId}"`);
  const obscurity = puzzle.obscurityOverride ?? computeObscurity(answer.factors);
  const growthReward = puzzle.growthRewardOverride ?? rewardForObscurity(obscurity);
  return { ...puzzle, dateKey, number: puzzleNumberFor(dateKey), answer, obscurity, growthReward };
}

export function getDailyPuzzle(dateKey: string, source?: Puzzle[]): ResolvedPuzzle {
  return resolvePuzzle(pickPuzzle(dateKey, source), dateKey);
}

import type { Tier, TierId } from './types';

/**
 * SCORING
 * -------
 * Every answer carries an obscurity score (1–100). Its tier decides the points, and the tiers are
 * deliberately steep: an everyday answer is worth 10, an Obscure one 100. Seven Obscure answers (700)
 * is the ceiling, and develops the day's photograph fully.
 *
 * Naming: the top tier (100 pts, at most two answers per prompt) is called "Obscure" and the one below
 * it (80 pts) "Mythic". The ids stay as they were (`mythic` = 100, `obscure` = 80) so saved games
 * and stats keep their meaning; only the labels the player sees are swapped.
 *
 * Colours run from dim to bright, like light coming into the chamber: the rarer the answer, the more
 * light it lets in.
 */
export const TIERS: Tier[] = [
  { id: 'everyday', label: 'Everyday', min: 0, points: 10, color: '#5b5146', square: '⬛' },
  { id: 'uncommon', label: 'Uncommon', min: 18, points: 30, color: '#857660', square: '⬜' },
  { id: 'rare', label: 'Rare', min: 38, points: 55, color: '#b59a74', square: '🟫' },
  { id: 'obscure', label: 'Mythic', min: 62, points: 80, color: '#dd9d55', square: '🟧' },
  { id: 'mythic', label: 'Obscure', min: 92, points: 100, color: '#f2c66d', square: '🟨' },
];

export const ROUNDS_PER_DAY = 7;
export const ROUND_SECONDS = 30;
export const ROUND_MS = ROUND_SECONDS * 1000;
export const MAX_POINTS = TIERS[TIERS.length - 1].points * ROUNDS_PER_DAY;

export function tierFor(score: number): Tier {
  let t = TIERS[0];
  for (const tier of TIERS) if (score >= tier.min) t = tier;
  return t;
}

export function tierById(id: TierId | string): Tier {
  // 'familiar' was retired; games saved with it count as Uncommon.
  return TIERS.find((t) => t.id === id) ?? TIERS.find((t) => t.id === 'uncommon')!;
}

export function pointsFor(score: number): number {
  return tierFor(score).points;
}

/** How much of the photograph a number of points develops, 0–100. */
export function developedFor(points: number): number {
  return Math.max(0, Math.min(100, Math.round((points / MAX_POINTS) * 100)));
}

/** A right guess at the photograph is worth 100, less 20 for every wrong guess before it. */
export const GUESS_FULL = 100;
export const GUESS_COST = 20;
/** Wrong guesses allowed before the guess is worth nothing and closes: 5. */
export const MAX_GUESSES = GUESS_FULL / GUESS_COST;

/** What a right guess is worth after `misses` wrong ones. */
export function guessWorth(misses: number): number {
  return Math.max(0, GUESS_FULL - GUESS_COST * misses);
}

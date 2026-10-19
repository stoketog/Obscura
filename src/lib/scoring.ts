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

/**
 * The final guess: the less of the photograph you could see, the more a correct guess is worth.
 * 100 points at 0%, falling in a straight line (about 80 at 25%, 55 at 54%, 30 at 80%), never below 10.
 * Rounded to the nearest 5.
 */
export function guessBonusFor(developed: number): number {
  const raw = 100 - 0.875 * Math.max(0, Math.min(100, developed));
  // Halves round down, so 100% developed gives exactly the 10-point floor.
  return Math.max(10, Math.ceil(raw / 5 - 0.5) * 5);
}

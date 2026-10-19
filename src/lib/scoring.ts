import type { Tier, TierId } from './types';
import { STAGES } from '@/data/stages';

/**
 * SCORING
 * -------
 * Every answer carries an obscurity score (1–100). Its tier decides the
 * points, and the tiers are deliberately steep: an everyday answer is worth
 * 10, an Obscure one 100. Seven Obscure answers (700) is the theoretical ceiling.
 *
 * Five tiers: Everyday, Uncommon, Rare, Mythic and Obscure (there used to be a sixth, "Familiar").
 *
 * Naming: the top tier (100 pts, at most two answers per prompt) is called "Obscure" and the one below
 * it (80 pts) "Mythic". The ids stay as they were (`mythic` = 100, `obscure` = 80) so saved games
 * and stats keep their meaning; only the labels the player sees are swapped.
 */
export const TIERS: Tier[] = [
  { id: 'everyday', label: 'Everyday', min: 0, points: 10, color: '#9aa7b5', square: '⬜' },
  { id: 'uncommon', label: 'Uncommon', min: 18, points: 30, color: '#facc15', square: '🟨' },
  { id: 'rare', label: 'Rare', min: 38, points: 55, color: '#3b82f6', square: '🟦' },
  { id: 'obscure', label: 'Mythic', min: 62, points: 80, color: '#a855f7', square: '🟪' },
  { id: 'mythic', label: 'Obscure', min: 92, points: 100, color: '#fb923c', square: '🟧' },
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

/** Highest stage whose threshold the day's points have reached. */
export function stageIndexFor(points: number): number {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) if (points >= STAGES[i].threshold) idx = i;
  return idx;
}

/** 0–100 progress through the current stage towards the next. */
export function stageProgress(points: number): number {
  const idx = stageIndexFor(points);
  if (idx >= STAGES.length - 1) return 100;
  const start = STAGES[idx].threshold;
  const end = STAGES[idx + 1].threshold;
  return Math.round(((points - start) / (end - start)) * 100);
}

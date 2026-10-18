import type { Tier, TierId } from './types';
import { STAGES } from '@/data/stages';

/**
 * SCORING
 * -------
 * Every answer carries an obscurity score (1–100). Its tier decides the
 * points, and the tiers are deliberately steep: an everyday answer is worth
 * 10, a mythic one 100. Seven mythic answers (700) is the theoretical ceiling.
 */
export const TIERS: Tier[] = [
  { id: 'everyday', label: 'Everyday', min: 0, points: 10, emoji: '🦠', hue: 200 },
  { id: 'familiar', label: 'Familiar', min: 20, points: 20, emoji: '🪱', hue: 175 },
  { id: 'uncommon', label: 'Uncommon', min: 40, points: 35, emoji: '🐟', hue: 150 },
  { id: 'rare', label: 'Rare', min: 60, points: 55, emoji: '🦎', hue: 85 },
  { id: 'obscure', label: 'Obscure', min: 80, points: 80, emoji: '🐋', hue: 38 },
  { id: 'mythic', label: 'Mythic', min: 95, points: 100, emoji: '✨', hue: 330 },
];

export const ROUNDS_PER_DAY = 7;
export const ROUND_SECONDS = 30;
export const ROUND_MS = ROUND_SECONDS * 1000;
/** Time lost for an answer the game doesn't recognise. */
export const MISS_PENALTY_MS = 2000;
export const MAX_POINTS = TIERS[TIERS.length - 1].points * ROUNDS_PER_DAY;

export function tierFor(score: number): Tier {
  let t = TIERS[0];
  for (const tier of TIERS) if (score >= tier.min) t = tier;
  return t;
}

export function tierById(id: TierId): Tier {
  return TIERS.find((t) => t.id === id)!;
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

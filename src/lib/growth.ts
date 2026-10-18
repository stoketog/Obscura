import { STAGES } from '@/data/stages';

/**
 * GROWTH MODEL
 * ------------
 * Growth is measured in percentage points of a 0–100 journey from Microbe to
 * the Mythic Form. Three ideas keep it interesting:
 *
 *  1. REWARD is a steep, non-linear function of obscurity. A common answer is
 *     worth ~2, a moderately obscure one ~10, a rare one ~30 and an extreme
 *     one 70+. (Linear would make obscure answers merely "a bit better".)
 *  2. EFFICIENCY rewards solving with fewer guesses.
 *  3. RESISTANCE makes later stages harder: the same discovery moves a
 *     Reptile less than it moves a Microbe. Reaching the Mythic Form takes weeks.
 */

/** [obscurity, growth for a perfect one-guess solve] anchor points, linearly interpolated. */
const REWARD_ANCHORS: Array<[number, number]> = [
  [0, 0],
  [20, 2],
  [45, 10],
  [70, 30],
  [90, 70],
  [100, 90],
];

export function rewardForObscurity(obscurity: number): number {
  const o = Math.min(100, Math.max(0, obscurity));
  for (let i = 1; i < REWARD_ANCHORS.length; i++) {
    const [x1, y1] = REWARD_ANCHORS[i];
    const [x0, y0] = REWARD_ANCHORS[i - 1];
    if (o <= x1) return y0 + ((o - x0) / (x1 - x0)) * (y1 - y0);
  }
  return REWARD_ANCHORS[REWARD_ANCHORS.length - 1][1];
}

export const MAX_GUESSES = 8;

/** 1 guess → 1.0 … 8 guesses → ~0.475. */
export function efficiency(guessesUsed: number): number {
  const g = Math.min(MAX_GUESSES, Math.max(1, guessesUsed));
  return 1 - 0.075 * (g - 1);
}

/** Diminishing returns: 1.0 at the start, 0.5 at 35 growth, ~0.2 at 70. */
export function resistance(totalGrowth: number): number {
  const t = Math.max(0, totalGrowth) / 35;
  return 1 / (1 + t * t);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Growth for solving the puzzle. */
export function solveGrowth(opts: {
  obscurity: number;
  guessesUsed: number;
  totalBefore: number;
  rewardOverride?: number;
}): number {
  const base = opts.rewardOverride ?? rewardForObscurity(opts.obscurity);
  return round1(base * efficiency(opts.guessesUsed) * resistance(opts.totalBefore));
}

/**
 * Provisional growth for a single guess: the closer AND the more obscure it
 * is, the more it's worth. A vague common guess ("fish") is worth nothing;
 * a close, rare one ("viperfish") is worth a real chunk, even if wrong.
 */
export function guessGrowth(opts: { guessObscurity: number; similarity: number; totalBefore: number }): number {
  const sim = Math.min(1, Math.max(0, opts.similarity / 100));
  return round1(rewardForObscurity(opts.guessObscurity) * sim * sim * 0.4 * resistance(opts.totalBefore));
}

export function clampTotal(n: number): number {
  return Math.min(100, Math.max(0, round1(n)));
}

export function stageIndexFor(totalGrowth: number): number {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (totalGrowth + 1e-9 >= STAGES[i].threshold) idx = i;
  }
  return idx;
}

/** 0–100 progress through the current stage towards the next one. */
export function stageProgress(totalGrowth: number): number {
  const idx = stageIndexFor(totalGrowth);
  if (idx >= STAGES.length - 1) return 100;
  const start = STAGES[idx].threshold;
  const end = STAGES[idx + 1].threshold;
  return Math.round(((totalGrowth - start) / (end - start)) * 100);
}

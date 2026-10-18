import { STAGES } from '@/data/stages';
import { FEET_BELOW_ANCHOR } from './heroes-air';

/**
 * Where each form lives in the one shared world (world units, up is +y).
 * The sea surface is at y = 26: the dolphin leaps from it, the human walks on
 * the quay a step above it, and everything else is stacked above or below.
 */
export const STAGE_Y = [0, 9, 18, 26.4, 28.3, 38, 50, 64, 82, 104, 122, 144];
export const SURFACE_Y = 26;
export const QUAY_TOP = STAGE_Y[4] - FEET_BELOW_ANCHOR;
/** The quay's centre line (z). The sea is in front of it, the town behind. */
export const QUAY_Z = -3;

/** Continuous "stage index" for a points total: 3.0 is the dolphin, 3.5 is halfway to the human. */
export function aFor(points: number): number {
  const p = Math.max(0, Math.min(STAGES[STAGES.length - 1].threshold, points));
  let i = 0;
  for (let k = 0; k < STAGES.length; k++) if (p >= STAGES[k].threshold) i = k;
  if (i >= STAGES.length - 1) return STAGES.length - 1;
  const a = STAGES[i], b = STAGES[i + 1];
  return i + (p - a.threshold) / (b.threshold - a.threshold);
}

export function yFor(a: number): number {
  const i = Math.max(0, Math.min(STAGE_Y.length - 2, Math.floor(a)));
  const t = Math.max(0, Math.min(1, a - i));
  return STAGE_Y[i] + (STAGE_Y[i + 1] - STAGE_Y[i]) * (a >= STAGE_Y.length - 1 ? 1 : t);
}

/** How fast the scenery slides past (world units / second) while each form is shown. */
export const PACE = [0.5, 0.7, 3.4, 3.6, 2.8, 5.2, 4.6, 9, 0, 0, 0, 0];

/** Sky colour at a height; used for the backdrop gradient and fog. */
export const RAMP: Array<[number, string]> = [
  [-8, '#00070b'], [-1, '#03232d'], [4, '#054050'], [8, '#241060'], [13, '#13307e'], [18, '#0c63a8'],
  [24, '#1b9fdc'], [25.9, '#38c5f0'], [26.1, '#a9dffa'], [28, '#86cdf5'], [34, '#62b7f0'], [44, '#3f99e8'],
  [56, '#2468cc'], [66, '#173f9a'], [74, '#0e2266'], [84, '#060d38'], [96, '#02041a'], [110, '#010210'], [160, '#010108'],
];

/** Pixels of parallax: nearer things slide faster. */
export const parallax = (z: number) => 11 / Math.max(1.5, 11 - z);

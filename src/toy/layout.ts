import { STAGES } from '@/data/stages';
/** How far below a walker's hip anchor the soles sit. */
export const FEET_BELOW_ANCHOR = 1.4;

/**
 * Where each form lives in the one shared world (world units, up is +y).
 * The sea surface is at y = 26: the human walks on the quay a step above it, and everything else is stacked above or below.
 */
export const STAGE_Y = [0, 9, 18, 28.3, 38, 50, 64, 82, 104, 122, 144];
export const SURFACE_Y = 26;
export const QUAY_TOP = STAGE_Y[3] - FEET_BELOW_ANCHOR;
/** The quay's centre line (z). The sea is in front of it, the town behind. */
export const QUAY_Z = -3;

/** Continuous "stage index" for a points total: 3.0 is the human, 3.5 is halfway to the bird. */
export function aFor(points: number): number {
  const p = Math.max(0, Math.min(STAGES[STAGES.length - 1].threshold, points));
  let i = 0;
  for (let k = 0; k < STAGES.length; k++) if (p >= STAGES[k].threshold) i = k;
  if (i >= STAGES.length - 1) return STAGES.length - 1;
  const a = STAGES[i], b = STAGES[i + 1];
  return i + (p - a.threshold) / (b.threshold - a.threshold);
}

/** How fast the scenery slides past (world units / second) while each form is shown. */
export const PACE = [0.5, 0.7, 3.4, 2.8, 5.2, 4.6, 9, 0, 0, 0, 0];

/** Sky colour at a height; used for the backdrop gradient and fog. */
export const RAMP: Array<[number, string]> = [
  [-8, '#00070b'], [-1, '#02202a'], [4, '#04384a'], [8, '#1b1050'], [13, '#0f2c70'], [18, '#0a5496'],
  [24, '#1478b4'], [25.9, '#2b97c6'], [26.1, '#f2c697'], [28, '#e8b98f'], [33, '#8fb5e6'], [44, '#5b92dc'],
  [56, '#2d62c0'], [66, '#173a8e'], [74, '#0d1f5e'], [84, '#060c34'], [96, '#02041a'], [110, '#010210'], [160, '#010108'],
];

const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function relLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16 & 255) / 255) + 0.7152 * lin((n >> 8 & 255) / 255) + 0.0722 * lin((n & 255) / 255);
}
const rampLum = RAMP.map(([y, c]) => [y, relLuminance(c)] as const);

/**
 * How light the backdrop is behind the top of the screen when the camera is at `camY`:
 * 0 = dark scenery (white ink reads best), 1 = light scenery (dark ink reads best), eased in between.
 * The header wordmark follows it so it always matches the ambience.
 */
export function ambienceAt(camY: number): number {
  // underwater the sky is never visible, so the backdrop stays sea-coloured up to the surface
  const y = camY < SURFACE_Y - 0.5 ? Math.min(camY + 7, SURFACE_Y - 0.15) : camY + 7;
  let L = rampLum[rampLum.length - 1][1];
  if (y <= rampLum[0][0]) L = rampLum[0][1];
  else
    for (let i = 1; i < rampLum.length; i++) {
      if (y <= rampLum[i][0]) {
        const [y0, l0] = rampLum[i - 1], [y1, l1] = rampLum[i];
        L = l0 + (l1 - l0) * ((y - y0) / (y1 - y0));
        break;
      }
    }
  const t = Math.min(1, Math.max(0, (L - 0.13) / (0.22 - 0.13)));
  return t * t * (3 - 2 * t);
}

/** Pixels of parallax: nearer things slide faster. */
export const parallax = (z: number) => 11 / Math.max(1.5, 11 - z);

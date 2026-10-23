import type { DailyImage } from './types';
import { levenshtein, normalize } from './text';

/**
 * THE CHAMBER
 * -----------
 * How the day's photograph looks at a given stage of development, and how the final guess is judged.
 */

/** How soft the photograph is at `developed` percent: a heavy blur at 0% that clears steadily to sharp at 100%. */
export function chamberBlur(developed: number): number {
  const p = Math.max(0, Math.min(100, developed)) / 100;
  return 22 * Math.pow(1 - p, 1.6);
}

/**
 * CSS filter for the photograph at `developed` percent. The reveal is a blur that clears: colours and light are true
 * from the start (only slightly muted), so the player can always see the photograph, just not its detail.
 */
export function chamberFilter(developed: number): string {
  const p = Math.max(0, Math.min(100, developed)) / 100;
  const bright = 0.88 + 0.12 * p;
  const sat = 0.8 + 0.2 * p;
  return `blur(${chamberBlur(developed).toFixed(1)}px) brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(2)})`;
}

/** The image is drawn slightly larger while blurred, so the soft edges never show. */
export function chamberScale(developed: number): number {
  return 1 + 0.12 * (chamberBlur(developed) / 22);
}

const KIND_HINT: Record<DailyImage['kind'], string> = {
  place: 'A place',
  object: 'An object',
  person: 'A person',
  nature: 'Something from nature',
  artwork: 'A work of art',
  space: 'Something from space or spaceflight',
};

export function kindHint(image: DailyImage): string {
  return KIND_HINT[image.kind];
}

function allowedDistance(len: number): number {
  if (len >= 12) return 3;
  if (len >= 8) return 2;
  if (len >= 5) return 1;
  return 0;
}

/** Without spaces and a trailing plural, so "moais", "moai" and "mo ai" all compare equal. */
const squash = (s: string) => s.replace(/ /g, '').replace(/(es|s)$/, '');

/**
 * Forgiving match for a guess at the photograph: case, accents, punctuation and a leading "the" never matter, small typos
 * are allowed on longer names, and a guess that contains the full name ("the bell rock lighthouse in scotland")
 * counts. A generic word on its own ("lighthouse") does not: the name is the answer.
 */
export function matchGuess(image: DailyImage, raw: string): boolean {
  const guess = normalize(raw);
  if (!guess) return false;
  const g = squash(guess);
  for (const name of [image.answer, ...image.aliases]) {
    const n = normalize(name);
    if (!n) continue;
    const s = squash(n);
    if (g === s) return true;
    if (levenshtein(g, s) <= allowedDistance(s.length)) return true;
    if (n.length >= 4 && ` ${guess} `.includes(` ${n} `)) return true;
  }
  return false;
}

import type { ExtraAnswers } from './merge';
import { FOOD_EXTRA } from './food';
import { FOOD_EXTRA_2 } from './food-2';
import { ANIMALS_EXTRA } from './animals';
import { ANIMALS_EXTRA_2 } from './animals-2';
import { GENERATED_EXTRA } from './generated';
import { PLAYERS_EXTRA } from './players';

/** Every prompt's extra answers, by prompt id. Several files may add to the same prompt; they are concatenated. */
const FILES: ExtraAnswers[] = [FOOD_EXTRA, FOOD_EXTRA_2, ANIMALS_EXTRA, ANIMALS_EXTRA_2, PLAYERS_EXTRA];

function combine(files: ExtraAnswers[]): ExtraAnswers {
  const out: ExtraAnswers = {};
  for (const file of files) for (const [id, list] of Object.entries(file)) out[id] = [...(out[id] ?? []), ...list];
  return out;
}

/** Extras written as TypeScript, by hand. */
export const HAND_EXTRAS: ExtraAnswers = combine(FILES);

/**
 * Everything: the hand-written extras, then the ones generated from the plain lists in scripts/answers/lists
 * (scored by scripts/answers/build.py).
 */
export const EXTRA_ANSWERS: ExtraAnswers = combine([HAND_EXTRAS, GENERATED_EXTRA]);

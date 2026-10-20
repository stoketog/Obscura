import type { ExtraAnswers } from './merge';
import { FOOD_EXTRA } from './food';
import { FOOD_EXTRA_2 } from './food-2';
import { ANIMALS_EXTRA } from './animals';
import { ANIMALS_EXTRA_2 } from './animals-2';

/** Every prompt's extra answers, by prompt id. Several files may add to the same prompt; they are concatenated. */
const FILES: ExtraAnswers[] = [FOOD_EXTRA, FOOD_EXTRA_2, ANIMALS_EXTRA, ANIMALS_EXTRA_2];

export const EXTRA_ANSWERS: ExtraAnswers = {};
for (const file of FILES) for (const [id, list] of Object.entries(file)) EXTRA_ANSWERS[id] = [...(EXTRA_ANSWERS[id] ?? []), ...list];

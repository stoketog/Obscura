import type { PromptSeed } from '@/lib/types';
import { FOOD } from './food';
import { ANIMALS } from './animals';
import { NATURE } from './nature';
import { CULTURE } from './culture';

/**
 * The prompt library. To add a category, add a `PromptSeed` to any file here
 * (or create a new file and list it below). The daily selection picks it up
 * automatically; `npm test` checks the data for duplicates and bad scores.
 */
export const PROMPT_SEEDS: PromptSeed[] = [...FOOD, ...ANIMALS, ...NATURE, ...CULTURE];

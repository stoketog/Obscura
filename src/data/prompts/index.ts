import type { PromptSeed } from '@/lib/types';
import { GENERAL } from './general';
import { GEOGRAPHY } from './geography';
import { HISTORY } from './history';
import { SPORT } from './sport';
import { SCREEN } from './screen';
import { MUSIC_ARTS } from './music-arts';
import { SCIENCE } from './science';
import { FOOD } from './food';
import { ANIMALS } from './animals';
import { NATURE } from './nature';
import { CULTURE } from './culture';
import { EXTRA_ANSWERS } from './extra';
import { withExtras } from './extra/merge';

/**
 * The prompt library. To add a category, add a `PromptSeed` to any file here
 * (or create a new file and list it below). The daily selection picks it up
 * automatically; `npm test` checks the data for duplicates and bad scores.
 *
 * Every prompt belongs to a `group`; each day's seven prompts are dealt from
 * different groups (see `src/lib/daily.ts`) so the mix stays varied.
 */
export const PROMPT_SEEDS: PromptSeed[] = withExtras([
  ...GENERAL,
  ...GEOGRAPHY,
  ...HISTORY,
  ...SPORT,
  ...SCREEN,
  ...MUSIC_ARTS,
  ...SCIENCE,
  ...FOOD,
  ...ANIMALS,
  ...NATURE,
  ...CULTURE,
], EXTRA_ANSWERS);

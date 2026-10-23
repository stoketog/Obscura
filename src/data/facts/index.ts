/**
 * FACTS ABOUT ANSWERS
 * -------------------
 * A line or two about notable answers, shown when a player gives that answer and in the results. Keyed by prompt
 * id, then by the answer's name exactly as it appears in the prompt. Only facts that are well established; anything
 * uncertain is left out. Days are added by date (see days/), starting with the hand-set prompts.
 */
import { FACTS_2026_10_24 } from './2026-10-24';

export const FACTS: Record<string, Record<string, string>> = {
  ...FACTS_2026_10_24,
};

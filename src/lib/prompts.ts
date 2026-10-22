import type { Prompt } from './types';
import { PROMPT_SEEDS } from '@/data/prompts';
import { parsePrompt } from './parse';

export { parseAnswer, parsePrompt, rarestEntry, bestEntries } from './parse';

/**
 * The WHOLE library, parsed, in one go. Only for tests, scripts and the admin tools: the game itself never imports
 * this module (it would put every answer in the page bundle) and loads prompts one at a time via `library.ts`.
 */
let cache: Prompt[] | null = null;
export function getPrompts(): Prompt[] {
  if (!cache) cache = PROMPT_SEEDS.map(parsePrompt);
  return cache;
}

export function getPrompt(id: string): Prompt | undefined {
  return getPrompts().find((p) => p.id === id);
}

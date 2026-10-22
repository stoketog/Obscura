import type { Prompt, PromptGroup } from './types';
import { parsePrompt } from './parse';
import INDEX from '@/data/library.json';

/**
 * THE ANSWER LIBRARY, AS THE BROWSER SEES IT
 * ------------------------------------------
 * The game bundles only a small index of every prompt (enough to deal the daily seven). Each prompt's answers live
 * in their own file under /answers (written by scripts/answers/split.ts) and are fetched when that prompt is
 * needed, so a visitor downloads seven small files instead of the whole library.
 */
export interface PromptMeta {
  id: string;
  group: PromptGroup;
  text: string;
  category: string;
  /** File under /answers holding this prompt's answers. */
  file: string;
}

export const PROMPT_INDEX: PromptMeta[] = INDEX as PromptMeta[];

const cache = new Map<string, Promise<Prompt>>();

async function fetchPrompt(meta: PromptMeta): Promise<Prompt> {
  let lastError: unknown;
  // A flaky connection gets a couple of quiet retries before the error reaches the player.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`/answers/${meta.file}`);
      if (!res.ok) throw new Error(`answers for ${meta.id}: HTTP ${res.status}`);
      const answers = (await res.json()) as string[];
      return parsePrompt({ id: meta.id, group: meta.group, text: meta.text, category: meta.category, answers });
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}

export function loadPrompt(meta: PromptMeta): Promise<Prompt> {
  let p = cache.get(meta.id);
  if (!p) {
    p = fetchPrompt(meta);
    // Don't keep a failure cached, so a later attempt can succeed.
    p.catch(() => cache.delete(meta.id));
    cache.set(meta.id, p);
  }
  return p;
}

export function loadPrompts(metas: PromptMeta[]): Promise<Prompt[]> {
  return Promise.all(metas.map(loadPrompt));
}

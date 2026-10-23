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
  /** Content hash: the prompt's file is /answers/<id>-<hash>.json. */
  hash: string;
  /** Written for one particular day: only shown where the schedule pins it. */
  editorial?: boolean;
}

export const PROMPT_INDEX: PromptMeta[] = INDEX as PromptMeta[];

export const answerFile = (meta: PromptMeta) => `${meta.id}-${meta.hash}.json`;

const cache = new Map<string, Promise<Prompt>>();

async function fetchPrompt(meta: PromptMeta): Promise<Prompt> {
  let lastError: unknown;
  // A flaky connection gets a couple of quiet retries before the error reaches the player.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`/answers/${answerFile(meta)}`);
      if (!res.ok) throw new Error(`answers for ${meta.id}: HTTP ${res.status}`);
      const data = (await res.json()) as { text: string; category: string; answers: string[]; closed?: boolean; facts?: Record<string, string> };
      return parsePrompt({ id: meta.id, group: meta.group, ...data, ...(meta.editorial ? { editorial: true } : {}) });
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

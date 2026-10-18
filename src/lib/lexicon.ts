import type { Entity } from './types';
import { ALL_ENTITIES, ENTITY_BY_ID } from '@/data/lexicon';
import { levenshtein, normalize } from './text';

/**
 * Lexicon lookup: exact/alias matching, autocomplete suggestions and
 * typo-tolerant "did you mean" — so a guess is always resolved to an entity
 * (or politely rejected without costing the player a guess).
 */

interface Index {
  /** normalised name or alias → entity */
  byKey: Map<string, Entity>;
  /** every key, with its entity, for fuzzy search */
  keys: Array<{ key: string; entity: Entity; isName: boolean }>;
}

function buildIndex(entities: Entity[]): Index {
  const byKey = new Map<string, Entity>();
  const keys: Index['keys'] = [];
  for (const e of entities) {
    const names = [e.name, ...(e.aliases ?? [])];
    names.forEach((n, i) => {
      const k = normalize(n);
      if (!k) return;
      if (!byKey.has(k)) byKey.set(k, e);
      keys.push({ key: k, entity: e, isName: i === 0 });
    });
  }
  return { byKey, keys };
}

const INDEX = buildIndex(ALL_ENTITIES);

export function getEntity(id: string): Entity | undefined {
  return ENTITY_BY_ID[id];
}

/** Exact match on a name or alias (after normalisation). */
export function findEntity(query: string): Entity | undefined {
  const k = normalize(query);
  if (!k) return undefined;
  return INDEX.byKey.get(k);
}

/** Autocomplete: prefix matches first, then word-prefix, then substring. */
export function suggest(query: string, limit = 6): Entity[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const scored = new Map<string, { e: Entity; score: number }>();
  for (const { key, entity, isName } of INDEX.keys) {
    let score = -1;
    if (key === q) score = 100;
    else if (key.startsWith(q)) score = 80;
    else if (key.split(' ').some((w) => w.startsWith(q))) score = 60;
    else if (key.includes(q)) score = 40;
    if (score < 0) continue;
    if (!isName) score -= 5;
    const prev = scored.get(entity.id);
    if (!prev || score > prev.score) scored.set(entity.id, { e: entity, score });
  }
  return [...scored.values()]
    .sort((a, b) => b.score - a.score || a.e.name.length - b.e.name.length || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map((s) => s.e);
}

/** Typo-tolerant suggestion for guesses that match nothing exactly. */
export function didYouMean(query: string, limit = 3): Entity[] {
  const q = normalize(query);
  if (q.length < 3) return [];
  const best = new Map<string, { e: Entity; d: number }>();
  const maxD = q.length <= 5 ? 1 : q.length <= 9 ? 2 : 3;
  for (const { key, entity } of INDEX.keys) {
    if (Math.abs(key.length - q.length) > maxD) continue;
    const d = levenshtein(q, key);
    if (d > maxD) continue;
    const prev = best.get(entity.id);
    if (!prev || d < prev.d) best.set(entity.id, { e: entity, d });
  }
  return [...best.values()].sort((a, b) => a.d - b.d).slice(0, limit).map((x) => x.e);
}

export const LEXICON_SIZE = ALL_ENTITIES.length;

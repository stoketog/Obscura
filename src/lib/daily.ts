import type { DailySet, Prompt, PromptGroup } from './types';
import { getPrompts } from './prompts';
import { puzzleNumberFor } from './dates';
import { ROUNDS_PER_DAY } from './scoring';

/**
 * DAILY SELECTION
 * ---------------
 * Every day has seven "slots", and each slot draws from a small pool of topic
 * groups (general knowledge most of all, plus geography, history/science, sport,
 * screen/music, and one wildcard). Within a group, prompts are dealt from an
 * endless seeded shuffle, so a group never repeats a prompt until it has used
 * them all, and every day is a different mix of topics.
 *
 * It is a pure function of the date and the library: everyone sees the same
 * seven prompts with no server involved. A backend can later supply the
 * library (or the exact daily list) and keep everything else unchanged.
 */

export const SLOTS: PromptGroup[][] = [
  ['general'],
  ['geography'],
  ['history', 'general', 'science'],
  ['sport'],
  ['screen', 'general', 'music'],
  ['general', 'general', 'food', 'nature'],
  ['arts', 'science', 'music', 'nature', 'food', 'general'],
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function shuffledOrder(n: number, seed: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export function pickPrompts(dateKey: string, pool: Prompt[] = getPrompts(), count = ROUNDS_PER_DAY): Prompt[] {
  const day = Math.max(0, puzzleNumberFor(dateKey) - 1);
  const byGroup = new Map<PromptGroup, Prompt[]>();
  for (const p of pool) byGroup.set(p.group, [...(byGroup.get(p.group) ?? []), p]);
  const groups = [...byGroup.keys()];
  const used = new Map<PromptGroup, number>();
  // Each group's endless sequence, built one shuffled pass at a time. The start of a new pass
  // avoids the end of the previous one so the same prompt never appears on back-to-back days.
  const sequences = new Map<PromptGroup, number[]>();
  const slotsPerDay = Math.max(count, SLOTS.length);

  const extend = (g: PromptGroup, size: number, upTo: number) => {
    const seq = sequences.get(g) ?? [];
    while (seq.length <= upTo) {
      const cycle = Math.floor(seq.length / size);
      const next = shuffledOrder(size, 0x0b5c ^ hash(`${g}:${cycle}`));
      const guard = Math.min(28, Math.floor(size / 2));
      const tail = new Set(seq.slice(-guard));
      for (let i = 0; i < guard && cycle > 0; i++) {
        if (!tail.has(next[i])) continue;
        const j = next.findIndex((v, k) => k >= guard && !tail.has(v));
        if (j >= 0) [next[i], next[j]] = [next[j], next[i]];
      }
      seq.push(...next);
    }
    sequences.set(g, seq);
    return seq;
  };

  const draw = (wanted: PromptGroup, slot: number): Prompt => {
    // A pool without this group (a tiny test pool, say) falls back to whichever groups exist.
    const g = byGroup.has(wanted) ? wanted : groups[slot % groups.length];
    const list = byGroup.get(g)!;
    const n = used.get(g) ?? 0;
    used.set(g, n + 1);
    return list[extend(g, list.length, n)[n]];
  };

  let today: Prompt[] = [];
  for (let d = 0; d <= day; d++) {
    today = [];
    for (let slot = 0; slot < slotsPerDay; slot++) {
      const choices = SLOTS[slot % SLOTS.length];
      today.push(draw(choices[(d + slot) % choices.length], slot));
    }
  }
  // Different order each day so the same topic isn't always the opening round.
  const order = shuffledOrder(today.length, 0x5107 ^ hash(dateKey));
  const seen = new Set<string>();
  const out: Prompt[] = [];
  for (const i of order) {
    if (!seen.has(today[i].id)) {
      seen.add(today[i].id);
      out.push(today[i]);
    }
    if (out.length === count) break;
  }
  return out;
}

/** `overrides` maps a date to an explicit list of prompt ids (admin / editorial). */
export function getDaily(dateKey: string, overrides?: Record<string, string[]>, pool: Prompt[] = getPrompts()): DailySet {
  const forced = overrides?.[dateKey];
  let prompts = pickPrompts(dateKey, pool);
  if (forced && forced.length) {
    const byId = new Map(pool.map((p) => [p.id, p]));
    const picked = forced.map((id, i) => byId.get(id) ?? prompts[i]).filter(Boolean) as Prompt[];
    if (picked.length === ROUNDS_PER_DAY) prompts = picked;
  }
  return { dateKey, number: puzzleNumberFor(dateKey), prompts };
}

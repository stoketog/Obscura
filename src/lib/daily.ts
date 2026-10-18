import type { DailySet, Prompt } from './types';
import { getPrompts } from './prompts';
import { puzzleNumberFor } from './dates';
import { ROUNDS_PER_DAY } from './scoring';

/**
 * DAILY SELECTION
 * ---------------
 * The library is dealt out as one endless stream, seven prompts per day.
 * Each pass through the library uses a fresh, seeded shuffle, so a library of
 * N prompts never feels periodic and no prompt repeats within a pass.
 *
 * It is a pure function of the date and the library: everyone sees the same
 * seven prompts with no server involved. A backend can later supply the
 * library (or the exact daily list) and keep everything else unchanged.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledOrder(n: number, cycle: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(0x0b5c * (cycle + 1));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export function pickPrompts(dateKey: string, pool: Prompt[] = getPrompts(), count = ROUNDS_PER_DAY): Prompt[] {
  const day = Math.max(0, puzzleNumberFor(dateKey) - 1);
  const chosen: Prompt[] = [];
  const used = new Set<string>();
  const orders = new Map<number, number[]>();
  const at = (position: number): Prompt => {
    const cycle = Math.floor(position / pool.length);
    if (!orders.has(cycle)) orders.set(cycle, shuffledOrder(pool.length, cycle));
    return pool[orders.get(cycle)![position % pool.length]];
  };
  let pos = day * count;
  // A day can straddle two passes; skip a prompt that already appeared today.
  while (chosen.length < count && pos < day * count + count + pool.length) {
    const p = at(pos++);
    if (!used.has(p.id)) {
      used.add(p.id);
      chosen.push(p);
    }
  }
  return chosen;
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

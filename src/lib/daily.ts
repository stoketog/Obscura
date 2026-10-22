import type { DailyImage, DailySet, PromptGroup } from './types';
import { PROMPT_INDEX } from './library';
import { IMAGES } from '@/data/images';
import { addDays, puzzleNumberFor } from './dates';
import SCHEDULE_JSON from '@/data/schedule.json';

/** Days already published, pinned for good (scripts/lock-schedule.ts). Later days are dealt from the library. */
const SCHEDULE = SCHEDULE_JSON as Record<string, { prompts: string[]; image: string }>;
const PINNED_DATES = Object.keys(SCHEDULE).sort();
/** Puzzle number of the last pinned day (0 if none). */
const LOCKED_THROUGH = PINNED_DATES.length ? puzzleNumberFor(PINNED_DATES[PINNED_DATES.length - 1]) : 0;
const PINNED_IMAGES = new Set(Object.values(SCHEDULE).map((d) => d.image));
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

/** Anything with an id and a group can be dealt: the bundled index (`PromptMeta`) or fully loaded prompts. */
type Dealable = { id: string; group: PromptGroup; editorial?: boolean };

export function pickPrompts<T extends Dealable = (typeof PROMPT_INDEX)[number]>(dateKey: string, pool: T[] = PROMPT_INDEX as unknown as T[], count = ROUNDS_PER_DAY, dayOverride?: number): T[] {
  const day = dayOverride ?? Math.max(0, puzzleNumberFor(dateKey) - 1);
  pool = pool.filter((p) => !p.editorial); // a day's own prompts are never dealt at random
  const byGroup = new Map<PromptGroup, T[]>();
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

  const draw = (wanted: PromptGroup, slot: number): T => {
    // A pool without this group (a tiny test pool, say) falls back to whichever groups exist.
    const g = byGroup.has(wanted) ? wanted : groups[slot % groups.length];
    const list = byGroup.get(g)!;
    const n = used.get(g) ?? 0;
    used.set(g, n + 1);
    return list[extend(g, list.length, n)[n]];
  };

  let today: T[] = [];
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
  const out: T[] = [];
  for (const i of order) {
    if (!seen.has(today[i].id)) {
      seen.add(today[i].id);
      out.push(today[i]);
    }
    if (out.length === count) break;
  }
  return out;
}

/**
 * The day's photograph. The library is dealt in seeded shuffled passes (like the prompts), so every image is
 * used once before any repeats, and a new pass never starts with an image from the end of the last one.
 */
export function imageForDay(day: number, library: DailyImage[] = IMAGES): DailyImage {
  const n = library.length;
  const d = Math.max(0, day);
  const pass = Math.floor(d / n);
  const order = shuffledOrder(n, 0x1a6e ^ hash(`images:${pass}`));
  if (pass > 0) {
    const prev = shuffledOrder(n, 0x1a6e ^ hash(`images:${pass - 1}`));
    const guard = Math.min(10, Math.floor(n / 3));
    const tail = new Set(prev.slice(-guard));
    for (let i = 0; i < guard; i++) {
      if (!tail.has(order[i])) continue;
      const j = order.findIndex((v, k) => k >= guard && !tail.has(v));
      if (j >= 0) [order[i], order[j]] = [order[j], order[i]];
    }
  }
  return library[order[d % n]];
}

/**
 * A day, before or after its answers are loaded: `DailySet<PromptMeta>` is what the game can work out on its own
 * (which seven prompts, which photograph); `DailySet` (full prompts) is what it plays once the answers arrive.
 */
export type DayOf<T> = Omit<DailySet, 'prompts'> & { prompts: T[] };

/** `overrides` maps a date to an explicit list of prompt ids (admin / editorial). */
export function getDaily<T extends Dealable = (typeof PROMPT_INDEX)[number]>(dateKey: string, overrides?: Record<string, string[]>, pool: T[] = PROMPT_INDEX as unknown as T[]): DayOf<T> {
  const forced = overrides?.[dateKey];
  const number = puzzleNumberFor(dateKey);
  const byId = new Map(pool.map((p) => [p.id, p]));
  const pinned = SCHEDULE[dateKey];
  const pinnedPrompts = pinned?.prompts.map((id) => byId.get(id));
  let prompts = pinnedPrompts && pinnedPrompts.every(Boolean) && pinnedPrompts.length === ROUNDS_PER_DAY ? (pinnedPrompts as T[]) : dealtPrompts(dateKey, pool);
  if (forced && forced.length) {
    const picked = forced.map((id, i) => byId.get(id) ?? prompts[i]).filter(Boolean) as T[];
    if (picked.length === ROUNDS_PER_DAY) prompts = picked;
  }
  const image = (pinned && IMAGES.find((i) => i.id === pinned.image)) || imageForNumber(number);
  return { dateKey, number, prompts, image };
}

/** Prompt ids actually shown on each date, per pool, filled in day by day from the end of the pinned schedule. */
const shownCache = new WeakMap<object, Map<string, string[]>>();

/** Prompt ids shown on a date: pinned if published, otherwise the (nudged) deal. */
function promptIdsOn<T extends Dealable>(dateKey: string, pool: T[]): string[] {
  if (SCHEDULE[dateKey]) return SCHEDULE[dateKey].prompts;
  const n = puzzleNumberFor(dateKey);
  if (n <= LOCKED_THROUGH) return pickPrompts(dateKey, pool).map((p) => p.id);
  let cache = shownCache.get(pool);
  if (!cache) shownCache.set(pool, (cache = new Map()));
  // Work forward from the first unpinned day so every day's nudge sees the real days before it (no deep recursion).
  for (let k = n - Math.min(n - LOCKED_THROUGH - 1, 400); k <= n; k++) {
    const key = addDays(dateKey, k - n);
    if (!cache.has(key)) cache.set(key, nudged(key, pool).map((p) => p.id));
  }
  return cache.get(dateKey)!;
}

/**
 * The deal for a day that isn't pinned, nudged so that nothing shown in the previous three days comes back (the
 * plain deal guarantees that among plain days, but not next to pinned or nudged ones). A clash is swapped for the
 * next prompt of the same topic in a seeded order.
 */
function nudged<T extends Dealable>(dateKey: string, pool: T[]): T[] {
  const dealt = pickPrompts(dateKey, pool);
  const recent = new Set<string>();
  for (let k = 1; k <= 3; k++) promptIdsOn(addDays(dateKey, -k), pool).forEach((id) => recent.add(id));
  const used = new Set(dealt.map((p) => p.id));
  return dealt.map((p) => {
    if (!recent.has(p.id)) return p;
    const same = pool.filter((q) => q.group === p.group && !q.editorial && !recent.has(q.id) && !used.has(q.id));
    const alt = same.length ? same[shuffledOrder(same.length, hash(`${dateKey}:${p.id}`))[0]] : undefined;
    if (!alt) return p;
    used.add(alt.id);
    return alt;
  });
}

function dealtPrompts<T extends Dealable>(dateKey: string, pool: T[]): T[] {
  if (puzzleNumberFor(dateKey) <= LOCKED_THROUGH) return pickPrompts(dateKey, pool);
  const byId = new Map(pool.map((p) => [p.id, p]));
  return promptIdsOn(dateKey, pool).map((id) => byId.get(id)!);
}

/**
 * The photograph for a day that isn't pinned. Photographs no published day has used come first (in a seeded
 * order), so new photographs reach players before any repeat; after that, the library is dealt in passes.
 */
export function imageForNumber(number: number, library: DailyImage[] = IMAGES): DailyImage {
  const k = number - 1 - LOCKED_THROUGH;
  if (k < 0) return imageForDay(number - 1, library);
  const fresh = library.filter((i) => !PINNED_IMAGES.has(i.id));
  const order = shuffledOrder(fresh.length, 0x2b7e ^ hash('fresh-images'));
  if (k < fresh.length) return fresh[order[k]];
  return imageForDay(k - fresh.length, library);
}

/**
 * ENDLESS MODE (early access)
 * ---------------------------
 * Extra dives that are not tied to a date. For now there are exactly two, each a fixed set of seven prompts
 * dealt from far beyond the daily calendar (so they never repeat a real day's set). More will follow.
 */
export const ENDLESS_DIVES = 2;

const dives = new Map<string, DayOf<Dealable>>();
export function getEndlessDive<T extends Dealable = (typeof PROMPT_INDEX)[number]>(n: number, pool?: T[]): DayOf<T> {
  const key = `endless-${n}`;
  const cached = pool ? undefined : (dives.get(key) as DayOf<T> | undefined);
  if (cached) return cached;
  // A later dive never reuses a prompt from an earlier one.
  let source: T[] = pool ?? (PROMPT_INDEX as unknown as T[]);
  for (let k = 1; k < n; k++) {
    const used = new Set(getEndlessDive(k, pool).prompts.map((p) => p.id));
    source = source.filter((p) => !used.has(p.id));
  }
  // Endless dives take their photographs from the far end of the daily deal, so they rarely match a recent day.
  const set: DayOf<T> = { dateKey: key, number: 0, endless: n, prompts: pickPrompts(key, source, ROUNDS_PER_DAY, 4000 + n * 37), image: imageForDay(IMAGES.length * 3 - n) };
  if (!pool) dives.set(key, set);
  return set;
}

/**
 * A day as it was actually played. Once a game is saved, its prompts and photograph are taken from the save, so a
 * past day keeps showing what the player saw even after the library grows and the daily deal shifts.
 */
export function asPlayed<T extends Dealable>(day: DayOf<T>, saved: { rounds: Array<{ promptId: string }>; imageId?: string } | undefined, pool: T[], library: DailyImage[] = IMAGES): DayOf<T> {
  if (!saved) return day;
  const byId = new Map(pool.map((p) => [p.id, p]));
  const prompts = saved.rounds.map((r) => byId.get(r.promptId));
  const image = saved.imageId ? library.find((i) => i.id === saved.imageId) : undefined;
  return {
    ...day,
    prompts: prompts.every(Boolean) && prompts.length === day.prompts.length ? (prompts as T[]) : day.prompts,
    image: image ?? day.image,
  };
}

/** Every past day that can be replayed from the archive, newest first (puzzle 1 up to yesterday). */
export function archiveDates(todayKey: string): string[] {
  const n = puzzleNumberFor(todayKey) - 1;
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(todayKey, -(i + 1)));
}

export function imageById(id: string | undefined, library: DailyImage[] = IMAGES): DailyImage | undefined {
  return id ? library.find((i) => i.id === id) : undefined;
}

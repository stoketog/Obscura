import type { Puzzle } from './types';
import { STORAGE_PREFIX } from './config';
import { safeStorage } from './storage';

/**
 * Admin overrides: per-date edits to a puzzle (answer, clues, obscurity …).
 * They live in localStorage purely for the dev workflow. They are only ever
 * read when ADMIN_ENABLED, so a production build ignores them completely.
 */
export type PuzzleOverride = Partial<Pick<Puzzle, 'answerId' | 'clues' | 'accepted' | 'explanation' | 'category'>> & {
  /** `null` = clear the editorial override and use the computed value */
  obscurityOverride?: number | null;
  growthRewardOverride?: number | null;
};
export type OverrideMap = Record<string, PuzzleOverride>;

const KEY = STORAGE_PREFIX + 'admin-overrides';
const DATE_KEY = STORAGE_PREFIX + 'admin-date';

export function loadOverrides(): OverrideMap {
  try {
    const t = safeStorage.get(KEY);
    return t ? (JSON.parse(t) as OverrideMap) : {};
  } catch {
    return {};
  }
}
export function saveOverrides(map: OverrideMap): void {
  safeStorage.set(KEY, JSON.stringify(map));
}
export function loadForcedDate(): string | null {
  return safeStorage.get(DATE_KEY);
}
export function saveForcedDate(date: string | null): void {
  if (date) safeStorage.set(DATE_KEY, date);
  else safeStorage.remove(DATE_KEY);
}

export function applyOverride(puzzle: Puzzle, override?: PuzzleOverride): Puzzle {
  if (!override) return puzzle;
  const merged: Puzzle = { ...puzzle };
  (Object.keys(override) as Array<keyof PuzzleOverride>).forEach((k) => {
    const v = override[k];
    if (v !== undefined && v !== null) (merged as unknown as Record<string, unknown>)[k] = v;
  });
  // `null` explicitly clears an editorial override back to the computed value.
  if (override.obscurityOverride === null) delete merged.obscurityOverride;
  if (override.growthRewardOverride === null) delete merged.growthRewardOverride;
  return merged;
}

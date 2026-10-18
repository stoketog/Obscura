import { STORAGE_PREFIX } from './config';
import { safeStorage } from './storage';

/**
 * Admin overrides: per-date edits to the day's prompt list. They live in
 * localStorage purely for the dev workflow and are only ever read when
 * ADMIN_ENABLED, so a production build ignores them completely.
 */
export type OverrideMap = Record<string, string[]>;

const KEY = STORAGE_PREFIX + 'admin-overrides';
const DATE_KEY = STORAGE_PREFIX + 'admin-date';
const MISSES_KEY = STORAGE_PREFIX + 'unrecognised';

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

/**
 * Answers players typed that the game didn't recognise. Kept locally so a
 * future backend can collect them to grow the answer lists.
 */
export function logUnrecognised(promptId: string, text: string): void {
  try {
    const raw = safeStorage.get(MISSES_KEY);
    const list: Array<[string, string]> = raw ? JSON.parse(raw) : [];
    if (list.some(([p, t]) => p === promptId && t === text)) return;
    list.push([promptId, text]);
    safeStorage.set(MISSES_KEY, JSON.stringify(list.slice(-200)));
  } catch {
    /* best effort */
  }
}
export function loadUnrecognised(): Array<[string, string]> {
  try {
    const raw = safeStorage.get(MISSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

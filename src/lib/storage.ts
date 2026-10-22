import type { PlayerProfile } from './types';
import { STORAGE_PREFIX } from './config';

/**
 * PERSISTENCE
 * -----------
 * The game talks to a `PlayerRepository`, never to localStorage directly.
 * v1 ships `LocalPlayerRepository`. Accounts/leaderboards later only need a
 * second implementation (e.g. `RemotePlayerRepository`) behind the same shape.
 */
export interface PlayerRepository {
  load(): PlayerProfile;
  save(profile: PlayerProfile): void;
  reset(): void;
}

export function emptyProfile(): PlayerProfile {
  return {
    version: 3,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    history: {},
    games: {},
    seenHelp: false,
  };
}

const PROFILE_KEY = STORAGE_PREFIX + 'profile';

/** localStorage with an in-memory fallback (private mode, blocked storage, SSR). */
const memory = new Map<string, string>();
export const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

function sanitize(raw: unknown): PlayerProfile {
  const base = emptyProfile();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<PlayerProfile>;
  // Profiles from the original clue-based version are incompatible; start fresh.
  if (r.version !== 3) return base;
  const history = r.history && typeof r.history === 'object' ? r.history : {};
  return {
    ...base,
    ...r,
    history,
    games: r.games && typeof r.games === 'object' ? r.games : {},
    // Players from before streak freezes start with the freezes their days played would have earned.
    freezes: typeof r.freezes === 'number' ? r.freezes : Math.min(2, Math.floor(Object.keys(history).length / 7)),
  };
}

export class LocalPlayerRepository implements PlayerRepository {
  load(): PlayerProfile {
    try {
      const text = safeStorage.get(PROFILE_KEY);
      return text ? sanitize(JSON.parse(text)) : emptyProfile();
    } catch {
      return emptyProfile();
    }
  }
  save(profile: PlayerProfile): void {
    safeStorage.set(PROFILE_KEY, JSON.stringify(profile));
  }
  reset(): void {
    safeStorage.remove(PROFILE_KEY);
  }
}

export const playerRepository: PlayerRepository = new LocalPlayerRepository();

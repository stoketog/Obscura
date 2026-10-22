import type { DailySet, GameState, TierId } from './types';
import { TIERS } from './scoring';
import { dayTotal } from './game';
import { isValidDateKey } from './dates';
import { safeStorage } from './storage';
import { STORAGE_PREFIX } from './config';

/**
 * FRIEND CHALLENGES
 * -----------------
 * A challenge is one player's finished day, packed into a link (`/?c=…`). A friend who opens it plays the same day
 * (today's, or the archive day if it has passed) and then sees the two days side by side, prompt by prompt.
 * Nothing goes through a server: the link carries the result. It is lightly scrambled so the answers can't be read
 * off the link at a glance before the friend has played (it isn't secret, just not readable by eye).
 */
export interface Challenge {
  /** The day played. */
  date: string;
  /** The challenger's name, if they gave one. */
  name: string;
  /** One per prompt: the answer given (null for none) and its tier. */
  rounds: Array<{ answer: string | null; tier: TierId | null; points: number }>;
  developed: number;
  guess: { correct: boolean; developed: number; afterRound: number } | null;
  total: number;
}

const KEY = 'obscura';
const TIER_IDS = TIERS.map((t) => t.id);

function scramble(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ KEY.charCodeAt(i % KEY.length) ^ (i * 31) % 251;
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** The challenge for a finished day (the guess must have been made). */
export function challengeFor(game: GameState, daily: Pick<DailySet, 'dateKey'>, name: string): Challenge | null {
  if (game.status !== 'done' || !game.outcome || !game.guess) return null;
  return {
    date: daily.dateKey,
    name: name.trim().slice(0, 24),
    rounds: game.rounds.map((r) => ({ answer: r.answer ?? null, tier: r.tier ?? null, points: r.points })),
    developed: game.outcome.developed,
    guess: game.guess.text ? { correct: game.guess.correct, developed: game.guess.developed, afterRound: game.guess.afterRound ?? game.rounds.length } : null,
    total: dayTotal(game),
  };
}

/** Compact array form, so links stay short. */
export function encodeChallenge(c: Challenge): string {
  const packed = [1, c.date, c.name, c.rounds.map((r) => [r.answer ?? 0, r.tier ? TIER_IDS.indexOf(r.tier) : -1, r.points]), c.developed, c.guess ? [c.guess.correct ? 1 : 0, c.guess.developed, c.guess.afterRound] : 0, c.total];
  return toBase64Url(scramble(new TextEncoder().encode(JSON.stringify(packed))));
}

export function decodeChallenge(code: string | null | undefined): Challenge | null {
  if (!code || code.length > 4000) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(scramble(fromBase64Url(code))));
    if (!Array.isArray(p) || p[0] !== 1 || !isValidDateKey(p[1]) || !Array.isArray(p[3]) || p[3].length < 1 || p[3].length > 12) return null;
    const rounds = (p[3] as unknown[]).map((r) => {
      const [a, t, pts] = r as [unknown, unknown, unknown];
      const tier = typeof t === 'number' && t >= 0 && t < TIER_IDS.length ? TIER_IDS[t] : null;
      return { answer: typeof a === 'string' && a ? a.slice(0, 60) : null, tier, points: typeof pts === 'number' ? Math.max(0, Math.min(100, pts)) : 0 };
    });
    const g = p[5];
    return {
      date: p[1],
      name: typeof p[2] === 'string' ? p[2].slice(0, 24) : '',
      rounds,
      developed: typeof p[4] === 'number' ? Math.max(0, Math.min(100, p[4])) : 0,
      guess: Array.isArray(g) ? { correct: g[0] === 1, developed: Number(g[1]) || 0, afterRound: Number(g[2]) || rounds.length } : null,
      total: typeof p[6] === 'number' ? Math.max(0, p[6]) : 0,
    };
  } catch {
    return null;
  }
}

export function challengeUrl(origin: string, c: Challenge): string {
  return `${origin.replace(/\/+$/, '')}/?c=${encodeChallenge(c)}`;
}

/* ───────── challenges received, kept on this device ───────── */

const STORE = STORAGE_PREFIX + 'challenges';
const NAME = STORAGE_PREFIX + 'name';

export function loadChallenges(): Challenge[] {
  try {
    const raw = safeStorage.get(STORE);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return list.map((code) => decodeChallenge(code)).filter((c): c is Challenge => !!c);
  } catch {
    return [];
  }
}

/** Keep a received challenge (the newest 30; a repeat of the same person and day replaces the old one). */
export function saveChallenge(c: Challenge): Challenge[] {
  const others = loadChallenges().filter((x) => !(x.date === c.date && x.name === c.name));
  const list = [c, ...others].slice(0, 30);
  try {
    safeStorage.set(STORE, JSON.stringify(list.map(encodeChallenge)));
  } catch {
    /* storage full or blocked: the challenge lasts for this visit */
  }
  return list;
}

/** Read a challenge from the address (?c=…), keep it, and tidy the address. */
export function adoptChallengeFromUrl(): Challenge | null {
  try {
    const u = new URL(window.location.href);
    if (!u.searchParams.has('c')) return null;
    const c = decodeChallenge(u.searchParams.get('c'));
    u.searchParams.delete('c');
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
    if (c) saveChallenge(c);
    return c;
  } catch {
    return null;
  }
}

export function loadName(): string {
  return safeStorage.get(NAME) ?? '';
}
export function saveName(name: string): void {
  safeStorage.set(NAME, name.trim().slice(0, 24));
}

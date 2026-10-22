import type { SupabaseClient, User } from '@supabase/supabase-js';
import { safeStorage } from './storage';
import { STORAGE_PREFIX } from './config';

/**
 * ONLINE
 * ------
 * Everything that talks to the Obscura database (Supabase). The game never depends on it: every call is
 * best-effort, times out quickly, and fails silently, so play carries on offline exactly as before.
 *
 * - Statistics (what everyone answered, how a day ranks) go through four small database functions with plain
 *   fetch, so no library is loaded for players who never sign in.
 * - Sign-in (Google) and saving the game to an account use supabase-js, loaded only when it is needed.
 *
 * The project URL and publishable key are public by design; the database only allows the functions and the
 * player's own saved game (see the migration notes in README.md).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgcfipoqezslcngyvumf.supabase.co';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'sb_publishable_KWPsiVXhu-0j1f7NfVnBdQ_vcG_Gpsb';
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];

/** Tests and local static builds switch the network off (window.__OBSCURA_OFFLINE__ = true). */
function offline(): boolean {
  return typeof window === 'undefined' || !!(window as unknown as { __OBSCURA_OFFLINE__?: boolean }).__OBSCURA_OFFLINE__;
}

/* ───────── who is playing ───────── */

const PLAYER = STORAGE_PREFIX + 'player';
let accountId: string | null = null;

/** A random id for this device, kept in storage; the account id instead once signed in. */
export function playerKey(): string {
  if (accountId) return accountId;
  let id = safeStorage.get(PLAYER);
  if (!id) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    safeStorage.set(PLAYER, id);
  }
  return id;
}

/* ───────── the four statistics functions ───────── */

async function rpc<T>(name: string, args: Record<string, unknown>, timeoutMs = 6000): Promise<T | null> {
  if (offline()) return null;
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: ctrl.signal,
      keepalive: true,
    });
    if (!res.ok) return null;
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export function recordAnswerAsync(date: string, promptId: string, answer: string | null, tier: string | null): Promise<unknown> {
  return rpc('record_answer', { p_player: playerKey(), p_date: date, p_prompt: promptId, p_answer: answer, p_tier: tier });
}

export interface AnswerShare {
  /** Players who gave each answer. */
  counts: Map<string, number>;
  /** Players who answered this prompt that day (including no answer). */
  total: number;
}

const statsCache = new Map<string, { at: number; value: Promise<AnswerShare | null> }>();

/** Who answered what, for one prompt on one day (cached for a minute). */
export function answerStats(date: string, promptId: string): Promise<AnswerShare | null> {
  const key = `${date}|${promptId}`;
  const hit = statsCache.get(key);
  if (hit && Date.now() - hit.at < 60_000) return hit.value;
  const value = rpc<Array<{ answer: string; players: number; total: number }>>('answer_stats', { p_date: date, p_prompt: promptId }).then((rows) => {
    if (!rows) return null;
    return { counts: new Map(rows.map((r) => [r.answer, r.players])), total: rows[0]?.total ?? 0 };
  });
  statsCache.set(key, { at: Date.now(), value });
  return value;
}

/** Forget cached stats for a prompt (after this player's own answer has been recorded). */
export function refreshStats(date: string, promptId: string): void {
  statsCache.delete(`${date}|${promptId}`);
}

export interface Standing {
  /** Share of the day's other players this player beat, 0–100. */
  beatenPct: number;
  players: number;
}

export async function recordResult(r: { date: string; points: number; developed: number; guessCorrect: boolean | null; guessDeveloped: number | null; total: number }): Promise<Standing | null> {
  const rows = await rpc<Array<{ beaten_pct: number; players: number }>>('record_result', {
    p_player: playerKey(),
    p_date: r.date,
    p_points: r.points,
    p_developed: r.developed,
    p_guess_correct: r.guessCorrect,
    p_guess_developed: r.guessDeveloped,
    p_total: Math.min(800, r.total),
  });
  const row = rows?.[0];
  return row ? { beatenPct: row.beaten_pct, players: row.players } : null;
}

export type EventName = 'visit' | 'day_started' | 'day_finished' | 'guess_early' | 'share_text' | 'share_card' | 'challenge_sent' | 'challenge_opened' | 'signed_in' | 'installed' | 'reminder_added' | 'archive_played';

export function logEvent(name: EventName, date: string | null = null, props: Record<string, unknown> | null = null): void {
  void rpc('log_event', { p_player: playerKey(), p_name: name, p_date: date, p_props: props });
}

/* ───────── accounts (Google sign-in) ───────── */

let clientPromise: Promise<SupabaseClient> | null = null;

/** supabase-js, loaded on first use. */
export function client(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, autoRefreshToken: true } }),
    );
  }
  return clientPromise;
}

/** True when this device may already be signed in (or is coming back from Google), so the library is worth loading. */
export function mightBeSignedIn(): boolean {
  if (offline()) return false;
  try {
    if (new URL(window.location.href).searchParams.has('code')) return true;
    for (let i = 0; i < window.localStorage.length; i++) if (window.localStorage.key(i)?.startsWith(`sb-${PROJECT_REF}-auth-token`)) return true;
  } catch {
    /* storage blocked */
  }
  return false;
}

export interface Account {
  id: string;
  email: string;
  name: string;
}

function toAccount(u: User | null | undefined): Account | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as { full_name?: string; name?: string };
  return { id: u.id, email: u.email ?? '', name: meta.full_name || meta.name || u.email || 'Signed in' };
}

/** Start watching the session; calls back with the account (or null) now and on every change. */
export async function watchAccount(cb: (a: Account | null, event: string) => void): Promise<() => void> {
  const sb = await client();
  const { data } = sb.auth.onAuthStateChange((event, session) => {
    const a = toAccount(session?.user);
    accountId = a?.id ?? null;
    cb(a, event);
  });
  return () => data.subscription.unsubscribe();
}

export async function signInWithGoogle(): Promise<void> {
  const sb = await client();
  await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/` } });
}

export async function signOut(): Promise<void> {
  const sb = await client();
  await sb.auth.signOut();
  accountId = null;
}

/** The saved game on the account, or null. */
export async function pullProfile(userId: string): Promise<unknown | null> {
  const sb = await client();
  const { data, error } = await sb.from('profiles').select('data').eq('user_id', userId).maybeSingle();
  if (error) return null;
  return data?.data ?? null;
}

export async function pushProfile(userId: string, profile: unknown): Promise<boolean> {
  const sb = await client();
  const { error } = await sb.from('profiles').upsert({ user_id: userId, data: profile, updated_at: new Date().toISOString() });
  return !error;
}

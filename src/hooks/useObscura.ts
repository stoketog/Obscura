'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Entity, GameState, GuessResult, PlayerProfile, ResolvedPuzzle } from '@/lib/types';
import { playerRepository, emptyProfile } from '@/lib/storage';
import { toDateKey } from '@/lib/dates';
import { pickPuzzle, resolvePuzzle } from '@/lib/puzzles';
import { applyGuess, deriveStats, effectiveStreak, getGame, resolveGuess, type Stats } from '@/lib/game';
import { ADMIN_ENABLED } from '@/lib/config';
import { applyOverride, loadForcedDate, loadOverrides, saveForcedDate, saveOverrides, type OverrideMap, type PuzzleOverride } from '@/lib/admin';

export type View = 'home' | 'play';

export type SubmitResult =
  | { ok: true; result: GuessResult; finished: boolean }
  | { ok: false; reason: string; suggestions?: Entity[] };

export interface ObscuraApi {
  ready: boolean;
  profile: PlayerProfile;
  /** The real calendar date (local). */
  today: string;
  /** The date being played (differs from `today` only in admin time-travel). */
  dateKey: string;
  puzzle: ResolvedPuzzle | null;
  game: GameState | null;
  stats: Stats;
  streak: number;
  view: View;
  setView: (v: View) => void;
  submit: (raw: string) => SubmitResult;
  markCelebrated: () => void;
  dismissHelp: () => void;
  admin: {
    overrides: OverrideMap;
    forcedDate: string | null;
    setForcedDate: (d: string | null) => void;
    setOverride: (dateKey: string, o: PuzzleOverride | null) => void;
    resetProfile: () => void;
    resetGame: (dateKey: string) => void;
    setGrowth: (n: number) => void;
  };
}

export function useObscura(): ObscuraApi {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [today, setToday] = useState(() => toDateKey(new Date()));
  const [view, setView] = useState<View>('home');
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [forcedDate, setForced] = useState<string | null>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Hydrate from storage on the client only (the server render is a neutral shell).
  useEffect(() => {
    setProfile(playerRepository.load());
    setToday(toDateKey(new Date()));
    if (ADMIN_ENABLED) {
      setOverrides(loadOverrides());
      setForced(loadForcedDate());
    }
    setReady(true);
  }, []);

  // Daily reset: notice when local midnight passes while the tab is open.
  useEffect(() => {
    const tick = () => {
      const now = toDateKey(new Date());
      setToday((prev) => (prev === now ? prev : now));
    };
    const id = window.setInterval(tick, 15_000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, []);

  // When the day rolls over, fall back to the home screen so the new puzzle is a fresh start.
  const lastToday = useRef(today);
  useEffect(() => {
    if (lastToday.current !== today) {
      lastToday.current = today;
      setView('home');
    }
  }, [today]);

  const dateKey = ADMIN_ENABLED && forcedDate ? forcedDate : today;

  const puzzle = useMemo<ResolvedPuzzle | null>(() => {
    if (!ready) return null;
    const base = pickPuzzle(dateKey);
    const ov = ADMIN_ENABLED ? overrides[dateKey] : undefined;
    try {
      return resolvePuzzle(applyOverride(base, ov), dateKey);
    } catch {
      return resolvePuzzle(base, dateKey);
    }
  }, [ready, dateKey, overrides]);

  const game = useMemo(() => (puzzle ? getGame(profile, puzzle) : null), [profile, puzzle]);

  const commit = useCallback((next: PlayerProfile) => {
    profileRef.current = next;
    setProfile(next);
    playerRepository.save(next);
  }, []);

  const submit = useCallback(
    (raw: string): SubmitResult => {
      if (!puzzle) return { ok: false, reason: 'Loading…' };
      const current = profileRef.current;
      const g = getGame(current, puzzle);
      if (g.status !== 'playing') return { ok: false, reason: 'Today’s puzzle is finished.' };
      const res = resolveGuess(raw, g, puzzle);
      if (res.kind === 'empty') return { ok: false, reason: 'Type a guess first.' };
      if (res.kind === 'duplicate') return { ok: false, reason: `You already guessed ${res.entity.name}.` };
      if (res.kind === 'unknown') {
        return {
          ok: false,
          reason: res.suggestions.length ? 'Not recognised. Did you mean:' : 'Obscura doesn’t know that one yet. That didn’t cost you a guess.',
          suggestions: res.suggestions,
        };
      }
      const applied = applyGuess(current, puzzle, res.entity);
      commit(applied.profile);
      return { ok: true, result: applied.result, finished: applied.game.status !== 'playing' };
    },
    [puzzle, commit],
  );

  const markCelebrated = useCallback(() => {
    if (!puzzle) return;
    const cur = profileRef.current;
    const g = cur.games[puzzle.dateKey];
    if (!g || g.celebrated) return;
    commit({ ...cur, games: { ...cur.games, [puzzle.dateKey]: { ...g, celebrated: true } } });
  }, [puzzle, commit]);

  const dismissHelp = useCallback(() => {
    commit({ ...profileRef.current, seenHelp: true });
  }, [commit]);

  // Judged against the date being played (== today for everyone except admin time-travel).
  const stats = useMemo(() => deriveStats(profile, dateKey), [profile, dateKey]);
  const streak = effectiveStreak(profile, dateKey);

  const admin = useMemo<ObscuraApi['admin']>(
    () => ({
      overrides,
      forcedDate,
      setForcedDate: (d) => {
        saveForcedDate(d);
        setForced(d);
      },
      setOverride: (key, o) => {
        const next = { ...overrides };
        if (o && Object.keys(o).length) next[key] = o;
        else delete next[key];
        saveOverrides(next);
        setOverrides(next);
      },
      resetProfile: () => {
        playerRepository.reset();
        const fresh = emptyProfile();
        profileRef.current = fresh;
        setProfile({ ...fresh, seenHelp: true });
        setView('home');
      },
      resetGame: (key) => {
        const cur = profileRef.current;
        const games = { ...cur.games };
        const history = { ...cur.history };
        const prior = history[key];
        delete games[key];
        delete history[key];
        // Roll back the growth that game awarded so a replay is a fair test.
        commit({ ...cur, games, history, totalGrowth: prior ? prior.totalBefore : cur.totalGrowth });
      },
      setGrowth: (n) => commit({ ...profileRef.current, totalGrowth: Math.min(100, Math.max(0, n)) }),
    }),
    [overrides, forcedDate, commit],
  );

  return { ready, profile, today, dateKey, puzzle, game, stats, streak, view, setView, submit, markCelebrated, dismissHelp, admin };
}

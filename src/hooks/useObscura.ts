'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DailySet, GameState, PlayerProfile } from '@/lib/types';
import { playerRepository, emptyProfile } from '@/lib/storage';
import { toDateKey } from '@/lib/dates';
import { getDaily } from '@/lib/daily';
import { deriveStats, effectiveStreak, expireRound, getGame, skipRound, startRound, submitAnswer, currentRoundIndex, type Stats, type SubmitOutcome } from '@/lib/game';
import { ADMIN_ENABLED } from '@/lib/config';
import { logUnrecognised, loadForcedDate, loadOverrides, saveForcedDate, saveOverrides, type OverrideMap } from '@/lib/admin';
import { rarestEntry } from '@/lib/prompts';

export type View = 'home' | 'play';

export interface SubmitResult {
  outcome: SubmitOutcome;
  /** True when this answer closed the whole day. */
  finished: boolean;
}

export interface ObscuraApi {
  ready: boolean;
  profile: PlayerProfile;
  /** The real calendar date (local). */
  today: string;
  /** The date being played (differs from `today` only in admin time-travel). */
  dateKey: string;
  daily: DailySet | null;
  game: GameState | null;
  stats: Stats;
  streak: number;
  view: View;
  setView: (v: View) => void;
  /** Start the timer on the next round. */
  start: () => void;
  submit: (raw: string) => SubmitResult;
  skip: () => boolean;
  /** Called when the countdown reaches zero. Returns true if that closed the day. */
  expire: () => boolean;
  markCelebrated: () => void;
  dismissHelp: () => void;
  admin: {
    overrides: OverrideMap;
    forcedDate: string | null;
    setForcedDate: (d: string | null) => void;
    setOverride: (dateKey: string, ids: string[] | null) => void;
    resetProfile: () => void;
    resetGame: (dateKey: string) => void;
    /** Instantly play the whole day with the rarest or the most common answers. */
    autoplay: (mode: 'rarest' | 'common') => void;
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

  // When the day rolls over, fall back to the home screen so the new set is a fresh start.
  const lastToday = useRef(today);
  useEffect(() => {
    if (lastToday.current !== today) {
      lastToday.current = today;
      setView('home');
    }
  }, [today]);

  const dateKey = ADMIN_ENABLED && forcedDate ? forcedDate : today;

  const daily = useMemo<DailySet | null>(() => (ready ? getDaily(dateKey, ADMIN_ENABLED ? overrides : undefined) : null), [ready, dateKey, overrides]);
  const dailyRef = useRef(daily);
  dailyRef.current = daily;

  const game = useMemo(() => (daily ? getGame(profile, daily) : null), [profile, daily]);

  const commit = useCallback((next: PlayerProfile) => {
    profileRef.current = next;
    setProfile(next);
    playerRepository.save(next);
  }, []);

  const isDone = (p: PlayerProfile, d: DailySet) => getGame(p, d).status === 'done';

  const start = useCallback(() => {
    const d = dailyRef.current;
    if (d) commit(startRound(profileRef.current, d, Date.now()));
  }, [commit]);

  const submit = useCallback(
    (raw: string): SubmitResult => {
      const d = dailyRef.current;
      if (!d) return { outcome: { kind: 'inactive' }, finished: false };
      const before = profileRef.current;
      const idx = currentRoundIndex(getGame(before, d));
      const res = submitAnswer(before, d, raw, Date.now());
      if (res.profile !== before) commit(res.profile);
      if (res.outcome.kind === 'miss' && idx >= 0) logUnrecognised(d.prompts[idx].id, raw.trim().toLowerCase().slice(0, 60));
      return { outcome: res.outcome, finished: res.profile !== before && isDone(res.profile, d) && !isDone(before, d) };
    },
    [commit],
  );

  const skip = useCallback((): boolean => {
    const d = dailyRef.current;
    if (!d) return false;
    const before = profileRef.current;
    const next = skipRound(before, d);
    if (next !== before) commit(next);
    return next !== before && isDone(next, d);
  }, [commit]);

  const expire = useCallback((): boolean => {
    const d = dailyRef.current;
    if (!d) return false;
    const before = profileRef.current;
    const next = expireRound(before, d, Date.now());
    if (next !== before) commit(next);
    return next !== before && isDone(next, d);
  }, [commit]);

  const markCelebrated = useCallback(() => {
    const d = dailyRef.current;
    if (!d) return;
    const cur = profileRef.current;
    const g = cur.games[d.dateKey];
    if (!g || g.celebrated) return;
    commit({ ...cur, games: { ...cur.games, [d.dateKey]: { ...g, celebrated: true } } });
  }, [commit]);

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
      setOverride: (key, ids) => {
        const next = { ...overrides };
        if (ids && ids.length) next[key] = ids;
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
        delete games[key];
        delete history[key];
        commit({ ...cur, games, history });
      },
      autoplay: (mode) => {
        const d = dailyRef.current;
        if (!d) return;
        let p = profileRef.current;
        for (let i = 0; i < d.prompts.length; i++) {
          if (getGame(p, d).status === 'done') break;
          const now = Date.now();
          p = startRound(p, d, now);
          const prompt = d.prompts[i];
          const pick = mode === 'rarest' ? rarestEntry(prompt) : prompt.entries.reduce((a, b) => (b.score < a.score ? b : a));
          p = submitAnswer(p, d, pick.name, now + 500).profile;
        }
        commit(p);
      },
    }),
    [overrides, forcedDate, commit],
  );

  return { ready, profile, today, dateKey, daily, game, stats, streak, view, setView, start, submit, skip, expire, markCelebrated, dismissHelp, admin };
}

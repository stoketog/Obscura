'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DailySet, GameState, GuessRecord, PlayerProfile } from '@/lib/types';
import { playerRepository, emptyProfile } from '@/lib/storage';
import { toDateKey } from '@/lib/dates';
import { ENDLESS_DIVES, asPlayed, getDaily, getEndlessDive, imageForDay, type DayOf } from '@/lib/daily';
import { PROMPT_INDEX, loadPrompts, type PromptMeta } from '@/lib/library';
import { deriveStats, effectiveStreak, expireRound, getGame, skipRound, startRound, submitAnswer, submitGuess, currentRoundIndex, type Stats, type SubmitOutcome } from '@/lib/game';
import { ADMIN_ENABLED } from '@/lib/config';
import { logUnrecognised, loadForcedDate, loadOverrides, saveForcedDate, saveOverrides, type OverrideMap } from '@/lib/admin';
import { rarestEntry } from '@/lib/parse';

export type View = 'home' | 'play';

export interface EndlessDive {
  dive: number;
  status: 'new' | 'playing' | 'done';
  /** Rounds finished so far. */
  rounds: number;
  points: number;
}

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
  /** The day being shown, known straight away (prompts without their answers). */
  plan: DayOf<PromptMeta> | null;
  /** The same day with every prompt's answers loaded; null while they download. */
  daily: DailySet | null;
  /** True if the answers could not be downloaded (offline, say). */
  loadError: boolean;
  retryLoad: () => void;
  /** The past day being replayed from the archive, or null. */
  archiveDate: string | null;
  /** Open a past day: plays it, or shows its result if it is finished. Never touches the streak. */
  openArchive: (dateKey: string) => void;
  /** Record that the player has been shown these badges. */
  markBadgesSeen: (ids: string[]) => void;
  game: GameState | null;
  stats: Stats;
  streak: number;
  view: View;
  setView: (v: View) => void;
  /** The endless dive being played (1, 2, …), or null when playing the daily. */
  endless: number | null;
  /** Open an endless dive: starts it, or shows its result if it is finished. */
  openEndless: (dive: number) => void;
  endlessDives: EndlessDive[];
  /** Start the timer on the next round. */
  start: () => void;
  submit: (raw: string) => SubmitResult;
  skip: () => boolean;
  /** Called when the countdown reaches zero. Returns true if that closed the day. */
  expire: () => boolean;
  /** The one guess at the photograph (empty text passes). Null if it is not allowed now. */
  guess: (raw: string) => GuessRecord | null;
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
    /** Undo the final guess for the day being played, so it can be tried again. */
    resetGuess: () => void;
  };
}

export function useObscura(): ObscuraApi {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [today, setToday] = useState(() => toDateKey(new Date()));
  const [view, setViewRaw] = useState<View>('home');
  const [endless, setEndless] = useState<number | null>(null);
  const [archiveDate, setArchiveDate] = useState<string | null>(null);
  // Going home always returns to the daily.
  const setView = useCallback((v: View) => {
    if (v === 'home') {
      setEndless(null);
      setArchiveDate(null);
    }
    setViewRaw(v);
  }, []);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [forcedDate, setForced] = useState<string | null>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Hydrate from storage on the client only (the server render is a neutral shell).
  useEffect(() => {
    const loadedProfile = playerRepository.load();
    // Games saved before photographs were recorded with each game get the photograph they were played with, while
    // the daily deal still matches it.
    const missing = Object.values(loadedProfile.games).filter((g) => !g.imageId);
    if (missing.length) {
      const games = { ...loadedProfile.games };
      for (const g of missing) {
        const dive = g.dateKey.startsWith('endless-') ? Number(g.dateKey.slice(8)) : 0;
        games[g.dateKey] = { ...g, imageId: dive ? getEndlessDive(dive).image.id : imageForDay(g.puzzleNumber - 1).id };
      }
      const next = { ...loadedProfile, games };
      playerRepository.save(next);
      setProfile(next);
    } else setProfile(loadedProfile);
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

  // The day on screen, worked out from the bundled index alone (no answers yet).
  const planRaw = useMemo<DayOf<PromptMeta> | null>(() => {
    if (!ready) return null;
    if (endless) return getEndlessDive(endless);
    const key = archiveDate ?? dateKey;
    const day = getDaily(key, ADMIN_ENABLED ? overrides : undefined);
    return archiveDate ? { ...day, archive: true } : day;
  }, [ready, dateKey, overrides, endless, archiveDate]);
  const saved = planRaw ? profile.games[planRaw.dateKey] : undefined;
  const planned = planRaw ? asPlayed(planRaw, saved, PROMPT_INDEX) : null;
  // A stable identity for the day, so its answers are fetched once, not on every move.
  const planKey = planned ? `${planned.dateKey}|${planned.archive ? 'a' : ''}|${planned.image.id}|${planned.prompts.map((p) => p.id).join(',')}` : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = useMemo(() => planned, [planKey]);

  const [loaded, setLoaded] = useState<{ key: string; set: DailySet } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!plan) return;
    let live = true;
    setLoadError(false);
    loadPrompts(plan.prompts)
      .then((prompts) => live && setLoaded({ key: planKey, set: { ...plan, prompts } }))
      .catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, [plan, planKey, attempt]);
  const retryLoad = useCallback(() => setAttempt((n) => n + 1), []);

  const daily = loaded && loaded.key === planKey ? loaded.set : null;
  const dailyRef = useRef(daily);
  dailyRef.current = daily;

  const game = useMemo(() => (plan ? getGame(profile, plan) : null), [profile, plan]);

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

  const guess = useCallback(
    (raw: string): GuessRecord | null => {
      const d = dailyRef.current;
      if (!d) return null;
      const res = submitGuess(profileRef.current, d, raw);
      if (res.guess) commit(res.profile);
      return res.guess;
    },
    [commit],
  );

  const markCelebrated = useCallback(() => {
    const d = dailyRef.current;
    if (!d) return;
    const cur = profileRef.current;
    const g = cur.games[d.dateKey];
    if (!g || g.celebrated) return;
    commit({ ...cur, games: { ...cur.games, [d.dateKey]: { ...g, celebrated: true } } });
  }, [commit]);

  const openEndless = useCallback((dive: number) => {
    if (dive < 1 || dive > ENDLESS_DIVES) return;
    setArchiveDate(null);
    setEndless(dive);
    setViewRaw('play');
  }, []);

  const openArchive = useCallback((key: string) => {
    setEndless(null);
    setArchiveDate(key);
    setViewRaw('play');
  }, []);

  const markBadgesSeen = useCallback(
    (ids: string[]) => {
      const cur = profileRef.current;
      const seen = new Set(cur.badgesSeen ?? []);
      if (ids.every((id) => seen.has(id))) return;
      ids.forEach((id) => seen.add(id));
      commit({ ...cur, badgesSeen: [...seen] });
    },
    [commit],
  );

  const endlessDives = useMemo<EndlessDive[]>(
    () =>
      !ready
        ? []
        : Array.from({ length: ENDLESS_DIVES }, (_, i) => {
            const g = getGame(profile, getEndlessDive(i + 1));
            const rounds = g.rounds.filter((r) => r.status === 'done').length;
            return { dive: i + 1, status: g.status === 'done' ? 'done' : rounds > 0 || g.rounds.some((r) => r.status === 'active') ? 'playing' : 'new', rounds, points: g.points };
          }),
    [ready, profile],
  );

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
      resetGuess: () => {
        const d = dailyRef.current;
        if (!d) return;
        const cur = profileRef.current;
        const g = cur.games[d.dateKey];
        if (!g?.guess) return;
        const { guess: _drop, ...rest } = g;
        const h = cur.history[d.dateKey];
        const history = h ? { ...cur.history, [d.dateKey]: { ...h, guess: undefined } } : cur.history;
        commit({ ...cur, history, games: { ...cur.games, [d.dateKey]: rest } });
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

  return { ready, profile, today, dateKey, plan, daily, loadError, retryLoad, archiveDate, openArchive, markBadgesSeen, game, stats, streak, view, setView, endless, openEndless, endlessDives, start, submit, skip, expire, guess, markCelebrated, dismissHelp, admin };
}

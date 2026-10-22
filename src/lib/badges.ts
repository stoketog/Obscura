import type { GameState, PlayerProfile } from './types';
import { MAX_POINTS } from './scoring';
import { addDays } from './dates';

/**
 * BADGES
 * ------
 * Small goals beyond the daily score. Every badge is worked out from the saved games alone, so nothing extra has
 * to be stored except which badges the player has already been told about (`profile.badgesSeen`).
 * Daily games, archive days and endless dives all count, except for streaks, which are daily only.
 */
export interface Badge {
  id: string;
  name: string;
  /** How to earn it, shown on locked badges too. */
  how: string;
  earned: (p: PlayerProfile, games: GameState[]) => boolean;
}

const finished = (p: PlayerProfile) => Object.values(p.games).filter((g) => g.status === 'done');
const tierCount = (g: GameState, tier: string) => g.rounds.filter((r) => r.tier === tier).length;
const answeredAll = (g: GameState) => g.rounds.every((r) => r.end === 'answered');
const guessedUnder = (g: GameState, pct: number) => !!g.guess?.correct && g.guess.developed < pct;

/** Longest run of consecutive daily puzzles with a correct guess. */
function namedRun(p: PlayerProfile): number {
  const keys = Object.keys(p.history).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    if (!p.history[k].guess?.correct) {
      run = 0;
      prev = null;
      continue;
    }
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    prev = k;
    best = Math.max(best, run);
  }
  return best;
}

export const BADGES: Badge[] = [
  { id: 'first-light', name: 'First light', how: 'Finish your first day.', earned: (_p, g) => g.length >= 1 },
  { id: 'named', name: 'Named it', how: 'Name a photograph.', earned: (_p, g) => g.some((x) => x.guess?.correct) },
  { id: 'sharp-eye', name: 'Sharp eye', how: 'Name a photograph under 50% developed.', earned: (_p, g) => g.some((x) => guessedUnder(x, 50)) },
  { id: 'pinhole', name: 'Pinhole', how: 'Name a photograph under 20% developed.', earned: (_p, g) => g.some((x) => guessedUnder(x, 20)) },
  { id: 'obscurist', name: 'Obscurist', how: 'Give an Obscure answer.', earned: (_p, g) => g.some((x) => tierCount(x, 'mythic') >= 1) },
  { id: 'deep-cuts', name: 'Deep cuts', how: 'Give three Obscure answers in one day.', earned: (_p, g) => g.some((x) => tierCount(x, 'mythic') >= 3) },
  { id: 'no-blanks', name: 'No blanks', how: 'Answer all seven prompts in a day.', earned: (_p, g) => g.some(answeredAll) },
  { id: 'nothing-common', name: 'Nothing everyday', how: 'Answer all seven prompts without an Everyday answer.', earned: (_p, g) => g.some((x) => answeredAll(x) && tierCount(x, 'everyday') === 0) },
  { id: 'full-exposure', name: 'Full exposure', how: `Develop a photograph fully (${MAX_POINTS} points).`, earned: (_p, g) => g.some((x) => (x.outcome?.developed ?? 0) >= 100) },
  { id: 'streak-3', name: 'Three in a row', how: 'Reach a 3-day streak.', earned: (p) => p.longestStreak >= 3 },
  { id: 'streak-7', name: 'A week in the dark', how: 'Reach a 7-day streak.', earned: (p) => p.longestStreak >= 7 },
  { id: 'streak-30', name: 'Regular', how: 'Reach a 30-day streak.', earned: (p) => p.longestStreak >= 30 },
  { id: 'streak-100', name: 'Resident', how: 'Reach a 100-day streak.', earned: (p) => p.longestStreak >= 100 },
  { id: 'named-run', name: 'Seen it all', how: 'Name the photograph seven days running.', earned: (p) => namedRun(p) >= 7 },
  { id: 'archivist', name: 'Archivist', how: 'Finish 10 days from the archive.', earned: (_p, g) => g.filter((x) => x.archive).length >= 10 },
  { id: 'collector', name: 'Collector', how: 'Have 25 photographs in your Darkroom.', earned: (_p, g) => g.filter((x) => x.guess).length >= 25 },
];

export function earnedBadges(p: PlayerProfile): Badge[] {
  const games = finished(p);
  return BADGES.filter((b) => b.earned(p, games));
}

/** Badges earned but not yet shown to the player. */
export function unseenBadges(p: PlayerProfile): Badge[] {
  const seen = new Set(p.badgesSeen ?? []);
  return earnedBadges(p).filter((b) => !seen.has(b.id));
}

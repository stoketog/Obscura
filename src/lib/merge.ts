import type { GameState, HistoryEntry, PlayerProfile } from './types';

/**
 * Two copies of a player's saved game (this device and their account) made into one, losing nothing:
 * every day played on either side is kept, the further-along copy of each day wins, and streaks take the side
 * that played most recently.
 */
function progress(g: GameState): number {
  const rounds = g.rounds.filter((r) => r.status === 'done').length;
  return (g.guess ? 100 : 0) + (g.status === 'done' ? 50 : 0) + rounds;
}

function pickGame(a: GameState | undefined, b: GameState | undefined): GameState | undefined {
  if (!a) return b;
  if (!b) return a;
  return progress(b) > progress(a) ? b : a;
}

function pickHistory(a: HistoryEntry | undefined, b: HistoryEntry | undefined): HistoryEntry | undefined {
  if (!a) return b;
  if (!b) return a;
  if (!!b.guess !== !!a.guess) return b.guess ? b : a;
  return b.points > a.points ? b : a;
}

export function mergeProfiles(local: PlayerProfile, remote: PlayerProfile | null): PlayerProfile {
  if (!remote || remote.version !== local.version) return local;
  const games: Record<string, GameState> = {};
  for (const k of new Set([...Object.keys(local.games), ...Object.keys(remote.games ?? {})])) {
    const g = pickGame(local.games[k], remote.games?.[k]);
    if (g) games[k] = g;
  }
  const history: Record<string, HistoryEntry> = {};
  for (const k of new Set([...Object.keys(local.history), ...Object.keys(remote.history ?? {})])) {
    const h = pickHistory(local.history[k], remote.history?.[k]);
    if (h) history[k] = h;
  }
  const lastL = local.lastCompletedDate ?? '';
  const lastR = remote.lastCompletedDate ?? '';
  const lead = lastR > lastL ? remote : lastL > lastR ? local : remote.currentStreak > local.currentStreak ? remote : local;
  return {
    ...local,
    games,
    history,
    lastCompletedDate: lead.lastCompletedDate,
    currentStreak: lead.currentStreak,
    longestStreak: Math.max(local.longestStreak, remote.longestStreak ?? 0),
    freezes: lead.freezes ?? local.freezes,
    frozenDates: [...new Set([...(local.frozenDates ?? []), ...(remote.frozenDates ?? [])])].sort(),
    badgesSeen: [...new Set([...(local.badgesSeen ?? []), ...(remote.badgesSeen ?? [])])],
    seenHelp: local.seenHelp || !!remote.seenHelp,
  };
}

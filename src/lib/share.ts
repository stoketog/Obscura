import type { DailySet, GameState } from './types';
import { tierById } from './scoring';
import { dayTotal } from './game';

/** Spoiler-free: how developed the photograph was, whether the guess landed, one square per prompt. Never an answer. */
export function buildShareText(game: GameState, daily: DailySet, streak: number, link = ''): string {
  const out = game.outcome!;
  const row = out.tiers.map((t) => (t ? tierById(t).square : '▫️')).join('');
  const title = daily.endless ? `Obscura · Endless dive ${daily.endless}` : `Obscura No. ${daily.number}${daily.archive ? ' (archive)' : ''}`;
  const guess = game.guess;
  const line = !guess
    ? `Photograph ${out.developed}% developed`
    : guess.correct
      ? `Named the photograph at ${guess.developed}% developed ✓${guess.early ? ` (after prompt ${guess.afterRound})` : ''}`
      : `Photograph ${out.developed}% developed · guess missed${guess.early ? ` (guessed after prompt ${guess.afterRound})` : ''}`;
  const lines = [title, line, row, `${dayTotal(game)} points`];
  if (streak > 1 && !daily.endless && !daily.archive) lines.push(`${streak} day streak`);
  if (link) lines.push(link);
  return lines.join('\n');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

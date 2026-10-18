import type { DailySet, GameState } from './types';
import { STAGES } from '@/data/stages';
import { MAX_POINTS, tierById } from './scoring';

/** Spoiler-free: one creature per prompt showing how deep you went, never the answers. */
export function buildShareText(game: GameState, daily: DailySet, streak: number): string {
  const out = game.outcome!;
  const row = out.tiers.map((t) => (t ? tierById(t).emoji : '⚫')).join(' ');
  const lines = [`OBSCURA #${String(daily.number).padStart(3, '0')}`, '', row, '', `${out.points}/${MAX_POINTS} pts · ${STAGES[out.stage].emoji} ${STAGES[out.stage].name}`];
  if (streak > 0) lines.push(`🔥 ${streak} day streak`);
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

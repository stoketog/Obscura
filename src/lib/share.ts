import type { GameState, ResolvedPuzzle } from './types';
import { STAGES } from '@/data/stages';
import { MAX_GUESSES } from './growth';

/** Map a guess's closeness onto the evolutionary ladder (microbe … whale). */
export function emojiForSimilarity(similarity: number, correct: boolean): string {
  if (correct) return '🐋';
  const top = STAGES.length - 3; // never use the whale / mythic for a miss
  const idx = Math.min(top, Math.floor((similarity / 100) * (top + 1)));
  return STAGES[idx].emoji;
}

export function obscurityBar(score: number, cells = 10): string {
  const filled = Math.round((score / 100) * cells);
  return '█'.repeat(filled) + '░'.repeat(cells - filled);
}

/** Spoiler-free: shows closeness per guess and the obscurity score, never the answer. */
export function buildShareText(game: GameState, puzzle: ResolvedPuzzle, streak: number): string {
  const out = game.outcome!;
  const path = game.guesses.map((g) => emojiForSimilarity(g.similarity, g.correct)).join(' → ');
  const lines = [`OBSCURA #${String(puzzle.number).padStart(3, '0')}`, '', path];
  if (out.solved) {
    lines.push(``, `Obscurity: ${obscurityBar(out.obscurity)} ${out.obscurity}%`);
    lines.push(`Guesses: ${out.guessesUsed}/${MAX_GUESSES}`);
    if (out.stageAfter > out.stageBefore) {
      lines.push(`Evolved: ${STAGES[out.stageBefore].emoji} → ${STAGES[out.stageAfter].emoji}`);
    }
  } else {
    lines.push(``, `Obscurity: ${obscurityBar(0)} unsolved`);
    lines.push(`Guesses: X/${MAX_GUESSES}`);
  }
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

import type { AnswerEntry, Prompt } from './types';
import { levenshtein, normalize } from './text';

/**
 * ANSWER MATCHING
 * ---------------
 * Players type free text, so matching is forgiving:
 *   1. exact, ignoring case, accents, punctuation, spacing and a leading "the/a/an"
 *   2. simple plurals ("anchovy" / "anchovies", "emu" / "emus")
 *   3. a small typo allowance on longer answers ("gorgonzla" → Gorgonzola)
 */

export type MatchResult =
  | { kind: 'empty' }
  | { kind: 'hit'; entry: AnswerEntry; fuzzy: boolean }
  | { kind: 'miss'; near?: AnswerEntry };

/** Every spelling we treat as the same thing. */
function variants(text: string): string[] {
  const out = new Set<string>([text, text.replace(/ /g, '')]);
  for (const t of [text, text.replace(/ /g, '')]) {
    if (t.endsWith('ies') && t.length > 4) out.add(t.slice(0, -3) + 'y');
    if (t.endsWith('es') && t.length > 4) out.add(t.slice(0, -2));
    if (t.endsWith('s') && t.length > 3) out.add(t.slice(0, -1));
  }
  return [...out];
}

interface Index {
  exact: Map<string, AnswerEntry>;
  /** [normalised spelling, entry] for fuzzy comparison. */
  names: Array<[string, AnswerEntry]>;
}

const indexCache = new WeakMap<Prompt, Index>();

function indexFor(prompt: Prompt): Index {
  let idx = indexCache.get(prompt);
  if (idx) return idx;
  const exact = new Map<string, AnswerEntry>();
  const names: Array<[string, AnswerEntry]> = [];
  for (const e of prompt.entries) {
    for (const spelling of [e.name, ...e.aliases]) {
      const n = normalize(spelling);
      if (!n) continue;
      names.push([n, e]);
      for (const v of variants(n)) if (!exact.has(v)) exact.set(v, e);
    }
  }
  idx = { exact, names };
  indexCache.set(prompt, idx);
  return idx;
}

function allowedDistance(len: number): number {
  if (len >= 9) return 2;
  if (len >= 5) return 1;
  return 0;
}

export function matchAnswer(prompt: Prompt, raw: string): MatchResult {
  const text = normalize(raw);
  if (!text) return { kind: 'empty' };
  const idx = indexFor(prompt);

  for (const v of variants(text)) {
    const hit = idx.exact.get(v);
    if (hit) return { kind: 'hit', entry: hit, fuzzy: false };
  }

  // Typo allowance. Only accept when exactly one entry is the clear best match.
  const maxD = allowedDistance(text.length);
  let best: { d: number; entry: AnswerEntry } | null = null;
  let tie = false;
  let closest: { d: number; entry: AnswerEntry } | null = null;
  for (const [n, entry] of idx.names) {
    if (Math.abs(n.length - text.length) > 2) continue;
    const d = levenshtein(text, n);
    if (!closest || d < closest.d) closest = { d, entry };
    if (d <= maxD) {
      if (!best || d < best.d) {
        best = { d, entry };
        tie = false;
      } else if (d === best.d && entry !== best.entry) {
        tie = true;
      }
    }
  }
  if (best && !tie) return { kind: 'hit', entry: best.entry, fuzzy: true };
  if (closest && closest.d <= 2 && text.length >= 4) return { kind: 'miss', near: closest.entry };
  return { kind: 'miss' };
}

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

/** The number at the end of a name ("world war 2" → 2, "henry viii" → 8, "toy story" → none), for typo checks. */
const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12 };
const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function numberTag(s: string): number | null {
  const last = s.split(' ').at(-1) ?? '';
  if (/^\d+$/.test(last)) return Number(last);
  if (s.includes(' ') && ROMAN[last] !== undefined) return ROMAN[last];
  if (s.includes(' ') && WORDS[last] !== undefined) return WORDS[last];
  return null;
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
  const num = numberTag(text);
  for (const [n, entry] of idx.names) {
    if (Math.abs(n.length - text.length) > 2) continue;
    // "World War 2" is not a typo of "World War I", nor "Rocky III" of "Rocky II".
    if (num !== numberTag(n)) continue;
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

  // Job titles are endless ("diesel mechanic", "HGV technician"): a specific kind of a job on the list counts,
  // as an Everyday answer, so it is never worth inventing one.
  const compound = compoundJob(prompt, raw, text);
  if (compound) return { kind: 'hit', entry: compound, fuzzy: false };

  if (closest && closest.d <= 2 && text.length >= 4) return { kind: 'miss', near: closest.entry };
  return { kind: 'miss' };
}

/** The last word of a job title that makes "<anything sensible> <word>" a job. */
const JOB_HEADS = new Set(
  ('mechanic technician engineer driver nurse manager assistant operator officer worker inspector analyst consultant designer ' +
    'developer scientist teacher surveyor fitter installer cleaner specialist coordinator supervisor administrator therapist ' +
    'instructor apprentice technologist agent advisor adviser clerk planner researcher producer director writer editor artist ' +
    'maker builder repairer porter attendant guard keeper farmer tutor coach trainer salesman executive controller estimator ' +
    'buyer dealer broker chef cook doctor surgeon lecturer professor scientist labourer laborer operative machinist welder ' +
    'electrician plumber carpenter joiner gardener photographer journalist reporter presenter accountant economist lawyer solicitor')
    .split(' '),
);

function compoundJob(prompt: Prompt, raw: string, text: string): AnswerEntry | null {
  if (prompt.id !== 'job') return null;
  const words = text.split(' ').filter(Boolean);
  if (words.length < 2 || words.length > 4) return null;
  const head = words[words.length - 1].replace(/s$/, '');
  if (!JOB_HEADS.has(head)) return null;
  if (!words.slice(0, -1).every((w) => /^[a-z0-9]{2,}$/.test(w) && !/^\d+$/.test(w))) return null;
  const name = raw.trim().replace(/\s+/g, ' ').replace(/^(\p{Ll})/u, (c) => c.toUpperCase());
  return { name, score: 10, aliases: [] };
}

import type { PromptSeed } from '@/lib/types';
import { normalize } from '@/lib/text';

/**
 * EXTRA ANSWERS
 * -------------
 * The deep end of each prompt's answer list, kept apart from the hand-tuned core in the files above so the core
 * stays readable. Two ways to write them:
 *
 *   ExtraAnswers   { 'cheese': ['Bitto|82', 'Crescenza|64|stracchino'] }       same 'Name|score|alias;alias' as the core
 *   TieredExtras   { 'cheese': { u: ['Halloumi'], r: ['Crescenza|stracchino'], m: ['Bitto'] } }
 *                  u = Uncommon, r = Rare, m = Mythic; each entry is 'Name' or 'Name|alias;alias'.
 *
 * Extras only ever widen a prompt: anything already accepted (by name or alias) is skipped, and scores are kept
 * between 18 and 91, so an extra is never an Everyday answer (at most 8 per prompt) and never one of the one or two
 * Obscure answers each prompt has.
 *
 * For prompts about people, an extra also accepts the surname on its own ("Haaland"), as long as no other answer on
 * that prompt shares it.
 */
export type ExtraAnswers = Record<string, string[]>;
export type TieredExtras = Record<string, { u?: string[]; r?: string[]; m?: string[] }>;

const MIN_EXTRA = 18;
const MAX_EXTRA = 91;
/** Representative scores for each tier block (see TIERS in src/lib/scoring.ts). */
export const TIER_SCORE = { u: 28, r: 50, m: 74 } as const;

/** Prompts whose answers are people, where a lone surname is accepted. */
const PEOPLE = new Set([
  'footballer', 'actor', 'actress', 'solo-singer', 'novelist', 'painter', 'poet', 'composer', 'scientist', 'inventor',
  'philosopher', 'explorer', 'film-director', 'golfer', 'tennis-player', 'f1-driver', 'us-president', 'uk-prime-minister',
  'harry-potter-character', 'star-wars-character', 'simpsons-character', 'british-monarch', 'roman-emperor',
]);
const PARTICLES = new Set(['de', 'da', 'di', 'van', 'von', 'der', 'den', 'del', 'la', 'le', 'du', 'dos', 'das', 'jr', 'sr', 'ii', 'iii']);

/** Turn tier blocks into the 'Name|score|aliases' strings the rest of the game reads. */
export function fromTiers(tiered: TieredExtras): ExtraAnswers {
  const out: ExtraAnswers = {};
  for (const [id, blocks] of Object.entries(tiered)) {
    const list: string[] = [];
    for (const tier of ['u', 'r', 'm'] as const) {
      for (const raw of blocks[tier] ?? []) {
        const [name, aliases] = raw.split('|');
        if (!name?.trim()) continue;
        list.push(aliases ? `${name.trim()}|${TIER_SCORE[tier]}|${aliases}` : `${name.trim()}|${TIER_SCORE[tier]}`);
      }
    }
    out[id] = list;
  }
  return out;
}

/** The forms answer matching treats as one (spacing and simple plurals), so two answers never share a spelling. */
function keys(spelling: string): string[] {
  const t = normalize(spelling).replace(/ /g, '');
  if (!t) return [];
  const out = new Set([t]);
  if (t.endsWith('ies') && t.length > 4) out.add(t.slice(0, -3) + 'y');
  if (t.endsWith('es') && t.length > 4) out.add(t.slice(0, -2));
  if (t.endsWith('s') && t.length > 3) out.add(t.slice(0, -1));
  return [...out];
}

function spellings(raw: string): string[] {
  const [name, , aliases] = raw.split('|');
  return [name, ...(aliases ? aliases.split(';') : [])].map((s) => normalize(s)).filter(Boolean);
}

function clampScore(raw: string): string {
  const parts = raw.split('|');
  const n = Math.round(Number(parts[1]));
  parts[1] = String(Math.min(MAX_EXTRA, Math.max(MIN_EXTRA, Number.isFinite(n) ? n : 60)));
  return parts.join('|');
}

/** "Erling Haaland" → "haaland"; "Vincent van Gogh" → "van gogh". Null when the name is a single word. */
function surnameOf(name: string): string | null {
  const words = normalize(name.replace(/\([^)]*\)/g, ' ')).split(' ').filter(Boolean);
  if (words.length < 2) return null;
  let i = words.length - 1;
  while (i > 0 && PARTICLES.has(words[i])) i--;
  let start = i;
  while (start > 1 && PARTICLES.has(words[start - 1])) start--;
  const s = words.slice(start, i + 1).join(' ');
  return s.replace(/ /g, '').length >= 4 ? s : null;
}

export function withExtras(seeds: PromptSeed[], extras: ExtraAnswers): PromptSeed[] {
  return seeds.map((seed) => {
    const more = extras[seed.id];
    if (!more?.length) return seed;
    const taken = new Set<string>();
    for (const a of seed.answers) for (const s of spellings(a)) for (const k of keys(s)) taken.add(k);
    const isTaken = (spelling: string) => keys(spelling).some((k) => taken.has(k));
    const take = (spelling: string) => keys(spelling).forEach((k) => taken.add(k));
    const added: string[][] = [];
    for (const raw of more) {
      const names = spellings(raw);
      if (!names.length || isTaken(names[0])) continue;
      // Drop aliases another answer already owns, so a spelling never points at two answers.
      const [name, score, aliases] = clampScore(raw).split('|');
      const ownAliases = (aliases ? aliases.split(';') : []).map((a) => a.trim()).filter((a) => {
        if (!normalize(a) || isTaken(a)) return false;
        take(a);
        return true;
      });
      take(name);
      added.push([name, score, ...ownAliases]);
    }
    if (PEOPLE.has(seed.id)) {
      // A surname is only accepted when exactly one answer on the prompt has it and nothing else already uses it.
      const count = new Map<string, number>();
      for (const a of [...seed.answers.map((r) => r.split('|')[0]), ...added.map((x) => x[0])]) {
        const s = surnameOf(a);
        if (s) count.set(s, (count.get(s) ?? 0) + 1);
      }
      for (const entry of added) {
        const s = surnameOf(entry[0]);
        if (s && count.get(s) === 1 && !isTaken(s)) {
          entry.push(s);
          take(s);
        }
      }
    }
    if (!added.length) return seed;
    const lines = added.map(([name, score, ...aliases]) => (aliases.length ? `${name}|${score}|${aliases.join(';')}` : `${name}|${score}`));
    return { ...seed, answers: [...seed.answers, ...lines] };
  });
}

/**
 * PUZZLE PROMPTS
 * --------------
 * Krillion-style prompts with a twist ("Name a country with exactly 7 letters", "...whose only vowel is A"),
 * derived from the big base lists so they inherit every answer and alias. For each prompt:
 *   - an answer counts if one of its spellings meets the rule; that spelling becomes the name, and only spellings
 *     that meet the rule are accepted (typing "America" for a no-A country doesn't count). Acronyms never qualify.
 *   - rarity is re-ranked inside the prompt, using the base scores for order: the most common eight are Everyday,
 *     the rarest one or two are Obscure, and the rest spread across Uncommon, Rare and Mythic.
 * Writes src/data/prompts/puzzles.ts. Run after the base lists change:
 *   npx tsx --tsconfig tsconfig.json scripts/answers/puzzles.ts
 */
import { writeFileSync } from 'node:fs';
import { getPrompts } from '@/lib/prompts';
import type { AnswerEntry, PromptGroup, PromptSeed } from '@/lib/types';

const BASE = Object.fromEntries(getPrompts().map((p) => [p.id, p]));
const letters = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const vowels = (s: string) => letters(s).replace(/[^aeiou]/g, '');
const surname = (s: string) => letters(s.trim().split(/\s+/).at(-1) ?? '');
const words = (s: string) => s.trim().split(/[\s-]+/).filter(Boolean).length;
const acronym = (s: string) => /^[A-Z0-9.&]{2,6}$/.test(s.replace(/\s/g, ''));
/** Nicknames that are fine for the base prompt but feel like cheating on a letter rule. */
const BLOCK = new Set(['america', 'holland', 'burma']);
const UPPER = new Set(['dr', 'uk', 'us', 'uae', 'usa', 'drc', 'ii', 'iii']);
const SMALL = new Set(['of', 'the', 'and', 'de', 'la', 'del', 'da', 'di', 'du', 'von', 'van', 'y']);
/** Aliases are stored in lower case; give one a proper name's capitals when it has to be shown. */
function titleCase(s: string): string {
  return s
    .split(/(\s+|-)/)
    .map((w, i) => {
      const k = w.toLowerCase();
      if (UPPER.has(k)) return k.toUpperCase();
      if (i > 0 && SMALL.has(k)) return k;
      return w.replace(/^(\p{L})/u, (c) => c.toUpperCase()).replace(/(['’])(\p{L})(\p{L}{2,})/u, (_m, q, a, b) => q + a.toUpperCase() + b);
    })
    .join('');
}

interface Spec {
  id: string;
  group: PromptGroup;
  text: string;
  category: string;
  from: string[];
  rule: (spelling: string) => boolean;
  /** Use only the main name, never aliases (people prompts, whose aliases include bare surnames). */
  canonicalOnly?: boolean;
}

const ANIMALS = ['mammal', 'bird', 'fish', 'bug', 'reptile-amphibian', 'sea-creature'];
const CITIES = ['capital-city', 'european-city', 'asian-city'];

const SPECS: Spec[] = [
  // Geography
  { id: 'country-5-or-fewer', group: 'geography', text: 'Name a country with five letters or fewer', category: 'Countries · 5 letters or fewer', from: ['country'], rule: (s) => letters(s).length <= 5 },
  { id: 'country-7-letters', group: 'geography', text: 'Name a country with exactly seven letters (spaces don’t count)', category: 'Countries · 7 letters', from: ['country'], rule: (s) => letters(s).length === 7 },
  { id: 'country-no-a', group: 'geography', text: 'Name a country without the letter A', category: 'Countries · no letter A', from: ['country'], rule: (s) => !letters(s).includes('a') },
  { id: 'country-3-vowels', group: 'geography', text: 'Name a country with exactly three vowels (A, E, I, O, U)', category: 'Countries · 3 vowels', from: ['country'], rule: (s) => vowels(s).length === 3 },
  { id: 'place-one-vowel', group: 'geography', text: 'Name a country or capital with only one vowel, like Panama', category: 'Places · one vowel only', from: ['country', 'capital-city'], rule: (s) => new Set(vowels(s)).size === 1 && vowels(s).length >= 2 },
  { id: 'country-ends-ia', group: 'geography', text: 'Name a country ending in “-ia”', category: 'Countries · ending -ia', from: ['country'], rule: (s) => letters(s).endsWith('ia') },
  { id: 'country-two-words', group: 'geography', text: 'Name a country with two or more words in its name', category: 'Countries · two words or more', from: ['country'], rule: (s) => words(s) >= 2 },
  { id: 'country-starts-vowel', group: 'geography', text: 'Name a country beginning with a vowel', category: 'Countries · first letter a vowel', from: ['country'], rule: (s) => /^[aeiou]/.test(letters(s)) },
  { id: 'place-same-start-end', group: 'geography', text: 'Name a country or capital starting and ending with the same letter', category: 'Places · same first and last letter', from: ['country', 'capital-city'], rule: (s) => { const l = letters(s); return l.length > 2 && l[0] === l.at(-1); } },
  { id: 'city-starts-b', group: 'geography', text: 'Name a city beginning with B', category: 'Cities · starting with B', from: CITIES, rule: (s) => letters(s)[0] === 'b' },
  { id: 'city-ends-a', group: 'geography', text: 'Name a city ending in A', category: 'Cities · ending in A', from: CITIES, rule: (s) => letters(s).endsWith('a') },
  { id: 'capital-6-letters', group: 'geography', text: 'Name a capital city with exactly six letters', category: 'Capitals · 6 letters', from: ['capital-city'], rule: (s) => letters(s).length === 6 },
  { id: 'river-4-letters', group: 'geography', text: 'Name a river with a four-letter name', category: 'Rivers · 4 letters', from: ['river'], rule: (s) => letters(s.replace(/^(river|the)\s+/i, '').replace(/\s+river$/i, '')).length === 4 },
  { id: 'island-starts-s', group: 'geography', text: 'Name an island beginning with S', category: 'Islands · starting with S', from: ['island'], rule: (s) => letters(s)[0] === 's' },
  // Nature
  { id: 'animal-4-letters', group: 'nature', text: 'Name an animal with a four-letter name', category: 'Animals · 4 letters', from: ANIMALS, rule: (s) => letters(s).length === 4 },
  { id: 'animal-5-letters', group: 'nature', text: 'Name an animal with a five-letter name', category: 'Animals · 5 letters', from: ANIMALS, rule: (s) => letters(s).length === 5 },
  { id: 'animal-z-or-x', group: 'nature', text: 'Name an animal with a Z or an X in its name', category: 'Animals · with Z or X', from: [...ANIMALS, 'dinosaur'], rule: (s) => /[zx]/.test(letters(s)) },
  { id: 'animal-double-letter', group: 'nature', text: 'Name a one-word animal with a double letter, like Rabbit', category: 'Animals · double letter', from: ANIMALS, rule: (s) => words(s) === 1 && /(.)\1/.test(letters(s)) },
  { id: 'mammal-starts-b', group: 'nature', text: 'Name a mammal beginning with B', category: 'Mammals · starting with B', from: ['mammal'], rule: (s) => letters(s)[0] === 'b' },
  { id: 'bird-6-letters', group: 'nature', text: 'Name a bird with a six-letter, one-word name', category: 'Birds · 6 letters', from: ['bird'], rule: (s) => words(s) === 1 && letters(s).length === 6 },
  { id: 'flower-ends-a', group: 'nature', text: 'Name a flower or plant ending in A', category: 'Flowers · ending in A', from: ['flower'], rule: (s) => letters(s).endsWith('a') },
  { id: 'tree-short', group: 'nature', text: 'Name a tree with five letters or fewer', category: 'Trees · 5 letters or fewer', from: ['tree'], rule: (s) => letters(s).length <= 5 },
  // Food
  { id: 'fruit-double-letter', group: 'food', text: 'Name a fruit with a double letter, like Apple', category: 'Fruit · double letter', from: ['fruit'], rule: (s) => /(.)\1/.test(letters(s)) },
  { id: 'cheese-ends-o', group: 'food', text: 'Name a cheese ending in O', category: 'Cheese · ending in O', from: ['cheese'], rule: (s) => letters(s).endsWith('o') },
  // General
  { id: 'colour-5-letters', group: 'general', text: 'Name a colour with exactly five letters', category: 'Colours · 5 letters', from: ['colour'], rule: (s) => letters(s).length === 5 },
  { id: 'colour-starts-b', group: 'general', text: 'Name a colour beginning with B', category: 'Colours · starting with B', from: ['colour'], rule: (s) => letters(s)[0] === 'b' },
  { id: 'job-starts-p', group: 'general', text: 'Name a job beginning with P', category: 'Jobs · starting with P', from: ['job'], rule: (s) => letters(s)[0] === 'p' },
  { id: 'clothing-starts-s', group: 'general', text: 'Name an item of clothing beginning with S', category: 'Clothing · starting with S', from: ['clothing'], rule: (s) => letters(s)[0] === 's' },
  { id: 'car-brand-vowel', group: 'general', text: 'Name a car manufacturer beginning with a vowel', category: 'Car makers · first letter a vowel', from: ['car-brand'], rule: (s) => /^[aeiou]/.test(letters(s)) },
  { id: 'tech-company-vowel', group: 'general', text: 'Name a technology company beginning with a vowel', category: 'Tech companies · first letter a vowel', from: ['tech-company'], rule: (s) => /^[aeiou]/.test(letters(s)) },
  { id: 'language-ish-ese', group: 'general', text: 'Name a language ending in “-ish” or “-ese”', category: 'Languages · -ish or -ese', from: ['language'], rule: (s) => /(ish|ese)$/.test(letters(s)) },
  // Science
  { id: 'element-ium', group: 'science', text: 'Name a chemical element ending in “-ium”', category: 'Elements · ending -ium', from: ['element'], rule: (s) => letters(s).endsWith('ium') },
  { id: 'scientist-vowel', group: 'science', text: 'Name a scientist or inventor whose surname begins with a vowel', category: 'Scientists · surname starts with a vowel', from: ['scientist', 'inventor'], rule: (s) => /^[aeiou]/.test(surname(s)), canonicalOnly: true },
  // Sport
  { id: 'footballer-m', group: 'sport', text: 'Name a footballer whose surname begins with M', category: 'Footballers · surname starts with M', from: ['footballer'], rule: (s) => surname(s)[0] === 'm', canonicalOnly: true },
  { id: 'footballer-ends-o', group: 'sport', text: 'Name a footballer whose surname (or nickname) ends in O', category: 'Footballers · ending in O', from: ['footballer'], rule: (s) => surname(s).endsWith('o'), canonicalOnly: true },
  // Screen
  { id: 'actor-surname-s', group: 'screen', text: 'Name an actor or actress whose surname begins with S', category: 'Actors · surname starts with S', from: ['actor', 'actress'], rule: (s) => words(s) >= 2 && surname(s)[0] === 's', canonicalOnly: true },
  { id: 'pokemon-5-letters', group: 'screen', text: 'Name a Pokémon with exactly five letters', category: 'Pokémon · 5 letters', from: ['pokemon'], rule: (s) => letters(s).length === 5 },
  { id: 'pokemon-vowel', group: 'screen', text: 'Name a Pokémon beginning with a vowel', category: 'Pokémon · first letter a vowel', from: ['pokemon'], rule: (s) => /^[aeiou]/.test(letters(s)) },
  { id: 'disney-one-word', group: 'screen', text: 'Name a Disney animated film with a one-word title', category: 'Disney films · one-word titles', from: ['disney-film'], rule: (s) => words(s) === 1 },
  // Music and arts
  { id: 'band-the', group: 'music', text: 'Name a band whose name starts with “The”', category: 'Bands · starting with The', from: ['band'], rule: (s) => /^the\s/i.test(s.trim()) },
  { id: 'singer-one-name', group: 'music', text: 'Name a singer known by just one name, like Adele', category: 'Singers · one name', from: ['solo-singer'], rule: (s) => words(s) === 1 && !/^the$/i.test(s), canonicalOnly: true },
  { id: 'painter-ends-vowel', group: 'arts', text: 'Name a painter whose surname ends in a vowel', category: 'Painters · surname ends in a vowel', from: ['painter'], rule: (s) => /[aeiou]$/.test(surname(s)), canonicalOnly: true },
  // History
  { id: 'god-ends-a', group: 'history', text: 'Name a god or goddess whose name ends in A', category: 'Gods · ending in A', from: ['ancient-god'], rule: (s) => letters(s).endsWith('a') },
];

/** Rank-based rarity inside one prompt: eight Everyday, then Uncommon/Rare/Mythic in 30/35/35, the rarest one or two Obscure. */
function rescore(list: Array<{ name: string; aliases: string[]; base: number }>): string[] {
  const sorted = [...list].sort((a, b) => a.base - b.base || a.name.localeCompare(b.name));
  const n = sorted.length;
  const top = n >= 60 ? 2 : 1;
  const everyday = Math.min(8, Math.max(3, Math.round(n * 0.15)));
  const middle = n - everyday - top;
  return sorted.map((e, i) => {
    let score: number;
    if (i < everyday) score = 2 + Math.round((i / Math.max(1, everyday - 1)) * 14);
    else if (i >= n - top) score = 95 + (i - (n - top));
    else {
      const r = (i - everyday) / Math.max(1, middle - 1);
      score = r < 0.3 ? 18 + Math.round((r / 0.3) * 19) : r < 0.65 ? 38 + Math.round(((r - 0.3) / 0.35) * 23) : 62 + Math.round(((r - 0.65) / 0.35) * 29);
    }
    const alias = e.aliases.length ? `|${e.aliases.join(';')}` : '';
    return `${e.name}|${score}${alias}`;
  });
}

const seeds: PromptSeed[] = [];
for (const spec of SPECS) {
  const seen = new Map<string, { name: string; aliases: string[]; base: number }>();
  const taken = new Set<string>();
  for (const id of spec.from) {
    const base = BASE[id];
    if (!base) throw new Error(`${spec.id}: unknown base prompt ${id}`);
    for (const e of base.entries as AnswerEntry[]) {
      const aliases = spec.canonicalOnly ? [] : e.aliases.filter((a) => letters(a).length >= 4 && !BLOCK.has(letters(a)) && !acronym(a));
      const ok = [e.name, ...aliases].filter((s) => (s === e.name || !acronym(s)) && spec.rule(s));
      if (!ok.length) continue;
      const fresh = ok.filter((s) => !taken.has(letters(s)));
      if (!fresh.length) continue;
      const key = letters(fresh[0]);
      const prior = seen.get(key);
      if (prior) {
        prior.base = Math.min(prior.base, e.score);
        continue;
      }
      fresh.forEach((s) => taken.add(letters(s)));
      const display = fresh[0] === e.name ? e.name : titleCase(fresh[0]);
      seen.set(key, { name: display, aliases: fresh.slice(1), base: e.score });
    }
  }
  const list = [...seen.values()];
  if (list.length < 30) throw new Error(`${spec.id} has only ${list.length} answers`);
  seeds.push({ id: spec.id, group: spec.group, text: spec.text, category: spec.category, answers: rescore(list) });
  console.log(String(list.length).padStart(4), spec.id);
}

const body = `import type { PromptSeed } from '@/lib/types';

/** GENERATED by scripts/answers/puzzles.ts from the base prompts. Do not edit by hand. */
export const PUZZLES: PromptSeed[] = ${JSON.stringify(seeds, null, 1)};
`;
writeFileSync('src/data/prompts/puzzles.ts', body);
console.log(`${seeds.length} puzzle prompts`);

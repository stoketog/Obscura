/**
 * PROMPTS FROM THE 2,000-QUESTION SHEET (letter and spelling rules)
 * ------------------------------------------------------------------
 * scripts/answers/csv/questions-2000.csv lists questions like "Name a tree whose name ends with the letter A", each
 * with a sample of valid answers (not complete). For every topic this builds one pool: our full base list(s) for
 * that topic plus every sample answer the sheet gives anywhere for it. Each question's rule is then applied to the
 * pool, so every answer in the pool that fits the rule is accepted, not just the samples.
 *
 * Rarity is ranked inside each question by how well known each answer is (the base lists' scores; a sample answer
 * we didn't already have counts as moderately known): the most common eight are Everyday, the rarest one or two
 * Obscure. A question with fewer than 12 valid answers is kept as a short closed list (marked `closed`, about a
 * third Everyday); one with fewer than 5 is left out (listed when the script runs).
 * The sheet's factual questions ("Name a bird of prey") are written by hand elsewhere.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/answers/csvpool.ts   → src/data/prompts/csvpool.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { getPrompts } from '@/lib/prompts';
import type { PromptGroup, PromptSeed } from '@/lib/types';
import { normalize } from '@/lib/text';
import { matchAnswer } from '@/lib/match';
import { parsePrompt } from '@/lib/parse';

const BASE = Object.fromEntries(getPrompts().map((p) => [p.id, p]));
const letters = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const words = (s: string) => s.trim().split(/[\s-]+/).filter(Boolean).length;
const acronym = (s: string) => /^[A-Z0-9.&]{2,6}$/.test(s.replace(/\s/g, ''));

/** Minimal CSV reader (quoted fields, commas and newlines inside quotes). */
function readCsv(path: string): Record<string, string>[] {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

interface Topic {
  group: PromptGroup;
  /** Base prompts whose answers make up the pool. */
  from: string[];
  /** Short plural label for the result screen. */
  label: string;
  /** Answers in a base list that don't belong to this topic (amphibians among the reptiles, say). */
  exclude?: RegExp;
}

const AMPHIBIAN = /(frog|toad|newt|salamander|axolotl|caecilian|\bolm\b|mudpuppy|waterdog|\bsiren\b|hellbender|amphiuma|\beft\b|ambystom|ichthyostega|ichyostega|tetrapod|labyrinthodont|temnospondyl)/i;
const NOT_INSECT = /^(spider|.*\bspider|scorpion|.*scorpion|tick|.*\btick|mite|.*\bmite|centipede|millipede|woodlouse|woodlice|tarantula|harvestman|slug|snail|worm|earthworm|flatworm|roundworm|tapeworm|leech|.*crab|vinegarroon|solifug.*|camel spider|whip.*|pill bug|sowbug)$/i;
const TERRITORY_CAPITALS = /^(Road Town|West Island|The Valley|St Peter Port|Hamilton|Fort-de-France|Douglas|Stanley|San Juan|Saint-Pierre|Diego Garcia|Plymouth|Flying Fish Cove|Saint-Denis|Gibraltar|Jamestown|Cayenne|Cockburn Town|Saipan|Port-aux-Francais|Charlotte Amalie|Pago Pago|Saint Helier|Noumea|Papeete|Philipsburg|Longyearbyen|Mata Utu|Willemstad|Nuuk|Marigot|Oranjestad|Adamstown|Gustavia|Mariehamn|Alofi|Grytviken|Torshavn|Avarua|El-Aaiun|Hagatna|Mamoudzou|Cape Town|Abidjan|Melekeok)$/;

const TOPICS: Record<string, Topic> = {
  'Dish Or Prepared Food': { group: 'food', from: ['soup', 'dessert'], label: 'Dishes' },
  Sport: { group: 'sport', from: ['sport'], label: 'Sports' },
  Bird: { group: 'nature', from: ['bird'], label: 'Birds' },
  'Musical Instrument': { group: 'music', from: ['instrument'], label: 'Instruments' },
  Fish: { group: 'nature', from: ['fish'], label: 'Fish' },
  'Culinary Vegetable': { group: 'food', from: ['vegetable'], label: 'Vegetables' },
  Tree: { group: 'nature', from: ['tree'], label: 'Trees' },
  'Spice Or Culinary Herb': { group: 'food', from: ['spice'], label: 'Herbs and spices' },
  'Cheese Variety': { group: 'food', from: ['cheese'], label: 'Cheeses' },
  Mammal: { group: 'nature', from: ['mammal'], label: 'Mammals' },
  'Flower Or Flowering Plant': { group: 'nature', from: ['flower'], label: 'Flowers' },
  'Botanical Fruit': { group: 'food', from: ['fruit'], label: 'Fruit' },
  Country: { group: 'geography', from: ['country'], label: 'Countries' },
  Insect: { group: 'nature', from: ['bug'], label: 'Insects', exclude: NOT_INSECT },
  'Marine Animal': { group: 'nature', from: ['sea-creature'], label: 'Sea creatures' },
  'Video Game': { group: 'screen', from: ['video-game'], label: 'Video games' },
  'Bread Or Baked Flatbread': { group: 'food', from: ['bread'], label: 'Breads' },
  Island: { group: 'geography', from: ['island'], label: 'Islands' },
  Reptile: { group: 'nature', from: ['reptile-amphibian'], label: 'Reptiles', exclude: AMPHIBIAN },
  'Board Game': { group: 'general', from: ['boardgame'], label: 'Board games' },
  River: { group: 'geography', from: ['river'], label: 'Rivers' },
  'National Capital City': { group: 'geography', from: ['capital-city'], label: 'Capital cities', exclude: TERRITORY_CAPITALS },
  'Programming Language': { group: 'science', from: ['programming-language'], label: 'Programming languages' },
  'Mountain Or Mountain Peak': { group: 'geography', from: ['mountain'], label: 'Mountains' },
  'Historical Empire, Dynasty Or Kingdom': { group: 'history', from: ['empire'], label: 'Empires and dynasties' },
  'Chemical Element': { group: 'science', from: ['element'], label: 'Elements' },
  'U.S. State': { group: 'geography', from: ['us-state'], label: 'US states', exclude: /^(District of Columbia|Puerto Rico|Guam|US Virgin Islands|American Samoa|Northern Mariana Islands)$/ },
};

/** A question's rule, read from the sheet's wording. Returns the test and a short label, or null if not understood. */
function parseRule(q: string, rule: string): { test: (s: string) => boolean; label: string; key: string } | null {
  const V = 'aeiou';
  let m: RegExpMatchArray | null;
  if ((m = rule.match(/^Has at least (\d+) alphabetic letters/))) { const n = +m[1]; return { test: (s) => letters(s).length >= n, label: `${n}+ letters`, key: `min${n}` }; }
  if ((m = rule.match(/^Has exactly (\d+) alphabetic letters/))) { const n = +m[1]; return { test: (s) => letters(s).length === n, label: `${n} letters`, key: `len${n}` }; }
  if (/^Contains the stated letter/.test(rule) && (m = q.match(/contains the letter ([A-Z])\b/))) { const l = m[1].toLowerCase(); return { test: (s) => letters(s).includes(l), label: `with ${m[1]}`, key: `has-${l}` }; }
  if (/^Starts with the stated letter/.test(rule) && (m = q.match(/(?:starts|begins) with the letter ([A-Z])\b/))) { const l = m[1].toLowerCase(); return { test: (s) => letters(s)[0] === l, label: `starting with ${m[1]}`, key: `starts-${l}` }; }
  if (/^Ends with the stated letter/.test(rule) && (m = q.match(/ends with the letter ([A-Z])\b/))) { const l = m[1].toLowerCase(); return { test: (s) => letters(s).endsWith(l), label: `ending in ${m[1]}`, key: `ends-${l}` }; }
  if ((m = rule.match(/^Name contains both ([A-Z]) and ([A-Z])/))) { const [a, b] = [m[1].toLowerCase(), m[2].toLowerCase()]; return { test: (s) => letters(s).includes(a) && letters(s).includes(b), label: `with ${m[1]} and ${m[2]}`, key: `both-${a}${b}` }; }
  if ((m = rule.match(/^Letter ([A-Z]) appears at least twice/))) { const l = m[1].toLowerCase(); return { test: (s) => letters(s).split(l).length - 1 >= 2, label: `${m[1]} twice`, key: `twice-${l}` }; }
  if ((m = rule.match(/^Name does not contain the letter ([A-Z])/))) { const l = m[1].toLowerCase(); return { test: (s) => !letters(s).includes(l), label: `no ${m[1]}`, key: `no-${l}` }; }
  if (/^Last letter is not A, E, I, O or U/.test(rule)) return { test: (s) => !V.includes(letters(s).slice(-1)), label: 'ending in a consonant', key: 'end-cons' };
  if (/^Last letter is A, E, I, O or U/.test(rule)) return { test: (s) => V.includes(letters(s).slice(-1)), label: 'ending in a vowel', key: 'end-vowel' };
  if (/^First letter is not A, E, I, O or U/.test(rule)) return { test: (s) => !V.includes(letters(s)[0]), label: 'starting with a consonant', key: 'start-cons' };
  if (/^First letter is A, E, I, O or U/.test(rule)) return { test: (s) => V.includes(letters(s)[0]), label: 'starting with a vowel', key: 'start-vowel' };
  if (/^Contains the same letter twice consecutively/.test(rule)) return { test: (s) => /(.)\1/.test(letters(s)), label: 'double letter', key: 'double' };
  if (/^At least one alphabetic letter occurs more than once/.test(rule)) return { test: (s) => new Set(letters(s)).size < letters(s).length, label: 'a repeated letter', key: 'repeat' };
  if (/^Contains at least three vowels/.test(rule)) return { test: (s) => letters(s).replace(/[^aeiou]/g, '').length >= 3, label: '3+ vowels', key: 'vowels3' };
  if (/^Name contains at least three words/.test(rule)) return { test: (s) => words(s) >= 3, label: 'three words or more', key: 'words3' };
  if (/^Name contains at least two words/.test(rule)) return { test: (s) => words(s) >= 2, label: 'two words or more', key: 'words2' };
  if (/^Name contains one word/.test(rule)) return { test: (s) => words(s) === 1, label: 'one word', key: 'words1' };
  return null;
}

function rescore(list: Array<{ name: string; aliases: string[]; base: number; sample?: boolean }>): string[] {
  const key = new Map(list.map((e) => [e, fame(e.name, e.base, e.sample)]));
  const sorted = [...list].sort((a, b) => key.get(a)! - key.get(b)! || a.name.localeCompare(b.name));
  const n = sorted.length;
  const top = n >= 60 ? 2 : 1;
  // a short closed list (five US states contain a V) still needs a spread: about a third Everyday
  const everyday = n < 12 ? Math.max(1, Math.round(n * 0.3)) : Math.min(8, Math.max(3, Math.round(n * 0.15)));
  const middle = n - everyday - top;
  return sorted.map((e, i) => {
    let score: number;
    if (i < everyday) score = 2 + Math.round((i / Math.max(1, everyday - 1)) * 14);
    else if (i >= n - top) score = 95 + (i - (n - top));
    else {
      const r = (i - everyday) / Math.max(1, middle - 1);
      score = r < 0.3 ? 18 + Math.round((r / 0.3) * 19) : r < 0.65 ? 38 + Math.round(((r - 0.3) / 0.35) * 23) : 62 + Math.round(((r - 0.65) / 0.35) * 29);
    }
    return `${e.name}|${score}` + (e.aliases.length ? `|${e.aliases.join(';')}` : '');
  });
}

const rows = readCsv('scripts/answers/csv/questions-2000.csv');

/**
 * How well known a name is, from word frequency in everyday English (wordfreq's Zipf scale, written by
 * scripts/answers/zipf.py into a cache). Multi-word names are discounted, since common words make rare phrases
 * look common ("Syrian bear"). Lower fame key = better known.
 */
const ZIPF_FILE = 'scripts/answers/.zipf.json';
const zipf: Record<string, number> = (() => { try { return JSON.parse(readFileSync(ZIPF_FILE, 'utf8')); } catch { return {}; } })();
const wanted = new Set<string>();
function fame(name: string, base: number, sample = false): number {
  const k = name.toLowerCase();
  if (!(k in zipf)) wanted.add(k);
  // Word frequency only knows words, so a phrase of common words looks common ("Lead tree"): discount phrases hard.
  const n = words(name);
  const z = (zipf[k] ?? 2) - (n > 1 ? 1.2 * (n - 1) : 0);
  // The hand-ranked Everyday answers of a base list stay on top; then the sheet's samples get a strong lift;
  // base score and frequency share the rest.
  return (base < 18 ? base - 100 : base) - 8 * z - (sample ? 25 : 0);
}
const spelling = rows.filter((r) => r.question_type !== 'Factual category');

// One pool per topic: base entries (name, aliases, fame score), then the sheet's sample answers we don't have yet.
type PoolEntry = { name: string; aliases: string[]; base: number; sample?: boolean };
const pools = new Map<string, PoolEntry[]>();
for (const [topic, t] of Object.entries(TOPICS)) {
  const seen = new Set<string>();
  const pool: PoolEntry[] = [];
  for (const id of t.from) {
    for (const e0 of BASE[id].entries) {
      // "Rockstar (language)" → "Rockstar", keeping the full form as a spelling
      const plainName = e0.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
      const e = plainName && plainName !== e0.name ? { ...e0, name: plainName, aliases: [...e0.aliases, e0.name] } : e0;
      if (t.exclude?.test(e.name)) continue;
      const k = letters(e.name);
      if (seen.has(k)) continue;
      const aliases = e.aliases.filter((a) => letters(a).length >= 3 && !acronym(a) && !seen.has(letters(a)));
      [e.name, ...aliases].forEach((s) => seen.add(letters(s)));
      pool.push({ name: e.name, aliases, base: e.score });
    }
  }
  for (const r of rows.filter((x) => x.category === topic)) {
    for (const raw of r.example_answers.split(';')) {
      const s = raw.trim();
      if (!s || seen.has(letters(s)) || t.exclude?.test(s)) continue;
      seen.add(letters(s));
      pool.push({ name: s.replace(/^(\p{Ll})/u, (c) => c.toUpperCase()), aliases: [], base: 55 });
    }
  }
  // The sheet's own samples are its idea of the answers people give: a strong sign an answer is well known.
  const samples = new Set(rows.filter((x) => x.category === topic).flatMap((x) => x.example_answers.split(';').map((a) => letters(a))));
  for (const e of pool) if ([e.name, ...e.aliases].some((x) => samples.has(letters(x)))) e.sample = true;
  pools.set(topic, pool.filter((e) => letters(e.name) !== letters(t.label) && !/^(cheese|fish|tree|bird|flower|bread|sport)$/i.test(e.name)));
}

const article = (s: string) => s.replace(/\b([Aa]) ([aeiouAEIOU])/g, (_m, a, v) => `${a === 'A' ? 'An' : 'an'} ${v}`);
const slug = (s: string) => letters(s.replace(/[^A-Za-z ]/g, ' ')).slice(0, 18);

const seeds: PromptSeed[] = [];
const skipped: string[] = [];
const ids = new Set<string>();
for (const r of spelling) {
  const t = TOPICS[r.category];
  const rule = parseRule(r.question, r.fact_rule);
  if (!t || !rule) { skipped.push(`#${r.question_id} not understood: ${r.question}`); continue; }
  const id = `q-${slug(t.label)}-${rule.key}`;
  if (ids.has(id)) continue; // the sheet repeats a few questions
  // An answer counts if its name or one of its spellings fits; that spelling is shown, and only fitting spellings are accepted.
  const list: PoolEntry[] = [];
  const taken = new Set<string>();
  for (const e of pools.get(r.category)!) {
    const ok = [e.name, ...e.aliases].filter((s) => rule.test(s) && !taken.has(letters(s)));
    if (!ok.length) continue;
    ok.forEach((s) => taken.add(letters(s)));
    const shown = ok[0].replace(/^(\p{Ll})/u, (c) => c.toUpperCase());
    list.push({ name: shown, aliases: ok.slice(1), base: e.base, sample: e.sample });
  }
  // Two answers the game would treat as one ("Conga"/"Congas", "The Quacks of Quedlinburg"/"Quacks of
  // Quedlinburg") become one: the better-known keeps its place; a spelling already claimed is dropped.
  list.sort((a, b) => fame(a.name, a.base, a.sample) - fame(b.name, b.base, b.sample));
  const merged: PoolEntry[] = [];
  const claimed = new Set<string>();
  for (const e of list) {
    const probe = parsePrompt({ id, group: t.group, text: '', category: '', answers: merged.map((m) => `${m.name}|50` + (m.aliases.length ? `|${m.aliases.join(';')}` : '')) });
    const hit = merged.length ? matchAnswer(probe, e.name) : { kind: 'miss' as const };
    if (hit.kind === 'hit' || claimed.has(normalize(e.name))) continue;
    const aliases = e.aliases.filter((a) => !claimed.has(normalize(a)) && normalize(a) !== normalize(e.name));
    [e.name, ...aliases].forEach((x) => claimed.add(normalize(x)));
    merged.push({ ...e, aliases });
  }
  list.length = 0;
  list.push(...merged);
  if (list.length < 5) { skipped.push(`#${r.question_id} only ${list.length} answers: ${r.question}`); continue; }
  ids.add(id);
  let text = article(r.question.replace(/\.$/, '')).replace(/U\.S\. state/g, 'US state').replace('a historical empire, dynasty or kingdom', 'an empire, dynasty or kingdom');
  if (text.length > 70) text = text.replace(' whose name ', ' ').replace('contains the letter', 'with the letter').replace('has exactly', 'with exactly').replace('has at least', 'with at least');
  seeds.push({ id, group: t.group, text, category: `${t.label} · ${rule.label}`, answers: rescore(list), ...(list.length < 12 ? { closed: true } : {}) });
}

const body = `import type { PromptSeed } from '@/lib/types';

/** GENERATED by scripts/answers/csvpool.ts from scripts/answers/csv/questions-2000.csv. Do not edit by hand. */
export const CSVPOOL: PromptSeed[] = ${JSON.stringify(seeds, null, 1)};
`;
writeFileSync('src/data/prompts/csvpool.ts', body);
if (wanted.size) {
  writeFileSync('scripts/answers/.zipf-wanted.json', JSON.stringify([...wanted]));
  console.log(`${wanted.size} names have no word frequency yet: run python3 scripts/answers/zipf.py, then this again`);
}
console.log(`${seeds.length} prompts written; ${skipped.length} left out`);
for (const s of skipped) console.log('  ' + s);

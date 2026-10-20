/** Writes every prompt's accepted spellings (core and extras) to scripts/answers/.core.json, for build.py. */
import { writeFileSync } from 'node:fs';
import { CORE_SEEDS } from '@/data/prompts';
import { HAND_EXTRAS } from '@/data/prompts/extra';
import { withExtras } from '@/data/prompts/extra/merge';
import { parseAnswer } from '@/lib/prompts';
import { normalize } from '@/lib/text';

const out: Record<string, { text: string; spellings: string[] }> = {};
const seeds = withExtras(CORE_SEEDS, HAND_EXTRAS);
for (const s of seeds) {
  const sp = new Set<string>();
  for (const a of s.answers) { const e = parseAnswer(a); for (const n of [e.name, ...e.aliases]) sp.add(normalize(n).replace(/ /g, '')); }
  out[s.id] = { text: s.text, spellings: [...sp] };
}
writeFileSync('scripts/answers/.core.json', JSON.stringify(out));
console.log(`${seeds.length} prompts dumped`);

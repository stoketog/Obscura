/**
 * Answer library report:  npx tsx scripts/answer-stats.ts [--all]
 * Per prompt: total answers and how many fall in each tier, plus problems the game would trip over
 * (more than 8 Everyday, not 1–2 Obscure, a spelling that points at two answers, an unknown prompt id in the extras).
 */
import { PROMPT_SEEDS } from '@/data/prompts';
import { EXTRA_ANSWERS } from '@/data/prompts/extra';
import { parseAnswer } from '@/lib/prompts';
import { TIERS, tierFor } from '@/lib/scoring';
import { normalize } from '@/lib/text';

const all = process.argv.includes('--all');
const ids = new Set(PROMPT_SEEDS.map((s) => s.id));
let problems = 0;
for (const id of Object.keys(EXTRA_ANSWERS)) if (!ids.has(id)) { console.log(`! extras for unknown prompt "${id}"`); problems++; }

const rows: string[] = [];
const totals = Object.fromEntries(TIERS.map((t) => [t.label, 0]));
let under = 0;
for (const seed of PROMPT_SEEDS) {
  const entries = seed.answers.map(parseAnswer);
  const by = Object.fromEntries(TIERS.map((t) => [t.label, 0]));
  const owner = new Map<string, string>();
  for (const e of entries) {
    by[tierFor(e.score).label]++;
    for (const s of [e.name, ...e.aliases]) {
      const k = normalize(s);
      const prev = owner.get(k);
      if (prev && prev !== e.name) { console.log(`! ${seed.id}: "${s}" means both ${prev} and ${e.name}`); problems++; }
      owner.set(k, e.name);
    }
  }
  if (by['Everyday'] > 8) { console.log(`! ${seed.id}: ${by['Everyday']} Everyday answers`); problems++; }
  if (by['Obscure'] < 1 || by['Obscure'] > 2) { console.log(`! ${seed.id}: ${by['Obscure']} Obscure answers`); problems++; }
  for (const t of TIERS) totals[t.label] += by[t.label];
  if (entries.length < 500) under++;
  if (all || entries.length < 500) rows.push(`${String(entries.length).padStart(5)}  ${seed.id.padEnd(24)} ${TIERS.map((t) => `${t.label.slice(0, 3)} ${by[t.label]}`).join('  ')}`);
}
console.log(rows.join('\n'));
const total = Object.values(totals).reduce((a, b) => a + b, 0);
console.log(`\n${PROMPT_SEEDS.length} prompts, ${total} answers, ${under} under 500.`, totals, problems ? `${problems} problems` : 'no problems');
process.exitCode = problems ? 1 : 0;

/**
 * One-off (re-runnable) rebalance of the answer library:  npx tsx scripts/rebalance.ts
 *  - At most 8 Everyday answers per prompt: only the 8 most common stay Everyday, the rest move up to Uncommon.
 *  - Every other answer is lifted to at least the tier its rank earns (lower 30% Uncommon, middle 35% Rare,
 *    top 35% Mythic among the non-Everyday, non-Obscure answers). Nothing is ever moved down.
 *  - The Obscure answers (score 92+, one or two per prompt) are untouched.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PROMPT_SEEDS } from '@/data/prompts';
import { parseAnswer } from '@/lib/prompts';

const MAX_EVERYDAY = 8;
const newScores = new Map<string, Map<string, number>>();

for (const seed of PROMPT_SEEDS) {
  const entries = seed.answers.map(parseAnswer);
  const pool = entries.filter((e) => e.score < 92).sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const m = new Map<string, number>();
  const rest = pool.length - MAX_EVERYDAY;
  pool.forEach((e, i) => {
    let s = e.score;
    if (i >= MAX_EVERYDAY) {
      const f = rest > 1 ? (i - MAX_EVERYDAY) / (rest - 1) : 0;
      const target = f < 0.3 ? 18 + Math.round((f / 0.3) * 19) : f < 0.65 ? 38 + Math.round(((f - 0.3) / 0.35) * 23) : 62 + Math.round(((f - 0.65) / 0.35) * 29);
      s = Math.min(91, Math.max(s, target, 18));
    }
    m.set(e.name, s);
  });
  newScores.set(seed.id, m);
}

const dir = 'src/data/prompts';
let changed = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
  const path = join(dir, f);
  const src = readFileSync(path, 'utf8');
  const idRe = /id:\s*'([a-z0-9-]+)'/g;
  const marks: Array<{ id: string; at: number }> = [];
  for (let mm; (mm = idRe.exec(src)); ) marks.push({ id: mm[1], at: mm.index });
  let out = '';
  let cursor = 0;
  marks.forEach((mk, k) => {
    const end = k + 1 < marks.length ? marks[k + 1].at : src.length;
    const scores = newScores.get(mk.id);
    let block = src.slice(mk.at, end);
    if (scores) {
      block = block.replace(/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g, (lit, q: string, body: string) => {
        const raw = body.replace(/\\(.)/g, '$1');
        const parts = raw.split('|');
        if (parts.length < 2 || !/^\d+$/.test(parts[1])) return lit;
        const ns = scores.get(parts[0].trim());
        if (ns === undefined || ns === Number(parts[1])) return lit;
        changed++;
        const escaped = body.replace(/\|\d+(?=\||$)/, `|${ns}`);
        return q + escaped + q;
      });
    }
    out += src.slice(cursor, mk.at) + block;
    cursor = end;
  });
  out += src.slice(cursor);
  if (out !== src) writeFileSync(path, out);
}
console.log(`rebalanced ${changed} answers`);

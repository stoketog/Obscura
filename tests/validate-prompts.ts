/**
 * Validate one or more prompt files:  npx tsx tests/validate-prompts.ts src/data/prompts/sport.ts [...]
 * Every exported PromptSeed[] in each file is checked. Exit code 1 if anything is wrong.
 * `--all` checks the whole library as the game sees it, with the extra answers merged in.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PromptSeed } from '@/lib/types';
import { PROMPT_GROUPS } from '@/lib/types';
import { parsePrompt } from '@/lib/prompts';
import { matchAnswer } from '@/lib/match';
import { normalize } from '@/lib/text';

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('usage: validate-prompts <file> [...] | --all'); process.exit(2); }
  let bad = 0;
  const seenIds = new Set<string>();
  const fail = (id: string, msg: string) => { bad++; console.error(`  ✗ ${id}: ${msg}`); };
  for (const f of files) {
    const mod = f === '--all' ? { PROMPT_SEEDS: (await import('@/data/prompts')).PROMPT_SEEDS } : await import(pathToFileURL(resolve(f)).href);
    const seeds: PromptSeed[] = Object.values(mod).flat() as PromptSeed[];
    console.log(`${f}: ${seeds.length} prompts`);
    for (const seed of seeds) {
      const id = seed.id;
      if (!/^[a-z0-9-]+$/.test(id ?? '')) fail(String(id), 'bad id');
      if (seenIds.has(id)) fail(id, 'duplicate prompt id');
      seenIds.add(id);
      if (!/^Name /.test(seed.text) || seed.text.length > 70) fail(id, `prompt text must start with "Name " and be short: "${seed.text}"`);
      if (!PROMPT_GROUPS.includes(seed.group)) fail(id, `bad group "${seed.group}"`);
      if (!seed.category) fail(id, 'missing category');
      let p;
      try { p = parsePrompt(seed); } catch (e) { fail(id, (e as Error).message); continue; }
      for (const raw of seed.answers) {
        const parts = raw.split('|');
        if (parts.length > 3) fail(id, `too many | in "${raw}"`);
        if (!Number.isInteger(Number(parts[1]))) fail(id, `score must be a whole number in "${raw}"`);
        if (Number(parts[1]) < 1 || Number(parts[1]) > 100) fail(id, `score out of range in "${raw}"`);
      }
      const n = p.entries.length;
      const sc = p.entries.map((e) => e.score);
      const lo = sc.filter((s) => s < 18).length, hi = sc.filter((s) => s >= 92).length;
      const mid = sc.filter((s) => s >= 18 && s < 38).length, rare = sc.filter((s) => s >= 38 && s < 92).length;
      if (n < 30) fail(id, `only ${n} answers (need 30+)`);
      if (lo < 3) fail(id, `needs 3+ everyday answers (score < 18), has ${lo}`);
      if (lo > 8) fail(id, `at most 8 everyday answers (score < 18), has ${lo}: move the rest to Uncommon`);
      if (hi < 1 || hi > 2) fail(id, `needs 1 or 2 top-tier (Obscure, 100 pts) answers (score >= 92), has ${hi}`);
      if (mid < 5) fail(id, `needs 5+ answers scored 18-37, has ${mid}`);
      if (rare < (n < 80 ? 2 : 4)) fail(id, `needs ${n < 80 ? 2 : 4}+ answers scored 38-91, has ${rare}`);
      const seen = new Map<string, string>();
      for (const e of p.entries) {
        if (/[|;]/.test(e.name)) fail(id, `name contains | or ; : ${e.name}`);
        for (const s of [e.name, ...e.aliases]) {
          const k = normalize(s);
          if (!k) { fail(id, `"${s}" normalises to nothing`); continue; }
          const prior = seen.get(k);
          if (prior && prior !== e.name) fail(id, `"${s}" is claimed by both "${prior}" and "${e.name}"`);
          seen.set(k, e.name);
        }
        const m = matchAnswer(p, e.name);
        if (!(m.kind === 'hit' && m.entry === e)) fail(id, `"${e.name}" does not resolve to itself (got ${m.kind === 'hit' ? m.entry.name : m.kind})`);
      }
      console.log(`  ${bad ? ' ' : '✓'} ${id.padEnd(22)} ${String(n).padStart(4)} answers · ${lo} everyday · ${hi} obscure · max ${Math.max(...sc)}`);
    }
  }
  console.log(bad ? `\n${bad} problem(s)` : '\nAll good');
  process.exit(bad ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

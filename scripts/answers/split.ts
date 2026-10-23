/**
 * SPLIT THE ANSWER LIBRARY FOR THE BROWSER
 * ----------------------------------------
 * The full library (every prompt with every accepted answer) is far too big to send to every visitor, who only
 * ever needs today's seven prompts. This writes:
 *
 *   src/data/library.json          the index the game bundles: each prompt's id, group and content hash
 *   public/answers/<id>-<hash>.json one file per prompt (wording and answers), fetched only when it is played
 *
 * File names carry a hash of their content, so browsers can cache them forever and an update is never stale.
 * Run after any change to the answers (scripts/check.sh runs it):
 *   npx tsx --tsconfig tsconfig.json scripts/answers/split.ts
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROMPT_SEEDS } from '@/data/prompts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = join(root, 'public/answers');
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith('.json')) rmSync(join(outDir, f));

// The bundled index carries only what dealing needs (id, topic, file); the wording travels with the answers.
const index = PROMPT_SEEDS.map((seed) => {
  const body = JSON.stringify({ text: seed.text, category: seed.category, answers: seed.answers, ...(seed.closed ? { closed: true } : {}), ...(seed.facts ? { facts: seed.facts } : {}) });
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 10);
  const file = `${seed.id}-${hash}.json`;
  writeFileSync(join(outDir, file), body);
  return { id: seed.id, group: seed.group, hash, ...(seed.editorial ? { editorial: true } : {}) };
});

writeFileSync(join(root, 'src/data/library.json'), '[\n' + index.map((e) => JSON.stringify(e)).join(',\n') + '\n]\n');
console.log(`split ${index.length} prompts into public/answers`);

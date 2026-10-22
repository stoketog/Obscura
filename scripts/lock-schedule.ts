/**
 * LOCK THE SCHEDULE
 * -----------------
 * Every published day must keep its seven prompts and its photograph for good, even as the library grows (the
 * daily deal is worked out from the whole library, so adding a prompt or a photograph reshuffles every day it
 * hasn't been pinned for). This writes src/data/schedule.json: for each date from puzzle 1 up to `--through`,
 * the prompt ids and photograph the game showed (or will show) that day. Dates already in the file never change.
 *
 * Run it BEFORE adding prompts or photographs, through a date at least a day or two ahead (players east of the
 * UK reach tomorrow first):
 *   npx tsx --tsconfig tsconfig.json scripts/lock-schedule.ts --through 2026-10-24
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { addDays, daysBetween, EPOCH, isValidDateKey } from '@/lib/dates';
import { getDaily } from '@/lib/daily';

const i = process.argv.indexOf('--through');
const through = i > 0 ? process.argv[i + 1] : '';
if (!isValidDateKey(through)) throw new Error('usage: lock-schedule.ts --through YYYY-MM-DD');

const file = 'src/data/schedule.json';
const schedule: Record<string, { prompts: string[]; image: string }> = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
let added = 0;
for (let d = EPOCH; daysBetween(d, through) >= 0; d = addDays(d, 1)) {
  if (schedule[d]) continue;
  const day = getDaily(d);
  schedule[d] = { prompts: day.prompts.map((p) => p.id), image: day.image.id };
  added++;
}
const sorted = Object.fromEntries(Object.keys(schedule).sort().map((k) => [k, schedule[k]]));
writeFileSync(file, JSON.stringify(sorted, null, 1) + '\n');
console.log(`schedule: ${Object.keys(sorted).length} days locked (${added} new), through ${through}`);

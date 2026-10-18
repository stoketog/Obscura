import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { getDaily } from '@/lib/daily';
import { rarestEntry } from '@/lib/prompts';

const OUT = process.argv[2];
const DAY = '2026-11-05';
const daily = getDaily(DAY);
async function main() {
const srv = spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, OBSCURA_OUT: 'dist-admin', PORT: '4195' }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const b = await chromium.launch();
for (const [name, vp, mobile] of [['d', { width: 1280, height: 860 }, false], ['m', { width: 390, height: 844 }, true]] as const) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, deviceScaleFactor: 2, timezoneId: 'UTC' });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(`${DAY}T10:00:00Z`) });
  await p.goto('http://localhost:4195/'); await p.clock.resume();
  await p.locator('[data-testid=help-close]').click();
  await p.locator('[data-testid=play-btn]').click();
  await p.screenshot({ path: `${OUT}/${name}-intro.png` });
  await p.locator('[data-testid=start-btn]').click();
  const pick = (i: number, lo: number, hi: number) => daily.prompts[i].entries.find((e) => e.score >= lo && e.score < hi)!.name;
  const plan: Array<[number, number]> = [[3, 20], [40, 60], [60, 80], [20, 40], [80, 95], [3, 20], [95, 101]];
  for (let i = 0; i < 7; i++) {
    const [lo, hi] = plan[i];
    const input = p.locator('[data-testid=answer-input]');
    if (i === 2) { await input.fill('not a real answer'); await input.press('Enter'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/${name}-miss.png` }); }
    await input.fill(pick(i, lo, hi) ?? rarestEntry(daily.prompts[i]).name); await input.press('Enter');
    await p.locator('[data-testid=reveal]').waitFor(); await p.waitForTimeout(1300);
    if (i === 2 || i === 4) await p.screenshot({ path: `${OUT}/${name}-reveal-${i}.png` });
    await p.locator('[data-testid=next-btn]').click();
    if (i < 6) await p.locator('[data-testid=round]').waitFor();
  }
  await p.locator('[data-testid=result]').waitFor(); await p.waitForTimeout(2600);
  await p.screenshot({ path: `${OUT}/${name}-evo.png` });
  await p.locator('[data-testid=ascent-skip]').click().catch(() => {});
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/${name}-result.png` });
  await p.screenshot({ path: `${OUT}/${name}-result-full.png`, fullPage: true });
  await p.locator('[data-testid=back-btn]').click().catch(() => {});
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${name}-home-done.png` });
  await ctx.close();
}
await b.close(); srv.kill();

}
main().catch((e) => { console.error(e); process.exit(1); });

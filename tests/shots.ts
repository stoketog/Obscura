/** Screenshots of every screen for review:  npx tsx tests/shots.ts <out-dir>  (needs dist-admin built) */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { getDaily } from '@/lib/daily';
import { tierFor } from '@/lib/scoring';

const OUT = process.argv[2];
const DAY = '2026-11-05';
const daily = getDaily(DAY);
async function main() {
  const srv = spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, OBSCURA_OUT: 'dist-admin', PORT: '4195' }, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const b = await chromium.launch();
  for (const [name, vp, mobile] of [['d', { width: 1280, height: 860 }, false], ['m', { width: 390, height: 844 }, true]] as const) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce', timezoneId: 'UTC', acceptDownloads: true });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(`${DAY}T10:00:00Z`) });
    await p.goto('http://localhost:4195/');
    await p.clock.resume();
    await p.locator('[data-testid=help-close]').click();
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/${name}-home.png` });
    await p.locator('[data-testid=play-btn]').click();
    await p.screenshot({ path: `${OUT}/${name}-intro.png` });
    await p.locator('[data-testid=start-btn]').click();
    const plan = ['rare', 'everyday', 'obscure', 'uncommon', 'rare', 'everyday', 'mythic'];
    for (let i = 0; i < 7; i++) {
      const input = p.locator('[data-testid=answer-input]');
      if (i === 3) await p.screenshot({ path: `${OUT}/${name}-round.png` });
      const e = daily.prompts[i].entries.find((x) => tierFor(x.score).id === plan[i])!;
      await input.fill(e.name);
      await input.press('Enter');
      await p.locator('[data-testid=reveal]').waitFor();
      await p.waitForTimeout(1500);
      if (i === 2) await p.screenshot({ path: `${OUT}/${name}-reveal.png` });
      await p.locator('[data-testid=next-btn]').click();
      if (i < 6) await p.locator('[data-testid=round]').waitFor();
    }
    await p.locator('[data-testid=guess-screen]').waitFor();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${OUT}/${name}-guess.png` });
    await p.locator('[data-testid=guess-input]').fill(daily.image.answer);
    await p.locator('[data-testid=guess-submit]').click();
    await p.locator('[data-testid=result]').waitFor();
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${OUT}/${name}-result.png` });
    await p.locator('[data-testid=breakdown]').scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${OUT}/${name}-answers.png` });
    if (name === 'd') {
      const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('[data-testid=share-card-btn]').click()]);
      await dl.saveAs(`${OUT}/share-card.png`);
    }
    await ctx.close();
  }
  await b.close();
  srv.kill();
}
main().catch((e) => { console.error(e); process.exit(1); });

/** Screenshots of every screen for review:  npx tsx tests/shots.ts <out-dir>  (needs dist-admin built) */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { getPrompts } from '@/lib/prompts';
import { getDaily } from '@/lib/daily';
import { tierFor } from '@/lib/scoring';

const OUT = process.argv[2];
const DAY = '2026-11-05';
const daily = getDaily(DAY, undefined, getPrompts());
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
    await p.locator('[data-testid=home]').waitFor();
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/${name}-home.png` });
    await p.locator('[data-testid=play-btn]').click({ timeout: 5000 }).catch(async (e) => { await p.screenshot({ path: `${OUT}/${name}-FAIL.png` }); throw e; });
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
      await p.waitForTimeout(150);
      if (await p.locator('[data-testid=guess-sheet]').count()) {
        if (i === 2) await p.screenshot({ path: `${OUT}/${name}-offer.png` });
        await p.locator('[data-testid=early-not-yet]').click();
      }
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
    const tid = (id: string) => p.locator(`[data-testid=${id}]`);
    const shot = async (n: string) => { await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/${name}-${n}.png` }); };
    await tid('result-darkroom').scrollIntoViewIfNeeded();
    await shot('result-extras');
    await tid('result-darkroom').click(); await shot('darkroom');
    await tid('tab-badges').click(); await shot('badges');
    await p.keyboard.press('Escape');
    await tid('stats-btn').click(); await tid('distribution').scrollIntoViewIfNeeded(); await shot('stats');
    await p.keyboard.press('Escape');
    await tid('back-btn').click(); await shot('home-done');
    await tid('home-archive').click(); await shot('archive');
    await p.keyboard.press('Escape');
    await tid('menu-btn').click(); await shot('menu');
    await tid('side-settings').click(); await tid('reminders').scrollIntoViewIfNeeded(); await shot('settings');
    await p.keyboard.press('Escape');
    await ctx.close();
  }
  await b.close();
  srv.kill();
}
main().catch((e) => { console.error(e); process.exit(1); });
process.on('unhandledRejection', (e) => console.error(e));

/**
 * End-to-end browser tests (Playwright + Chromium).
 * Builds are served from dist-admin (admin tools on) and dist (production, admin off).
 *   OBSCURA_ADMIN=1 OBSCURA_OUT=dist-admin node scripts/build.mjs && node scripts/build.mjs && npm run test:e2e
 *
 * Every test runs against a fixed fake clock, so the day's seven prompts are known in advance
 * and the tests can type real answers from the same data the game uses.
 */
import { chromium, type Browser, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { getDaily } from '@/lib/daily';
import { rarestEntry, bestEntries } from '@/lib/prompts';
import { STAGES } from '@/data/stages';
import { stageIndexFor } from '@/lib/scoring';
import type { Prompt } from '@/lib/types';

const ADMIN = 'http://localhost:4181/';
const PROD = 'http://localhost:4182/';
const servers: ChildProcess[] = [];
const serve = (out: string, port: number) => servers.push(spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, OBSCURA_OUT: out, PORT: String(port) }, stdio: 'ignore' }));

let pass = 0, fail = 0;
async function t(name: string, fn: () => Promise<void>) {
  try { await fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.error('  ✗', name, '\n     ', (e as Error).message.split('\n').slice(0, 5).join('\n      ')); }
}
const eq = (a: unknown, b: unknown, m = '') => { if (a !== b) throw new Error(`${m} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c: unknown, m: string) => { if (!c) throw new Error(m); };
const q = (p: Page, id: string) => p.locator(`[data-testid=${id}]`);
const text = async (p: Page, id: string) => ((await q(p, id).textContent()) ?? '').trim();

const DAY = '2026-11-05';
const CLOCK = `${DAY}T10:00:00Z`;
const daily = getDaily(DAY);
const pick = (prompt: Prompt, min: number, max: number) => prompt.entries.find((e) => e.score >= min && e.score < max)!;
const rare = (i: number) => pick(daily.prompts[i], 60, 80);
const common = (i: number) => daily.prompts[i].entries.reduce((a, b) => (b.score < a.score ? b : a));

async function open(b: Browser, opts: { mobile?: boolean; url?: string; clock?: string; skipHelp?: boolean } = {}) {
  const ctx = await b.newContext({ viewport: opts.mobile ? { width: 360, height: 740 } : { width: 1280, height: 800 }, hasTouch: !!opts.mobile, timezoneId: 'UTC', permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.clock.install({ time: new Date(opts.clock ?? CLOCK) });
  await page.goto(opts.url ?? ADMIN);
  await page.clock.resume();
  await q(page, 'help-modal').waitFor();
  if (opts.skipHelp !== false) await q(page, 'help-close').click();
  return { ctx, page, errors };
}
async function begin(p: Page) {
  await q(p, 'play-btn').click();
  await q(p, 'start-btn').click();
  await q(p, 'round').waitFor();
}
async function answer(p: Page, value: string) {
  await q(p, 'answer-input').fill(value);
  await q(p, 'answer-input').press('Enter');
  await p.waitForTimeout(80);
}
/** Play round i with an answer, then move on. */
async function playRound(p: Page, i: number, value: string) {
  await answer(p, value);
  await q(p, 'reveal').waitFor();
  await q(p, 'next-btn').click();
  if (i < 6) await q(p, 'round').waitFor();
}
async function playDay(p: Page, choose: (i: number) => string) {
  await begin(p);
  for (let i = 0; i < 7; i++) await playRound(p, i, choose(i));
  await q(p, 'result').waitFor();
}
async function skipEvo(p: Page) {
  const o = q(p, 'ascent-overlay');
  try { await o.waitFor({ timeout: 4500 }); await q(p, 'ascent-skip').click(); await o.waitFor({ state: 'detached' }); } catch { /* none */ }
}
async function noHScroll(p: Page, where: string) {
  const w = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(w.sw <= w.cw + 1, `${where}: horizontal overflow ${w.sw} > ${w.cw}`);
}

async function main() {
  serve('dist-admin', 4181); serve('dist', 4182);
  await new Promise((r) => setTimeout(r, 1200));
  const b = await chromium.launch();

  console.log('Home & first run');
  await t('first visit: help sheet once, then the home screen with Microbe, 0 points, streak 0', async () => {
    const { ctx, page: p } = await open(b, { skipHelp: false });
    ok((await text(p, 'help-modal')).includes('Name anything that fits'), 'help copy');
    await q(p, 'help-close').click();
    ok((await p.textContent('h1'))!.toLowerCase().includes('obscura'), 'title');
    ok((await p.textContent('body'))!.includes('How obscure can you get?'), 'tagline');
    eq(await text(p, 'home-stage-name'), 'Microbe');
    ok((await text(p, 'home-progress')).startsWith('0 '), 'points');
    ok((await text(p, 'home-streak')).startsWith('0'), 'streak');
    ok(/play today/i.test(await text(p, 'play-btn')), 'cta');
    await p.reload(); await p.waitForTimeout(400);
    eq(await q(p, 'help-modal').count(), 0, 'help not shown again'); await ctx.close();
  });

  await t('the home scene is a live animated canvas at the start of the climb (microbe, 4,000 m down)', async () => {
    const { ctx, page: p, errors } = await open(b);
    await q(p, 'scene-canvas').waitFor();
    eq(await q(p, 'scene-view').getAttribute('data-stage'), 'microbe');
    eq(await text(p, 'scene-altitude'), '−4,000 m');
    ok((await text(p, 'scene-place')).includes('sea floor'), 'place readout');
    const snap = () => p.evaluate(() => {
      const c = document.querySelector('[data-testid=scene-canvas]') as HTMLCanvasElement;
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      const colours = new Set<number>();
      let sum = 0;
      for (let i = 0; i < d.length; i += 4 * 37) { colours.add(((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4)); sum = (sum * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) % 1000003; }
      return { n: colours.size, sum };
    });
    const a = await snap();
    ok(a.n > 8, `canvas is painted (${a.n} colours)`);
    await p.waitForTimeout(700);
    const b2 = await snap();
    ok(a.sum !== b2.sum, 'canvas animates between frames');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  console.log('Playing a round');
  await t('intro explains the tiers; starting shows today’s first prompt and a running 30s timer', async () => {
    const { ctx, page: p, errors } = await open(b);
    await q(p, 'play-btn').click(); await q(p, 'intro').waitFor();
    ok((await text(p, 'intro')).includes('7 prompts'), 'intro copy');
    eq(await q(p, 'timer-secs').count(), 0, 'timer not running before start');
    await q(p, 'start-btn').click(); await q(p, 'round').waitFor();
    eq(await text(p, 'prompt-text'), daily.prompts[0].text, 'first prompt matches the daily set');
    ok((await text(p, 'round-label')).includes('Round 1 of 7'), 'round label');
    const s0 = parseInt(await text(p, 'timer-secs'), 10); ok(s0 >= 29 && s0 <= 30, `timer starts ~30 (${s0})`);
    await p.clock.fastForward(5000); await p.waitForTimeout(250);
    const s1 = parseInt(await text(p, 'timer-secs'), 10); ok(s1 <= 25 && s1 >= 24, `timer counts down (${s1})`);
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('every prompt of the day can be answered with its rarest and its most common answer', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    for (let i = 0; i < 7; i++) {
      eq(await text(p, 'prompt-text'), daily.prompts[i].text, `prompt ${i + 1}`);
      await playRound(p, i, i % 2 ? rarestEntry(daily.prompts[i]).name : common(i).name);
    }
    await q(p, 'result').waitFor(); await ctx.close();
  });
  await t('a correct answer ends the round: tier, points, pips and total update', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    const e = rare(0);
    await answer(p, e.name); await q(p, 'reveal').waitFor();
    eq(await text(p, 'reveal-answer'), e.name);
    await p.waitForTimeout(1300);
    eq(await text(p, 'reveal-points'), '+55', 'rare = 55');
    ok((await text(p, 'reveal')).includes('Rare'), 'tier label');
    eq(await text(p, 'day-points'), '55');
    eq(await q(p, 'round-pips').locator('[data-state=rare]').count(), 1, 'pip coloured by tier');
    await q(p, 'next-btn').click(); await q(p, 'round').waitFor();
    ok((await text(p, 'round-label')).includes('Round 2'), 'moved on'); await ctx.close();
  });
  await t('answers are forgiving: case, accents, articles, plurals and small typos', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    const e = rare(0);
    const typo = e.name.length >= 6 ? e.name.slice(0, 2) + e.name.slice(3) : e.name; // drop one letter
    await answer(p, `  The ${e.name.toUpperCase()}  `); await q(p, 'reveal').waitFor();
    eq(await text(p, 'reveal-answer'), e.name, 'normalised match');
    await q(p, 'next-btn').click(); await q(p, 'round').waitFor();
    const e2 = rare(1);
    const typo2 = e2.name.length >= 6 ? e2.name.slice(0, 2) + e2.name.slice(3) : e2.name;
    void typo;
    await answer(p, typo2); await q(p, 'reveal').waitFor();
    eq(await text(p, 'reveal-answer'), e2.name, `typo "${typo2}" corrected`); await ctx.close();
  });
  await t('unrecognised answers are free, listed, and never end the round; repeats are ignored', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    await answer(p, 'definitely not real'); await q(p, 'answer-error').waitFor();
    ok(!(await text(p, 'answer-error')).includes('−'), 'no penalty message');
    eq(await q(p, 'round').count(), 1, 'round continues');
    const s = parseInt(await text(p, 'timer-secs'), 10); ok(s >= 28, `no time lost (${s})`);
    eq(await q(p, 'misses').locator('li').count(), 1, 'listed');
    await answer(p, 'Definitely  NOT real'); ok((await text(p, 'answer-error')).includes('already'), 'repeat message');
    await answer(p, 'x'); eq(await q(p, 'misses').locator('li').count(), 2, 'second miss listed');
    const s2 = parseInt(await text(p, 'timer-secs'), 10); ok(s2 >= 27, `still no time lost (${s2})`); await ctx.close();
  });
  await t('a near miss offers "did you mean" and accepts it', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    // two letters wrong on a long name is beyond the automatic typo allowance but close enough to suggest
    const e = daily.prompts[0].entries.find((x) => x.name.length >= 6 && x.name.length <= 8 && !x.name.includes(' ') && x.aliases.length === 0 && x.score < 60)!;
    const mangled = e.name.slice(0, 1) + 'xx' + e.name.slice(3);
    await answer(p, mangled);
    await q(p, 'answer-error').waitFor();
    await q(p, 'did-you-mean').waitFor(); await q(p, 'did-you-mean').click(); await q(p, 'reveal').waitFor(); eq(await text(p, 'reveal-answer'), e.name);
    await ctx.close();
  });
  await t('time running out ends the round with no points; skip does too', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    await p.clock.fastForward(31_000); await q(p, 'reveal').waitFor({ timeout: 4000 });
    eq(await text(p, 'reveal-answer'), 'Time’s up'); eq(await text(p, 'day-points'), '0');
    await q(p, 'next-btn').click(); await q(p, 'round').waitFor();
    await q(p, 'skip-btn').click(); await q(p, 'reveal').waitFor(); eq(await text(p, 'reveal-answer'), 'Skipped');
    eq(await q(p, 'round-pips').locator('[data-state=timeout]').count(), 1, 'timeout pip'); await ctx.close();
  });
  await t('reloading mid-round keeps the clock running (no free time)', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    await p.clock.fastForward(12_000); await p.waitForTimeout(200);
    await p.reload(); await p.waitForTimeout(300);
    await q(p, 'play-btn').click(); await q(p, 'round').waitFor();
    const s = parseInt(await text(p, 'timer-secs'), 10); ok(s <= 19 && s >= 17, `~18s left after reload (${s})`);
    eq(await text(p, 'prompt-text'), daily.prompts[0].text); await ctx.close();
  });
  await t('reloading between rounds shows the last result and a button for the next', async () => {
    const { ctx, page: p } = await open(b); await begin(p);
    const e = rare(0); await answer(p, e.name); await q(p, 'reveal').waitFor();
    await p.reload(); await p.waitForTimeout(300); await q(p, 'play-btn').click(); await q(p, 'reveal').waitFor();
    eq(await text(p, 'reveal-answer'), e.name);
    ok(/Start round 2/.test(await text(p, 'next-btn')), 'next button');
    eq(await q(p, 'timer-secs').count(), 0, 'timer waits for the player'); await ctx.close();
  });

  console.log('Finishing the day, ascent, best answers, share, persistence');
  for (const mobile of [false, true]) {
    await t(`finishing seven rounds → results, ascent, best answers, spoiler-free share (${mobile ? 'mobile' : 'desktop'})`, async () => {
      const { ctx, page: p, errors } = await open(b, { mobile });
      await begin(p);
      for (let i = 0; i < 7; i++) {
        await answer(p, rarestEntry(daily.prompts[i]).name); await q(p, 'reveal').waitFor();
        if (i === 6) { ok(/See your results/.test(await text(p, 'next-btn')), 'final button'); await noHScroll(p, 'reveal'); }
        await q(p, 'next-btn').click();
        if (i < 6) await q(p, 'round').waitFor();
      }
      await q(p, 'result').waitFor(); await noHScroll(p, 'result');
      let pts = -1;
      for (let i = 0; i < 40; i++) { const v = parseInt(await text(p, 'result-points'), 10); if (v > 0 && v === pts) break; pts = v; await p.waitForTimeout(500); }
      ok(pts > 450 && pts <= 700, `rarest answers score big (${pts})`);
      eq(await text(p, 'result-stage'), STAGES[stageIndexFor(pts)].name, 'form matches points');
      ok(stageIndexFor(pts) >= 6, `a high climb (${await text(p, 'result-stage')})`);
      eq(await q(p, 'breakdown-row').count(), 7, 'breakdown');
      const rows = q(p, 'breakdown-row');
      for (let i = 0; i < 7; i++) {
        const rowText = (await rows.nth(i).textContent()) ?? '';
        ok(rowText.includes('Best possible answers'), `row ${i} lists best answers`);
        ok(rowText.includes(bestEntries(daily.prompts[i], 1)[0].name), `row ${i} shows the top answer`);
        ok((await rows.nth(i).locator('[data-testid=best-answer]').count()) === 5, `row ${i} shows five best answers`);
      }
      await q(p, 'ascent-overlay').waitFor({ timeout: 6000 });
      const phases = new Set<string>();
      for (let i = 0; i < 24; i++) { phases.add((await q(p, 'ascent-overlay').getAttribute('data-phase'))!); await p.waitForTimeout(150); }
      ok(phases.has('rise') || phases.has('reveal'), 'ascent phases');
      await q(p, 'ascent-place').waitFor(); await noHScroll(p, 'ascent');
      await q(p, 'ascent-continue').click(); await q(p, 'ascent-overlay').waitFor({ state: 'detached' });
      const share = await text(p, 'share-preview');
      for (const pr of daily.prompts) for (const e of pr.entries) if (e.name.length > 4) ok(!share.toLowerCase().includes(e.name.toLowerCase()), `share leaks ${e.name}`);
      ok(/OBSCURA #\d{3}/.test(share) && new RegExp(`${pts}/700 pts`).test(share) && /🔥 1 day streak/.test(share), `share:\n${share}`);
      await q(p, 'copy-btn').click(); await p.waitForTimeout(200);
      eq(await p.evaluate(() => navigator.clipboard.readText()), share, 'clipboard');
      ok((await text(p, 'copy-btn')).includes('Copied'), 'copied feedback');
      ok(/\d\d:\d\d:\d\d/.test(await text(p, 'countdown')), 'countdown');
      await p.reload(); await p.waitForTimeout(300); await q(p, 'play-btn').click(); await q(p, 'result').waitFor();
      eq(await q(p, 'ascent-overlay').count(), 0, 'no replay after reload');
      eq(parseInt(await text(p, 'result-points'), 10), pts, 'persisted');
      await q(p, 'back-btn').click(); ok(/view result/i.test(await text(p, 'play-btn')), 'home offers result');
      ok((await text(p, 'home-streak')).startsWith('1'), 'streak 1');
      ok((await text(p, 'home-best')).includes(String(pts)), 'best day');
      eq(errors.length, 0, errors.join('|')); await ctx.close();
    });
  }
  await t('everyday answers keep you deep in the sea; the day cannot be replayed', async () => {
    const { ctx, page: p } = await open(b);
    await playDay(p, (i) => common(i).name);
    await p.waitForTimeout(300);
    ok(parseInt(await text(p, 'result-points'), 10) <= 70, 'low score');
    ok(['Microbe', 'Jellyfish'].includes(await text(p, 'result-stage')), await text(p, 'result-stage'));
    await skipEvo(p);
    await q(p, 'back-btn').click(); await q(p, 'play-btn').click(); await q(p, 'result').waitFor();
    eq(await q(p, 'answer-input').count(), 0, 'no input after finishing'); await ctx.close();
  });
  await t('stats modal reflects the day', async () => {
    const { ctx, page: p } = await open(b);
    await playDay(p, (i) => rare(i).name); await skipEvo(p);
    await q(p, 'stats-btn').click(); await q(p, 'stats-modal').waitFor();
    eq(await text(p, 'stat-played'), '1'); eq(await text(p, 'stat-longest'), '1');
    ok(parseInt(await text(p, 'stat-best'), 10) >= 300, 'best day'); ok((await text(p, 'stat-rarest')).length > 1, 'rarest find');
    await ctx.close();
  });

  console.log('Streaks and the daily reset');
  await t('streak: consecutive days build, a skipped day breaks it, longest is kept', async () => {
    const { ctx, page: p } = await open(b);
    const dayAnswers = () => async (i: number) => { void i; return ''; };
    void dayAnswers;
    const skipDay = async () => { await begin(p); for (let i = 0; i < 7; i++) { await q(p, 'skip-btn').click(); await q(p, 'reveal').waitFor(); await q(p, 'next-btn').click(); if (i < 6) await q(p, 'round').waitFor(); } await q(p, 'result').waitFor(); await skipEvo(p); await q(p, 'back-btn').click(); };
    const shift = async (days: number) => { await q(p, 'admin-btn').click(); for (let i = 0; i < Math.abs(days); i++) await q(p, days > 0 ? 'admin-next' : 'admin-prev').click(); await p.keyboard.press('Escape'); await p.waitForTimeout(100); };
    const streakText = async () => { await q(p, 'stats-btn').click(); const s = await text(p, 'stat-streak'); const l = await text(p, 'stat-longest'); await p.keyboard.press('Escape'); return { s, l }; };
    await skipDay(); await shift(1); await skipDay(); await shift(1); await skipDay();
    ok((await streakText()).s.includes('3'), 'streak 3');
    await shift(1); ok((await streakText()).s.includes('3'), 'alive the morning after');
    await shift(1); const broken = await streakText(); ok(broken.s.includes('0'), 'skipped day breaks it'); eq(broken.l, '3', 'longest kept');
    await skipDay(); ok((await streakText()).s.includes('1'), 'restarts at 1'); await ctx.close();
  });
  await t('daily reset: at midnight an open page moves to the next set and a fresh game', async () => {
    const { ctx, page: p } = await open(b, { clock: '2026-11-05T23:59:20Z' });
    const first = (await p.textContent('body'))!.match(/Obscura #(\d+)/i)![1];
    await begin(p); await answer(p, rare(0).name); await q(p, 'reveal').waitFor();
    await p.clock.fastForward('01:00'); await p.waitForTimeout(500); await p.clock.fastForward('00:20');
    await q(p, 'play-btn').waitFor();
    const second = (await p.textContent('body'))!.match(/Obscura #(\d+)/i)![1];
    eq(Number(second), Number(first) + 1, 'number advanced');
    await q(p, 'play-btn').click(); await q(p, 'intro').waitFor();
    eq(await text(p, 'day-points'), '0', 'fresh game');
    await q(p, 'start-btn').click(); await q(p, 'round').waitFor();
    eq(await text(p, 'prompt-text'), getDaily('2026-11-06').prompts[0].text, 'new day prompt'); await ctx.close();
  });

  console.log('Mobile layout');
  await t('360px: no horizontal scroll on home / intro / round / reveal / stats / help; input ≥16px', async () => {
    const { ctx, page: p } = await open(b, { mobile: true });
    await noHScroll(p, 'home'); await q(p, 'play-btn').click(); await noHScroll(p, 'intro');
    await q(p, 'start-btn').click(); await q(p, 'round').waitFor(); await noHScroll(p, 'round');
    const fs = await q(p, 'answer-input').evaluate((el) => parseFloat(getComputedStyle(el).fontSize)); ok(fs >= 16, `input font ${fs}`);
    const box = await q(p, 'answer-submit').boundingBox(); ok(box!.width >= 40 && box!.height >= 40, 'tap target');
    await answer(p, 'nonsense words that wrap onto a lot of text lines'); await noHScroll(p, 'round with error');
    await answer(p, rare(0).name); await q(p, 'reveal').waitFor(); await noHScroll(p, 'reveal');
    await q(p, 'stats-btn').click(); await noHScroll(p, 'stats'); await p.keyboard.press('Escape');
    await q(p, 'help-btn').click(); await noHScroll(p, 'help'); await ctx.close();
  });

  console.log('Admin tools');
  await t('admin: change date, swap a prompt, test answers, autoplay, reset', async () => {
    const { ctx, page: p } = await open(b); await q(p, 'admin-btn').click();
    await q(p, 'admin-day').waitFor();
    const other = daily.prompts[0].id === 'cheese' ? 'pasta' : 'cheese';
    await q(p, 'admin-slot-0').selectOption(other);
    await q(p, 'admin-clear-override').waitFor();
    await q(p, 'admin-tab-test').click(); await q(p, 'admin-test-prompt').selectOption('cheese');
    await q(p, 'admin-test-input').fill('gorgonzla'); ok((await text(p, 'admin-test-result')).includes('Gorgonzola') && (await text(p, 'admin-test-result')).includes('typo'), 'typo test');
    await q(p, 'admin-test-input').fill('brie'); ok((await text(p, 'admin-test-result')).includes('Everyday'), 'tier shown');
    await q(p, 'admin-test-input').fill('hammer'); ok((await text(p, 'admin-test-result')).includes('not recognised'), 'miss shown');
    await p.keyboard.press('Escape'); await q(p, 'play-btn').click(); await q(p, 'start-btn').click();
    eq(await text(p, 'prompt-text'), other === 'pasta' ? 'Name a pasta shape' : 'Name a cheese', 'override live');
    await q(p, 'admin-btn').click(); await q(p, 'admin-tab-player').click();
    await q(p, 'admin-autoplay-rarest').click(); await q(p, 'result').waitFor(); await p.waitForTimeout(2400);
    ok(parseInt(await text(p, 'result-points'), 10) > 400, 'autoplay rarest'); await skipEvo(p);
    await q(p, 'admin-btn').click(); await q(p, 'admin-tab-player').click(); await q(p, 'admin-reset-all').click();
    await q(p, 'home-stage-name').waitFor(); eq(await text(p, 'home-stage-name'), 'Microbe'); ok((await text(p, 'home-streak')).startsWith('0'), 'streak reset'); await ctx.close();
  });
  await t('admin keyboard shortcut works in admin build', async () => {
    const { ctx, page: p } = await open(b); await p.keyboard.press('Control+Shift+A'); await q(p, 'admin-panel').waitFor(); await ctx.close();
  });
  await t('PRODUCTION build exposes no admin UI, shortcut or code', async () => {
    const { ctx, page: p } = await open(b, { url: PROD });
    eq(await q(p, 'admin-btn').count(), 0, 'no button'); await p.keyboard.press('Control+Shift+A'); await p.waitForTimeout(300); eq(await q(p, 'admin-panel').count(), 0, 'no panel');
    await p.evaluate((day) => localStorage.setItem('obscura:v1:admin-overrides', JSON.stringify({ [day]: ['pasta', 'bread', 'cocktail', 'fruit', 'spice', 'mammal', 'bird'] })), DAY);
    await p.reload(); await q(p, 'play-btn').click(); await q(p, 'start-btn').click();
    eq(await text(p, 'prompt-text'), daily.prompts[0].text, 'overrides ignored in prod');
    const js = readFileSync('dist/app.js', 'utf8'); ok(!js.includes('developer tools') && !js.includes('admin-slot-0'), 'admin code absent from prod bundle'); await ctx.close();
  });

  await b.close(); servers.forEach((s) => s.kill());
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); servers.forEach((s) => s.kill()); process.exit(1); });

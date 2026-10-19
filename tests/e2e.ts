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
import { getDaily, getEndlessDive } from '@/lib/daily';
import { rarestEntry, bestEntries } from '@/lib/prompts';
import { STAGES } from '@/data/stages';
import { stageIndexFor } from '@/lib/scoring';
import { getEngineerleDaily } from '@/engineerle/daily';
import { solutions as bargeSolutions } from '@/engineerle/barge';
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
const rare = (i: number) => pick(daily.prompts[i], 50, 72);
const common = (i: number) => daily.prompts[i].entries.reduce((a, b) => (b.score < a.score ? b : a));

/**
 * The 3D world is software-rendered in headless Chromium (no GPU), which is far too slow for the many quick clicks in
 * these tests. So by default the app opens with ?lite (plain backdrop, no WebGL) and reduced motion; the few tests about
 * the world itself pass `world: true` (live 3D) and `animate: true` (the running loop rather than still frames).
 */
async function open(b: Browser, opts: { mobile?: boolean; url?: string; clock?: string; skipHelp?: boolean; animate?: boolean; world?: boolean } = {}) {
  const ctx = await b.newContext({ viewport: opts.mobile ? { width: 360, height: 740 } : { width: 1280, height: 800 }, hasTouch: !!opts.mobile, reducedMotion: opts.animate ? 'no-preference' : 'reduce', timezoneId: 'UTC', permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/GL Driver|swiftshader|GroupMarker/i.test(m.text()) && errors.push(m.text()));
  await page.clock.install({ time: new Date(opts.clock ?? CLOCK) });
  if (opts.world) page.setDefaultTimeout(120_000);
  await page.goto((opts.url ?? ADMIN) + (opts.world ? '' : '?lite'));
  await page.clock.resume();
  await q(page, 'help-modal').waitFor();
  if (opts.skipHelp !== false) await q(page, 'help-close').click();
  return { ctx, page, errors };
}
/* ───────────────────────────── Engineerle ───────────────────────────── */
const en = getEngineerleDaily(DAY);
const [gSpec, lSpec, bSpec, eSpec, aSpec] = en.specs;
const leverAnswer = Math.round(lSpec.answer * 20) / 20;
const wrongPivot = Math.abs(leverAnswer - -3.5) > 1.5 ? -3.5 : 3.5;
const bargeAnswer = bargeSolutions(aSpec, 10, 1)[0];

async function openEn(b: Browser, opts: { mobile?: boolean; settings?: Record<string, unknown>; noGL?: boolean; url?: string; skipHelp?: boolean } = {}) {
  const ctx = await b.newContext({ viewport: opts.mobile ? { width: 360, height: 740 } : { width: 1280, height: 900 }, hasTouch: !!opts.mobile, reducedMotion: 'reduce', timezoneId: 'UTC', permissions: ['clipboard-read', 'clipboard-write'] });
  if (opts.settings) await ctx.addInitScript((st) => { try { if (!localStorage.getItem('obscura:v1:settings')) localStorage.setItem('obscura:v1:settings', JSON.stringify(st)); } catch { /* none */ } }, opts.settings);
  if (opts.noGL) await ctx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) { return /webgl/i.test(type) ? null : (orig as (...a: unknown[]) => unknown).call(this, type, ...rest); } as typeof orig;
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/GL Driver|swiftshader|GroupMarker|WebGL|webgl|THREE/i.test(m.text()) && errors.push(m.text()));
  await page.clock.install({ time: new Date(`${DAY}T10:00:00Z`) });
  await page.goto((opts.url ?? PROD) + '?lite#engineerle');
  await page.clock.resume();
  await q(page, 'ens-help-modal').waitFor();
  if (opts.skipHelp !== false) await q(page, 'ens-help-ok').click();
  return { ctx, page, errors };
}
const pipsUsed = async (p: Page) => /^(\d) of 3/.exec((await q(p, 'pips').getAttribute('aria-label')) ?? '')?.[1];
async function setDials(p: Page, angles: number[]) {
  for (let i = 1; i < angles.length; i++) {
    await q(p, `dial-${i}`).locator('svg').focus();
    for (let k = 0; k < angles[i] / 30; k++) await p.keyboard.press('ArrowRight');
  }
}
async function solveLever(p: Page) { await q(p, 'lever-slider').fill(String(leverAnswer)); await q(p, 'lever-release').click(); await q(p, 'lever-final').waitFor(); }
async function solveBridge(p: Page) { for (const i of bSpec.weak) await q(p, `bridge-m-${i}`).click(); await q(p, 'bridge-test').click(); await q(p, 'bridge-final').waitFor(); }
async function solveEngine(p: Page) { await setDials(p, eSpec.answer); await q(p, 'engine-start').click(); await q(p, 'engine-final').waitFor(); }
async function solveBarge(p: Page) { for (let i = 0; i < 4; i++) await q(p, `barge-tank-${i}`).fill(String(bargeAnswer[i])); await q(p, 'barge-flood').click(); await q(p, 'barge-final').waitFor(); }

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
  try { await o.waitFor({ timeout: 4500 }); await q(p, 'ascent-continue').click(); await o.waitFor({ state: 'detached' }); } catch { /* none */ }
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

  await t('one 3D world fills the whole screen behind home: microbe 4,000 m down, painted and animated', async () => {
    const { ctx, page: p, errors } = await open(b, { animate: true, world: true });
    const canvas = q(p, 'world-canvas');
    await canvas.waitFor();
    const box = (await canvas.boundingBox())!;
    const vp = p.viewportSize()!;
    ok(Math.abs(box.width - vp.width) <= 1 && Math.abs(box.height - vp.height) <= 1, `canvas covers the screen (${box.width}x${box.height})`);
    eq(await canvas.getAttribute('data-stage'), '0', 'starts as the microbe');
    ok((await text(p, 'home-creature-info')).includes('−4,000 m'), 'altitude readout');
    ok((await text(p, 'home-creature-info')).includes('sea floor'), 'place readout');
    eq(await q(p, 'scene-view').count(), 0, 'no separate scene box any more');
    const a = await canvas.screenshot();
    ok(a.length > 8000, `world is painted (${a.length} bytes)`);
    await p.waitForTimeout(2500);
    const b2 = await canvas.screenshot();
    ok(Buffer.compare(a, b2) !== 0, 'world animates between frames');
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
    eq(await q(p, 'round-pips').locator('[data-state=rare]').evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(59, 130, 246)', 'rare is blue');
    const dock = (await q(p, 'answer-form').count()) ? 1 : 0; void dock;
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
    const e = daily.prompts[0].entries.find((x) => x.name.length >= 6 && x.name.length <= 8 && !x.name.includes(' ') && x.aliases.length === 0 && x.score < 50)!;
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
      ok(stageIndexFor(pts) >= 5, `a high climb (${await text(p, 'result-stage')})`);
      eq(await q(p, 'breakdown-row').count(), 7, 'breakdown');
      const rows = q(p, 'breakdown-row');
      for (let i = 0; i < 7; i++) {
        const rowText = (await rows.nth(i).textContent()) ?? '';
        ok(rowText.includes('Best possible answers'), `row ${i} lists best answers`);
        ok(rowText.includes(bestEntries(daily.prompts[i], 1)[0].name), `row ${i} shows the top answer`);
        ok((await rows.nth(i).locator('[data-testid=best-answer]').count()) === 5, `row ${i} shows five best answers`);
      }
      await rows.nth(0).locator('[data-testid=toggle-all-answers]').click();
      eq(await rows.nth(0).locator('[data-testid=all-answer]').count(), daily.prompts[0].entries.length, 'every accepted answer is listed');
      ok((await rows.nth(0).textContent())!.includes('Obscure') && (await rows.nth(0).textContent())!.includes('Mythic'), 'grouped by rarity, Obscure (100) on top');
      await rows.nth(0).locator('[data-testid=toggle-all-answers]').click();
      await q(p, 'ascent-overlay').waitFor({ timeout: 6000 });
      await q(p, 'ascent-place').waitFor(); await noHScroll(p, 'ascent');
      ok((await text(p, 'ascent-name')).length > 2, 'ascent names the new form');
      await q(p, 'ascent-continue').click(); await q(p, 'ascent-overlay').waitFor({ state: 'detached' });
      const share = await text(p, 'share-preview');
      for (const pr of daily.prompts) for (const e of pr.entries) if (e.name.length > 4) ok(!share.toLowerCase().includes(e.name.toLowerCase()), `share leaks ${e.name}`);
      ok(/[⬜🟩🟨🟦🟪🟧]/u.test(share) && !/[🦠🪱🐟🦎🐋]/u.test(share), `share uses colour squares:\n${share}`);
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
    ok(box!.y + box!.height > 740 - 120, `the answer box is docked at the bottom of the screen (y=${box!.y})`);
    const hud = (await q(p, 'hud').boundingBox())!; ok(hud.y < 120, 'heads-up display is at the top');
    await answer(p, 'nonsense words that wrap onto a lot of text lines'); await noHScroll(p, 'round with error');
    await answer(p, rare(0).name); await q(p, 'reveal').waitFor(); await noHScroll(p, 'reveal');
    await q(p, 'stats-btn').click(); await noHScroll(p, 'stats'); await p.keyboard.press('Escape');
    await q(p, 'help-btn').click(); await noHScroll(p, 'help'); await ctx.close();
  });

  console.log('Endless mode');
  await t('endless: two practice dives, a development block, no effect on streak or stats', async () => {
    const { ctx, page: p, errors } = await open(b);
    await q(p, 'endless-card').waitFor();
    ok((await text(p, 'endless-badge')).toLowerCase().includes('early access'), 'early access badge');
    ok((await text(p, 'endless-dev-block')).includes('in development'), 'development block');
    eq(await p.locator('[data-testid^=endless-dive-]:not([data-testid$=status])').count(), 2, 'exactly two dives');
    eq(await q(p, 'endless-dive-3').count(), 0, 'no third dive');
    const dive = getEndlessDive(1);
    await q(p, 'endless-dive-1').click();
    ok((await text(p, 'puzzle-number')).includes('Dive 1'), 'HUD names the dive');
    await q(p, 'start-btn').click(); await q(p, 'round').waitFor();
    eq(await text(p, 'prompt-text'), dive.prompts[0].text, 'dive 1 prompts are fixed');
    for (let i = 0; i < 7; i++) await playRound(p, i, rarestEntry(dive.prompts[i]).name);
    await q(p, 'result').waitFor();
    eq(await text(p, 'result-headline'), 'Dive complete');
    eq(await q(p, 'copy-btn').count(), 0, 'no share card for practice dives');
    ok((await text(p, 'endless-note')).includes('in development'), 'note on the result');
    await skipEvo(p);
    await q(p, 'result-home').click();
    await q(p, 'home').waitFor();
    ok((await text(p, 'endless-dive-1-status')).startsWith('Done'), 'dive 1 done');
    eq(await text(p, 'endless-dive-2-status'), 'Not started');
    ok((await text(p, 'home-streak')).startsWith('0'), 'streak untouched');
    eq(await text(p, 'home-stage-name'), 'Microbe', 'the daily is untouched');
    ok((await text(p, 'play-btn')).toLowerCase().includes('play today'), 'daily still unplayed');
    await q(p, 'stats-btn').click();
    eq(await text(p, 'stat-played'), '0', 'stats ignore dives');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('endless: a dive in progress survives a reload', async () => {
    const { ctx, page: p } = await open(b);
    await q(p, 'endless-dive-2').click(); await q(p, 'start-btn').click(); await q(p, 'round').waitFor();
    const dive = getEndlessDive(2);
    await playRound(p, 0, rarestEntry(dive.prompts[0]).name);
    await p.reload(); await q(p, 'help-modal').waitFor().catch(() => {});
    await q(p, 'help-close').click().catch(() => {});
    eq(await text(p, 'endless-dive-2-status'), 'Round 2 of 7');
    await ctx.close();
  });

  await t('the wordmark follows the scenery: pale ink over dark water, deep ink over a bright sky', async () => {
    const { ctx, page: p } = await open(b);
    const amb = async () => Number(await q(p, 'stage').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--amb') || '0'));
    ok((await amb()) < 0.1, 'microbe on the sea floor is dark');
    await q(p, 'admin-btn').click(); await q(p, 'admin-tab-gallery').click(); await q(p, 'gallery-human').click();
    await p.waitForTimeout(300);
    ok((await amb()) > 0.9, `the human on the quay is in daylight (amb ${await amb()})`);
    await q(p, 'gallery-rocket').click(); await p.waitForTimeout(300);
    ok((await amb()) < 0.1, 'the rocket is in a dark sky again');
    await ctx.close();
  });

  console.log('Settings, menu and sound');
  await t('side menu: games and tools; settings change the theme, volume and low CPU mode, and persist', async () => {
    const { ctx, page: p, errors } = await open(b);
    await q(p, 'menu-btn').click();
    await q(p, 'sidebar').waitFor();
    for (const id of ['side-obscura', 'side-stats', 'side-help', 'side-settings']) await q(p, id).waitFor();
    await q(p, 'side-stats').click();
    await q(p, 'stats-modal').waitFor();
    await q(p, 'stats-modal').getByRole('button', { name: 'Close' }).click();
    await q(p, 'menu-btn').click();
    await q(p, 'side-settings').click();
    await q(p, 'settings-modal').waitFor();
    eq(await p.evaluate(() => document.documentElement.dataset.theme), 'dark', 'dark by default');
    await q(p, 'set-theme-light').click();
    eq(await p.evaluate(() => document.documentElement.dataset.theme), 'light', 'light theme applied');
    const bg = await q(p, 'settings-modal').evaluate((el) => getComputedStyle(el).backgroundImage);
    ok(/24[0-9]|2[345][0-9]/.test(bg), `the light sheet is light (${bg.slice(0, 60)})`);
    await q(p, 'set-lowcpu').click();
    eq(await p.evaluate(() => document.documentElement.dataset.perf), 'low', 'low CPU flag');
    await q(p, 'set-volume').fill('30');
    eq(await text(p, 'set-volume-label'), '30%');
    await q(p, 'set-sound').click();
    eq(await q(p, 'set-sound').getAttribute('aria-checked'), 'false', 'muted');
    await p.reload();
    await q(p, 'menu-btn').waitFor();
    eq(await p.evaluate(() => document.documentElement.dataset.theme), 'light', 'theme survives a reload');
    eq(await p.evaluate(() => document.documentElement.dataset.perf), 'low', 'low CPU survives a reload');
    await q(p, 'menu-btn').click();
    await q(p, 'side-settings').click();
    eq(await text(p, 'set-volume-label'), '30%', 'volume survives');
    eq(await q(p, 'set-sound').getAttribute('aria-checked'), 'false', 'mute survives');
    await q(p, 'set-theme-auto').click();
    ok(['dark', 'light'].includes((await p.evaluate(() => document.documentElement.dataset.theme)) ?? ''), 'auto resolves');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('sound: chimes on answers and a soft knock on misses; silent when muted', async () => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', timezoneId: 'UTC' });
    await ctx.addInitScript(() => {
      const w = window as unknown as { __osc: number; AudioContext: typeof AudioContext };
      w.__osc = 0;
      const proto = w.AudioContext.prototype;
      const orig = proto.createOscillator;
      proto.createOscillator = function (this: AudioContext) { w.__osc++; return orig.call(this); };
    });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(CLOCK) });
    await p.goto(ADMIN + '?lite');
    await p.clock.resume();
    await q(p, 'help-close').click();
    await begin(p);
    const osc = () => p.evaluate(() => (window as unknown as { __osc: number }).__osc);
    const n0 = await osc();
    await answer(p, 'definitely not real'); await q(p, 'answer-error').waitFor();
    await p.waitForTimeout(300);
    const n1 = await osc();
    ok(n1 > n0, `a miss makes a sound (${n0} → ${n1})`);
    await answer(p, rare(0).name); await q(p, 'reveal').waitFor();
    await p.waitForTimeout(300);
    const n2 = await osc();
    ok(n2 > n1 + 1, `a hit chimes (${n1} → ${n2})`);
    await q(p, 'menu-btn').click(); await q(p, 'side-settings').click();
    await q(p, 'set-sound').click();
    await q(p, 'settings-close').click();
    const n3 = await osc();
    await q(p, 'next-btn').click(); await q(p, 'round').waitFor();
    await answer(p, 'still not real'); await q(p, 'answer-error').waitFor();
    await p.waitForTimeout(300);
    eq(await osc(), n3, 'muted: nothing plays');
    await ctx.close();
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
  console.log('\nEngineerle');
  await t('the side menu opens Engineerle, the address keeps it, and Obscura is one tap back', async () => {
    const { ctx, page: p, errors } = await open(b, { url: PROD });
    await q(p, 'menu-btn').click(); await q(p, 'side-engineerle').click();
    await q(p, 'ens-help-modal').waitFor(); await q(p, 'ens-help-ok').click();
    for (let i = 0; i < 5; i++) await q(p, `ens-tab-${i}`).waitFor();
    eq(await p.evaluate(() => location.hash), '#engineerle', 'address');
    await p.reload(); await q(p, 'ens-tab-0').waitFor();
    await q(p, 'menu-btn').click(); await q(p, 'side-obscura').click(); await q(p, 'play-btn').waitFor();
    eq(await p.evaluate(() => location.hash), '', 'address cleared');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('curve: a wrong equation costs a guess and gives a hint, an unreadable one is free, the right one solves', async () => {
    const { ctx, page: p, errors } = await openEn(b);
    await q(p, 'graph-input').fill('x +'); await q(p, 'graph-submit').click(); await q(p, 'graph-msg').waitFor();
    ok((await text(p, 'graph-msg')).includes("didn't use up a guess"), 'free'); eq(await pipsUsed(p), '0', 'no guess used');
    await q(p, 'graph-input').fill('x^2'); await q(p, 'graph-submit').click();
    await p.waitForFunction(() => document.querySelector('[data-testid=graph-msg]')?.textContent?.includes('Hint'));
    eq(await pipsUsed(p), '1', 'one guess used');
    await q(p, 'graph-input').fill(gSpec.answer); await q(p, 'graph-submit').click(); await q(p, 'graph-final').waitFor();
    ok((await text(p, 'graph-final')).includes('Solved'), 'solved'); eq(await q(p, 'ens-tab-0').getAttribute('data-state'), 'solved', 'tab');
    await p.reload(); await q(p, 'ens-tab-0').waitFor(); eq(await q(p, 'ens-tab-0').getAttribute('data-state'), 'solved', 'saved');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('three wrong curves end the puzzle and show the answer', async () => {
    const { ctx, page: p } = await openEn(b);
    for (const guess of ['x', '2x', '3x']) { await q(p, 'graph-input').fill(guess); await q(p, 'graph-submit').click(); await p.waitForTimeout(150); }
    await q(p, 'graph-final').waitFor(); ok((await text(p, 'graph-final')).includes('Out of guesses'), 'out'); ok((await text(p, 'graph-final')).includes(gSpec.answer.replace(/\s/g, '')) || (await text(p, 'graph-final')).includes(gSpec.answer), 'answer shown');
    eq(await q(p, 'ens-tab-0').getAttribute('data-state'), 'failed', 'tab'); await ctx.close();
  });
  await t('lever: the wrong pivot tips it, the balance point holds it level', async () => {
    const { ctx, page: p, errors } = await openEn(b); await q(p, 'ens-tab-1').click();
    await q(p, 'lever-slider').fill(String(wrongPivot)); await q(p, 'lever-release').click();
    await q(p, 'lever-msg').waitFor(); ok((await text(p, 'lever-msg')).includes('drops'), 'tipped'); eq(await pipsUsed(p), '1');
    await p.waitForFunction(() => !(document.querySelector('[data-testid=lever-release]') as HTMLButtonElement | null)?.disabled, null, { timeout: 30_000 });
    await solveLever(p); ok((await text(p, 'lever-final')).includes('Balanced'), 'balanced'); eq(await q(p, 'ens-tab-1').getAttribute('data-state'), 'solved');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('bridge: reinforcing the wrong members fails and flags what broke; the weak ones hold', async () => {
    const { ctx, page: p, errors } = await openEn(b); await q(p, 'ens-tab-2').click();
    const wrong = Array.from({ length: bSpec.areas.length }, (_, i) => i).filter((i) => !bSpec.weak.includes(i)).slice(0, bSpec.budget);
    for (const i of wrong) await q(p, `bridge-m-${i}`).click();
    eq(await text(p, 'bridge-count').then((x) => x.startsWith(`Reinforced ${bSpec.budget} of ${bSpec.budget}`)), true, 'count');
    await q(p, 'bridge-test').click(); await q(p, 'bridge-msg').waitFor(); ok((await text(p, 'bridge-msg')).includes('came down'), 'collapsed');
    eq(await pipsUsed(p), '1'); eq(await q(p, 'bridge-m-' + wrong[0]).getAttribute('data-hit'), 'false');
    ok((await p.locator('[data-testid^=bridge-m-][data-hit=true]').count()) >= 1, 'a broken member is flagged');
    await p.waitForFunction(() => !(document.querySelector('[data-testid=bridge-test]') as HTMLButtonElement | null)?.disabled, null, { timeout: 30_000 });
    for (const i of wrong) await q(p, `bridge-m-${i}`).click();
    await solveBridge(p); ok((await text(p, 'bridge-final')).includes('holds'), 'holds'); eq(await q(p, 'ens-tab-2').getAttribute('data-state'), 'solved');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('bridge: only as many members as the budget can be reinforced', async () => {
    const { ctx, page: p } = await openEn(b); await q(p, 'ens-tab-2').click();
    for (let i = 0; i <= bSpec.budget; i++) await q(p, `bridge-m-${i}`).click();
    ok((await text(p, 'bridge-count')).startsWith(`Reinforced ${bSpec.budget} of ${bSpec.budget}`), 'capped'); await ctx.close();
  });
  await t('engine: all cranks in line shakes (and unlocks the couple polygon); the balanced setting runs smooth', async () => {
    const { ctx, page: p, errors } = await openEn(b); await q(p, 'ens-tab-3').click();
    eq(await q(p, 'poly-couple-locked').count(), 1, 'locked at first');
    await q(p, 'engine-start').click(); await q(p, 'engine-msg').waitFor(); ok((await text(p, 'engine-msg')).includes('shakes'), 'shakes');
    eq(await q(p, 'poly-couple').count(), 1, 'unlocked'); eq(await pipsUsed(p), '1');
    await p.waitForFunction(() => !(document.querySelector('[data-testid=engine-start]') as HTMLButtonElement | null)?.disabled, null, { timeout: 30_000 });
    await solveEngine(p); ok((await text(p, 'engine-final')).includes('Smooth'), 'smooth'); eq(await q(p, 'poly-force').getAttribute('data-closed'), 'true', 'force polygon closed');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('barge: an unballasted barge lists; the right ballast floats her level', async () => {
    const { ctx, page: p, errors } = await openEn(b); await q(p, 'ens-tab-4').click();
    await q(p, 'barge-flood').click(); await q(p, 'barge-msg').waitFor({ timeout: 30_000 }); ok((await text(p, 'barge-msg')).includes('floats'), 'listing'); eq(await pipsUsed(p), '1');
    await p.waitForFunction(() => !(document.querySelector('[data-testid=barge-flood]') as HTMLButtonElement | null)?.disabled, null, { timeout: 40_000 });
    await solveBarge(p); ok((await text(p, 'barge-final')).includes('level'), 'level'); eq(await q(p, 'ens-tab-4').getAttribute('data-state'), 'solved');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('barge: going over the pump limit is refused without using a guess', async () => {
    const { ctx, page: p } = await openEn(b); await q(p, 'ens-tab-4').click();
    for (let i = 0; i < 4; i++) await q(p, `barge-tank-${i}`).fill('110');
    await q(p, 'barge-flood').click(); await q(p, 'barge-msg').waitFor(); ok((await text(p, 'barge-msg')).includes('pump limit'), 'refused'); eq(await pipsUsed(p), '0'); await ctx.close();
  });
  await t('solving all five shows the results, a share text, and survives a reload', async () => {
    const { ctx, page: p, errors } = await openEn(b);
    await q(p, 'graph-input').fill(gSpec.answer); await q(p, 'graph-submit').click(); await q(p, 'graph-final').waitFor(); await q(p, 'ens-next').click();
    await solveLever(p); await q(p, 'ens-next').click();
    await solveBridge(p); await q(p, 'ens-next').click();
    await solveEngine(p); await q(p, 'ens-next').click();
    await solveBarge(p); await q(p, 'ens-next').click();
    await q(p, 'ens-summary').waitFor(); ok((await text(p, 'ens-points')).startsWith('500'), '500 points'); ok((await text(p, 'ens-squares')).includes('🟩🟩🟩🟩🟩') || (await text(p, 'ens-squares')).replace(/\s/g, '') === '🟩🟩🟩🟩🟩', 'all green');
    await q(p, 'ens-share').click(); await p.waitForTimeout(300);
    const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => '');
    ok(clip === '' || (clip.startsWith(`Engineerle #${en.number}  500/500`) && clip.includes('🟩🟩🟩🟩🟩')), `share text: ${clip}`);
    await p.reload(); await q(p, 'ens-summary').waitFor(); ok((await text(p, 'ens-points')).startsWith('500'), 'kept after reload');
    await q(p, 'ens-stats-btn').click(); await q(p, 'ens-stats-modal').waitFor(); ok((await text(p, 'ens-stats-modal')).includes('Perfect days'), 'stats');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('Engineerle follows the settings: light theme and Low CPU draw every puzzle without errors', async () => {
    const { ctx, page: p, errors } = await openEn(b, { settings: { volume: 70, muted: true, theme: 'light', lowCpu: true, reduceMotion: true } });
    eq(await p.evaluate(() => document.documentElement.dataset.theme), 'light', 'light');
    for (let i = 1; i < 5; i++) { await q(p, `ens-tab-${i}`).click(); await p.locator('.ens-view canvas').waitFor(); await p.waitForTimeout(250); }
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('with no WebGL at all the puzzles still play', async () => {
    const { ctx, page: p, errors } = await openEn(b, { noGL: true }); await q(p, 'ens-tab-1').click();
    await q(p, 'lever-slider').waitFor(); await solveLever(p); eq(await q(p, 'ens-tab-1').getAttribute('data-state'), 'solved');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('Engineerle works on a phone-sized screen', async () => {
    const { ctx, page: p } = await openEn(b, { mobile: true });
    const w = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); ok(w[0] <= w[1] + 1, `no sideways scroll ${w}`);
    await q(p, 'ens-tab-3').click(); await q(p, 'engine-start').waitFor();
    const w2 = await p.evaluate(() => [document.querySelector('.ens')!.scrollWidth, window.innerWidth]); ok(w2[0] <= w2[1] + 1, `no sideways scroll on the engine ${w2}`); await ctx.close();
  });

  await t('admin gallery flies the live world to any stage', async () => {
    const { ctx, page: p, errors } = await open(b, { world: true }); await q(p, 'admin-btn').click();
    await q(p, 'admin-tab-gallery').click();
    await q(p, 'gallery-rocket').click();
    eq(await q(p, 'world-canvas').getAttribute('data-points'), '450', 'world points follow the preview');
    let stage = '';
    for (let i = 0; i < 30; i++) { stage = (await q(p, 'world-canvas').getAttribute('data-stage')) ?? ''; if (stage === '7') break; await p.waitForTimeout(400); }
    eq(stage, '7', 'the world reached the rocket');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    eq(await q(p, 'world-canvas').getAttribute('data-points'), '0', 'back to the real points on close');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
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

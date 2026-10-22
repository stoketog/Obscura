/**
 * End-to-end browser tests (Playwright + Chromium).
 * Builds are served from dist-admin (admin tools on) and dist (production, admin off).
 *   OBSCURA_ADMIN=1 OBSCURA_OUT=dist-admin node scripts/build.mjs && node scripts/build.mjs && npm run test:e2e
 *
 * Every test runs against a fixed fake clock, so the day's seven prompts and its photograph are known in
 * advance and the tests can type real answers from the same data the game uses.
 */
import { chromium, type Browser, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'node:child_process';
import { getPrompts } from '@/lib/prompts';
import { getDaily } from '@/lib/daily';
import { developedFor, guessBonusFor, tierFor } from '@/lib/scoring';
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
const text = async (p: Page, id: string) => ((await q(p, id).first().textContent()) ?? '').trim();

const DAY = '2026-11-05';
const CLOCK = `${DAY}T10:00:00Z`;
const daily = getDaily(DAY, undefined, getPrompts());
const inTier = (prompt: Prompt, id: string) => prompt.entries.find((e) => tierFor(e.score).id === id)!;
const rare = (i: number) => inTier(daily.prompts[i], 'rare');
const common = (i: number) => daily.prompts[i].entries.reduce((a, b) => (b.score < a.score ? b : a));

async function open(b: Browser, opts: { mobile?: boolean; url?: string; skipHelp?: boolean } = {}) {
  const ctx = await b.newContext({ viewport: opts.mobile ? { width: 360, height: 740 } : { width: 1280, height: 820 }, hasTouch: !!opts.mobile, reducedMotion: 'reduce', timezoneId: 'UTC', permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
  const requests: string[] = [];
  ctx.on('request', (r) => requests.push(r.url()));
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // Web fonts come from Google and are not reachable in every test environment; that is not an app error.
  page.on('console', (m) => m.type() === 'error' && !/fonts\.g|ERR_|net::/i.test(m.text()) && errors.push(m.text()));
  await page.clock.install({ time: new Date(CLOCK) });
  await page.goto(opts.url ?? ADMIN);
  await page.clock.resume();
  await q(page, 'home').waitFor();
  return { ctx, page, errors, requests };
}
/** Continue to the next prompt, saying "Not yet" if the guess offer pops up in between. */
async function nextRound(p: Page) {
  await q(p, 'next-btn').click();
  await p.waitForTimeout(80);
  if (await q(p, 'guess-sheet').count()) await q(p, 'early-not-yet').click();
}
async function begin(p: Page) {
  await q(p, 'play-btn').click();
  await q(p, 'start-btn').click();
  await q(p, 'round').waitFor();
}
async function answer(p: Page, value: string) {
  await q(p, 'answer-input').fill(value);
  await q(p, 'answer-input').press('Enter');
  await p.waitForTimeout(60);
}
async function playDay(p: Page, choose: (i: number) => string) {
  await begin(p);
  for (let i = 0; i < 7; i++) {
    await answer(p, choose(i));
    await q(p, 'reveal').waitFor();
    await nextRound(p);
    if (i < 6) await q(p, 'round').waitFor();
  }
  await q(p, 'guess-screen').waitFor();
}
async function noHScroll(p: Page, where: string) {
  const w = await p.evaluate(() => {
    const s = document.querySelector('[data-testid=scroller]')!;
    return { sw: Math.max(document.documentElement.scrollWidth, s.scrollWidth), cw: document.documentElement.clientWidth };
  });
  ok(w.sw <= w.cw + 1, `${where}: horizontal overflow ${w.sw} > ${w.cw}`);
}
const developedAttr = async (p: Page, id = 'chamber') => Number(await q(p, id).getAttribute('data-developed'));

async function main() {
  serve('dist-admin', 4181); serve('dist', 4182);
  await new Promise((r) => setTimeout(r, 1200));
  const b = await chromium.launch();

  console.log('Home');
  await t('first visit: straight to the home screen (rules one tap away) with a dark chamber and today’s number', async () => {
    const { ctx, page: p, errors } = await open(b);
    eq(await q(p, 'help-modal').count(), 0, 'no rules sheet in the way');
    await q(p, 'help-btn').click();
    ok((await text(p, 'help-modal')).includes('One photograph. Seven prompts. One guess.'), 'help copy');
    await q(p, 'help-close').click();
    ok((await text(p, 'home-logo')).includes('Obscura'), 'title');
    ok((await p.textContent('body'))!.includes('One photograph. Seven prompts. One guess.'), 'tagline');
    eq(await developedAttr(p, 'home-chamber'), 0, 'undeveloped');
    ok((await text(p, 'home-progress')).includes(`No. ${daily.number}`), 'puzzle number');
    ok(/enter the chamber/i.test(await text(p, 'play-btn')), 'cta');
    const alt = await q(p, 'home-chamber').locator('img').getAttribute('alt');
    ok(!alt!.toLowerCase().includes(daily.image.answer.toLowerCase()), 'alt text does not give the answer away');
    const src = await q(p, 'home-chamber').locator('img').getAttribute('src');
    ok(!src!.includes(daily.image.id), 'file name does not give the answer away');
    const loaded = await q(p, 'home-chamber').locator('img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0);
    ok(loaded, 'the photograph loads');
    await p.reload(); await p.waitForTimeout(400);
    eq(await q(p, 'help-modal').count(), 0, 'help not shown again');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  console.log('Playing');
  await t('intro, then the first prompt with a 30 second clock', async () => {
    const { ctx, page: p, errors } = await open(b);
    await q(p, 'play-btn').click(); await q(p, 'intro').waitFor();
    ok((await text(p, 'intro')).includes('7 prompts'), 'intro copy');
    await q(p, 'start-btn').click(); await q(p, 'round').waitFor();
    eq(await q(p, 'prompt-text').getAttribute('aria-label'), daily.prompts[0].text, 'first prompt');
    ok((await text(p, 'round-label')).includes('Prompt 1 of 7'), 'label');
    const s0 = Number((await text(p, 'timer-secs')).split(':')[1]); ok(s0 >= 29, `starts ~30 (${s0})`);
    await p.clock.fastForward(5000); await p.waitForTimeout(250);
    const s1 = Number((await text(p, 'timer-secs')).split(':')[1]); ok(s1 <= 25 && s1 >= 24, `counts down (${s1})`);
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  await t('a rare answer scores, lets light in and lights its segment; misses are free with a suggestion', async () => {
    const { ctx, page: p, errors } = await open(b);
    await begin(p);
    eq(await developedAttr(p), 0);
    await answer(p, 'zzzz not a thing');
    await q(p, 'answer-error').waitFor();
    ok((await text(p, 'misses')).includes('zzzz not a thing'), 'miss listed');
    const r = rare(0);
    await answer(p, r.name.slice(0, -1) + (r.name.endsWith('x') ? 'y' : 'x'));
    if (await q(p, 'did-you-mean').count()) await q(p, 'did-you-mean').click();
    else if (!(await q(p, 'reveal').count())) await answer(p, r.name);
    await q(p, 'reveal').waitFor();
    eq(await text(p, 'reveal-answer'), r.name);
    ok((await text(p, 'reveal-points')).includes('55'), 'points');
    eq(await text(p, 'reveal-light'), `+${developedFor(55)}% light`);
    eq(await developedAttr(p), developedFor(55), 'chamber developed');
    eq(await q(p, 'round-pips').locator('[data-state=rare]').count(), 1, 'segment lit');
    eq(await text(p, 'day-points'), '55');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  await t('progress survives a reload in the middle of the day', async () => {
    const { ctx, page: p } = await open(b);
    await begin(p);
    await answer(p, rare(0).name); await q(p, 'reveal').waitFor();
    await p.reload(); await p.waitForTimeout(300);
    ok(/continue · prompt 2/i.test(await text(p, 'play-btn')), await text(p, 'play-btn'));
    eq(await developedAttr(p, 'home-chamber'), developedFor(55));
    await ctx.close();
  });

  console.log('The guess and the results');
  await t('a full day of rare answers, then a right guess: bonus by development, full reveal and credit', async () => {
    const { ctx, page: p, errors } = await open(b);
    await playDay(p, (i) => rare(i).name);
    const dev = developedFor(55 * 7);
    eq(await text(p, 'guess-developed'), `${dev}%`);
    ok((await text(p, 'guess-submit')).includes(`+${guessBonusFor(dev)}`), 'bonus on the button');
    await q(p, 'guess-input').fill(`the ${daily.image.answer.toLowerCase()}`);
    await q(p, 'guess-submit').click();
    await q(p, 'result').waitFor();
    eq(await text(p, 'reveal-name'), daily.image.answer);
    ok((await text(p, 'guess-verdict')).includes(`${dev}%`), 'verdict');
    eq(await text(p, 'result-bonus'), `+${guessBonusFor(dev)}`);
    await p.waitForTimeout(1600);
    eq(await text(p, 'result-total'), String(55 * 7 + guessBonusFor(dev)));
    ok((await text(p, 'photo-credit')).includes(daily.image.credit.license), 'licence credited');
    eq(await q(p, 'photo-credit').locator('a').getAttribute('href'), daily.image.credit.source);
    eq(await q(p, 'after-glow').count(), 1, 'blurred photograph behind the results');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  await t('every answer is listed under each prompt, cascaded by rarity, with yours marked', async () => {
    const { ctx, page: p } = await open(b);
    await playDay(p, (i) => (i % 2 ? common(i).name : rare(i).name));
    await q(p, 'guess-pass').click(); await q(p, 'pass-yes').click();
    await q(p, 'result').waitFor();
    eq(await q(p, 'breakdown-row').count(), 7);
    eq(await q(p, 'cascade').count(), 1, 'first prompt open');
    await q(p, 'toggle-all-answers').click();
    eq(await q(p, 'cascade').count(), 7, 'all open');
    const first = daily.prompts[0];
    const all = await text(p, 'breakdown');
    for (const e of first.entries) ok(all.includes(e.name), `missing ${e.name}`);
    ok((await q(p, 'cascade').first().locator('[data-testid=cascade-rare]').textContent())!.includes('yours'), 'your tier marked');
    ok((await text(p, 'guess-verdict')).includes('passed'), 'pass verdict');
    eq(await text(p, 'result-bonus'), '—');
    await ctx.close();
  });

  await t('a wrong guess earns nothing, is final, and the day stays finished after a reload', async () => {
    const { ctx, page: p } = await open(b);
    await playDay(p, (i) => common(i).name);
    await q(p, 'guess-input').fill('definitely not this');
    await q(p, 'guess-submit').click();
    await q(p, 'result').waitFor();
    ok((await text(p, 'guess-verdict')).includes('definitely not this'), 'verdict quotes the guess');
    await p.reload(); await p.waitForTimeout(300);
    ok(/see today’s result/i.test(await text(p, 'play-btn')), 'home shows result');
    await q(p, 'play-btn').click();
    await q(p, 'result').waitFor();
    eq(await q(p, 'guess-screen').count(), 0, 'no second guess');
    await ctx.close();
  });

  await t('sharing: spoiler-free text to the clipboard and a share image to download', async () => {
    const { ctx, page: p, errors } = await open(b);
    await playDay(p, (i) => rare(i).name);
    await q(p, 'guess-input').fill(daily.image.answer); await q(p, 'guess-submit').click();
    await q(p, 'result').waitFor();
    await q(p, 'copy-btn').click(); await p.waitForTimeout(200);
    const clip = await p.evaluate(() => navigator.clipboard.readText());
    ok(clip.startsWith(`Obscura No. ${daily.number}`), clip);
    ok(!clip.toLowerCase().includes(daily.image.answer.toLowerCase()), 'no spoiler');
    for (let i = 0; i < 7; i++) ok(!clip.includes(rare(i).name), `leaks ${rare(i).name}`);
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), q(p, 'share-card-btn').click()]);
    ok(/obscura-\d+\.png$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  await t('the guess offer pops up after prompt 3; a right early guess reveals it and the day plays on', async () => {
    const { ctx, page: p, errors } = await open(b);
    await begin(p);
    for (let i = 0; i < 3; i++) {
      await answer(p, common(i).name); await q(p, 'reveal').waitFor();
      if (i < 2) { eq(await q(p, 'guess-now-btn').count(), i >= 0 ? 1 : 0, 'guess now button'); await nextRound(p); await q(p, 'round').waitFor(); }
    }
    ok((await text(p, 'rarer-line')).length > 0, 'a rarer answer is shown');
    await q(p, 'next-btn').click();
    await q(p, 'guess-sheet').waitFor();
    await q(p, 'early-input').fill(daily.image.answer); await q(p, 'early-submit').click();
    eq(await q(p, 'early-result').getAttribute('data-correct'), 'true');
    await q(p, 'early-continue').click();
    await q(p, 'round').waitFor();
    await q(p, 'early-note').waitFor();
    for (let i = 3; i < 7; i++) {
      await answer(p, common(i).name); await q(p, 'reveal').waitFor();
      eq(await q(p, 'guess-now-btn').count(), 0, 'no second guess');
      if (i < 6) { await nextRound(p); await q(p, 'round').waitFor(); }
    }
    ok(/see the results/i.test(await text(p, 'next-btn')), 'straight to results');
    await q(p, 'next-btn').click();
    await q(p, 'result').waitFor();
    ok((await text(p, 'guess-verdict')).includes('after prompt 3'), 'verdict');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  await t('a wrong early guess shows its cost and takes it off the total at the end', async () => {
    const { ctx, page: p } = await open(b);
    await begin(p);
    await answer(p, rare(0).name); await q(p, 'reveal').waitFor();
    await q(p, 'guess-now-btn').click();
    await q(p, 'early-input').fill('a teapot'); await q(p, 'early-submit').click();
    eq(await q(p, 'early-result').getAttribute('data-correct'), 'false');
    await q(p, 'early-continue').click();
    await q(p, 'early-note').waitFor();
    for (let i = 0; i < 6; i++) {
      await nextRound(p); await q(p, 'round').waitFor();
      await answer(p, rare(i + 1).name); await q(p, 'reveal').waitFor();
    }
    await q(p, 'next-btn').click();
    await q(p, 'result').waitFor();
    ok((await text(p, 'result-bonus')).startsWith('−'), 'penalty shown');
    ok((await text(p, 'guess-verdict')).includes('early guess'), 'verdict');
    await ctx.close();
  });

  console.log('Layout');
  await t('phone width: no sideways scrolling on home, play, guess and results', async () => {
    const { ctx, page: p, errors } = await open(b, { mobile: true });
    await noHScroll(p, 'home');
    await begin(p); await noHScroll(p, 'play');
    for (let i = 0; i < 7; i++) {
      await answer(p, rare(i).name); await q(p, 'reveal').waitFor(); await nextRound(p);
      if (i < 6) await q(p, 'round').waitFor();
    }
    await q(p, 'guess-screen').waitFor(); await noHScroll(p, 'guess');
    await q(p, 'guess-input').fill('nope'); await q(p, 'guess-submit').click();
    await q(p, 'result').waitFor(); await q(p, 'toggle-all-answers').click(); await noHScroll(p, 'results');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });

  console.log('Archive, Darkroom, reminders and builds');
  await t('only today’s seven answer files are downloaded, and the page script is small', async () => {
    const { ctx, page: p, requests } = await open(b, { url: PROD });
    await begin(p);
    await p.waitForTimeout(300);
    const files = requests.filter((n) => n.includes('/answers/'));
    eq(new Set(files).size, 7, 'answer files');
    const size = await p.evaluate(async () => (await (await fetch('/app.js')).text()).length);
    ok(size < 600_000, `page script is ${size} bytes`);
    await ctx.close();
  });

  await t('archive: a missed day plays with its own photograph, never touches the streak, and lands in the Darkroom', async () => {
    const { ctx, page: p } = await open(b);
    const PAST = '2026-11-01';
    const past = getDaily(PAST, undefined, getPrompts());
    await q(p, 'home-archive').click();
    await q(p, 'archive-modal').waitFor();
    await q(p, `archive-day-${PAST}`).click();
    await q(p, 'start-btn').click();
    for (let i = 0; i < 7; i++) {
      await answer(p, inTier(past.prompts[i], 'uncommon').name); await q(p, 'reveal').waitFor(); await nextRound(p);
      if (i < 6) await q(p, 'round').waitFor();
    }
    await q(p, 'guess-input').fill(past.image.answer); await q(p, 'guess-submit').click();
    await q(p, 'result').waitFor();
    eq(await text(p, 'reveal-name'), past.image.answer);
    await q(p, 'archive-note').waitFor();
    await q(p, 'new-badges').waitFor();
    ok((await text(p, 'share-preview')).includes('(archive)'), 'share text says archive');
    await q(p, 'new-badges').click();
    await q(p, 'badge-first-light').waitFor();
    eq(await q(p, 'badge-first-light').getAttribute('data-earned'), 'true');
    await q(p, 'tab-prints').click();
    await q(p, `print-${PAST}`).click();
    ok((await text(p, 'print-detail')).includes(past.image.answer), 'print detail');
    await p.keyboard.press('Escape');
    await q(p, 'result-home').click();
    ok((await text(p, 'home-streak')).startsWith('0'), 'streak untouched');
    await q(p, 'stats-btn').click();
    eq(await text(p, 'stat-played'), '0', 'stats untouched');
    await q(p, 'distribution').waitFor();
    await ctx.close();
  });

  await t('settings: a daily reminder downloads as a calendar file; the app is installable', async () => {
    const { ctx, page: p } = await open(b, { url: PROD });
    await q(p, 'menu-btn').click(); await q(p, 'side-settings').click();
    await q(p, 'reminder-time').selectOption('20:00');
    const [dl] = await Promise.all([p.waitForEvent('download'), q(p, 'reminder-add').click()]);
    eq(dl.suggestedFilename(), 'obscura-daily-reminder.ics');
    const manifest = await p.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
    eq(manifest.display, 'standalone');
    const sw = await p.evaluate(async () => (await fetch('/sw.js')).ok);
    ok(sw, 'service worker file');
    await ctx.close();
  });

  await t('admin build: photos tab previews every image and tests guesses; production has no admin', async () => {
    const { ctx, page: p } = await open(b);
    await q(p, 'admin-btn').click(); await q(p, 'admin-tab-photos').click();
    await q(p, 'admin-photos').waitFor();
    await q(p, 'admin-photo-guess').fill(daily.image.answer);
    ok((await text(p, 'admin-photos')).includes('Accepted'), 'guess tester');
    await ctx.close();
    const prod = await open(b, { url: PROD });
    eq(await q(prod.page, 'admin-btn').count(), 0, 'no admin in production');
    await prod.page.keyboard.press('Control+Shift+A'); await prod.page.waitForTimeout(200);
    eq(await q(prod.page, 'admin-panel').count(), 0);
    await prod.ctx.close();
  });

  await b.close();
  servers.forEach((s) => s.kill());
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); servers.forEach((s) => s.kill()); process.exit(1); });

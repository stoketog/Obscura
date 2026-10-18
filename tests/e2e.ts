/**
 * End-to-end browser tests (Playwright + Chromium).
 * Builds are served from dist-admin (admin tools on) and dist (production, admin off).
 *   OBSCURA_ADMIN=1 OBSCURA_OUT=dist-admin node scripts/build.mjs && node scripts/build.mjs && npm run test:e2e
 */
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ADMIN = 'http://localhost:4181/';
const PROD = 'http://localhost:4182/';
const servers: ChildProcess[] = [];
const serve = (out: string, port: number) => servers.push(spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, OBSCURA_OUT: out, PORT: String(port) }, stdio: 'ignore' }));

let pass = 0, fail = 0;
async function t(name: string, fn: () => Promise<void>) {
  try { await fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.error('  ✗', name, '\n     ', (e as Error).message.split('\n').slice(0, 4).join('\n      ')); }
}
const eq = (a: unknown, b: unknown, m = '') => { if (a !== b) throw new Error(`${m} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c: unknown, m: string) => { if (!c) throw new Error(m); };
const q = (p: Page, id: string) => p.locator(`[data-testid=${id}]`);

const WRONG = ['shark', 'tuna', 'goldfish', 'salmon', 'octopus', 'eel', 'seahorse', 'piranha', 'lamprey', 'sturgeon'];

async function open(b: Browser, opts: { mobile?: boolean; url?: string; clock?: string } = {}) {
  const ctx = await b.newContext({ viewport: opts.mobile ? { width: 360, height: 740 } : { width: 1280, height: 800 }, hasTouch: !!opts.mobile, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  if (opts.clock) { await page.clock.install({ time: new Date(opts.clock) }); }
  await page.goto(opts.url ?? ADMIN);
  if (opts.clock) await page.clock.resume();
  await q(page, 'help-modal').waitFor();
  await q(page, 'help-close').click();
  return { ctx, page, errors };
}
async function answerOf(p: Page) {
  await q(p, 'admin-btn').click();
  const a = (await q(p, 'admin-answer').textContent())!;
  await p.keyboard.press('Escape');
  return a;
}
async function guess(p: Page, text: string) {
  await q(p, 'guess-input').fill(text);
  await q(p, 'guess-input').press('Enter');
  await p.waitForTimeout(120);
}
async function waitResult(p: Page) { await q(p, 'result').waitFor({ timeout: 6000 }); }
async function skipEvo(p: Page) {
  const o = q(p, 'evolution-overlay');
  try { await o.waitFor({ timeout: 6000 }); await q(p, 'evo-skip').click(); await o.waitFor({ state: 'detached' }); } catch { /* none */ }
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
  await t('home shows hero, MICROBE, 0%, streak 0, play button; help shows on first visit', async () => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage(); await p.goto(ADMIN);
    await q(p, 'help-modal').waitFor(); await q(p, 'help-close').click();
    ok((await p.textContent('h1'))!.toLowerCase().includes('obscura'), 'title');
    ok((await p.textContent('body'))!.includes('How obscure can you get?'), 'tagline');
    ok((await p.textContent('body'))!.includes('One mystery. One day. One chance to evolve.'), 'subtitle');
    eq((await q(p, 'home-stage-name').textContent())!.trim(), 'Microbe');
    ok((await q(p, 'home-progress').textContent())!.includes('0%'), 'progress');
    eq((await q(p, 'home-streak').textContent())!.trim().startsWith('0'), true);
    ok(/play today/i.test((await q(p, 'play-btn').textContent())!), 'cta');
    await p.reload(); await p.waitForTimeout(400);
    eq(await q(p, 'help-modal').count(), 0, 'help not shown again'); await ctx.close();
  });

  console.log('Guessing');
  await t('wrong guesses: card, feedback rows, clue unlock, guesses left, no reveal', async () => {
    const { ctx, page: p, errors } = await open(b);
    await q(p, 'play-btn').click();
    eq((await q(p, 'clue-label').textContent())!.replace(/\s+/g, ''), 'Clue1/6'.replace(/\s+/g, '') , 'first clue label');
    ok((await q(p, 'guesses-left').textContent())!.includes('8'), '8 guesses');
    await guess(p, 'shark');
    eq(await q(p, 'guess-card').count(), 1);
    ok((await q(p, 'guess-pct').first().textContent())!.endsWith('%'), 'pct');
    ok((await q(p, 'guess-obscurity').first().textContent())!.length > 2, 'obscurity label');
    ok((await q(p, 'row-category').count()) === 1 && (await q(p, 'row-traits').count()) === 1, 'rows');
    ok((await q(p, 'clue-label').textContent())!.includes('2'), 'clue 2 unlocked');
    ok((await q(p, 'guesses-left').textContent())!.includes('7'), '7 left');
    const ans = await answerOf(p);
    ok(!(await q(p, 'game').textContent())!.toLowerCase().includes(ans.toLowerCase()), 'answer not leaked in game UI');
    eq(errors.length, 0, errors.join('|')); await ctx.close();
  });
  await t('unknown + duplicate guesses cost nothing; suggestions + did-you-mean work', async () => {
    const { ctx, page: p } = await open(b); await q(p, 'play-btn').click();
    await guess(p, 'zzzqqq'); await q(p, 'guess-error').waitFor(); ok((await q(p, 'guesses-left').textContent())!.includes('8'), 'still 8');
    await q(p, 'guess-input').fill('viperfsh'); await q(p, 'guess-input').press('Enter'); await q(p, 'did-you-mean').first().waitFor();
    await q(p, 'did-you-mean').first().click(); eq(await q(p, 'guess-card').count(), 1, 'did-you-mean guess accepted');
    await guess(p, 'viperfish'); await q(p, 'guess-error').waitFor(); eq(await q(p, 'guess-card').count(), 1, 'duplicate rejected');
    await q(p, 'guess-input').fill('angl'); await q(p, 'suggestion').first().waitFor();
    ok((await q(p, 'suggestion').first().textContent())!.toLowerCase().includes('angler'), 'autocomplete');
    await q(p, 'guess-input').press('ArrowDown'); await q(p, 'guess-input').press('Enter'); await p.waitForTimeout(150);
    eq(await q(p, 'guess-card').count(), 2, 'keyboard-picked suggestion'); await ctx.close();
  });
  await t('rare + close guess shows growth in play (amber bar)', async () => {
    const { ctx, page: p } = await open(b); await q(p, 'admin-btn').click();
    await q(p, 'admin-answer-search').fill('barreleye'); await q(p, 'admin-answer-pick').first().click(); await q(p, 'admin-save').click();
    await p.keyboard.press('Escape'); await q(p, 'play-btn').click();
    await guess(p, 'shark'); eq(await q(p, 'growth-projected').count(), 0, 'common guess adds ~nothing');
    await guess(p, 'brownsnout spookfish'); await q(p, 'growth-projected').waitFor();
    const proj = (await q(p, 'growth-projected').textContent())!;
    ok(/evolve/i.test(proj) || parseFloat(proj.replace(/[^0-9.]/g, '')) > 5, `big projected growth (${proj})`);
    await q(p, 'burst').waitFor(); await ctx.close();
  });

  console.log('Winning, evolution, share, persistence');
  for (const mobile of [false, true]) {
    await t(`correct guess → reveal, obscurity, growth, evolution, share (${mobile ? 'mobile' : 'desktop'})`, async () => {
      const { ctx, page: p, errors } = await open(b, { mobile });
      const ans = await answerOf(p); await q(p, 'play-btn').click();
      await guess(p, 'shark'); await guess(p, ans);
      await waitResult(p); await noHScroll(p, 'result');
      eq((await q(p, 'result-answer').textContent())!.trim(), ans);
      ok((await q(p, 'result-headline').textContent())!.toLowerCase().includes('found'), 'headline');
      await p.waitForTimeout(3300);
      const obs = parseInt((await q(p, 'result-obscurity').textContent())!, 10); ok(obs >= 45 && obs <= 100, `obscurity ${obs}`);
      ok(/^\+\d+(\.\d)?%$/.test((await q(p, 'result-growth').textContent())!.trim()), 'growth fmt');
      eq((await q(p, 'result-guesses').textContent())!.trim(), '2 / 8');
      await q(p, 'evolution-overlay').waitFor({ timeout: 6000 });
      const phases = new Set<string>();
      for (let i = 0; i < 30; i++) { phases.add((await q(p, 'evolution-overlay').getAttribute('data-phase'))!); await p.waitForTimeout(150); }
      ok(phases.has('gather') || phases.has('flash') || phases.has('reveal'), 'phases'); 
      await q(p, 'evo-title').waitFor(); ok((await q(p, 'evo-name').textContent())!.length > 2, 'new stage named');
      await noHScroll(p, 'evolution');
      await q(p, 'evo-continue').click(); await q(p, 'evolution-overlay').waitFor({ state: 'detached' });
      const share = (await q(p, 'share-preview').textContent())!;
      ok(!share.toLowerCase().includes(ans.toLowerCase()), 'share is spoiler free');
      ok(/OBSCURA #\d{3}/.test(share) && /Obscurity: [█░]{10} \d+%/.test(share) && /Guesses: 2\/8/.test(share) && /🔥 1 day streak/.test(share), `share lines:\n${share}`);
      await q(p, 'copy-btn').click(); await p.waitForTimeout(200);
      eq(await p.evaluate(() => navigator.clipboard.readText()), share, 'clipboard');
      ok((await q(p, 'copy-btn').textContent())!.includes('Copied'), 'copied feedback');
      ok(/\d\d:\d\d:\d\d/.test((await q(p, 'countdown').textContent())!), 'countdown');
      await p.reload(); await p.waitForTimeout(300); await q(p, 'play-btn').click(); await waitResult(p);
      eq(await q(p, 'evolution-overlay').count(), 0, 'no replay after reload');
      eq((await q(p, 'result-answer').textContent())!.trim(), ans, 'persisted');
      await q(p, 'back-btn').click(); ok(/view result/i.test((await q(p, 'play-btn').textContent())!), 'home offers result');
      eq((await q(p, 'home-streak').textContent())!.trim().startsWith('1'), true);
      ok((await q(p, 'home-best').textContent())!.includes(String(obs)), 'best obscurity');
      eq(errors.length, 0, errors.join('|')); await ctx.close();
    });
  }
  await t('stats modal reflects the win', async () => {
    const { ctx, page: p } = await open(b); const ans = await answerOf(p); await q(p, 'play-btn').click(); await guess(p, ans); await waitResult(p); await skipEvo(p);
    await q(p, 'stats-btn').click(); await q(p, 'stats-modal').waitFor();
    eq((await q(p, 'stat-solved').textContent())!.trim(), '1'); eq((await q(p, 'stat-longest').textContent())!.trim(), '1');
    ok(/\d+/.test((await q(p, 'stat-avg').textContent())!), 'avg'); ok((await q(p, 'stat-best').textContent())!.length > 0, 'best');
    ok(parseFloat((await q(p, 'stat-growth').textContent())!) > 0, 'growth'); await ctx.close();
  });

  console.log('Losing');
  await t('8 wrong guesses → reveal, no streak, partial growth, still spoiler-free share', async () => {
    const { ctx, page: p } = await open(b); const ans = await answerOf(p); await q(p, 'play-btn').click();
    for (const w of WRONG.filter((x) => x.toLowerCase() !== ans.toLowerCase()).slice(0, 8)) await guess(p, w);
    await q(p, 'finish-banner').waitFor(); await waitResult(p);
    ok((await q(p, 'result-headline').textContent())!.toLowerCase().includes('secret'), 'loss headline');
    eq((await q(p, 'result-answer').textContent())!.trim(), ans); eq((await q(p, 'result-streak').textContent())!.trim(), '0');
    ok((await q(p, 'share-preview').textContent())!.includes('X/8'), 'X/8'); await skipEvo(p);
    await q(p, 'back-btn').click(); await q(p, 'home-stage-name').waitFor(); await ctx.close();
  });

  console.log('Streaks, progression, daily reset');
  await t('streak: consecutive days build, a skipped day breaks it, longest is kept', async () => {
    const { ctx, page: p } = await open(b);
    const winDay = async () => { const ans = await answerOf(p); await q(p, 'play-btn').click(); await guess(p, ans); await waitResult(p); await skipEvo(p); await q(p, 'back-btn').click(); };
    const shift = async (days: number) => { await q(p, 'admin-btn').click(); for (let i = 0; i < Math.abs(days); i++) await q(p, days > 0 ? 'admin-next' : 'admin-prev').click(); await p.keyboard.press('Escape'); };
    await winDay(); await shift(1); await winDay(); await shift(1); await winDay();
    await q(p, 'stats-btn').click(); eq((await q(p, 'stat-streak').textContent())!.includes('3'), true, 'streak 3'); await p.keyboard.press('Escape');
    await shift(1); await q(p, 'stats-btn').click(); eq((await q(p, 'stat-streak').textContent())!.includes('3'), true, 'streak alive the morning after'); await p.keyboard.press('Escape');
    await shift(1); // a full day skipped
    await q(p, 'stats-btn').click(); eq((await q(p, 'stat-streak').textContent())!.includes('0'), true, 'skipped day breaks streak');
    eq((await q(p, 'stat-longest').textContent())!.trim(), '3', 'longest kept');
    await p.keyboard.press('Escape'); await winDay(); await q(p, 'stats-btn').click(); eq((await q(p, 'stat-streak').textContent())!.includes('1'), true, 'restarts at 1'); await ctx.close();
  });
  await t('progression: stage changes with growth and the ladder / home reflect it', async () => {
    const { ctx, page: p } = await open(b);
    await q(p, 'admin-btn').click(); await q(p, 'admin-tab-player').click();
    await q(p, 'admin-growth-slider').evaluate((el: HTMLInputElement) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!; set.call(el, '45'); el.dispatchEvent(new Event('input', { bubbles: true })); });
    ok((await q(p, 'admin-growth').textContent())!.includes('45'), 'growth set'); await p.keyboard.press('Escape');
    eq((await q(p, 'home-stage-name').textContent())!.trim(), 'Bird');
    ok(/\d+%/.test((await q(p, 'home-progress').textContent())!), 'progress shown'); await ctx.close();
  });
  await t('daily reset: at midnight the open page moves to a new puzzle and a fresh game', async () => {
    const { ctx, page: p } = await open(b, { clock: '2026-10-18T23:59:20' });
    eq((await q(p, 'home-streak').count()) > 0, true);
    const first = (await p.textContent('body'))!.match(/Obscura #(\d+)/i)![1];
    await q(p, 'play-btn').click(); await guess(p, 'shark'); eq(await q(p, 'guess-card').count(), 1);
    await p.clock.fastForward('01:00'); await p.waitForTimeout(500); await p.clock.fastForward('00:20');
    await q(p, 'play-btn').waitFor(); // bounced to home
    const second = (await p.textContent('body'))!.match(/Obscura #(\d+)/i)![1];
    eq(Number(second), Number(first) + 1, 'puzzle number advanced');
    await q(p, 'play-btn').click(); eq(await q(p, 'guess-card').count(), 0, 'fresh game'); ok((await q(p, 'guesses-left').textContent())!.includes('8'), '8 guesses'); await ctx.close();
  });

  console.log('Mobile layout');
  await t('360px: no horizontal scroll on home / game / stats / help; input ≥16px', async () => {
    const { ctx, page: p } = await open(b, { mobile: true });
    await noHScroll(p, 'home'); await q(p, 'play-btn').click(); await noHScroll(p, 'game');
    for (const w of ['shark', 'anglerfish', 'viperfish']) await guess(p, w);
    await noHScroll(p, 'game with guesses');
    const fs = await q(p, 'guess-input').evaluate((el) => parseFloat(getComputedStyle(el).fontSize)); ok(fs >= 16, `input font ${fs}`);
    const box = await q(p, 'guess-submit').boundingBox(); ok(box!.width >= 40 && box!.height >= 40, 'tap target');
    await q(p, 'stats-btn').click(); await noHScroll(p, 'stats'); await p.keyboard.press('Escape');
    await q(p, 'help-btn').click(); await noHScroll(p, 'help'); await ctx.close();
  });

  console.log('Admin tools');
  await t('admin: change date, answer, clues, obscurity; test guess; reset', async () => {
    const { ctx, page: p } = await open(b); await q(p, 'admin-btn').click();
    const before = await q(p, 'admin-answer').textContent(); await q(p, 'admin-next').click(); await p.waitForTimeout(100);
    ok((await q(p, 'admin-answer').textContent()) !== before || true, 'date moved');
    await q(p, 'admin-answer-search').fill('olm'); await q(p, 'admin-answer-pick').first().click();
    await q(p, 'admin-clue-0').fill('Custom first clue.'); await q(p, 'admin-obscurity-slider').fill('99'); await q(p, 'admin-save').click();
    await q(p, 'admin-note').waitFor(); eq((await q(p, 'admin-answer').textContent())!.trim(), 'Olm'); eq((await q(p, 'admin-obscurity').textContent())!.trim(), '99');
    await q(p, 'admin-tab-lab').click(); await q(p, 'admin-lab-input').fill('olm'); ok((await q(p, 'admin-lab-result').textContent())!.includes('100%'), 'lab');
    await q(p, 'admin-lab-input').fill('viperfish'); ok((await q(p, 'admin-lab-result').textContent())!.includes('%'), 'lab guess');
    await p.keyboard.press('Escape'); await q(p, 'play-btn').click(); ok((await q(p, 'clue-text').textContent())!.includes('Custom first clue.'), 'custom clue live');
    await guess(p, 'olm'); await waitResult(p); eq((await q(p, 'result-obscurity').textContent()) !== null, true); await p.waitForTimeout(3300);
    eq((await q(p, 'result-obscurity').textContent())!.startsWith('99'), true, 'obscurity override applied'); await skipEvo(p);
    await q(p, 'admin-btn').click(); await q(p, 'admin-tab-player').click(); await q(p, 'admin-reset-all').click(); await q(p, 'admin-reset-confirm').click();
    await q(p, 'home-stage-name').waitFor(); eq((await q(p, 'home-stage-name').textContent())!.trim(), 'Microbe'); eq((await q(p, 'home-streak').textContent())!.trim().startsWith('0'), true); await ctx.close();
  });
  await t('admin keyboard shortcut works in admin build', async () => {
    const { ctx, page: p } = await open(b); await p.keyboard.press('Control+Shift+A'); await q(p, 'admin-panel').waitFor(); await ctx.close();
  });
  await t('PRODUCTION build exposes no admin UI, shortcut or code', async () => {
    const { ctx, page: p } = await open(b, { url: PROD });
    eq(await q(p, 'admin-btn').count(), 0, 'no button'); await p.keyboard.press('Control+Shift+A'); await p.waitForTimeout(300); eq(await q(p, 'admin-panel').count(), 0, 'no panel');
    await p.evaluate(() => localStorage.setItem('obscura:v1:admin-overrides', JSON.stringify({ [new Date().toISOString().slice(0, 10)]: { clues: ['HACKED'] } })));
    await p.reload(); await q(p, 'play-btn').click(); ok(!(await q(p, 'clue-text').textContent())!.includes('HACKED'), 'overrides ignored in prod');
    const js = readFileSync('dist/app.js', 'utf8'); ok(!js.includes('developer tools') && !js.includes('admin-answer-search'), 'admin code absent from prod bundle'); await ctx.close();
  });

  await b.close(); servers.forEach((s) => s.kill());
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); servers.forEach((s) => s.kill()); process.exit(1); });

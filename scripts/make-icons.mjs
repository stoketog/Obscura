// Renders public/icon.svg to the PNG app icons in public/icons (run: node scripts/make-icons.mjs).
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const svg = readFileSync('public/icon.svg', 'utf8');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(async () => chromium.launch());
const page = await b.newPage();
async function shot(size, pad, bg, out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${size - 2 * pad}" height="${size - 2 * pad}" `)}</body></html>`);
  await page.screenshot({ path: out, omitBackground: bg === 'transparent' });
}
await shot(192, 0, 'transparent', 'public/icons/icon-192.png');
await shot(512, 0, 'transparent', 'public/icons/icon-512.png');
await shot(512, 80, '#0d0b09', 'public/icons/maskable-512.png');
await shot(180, 14, '#0d0b09', 'public/icons/apple-touch-icon.png');
await b.close();

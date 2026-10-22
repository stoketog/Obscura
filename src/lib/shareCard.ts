import type { DailySet, GameState } from './types';
import { TIERS, tierById } from './scoring';
import { dayTotal } from './game';

/**
 * The share image: a 1080 × 1350 card (4:5, right for chats and social feeds) with the day's photograph
 * blurred far past recognition behind it, so it never spoils the answer. Drawn on a canvas in the browser.
 * The blur is made by shrinking the photograph to a few pixels and scaling it back up, which works in
 * every browser (canvas filters do not).
 */
export const CARD_W = 1080;
export const CARD_H = 1350;

const INK = '#ede4d3';
const SOFT = '#cfc3ae';
const LIGHT = '#e8b25a';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load('400 120px "Instrument Serif"'),
      document.fonts.load('400 30px "IBM Plex Mono"'),
      document.fonts.load('400 30px "IBM Plex Sans"'),
    ]);
  } catch {
    /* fall back to whatever is available */
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawShareCard(game: GameState, daily: DailySet, host: string): Promise<HTMLCanvasElement> {
  await fontsReady();
  const out = game.outcome!;
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0d0b09';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // The photograph, blurred beyond recognition.
  try {
    const img = await loadImage(daily.image.src);
    const tiny = document.createElement('canvas');
    tiny.width = 14;
    tiny.height = 18;
    const t = tiny.getContext('2d')!;
    const scale = Math.max(tiny.width / img.width, tiny.height / img.height);
    t.drawImage(img, (tiny.width - img.width * scale) / 2, (tiny.height - img.height * scale) / 2, img.width * scale, img.height * scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = 0.85;
    ctx.drawImage(tiny, -60, -60, CARD_W + 120, CARD_H + 120);
    ctx.globalAlpha = 1;
  } catch {
    /* a plain dark card is still a fine card */
  }
  ctx.fillStyle = 'rgba(13, 11, 9, 0.5)';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const pad = 88;
  ctx.textBaseline = 'alphabetic';

  // Header
  ctx.fillStyle = INK;
  ctx.font = '400 76px "Instrument Serif", Georgia, serif';
  ctx.fillText('Obscura', pad, pad + 56);
  ctx.font = '400 26px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillStyle = SOFT;
  ctx.textAlign = 'right';
  ctx.fillText(daily.endless ? `ENDLESS · DIVE ${daily.endless}` : `NO. ${daily.number}`, CARD_W - pad, pad + 50);
  ctx.textAlign = 'left';

  // The big number
  const guess = game.guess;
  const pct = guess?.correct ? guess.developed : out.developed;
  ctx.fillStyle = LIGHT;
  ctx.font = '400 28px "IBM Plex Mono", ui-monospace, monospace';
  const eyebrow = guess?.correct ? 'NAMED THE PHOTOGRAPH AT' : 'THE PHOTOGRAPH DEVELOPED TO';
  ctx.fillText(eyebrow, pad, 720);
  ctx.fillStyle = INK;
  ctx.font = '400 340px "Instrument Serif", Georgia, serif';
  ctx.fillText(`${pct}%`, pad - 12, 1000);
  ctx.font = '400 38px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = SOFT;
  const verdict = guess ? (guess.correct ? `Guessed it${guess.early ? ` after prompt ${guess.afterRound}` : ''} · ${dayTotal(game)} points` : `${guess.penalty ? `Early guess missed (−${guess.penalty})` : 'Guess missed'} · ${dayTotal(game)} points`) : `${dayTotal(game)} points`;
  ctx.fillText(verdict, pad, 1068);

  // Seven blocks, one per prompt
  const gap = 14;
  const bw = (CARD_W - pad * 2 - gap * 6) / 7;
  out.tiers.forEach((id, i) => {
    const x = pad + i * (bw + gap);
    roundRect(ctx, x, 1118, bw, 74, 10);
    if (id) {
      ctx.fillStyle = tierById(id).color;
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(237, 228, 211, 0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });

  // Footer
  ctx.fillStyle = 'rgba(237, 228, 211, 0.25)';
  ctx.fillRect(pad, 1236, CARD_W - pad * 2, 2);
  ctx.font = '400 26px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillStyle = SOFT;
  const counts = [...TIERS].reverse().map((t) => [t.label, out.tiers.filter((x) => x === t.id).length] as const).filter(([, n]) => n > 0).slice(0, 3);
  ctx.fillText(counts.map(([l, n]) => `${n} ${l}`).join(' · '), pad, 1290);
  ctx.textAlign = 'right';
  ctx.fillText(host, CARD_W - pad, 1290);
  ctx.textAlign = 'left';
  return canvas;
}

export async function shareCardBlob(game: GameState, daily: DailySet, host: string): Promise<Blob | null> {
  const canvas = await drawShareCard(game, daily, host);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

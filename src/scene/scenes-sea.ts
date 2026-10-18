import { Renderer, apply, compose, cylinder, hsl, lerp, merge, place, poly, rng, shade, sphere, type Mesh, type RGB, type V3 } from './engine';

export type SceneFn = (r: Renderer, t: number) => void;

/** Yaw (about Y) that points a model's local +X along (dx, dz). */
export const faceDir = (dx: number, dz: number) => Math.atan2(-dz, dx);

/* ------------------------------------------------------------ shared bits */

function motes(r: Renderer, t: number, seed: number, count: number, spread: V3, rise: number, color: RGB, size = 0.03, alpha = 0.55) {
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * spread[0];
    const y0 = rand() * spread[1];
    const z = (rand() - 0.5) * spread[2];
    const drift = rand() * 6.28;
    const y = (((y0 + t * rise * (0.5 + rand())) % spread[1]) + spread[1]) % spread[1] - spread[1] / 2;
    r.dot([x + Math.sin(t * 0.4 + drift) * 0.25, y, z], size * (0.5 + rand()), color, alpha * (0.4 + rand() * 0.6));
  }
}

/* ----------------------------------------------------------------- microbe */

const microbeBody = sphere(1, 9, 12, (la, lo) => hsl(160 + la * 40 + Math.sin(lo * 18) * 6, 0.55, 0.5), { a: 0.5 });
const microbeCore = sphere(0.36, 6, 8, [255, 214, 130], { glow: 0.55 });
const microbeBit = sphere(0.13, 5, 6, [140, 255, 205], { glow: 0.7 });

export const microbe: SceneFn = (r, t) => {
  r.gradient([[0, '#031f27'], [0.7, '#02121a'], [1, '#00070b']]);
  // hydrothermal vents glowing far below
  const g = r.ctx.createRadialGradient(r.w * 0.5, r.h * 1.05, 0, r.w * 0.5, r.h * 1.05, r.h * 0.9);
  g.addColorStop(0, `rgba(255,120,60,${0.28 * r.master})`);
  g.addColorStop(1, 'rgba(255,120,60,0)');
  r.ctx.fillStyle = g;
  r.ctx.fillRect(0, 0, r.w, r.h);
  r.fog = { color: [2, 12, 16], near: 6, far: 20 };
  r.orbit([0.4, 0, 0], 6.2, t * 0.22, 0.2 + 0.08 * Math.sin(t * 0.3));
  motes(r, t, 11, 70, [18, 12, 14], 0.25, [190, 225, 225], 0.045, 0.6);

  const pulse = 1 + 0.035 * Math.sin(t * 2.4);
  const spin = place([0, Math.sin(t * 0.5) * 0.15, 0], [0.2 * Math.sin(t * 0.4), t * 0.35, 0.1 * Math.sin(t * 0.7)], [1.2 * pulse, 0.95, 0.95 / pulse]);
  r.mesh(microbeBody, spin);
  r.mesh(microbeCore, place([0.1, 0.05, 0], [0, 0, 0], 1));
  for (let i = 0; i < 6; i++) {
    const a = t * (0.5 + i * 0.07) + i * 1.05;
    r.mesh(microbeBit, place([Math.cos(a) * 0.75, Math.sin(a * 1.3) * 0.4, Math.sin(a) * 0.5]));
  }
  r.glow([0.1, 0.05, 0], 1.9, [120, 255, 200], 0.28);

  // flagellum: a travelling wave off the back of the cell
  const tail: V3[] = [];
  for (let k = 0; k <= 14; k++) {
    const s = k / 14;
    tail.push([-1.15 * Math.cos(t * 0.35) - s * 2.6, Math.sin(t * 5 - s * 7) * 0.4 * s, Math.cos(t * 4.3 - s * 6) * 0.25 * s]);
  }
  r.path(tail, 0.085, [150, 255, 215], 0.9);
  // cilia
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * 6.283 + t * 0.35;
    const x = Math.cos(a) * 1.2, z = Math.sin(a) * 0.95;
    const w = Math.sin(t * 6 + i) * 0.12;
    r.line([x, 0.0, z], [x * 1.25 + w, w * 1.2, z * 1.25], 0.03, [150, 255, 215], 0.7);
  }
};

/* ------------------------------------------------------------- jellyfish */

const bell = sphere(1, 12, 16, (la, lo) => hsl(305 + la * 30, 0.7, 0.62 + 0.04 * Math.sin(lo * 40)), { a: 0.55, top: true });
const bellCore = sphere(0.5, 6, 8, [255, 150, 230], { a: 0.5, glow: 0.8, top: true });

function jelly(r: Renderer, t: number, at: V3, scale: number, phase: number, hue = 305) {
  const k = Math.sin(t * 2.2 + phase);
  const sx = (1 + 0.1 * k) * scale, sy = (1 - 0.16 * k) * scale;
  const base = place(at, [0.12 * Math.sin(t * 0.7 + phase), t * 0.3 + phase, 0], [sx, sy, sx]);
  r.mesh(bell, base);
  r.mesh(bellCore, compose(base, place([0, 0.05, 0], [0, 0, 0], 0.8)));
  r.glow([at[0], at[1] + 0.3 * scale, at[2]], 3.2 * scale, [255, 120, 220], 0.2);
  const ring = 0.85;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 6.283;
    const pts: V3[] = [];
    for (let s = 0; s <= 12; s++) {
      const q = s / 12;
      const sway = Math.sin(t * 1.6 - q * 4 + i * 0.7 + phase) * 0.28 * q;
      pts.push([at[0] + (Math.cos(a) * ring * scale + sway) * 1, at[1] - q * 3.4 * scale + k * 0.1 * (1 - q), at[2] + Math.sin(a) * ring * scale + Math.cos(t * 1.3 - q * 3 + i) * 0.2 * q]);
    }
    r.path(pts, 0.035 * scale, hsl(hue + (i % 3) * 14, 0.8, 0.72), 0.55);
  }
  // frilled oral arms
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 6.283 + 0.4;
    const pts: V3[] = [];
    for (let s = 0; s <= 8; s++) {
      const q = s / 8;
      pts.push([at[0] + Math.cos(a) * 0.25 * scale + Math.sin(t * 1.2 - q * 3 + i) * 0.18 * q, at[1] - q * 2.2 * scale, at[2] + Math.sin(a) * 0.25 * scale]);
    }
    r.path(pts, 0.09 * scale, [255, 190, 240], 0.45);
  }
}

export const jellyfish: SceneFn = (r, t) => {
  r.gradient([[0, '#050b2e'], [0.6, '#03071d'], [1, '#010208']]);
  r.fog = { color: [3, 6, 24], near: 7, far: 24 };
  r.orbit([0, -0.4, 0], 8.2, t * 0.12 + 0.4, 0.12);
  motes(r, t, 5, 60, [20, 14, 16], 0.18, [160, 190, 255], 0.04, 0.5);
  jelly(r, t, [3.4, 1.8 + Math.sin(t * 0.5) * 0.3, -5], 0.55, 1.7, 200);
  jelly(r, t, [-3.6, -0.2 + Math.sin(t * 0.6 + 2) * 0.3, -3], 0.45, 3.1, 180);
  jelly(r, t, [0, 0.5 + Math.sin(t * 0.7) * 0.5, 0], 1, 0);
  const rand = rng(77);
  for (let i = 0; i < 26; i++) {
    const p: V3 = [(rand() - 0.5) * 14, (rand() - 0.5) * 8, (rand() - 0.5) * 10];
    const flick = 0.35 + 0.65 * Math.max(0, Math.sin(t * (0.8 + rand()) + rand() * 6));
    r.glow(p, 0.45, hsl(190 + rand() * 120, 0.9, 0.7), 0.5 * flick);
  }
};

/* ------------------------------------------------------------------ fish */

function fishModel(body: RGB, belly: RGB, fin: RGB): { hull: Mesh; tail: Mesh } {
  const hull = merge([
    [sphere(1, 8, 12, (la) => (la > 0.62 ? belly : body)), place([0, 0, 0], [0, 0, 0], [1.5, 0.58, 0.36])],
    [poly([[-0.1, 0.5, 0], [0.5, 0.5, 0], [-0.5, 1.15, 0]], fin), place()],
    [poly([[0.1, -0.5, 0], [0.5, -0.5, 0], [0.2, -1.0, 0]], fin), place()],
    [poly([[0.4, -0.1, 0.3], [0.9, -0.3, 0.9], [0.2, -0.4, 0.4]], fin), place()],
    [poly([[0.4, -0.1, -0.3], [0.9, -0.3, -0.9], [0.2, -0.4, -0.4]], fin), place()],
  ]);
  const tail = poly([[0, 0, 0], [-0.9, 0.7, 0], [-0.6, 0, 0], [-0.9, -0.7, 0]], fin);
  return { hull, tail };
}

const mainFish = fishModel([255, 150, 70], [255, 232, 190], [255, 96, 60]);
const bluefish = fishModel([90, 170, 230], [200, 230, 250], [60, 130, 210]);
const eyeBall = sphere(0.1, 4, 6, [255, 255, 255]);

function drawFish(r: Renderer, f: { hull: Mesh; tail: Mesh }, at: V3, yaw: number, scale: number, wag: number) {
  const m = place(at, [0, yaw, wag * 0.12], scale);
  r.mesh(f.hull, m);
  r.mesh(f.tail, compose(m, place([-1.4, 0, 0], [0, wag * 0.55, 0])));
  r.mesh(eyeBall, compose(m, place([0.95, 0.12, 0.28])));
  r.mesh(eyeBall, compose(m, place([0.95, 0.12, -0.28])));
  r.dot(apply(m, [1.02, 0.12, 0.33]), 0.05 * scale, [10, 10, 20]);
  r.dot(apply(m, [1.02, 0.12, -0.33]), 0.05 * scale, [10, 10, 20]);
}

export const fish: SceneFn = (r, t) => {
  r.gradient([[0, '#0a6a9c'], [0.45, '#06456f'], [1, '#021a30']]);
  // slanting light shafts
  const ctx = r.ctx;
  for (let i = 0; i < 6; i++) {
    const x = r.w * (0.1 + i * 0.17) + Math.sin(t * 0.3 + i) * 18;
    const g = ctx.createLinearGradient(x, 0, x - r.w * 0.2, r.h);
    g.addColorStop(0, `rgba(190,235,255,${0.2 * r.master})`);
    g.addColorStop(1, 'rgba(190,235,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 18, 0);
    ctx.lineTo(x + 26, 0);
    ctx.lineTo(x - r.w * 0.2 + 70, r.h);
    ctx.lineTo(x - r.w * 0.2 - 40, r.h);
    ctx.closePath();
    ctx.fill();
  }
  r.fog = { color: [4, 40, 70], near: 6, far: 26 };
  r.orbit([0, 0, 0], 9, Math.sin(t * 0.15) * 0.35, 0.1);

  // kelp on the sea bed
  const rand = rng(31);
  for (let i = 0; i < 10; i++) {
    const bx = (rand() - 0.5) * 16, bz = -2 - rand() * 6, hgt = 3 + rand() * 2.5;
    const pts: V3[] = [];
    for (let s = 0; s <= 8; s++) pts.push([bx + Math.sin(t * 0.9 + i + s * 0.6) * 0.25 * (s / 8), -4 + (s / 8) * hgt, bz]);
    r.path(pts, 0.09, [40, 150, 90], 0.9);
  }
  // seabed rocks
  for (let i = 0; i < 9; i++) r.mesh(sphere(1, 4, 6, [60, 78, 90]), place([(rand() - 0.5) * 18, -4.2, -3 - rand() * 6], [rand(), rand(), 0], [0.8 + rand(), 0.4 + rand() * 0.4, 0.8 + rand()]));

  // the player: circling the camera
  const th = t * 0.55;
  const R = 3.3;
  const pos: V3 = [Math.cos(th) * R, Math.sin(t * 0.9) * 0.45, Math.sin(th) * R * 0.8 - 1];
  drawFish(r, mainFish, pos, faceDir(-Math.sin(th) * R, Math.cos(th) * R * 0.8), 1.15, Math.sin(t * 9));
  // a school shadows it
  for (let i = 0; i < 18; i++) {
    const a = t * (0.38 + (i % 5) * 0.015) + i * 0.42;
    const rr = 5.2 + (i % 4) * 0.55;
    const p: V3 = [Math.cos(a) * rr, 1.6 + Math.sin(i * 1.7 + t * 0.6) * 1.1, Math.sin(a) * rr * 0.7 - 2];
    drawFish(r, bluefish, p, faceDir(-Math.sin(a) * rr, Math.cos(a) * rr * 0.7), 0.4, Math.sin(t * 11 + i));
  }
  motes(r, t, 3, 40, [16, 12, 12], 0.7, [220, 245, 255], 0.05, 0.7);
};

/* --------------------------------------------------------------- dolphin */

const dolphinHull = merge([
  [sphere(1, 9, 12, (la) => (la > 0.58 ? [225, 235, 245] : [70, 105, 150])), place([0, 0, 0], [0, 0, 0], [2.3, 0.62, 0.58])],
  [cylinder(0.01, 0.2, 0.9, 7, [95, 125, 165]), place([2.5, -0.1, 0], [0, 0, -Math.PI / 2 + 0.05])],
  [poly([[0.2, 0.55, 0], [-0.5, 0.58, 0], [-0.75, 1.4, 0]], [55, 85, 130]), place()],
  [poly([[0.8, -0.35, 0.3], [0.3, -0.45, 0.4], [0.2, -1.0, 1.1]], [55, 85, 130]), place()],
  [poly([[0.8, -0.35, -0.3], [0.3, -0.45, -0.4], [0.2, -1.0, -1.1]], [55, 85, 130]), place()],
]);
const dolphinTail = poly([[0, 0, 0], [-0.9, 0.1, 1.15], [-0.55, 0.05, 0], [-0.9, 0.1, -1.15]], [55, 85, 130]);

function dolphin(r: Renderer, x: number, y: number, pitch: number, scale: number, t: number) {
  const m = place([x, y, 0], [0, 0, pitch], scale);
  r.mesh(dolphinHull, m);
  r.mesh(dolphinTail, compose(m, place([-2.2, 0, 0], [0, 0, Math.sin(t * 7) * 0.35])));
  r.dot(apply(m, [1.75, 0.22, 0.42]), 0.06 * scale, [10, 14, 24]);
  r.dot(apply(m, [1.75, 0.22, -0.42]), 0.06 * scale, [10, 14, 24]);
}

export const dolphinScene: SceneFn = (r, t) => {
  r.gradient([[0, '#3a8fd1'], [0.42, '#9bd0ef'], [0.5, '#f6ddb0'], [1, '#0a5c88']]);
  r.glow([-7, 5, -25], 10, [255, 240, 190], 0.65);
  r.fog = { color: [160, 215, 240], near: 14, far: 52 };
  r.cam.pos = [0, 1.9, 11];
  r.cam.target = [0, 1.8, 0];
  r.cam.fov = 0.95;
  r.light = [0.4, 0.8, 0.5];

  // the sea: a moving grid of coloured facets
  const N = 15, S = 2.4;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x0 = (i - N / 2) * S, z0 = -34 + j * S;
      const h = (x: number, z: number) => Math.sin(x * 0.45 + t * 1.3) * 0.18 + Math.cos(z * 0.5 + t * 1.1) * 0.16;
      const p = (x: number, z: number): V3 => [x, h(x, z) - 0.15, z];
      const shadeK = 0.78 + 0.22 * Math.sin(i * 1.7 + j * 2.3 + t * 0.7);
      r.mesh(poly([p(x0, z0), p(x0 + S, z0), p(x0 + S, z0 + S), p(x0, z0 + S)], shade([22, 128, 178], shadeK)), place());
    }
  }

  const period = 4.4;
  const lead = (t % period) / period;
  const arc = (u: number) => ({ x: lerp(-10, 10, u), y: 5 * 4 * u * (1 - u) - 0.9 });
  const a = arc(lead), b = arc(Math.min(1, lead + 0.01));
  dolphin(r, a.x, a.y, Math.atan2(b.y - a.y, b.x - a.x), 1.2, t);
  const lead2 = ((t + 2.6) % 5.2) / 5.2;
  const c = arc(lead2), d = arc(Math.min(1, lead2 + 0.01));
  dolphin(r, c.x * 0.7 - 2, c.y * 0.55 - 0.4, Math.atan2(d.y - c.y, (d.x - c.x) * 1.4), 0.6, t + 1);

  // splashes at the exit and re-entry points
  for (const [phase, dir] of [[0.12, -1], [0.88, 1]] as Array<[number, number]>) {
    const age = (((lead - phase) % 1) + 1) % 1 * period;
    if (age < 1.3) {
      const e = arc(phase);
      for (let k = 0; k < 16; k++) {
        const ang = (k / 16) * 3.1 + 0.02;
        const v = 3 + (k % 4) * 0.6;
        r.dot([e.x + Math.cos(ang) * v * age * 0.6 * dir * 0.5, Math.max(-0.3, Math.sin(ang) * v * age - 4.2 * age * age) , 0.2 * (k % 3 - 1)], 0.09, [235, 248, 255], 0.9 * (1 - age / 1.3));
      }
    }
  }
};


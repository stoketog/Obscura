/**
 * A tiny software 3D engine for the ascent scenes.
 *
 * Why not three.js? The scenes are small, low-poly and stylised, so a ~300-line
 * renderer (perspective projection, flat shading, painter's algorithm) keeps the
 * bundle tiny, works everywhere a 2D canvas does, and needs no dependencies.
 */

export type V3 = [number, number, number];
export type RGB = [number, number, number];

export interface MeshFace {
  /** Indices into `Mesh.v`. */
  i: number[];
  c: RGB;
  /** Opacity 0–1 (default 1). */
  a?: number;
  /** 0–1: how much of the colour ignores lighting (windows, sun, engines). */
  glow?: number;
  /** Draw both sides (flat wings, sails). */
  both?: boolean;
}

export interface Mesh {
  v: V3[];
  f: MeshFace[];
  /** Local centre, used to orient face normals outwards. */
  c: V3;
}

/* ---------------------------------------------------------------- vectors */

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------- transforms */

/** 3×4 affine matrix, row-major: [r00 r01 r02 tx, r10 r11 r12 ty, r20 r21 r22 tz]. */
export type Mat = number[];

export const IDENTITY: Mat = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];

/** Build from position, Euler rotation (x then y then z, radians) and scale. */
export function place(p: V3 = [0, 0, 0], r: V3 = [0, 0, 0], s: number | V3 = 1): Mat {
  const [sx, sy, sz] = typeof s === 'number' ? [s, s, s] : s;
  const cx = Math.cos(r[0]), sxn = Math.sin(r[0]);
  const cy = Math.cos(r[1]), syn = Math.sin(r[1]);
  const cz = Math.cos(r[2]), szn = Math.sin(r[2]);
  // R = Rz * Ry * Rx
  const r00 = cz * cy, r01 = cz * syn * sxn - szn * cx, r02 = cz * syn * cx + szn * sxn;
  const r10 = szn * cy, r11 = szn * syn * sxn + cz * cx, r12 = szn * syn * cx - cz * sxn;
  const r20 = -syn, r21 = cy * sxn, r22 = cy * cx;
  return [r00 * sx, r01 * sy, r02 * sz, p[0], r10 * sx, r11 * sy, r12 * sz, p[1], r20 * sx, r21 * sy, r22 * sz, p[2]];
}

/** a ∘ b (apply b first, then a). */
export function compose(a: Mat, b: Mat): Mat {
  const o = new Array<number>(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c];
    o[r * 4 + 3] = a[r * 4] * b[3] + a[r * 4 + 1] * b[7] + a[r * 4 + 2] * b[11] + a[r * 4 + 3];
  }
  return o;
}

export const apply = (m: Mat, v: V3): V3 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3],
  m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7],
  m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11],
];

/* --------------------------------------------------------------- meshes */

function finish(v: V3[], f: MeshFace[]): Mesh {
  const c: V3 = [0, 0, 0];
  for (const p of v) {
    c[0] += p[0];
    c[1] += p[1];
    c[2] += p[2];
  }
  const n = Math.max(1, v.length);
  return { v, f, c: [c[0] / n, c[1] / n, c[2] / n] };
}

export function box(w: number, h: number, d: number, color: RGB, opts: { glow?: number; a?: number } = {}): Mesh {
  const x = w / 2, y = h / 2, z = d / 2;
  const v: V3[] = [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]];
  const idx = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]];
  return finish(v, idx.map((i) => ({ i, c: color, ...opts })));
}

/** UV sphere (or ellipsoid via transform). `colorAt` can vary colour per face. */
export function sphere(r: number, lat: number, lon: number, color: RGB | ((la: number, lo: number) => RGB), opts: { glow?: number; a?: number; top?: boolean } = {}): Mesh {
  const v: V3[] = [];
  const f: MeshFace[] = [];
  const rows = opts.top ? Math.ceil(lat / 2) : lat;
  for (let i = 0; i <= rows; i++) {
    const th = (i / lat) * Math.PI;
    for (let j = 0; j < lon; j++) {
      const ph = (j / lon) * Math.PI * 2;
      v.push([r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)]);
    }
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < lon; j++) {
      const a = i * lon + j, b = i * lon + ((j + 1) % lon), c = (i + 1) * lon + ((j + 1) % lon), d = (i + 1) * lon + j;
      const col = typeof color === 'function' ? color((i + 0.5) / lat, (j + 0.5) / lon) : color;
      f.push({ i: [a, b, c, d], c: col, a: opts.a, glow: opts.glow });
    }
  }
  return finish(v, f);
}

/** Cylinder / cone / frustum along Y. r1 at the bottom, r2 at the top. */
export function cylinder(r1: number, r2: number, h: number, seg: number, color: RGB, opts: { glow?: number; a?: number; caps?: boolean } = {}): Mesh {
  const v: V3[] = [];
  const f: MeshFace[] = [];
  for (let j = 0; j < seg; j++) {
    const ph = (j / seg) * Math.PI * 2;
    v.push([r1 * Math.cos(ph), -h / 2, r1 * Math.sin(ph)]);
  }
  for (let j = 0; j < seg; j++) {
    const ph = (j / seg) * Math.PI * 2;
    v.push([r2 * Math.cos(ph), h / 2, r2 * Math.sin(ph)]);
  }
  for (let j = 0; j < seg; j++) f.push({ i: [j, (j + 1) % seg, seg + ((j + 1) % seg), seg + j], c: color, a: opts.a, glow: opts.glow });
  if (opts.caps !== false) {
    f.push({ i: Array.from({ length: seg }, (_, j) => j), c: color, a: opts.a, glow: opts.glow });
    f.push({ i: Array.from({ length: seg }, (_, j) => seg + j), c: color, a: opts.a, glow: opts.glow });
  }
  return finish(v, f);
}

/** A flat polygon (given in local XY plane unless you pass 3D points). Drawn two-sided. */
export function poly(points: V3[], color: RGB, opts: { glow?: number; a?: number } = {}): Mesh {
  return finish(points, [{ i: points.map((_, k) => k), c: color, both: true, ...opts }]);
}

/** Flat ring/disc in the XZ plane (y = 0). */
export function disc(r: number, seg: number, color: RGB, opts: { inner?: number; glow?: number; a?: number } = {}): Mesh {
  const v: V3[] = [];
  const f: MeshFace[] = [];
  const inner = opts.inner ?? 0;
  if (inner > 0) {
    for (let j = 0; j < seg; j++) {
      const ph = (j / seg) * Math.PI * 2;
      v.push([r * Math.cos(ph), 0, r * Math.sin(ph)]);
    }
    for (let j = 0; j < seg; j++) {
      const ph = (j / seg) * Math.PI * 2;
      v.push([inner * Math.cos(ph), 0, inner * Math.sin(ph)]);
    }
    for (let j = 0; j < seg; j++) f.push({ i: [j, (j + 1) % seg, seg + ((j + 1) % seg), seg + j], c: color, both: true, glow: opts.glow, a: opts.a });
  } else {
    for (let j = 0; j < seg; j++) {
      const ph = (j / seg) * Math.PI * 2;
      v.push([r * Math.cos(ph), 0, r * Math.sin(ph)]);
    }
    f.push({ i: Array.from({ length: seg }, (_, j) => j), c: color, both: true, glow: opts.glow, a: opts.a });
  }
  return finish(v, f);
}

/** Merge meshes, each placed by its own matrix. Useful for building a model once and reusing it. */
export function merge(parts: Array<[Mesh, Mat?]>): Mesh {
  const v: V3[] = [];
  const f: MeshFace[] = [];
  for (const [m, t] of parts) {
    const base = v.length;
    for (const p of m.v) v.push(t ? apply(t, p) : p);
    for (const face of m.f) f.push({ ...face, i: face.i.map((k) => k + base) });
  }
  return finish(v, f);
}

export const shade = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
export const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const hsl = (h: number, s: number, l: number): RGB => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))) * 255;
  };
  return [f(0), f(8), f(4)];
};

/* -------------------------------------------------------------- renderer */

type Item =
  | { z: number; kind: 0; pts: number[]; fill: string; stroke: boolean }
  | { z: number; kind: 1; x: number; y: number; r: number; sprite: HTMLCanvasElement; a: number }
  | { z: number; kind: 2; x: number; y: number; r: number; fill: string }
  | { z: number; kind: 3; x0: number; y0: number; x1: number; y1: number; w: number; stroke: string };

const spriteCache = new Map<string, HTMLCanvasElement>();
function glowSprite(c: RGB): HTMLCanvasElement {
  const key = c.map((x) => Math.round(x / 8)).join(',');
  let s = spriteCache.get(key);
  if (!s) {
    s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d')!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    const [r, gg, b] = c.map((x) => Math.round(x));
    gr.addColorStop(0, `rgba(${r},${gg},${b},1)`);
    gr.addColorStop(0.25, `rgba(${r},${gg},${b},0.55)`);
    gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    spriteCache.set(key, s);
  }
  return s;
}

export interface Camera {
  pos: V3;
  target: V3;
  fov: number; // vertical, radians
  up: V3;
}

export class Renderer {
  ctx: CanvasRenderingContext2D;
  w = 0;
  h = 0;
  cam: Camera = { pos: [0, 0, 8], target: [0, 0, 0], fov: 0.9, up: [0, 1, 0] };
  light: V3 = norm([0.5, 0.9, 0.6]);
  ambient = 0.45;
  fog: { color: RGB; near: number; far: number } | null = null;
  /** Global opacity for everything this renderer draws (used for cross-fades). */
  master = 1;
  private items: Item[] = [];
  private right: V3 = [1, 0, 0];
  private upv: V3 = [0, 1, 0];
  private fwd: V3 = [0, 0, -1];
  private f = 1;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  private key = '';

  /** Recomputes the camera basis whenever the camera (or canvas size) changed. */
  private prepare() {
    const c = this.cam;
    const key = `${c.pos}|${c.target}|${c.fov}|${c.up}|${this.h}`;
    if (key === this.key) return;
    this.key = key;
    this.fwd = norm(sub(c.target, c.pos));
    this.right = norm(cross(this.fwd, c.up));
    this.upv = cross(this.right, this.fwd);
    this.f = this.h / 2 / Math.tan(c.fov / 2);
  }

  begin() {
    this.items.length = 0;
    this.key = '';
    this.prepare();
  }

  /** World → [screenX, screenY, depth] or null when behind the camera. */
  project(p: V3): [number, number, number] | null {
    this.prepare();
    const d = sub(p, this.cam.pos);
    const z = dot(d, this.fwd);
    if (z < 0.1) return null;
    return [this.w / 2 + (dot(d, this.right) / z) * this.f, this.h / 2 - (dot(d, this.upv) / z) * this.f, z];
  }

  /** Pixels per world unit at depth z. */
  scaleAt(z: number) {
    this.prepare();
    return this.f / z;
  }

  private fogMix(c: RGB, z: number): RGB {
    if (!this.fog) return c;
    const t = clamp((z - this.fog.near) / (this.fog.far - this.fog.near));
    return mix(c, this.fog.color, t * t);
  }

  mesh(m: Mesh, t: Mat, tint?: RGB) {
    const wv = m.v.map((p) => apply(t, p));
    const wc = apply(t, m.c);
    const cam = this.cam.pos;
    for (const face of m.f) {
      const n = face.i.length;
      const a = wv[face.i[0]], b = wv[face.i[1]], c = wv[face.i[2]];
      let nm = cross(sub(b, a), sub(c, a));
      let cx = 0, cy = 0, cz = 0;
      for (let k = 0; k < n; k++) {
        const p = wv[face.i[k]];
        cx += p[0];
        cy += p[1];
        cz += p[2];
      }
      const fc: V3 = [cx / n, cy / n, cz / n];
      if (!face.both && dot(nm, sub(fc, wc)) < 0) nm = mul(nm, -1);
      const toCam = sub(cam, fc);
      if (face.both) {
        if (dot(nm, toCam) < 0) nm = mul(nm, -1);
      } else if (dot(nm, toCam) <= 0) continue;
      const nn = norm(nm);
      const lam = Math.max(0, dot(nn, this.light));
      const lit = this.ambient + (1 - this.ambient) * lam;
      const gl = face.glow ?? 0;
      const k = lit * (1 - gl) + gl;
      let col: RGB = [face.c[0] * k, face.c[1] * k, face.c[2] * k];
      if (tint) col = mix(col, tint, 0.35);
      const pts: number[] = [];
      let zsum = 0;
      let ok = true;
      for (let q = 0; q < n; q++) {
        const pr = this.project(wv[face.i[q]]);
        if (!pr) {
          ok = false;
          break;
        }
        pts.push(pr[0], pr[1]);
        zsum += pr[2];
      }
      if (!ok) continue;
      const z = zsum / n;
      col = this.fogMix(col, z);
      const alpha = (face.a ?? 1) * this.master;
      const fill = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${alpha.toFixed(3)})`;
      this.items.push({ z, kind: 0, pts, fill, stroke: (face.a ?? 1) >= 0.98 });
    }
  }

  /** Soft glowing billboard. `radius` is in world units. */
  glow(p: V3, radius: number, color: RGB, alpha = 1) {
    const pr = this.project(p);
    if (!pr) return;
    this.items.push({ z: pr[2], kind: 1, x: pr[0], y: pr[1], r: radius * this.f / pr[2], sprite: glowSprite(color), a: alpha * this.master });
  }

  /** Solid billboard dot. */
  dot(p: V3, radius: number, color: RGB, alpha = 1) {
    const pr = this.project(p);
    if (!pr) return;
    const col = this.fogMix(color, pr[2]);
    this.items.push({ z: pr[2], kind: 2, x: pr[0], y: pr[1], r: Math.max(0.4, (radius * this.f) / pr[2]), fill: `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${(alpha * this.master).toFixed(3)})` });
  }

  line(a: V3, b: V3, width: number, color: RGB, alpha = 1) {
    const pa = this.project(a), pb = this.project(b);
    if (!pa || !pb) return;
    const z = (pa[2] + pb[2]) / 2;
    const col = this.fogMix(color, z);
    this.items.push({ z, kind: 3, x0: pa[0], y0: pa[1], x1: pb[0], y1: pb[1], w: Math.max(0.5, (width * this.f) / z), stroke: `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${(alpha * this.master).toFixed(3)})` });
  }

  /** A polyline in world space, drawn as joined segments. */
  path(points: V3[], width: number, color: RGB, alpha = 1) {
    for (let i = 0; i < points.length - 1; i++) this.line(points[i], points[i + 1], width, color, alpha);
  }

  flush() {
    const ctx = this.ctx;
    this.items.sort((p, q) => q.z - p.z);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const it of this.items) {
      switch (it.kind) {
        case 0: {
          ctx.beginPath();
          ctx.moveTo(it.pts[0], it.pts[1]);
          for (let k = 2; k < it.pts.length; k += 2) ctx.lineTo(it.pts[k], it.pts[k + 1]);
          ctx.closePath();
          ctx.fillStyle = it.fill;
          ctx.fill();
          if (it.stroke) {
            ctx.strokeStyle = it.fill;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
          break;
        }
        case 1: {
          const prev = ctx.globalAlpha;
          ctx.globalAlpha = clamp(it.a);
          ctx.drawImage(it.sprite, it.x - it.r, it.y - it.r, it.r * 2, it.r * 2);
          ctx.globalAlpha = prev;
          break;
        }
        case 2: {
          ctx.beginPath();
          ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
          ctx.fillStyle = it.fill;
          ctx.fill();
          break;
        }
        case 3: {
          ctx.beginPath();
          ctx.moveTo(it.x0, it.y0);
          ctx.lineTo(it.x1, it.y1);
          ctx.strokeStyle = it.stroke;
          ctx.lineWidth = it.w;
          ctx.stroke();
          break;
        }
      }
    }
    this.items.length = 0;
  }

  /** Vertical sky/sea gradient filling the canvas. Colours are CSS strings. */
  gradient(stops: Array<[number, string]>) {
    const g = this.ctx.createLinearGradient(0, 0, 0, this.h);
    for (const [o, c] of stops) g.addColorStop(o, c);
    const prev = this.ctx.globalAlpha;
    this.ctx.globalAlpha = this.master;
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = prev;
  }

  /** Orbit camera helper. */
  orbit(target: V3, radius: number, azimuth: number, elevation: number) {
    this.cam.target = target;
    this.cam.pos = [
      target[0] + radius * Math.cos(elevation) * Math.sin(azimuth),
      target[1] + radius * Math.sin(elevation),
      target[2] + radius * Math.cos(elevation) * Math.cos(azimuth),
    ];
  }
}

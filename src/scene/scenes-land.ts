import { Renderer, apply, box, compose, cylinder, hsl, lerp, merge, place, poly, rng, shade, sphere, type Mesh, type RGB, type V3 } from './engine';
import { faceDir, type SceneFn } from './scenes-sea';

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

/* ----------------------------------------------------------------- human */

const torso = box(0.5, 0.68, 0.28, [40, 150, 170]);
const hips = box(0.46, 0.2, 0.26, [38, 44, 70]);
const head = sphere(0.2, 6, 8, [236, 190, 150]);
const hair = sphere(0.215, 6, 8, [50, 34, 28], { top: true });
const thigh = box(0.19, 0.4, 0.2, [38, 44, 70]);
const shin = box(0.17, 0.4, 0.18, [38, 44, 70]);
const boot = box(0.2, 0.1, 0.34, [235, 235, 240]);
const upperArm = box(0.13, 0.32, 0.13, [40, 150, 170]);
const foreArm = box(0.11, 0.3, 0.11, [236, 190, 150]);
const pack = box(0.38, 0.5, 0.18, [235, 120, 60]);

function walker(r: Renderer, t: number, at: V3) {
  const ph = t * 5.2;
  const bob = Math.abs(Math.sin(ph)) * 0.06;
  const base = place([at[0], at[1] + bob, at[2]]);
  const hipY = 0.88;
  r.mesh(hips, compose(base, place([0, hipY, 0])));
  r.mesh(torso, compose(base, place([0, hipY + 0.44, 0], [0, Math.sin(ph) * 0.08, 0])));
  r.mesh(pack, compose(base, place([0, hipY + 0.46, 0.2], [0, Math.sin(ph) * 0.08, 0])));
  r.mesh(head, compose(base, place([0, hipY + 0.95, 0])));
  r.mesh(hair, compose(base, place([0, hipY + 0.98, 0.02])));
  for (const side of [-1, 1]) {
    const s = Math.sin(ph + (side > 0 ? 0 : Math.PI));
    const hip = compose(base, place([side * 0.12, hipY - 0.05, 0], [s * 0.7, 0, 0]));
    r.mesh(thigh, compose(hip, place([0, -0.2, 0])));
    const knee = compose(hip, place([0, -0.4, 0], [Math.max(0, -s) * 0.9, 0, 0]));
    r.mesh(shin, compose(knee, place([0, -0.2, 0])));
    r.mesh(boot, compose(knee, place([0, -0.43, -0.07])));
    const sh = compose(base, place([side * 0.33, hipY + 0.66, 0], [-s * 0.6, 0, 0]));
    r.mesh(upperArm, compose(sh, place([0, -0.15, 0])));
    const el = compose(sh, place([0, -0.3, 0], [-0.4 - Math.max(0, s) * 0.3, 0, 0]));
    r.mesh(foreArm, compose(el, place([0, -0.15, 0])));
  }
  // soft contact shadow
  r.mesh(sphere(1, 4, 8, [0, 0, 0], { a: 0.35 }), place([at[0], at[1] + 0.02, at[2]], [0, 0, 0], [0.45, 0.01, 0.35]));
}

const building = (w: number, h: number, d: number, tone: number) => box(w, h, d, shade([60 + tone * 40, 66 + tone * 36, 94 + tone * 30], 1));

export const human: SceneFn = (r, t) => {
  r.gradient([[0, '#161a3f'], [0.45, '#8a4a78'], [0.62, '#f09a5c'], [1, '#2a1f3a']]);
  r.glow([0, 3.3, -36], 11, [255, 170, 100], 0.55);
  r.fog = { color: [118, 78, 108], near: 10, far: 54 };
  r.cam.pos = [2.4, 2.5, 5.6];
  r.cam.target = [0, 1.3, -5];
  r.cam.fov = 0.95;
  r.light = [-0.3, 0.8, 0.5];

  const speed = 2.1;
  const s = t * speed;
  const SLOT = 6;
  const n = Math.floor(s / SLOT);
  const off = s % SLOT;

  // road, kerbs and pavements
  r.mesh(poly([[-3, 0, 8], [3, 0, 8], [3, 0, -60], [-3, 0, -60]], [46, 48, 62]), place());
  for (const side of [-1, 1]) {
    r.mesh(poly([[side * 3, 0.05, 8], [side * 5.4, 0.05, 8], [side * 5.4, 0.05, -60], [side * 3, 0.05, -60]], [150, 140, 150]), place());
    r.mesh(poly([[side * 3, 0, 8], [side * 3, 0.1, 8], [side * 3, 0.1, -60], [side * 3, 0, -60]], [170, 160, 165]), place());
  }
  // lane dashes and zebra
  for (let k = 0; k < 14; k++) {
    const z = 6 - k * 4 + (s % 4);
    r.mesh(poly([[-0.08, 0.02, z], [0.08, 0.02, z], [0.08, 0.02, z - 1.6], [-0.08, 0.02, z - 1.6]], [235, 225, 190]), place());
  }

  // buildings and lamps travel past
  for (let k = -1; k < 11; k++) {
    const z = 6 - k * SLOT + off;
    const id = k + n;
    for (const side of [-1, 1]) {
      const sid = id * 2 + (side > 0 ? 1 : 0);
      const h = 6 + hash(sid) * 12;
      const w = 4 + hash(sid + 9) * 2.4;
      const x = side * (5.6 + w / 2);
      r.mesh(building(w, h, 5, hash(sid + 3)), place([x, h / 2, z]));
      // lit windows on the street-facing wall
      const floors = Math.min(9, Math.floor(h / 1.5));
      for (let f = 0; f < floors; f++) {
        for (let c = 0; c < 3; c++) {
          if (hash(sid * 31 + f * 7 + c) < 0.45) continue;
          const wy = 1.4 + f * 1.4;
          const wz = z - 1.6 + c * 1.6;
          const wx = side * 5.6;
          r.mesh(poly([[wx, wy, wz - 0.3], [wx, wy, wz + 0.3], [wx, wy + 0.6, wz + 0.3], [wx, wy + 0.6, wz - 0.3]], [255, 214, 140], { glow: 1 }), place());
        }
      }
    }
    // lamp posts
    for (const side of [-1, 1]) {
      const lz = z - 3;
      r.mesh(cylinder(0.05, 0.05, 3.4, 5, [55, 55, 66]), place([side * 3.3, 1.7, lz]));
      r.mesh(box(0.5, 0.06, 0.12, [55, 55, 66]), place([side * 3.05, 3.4, lz]));
      r.glow([side * 2.85, 3.3, lz], 1.5, [255, 200, 120], 0.8);
    }
  }
  // oncoming headlights
  for (let i = 0; i < 2; i++) {
    const z = 4 - (((t * 5 + i * 18) % 40) - 0);
    r.glow([1.5, 0.45, z], 0.55, [255, 244, 210], 0.9);
    r.glow([1.1, 0.45, z], 0.5, [255, 244, 210], 0.8);
  }
  walker(r, t, [0, 0, 0]);
};

/* ------------------------------------------------------------------ bird */

const birdBody = merge([
  [sphere(1, 7, 10, (la) => (la > 0.55 ? [245, 240, 225] : [70, 120, 190])), place([0, 0, 0], [0, 0, 0], [0.62, 0.26, 0.24])],
  [sphere(0.2, 5, 7, [70, 120, 190]), place([0.6, 0.06, 0])],
  [cylinder(0.0, 0.06, 0.25, 5, [255, 190, 60]), place([0.84, 0.04, 0], [0, 0, -Math.PI / 2])],
  [poly([[-0.5, 0, 0.16], [-0.5, 0, -0.16], [-1.15, 0.0, -0.3], [-1.15, 0, 0.3]], [45, 80, 140]), place()],
]);
const wingL = poly([[0.25, 0, 0], [-0.3, 0, 0], [-0.5, 0, 0.9], [-0.15, 0, 1.45], [0.2, 0, 0.9]], [60, 100, 170]);
const wingR = poly([[0.25, 0, 0], [-0.3, 0, 0], [-0.5, 0, -0.9], [-0.15, 0, -1.45], [0.2, 0, -0.9]], [60, 100, 170]);

function bird(r: Renderer, t: number, at: V3, scale: number, yaw: number, flapSpeed = 7, phase = 0) {
  const flap = Math.sin(t * flapSpeed + phase) * 0.75;
  const m = place(at, [Math.sin(t * 0.9 + phase) * 0.15, yaw, Math.sin(t * 0.7 + phase) * 0.06], scale);
  r.mesh(birdBody, m);
  r.mesh(wingL, compose(m, place([0, 0.05, 0.12], [flap, 0, 0])));
  r.mesh(wingR, compose(m, place([0, 0.05, -0.12], [-flap, 0, 0])));
  r.dot(apply(m, [0.7, 0.12, 0.13]), 0.035 * scale, [10, 10, 20]);
  r.dot(apply(m, [0.7, 0.12, -0.13]), 0.035 * scale, [10, 10, 20]);
}

function cloud(r: Renderer, p: V3, size: number, alpha = 0.9, tint: RGB = [255, 255, 255]) {
  r.glow([p[0], p[1], p[2]], size, tint, alpha * 0.55);
  r.glow([p[0] + size * 0.5, p[1] - size * 0.08, p[2]], size * 0.8, tint, alpha * 0.5);
  r.glow([p[0] - size * 0.55, p[1] - size * 0.1, p[2]], size * 0.75, tint, alpha * 0.5);
}

export const birdScene: SceneFn = (r, t) => {
  r.gradient([[0, '#4aa3e8'], [0.55, '#bfe3f6'], [1, '#fbe3c4']]);
  r.glow([8, 7, -30], 9, [255, 246, 210], 0.7);
  r.fog = { color: [200, 228, 244], near: 12, far: 60 };
  r.cam.pos = [-1.5, 2.2, 7];
  r.cam.target = [1.5, 0.2, 0];
  r.cam.fov = 0.95;
  r.light = [0.3, 0.9, 0.4];

  // scrolling hills
  const sp = t * 4;
  const G = 15, S = 4;
  const height = (x: number, z: number) => Math.sin((x + sp) * 0.16) * 1.9 + Math.cos(z * 0.2 + (x + sp) * 0.07) * 1.6 + Math.sin((x + sp) * 0.41 + z * 0.3) * 0.5;
  for (let i = 0; i < G; i++) {
    for (let j = 0; j < 12; j++) {
      const x0 = -30 + i * S, z0 = -44 + j * S;
      const pts: V3[] = [[x0, height(x0, z0) - 9, z0], [x0 + S, height(x0 + S, z0) - 9, z0], [x0 + S, height(x0 + S, z0 + S) - 9, z0 + S], [x0, height(x0, z0 + S) - 9, z0 + S]];
      const hh = (pts[0][1] + pts[2][1]) / 2 + 9;
      const col: RGB = hh > 1.6 ? [112, 142, 84] : hh > -0.4 ? [88, 160, 92] : [64, 138, 100];
      r.mesh(poly(pts, shade(col, 0.82 + 0.3 * hash(i * 13 + j + Math.floor(0)))), place());
    }
  }
  // drifting clouds
  for (let i = 0; i < 9; i++) {
    const x = ((i * 9 - t * 3 * (0.6 + hash(i) * 0.5)) % 54 + 54) % 54 - 30;
    cloud(r, [x, 1.5 + hash(i + 4) * 5, -8 - hash(i + 8) * 22], 2.4 + hash(i + 2) * 2.4, 0.9);
  }
  // the flock follows
  bird(r, t, [4.2, 4.6 + Math.sin(t * 0.8) * 0.4, -1.5], 0.7, 0, 6.5, 1);
  bird(r, t, [7.2, 3.0 + Math.sin(t * 0.7 + 1) * 0.4, -4], 0.6, 0, 7.5, 2);
  bird(r, t, [1.0, 1.9 + Math.sin(t * 0.8) * 0.35, 0], 1.35, 0, 7, 0);
};

/* ------------------------------------------------------------ helicopter */

const heliHull = merge([
  [sphere(1, 8, 12, (la) => (la > 0.6 ? [230, 232, 238] : [210, 50, 56])), place([0, 0, 0], [0, 0, 0], [1.55, 0.78, 0.7])],
  [sphere(0.62, 6, 10, [90, 150, 210], { a: 0.8, glow: 0.2 }), place([0.95, 0.15, 0], [0, 0, 0], [1, 0.9, 0.95])],
  [cylinder(0.32, 0.12, 3.2, 7, [210, 50, 56]), place([-2.5, 0.2, 0], [0, 0, Math.PI / 2 - 0.05])],
  [poly([[-3.9, 0.3, 0], [-4.35, 1.15, 0], [-3.55, 0.45, 0]], [200, 44, 50]), place()],
  [cylinder(0.11, 0.11, 0.35, 6, [50, 50, 56]), place([0, 0.9, 0])],
  [cylinder(0.04, 0.04, 2.2, 5, [60, 60, 66]), place([0.2, -0.95, 0.55], [0, 0, Math.PI / 2])],
  [cylinder(0.04, 0.04, 2.2, 5, [60, 60, 66]), place([0.2, -0.95, -0.55], [0, 0, Math.PI / 2])],
  [cylinder(0.035, 0.035, 0.45, 5, [60, 60, 66]), place([0.7, -0.75, 0.5])],
  [cylinder(0.035, 0.035, 0.45, 5, [60, 60, 66]), place([-0.5, -0.75, 0.5])],
  [cylinder(0.035, 0.035, 0.45, 5, [60, 60, 66]), place([0.7, -0.75, -0.5])],
  [cylinder(0.035, 0.035, 0.45, 5, [60, 60, 66]), place([-0.5, -0.75, -0.5])],
]);
const blade = box(3.4, 0.03, 0.22, [40, 42, 52]);
const tailBlade = box(0.7, 0.03, 0.1, [40, 42, 52]);

export const helicopterScene: SceneFn = (r, t) => {
  r.gradient([[0, '#10163d'], [0.4, '#6b3d7a'], [0.62, '#f08a58'], [0.8, '#251b3a'], [1, '#0a0a1c']]);
  r.glow([-12, 3, -30], 9, [255, 150, 90], 0.5);
  r.fog = { color: [66, 40, 80], near: 18, far: 70 };
  r.orbit([0, 0.2, 0], 11, 0.5 + Math.sin(t * 0.25) * 0.6, 0.12);
  r.light = [0.3, 0.9, 0.5];

  // distant skyline
  const rand = rng(9);
  for (let i = 0; i < 26; i++) {
    const x = -34 + i * 2.7;
    const h = 3 + rand() * 11;
    const z = -26 - rand() * 12;
    r.mesh(box(2.2, h, 2.2, [34, 32, 62]), place([x, h / 2 - 9, z]));
    for (let f = 0; f < Math.min(8, Math.floor(h / 1.6)); f++) if (rand() > 0.5) r.dot([x + (rand() - 0.5) * 1.4, -8.4 + f * 1.6, z + 1.2], 0.12, [255, 214, 140], 0.9);
  }
  // city lights far below
  for (let i = 0; i < 80; i++) {
    const x = ((hash(i) * 70 - t * 1.5) % 70 + 70) % 70 - 35;
    const z = -20 + hash(i + 50) * 34;
    r.dot([x, -9.5, z], 0.1, hash(i + 7) > 0.5 ? [255, 214, 140] : [255, 255, 255], 0.5 + 0.4 * Math.sin(t * 2 + i));
  }

  const bob = Math.sin(t * 1.3) * 0.18;
  const m = place([0, bob, 0], [Math.sin(t * 0.9) * 0.03, 0, Math.sin(t * 1.1) * 0.04 - 0.04]);
  r.mesh(heliHull, m);
  const spin = t * 26;
  for (let k = 0; k < 4; k++) r.mesh(blade, compose(m, place([0, 1.1, 0], [0, spin + (k * Math.PI) / 2, 0], 1)));
  r.mesh(sphere(1, 4, 14, [90, 90, 100], { a: 0.1 }), compose(m, place([0, 1.1, 0], [0, 0, 0], [1.7, 0.03, 1.7])));
  for (let k = 0; k < 2; k++) r.mesh(tailBlade, compose(m, place([-4.0, 0.55, 0.12], [spin * 1.5 + k * Math.PI / 2, 0, 0, ] as V3)));
  // searchlight sweeping the streets
  const lp = apply(m, [0.4, -0.8, 0]);
  const sweep = Math.sin(t * 0.8) * 2.5;
  const ground: V3 = [lp[0] + 2 + sweep, -9.4, lp[2] + Math.cos(t * 0.6) * 2];
  r.mesh(poly([[lp[0], lp[1], lp[2] - 0.05], [lp[0], lp[1], lp[2] + 0.05], [ground[0] + 1.6, ground[1], ground[2] + 1.4], [ground[0] - 1.6, ground[1], ground[2] - 1.4]], [255, 244, 200], { a: 0.14, glow: 1 }), place());
  r.glow(ground, 2.4, [255, 244, 200], 0.4);
  r.glow(lp, 0.9, [255, 250, 220], 0.9);
  r.glow(apply(m, [-4.3, 1.1, 0]), 0.35, [255, 70, 70], 0.6 + 0.4 * Math.sin(t * 7));
};

/* ----------------------------------------------------------------- plane */

const planeHull = merge([
  [cylinder(0.42, 0.42, 4.4, 10, [236, 240, 246]), place([0, 0, 0], [0, 0, Math.PI / 2])],
  [cylinder(0.42, 0.04, 1.2, 10, [236, 240, 246]), place([2.8, 0, 0], [0, 0, -Math.PI / 2])],
  [cylinder(0.42, 0.24, 1.4, 10, [220, 226, 236]), place([-2.9, 0.05, 0], [0, 0, Math.PI / 2])],
  [poly([[0.6, 0, 0.35], [-0.4, 0, 0.35], [-1.7, -0.1, 3.1], [-0.9, -0.1, 3.1]], [200, 208, 222]), place()],
  [poly([[0.6, 0, -0.35], [-0.4, 0, -0.35], [-1.7, -0.1, -3.1], [-0.9, -0.1, -3.1]], [200, 208, 222]), place()],
  [poly([[-2.5, 0.2, 0.2], [-3.3, 0.2, 1.4], [-3.65, 0.2, 1.4], [-3.4, 0.2, 0.2]], [200, 208, 222]), place()],
  [poly([[-2.5, 0.2, -0.2], [-3.3, 0.2, -1.4], [-3.65, 0.2, -1.4], [-3.4, 0.2, -0.2]], [200, 208, 222]), place()],
  [poly([[-2.3, 0.4, 0], [-3.4, 0.4, 0], [-3.7, 1.5, 0], [-3.2, 1.5, 0]], [34, 92, 170]), place()],
  [cylinder(0.2, 0.2, 0.85, 8, [150, 158, 172]), place([-0.55, -0.35, 1.25], [0, 0, Math.PI / 2])],
  [cylinder(0.2, 0.2, 0.85, 8, [150, 158, 172]), place([-0.55, -0.35, -1.25], [0, 0, Math.PI / 2])],
  [box(0.05, 0.05, 0.05, [0, 0, 0]), place()],
]);

export const planeScene: SceneFn = (r, t) => {
  r.gradient([[0, '#0b2a6b'], [0.45, '#3d84d0'], [0.7, '#a8d4f2'], [1, '#e8f1fa']]);
  r.glow([9, 8, -30], 11, [255, 250, 220], 0.75);
  r.fog = { color: [190, 220, 245], near: 20, far: 80 };
  r.orbit([0, 0, 0], 11.5, 0.8 + Math.sin(t * 0.18) * 0.7, 0.14 + Math.sin(t * 0.13) * 0.06);
  r.light = [0.4, 0.9, 0.3];

  // cloud deck below, sliding backwards
  for (let i = 0; i < 26; i++) {
    const x = ((i * 4.1 - t * 6 * (0.8 + hash(i) * 0.3)) % 100 + 100) % 100 - 50;
    cloud(r, [x, -6.5 + hash(i + 2) * 1.2, -24 + hash(i + 3) * 40], 3.4 + hash(i + 6) * 3, 0.95);
  }
  const bank = Math.sin(t * 0.5) * 0.12;
  const m = place([0, Math.sin(t * 0.8) * 0.1, 0], [bank, 0, Math.sin(t * 0.6) * 0.03]);
  r.mesh(planeHull, m);
  // cabin windows and cockpit
  for (let i = 0; i < 14; i++) r.dot(apply(m, [-1.6 + i * 0.22, 0.14, 0.4]), 0.045, [40, 60, 90]);
  for (let i = 0; i < 14; i++) r.dot(apply(m, [-1.6 + i * 0.22, 0.14, -0.4]), 0.045, [40, 60, 90]);
  r.mesh(poly([[2.45, 0.2, 0.3], [2.15, 0.28, 0.2], [2.15, 0.28, -0.2], [2.45, 0.2, -0.3]], [40, 70, 110]), m);
  // contrails
  for (const z of [1.25, -1.25]) {
    const pts: V3[] = [];
    for (let k = 0; k <= 16; k++) {
      const s = k / 16;
      pts.push(apply(m, [-1.1 - s * 18, -0.35 + Math.sin(s * 9 - t * 3) * 0.04 * s, z]));
    }
    for (let k = 0; k < pts.length - 1; k++) r.line(pts[k], pts[k + 1], 0.16 + (k / 16) * 0.32, [255, 255, 255], 0.65 * (1 - k / 16));
  }
  r.glow(apply(m, [-3.0, 0.6, 0]), 0.3, [255, 60, 60], 0.5 + 0.5 * Math.sin(t * 5));
  r.glow(apply(m, [-0.5, 0, 3.1]), 0.25, [90, 255, 140], 0.7);
  r.glow(apply(m, [-0.5, 0, -3.1]), 0.25, [255, 70, 70], 0.7);
};

export { faceDir, hsl, lerp };

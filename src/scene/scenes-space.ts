import { Renderer, apply, box, compose, cylinder, disc, merge, mix, place, poly, rng, shade, sphere, type Mat, type Mesh, type RGB, type V3 } from './engine';
import type { SceneFn } from './scenes-sea';

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

/** Fixed starfield on a big sphere around the origin; the camera never leaves its neighbourhood. */
const STARS = (() => {
  const rand = rng(77);
  const out: Array<{ p: V3; r: number; tw: number; c: RGB }> = [];
  for (let i = 0; i < 220; i++) {
    const u = rand() * 2 - 1, a = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const warm = rand();
    out.push({ p: [s * Math.cos(a) * 160, u * 160, s * Math.sin(a) * 160], r: 0.12 + rand() * 0.28, tw: rand() * 6, c: warm > 0.8 ? [255, 214, 170] : warm < 0.2 ? [180, 205, 255] : [255, 255, 255] });
  }
  return out;
})();

function stars(r: Renderer, t: number, centre: V3 = [0, 0, 0]) {
  for (const s of STARS) r.dot([centre[0] + s.p[0], centre[1] + s.p[1], centre[2] + s.p[2]], s.r, s.c, 0.55 + 0.4 * Math.sin(t * 1.5 + s.tw));
}

const earthColor = (la: number, lo: number): RGB => {
  const n = Math.sin(lo * 3.1 + la * 2) + Math.sin(lo * 7.3 - la * 3.1) * 0.5 + Math.cos(la * 5 + lo * 1.7) * 0.4;
  if (Math.abs(la) > 1.18) return [240, 245, 250];
  if (n > 0.55) return Math.abs(la) < 0.5 ? [64, 132, 70] : [112, 140, 84];
  return [24, 78, 160];
};
const earth = sphere(1, 14, 22, earthColor);
const moon = sphere(1, 10, 16, (la, lo) => {
  const n = Math.sin(lo * 9 + la * 6) * Math.cos(lo * 4 - la * 8);
  return n > 0.55 ? [128, 126, 130] : [176, 174, 170];
});

/* ---------------------------------------------------------------- rocket */

const rocketBody = merge([
  [cylinder(0.5, 0.5, 3.4, 12, [236, 238, 244]), place([0, 0, 0], [0, 0, Math.PI / 2])],
  [cylinder(0.5, 0.0, 1.4, 12, [215, 60, 56]), place([2.4, 0, 0], [0, 0, -Math.PI / 2])],
  [cylinder(0.45, 0.62, 0.5, 12, [60, 66, 84]), place([-1.95, 0, 0], [0, 0, Math.PI / 2])],
  [sphere(0.24, 5, 8, [90, 170, 230], { glow: 0.4 }), place([0.8, 0.0, 0.46])],
  [sphere(0.24, 5, 8, [90, 170, 230], { glow: 0.4 }), place([0.8, 0.0, -0.46])],
  [poly([[-1.2, 0, 0.5], [-2.1, 0, 1.4], [-2.1, 0, 0.5]], [215, 60, 56]), place()],
  [poly([[-1.2, 0, -0.5], [-2.1, 0, -1.4], [-2.1, 0, -0.5]], [215, 60, 56]), place()],
  [poly([[-1.2, 0.5, 0], [-2.1, 1.4, 0], [-2.1, 0.5, 0]], [215, 60, 56]), place()],
  [poly([[-1.2, -0.5, 0], [-2.1, -1.4, 0], [-2.1, -0.5, 0]], [215, 60, 56]), place()],
  [cylinder(0.5, 0.5, 0.12, 12, [60, 66, 84]), place([0.9, 0, 0], [0, 0, Math.PI / 2])],
]);

export const rocketScene: SceneFn = (r, t) => {
  r.gradient([[0, '#02030a'], [0.55, '#0a1230'], [0.85, '#20407e'], [1, '#6fb0f0']]);
  r.fog = null;
  r.light = [0.5, 0.6, 0.6];
  r.cam.fov = 0.9;
  r.cam.pos = [3.5, 0.6, 9.5];
  r.cam.target = [0, 0.2, 0];
  stars(r, t, r.cam.pos);
  // the curve of the Earth, sliding below
  r.glow([0, -52, -4], 56, [110, 180, 255], 0.5);
  r.mesh(earth, place([0, -50, -4], [0.3, t * 0.04, 0.2], 46));
  // speed streaks
  for (let i = 0; i < 26; i++) {
    const x = -14 + hash(i) * 28, z = -6 + hash(i + 4) * 8;
    const y = 12 - (((t * 14 + hash(i + 9) * 24) % 24));
    r.line([x, y, z], [x, y + 1.6 + hash(i + 3) * 1.8, z], 0.035, [200, 220, 255], 0.35);
  }
  // rocket points up the screen
  const m = place([0, Math.sin(t * 1.4) * 0.15, 0], [Math.sin(t * 6) * 0.015, 0, Math.PI / 2 + Math.sin(t * 0.9) * 0.05]);
  r.mesh(rocketBody, m);
  // flame
  for (let k = 0; k < 14; k++) {
    const s = k / 14;
    const wob = Math.sin(t * 40 + k * 1.9) * 0.1;
    const p = apply(m, [-2.25 - s * (2.4 + Math.sin(t * 30) * 0.3), wob * s, Math.cos(t * 33 + k) * 0.1 * s]);
    r.glow(p, 0.7 * (1 - s) + 0.18, s < 0.35 ? [255, 244, 190] : [255, 140, 50], 0.9 - s * 0.6);
  }
  // exhaust sparks
  for (let i = 0; i < 18; i++) {
    const s = fract(t * 1.4 + hash(i));
    r.dot(apply(m, [-2.4 - s * 7, (hash(i + 3) - 0.5) * 1.2 * s, (hash(i + 7) - 0.5) * 1.2 * s]), 0.06, [255, 190, 120], 1 - s);
  }
};

/* ------------------------------------------------------------- satellite */

const satBody = merge([
  [box(1.1, 1.0, 1.0, [214, 176, 70]), place()],
  [box(1.14, 0.18, 1.04, [90, 96, 112]), place([0, 0.45, 0])],
  [box(1.14, 0.18, 1.04, [90, 96, 112]), place([0, -0.45, 0])],
  [cylinder(0.06, 0.06, 1.2, 5, [150, 154, 166]), place([0, 0, 0], [0, 0, 0])],
  [cylinder(0.08, 0.08, 0.5, 5, [150, 154, 166]), place([0, 0, 0.7], [Math.PI / 2, 0, 0])],
  [cylinder(0.08, 0.08, 0.5, 5, [150, 154, 166]), place([0, 0, -0.7], [Math.PI / 2, 0, 0])],
  [cylinder(0.04, 0.04, 0.9, 5, [200, 200, 210]), place([0.4, 0.95, 0])],
  [sphere(0.1, 4, 6, [230, 70, 70], { glow: 0.6 }), place([0.4, 1.45, 0])],
]);
const dish = merge([
  [cylinder(0.55, 0.12, 0.28, 12, [236, 238, 244]), place([0, 0, 0], [Math.PI / 2, 0, 0])],
  [cylinder(0.03, 0.03, 0.3, 5, [150, 154, 166]), place([0, 0, -0.25], [Math.PI / 2, 0, 0])],
]);
const panelMesh = (n: number): Mesh => {
  const parts: Array<[Mesh, Mat?]> = [];
  for (let i = 0; i < n; i++) parts.push([box(1.1, 0.04, 1.6, [30, 70, 150]), place([0.62 + i * 1.18, 0, 0])]);
  for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) parts.push([box(0.02, 0.05, 1.6, [120, 170, 230]), place([0.1 + i * 1.18 + (j + 1) * 0.28, 0.02, 0])]);
  return merge(parts);
};
const panels = panelMesh(3);

export const satelliteScene: SceneFn = (r, t) => {
  r.gradient([[0, '#01020a'], [1, '#060a1e']]);
  r.fog = null;
  r.light = [0.8, 0.5, 0.3];
  r.cam.fov = 0.9;
  r.orbit([0, 0, 0], 12, 0.9 + Math.sin(t * 0.2) * 0.5, 0.18);
  stars(r, t, r.cam.pos);
  // Earth huge and slowly turning below
  r.glow([0, -44, -8], 58, [110, 180, 255], 0.5);
  r.mesh(earth, place([0, -43, -8], [0.2, t * 0.05, 0.1], 38));
  // little lights on the night side of orbit
  const m = place([0, Math.sin(t * 0.9) * 0.2, 0], [t * 0.12, t * 0.2, Math.sin(t * 0.3) * 0.15]);
  r.mesh(satBody, m);
  r.mesh(panels, compose(m, place([0.55, 0, 0])));
  r.mesh(panels, compose(m, place([-0.55, 0, 0], [0, Math.PI, 0])));
  r.mesh(dish, compose(m, place([0.4, 1.0, 0], [0, 0.6 + Math.sin(t * 0.8) * 0.4, 0.4])));
  r.glow(apply(m, [0.4, 1.45, 0]), 0.35, [255, 70, 70], 0.4 + 0.5 * Math.abs(Math.sin(t * 2.4)));
  // signal pings towards Earth
  for (let k = 0; k < 4; k++) {
    const s = fract(t * 0.45 + k / 4);
    const a = apply(m, [0.4, 1.0, 0]);
    const p: V3 = [a[0] * (1 - s) + 0 * s, a[1] * (1 - s) - 30 * s, a[2] * (1 - s) + -6 * s];
    r.glow(p, 0.5 + s * 0.8, [120, 220, 255], (1 - s) * 0.6);
  }
  // distant moon
  r.mesh(moon, place([-30, 14, -50], [0, 0.4, 0], 3));
};

/* ------------------------------------------------------------- astronaut */

const suit: RGB = [236, 238, 244];
const aBody = merge([
  [box(0.9, 1.1, 0.55, suit), place([0, 0, 0])],
  [box(0.7, 0.8, 0.4, [190, 194, 206]), place([0, 0.05, -0.5])],
  [box(0.5, 0.2, 0.62, [230, 120, 50]), place([0, -0.15, 0.0])],
  [sphere(0.42, 8, 12, suit), place([0, 0.95, 0])],
  [sphere(0.3, 6, 10, [236, 170, 40], { glow: 0.25 }), place([0, 0.95, 0.2], [0, 0, 0], [1, 0.85, 0.8])],
  [box(0.4, 0.55, 0.42, suit), place([-0.25, -0.85, 0])],
  [box(0.4, 0.55, 0.42, suit), place([0.25, -0.85, 0])],
  [box(0.44, 0.22, 0.56, [120, 126, 140]), place([-0.25, -1.2, 0.05])],
  [box(0.44, 0.22, 0.56, [120, 126, 140]), place([0.25, -1.2, 0.05])],
]);
const aArm = merge([
  [box(0.34, 0.8, 0.34, suit), place([0, -0.35, 0])],
  [sphere(0.22, 5, 8, [120, 126, 140]), place([0, -0.85, 0])],
]);

export const astronautScene: SceneFn = (r, t) => {
  r.gradient([[0, '#000006'], [1, '#05061a']]);
  r.fog = null;
  r.light = [0.7, 0.4, 0.5];
  r.cam.fov = 0.9;
  r.orbit([0, 0, 0], 12.5, -0.5 + Math.sin(t * 0.22) * 0.6, 0.1);
  stars(r, t, r.cam.pos);
  // Earth as a small blue marble, the Moon larger in the foreground
  r.glow([22, 9, -60], 9, [120, 190, 255], 0.5);
  r.mesh(earth, place([22, 9, -60], [0.3, t * 0.06, 0.1], 5.5));
  r.mesh(moon, place([-4, -16, -4], [0, 0.2, 0], 12));
  // astronaut tumbling gently with arms drifting
  const m = place([0, Math.sin(t * 0.8) * 0.4, 0], [Math.sin(t * 0.4) * 0.25, t * 0.25, Math.sin(t * 0.55) * 0.35]);
  r.mesh(aBody, m);
  r.mesh(aArm, compose(m, place([-0.65, 0.45, 0], [Math.sin(t * 0.9) * 0.25, 0, 0.5 + Math.sin(t * 0.7) * 0.2])));
  r.mesh(aArm, compose(m, place([0.65, 0.45, 0], [Math.sin(t * 0.9 + 1) * 0.25, 0, -0.5 - Math.sin(t * 0.8) * 0.2])));
  r.glow(apply(m, [0, 0.95, 0.4]), 0.55, [255, 220, 150], 0.2);
  // tether that wavers to somewhere off-screen
  const pts: V3[] = [];
  for (let k = 0; k <= 14; k++) {
    const s = k / 14;
    pts.push(apply(m, [-0.2 - s * 9, -0.2 + Math.sin(s * 5 + t) * 0.5 * s, -0.5 - s * 3]));
  }
  r.path(pts, 0.06, [220, 190, 120], 0.8);
  // drifting space dust
  for (let i = 0; i < 24; i++) r.dot([(hash(i) - 0.5) * 20 + Math.sin(t * 0.3 + i) * 0.6, (hash(i + 3) - 0.5) * 12, (hash(i + 8) - 0.5) * 16], 0.05, [200, 210, 230], 0.5);
};

/* ---------------------------------------------------------- solar system */

interface Planet { name: string; orbit: number; size: number; speed: number; color: (la: number, lo: number) => RGB; ring?: boolean; moon?: boolean }
const bands = (a: RGB, b: RGB, f: number) => (la: number) => mix(a, b, 0.5 + 0.5 * Math.sin(la * f));
const PLANETS: Planet[] = [
  { name: 'Mercury', orbit: 4.6, size: 0.3, speed: 1.9, color: () => [150, 144, 138] },
  { name: 'Venus', orbit: 6.4, size: 0.5, speed: 1.4, color: bands([232, 200, 130], [200, 150, 90], 9) },
  { name: 'Earth', orbit: 8.4, size: 0.55, speed: 1.1, color: earthColor, moon: true },
  { name: 'Mars', orbit: 10.4, size: 0.4, speed: 0.9, color: (la, lo) => (Math.abs(la) > 1.3 ? [240, 240, 245] : mix([190, 90, 56], [150, 70, 50], 0.5 + 0.5 * Math.sin(lo * 5 + la * 4))) },
  { name: 'Jupiter', orbit: 14, size: 1.35, speed: 0.55, color: bands([230, 200, 160], [170, 110, 80], 14) },
  { name: 'Saturn', orbit: 18, size: 1.1, speed: 0.42, color: bands([236, 214, 160], [200, 170, 110], 10), ring: true },
  { name: 'Uranus', orbit: 21.5, size: 0.7, speed: 0.3, color: () => [150, 220, 226] },
  { name: 'Neptune', orbit: 24.5, size: 0.68, speed: 0.24, color: bands([60, 100, 220], [40, 70, 180], 8) },
];
const planetMesh = new Map<Planet, Mesh>(PLANETS.map((p) => [p, sphere(1, 9, 14, p.color)]));
const ring = disc(1, 40, [214, 190, 140], { inner: 0.62, a: 0.85 });
const sun = sphere(1, 10, 16, [255, 214, 120], { glow: 1 });

export const solarScene: SceneFn = (r, t) => {
  r.gradient([[0, '#000004'], [1, '#07071a']]);
  r.fog = null;
  r.ambient = 0.3;
  r.cam.fov = 0.9;
  r.orbit([0, 0, 0], 38, t * 0.07, 0.62 + Math.sin(t * 0.1) * 0.14);
  stars(r, t, r.cam.pos);
  // the star at the centre
  const pulse = 1 + Math.sin(t * 1.8) * 0.03;
  r.glow([0, 0, 0], 7.2 * pulse, [255, 190, 90], 0.5);
  r.glow([0, 0, 0], 3.8 * pulse, [255, 240, 190], 0.8);
  r.mesh(sun, place([0, 0, 0], [0, t * 0.1, 0], 1.7));
  for (const p of PLANETS) {
    // faint orbit trails
    const trail: V3[] = [];
    for (let k = 0; k <= 72; k++) trail.push([Math.cos((k / 72) * Math.PI * 2) * p.orbit, 0, Math.sin((k / 72) * Math.PI * 2) * p.orbit]);
    r.path(trail, 0.025, [140, 160, 220], 0.2);
    const a = t * p.speed * 0.35 + p.orbit;
    const pos: V3 = [Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit];
    // light comes from the sun, so aim it at each planet
    const toSun: V3 = [-pos[0], 0, -pos[2]];
    const l = Math.hypot(toSun[0], toSun[2]) || 1;
    r.light = [toSun[0] / l, 0.15, toSun[2] / l];
    r.mesh(planetMesh.get(p)!, place(pos, [0, t * 0.5, 0], p.size));
    if (p.ring) r.mesh(ring, place(pos, [0.4, 0, 0.35], p.size * 2.3));
    if (p.moon) {
      const ma = t * 3;
      r.dot([pos[0] + Math.cos(ma) * 0.95, 0.05, pos[2] + Math.sin(ma) * 0.95], 0.12, [210, 210, 214]);
    }
  }
  // a comet crossing the system
  const cs = fract(t * 0.05);
  const cp: V3 = [-30 + cs * 60, 7 - cs * 5, -14 + cs * 4];
  r.glow(cp, 0.7, [220, 240, 255], 0.9);
  for (let k = 1; k < 10; k++) r.glow([cp[0] - k * 0.9, cp[1] + k * 0.18, cp[2]], 0.55 - k * 0.04, [160, 210, 255], 0.5 - k * 0.045);
};

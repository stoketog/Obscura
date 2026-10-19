import { THREE, TAU, at, ball, canvasTex, capsule, cone, cyl, glow, grp, lerp, lit, rbox, rng, smooth, toy, torus, wrap } from './kit';
import { flat, flatXZ, lathe } from './anatomy';
import { bird, helicopter, human, plane } from './heroes-air';
import { satellite } from './heroes-space';
import { QUAY_TOP, SURFACE_Y, parallax } from './layout';
import type { Biome, Ctx } from './biomes';

/**
 * Supporting cast: the small things that make each stage feel like a place
 * rather than a pedestal. They live behind or beside the hero, are smaller and
 * quieter than it, and are skipped entirely in Low CPU mode.
 */

interface Mover {
  obj: THREE.Object3D;
  x0: number;
  z: number;
  y: number;
  /** Own speed along x (world units per second); the scenery slide is added on top. */
  vel: number;
  period: number;
  bob?: number;
  rate?: number;
  ph?: number;
  tick?: (t: number, dt: number) => void;
}

function drift(list: Mover[], c: Ctx) {
  for (const m of list) {
    const x = wrap(m.x0 - c.scroll * parallax(m.z) + m.vel * c.t, m.period) - m.period / 2;
    m.obj.position.set(x, m.y + (m.bob ? Math.sin(c.t * (m.rate ?? 0.7) + (m.ph ?? 0)) * m.bob : 0), m.z);
    m.tick?.(c.t + (m.ph ?? 0) * 3, c.dt);
  }
}

const mk = (g: THREE.BufferGeometry, m: THREE.Material, cast = false) => {
  const x = new THREE.Mesh(g, m);
  x.castShadow = cast;
  return x;
};
const face = (o: THREE.Object3D, vel: number) => ((o.rotation.y = vel < 0 ? Math.PI : 0), o);

/* ─────────────────────────── microscopic life ─────────────────────────── */

type Plankter = { obj: THREE.Object3D; tick?: (t: number) => void };

function diatom(): Plankter {
  const m = toy('#ffd98a', { opacity: 0.5, glow: 0.5, emissive: '#e0a33a', depthWrite: false, rough: 0.1 });
  const g = grp(mk(new THREE.CylinderGeometry(0.5, 0.5, 0.16, 12), m));
  g.add(at(torus(0.5, 0.035, lit('#ffe9b0', 0.85), 14), 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 6; i++) g.add(at(mk(new THREE.BoxGeometry(0.9, 0.02, 0.02), lit('#fff0c8', 0.6)), 0, 0.09, 0, 0, (i / 6) * Math.PI, 0));
  g.rotation.x = 0.9;
  return { obj: g, tick: (t) => (g.rotation.y = t * 0.3) };
}

function spiral(): Plankter {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const s = i / 36;
    pts.push(new THREE.Vector3((s - 0.5) * 2.2, Math.sin(s * 6 * Math.PI) * 0.16, Math.cos(s * 6 * Math.PI) * 0.16));
  }
  const g = grp(mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.05, 5, false), lit('#9bffb4')));
  return { obj: g, tick: (t) => ((g.rotation.x = t * 1.6), (g.rotation.z = Math.sin(t * 0.7) * 0.3)) };
}

function phage(): Plankter {
  const g = new THREE.Group();
  const shell = toy('#c9a8ff', { glow: 0.5, emissive: '#7b4cf0', rough: 0.3 });
  g.add(at(mk(new THREE.IcosahedronGeometry(0.34, 0), shell, false), 0, 0.75, 0));
  g.add(at(cyl(0.1, 0.1, 0.1, toy('#9a78e0', { glow: 0.3 }), 8), 0, 0.38, 0));
  g.add(at(cyl(0.055, 0.055, 0.6, toy('#e8dcff', { glow: 0.5, emissive: '#b79bff' }), 8), 0, 0.02, 0));
  g.add(at(cyl(0.12, 0.12, 0.05, shell, 6), 0, -0.3, 0));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    g.add(at(cyl(0.012, 0.012, 0.55, lit('#e8dcff'), 4), Math.cos(a) * 0.2, -0.5, Math.sin(a) * 0.2, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5));
  }
  g.scale.setScalar(0.8);
  return { obj: g, tick: (t) => ((g.rotation.z = Math.sin(t * 0.6) * 0.5), (g.rotation.y = t * 0.4)) };
}

function cocci(): Plankter {
  const m = toy('#ff9bc7', { opacity: 0.7, glow: 0.5, emissive: '#e24f94', depthWrite: false });
  const g = new THREE.Group();
  for (const [x, y, z] of [[0, 0, 0], [0.42, 0.1, 0.1], [0.18, 0.4, -0.1], [-0.12, 0.3, 0.3], [0.3, -0.25, 0.25]]) g.add(at(ball(0.26, m, [1, 1, 1], 14), x, y, z));
  return { obj: g, tick: (t) => ((g.rotation.y = t * 0.5), (g.rotation.x = t * 0.3)) };
}

function rodlet(): Plankter {
  const g = new THREE.Group();
  const body = capsule(0.2, 0.6, toy('#8ffbe0', { opacity: 0.55, glow: 0.6, emissive: '#18c7a0', depthWrite: false }));
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const tail: THREE.Mesh[] = [];
  for (let k = 0; k < 10; k++) {
    const l = ball(0.035, lit('#bffff0'), [1, 1, 1], 8);
    g.add(l);
    tail.push(l);
  }
  return {
    obj: g,
    tick: (t) => tail.forEach((l, k) => l.position.set(-0.55 - k * 0.1, Math.sin(t * 8 - k * 0.7) * (0.03 + k * 0.012), 0)),
  };
}

function amoeba(): Plankter {
  const m = toy('#9ec8ff', { opacity: 0.4, glow: 0.4, emissive: '#4b82e0', depthWrite: false, rough: 0.1 });
  const g = new THREE.Group();
  const lobes = [[0, 0, 0, 0.55], [0.5, 0.1, 0.1, 0.32], [-0.45, -0.1, 0, 0.36], [0.1, 0.4, -0.1, 0.3]] as const;
  const parts = lobes.map(([x, y, z, r]) => {
    const b = ball(r, m, [1, 1, 1], 14);
    b.position.set(x, y, z);
    g.add(b);
    return b;
  });
  g.add(at(ball(0.16, lit('#fff0b0'), [1, 1, 1], 10), 0.05, 0, 0));
  return { obj: g, tick: (t) => parts.forEach((b, i) => b.scale.setScalar(1 + Math.sin(t * 1.4 + i * 1.7) * 0.12)) };
}

function copepod(): Plankter {
  const g = new THREE.Group();
  const m = toy('#ffc7a0', { opacity: 0.75, glow: 0.55, emissive: '#ff8f4f', depthWrite: false });
  g.add(ball(0.3, m, [1.7, 0.7, 0.7], 12));
  g.add(at(ball(0.13, m, [1, 1, 1], 10), 0.55, 0, 0));
  for (const s of [1, -1]) {
    g.add(at(cyl(0.012, 0.012, 1.1, lit('#ffe0c4'), 4), 0.75, 0.2, s * 0.15, 0, 0, -1.2));
    g.add(at(cyl(0.012, 0.012, 0.5, lit('#ffe0c4'), 4), -0.2, -0.28, s * 0.14, 0, 0, 0.5));
  }
  g.add(at(cone(0.07, 0.4, m, 6), -0.7, 0, 0, 0, 0, Math.PI / 2));
  return { obj: g, tick: (t) => ((g.rotation.z = Math.sin(t * 3) * 0.12), (g.position.y += 0)) };
}

/** Drifting plankton and microbes around the microbe and jellyfish stages. */
export function plankton(): Biome {
  const g = new THREE.Group();
  const rand = rng(77);
  const makers = [diatom, spiral, phage, cocci, rodlet, amoeba, diatom, phage, rodlet, cocci, spiral, amoeba];
  const list: Mover[] = [];
  const COPE = [copepod, copepod, copepod, copepod];
  const make = (fn: () => Plankter, i: number, y: number, z: number, size: number) => {
    const p = fn();
    const holder = grp(p.obj);
    holder.scale.setScalar(size);
    g.add(holder);
    const dir = i % 2 ? -1 : 1;
    list.push({ obj: holder, x0: rand() * 80, z, y, vel: dir * (0.15 + rand() * 0.25), period: 80, bob: 0.4 + rand() * 0.5, rate: 0.4 + rand() * 0.5, ph: rand() * 6, tick: (t) => p.tick?.(t) });
  };
  makers.forEach((fn, i) => make(fn, i, -1.6 + (i % 6) * 1.5 + rand(), -12 + rand() * 9, 0.7 + rand() * 0.5));
  COPE.forEach((fn, i) => make(fn, i, 5.5 + i * 2.6 + rand(), -8 + rand() * 5, 0.8 + rand() * 0.4));
  return {
    group: g,
    range: [-30, 16],
    update(c) {
      drift(list, c);
    },
  };
}

/* ───────────────────────────── open water ───────────────────────────── */

function turtle(): THREE.Group {
  const shell = toy('#6e7d46', { rough: 0.6 });
  const plates = toy('#4d5a31', { rough: 0.6 });
  const skin = toy('#93a55f', { rough: 0.55 });
  const belly = toy('#d8cf9c', { rough: 0.6 });
  const g = new THREE.Group();
  g.add(ball(1.0, shell, [1.3, 0.55, 1.0], 18));
  g.add(at(ball(0.62, plates, [1.1, 0.3, 0.8], 12), 0, 0.3, 0));
  g.add(at(ball(0.95, belly, [1.25, 0.3, 0.95], 14), 0, -0.22, 0));
  g.add(at(cyl(0.14, 0.2, 0.5, skin, 8), 1.3, 0.05, 0, 0, 0, -1.3));
  g.add(at(ball(0.27, skin, [1.2, 0.85, 0.9], 12), 1.62, 0.12, 0));
  for (const s of [1, -1]) {
    g.add(at(ball(0.05, lit('#10131f'), [1, 1, 1], 6), 1.75, 0.2, s * 0.14));
  }
  g.add(at(cone(0.11, 0.4, skin, 6), -1.45, -0.05, 0, 0, 0, Math.PI / 2));
  const fl: Array<{ p: THREE.Group; s: number; front: boolean }> = [];
  for (const s of [1, -1]) {
    const f = new THREE.Group();
    f.position.set(0.55, -0.1, s * 0.78);
    f.add(flatXZ([[0.2, 0], [0.05, 1.2], [-0.3, 1.1], [-0.45, 0.2]], 0.07, skin, true));
    g.add(f);
    fl.push({ p: f, s, front: true });
    const r = new THREE.Group();
    r.position.set(-0.85, -0.1, s * 0.6);
    r.add(flatXZ([[0.12, 0], [0.0, 0.6], [-0.3, 0.45], [-0.3, 0.05]], 0.06, skin, true));
    g.add(r);
    fl.push({ p: r, s, front: false });
  }
  g.userData.tick = (t: number) => {
    for (const { p, s, front } of fl) p.rotation.x = -s * (Math.sin(t * 1.2 + (front ? 0 : 1)) * (front ? 0.5 : 0.25) + 0.1);
    g.rotation.z = Math.sin(t * 0.6) * 0.04;
  };
  g.scale.setScalar(0.95);
  return g;
}

function manta(): THREE.Group {
  const top = toy('#2f4a66', { rough: 0.55, side: THREE.DoubleSide });
  const under = toy('#d5dde4', { rough: 0.55, side: THREE.DoubleSide });
  const g = new THREE.Group();
  const wing: Array<[number, number]> = [[1.1, 0], [0.7, 0.45], [0.25, 1.6], [-0.1, 2.5], [-0.35, 2.0], [-0.55, 1.1], [-0.85, 0.2], [-0.85, 0]];
  const halves: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const h = new THREE.Group();
    h.add(flatXZ(wing, 0.1, top, true));
    h.add(at(flatXZ(wing.map(([x, y]) => [x * 0.96, y * 0.94] as [number, number]), 0.06, under), 0, -0.07, 0));
    if (s < 0) h.scale.z = -1;
    g.add(h);
    halves.push(h);
  }
  g.add(at(ball(0.5, top, [1.5, 0.45, 0.7], 12), 0.1, 0.06, 0));
  for (const s of [1, -1]) g.add(at(cone(0.09, 0.5, top, 5), 1.15, -0.02, s * 0.34, 0, 0, -Math.PI / 2)); // cephalic fins
  g.add(at(cyl(0.015, 0.05, 3.0, top, 5), -2.3, 0, 0, 0, 0, Math.PI / 2));
  g.userData.tick = (t: number) => {
    const w = Math.sin(t * 1.3);
    halves.forEach((h) => (h.rotation.x = -w * 0.3));
    g.rotation.z = Math.sin(t * 0.5) * 0.05;
  };
  g.scale.setScalar(0.85);
  return g;
}

/** A sea turtle and a manta ray gliding behind the fish. */
export function reefLife(): Biome {
  const g = new THREE.Group();
  const list: Mover[] = [];
  const t1 = turtle();
  const m1 = manta();
  const t2 = turtle();
  t2.scale.setScalar(0.55);
  for (const [o, y, z, v, x0, p] of [[t1, 14.5, -8, 0.7, 20, 0.4], [m1, 21.5, -13, -0.9, 60, 1.7], [t2, 22.5, -11, 0.5, 5, 3.1]] as const) {
    g.add(o);
    face(o, v);
    list.push({ obj: o, x0, z, y, vel: v, period: 90, bob: 0.5, rate: 0.35, ph: p, tick: o.userData.tick as (t: number) => void });
  }
  return {
    group: g,
    range: [8, 27],
    update(c) {
      drift(list, c);
    },
  };
}

/* ───────────────────────────── seaside town ───────────────────────────── */

function car(color: string): THREE.Group {
  const body = toy(color, { rough: 0.35, clear: 1 });
  const glass = toy('#1c2536', { rough: 0.05 });
  const g = new THREE.Group();
  g.add(flat([[-1.15, 0.2], [1.15, 0.2], [1.2, 0.58], [0.75, 0.66], [0.42, 1.0], [-0.52, 1.0], [-0.9, 0.66], [-1.18, 0.58]], 0.95, body, true));
  g.add(flat([[-0.44, 0.7], [0.36, 0.7], [0.2, 0.94], [-0.38, 0.94]], 0.98, glass));
  for (const x of [0.72, -0.72])
    for (const s of [1, -1]) {
      g.add(at(cyl(0.24, 0.24, 0.14, toy('#20242e'), 10), x, 0.24, s * 0.46, Math.PI / 2, 0, 0));
      g.add(at(cyl(0.12, 0.12, 0.16, toy('#aeb6c4', { metal: 0.5 }), 8), x, 0.24, s * 0.46, Math.PI / 2, 0, 0));
    }
  g.add(at(rbox(0.05, 0.1, 0.6, lit('#fff2c0'), 0.02), 1.19, 0.5, 0));
  g.add(at(rbox(0.05, 0.1, 0.6, lit('#ff4a3a'), 0.02), -1.18, 0.5, 0));
  g.scale.setScalar(1.25);
  return g;
}

function sailboat(hull: string): THREE.Group {
  const g = new THREE.Group();
  const white = toy('#f4f1ea', { rough: 0.5, side: THREE.DoubleSide });
  g.add(flat([[-1.5, 0.5], [1.7, 0.56], [1.25, -0.05], [-1.1, -0.2]], 0.95, toy(hull), true));
  g.add(flat([[-1.5, 0.5], [1.7, 0.56], [1.68, 0.64], [-1.5, 0.58]], 1.0, toy('#e8e2d4')));
  g.add(at(rbox(0.9, 0.3, 0.6, toy('#e8e2d4'), 0.08), -0.4, 0.78, 0));
  g.add(at(cyl(0.045, 0.06, 3.7, toy('#cfd3d8'), 6), 0.2, 2.4, 0));
  g.add(at(flat([[0, 0.3], [0, 3.8], [-1.55, 0.35]], 0.03, white), 0.15, 0.55, 0.02));
  g.add(at(flat([[0, 0.3], [0, 3.1], [1.55, 0.35]], 0.03, toy('#e86a4a', { rough: 0.5, side: THREE.DoubleSide })), 0.3, 0.55, -0.02));
  g.scale.setScalar(1.2);
  return g;
}

/** Pedestrians, cars, sailboats and gulls: the seaside around the walker. */
export function seaside(): Biome {
  const g = new THREE.Group();
  const rand = rng(515);
  const list: Mover[] = [];
  const hero: Array<{ update(t: number, dt: number): void }> = [];

  // a road behind the quay for the cars
  const road = rbox(260, 0.05, 1.7, toy('#3c4150', { rough: 0.9, clear: 0 }), 0.02);
  road.position.set(0, QUAY_TOP + 0.02, -7.25);
  road.castShadow = false;
  road.receiveShadow = true;
  g.add(road);

  // passers-by walk both ways, a little further back than the walker
  const people: HumanStyleLite[] = [
    { jacket: '#b8564a', jeans: '#2b2f3d', hair: '#2a1d16', skin: '#a9714f', pack: null },
    { jacket: '#d8b45a', jeans: '#47546f', hair: '#c9a05f', skin: '#e8bf9c', pack: '#4a6aa8' },
    { jacket: '#5a6f9b', jeans: '#2e3447', hair: '#1b1512', skin: '#7b4f38', pack: null },
    { jacket: '#7aa36a', jeans: '#3a4a60', hair: '#7d4b2b', skin: '#e0b090', pack: '#c05a3a' },
    { jacket: '#c9c4bc', jeans: '#7c88a8', hair: '#8a8a8a', skin: '#d9a98a', pack: null },
    { jacket: '#8f5fa8', jeans: '#2f3a52', hair: '#3a2a22', skin: '#c58f6a', pack: null },
  ];
  people.forEach((st, i) => {
    const h = human({ ...st, z: 0 });
    const dir = i % 2 ? -1 : 1;
    const speed = 1.1 + rand() * 0.7;
    h.root.scale.setScalar(0.94 + rand() * 0.1);
    face(h.root, dir);
    g.add(h.root);
    hero.push(h);
    list.push({ obj: h.root, x0: 30 + i * 26 + rand() * 6, z: -5.0 - (i % 3) * 0.4, y: QUAY_TOP + 1.4 * 0.97, vel: dir * speed, period: 156, tick: (t) => h.update(t * (speed / 2.3), 0) });
  });

  // cars on the road
  const carCols = ['#c9503c', '#e0b23a', '#3f78b8', '#e8e8ea', '#2f8a6a', '#6b4aa8'];
  carCols.forEach((col, i) => {
    const o = car(col);
    const dir = i % 2 ? -1 : 1;
    face(o, dir);
    g.add(o);
    list.push({ obj: o, x0: i * 17 + rand() * 6, z: -7.1 + (dir > 0 ? 0.35 : -0.35), y: QUAY_TOP + 0.04, vel: dir * (4 + rand() * 2.5), period: 112 });
  });

  // boats on the water in front of the quay
  const boats = [sailboat('#274a78'), sailboat('#a2412f'), sailboat('#1f6f6a')];
  boats.forEach((b, i) => {
    g.add(b);
    const s = i % 2 ? -1 : 1;
    face(b, s);
    list.push({ obj: b, x0: 14 + i * 38, z: 6.5 + (i % 2) * 2.5, y: SURFACE_Y + 0.1, vel: s * 0.5, period: 120, bob: 0.1, rate: 0.9, ph: i * 2, tick: (t) => ((b.rotation.z = Math.sin(t * 0.9) * 0.05), (b.rotation.x = Math.sin(t * 0.7) * 0.04)) });
  });

  // gulls riding the air above the roofs
  const gulls: Array<{ update(t: number, dt: number): void }> = [];
  for (let i = 0; i < 4; i++) {
    const b = bird();
    b.root.scale.setScalar(0.3 + rand() * 0.08);
    g.add(b.root);
    gulls.push(b);
    const dir = i % 2 ? -1 : 1;
    face(b.root, dir);
    list.push({ obj: b.root, x0: i * 33 + rand() * 12, z: -6 - rand() * 6, y: 33 + i * 1.1 + rand(), vel: dir * (2.8 + rand()), period: 130, bob: 0.4, rate: 0.5, ph: i * 2, tick: (t) => b.update(t * 0.9 + i, 0) });
  }
  return {
    group: g,
    range: [18, 60],
    update(c) {
      drift(list, c);
    },
  };
}
type HumanStyleLite = NonNullable<Parameters<typeof human>[0]>;

/* ───────────────────────────── up in the air ───────────────────────────── */

function balloon(colors: string[], size = 1): THREE.Group {
  const tex = canvasTex(256, 64, (c, w, h) => {
    for (let i = 0; i < 8; i++) {
      c.fillStyle = colors[i % colors.length];
      c.fillRect((i / 8) * w, 0, w / 8 + 1, h);
    }
  });
  const g = new THREE.Group();
  const env = toy('#ffffff', { rough: 0.4 });
  env.map = tex;
  g.add(at(ball(1.9, env, [1, 1.15, 1], 24), 0, 2.9, 0));
  g.add(at(cone(0.7, 1.0, toy(colors[0]), 12), 0, 0.85, 0, Math.PI));
  g.add(at(rbox(0.9, 0.7, 0.9, toy('#8a5f35'), 0.1), 0, -0.45, 0));
  g.add(at(glow('#ffb060', 1.2, 0.8), 0, 0.3, 0));
  g.scale.setScalar(size);
  return g;
}

function blimp(): THREE.Group {
  const g = new THREE.Group();
  const hull = lathe([[0, -2.4], [0.5, -2.0], [0.9, -1.0], [1.05, 0], [0.9, 1.0], [0.5, 1.9], [0, 2.3]], toy('#e9eef4', { rough: 0.4 }), 12);
  hull.rotation.z = -Math.PI / 2;
  g.add(hull);
  g.add(at(torus(0.99, 0.05, toy('#2f6bbf'), 18), 0.35, 0, 0, 0, Math.PI / 2, 0));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) g.add(at(flat([[0, 0.5], [-0.8, 1.35], [-1.15, 1.35], [-1.0, 0.4]], 0.05, toy('#2f6bbf')), -1.7, 0, 0, a, 0, 0));
  g.add(at(rbox(1.1, 0.32, 0.4, toy('#cfd6df'), 0.1), 0.3, -1.05, 0));
  g.scale.setScalar(1.3);
  return g;
}

function kite(color: string, color2: string): THREE.Group {
  const g = new THREE.Group();
  g.add(flat([[0, 0.9], [0.5, 0.15], [0, 0], [-0.5, 0.15]], 0.02, toy(color, { side: THREE.DoubleSide })));
  g.add(flat([[0, 0], [0.5, 0.15], [0, -0.85], [-0.5, 0.15]], 0.02, toy(color2, { side: THREE.DoubleSide })));
  const bows: THREE.Mesh[] = [];
  for (let k = 0; k < 7; k++) {
    const b = flat([[-0.08, 0.1], [0, 0], [0.08, 0.1], [0, -0.1]], 0.02, toy(k % 2 ? color : color2, { side: THREE.DoubleSide }));
    g.add(b);
    bows.push(b);
  }
  g.userData.tick = (t: number) => {
    g.rotation.z = Math.sin(t * 1.1) * 0.18;
    bows.forEach((b, k) => b.position.set(Math.sin(t * 2.4 - k * 0.7) * 0.14 * (k + 1) * 0.35, -0.95 - k * 0.3, 0));
  };
  return g;
}

/** Other flyers: gull flocks, kites, balloons, a blimp, distant helicopters and airliners with contrails. */
export function airLife(): Biome {
  const g = new THREE.Group();
  const rand = rng(8128);
  const list: Mover[] = [];
  const keep: Array<{ update(t: number, dt: number): void }> = [];

  // a V of gulls
  for (let i = 0; i < 7; i++) {
    const b = bird();
    b.root.scale.setScalar(0.27);
    g.add(b.root);
    keep.push(b);
    const k = i === 0 ? 0 : Math.ceil(i / 2);
    const side = i % 2 ? 1 : -1;
    list.push({ obj: b.root, x0: 40 - k * 1.5, z: -15 + side * k * 1.1, y: 43.5 + k * -0.2, vel: 3.2, period: 150, bob: 0.25, rate: 0.9, ph: k, tick: (t) => b.update(t + k * 0.3, 0) });
  }
  // kites
  [['#e8664a', '#f4c24a', 36, 44, -8], ['#3f78b8', '#e8e8ea', 100, 40, -10], ['#8f5fa8', '#e0b23a', 70, 46, -12]].forEach(([a, b2, x0, y, z], i) => {
    const k = kite(a as string, b2 as string);
    k.scale.setScalar(1.1);
    g.add(k);
    list.push({ obj: k, x0: x0 as number, z: z as number, y: y as number, vel: 0, period: 150, bob: 0.5, rate: 0.5, ph: i * 2, tick: k.userData.tick as (t: number) => void });
  });
  // balloons and a blimp
  const bl = [balloon(['#2f9478', '#e8e2d4', '#3a6fb0'], 0.55), balloon(['#c99a2f', '#b8404f'], 0.45)];
  bl.forEach((b, i) => {
    g.add(b);
    list.push({ obj: b, x0: 30 + i * 70, z: -16 - i * 8, y: 51 + i * 4, vel: 0.35, period: 150, bob: 0.6, rate: 0.4, ph: i * 2 });
  });
  const air = blimp();
  g.add(air);
  list.push({ obj: air, x0: 100, z: -36, y: 54, vel: 1.1, period: 180, bob: 0.4, rate: 0.3 });
  // a far helicopter
  const heli = helicopter();
  heli.root.scale.setScalar(0.36);
  g.add(heli.root);
  keep.push(heli);
  list.push({ obj: heli.root, x0: 10, z: -22, y: 55, vel: -2, period: 150, bob: 0.3, rate: 0.6, tick: (t) => heli.update(t, 0) });
  face(heli.root, -1);
  // airliners and their contrails
  [[1, 68, -34, 8, 40], [-1, 62, -28, 6, 120]].forEach(([dir, y, z, v, x0]) => {
    const p = plane();
    p.root.scale.setScalar(0.32);
    face(p.root, dir);
    g.add(p.root);
    keep.push(p);
    const trail = at(mk(new THREE.BoxGeometry(14, 0.05, 0.05), lit('#ffffff', 0.35, true)), 0, 0, 0);
    const holder = grp(p.root, trail);
    trail.position.x = -dir * 7.6;
    trail.position.y = -0.1;
    g.add(holder);
    p.root.position.set(0, 0, 0);
    list.push({ obj: holder, x0, z, y, vel: dir * v, period: 220, tick: (t) => p.update(t, 0) });
  });
  void rand;
  return {
    group: g,
    range: [28, 110],
    update(c) {
      drift(list, c);
    },
  };
}

/* ───────────────────────────── near space ───────────────────────────── */

function station(): THREE.Group {
  const g = new THREE.Group();
  const white = toy('#e6eaf0', { rough: 0.35, metal: 0.2 });
  const gold = toy('#d8b45a', { rough: 0.35, metal: 0.4 });
  const panel = toy('#2a4f9c', { rough: 0.25, metal: 0.3 });
  const frame = toy('#c4cad6');
  const truss = cyl(0.07, 0.07, 7.2, frame, 6);
  truss.rotation.z = Math.PI / 2;
  g.add(truss);
  for (const x of [-3, -2.2, 2.2, 3]) for (const s of [1, -1]) {
    g.add(at(rbox(0.9, 0.025, 3.4, panel, 0.01), x, 0, s * 1.95));
    g.add(at(cyl(0.025, 0.025, 0.5, frame, 4), x, 0, s * 0.25, Math.PI / 2, 0, 0));
  }
  const mod = capsule(0.34, 1.9, white);
  mod.rotation.z = Math.PI / 2;
  g.add(at(mod, 0, 0, 0, 0, 0, Math.PI / 2));
  g.add(at(ball(0.4, gold, [1, 1, 1], 10), 1.3, 0, 0));
  g.add(at(cyl(0.25, 0.25, 1.5, white, 10), 0, 0.85, 0));
  g.add(at(cyl(0.22, 0.22, 1.2, white, 10), 0, -0.8, 0));
  g.add(at(rbox(0.05, 1.5, 0.9, toy('#f2f4f8'), 0.01), -1.3, 0, 0.9));
  g.scale.setScalar(0.9);
  return g;
}

/** Other satellites, an orbital station, debris and shooting stars. */
export function orbitLife(): Biome {
  const g = new THREE.Group();
  const rand = rng(31337);
  const list: Mover[] = [];
  const keep: Array<{ update(t: number, dt: number): void }> = [];
  const st = station();
  g.add(st);
  list.push({ obj: st, x0: 20, z: -24, y: 108.5, vel: 0.5, period: 160, bob: 0.5, rate: 0.2, tick: (t) => ((st.rotation.x = t * 0.05), (st.rotation.y = 0.3)) });
  for (let i = 0; i < 3; i++) {
    const s = satellite();
    s.root.scale.setScalar(0.3 + i * 0.05);
    g.add(s.root);
    keep.push(s);
    list.push({ obj: s.root, x0: 60 + i * 40, z: -20 - i * 6, y: 98 + i * 6, vel: (i % 2 ? -1 : 1) * 0.7, period: 160, bob: 0.4, rate: 0.3, ph: i, tick: (t) => s.update(t, 0) });
  }
  // tumbling debris
  const DEB = 22;
  const debris = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), toy('#9aa2ae', { rough: 0.45, metal: 0.5 }), DEB);
  debris.frustumCulled = false;
  g.add(debris);
  const seeds = Array.from({ length: DEB }, () => ({ x: rand() * 80, y: (rand() - 0.5) * 18, z: -14 + rand() * 11, s: 0.07 + rand() * 0.2, v: 0.3 + rand() * 0.5, a: rand() * 6, w: 0.3 + rand() * 1.4 }));
  // shooting stars
  const SH = 3;
  const streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1, 0.05), lit('#ffffff', 0.9, true), SH);
  streaks.frustumCulled = false;
  g.add(streaks);
  const dummy = new THREE.Object3D();
  const cam0 = new THREE.Vector3();
  return {
    group: g,
    range: [70, 200],
    update(c) {
      drift(list, c);
      cam0.copy(c.camera.position);
      for (let i = 0; i < DEB; i++) {
        const s = seeds[i];
        const x = wrap(s.x - c.scroll * parallax(s.z) * 0.2 + c.t * s.v, 80) - 40;
        dummy.position.set(x, c.camY + s.y + Math.sin(c.t * 0.3 + s.a) * 0.5, s.z);
        dummy.rotation.set(c.t * s.w + s.a, c.t * s.w * 0.7, s.a);
        dummy.scale.set(s.s, s.s * 0.45, s.s * 0.8);
        dummy.updateMatrix();
        debris.setMatrixAt(i, dummy.matrix);
      }
      debris.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < SH; i++) {
        const cycle = 7 + i * 2.3;
        const u = ((c.t + i * 3.1) % cycle) / 0.9; // 0..1 while visible
        const on = u < 1;
        const k = Math.floor((c.t + i * 3.1) / cycle);
        const x0 = ((k * 37 + i * 11) % 30) - 8;
        dummy.position.set(cam0.x + x0 + u * 10, c.camY + 9 - u * 6 + i * 1.4, -34);
        dummy.rotation.set(0, 0, Math.atan2(6, 10) + Math.PI / 2 - 0.12);
        dummy.scale.set(1, on ? 3.2 * Math.sin(u * Math.PI) : 0.001, 1);
        dummy.updateMatrix();
        streaks.setMatrixAt(i, dummy.matrix);
      }
      streaks.instanceMatrix.needsUpdate = true;
    },
  };
}

/** A comet crossing the sky of the solar-system stage, and faint dust far behind it. */
export function deepLife(): Biome {
  const g = new THREE.Group();
  const comet = new THREE.Group();
  comet.add(ball(0.32, lit('#eaf6ff'), [1, 1, 1], 14));
  comet.add(glow('#9fd8ff', 2.4, 0.8));
  const tail = mk(new THREE.ConeGeometry(0.34, 7, 12, 1, true), lit('#8fd0ff', 0.28, true));
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -3.4;
  comet.add(tail);
  const tail2 = mk(new THREE.ConeGeometry(0.2, 5, 10, 1, true), lit('#cdeaff', 0.35, true));
  tail2.rotation.z = Math.PI / 2 + 0.12;
  tail2.position.set(-2.4, -0.25, 0);
  comet.add(tail2);
  g.add(comet);
  const sun0 = new THREE.Vector3();
  return {
    group: g,
    range: [118, 400],
    update(c) {
      const u = (c.t * 0.035) % 1;
      sun0.set(c.camera.position.x, c.camY, 0);
      comet.position.set(sun0.x + lerp(24, -26, u), sun0.y + lerp(11, 3, u) - smooth(0, 1, u) * 0, -26);
      comet.rotation.z = Math.atan2(-8, -50) + Math.PI;
      comet.visible = c.camY > 125;
    },
  };
}

/* ───────────────────────────── the lunar site ───────────────────────────── */

/** Lander, flag, rover and rocks for the moon beneath the astronaut. Built at world size; the caller scales it onto the moon. */
export function lunarSite(): THREE.Group {
  const g = new THREE.Group();
  const gold = toy('#d0a94e', { rough: 0.35, metal: 0.4 });
  const white = toy('#dfe3ea', { rough: 0.4 });
  const dark = toy('#2b3040');
  // lander
  const lander = new THREE.Group();
  lander.add(at(cyl(1.5, 1.7, 0.9, gold, 8), 0, 1.35, 0));
  lander.add(at(cyl(1.0, 1.15, 1.1, white, 8), 0, 2.35, 0));
  lander.add(at(ball(0.95, white, [1, 0.75, 1], 10), 0, 3.0, 0));
  lander.add(at(rbox(0.7, 0.4, 0.05, dark, 0.02), 0.95, 2.6, 0));
  lander.add(at(cone(0.18, 0.7, white, 6), 0, 3.9, 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    const leg = at(cyl(0.07, 0.07, 1.9, white, 5), Math.cos(a) * 2.0, 0.65, Math.sin(a) * 2.0, Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55);
    lander.add(leg);
    lander.add(at(cyl(0.45, 0.45, 0.07, gold, 8), Math.cos(a) * 2.5, 0.04, Math.sin(a) * 2.5));
  }
  lander.position.set(0, 0, 0);
  g.add(lander);
  // rover
  const rover = new THREE.Group();
  rover.add(at(rbox(1.7, 0.18, 1.0, white, 0.05), 0, 0.62, 0));
  rover.add(at(rbox(0.5, 0.2, 0.4, dark, 0.04), -0.4, 0.82, 0));
  rover.add(at(cyl(0.02, 0.02, 0.9, white, 4), 0.6, 1.0, 0.25));
  rover.add(at(cyl(0.3, 0.3, 0.05, toy('#cfd6df', { metal: 0.3 }), 10), 0.6, 1.5, 0.25, 0.5, 0, 0));
  for (const x of [-0.65, 0, 0.65]) for (const s of [1, -1]) rover.add(at(cyl(0.26, 0.26, 0.2, toy('#b9bfc9', { rough: 0.7 }), 10), x, 0.28, s * 0.62, Math.PI / 2, 0, 0));
  g.add(rover);
  // flag
  const flagG = new THREE.Group();
  flagG.add(at(cyl(0.035, 0.035, 3.2, white, 5), 0, 1.6, 0));
  const cloth = canvasTex(96, 64, (c, w, h) => {
    c.fillStyle = '#e8e8ea';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        c.fillStyle = '#c4423f';
        c.fillRect(0, (i / 6) * h, w, h / 6 + 1);
      }
    }
    c.fillStyle = '#2f4aa0';
    c.fillRect(0, 0, w * 0.42, h * 0.55);
  });
  const fm = toy('#ffffff', { rough: 0.8, side: THREE.DoubleSide });
  fm.map = cloth;
  flagG.add(at(mk(new THREE.PlaneGeometry(1.4, 0.95), fm), 0.74, 2.62, 0));
  flagG.add(at(ball(0.07, white, [1, 1, 1], 6), 0, 3.2, 0));
  g.add(flagG);
  g.userData = { lander, rover, flag: flagG };
  return g;
}

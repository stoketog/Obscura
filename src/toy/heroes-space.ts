import { THREE, TAU, at, ball, canvasTex, capsule, cone, cyl, dome, glow, grp, lit, rbox, toy, torus } from './kit';
import type { Hero } from './heroes-sea';
import { makeEarth, makeMoon, makePlanet } from './planets';

const dummy = new THREE.Object3D();

/* ─────────────────────────────── 9 · rocket ─────────────────────────────── */

export function rocket(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const white = toy('#f7f9ff');
  const red = toy('#ff3b4e');
  const steel = toy('#8e97b5', { metal: 0.8, rough: 0.25 });
  inner.add(cyl(0.9, 0.9, 2.8, white, 40));
  const nose = dome(0.9, red, 40);
  nose.scale.y = 1.9;
  nose.position.y = 1.4;
  inner.add(nose);
  inner.add(at(torus(0.9, 0.09, red, 40), 0, -0.8, 0, Math.PI / 2));
  inner.add(at(torus(0.9, 0.06, red, 40), 0, -0.4, 0, Math.PI / 2));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + Math.PI / 2;
    const fin = rbox(0.16, 1.5, 1.0, red, 0.07);
    const pv = grp(fin);
    fin.position.set(0, 0, 0.95);
    pv.position.set(0, -1.15, 0);
    pv.rotation.y = a;
    fin.rotation.x = -0.18;
    inner.add(pv);
  }
  inner.add(at(cyl(0.5, 0.65, 0.55, steel, 28), 0, -1.65, 0));
  // porthole facing the camera (+z)
  inner.add(at(torus(0.4, 0.09, toy('#ffd05a', { metal: 0.6, rough: 0.2 })), 0, 0.5, 0.88));
  inner.add(at(ball(0.4, toy('#7fd3ff', { glow: 0.5, emissive: '#3aa6ff', rough: 0.05 }), [1, 1, 0.35]), 0, 0.5, 0.86));
  inner.add(at(ball(0.1, lit('#ffffff'), [1, 1, 1], 10), -0.13, 0.64, 1.0));
  // flame
  const flame = new THREE.Group();
  flame.position.y = -1.95;
  const layers: Array<[number, number, string]> = [[0.62, 2.2, '#ff7a1a'], [0.44, 1.7, '#ffc21a'], [0.26, 1.2, '#fff6c8']];
  const cones = layers.map(([r, h, c], i) => {
    const m = cone(r, h, lit(c, 0.92 - i * 0.1, i < 2), 24);
    m.castShadow = false;
    m.rotation.x = Math.PI;
    m.position.y = -h / 2;
    flame.add(m);
    return m;
  });
  inner.add(flame);
  const flameGlow = glow('#ffa040', 4.5, 0.8);
  flameGlow.position.set(0, -2.4, 0);
  inner.add(flameGlow);
  const SPARKS = 20;
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), lit('#ffd27a'), SPARKS);
  sparks.frustumCulled = false;
  inner.add(sparks);
  return {
    root,
    sparkle: '#ff3b4e',
    yaw: 0,
    update(t) {
      const f = 1 + Math.sin(t * 38) * 0.12 + Math.sin(t * 23) * 0.08;
      cones.forEach((c, i) => c.scale.set(1 + Math.sin(t * 31 + i) * 0.06, f * (1 - i * 0.04), 1));
      flameGlow.material.opacity = 0.6 + Math.sin(t * 40) * 0.12;
      inner.position.y = Math.sin(t * 1.6) * 0.15;
      inner.rotation.z = Math.sin(t * 1.2) * 0.04;
      inner.rotation.y = Math.sin(t * 0.7) * 0.12;
      for (let i = 0; i < SPARKS; i++) {
        const s = (t * 0.9 + i / SPARKS) % 1;
        dummy.position.set(Math.sin(i * 12.9) * 0.5 * s, -2.2 - s * 4.5, Math.cos(i * 7.7) * 0.5 * s);
        dummy.scale.setScalar(1 - s);
        dummy.updateMatrix();
        sparks.setMatrixAt(i, dummy.matrix);
      }
      sparks.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ───────────────────────────── 10 · satellite ───────────────────────────── */

function panelTexture() {
  return canvasTex(256, 128, (c, w, h) => {
    c.fillStyle = '#1a47c9';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#9fc2ff';
    c.lineWidth = 3;
    for (let i = 0; i <= 8; i++) {
      c.beginPath();
      c.moveTo((i / 8) * w, 0);
      c.lineTo((i / 8) * w, h);
      c.stroke();
    }
    for (let j = 0; j <= 4; j++) {
      c.beginPath();
      c.moveTo(0, (j / 4) * h);
      c.lineTo(w, (j / 4) * h);
      c.stroke();
    }
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
}

export function satellite(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const gold = toy('#ffc933', { metal: 0.85, rough: 0.28, env: 1.3 });
  const foil = toy('#ff9f1a', { metal: 0.8, rough: 0.3 });
  const steel = toy('#c9d1ea', { metal: 0.6, rough: 0.25 });
  inner.add(rbox(1.7, 1.7, 1.7, gold, 0.25));
  for (const y of [-0.45, 0.45]) inner.add(at(rbox(1.78, 0.2, 1.78, foil, 0.08), 0, y, 0));
  const panelMat = toy('#ffffff', { rough: 0.15, clear: 1 });
  panelMat.map = panelTexture();
  const panels: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const pv = new THREE.Group();
    pv.position.set(s * 0.85, 0, 0);
    pv.add(at(cyl(0.07, 0.07, 1.0, steel, 10), s * 0.5, 0, 0, 0, 0, Math.PI / 2));
    const p = rbox(3.1, 0.09, 1.8, panelMat, 0.04);
    p.position.set(s * 2.45, 0, 0);
    pv.add(p);
    inner.add(pv);
    panels.push(pv);
  }
  inner.add(at(cyl(0.06, 0.06, 0.7, steel, 10), 0, 1.15, 0));
  const dishPivot = new THREE.Group();
  dishPivot.position.set(0, 1.5, 0);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.75, 36, 14, 0, TAU, 0, 0.95), toy('#f3f6ff', { side: THREE.DoubleSide }));
  dish.castShadow = true;
  dish.rotation.x = Math.PI / 2 - 0.4;
  dishPivot.add(dish);
  dishPivot.add(at(cyl(0.04, 0.04, 0.55, steel, 8), 0, 0, 0.3, Math.PI / 2 - 0.4));
  inner.add(dishPivot);
  inner.add(at(cyl(0.025, 0.025, 1.0, steel, 8), 0.6, 1.3, -0.4));
  const bulb = ball(0.09, lit('#ff4a4a'), [1, 1, 1], 10);
  bulb.position.set(0.6, 1.82, -0.4);
  inner.add(bulb);
  const bulbGlow = glow('#ff3a3a', 0.8, 0.8);
  bulbGlow.position.copy(bulb.position);
  inner.add(bulbGlow);
  inner.add(at(ball(0.3, toy('#10152e', { rough: 0.1 })), 0.9, -0.1, 0.78, 0, 0, 0));
  inner.add(at(ball(0.16, toy('#79c8ff', { glow: 0.8 })), 1.15, -0.1, 0.86));
  const pings = [0, 1, 2].map(() => {
    const r = torus(1, 0.03, lit('#8fe8ff', 0.8, true), 36);
    r.castShadow = false;
    inner.add(r);
    return r;
  });
  return {
    root,
    sparkle: '#ffc933',
    yaw: 0,
    update(t) {
      inner.rotation.y = Math.sin(t * 0.5) * 0.7 + 0.4;
      inner.rotation.x = Math.sin(t * 0.37) * 0.12;
      inner.position.y = Math.sin(t * 0.9) * 0.2;
      panels.forEach((p, i) => (p.rotation.x = Math.sin(t * 0.6 + i) * 0.1));
      dishPivot.rotation.y = Math.sin(t * 0.8) * 0.6;
      bulbGlow.material.opacity = 0.2 + 0.7 * Math.max(0, Math.sin(t * 3));
      pings.forEach((r, i) => {
        const s = (t * 0.5 + i / 3) % 1;
        r.position.set(0, 1.6, 0);
        r.scale.setScalar(0.4 + s * 2.6);
        r.rotation.x = Math.PI / 2 - 0.4;
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - s) * 0.7;
      });
    },
  };
}

/* ───────────────────────────── 11 · astronaut ───────────────────────────── */

export function astronaut(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const suit = toy('#f7f8ff', { rough: 0.35 });
  const grey = toy('#aeb6d1');
  const orange = toy('#ff8a2a');
  inner.add(rbox(1.0, 1.25, 0.85, suit, 0.32));
  inner.add(at(rbox(0.55, 1.0, 0.95, grey, 0.2), -0.7, 0.05, 0));
  inner.add(at(rbox(0.1, 0.4, 0.55, toy('#2c3566'), 0.04), 0.5, 0.15, 0));
  for (const [i, c] of ['#ff4d5e', '#45e08a', '#4da6ff'].entries()) inner.add(at(ball(0.07, lit(c), [1, 1, 1], 8), 0.56, 0.3 - i * 0.14, 0));
  inner.add(at(torus(0.5, 0.11, orange, 36), 0, 0.72, 0, Math.PI / 2));
  const helmet = grp(ball(0.74, suit, [1, 1, 1], 40));
  helmet.add(at(ball(0.6, toy('#ffb23e', { metal: 1, rough: 0.04, env: 2.4 }), [0.82, 0.78, 0.98], 36), 0.34, 0.02, 0));
  helmet.add(at(ball(0.12, lit('#ffffff'), [1, 1, 1], 10), 0.62, 0.28, 0.25));
  helmet.position.set(0, 1.28, 0);
  inner.add(helmet);
  const arms = [1, -1].map((s) => {
    const sh = new THREE.Group();
    sh.position.set(0, 0.35, s * 0.62);
    sh.add(at(capsule(0.19, 0.5, suit), 0, -0.35, 0));
    sh.add(at(ball(0.22, orange), 0, -0.82, 0));
    inner.add(sh);
    return sh;
  });
  const legs = [1, -1].map((s) => {
    const lg = new THREE.Group();
    lg.position.set(0, -0.62, s * 0.26);
    lg.add(at(capsule(0.22, 0.5, suit), 0, -0.4, 0));
    lg.add(at(ball(0.28, grey, [1.4, 0.8, 1]), 0.1, -0.95, 0));
    inner.add(lg);
    return lg;
  });
  const LINKS = 26;
  const tether = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), toy('#ffd45a', { glow: 0.3 }), LINKS);
  tether.frustumCulled = false;
  inner.add(tether);
  return {
    root,
    sparkle: '#ffb23e',
    yaw: -0.5,
    update(t) {
      inner.position.y = Math.sin(t * 0.8) * 0.3;
      inner.rotation.z = Math.sin(t * 0.5) * 0.28;
      inner.rotation.x = Math.sin(t * 0.43) * 0.18;
      inner.rotation.y = Math.sin(t * 0.3) * 0.25;
      arms.forEach((a, i) => (a.rotation.x = (i === 0 ? -1 : 1) * (0.6 + Math.sin(t * 0.9 + i) * 0.3)));
      legs.forEach((l, i) => (l.rotation.z = Math.sin(t * 0.7 + i * 2) * 0.3 + 0.1));
      for (let k = 0; k < LINKS; k++) {
        const s = k / (LINKS - 1);
        dummy.position.set(-1.1 - s * 16, -0.1 + Math.sin(s * 6 - t * 0.9) * 0.9 * s, -0.4 - s * 4);
        dummy.scale.setScalar(0.07);
        dummy.updateMatrix();
        tether.setMatrixAt(k, dummy.matrix);
      }
      tether.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ───────────────────────────── 12 · solar system ───────────────────────────── */

interface Body { r: number; orbit: number; speed: number; cols: string[]; ring?: boolean; moon?: boolean }
const BODIES: Body[] = [
  { r: 0.16, orbit: 1.35, speed: 2.4, cols: ['#b9b2aa', '#8f8a85'] },
  { r: 0.24, orbit: 1.85, speed: 1.8, cols: ['#f1d9a0', '#d9b27a'] },
  { r: 0.26, orbit: 2.4, speed: 1.4, cols: [], moon: true },
  { r: 0.2, orbit: 2.9, speed: 1.1, cols: ['#e0643b', '#b94a2c', '#f08a5a'] },
  { r: 0.56, orbit: 3.7, speed: 0.72, cols: ['#e8c9a0', '#c78f64', '#f4e1c0'] },
  { r: 0.46, orbit: 4.6, speed: 0.55, cols: ['#ecd7a0', '#cfb074', '#f6e9bf'], ring: true },
  { r: 0.32, orbit: 5.3, speed: 0.4, cols: ['#a5eef0', '#7fd9e0'] },
  { r: 0.32, orbit: 5.9, speed: 0.32, cols: ['#4a7dff', '#3a63d9', '#6b95ff'] },
];

/** A toy orrery: glossy planets circling a glowing sun. */
export function solar(): Hero {
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = 0.5;
  tilt.scale.setScalar(0.78);
  root.add(tilt);
  const sunMat = lit('#ffd25a');
  const sun = ball(0.95, sunMat, [1, 1, 1], 36);
  sun.castShadow = false;
  tilt.add(sun);
  tilt.add(glow('#ffb347', 6.5, 0.7));
  tilt.add(glow('#fff2c0', 3.2, 0.9));
  const movers: Array<{ pivot: THREE.Group; speed: number; self: THREE.Object3D; moon?: THREE.Object3D }> = [];
  BODIES.forEach((b, i) => {
    const orbitRing = torus(b.orbit, 0.012, lit('#cfe3ff', 0.35, false), 80);
    orbitRing.rotation.x = Math.PI / 2;
    orbitRing.castShadow = false;
    tilt.add(orbitRing);
    const pivot = new THREE.Group();
    pivot.rotation.y = i * 1.9;
    const body = b.moon ? makeEarth(b.r, false) : makePlanet(b.r, b.cols, i + 2);
    body.position.x = b.orbit;
    pivot.add(body);
    let moon: THREE.Object3D | undefined;
    if (b.moon) {
      moon = makeMoon(0.07);
      pivot.add(moon);
    }
    if (b.ring) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(b.r * 1.45, b.r * 2.35, 64), new THREE.MeshBasicMaterial({ color: '#ead8a6', side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
      ring.rotation.x = Math.PI / 2 - 0.35;
      ring.position.x = b.orbit;
      pivot.add(ring);
    }
    tilt.add(pivot);
    movers.push({ pivot, speed: b.speed, self: body, moon });
  });
  return {
    root,
    sparkle: '#ffd25a',
    yaw: 0,
    update(t) {
      sun.rotation.y = t * 0.3;
      movers.forEach((m, i) => {
        m.pivot.rotation.y = i * 1.9 + t * m.speed * 0.35;
        m.self.rotation.y = t * 0.8;
        if (m.moon) m.moon.position.set(BODIES[i].orbit + Math.cos(t * 3) * 0.45, 0.02, Math.sin(t * 3) * 0.45);
      });
      tilt.rotation.z = Math.sin(t * 0.25) * 0.06;
    },
  };
}

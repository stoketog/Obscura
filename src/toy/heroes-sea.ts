import { THREE, TAU, at, ball, capsule, cone, dome, eyes, glow, grp, lerp, lit, rng, toy, torus } from './kit';

/** What the player is right now. Heroes are built facing +x; the world turns them toward the camera. */
export interface Hero {
  root: THREE.Group;
  update(t: number, dt: number): void;
  /** Heading about Y (radians). Default: three-quarter view of something travelling right. */
  yaw?: number;
  /** Colour of the sparkle burst when the player becomes this. */
  sparkle: THREE.ColorRepresentation;
}

const dummy = new THREE.Object3D();

/** A chain of small spheres as one draw call. `set` positions each link every frame. */
function chain(count: number, r: number, mat: THREE.Material) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), mat, count);
  mesh.frustumCulled = false;
  return mesh;
}

/* ──────────────────────────── 1 · microbe ──────────────────────────── */

export function microbe(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const skin = toy('#5af2c2', { opacity: 0.55, glow: 0.6, emissive: '#13c79a', rough: 0.15, depthWrite: false });
  const blob = ball(1.25, skin, [1.25, 1, 1], 40);
  blob.castShadow = false;
  inner.add(blob);
  inner.add(at(ball(0.46, toy('#ffd36a', { glow: 0.7 })), 0.1, 0.05, 0));
  const organelles: Array<[number, number, number, string, number]> = [[-0.7, 0.35, 0.3, '#ff7ac8', 0.2], [-0.45, -0.4, -0.3, '#a78bfa', 0.24], [0.75, -0.25, 0.4, '#ff9b54', 0.18], [-0.1, 0.55, -0.4, '#c6ff6a', 0.17], [0.5, 0.45, -0.25, '#ffffff', 0.12]];
  for (const [x, y, z, c, r] of organelles) inner.add(at(ball(r, toy(c, { glow: 0.35 })), x, y, z));
  inner.add(eyes(0.27, 0.46, 1.18, 0.3));
  const smileGeo = new THREE.TorusGeometry(0.22, 0.045, 10, 24, Math.PI);
  smileGeo.rotateZ(Math.PI);
  smileGeo.rotateY(Math.PI / 2);
  const smile = new THREE.Mesh(smileGeo, toy('#0d1224'));
  smile.position.set(1.5, -0.12, 0);
  inner.add(smile);
  // cilia around the rim
  const ciliaMat = toy('#b8ffe9', { glow: 0.4 });
  const cilia: THREE.Mesh[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    const c = capsule(0.05, 0.3, ciliaMat);
    c.castShadow = false;
    const pivot = grp(c);
    c.position.y = 0.2;
    pivot.position.set(Math.cos(a) * 1.55, Math.sin(a) * 1.22, 0);
    pivot.userData.base = a - Math.PI / 2;
    pivot.rotation.z = pivot.userData.base;
    cilia.push(pivot as unknown as THREE.Mesh);
    inner.add(pivot);
  }
  // flagellum
  const tailMat = toy('#8ff7d6', { glow: 0.5 });
  const tail = chain(14, 1, tailMat);
  inner.add(tail);
  const glowSprite = glow('#3dffd0', 6.5, 0.4);
  inner.add(glowSprite);
  return {
    root,
    sparkle: '#5af2c2',
    yaw: -0.3,
    update(t) {
      const p = 1 + Math.sin(t * 2.6) * 0.04;
      blob.scale.set(1.56 * p, 1.25 / p, 1.25 / p);
      inner.position.y = Math.sin(t * 1.1) * 0.18;
      inner.rotation.z = Math.sin(t * 0.8) * 0.08;
      cilia.forEach((c, i) => (c.rotation.z = c.userData.base + Math.sin(t * 7 + i * 0.9) * 0.35));
      for (let k = 0; k < 14; k++) {
        const s = k / 13;
        dummy.position.set(-1.6 - k * 0.17, Math.sin(t * 6 - k * 0.8) * (0.08 + s * 0.28), 0);
        dummy.scale.setScalar(lerp(0.15, 0.04, s));
        dummy.updateMatrix();
        tail.setMatrixAt(k, dummy.matrix);
      }
      tail.instanceMatrix.needsUpdate = true;
      glowSprite.material.opacity = 0.32 + Math.sin(t * 2.6) * 0.08;
    },
  };
}

/* ─────────────────────────── 2 · jellyfish ─────────────────────────── */

export function jellyfish(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const bellMat = toy('#ff86cf', { opacity: 0.5, glow: 0.8, emissive: '#ff3da8', rough: 0.08, side: THREE.DoubleSide, depthWrite: false });
  const bell = dome(1.45, bellMat, 40);
  bell.castShadow = false;
  inner.add(bell);
  inner.add(at(torus(1.43, 0.07, toy('#ffd3ee', { glow: 0.9, emissive: '#ff9ad6' })), 0, 0, 0, Math.PI / 2));
  // inner glow and spots
  inner.add(at(glow('#ff5fc0', 5.5, 0.55), 0, 0.5, 0));
  inner.add(at(ball(0.6, toy('#ffc2ec', { opacity: 0.55, glow: 1, emissive: '#ff8ed4', depthWrite: false })), 0, 0.45, 0));
  const spotMat = toy('#fff2fb', { glow: 0.8 });
  const rand = rng(11);
  for (let i = 0; i < 9; i++) {
    const a = rand() * TAU, e = 0.35 + rand() * 0.9;
    inner.add(at(ball(0.07 + rand() * 0.06, spotMat, [1, 1, 1], 10), Math.cos(a) * Math.sin(e) * 1.4, Math.cos(e) * 1.4 * 0.98 + 0.02, Math.sin(a) * Math.sin(e) * 1.4));
  }
  const strandMat = toy('#ff9fdc', { glow: 0.9, emissive: '#ff4fb4' });
  const STR = 12, LINKS = 16;
  const strands = chain(STR * LINKS, 1, strandMat);
  inner.add(strands);
  const armMat = toy('#ffc8ef', { opacity: 0.85, glow: 0.7, emissive: '#ff7ccb' });
  const ARMS = 4, ALINKS = 9;
  const arms = chain(ARMS * ALINKS, 1, armMat);
  inner.add(arms);
  return {
    root,
    sparkle: '#ff86cf',
    yaw: -0.15,
    update(t) {
      const pulse = Math.sin(t * 2.3);
      bell.scale.set(1 + pulse * 0.07, 0.88 - pulse * 0.1, 1 + pulse * 0.07);
      inner.position.y = Math.sin(t * 1.15) * 0.3 + pulse * 0.08;
      for (let i = 0; i < STR; i++) {
        const a = (i / STR) * TAU;
        for (let k = 0; k < LINKS; k++) {
          const s = k / (LINKS - 1);
          const sway = Math.sin(t * 2.3 - k * 0.55 + i) * 0.16 * s + pulse * 0.12 * s * s;
          dummy.position.set(Math.cos(a) * (1.28 - s * 0.35) + sway * Math.cos(a + 1), -0.04 - s * 3.4, Math.sin(a) * (1.28 - s * 0.35) + sway);
          dummy.scale.setScalar(lerp(0.075, 0.03, s));
          dummy.updateMatrix();
          strands.setMatrixAt(i * LINKS + k, dummy.matrix);
        }
      }
      strands.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < ARMS; i++) {
        const a = (i / ARMS) * TAU + 0.4;
        for (let k = 0; k < ALINKS; k++) {
          const s = k / (ALINKS - 1);
          const sway = Math.sin(t * 1.9 - k * 0.7 + i * 1.7) * 0.2 * s;
          dummy.position.set(Math.cos(a) * 0.4 + sway, -0.1 - s * 2.1, Math.sin(a) * 0.4 + sway * 0.8);
          dummy.scale.setScalar(lerp(0.17, 0.07, s));
          dummy.updateMatrix();
          arms.setMatrixAt(i * ALINKS + k, dummy.matrix);
        }
      }
      arms.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ────────────────────────────── 3 · fish ────────────────────────────── */

const FISH_BODY = '#5b87b0';

export function fish(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const skin = toy(FISH_BODY);
  const white = toy('#243f5e');
  inner.add(ball(1.2, skin, [1.4, 1, 0.78], 40));
  for (const x of [0.45, -0.55]) {
    const k = Math.sqrt(1 - (x / 1.68) ** 2);
    const ring = torus(1, 0.1, white, 36);
    ring.geometry.rotateY(Math.PI / 2);
    ring.position.x = x;
    ring.scale.set(1, 1.2 * k * 1.01, 0.94 * k * 1.01);
    ring.castShadow = false;
    inner.add(ring);
  }
  inner.add(at(cone(0.4, 1.0, skin), -0.15, 1.15, 0, 0, 0, 0.35));
  const tailPivot = new THREE.Group();
  tailPivot.position.set(-1.6, 0, 0);
  const fin = cone(0.85, 1.25, toy('#c58a2e'));
  fin.rotation.z = -Math.PI / 2;
  fin.position.x = -0.55;
  fin.scale.z = 0.22;
  tailPivot.add(fin);
  inner.add(tailPivot);
  const flippers = [1, -1].map((s) => {
    const f = ball(0.45, toy('#c58a2e'), [1.0, 0.16, 0.6]);
    const pv = grp(f);
    f.position.x = -0.35;
    pv.position.set(0.35, -0.35, s * 0.88);
    pv.rotation.y = s * 0.5;
    inner.add(pv);
    return pv;
  });
  inner.add(eyes(0.3, 0.62, 1.2, 0.34));
  const mouth = new THREE.TorusGeometry(0.16, 0.04, 8, 20, Math.PI);
  mouth.rotateZ(Math.PI);
  mouth.rotateY(Math.PI / 2);
  inner.add(at(new THREE.Mesh(mouth, toy('#22303f')), 1.67, -0.13, 0));
  return {
    root,
    sparkle: '#6aa6d8',
    yaw: -0.45,
    update(t) {
      const w = Math.sin(t * 7);
      tailPivot.rotation.y = w * 0.5;
      inner.rotation.y = Math.sin(t * 7 - 1) * 0.07;
      inner.position.y = Math.sin(t * 1.6) * 0.25;
      inner.rotation.z = Math.sin(t * 1.6 + 1) * 0.06;
      flippers.forEach((f, i) => (f.rotation.z = Math.sin(t * 7 + i) * 0.35));
    },
  };
}

/** A small school fish for the background. */
export function miniFish(color: THREE.ColorRepresentation, size = 0.5): THREE.Group {
  const m = toy(color);
  const g = grp(ball(0.5, m, [1.3, 0.9, 0.6], 16));
  const tail = cone(0.28, 0.5, m, 12);
  tail.rotation.z = -Math.PI / 2;
  tail.position.x = -0.78;
  tail.scale.z = 0.3;
  g.add(tail);
  g.add(at(ball(0.1, lit('#10131f'), [1, 1, 1], 8), 0.5, 0.15, 0.27));
  g.add(at(ball(0.1, lit('#10131f'), [1, 1, 1], 8), 0.5, 0.15, -0.27));
  g.scale.setScalar(size);
  g.userData.tail = tail;
  return g;
}

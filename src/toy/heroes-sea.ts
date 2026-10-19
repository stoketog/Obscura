import { THREE, TAU, at, ball, dome, glow, grp, lerp, lit, rng, toy, torus } from './kit';
import { curve, flat } from './anatomy';

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

/** A rod-shaped bacterium, lit like a bioluminescent specimen: membrane, nucleoid, ribosomes, pili and flagella. */
export function microbe(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const HALF = 1.45; // half the rod's length (x)
  const R = 0.78;

  const rod = (r: number, half: number) => {
    const p: Array<[number, number]> = [[0, -half - r]];
    for (let i = 1; i <= 4; i++) {
      const a = (i / 4) * (Math.PI / 2);
      p.push([Math.sin(a) * r, -half - Math.cos(a) * r]);
    }
    for (let i = 1; i <= 4; i++) {
      const a = (i / 4) * (Math.PI / 2);
      p.push([Math.cos(a) * r, half + Math.sin(a) * r]);
    }
    p.push([0, half + r]);
    return new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(r, y)), 14);
  };
  // outer capsule (cell wall) and cytoplasm, both translucent, long axis along x
  const wall = new THREE.Mesh(rod(R, HALF - R * 0.1), toy('#7ff7d8', { opacity: 0.4, glow: 0.5, emissive: '#18c7a0', rough: 0.1, side: THREE.DoubleSide, depthWrite: false }));
  wall.rotation.z = -Math.PI / 2;
  const cyto = new THREE.Mesh(rod(R * 0.88, HALF - R * 0.1), toy('#58e0c0', { opacity: 0.4, glow: 0.6, emissive: '#0fa387', rough: 0.2, depthWrite: false }));
  cyto.rotation.z = -Math.PI / 2;
  inner.add(wall, cyto);

  // nucleoid: a tangle of DNA
  const dna = new THREE.Mesh(new THREE.TorusKnotGeometry(0.34, 0.045, 90, 7, 3, 7), lit('#ffd76a'));
  dna.scale.set(1.9, 0.75, 0.75);
  dna.position.x = 0.1;
  dna.castShadow = false;
  inner.add(dna);
  // plasmids and a vacuole
  const plasmid = lit('#ff9bd0');
  for (const [x, y, z, r] of [[-0.95, 0.2, 0.22, 0.12], [0.98, -0.25, -0.2, 0.1]] as const) inner.add(at(torus(r, 0.022, plasmid, 14), x, y, z, 1.1, 0.4, 0));
  inner.add(at(ball(0.2, toy('#d9fff3', { opacity: 0.5, glow: 0.3, depthWrite: false }), [1, 1, 1], 16), -0.55, -0.32, 0.2));
  // ribosomes: little dots scattered through the cell
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), lit('#e8fff8'), 46);
  const rand = rng(23);
  for (let i = 0; i < 46; i++) {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 20; k++) {
      x = (rand() * 2 - 1) * (HALF + R * 0.7);
      const a = rand() * TAU, rr = Math.sqrt(rand()) * R * 0.72;
      y = Math.cos(a) * rr;
      z = Math.sin(a) * rr;
      const ex = Math.max(0, Math.abs(x) - HALF) / (R * 0.85);
      if (y * y + z * z < (R * 0.72) ** 2 * Math.max(0, 1 - ex * ex)) break;
    }
    dummy.position.set(x, y, z);
    dummy.scale.setScalar(0.028 + rand() * 0.02);
    dummy.updateMatrix();
    dots.setMatrixAt(i, dummy.matrix);
  }
  dots.castShadow = false;
  inner.add(dots);
  // pili: fine hairs around the cell
  const piliMat = lit('#bffff0', 0.75);
  const PILI = 64;
  const pili = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 4), piliMat, PILI);
  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), q = new THREE.Quaternion();
  for (let i = 0; i < PILI; i++) {
    const x = (rand() * 2 - 1) * HALF * 1.0;
    const a = rand() * TAU;
    dir.set(0, Math.cos(a), Math.sin(a));
    const len = 0.2 + rand() * 0.22;
    dummy.position.set(x, Math.cos(a) * (R + len * 0.5 - 0.02), Math.sin(a) * (R + len * 0.5 - 0.02));
    dummy.quaternion.copy(q.setFromUnitVectors(up, dir));
    dummy.scale.set(1, len, 1);
    dummy.updateMatrix();
    pili.setMatrixAt(i, dummy.matrix);
  }
  pili.castShadow = false;
  inner.add(pili);
  // flagella: helical filaments streaming from the rear
  const flagMat = lit('#9ffbe6');
  const FL = 3, LINKS = 40;
  const flagella = chain(FL * LINKS, 1, flagMat);
  inner.add(flagella);
  inner.add(at(ball(0.09, lit('#ffd76a'), [1, 1, 1], 10), -HALF - R * 0.95, 0, 0)); // basal body
  inner.scale.setScalar(1.45);
  const aura = glow('#2dffc8', 8.5, 0.4);
  inner.add(aura);
  return {
    root,
    sparkle: '#5af2c2',
    yaw: -0.25,
    update(t) {
      inner.position.y = Math.sin(t * 0.9) * 0.2;
      inner.rotation.z = Math.sin(t * 0.55) * 0.12 + 0.06;
      inner.rotation.x = t * 0.18; // the rod slowly rolls as it swims
      dna.rotation.x = t * 0.3;
      const breathe = 1 + Math.sin(t * 2.2) * 0.012;
      wall.scale.set(breathe, 1, breathe);
      for (let f = 0; f < FL; f++) {
        const ph = (f / FL) * TAU;
        for (let k = 0; k < LINKS; k++) {
          const s = k / (LINKS - 1);
          const amp = 0.05 + s * 0.3;
          const a = t * 9 - k * 0.36 + ph;
          dummy.position.set(-HALF - R * 0.95 - s * 2.3, Math.cos(a) * amp + Math.sin(ph) * 0.1 * s, Math.sin(a) * amp + Math.cos(ph) * 0.1 * s);
          dummy.scale.setScalar(lerp(0.07, 0.04, s));
          dummy.updateMatrix();
          flagella.setMatrixAt(f * LINKS + k, dummy.matrix);
        }
      }
      flagella.instanceMatrix.needsUpdate = true;
      aura.material.opacity = 0.36 + Math.sin(t * 1.7) * 0.06;
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

/** A silvery mackerel-like fish: countershaded fusiform body, barred back, forked tail, a full set of fins. */
const FISH_X0 = -1.5, FISH_X1 = 1.7;
const FISH_H = [[FISH_X0, 0.12], [-1.2, 0.24], [-0.8, 0.42], [-0.2, 0.58], [0.4, 0.62], [1.0, 0.5], [1.4, 0.31], [1.62, 0.14], [FISH_X1, 0.0]] as Array<[number, number]>;
const FISH_W = [[FISH_X0, 0.08], [-1.2, 0.14], [-0.8, 0.26], [-0.2, 0.36], [0.4, 0.38], [1.0, 0.32], [1.4, 0.2], [1.62, 0.1], [FISH_X1, 0.0]] as Array<[number, number]>;

export function fish(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);

  // body: rings along x, shaded top to bottom with vertex colours
  const RINGS = 17, SEG = 12;
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const dark = new THREE.Color('#3b7ba0'), flank = new THREE.Color('#c1d3e0'), belly = new THREE.Color('#eaf0f3'), bar = new THREE.Color('#1f4560');
  const tmp = new THREE.Color();
  for (let i = 0; i < RINGS; i++) {
    const x = FISH_X0 + ((FISH_X1 - FISH_X0) * i) / (RINGS - 1);
    const h = curve(FISH_H, x), w = curve(FISH_W, x);
    for (let j = 0; j < SEG; j++) {
      const a = (j / SEG) * TAU;
      const y = Math.cos(a) * h * (Math.cos(a) > 0 ? 1 : 0.86);
      const z = Math.sin(a) * w;
      pos.push(x, y, z);
      const v = Math.cos(a); // 1 on the back, -1 on the belly
      if (v > 0.15) tmp.copy(flank).lerp(dark, Math.min(1, (v - 0.15) / 0.55));
      else if (v < -0.35) tmp.copy(flank).lerp(belly, Math.min(1, (-0.35 - v) / 0.45 + 0.4));
      else tmp.copy(flank);
      if (v > 0.5 && x < 1.0 && x > -1.15 && Math.sin(x * 9.5) > 0.35) tmp.lerp(bar, 0.55); // wavy bars on the back
      col.push(tmp.r, tmp.g, tmp.b);
    }
  }
  for (let i = 0; i < RINGS - 1; i++)
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG), c = (i + 1) * SEG + j, d = (i + 1) * SEG + ((j + 1) % SEG);
      idx.push(a, c, b, b, c, d);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const base = Float32Array.from(pos);
  const skin = toy('#ffffff', { rough: 0.3, clear: 1, env: 1.1 });
  skin.vertexColors = true;
  skin.side = THREE.DoubleSide;
  inner.scale.setScalar(1.55);
  const trunk = new THREE.Mesh(geo, skin);
  trunk.castShadow = true;
  trunk.frustumCulled = false;
  inner.add(trunk);

  const finM = toy('#3d7094', { rough: 0.45, side: THREE.DoubleSide });
  const finDark = toy('#27506d', { rough: 0.45, side: THREE.DoubleSide });
  const fins: Array<{ g: THREE.Group; x: number }> = [];
  const addFin = (m: THREE.Mesh, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const g = grp(m);
    g.position.set(x, y, z);
    g.rotation.set(rx, ry, rz);
    inner.add(g);
    fins.push({ g, x });
    return g;
  };
  // two dorsal fins, anal fin, pelvic and pectoral fins
  addFin(flat([[0.35, 0], [0.05, 0.5], [-0.15, 0.46], [-0.4, 0]], 0.03, finDark), 0, 0.59, 0);
  addFin(flat([[0.2, 0], [0.02, 0.3], [-0.28, 0.1], [-0.3, 0]], 0.03, finM), -0.7, 0.4, 0);
  addFin(flat([[0.2, 0], [0.0, -0.27], [-0.32, -0.08], [-0.3, 0]], 0.03, finM), -0.7, -0.36, 0);
  for (const s of [1, -1]) {
    addFin(flat([[0.0, 0], [-0.28, -0.3], [-0.08, -0.02]], 0.025, finM), 0.55, -0.45, s * 0.2, s * 0.5, 0, 0);
    const pect = addFin(flat([[0.12, 0.05], [-0.5, -0.14], [-0.5, -0.02], [-0.1, 0.1]], 0.025, finM), 0.95, -0.13, s * 0.32, 0, s * -0.6, 0);
    pect.userData.pect = s;
  }
  // forked tail on a slim peduncle
  const tail = new THREE.Group();
  tail.add(flat([[0.05, 0.1], [-0.35, 0.4], [-0.95, 0.85], [-0.78, 0.2], [-0.58, 0], [-0.78, -0.2], [-0.95, -0.85], [-0.35, -0.4], [0.05, -0.1]], 0.035, finDark));
  inner.add(tail);
  // gill cover, cheek, mouth and a golden eye
  for (const s of [1, -1]) {
    const g = grp(at(ball(0.36, toy('#d4e0ea', { rough: 0.3 }), [0.42, 0.95, 0.5], 14), 0, -0.05, 0));
    g.position.set(1.02, -0.02, s * 0.28);
    g.rotation.y = s * 0.18;
    inner.add(g);
    inner.add(at(ball(0.115, toy('#e8b23a', { rough: 0.2, smooth: true }), [0.6, 1, 1], 14), 1.4, 0.13, s * 0.215));
    inner.add(at(ball(0.07, toy('#0d1015', { rough: 0.1, smooth: true }), [0.6, 1, 1], 12), 1.42, 0.13, s * 0.225));
  }
  const mouth = new THREE.TorusGeometry(0.13, 0.016, 4, 12, Math.PI);
  mouth.rotateZ(Math.PI);
  mouth.rotateY(Math.PI / 2);
  inner.add(at(new THREE.Mesh(mouth, toy('#28323c')), 1.62, -0.03, 0));

  const W = (x: number, t: number) => {
    const u = (FISH_X1 - x) / (FISH_X1 - FISH_X0); // 0 at the nose, 1 at the tail
    return Math.sin(t * 6.5 - u * 3.4) * 0.34 * (0.05 + u * u);
  };
  return {
    root,
    sparkle: '#6aa6d8',
    yaw: -0.45,
    update(t) {
      const p = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setZ(i, base[i * 3 + 2] + W(base[i * 3], t));
      p.needsUpdate = true;
      for (const f of fins) {
        f.g.position.z = W(f.x, t) + (f.g.userData.z ?? 0);
        if (f.g.userData.pect === undefined) f.g.rotation.y = -(W(f.x - 0.1, t) - W(f.x + 0.1, t)) * 1.5;
      }
      for (const f of fins) {
        const s = f.g.userData.pect as number | undefined;
        if (s) f.g.rotation.x = Math.sin(t * 3 + s) * 0.18;
      }
      tail.position.set(FISH_X0 + 0.02, 0, W(FISH_X0, t));
      tail.rotation.y = -(W(FISH_X0 - 0.15, t) - W(FISH_X0 + 0.15, t)) * 2.2;
      inner.position.y = Math.sin(t * 1.5) * 0.18;
      inner.rotation.z = Math.sin(t * 1.5 + 1) * 0.04;
    },
  };
}

/** A small school fish for the background: slim, silvery, with a forked tail. */
export function miniFish(color: THREE.ColorRepresentation, size = 0.5): THREE.Group {
  const m = toy(color);
  const g = grp(ball(0.5, m, [1.5, 0.78, 0.5], 16));
  const tail = flat([[0.05, 0.06], [-0.3, 0.3], [-0.55, 0.36], [-0.4, 0], [-0.55, -0.36], [-0.3, -0.3], [0.05, -0.06]], 0.03, m);
  tail.position.x = -0.72;
  tail.castShadow = false;
  g.add(tail);
  g.add(at(ball(0.07, lit('#10131f'), [1, 1, 1], 8), 0.55, 0.1, 0.24));
  g.add(at(ball(0.07, lit('#10131f'), [1, 1, 1], 8), 0.55, 0.1, -0.24));
  g.scale.setScalar(size);
  g.userData.tail = tail;
  return g;
}

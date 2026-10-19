import { THREE, TAU, at, ball, building, canvasTex, clamp, cloud, cone, cyl, glow, lerp, lit, rbox, rng, rock, smooth, toy, tree, wrap } from './kit';
import { jellyfish, miniFish } from './heroes-sea';
import { makeEarth, makeMoon } from './planets';
import { QUAY_TOP, QUAY_Z, SURFACE_Y, parallax } from './layout';
import { lunarSite } from './companions';

/** Per-frame facts every piece of scenery gets. */
export interface Ctx {
  t: number;
  dt: number;
  /** Camera height. */
  camY: number;
  /** Stage index as a continuous number (3.5 = halfway from the human to the bird). */
  a: number;
  /** Accumulated scenery slide (world units). */
  scroll: number;
  /** Rate of climb in stages per second (positive = rising). */
  climb: number;
  camera: THREE.PerspectiveCamera;
}

export interface Biome {
  group: THREE.Group;
  /** Camera heights between which this is built and drawn. */
  range: [number, number];
  update(c: Ctx): void;
}

const dummy = new THREE.Object3D();

/** x position of something that slides past and wraps around. */
const slide = (x0: number, period: number, scroll: number, z: number) => wrap(x0 - scroll * parallax(z), period) - period / 2;

interface Slider { obj: THREE.Object3D; x0: number; z: number; period: number }
function sliders(list: Slider[], c: Ctx) {
  for (const s of list) s.obj.position.x = slide(s.x0, s.period, c.scroll, s.z);
}

/* ───────────────────────────── sea floor ───────────────────────────── */

export function seaFloor(): Biome {
  const g = new THREE.Group();
  const FLOOR = -3.4;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 80), toy('#0f4656', { rough: 0.85, clear: 0 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR, -14);
  g.add(floor);
  const rand = rng(31);
  const list: Slider[] = [];
  const P = 80;
  const rockCols = ['#2a6f80', '#4d4388', '#2f6585', '#1c5a68', '#62487f'];
  for (let i = 0; i < 20; i++) {
    const r = 0.5 + rand() * 1.5;
    const z = -10 + rand() * 13;
    const m = rock(r, rockCols[i % rockCols.length]);
    m.position.y = FLOOR + r * 0.28;
    g.add(m);
    list.push({ obj: m, x0: rand() * P, z, period: P });
  }
  const coralCols = ['#d85c88', '#e08747', '#9a6fe0', '#d6b032'];
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Group();
    const col = toy(coralCols[i % coralCols.length], { glow: 0.12 });
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const h = 0.8 + rand() * 1.4;
      const a = (k / n) * TAU;
      const stem = cyl(0.12, 0.2, h, col, 14);
      stem.position.set(Math.cos(a) * 0.35, h / 2, Math.sin(a) * 0.35);
      stem.rotation.z = Math.cos(a) * 0.3;
      stem.rotation.x = -Math.sin(a) * 0.3;
      const bulb = ball(0.26, col, [1, 1, 1], 14);
      bulb.position.set(Math.cos(a) * (0.35 + h * 0.15), h, Math.sin(a) * (0.35 + h * 0.15));
      c.add(stem, bulb);
    }
    c.position.y = FLOOR;
    g.add(c);
    list.push({ obj: c, x0: rand() * P, z: -4 + rand() * 6, period: P });
  }
  // glowing vents
  const vents: THREE.Sprite[] = [];
  for (let i = 0; i < 2; i++) {
    const v = new THREE.Group();
    v.add(at(cone(0.9, 2.6, toy('#2d3050', { rough: 0.6 }), 24), 0, 1.3, 0));
    v.add(at(ball(0.34, lit('#ff9a3c'), [1, 0.5, 1], 14), 0, 2.55, 0));
    const gl = glow('#ff8a2a', 3.4, 0.7);
    gl.position.y = 2.7;
    v.add(gl);
    vents.push(gl);
    v.position.y = FLOOR;
    g.add(v);
    list.push({ obj: v, x0: i * 40 + 12, z: -3, period: P });
  }
  return {
    group: g,
    range: [-30, 7],
    update(c) {
      sliders(list, c);
      vents.forEach((v, i) => (v.material.opacity = 0.55 + Math.sin(c.t * 2 + i) * 0.15));
    },
  };
}

/* ───────────────────────────── sea life ───────────────────────────── */

export function seaLife(): Biome {
  const g = new THREE.Group();
  // bubbles rise through the camera's neighbourhood
  const BUB = 56;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), toy('#dff7ff', { opacity: 0.32, rough: 0.02, glow: 0.2, emissive: '#bfeaff', depthWrite: false, smooth: true }), BUB);
  bubbles.frustumCulled = false;
  g.add(bubbles);
  const rand = rng(77);
  const seeds = Array.from({ length: BUB }, () => ({ x: (rand() - 0.5) * 22, z: -4 + rand() * 12, s: 0.07 + rand() * 0.16, v: 0.5 + rand() * 1.1, o: rand() * 20, w: rand() * TAU }));
  // marine snow
  const N = 260;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(N * 3);
  const snowSeed = Array.from({ length: N }, () => [rand(), rand(), rand(), rand()]);
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: '#d5f3ff', size: 0.11, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true }));
  snow.frustumCulled = false;
  g.add(snow);
  // kelp
  const STRANDS = 12, LINKS = 16;
  const kelp = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), toy('#1f8f60', { glow: 0.1, rough: 0.5 }), STRANDS * LINKS);
  kelp.frustumCulled = false;
  g.add(kelp);
  const kelpSeed = Array.from({ length: STRANDS }, (_, i) => ({ x0: (i / STRANDS) * 80 + rand() * 4, z: -9 + rand() * 11, h: 9 + rand() * 9, p: rand() * TAU }));
  // light shafts from the surface
  const rayTex = canvasTex(32, 128, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
    const gx = c.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, 'rgba(0,0,0,1)');
    gx.addColorStop(0.5, 'rgba(0,0,0,0)');
    gx.addColorStop(1, 'rgba(0,0,0,1)');
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = gx;
    c.fillRect(0, 0, w, h);
  });
  const rays: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(2.6 + (i % 3), 26), new THREE.MeshBasicMaterial({ map: rayTex, color: '#b9ecff', transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    r.position.set(-14 + i * 4.6, SURFACE_Y - 13, -6 - (i % 3) * 2);
    r.rotation.z = 0.28;
    rays.push(r);
    g.add(r);
  }
  // drifting jellyfish friends
  const friends = [
    { y: 7.5, z: -5, x0: 14, s: 0.5 },
    { y: 11.5, z: -9, x0: 52, s: 0.42 },
    { y: 4.5, z: -3, x0: 33, s: 0.34 },
    { y: 15.5, z: -8, x0: 68, s: 0.46 },
  ].map((f) => {
    const j = jellyfish();
    j.root.scale.setScalar(f.s);
    g.add(j.root);
    return { ...f, j };
  });
  // a school of little fish
  const palette = ['#5aa9d6', '#d6b23a', '#8a7fd6', '#47c7a0', '#d6728f'];
  const school = Array.from({ length: 18 }, (_, i) => {
    const f = miniFish(palette[i % palette.length], 0.55 + (i % 3) * 0.12);
    g.add(f);
    return { f, p: i * 0.55, y: 16 + (i % 6) * 0.9, z: -10 + (i % 5) * 1.3 };
  });
  const pos = new THREE.Vector3();
  return {
    group: g,
    range: [-30, 30],
    update(c) {
      const { t, camY } = c;
      for (let i = 0; i < BUB; i++) {
        const s = seeds[i];
        const y = ((s.o + t * s.v) % 18) - 6;
        dummy.position.set(s.x + Math.sin(t + s.w) * 0.25, camY + y, s.z);
        dummy.scale.setScalar(s.s);
        dummy.updateMatrix();
        bubbles.setMatrixAt(i, dummy.matrix);
      }
      bubbles.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < N; i++) {
        const [a, b, d, e] = snowSeed[i];
        snowPos[i * 3] = ((a * 26 - c.scroll * (0.25 + e * 0.6) + t * 0.05 * (e - 0.5)) % 26 + 26) % 26 - 13;
        snowPos[i * 3 + 1] = camY + ((b * 18 + t * (0.12 + e * 0.25)) % 18) - 9;
        snowPos[i * 3 + 2] = -8 + d * 20;
      }
      snowGeo.attributes.position.needsUpdate = true;
      for (let s = 0; s < STRANDS; s++) {
        const k = kelpSeed[s];
        const x = slide(k.x0, 80, c.scroll, k.z);
        for (let l = 0; l < LINKS; l++) {
          const f = l / (LINKS - 1);
          dummy.position.set(x + Math.sin(t * 1.1 + k.p + f * 2.2) * 0.9 * f * f, -3.2 + f * k.h, k.z);
          dummy.scale.set(lerp(0.34, 0.14, f), 0.62, 0.12);
          dummy.updateMatrix();
          kelp.setMatrixAt(s * LINKS + l, dummy.matrix);
        }
      }
      kelp.instanceMatrix.needsUpdate = true;
      rays.forEach((r, i) => {
        r.position.x = -14 + i * 4.6 + Math.sin(t * 0.3 + i) * 0.8;
        (r.material as THREE.MeshBasicMaterial).opacity = (0.12 + 0.1 * Math.sin(t * 0.6 + i * 1.3)) * smooth(2, 18, camY);
      });
      for (const f of friends) {
        f.j.root.position.set(slide(f.x0, 80, c.scroll * 0.7, f.z), f.y + Math.sin(t * 0.6 + f.x0) * 0.6, f.z);
        f.j.update(t + f.x0, c.dt);
      }
      for (const s of school) {
        const x = (t: number) => Math.sin(t * 0.42 + s.p) * 8.5 + Math.sin(t * 0.17 + s.p * 2) * 2;
        const y = (t: number) => s.y + Math.sin(t * 0.7 + s.p * 1.3) * 0.8;
        pos.set(x(t), y(t), s.z + Math.sin(t * 0.33 + s.p) * 1.2);
        s.f.position.copy(pos);
        const vx = x(t + 0.05) - x(t);
        s.f.rotation.y = vx >= 0 ? 0 : Math.PI;
        (s.f.userData.tail as THREE.Mesh).rotation.y = Math.sin(t * 11 + s.p * 3) * 0.55;
      }
    },
  };
}

/* ───────────────────────────── the water surface ───────────────────────────── */

export function water(): Biome {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(260, 90, 90, 32);
  geo.rotateX(-Math.PI / 2);
  const mat = toy('#1873b4', { rough: 0.1, clear: 0.35, glow: 0.7, emissive: '#0c4f8c', opacity: 0.95, side: THREE.DoubleSide, env: 0.5, depthWrite: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, SURFACE_Y, 20);
  mesh.receiveShadow = true;
  g.add(mesh);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const base = new Float32Array(pos.array);
  let last = -1;
  return {
    group: g,
    range: [8, 62],
    update(c) {
      mat.emissiveIntensity = lerp(0.7, 0.1, smooth(24.5, 27.5, c.camY));
      if (c.camY > SURFACE_Y + 24) return;
      const f = Math.floor(c.t * 30);
      if (f === last) return;
      last = f;
      const t = c.t, s = c.scroll;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2] + 20;
        const y = Math.sin((x + s * 1.2) * 0.32 + t * 1.2) * 0.14 + Math.cos(z * 0.5 + t * 0.9 + x * 0.1) * 0.11 + Math.sin((x - z + s) * 0.18 + t * 0.6) * 0.1;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    },
  };
}

/* ───────────────────────────── the seaside town ───────────────────────────── */

export function town(): Biome {
  const g = new THREE.Group();
  const quayMat = toy('#8d8a8f', { rough: 0.8, clear: 0 });
  const quay = rbox(260, 3.4, 6.2, quayMat, 0.3);
  quay.position.set(0, QUAY_TOP - 1.7, QUAY_Z);
  quay.receiveShadow = true;
  quay.castShadow = false;
  g.add(quay);
  const behind = new THREE.Mesh(new THREE.PlaneGeometry(260, 44), toy('#6f6c74', { rough: 0.9, clear: 0 }));
  behind.rotation.x = -Math.PI / 2;
  behind.position.set(0, QUAY_TOP - 0.02, QUAY_Z - 25);
  behind.receiveShadow = true;
  g.add(behind);
  const kerb = rbox(260, 0.35, 0.5, toy('#4a4f5e'), 0.08);
  kerb.position.set(0, QUAY_TOP + 0.05, QUAY_Z + 2.75);
  g.add(kerb);
  const rand = rng(404);
  const PAL = ['#8590a6', '#6c7790', '#a8a09a', '#76857f', '#b5aa9c', '#5b6479', '#988d8a', '#7a849c'];
  const list: Slider[] = [];
  const P = 96;
  const rows: Array<{ n: number; z: number; hMin: number; hMax: number; wMin: number; wMax: number }> = [
    { n: 15, z: -10.5, hMin: 4, hMax: 8.5, wMin: 3.2, wMax: 4.8 },
    { n: 12, z: -18, hMin: 8, hMax: 14, wMin: 4.4, wMax: 6.6 },
  ];
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      const w = row.wMin + rand() * (row.wMax - row.wMin);
      const h = row.hMin + rand() * (row.hMax - row.hMin);
      const b = building(w, h, 4.6, PAL[(i * 3 + ri * 2) % PAL.length]);
      b.position.set(0, QUAY_TOP + h / 2 - 0.02, row.z);
      g.add(b);
      // a little roof cap
      const cap = rbox(w + 0.4, 0.4, 5, toy('#3a4152'), 0.08);
      cap.position.y = h / 2 + 0.2;
      b.add(cap);
      list.push({ obj: b, x0: (i / row.n) * P + rand() * 1.2, z: row.z, period: P });
    }
  });
  // pastel hills far away
  const hillCols = ['#6a7ba6', '#7d73a8', '#5f7399', '#76709f'];
  for (let i = 0; i < 7; i++) {
    const h = 9 + rand() * 7;
    const hill = cone(h * 0.85, h, toy(hillCols[i % hillCols.length], { rough: 0.9, clear: 0 }), 5);
    hill.position.set(0, QUAY_TOP + h / 2 - 0.5, -52);
    g.add(hill);
    list.push({ obj: hill, x0: (i / 7) * 200, z: -52, period: 200 });
  }
  // street furniture on the quay
  const lamps: THREE.Sprite[] = [];
  for (let i = 0; i < 6; i++) {
    const lamp = new THREE.Group();
    const pole = cyl(0.08, 0.12, 3.6, toy('#2d3345'), 12);
    pole.position.y = 1.8;
    lamp.add(pole, at(rbox(0.7, 0.14, 0.3, toy('#2d3345'), 0.06), 0.3, 3.65, 0));
    lamp.add(at(ball(0.2, lit('#ffe7a8'), [1, 0.7, 1], 14), 0.55, 3.5, 0));
    const gl = glow('#ffd98a', 2.4, 0.55);
    gl.position.set(0.55, 3.5, 0);
    lamp.add(gl);
    lamps.push(gl);
    lamp.position.y = QUAY_TOP;
    g.add(lamp);
    list.push({ obj: lamp, x0: i * 16 + 3, z: QUAY_Z + 2.2, period: 96 });
  }
  for (let i = 0; i < 32; i++) {
    const post = new THREE.Group();
    post.add(at(cyl(0.16, 0.2, 0.55, toy('#3b4152'), 14), 0, 0.3, 0), at(ball(0.18, toy('#3b4152')), 0, 0.62, 0));
    post.position.y = QUAY_TOP;
    g.add(post);
    list.push({ obj: post, x0: i * 3, z: QUAY_Z + 2.55, period: 96 });
  }
  for (let i = 0; i < 6; i++) {
    const planter = new THREE.Group();
    planter.add(at(rbox(1.5, 0.7, 1.1, toy('#4c5568'), 0.1), 0, 0.35, 0), at(tree(2.6, i % 2 ? '#3d8658' : '#52934a'), 0, 0.5, 0));
    planter.position.y = QUAY_TOP;
    g.add(planter);
    list.push({ obj: planter, x0: i * 16 + 11, z: QUAY_Z - 1.9, period: 96 });
  }
  for (let i = 0; i < 4; i++) {
    const bench = new THREE.Group();
    bench.add(at(rbox(1.9, 0.14, 0.62, toy('#7a5636'), 0.04), 0, 0.55, 0), at(rbox(1.9, 0.55, 0.1, toy('#7a5636'), 0.04), 0, 0.9, -0.3));
    for (const x of [-0.8, 0.8]) bench.add(at(rbox(0.12, 0.5, 0.5, toy('#2d3345'), 0.04), x, 0.27, 0));
    bench.position.y = QUAY_TOP;
    g.add(bench);
    list.push({ obj: bench, x0: i * 24 + 20, z: QUAY_Z - 2.2, period: 96 });
  }
  // paving lines show the speed of the walk
  const paving = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.02, 5.6), toy('#6a676f', { rough: 0.9, clear: 0 }), 48);
  paving.frustumCulled = false;
  g.add(paving);
  return {
    group: g,
    range: [18, 60],
    update(c) {
      sliders(list, c);
      lamps.forEach((l, i) => (l.material.opacity = 0.5 + Math.sin(c.t * 3 + i * 2) * 0.04));
      for (let i = 0; i < 48; i++) {
        dummy.position.set(slide(i * 2, 96, c.scroll, QUAY_Z), QUAY_TOP + 0.011, QUAY_Z);
        dummy.updateMatrix();
        paving.setMatrixAt(i, dummy.matrix);
      }
      paving.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ───────────────────────────── the sky ───────────────────────────── */

export function sky(): Biome {
  const g = new THREE.Group();
  const rand = rng(909);
  const list: Slider[] = [];
  const clouds: THREE.Group[] = [];
  for (let i = 0; i < 34; i++) {
    const y = i < 6 ? 31 + rand() * 6 : 34 + rand() * 46;
    const z = -16 + rand() * 20;
    const cl = cloud(0.9 + rand() * 1.5, i % 5 === 0 ? '#ffe3cf' : '#f4f6fb');
    cl.position.y = y;
    g.add(cl);
    clouds.push(cl);
    list.push({ obj: cl, x0: rand() * 140, z, period: 140 });
  }
  // hot-air balloon
  const stripe = canvasTex(256, 64, (c, w, h) => {
    const cols = ['#b8404f', '#c99a2f', '#2f9478', '#3a6fb0'];
    for (let i = 0; i < 8; i++) {
      c.fillStyle = cols[i % cols.length];
      c.fillRect((i / 8) * w, 0, w / 8 + 1, h);
    }
  });
  const balloon = new THREE.Group();
  const envMat = toy('#ffffff', { rough: 0.35 });
  envMat.map = stripe;
  balloon.add(at(ball(1.9, envMat, [1, 1.15, 1], 40), 0, 2.9, 0));
  balloon.add(at(cone(0.7, 1.0, toy('#b8404f'), 24), 0, 0.85, 0, Math.PI));
  balloon.add(at(rbox(0.9, 0.7, 0.9, toy('#8a5f35'), 0.1), 0, -0.45, 0));
  for (const [x, z] of [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]]) balloon.add(at(cyl(0.025, 0.025, 1.4, toy('#6b4a2b'), 6), x * 0.8, 0.45, z * 0.8));
  balloon.position.y = 45.5;
  g.add(balloon);
  list.push({ obj: balloon, x0: 62, z: -6, period: 140 });
  // the sun, always off to one side of the camera
  const sun = new THREE.Group();
  sun.add(ball(2.6, lit('#fff6d0'), [1, 1, 1], 24));
  sun.add(glow('#ffe8a0', 22, 0.65));
  sun.add(glow('#fff6d8', 9, 0.9));
  g.add(sun);
  return {
    group: g,
    range: [28, 110],
    update(c) {
      sliders(list, c);
      balloon.rotation.z = Math.sin(c.t * 0.5) * 0.05;
      balloon.position.y = 45.5 + Math.sin(c.t * 0.4) * 0.5;
      sun.position.set(c.camera.position.x + 17, c.camY + 8, -75);
      const glowOpacity = 1 - smooth(70, 96, c.camY) * 0.35;
      sun.children.forEach((s, i) => i > 0 && ((s as THREE.Sprite).material.opacity = (i === 1 ? 0.65 : 0.9) * glowOpacity));
    },
  };
}

/* ───────────────────────────── space ───────────────────────────── */

export function space(): Biome {
  const g = new THREE.Group();
  const rand = rng(1234);
  const N = 900;
  const starPos = new Float32Array(N * 3);
  const starCol = new Float32Array(N * 3);
  const tint = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const u = rand() * 2 - 1, a = rand() * TAU, s = Math.sqrt(1 - u * u), R = 150;
    starPos.set([s * Math.cos(a) * R, u * R, s * Math.sin(a) * R], i * 3);
    tint.setHSL(rand() > 0.7 ? 0.1 : rand() > 0.5 ? 0.6 : 0.0, 0.5, 0.82 + rand() * 0.18);
    starCol.set([tint.r, tint.g, tint.b], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 2.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false }));
  stars.frustumCulled = false;
  g.add(stars);
  const earth = makeEarth(1, true);
  g.add(earth);
  const moon = makeMoon(1);
  g.add(moon);
  // a lunar landing site that stays put on the moon (the moon itself slowly turns)
  const site = lunarSite();
  const { lander, rover, flag } = site.userData as { lander: THREE.Object3D; rover: THREE.Object3D; flag: THREE.Object3D };
  const onMoon = (o: THREE.Object3D, theta: number, size: number, spin = 0) => {
    const n = new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0.08).normalize();
    o.position.copy(n);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    o.rotateY(spin);
    o.scale.setScalar(size);
  };
  onMoon(lander, -0.98, 1 / 11 * 0.8, 0.6);
  onMoon(rover, 0.32, 1 / 11 * 0.85, 2.2);
  onMoon(flag, 0.06, 1 / 11 * 0.9, 0.3);
  g.add(site);
  // streaks that make a climb feel fast
  const LINES = 46;
  const lines = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 1, 0.035), lit('#ffffff', 0.5, true), LINES);
  lines.frustumCulled = false;
  g.add(lines);
  const lineSeed = Array.from({ length: LINES }, () => ({ x: (rand() - 0.5) * 30, z: -6 + rand() * 12, o: rand() * 26, l: 1.6 + rand() * 3.4, v: 0.7 + rand() * 0.8 }));
  return {
    group: g,
    range: [-40, 400],
    update(c) {
      const { t, camY } = c;
      const cam = c.camera.position;
      stars.position.copy(cam);
      (stars.material as THREE.PointsMaterial).opacity = smooth(62, 92, camY);
      stars.visible = camY > 55;
      const p1 = smooth(62, 84, camY), p2 = smooth(108, 124, camY), p3 = smooth(134, 146, camY);
      // Earth: huge below, then a small blue marble far away
      const big = 24;
      const ex = lerp(-3, 26, p2), ey = lerp(lerp(-95, -33.5, p1), 9, p2), ez = lerp(-10, -72, p2);
      const es = lerp(big, 5.5, p2) * (1 - p3);
      earth.visible = p1 > 0.01 && es > 0.05;
      earth.position.set(cam.x + ex, camY + ey, ez);
      earth.scale.setScalar(Math.max(0.001, es));
      earth.rotation.x = -1.05;
      earth.children[0].rotation.y = t * 0.05;
      moon.visible = p2 > 0.01 && p3 < 0.99;
      moon.position.set(cam.x - 7, camY + lerp(-40, -12.5, p2), -5);
      moon.scale.setScalar(Math.max(0.001, 11 * (1 - p3)));
      moon.rotation.y = t * 0.02;
      site.visible = moon.visible;
      site.position.copy(moon.position);
      site.scale.copy(moon.scale);
      const rocketW = c.a > 6.2 && c.a < 7.8 ? 0.55 : 0;
      const wk = clamp(Math.max(rocketW, clamp(Math.abs(c.climb) / 0.45) * 0.85));
      lines.visible = wk > 0.04;
      (lines.material as THREE.MeshBasicMaterial).opacity = wk * 0.55;
      if (lines.visible) {
        const speed = 10 + wk * 24;
        for (let i = 0; i < LINES; i++) {
          const s = lineSeed[i];
          const y = 13 - ((s.o + t * speed * s.v) % 26);
          dummy.position.set(cam.x + s.x, camY + y, s.z);
          dummy.scale.set(1, s.l * (0.6 + wk), 1);
          dummy.updateMatrix();
          lines.setMatrixAt(i, dummy.matrix);
        }
        lines.instanceMatrix.needsUpdate = true;
      }
    },
  };
}


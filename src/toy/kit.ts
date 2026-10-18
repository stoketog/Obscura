import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * A tiny toolkit for the "glossy toy" look: chunky rounded shapes, saturated
 * candy colours and a clear-coat on everything, lit by an environment map so
 * every surface picks up soft highlights.
 */
export { THREE };
export type Col = THREE.ColorRepresentation;
export type Vec = [number, number, number];

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = THREE.MathUtils.lerp;
export const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
export const wrap = (x: number, period: number) => ((x % period) + period) % period;
export const TAU = Math.PI * 2;

export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────────────────────── materials ───────────────────────────── */

export interface MatOpts {
  rough?: number;
  clear?: number;
  coatRough?: number;
  metal?: number;
  glow?: number;
  emissive?: Col;
  opacity?: number;
  env?: number;
  side?: THREE.Side;
  depthWrite?: boolean;
}

/** Glossy plastic. */
export function toy(color: Col, o: MatOpts = {}): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color,
    roughness: o.rough ?? 0.32,
    metalness: o.metal ?? 0,
    clearcoat: o.clear ?? 1,
    clearcoatRoughness: o.coatRough ?? 0.08,
    envMapIntensity: o.env ?? 1,
  });
  if (o.glow) {
    m.emissive = new THREE.Color(o.emissive ?? color);
    m.emissiveIntensity = o.glow;
  }
  if (o.opacity !== undefined && o.opacity < 1) {
    m.transparent = true;
    m.opacity = o.opacity;
    if (o.depthWrite !== undefined) m.depthWrite = o.depthWrite;
  }
  if (o.side !== undefined) m.side = o.side;
  return m;
}

/** Self-lit flat colour (lamps, flames, stars). Ignores lighting and tone mapping. */
export function lit(color: Col, opacity = 1, additive = false): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1 || additive, opacity, toneMapped: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !additive && opacity >= 1, fog: false });
}

/* ───────────────────────────── shapes ───────────────────────────── */

function shaped<T extends THREE.BufferGeometry>(g: T, m: THREE.Material, shadow = true): THREE.Mesh {
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = shadow;
  return mesh;
}
export const ball = (r: number, m: THREE.Material, s: Vec = [1, 1, 1], seg = 32): THREE.Mesh => {
  const x = shaped(new THREE.SphereGeometry(r, seg, Math.max(12, seg * 0.6 | 0)), m);
  x.scale.set(...s);
  return x;
};
export const capsule = (r: number, len: number, m: THREE.Material): THREE.Mesh => shaped(new THREE.CapsuleGeometry(r, len, 8, 20), m);
export const rbox = (w: number, h: number, d: number, m: THREE.Material, rad = Math.min(w, h, d) * 0.28): THREE.Mesh => shaped(new RoundedBoxGeometry(w, h, d, 4, rad), m);
export const cyl = (rt: number, rb: number, h: number, m: THREE.Material, seg = 28): THREE.Mesh => shaped(new THREE.CylinderGeometry(rt, rb, h, seg), m);
export const cone = (r: number, h: number, m: THREE.Material, seg = 28): THREE.Mesh => shaped(new THREE.ConeGeometry(r, h, seg), m);
export const torus = (R: number, r: number, m: THREE.Material, seg = 40): THREE.Mesh => shaped(new THREE.TorusGeometry(R, r, 14, seg), m);
export const dome = (r: number, m: THREE.Material, seg = 32): THREE.Mesh => shaped(new THREE.SphereGeometry(r, seg, 16, 0, TAU, 0, Math.PI / 2), m);

export function grp(...kids: THREE.Object3D[]): THREE.Group {
  const g = new THREE.Group();
  for (const k of kids) g.add(k);
  return g;
}
/** Position (and optionally rotation) an object, returning it for chaining. */
export function at<T extends THREE.Object3D>(o: T, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0): T {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
}
export function scaled<T extends THREE.Object3D>(o: T, x: number, y = x, z = x): T {
  o.scale.set(x, y, z);
  return o;
}

/** A pair of big, shiny cartoon eyes looking along +x. */
export function eyes(size: number, gap: number, x = 0, y = 0): THREE.Group {
  const sclera = toy('#ffffff', { rough: 0.15 });
  const pupil = toy('#0d1224', { rough: 0.1 });
  const glint = lit('#ffffff');
  const one = (z: number) => {
    const e = grp(ball(size, sclera));
    e.add(at(ball(size * 0.58, pupil), size * 0.5, 0, 0));
    e.add(at(ball(size * 0.2, glint, [1, 1, 1], 12), size * 0.86, size * 0.3, size * 0.12));
    e.position.set(x, y, z);
    return e;
  };
  return grp(one(gap), one(-gap));
}

/* ───────────────────────────── textures ───────────────────────────── */

export function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

let glowTexture: THREE.CanvasTexture | null = null;
export function glowTex(): THREE.CanvasTexture {
  glowTexture ??= canvasTex(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  return glowTexture;
}
export function glow(color: Col, size: number, opacity = 1): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
  s.scale.set(size, size, 1);
  return s;
}

/** Window pattern for buildings: `map` for the wall, `emissiveMap` for the lit windows. */
let winTex: { map: THREE.CanvasTexture; emit: THREE.CanvasTexture } | null = null;
export function windowTextures() {
  if (winTex) return winTex;
  const rand = rng(5);
  const cells = 2;
  const grid: boolean[] = Array.from({ length: cells * cells * 4 }, () => rand() > 0.5);
  const draw = (emit: boolean) => (c: CanvasRenderingContext2D, w: number, h: number) => {
    c.fillStyle = emit ? '#000' : '#fff';
    c.fillRect(0, 0, w, h);
    const cw = w / cells, ch = h / cells;
    for (let i = 0; i < cells; i++)
      for (let j = 0; j < cells; j++) {
        const x = i * cw + cw * 0.2, y = j * ch + ch * 0.18, ww = cw * 0.6, hh = ch * 0.5;
        const on = grid[(i + j * cells) % grid.length];
        c.fillStyle = emit ? (on ? '#ffd58a' : '#000') : on ? '#fff3d6' : '#38406e';
        c.beginPath();
        c.roundRect(x, y, ww, hh, ww * 0.18);
        c.fill();
      }
  };
  const map = canvasTex(128, 128, draw(false));
  const emit = canvasTex(128, 128, draw(true));
  for (const t of [map, emit]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
  }
  winTex = { map, emit };
  return winTex;
}

/** A chunky toy building with lit windows. */
export function building(w: number, h: number, d: number, color: Col): THREE.Mesh {
  const { map, emit } = windowTextures();
  const g = new RoundedBoxGeometry(w, h, d, 3, 0.35);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const su = (w + d) / 2 / 3.2, sv = h / 3.2;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  const m = new THREE.MeshPhysicalMaterial({ color, map, emissive: new THREE.Color('#ffffff'), emissiveMap: emit, emissiveIntensity: 0.9, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* ───────────────────────────── set dressing ───────────────────────────── */

export function cloud(size = 1, tint: Col = '#ffffff'): THREE.Group {
  const m = toy(tint, { rough: 0.55, clear: 0.15, glow: 0.35, emissive: '#ffffff' });
  const g = new THREE.Group();
  const puffs: Array<[number, number, number, number]> = [[0, 0, 0, 1], [1.05, -0.12, 0.1, 0.78], [-1.05, -0.15, -0.1, 0.8], [0.45, 0.45, 0, 0.7], [-0.4, 0.4, 0.1, 0.65], [1.8, -0.3, 0, 0.5], [-1.8, -0.32, 0, 0.5]];
  for (const [x, y, z, r] of puffs) {
    const b = ball(r, m, [1, 0.9, 1], 20);
    b.position.set(x * size, y * size, z * size);
    b.scale.multiplyScalar(size);
    b.castShadow = false;
    g.add(b);
  }
  return g;
}

export function tree(h = 2, leaf: Col = '#4cd37b'): THREE.Group {
  const t = grp(at(cyl(0.12 * h * 0.5, 0.17 * h * 0.5, h * 0.55, toy('#a0653a')), 0, h * 0.27, 0));
  t.add(at(ball(h * 0.42, toy(leaf)), 0, h * 0.78, 0));
  t.add(at(ball(h * 0.3, toy(leaf)), h * 0.18, h * 0.55, 0.12));
  return t;
}

/** Rounded rock. */
export function rock(r: number, color: Col, squash = 0.7): THREE.Mesh {
  const g = new THREE.IcosahedronGeometry(r, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = 1 + 0.16 * Math.sin(v.x * 3.1 + v.y * 2.3) * Math.cos(v.z * 2.7 + v.x);
    p.setXYZ(i, v.x * n, v.y * n * squash, v.z * n);
  }
  g.computeVertexNormals();
  const m = shaped(g, toy(color, { rough: 0.5, clear: 0.5 }));
  m.receiveShadow = true;
  return m;
}

/** Free everything hanging off an object. */
export function disposeTree(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    m.geometry?.dispose?.();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      for (const k of ['map', 'emissiveMap', 'alphaMap', 'normalMap', 'bumpMap'] as const) {
        const tex = (mat as unknown as Record<string, THREE.Texture | null | undefined>)[k];
        if (tex && tex !== glowTexture && tex !== winTex?.map && tex !== winTex?.emit) tex.dispose();
      }
      mat.dispose();
    }
  });
}

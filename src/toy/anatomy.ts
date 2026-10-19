import { THREE } from './kit';

/**
 * Shape helpers for the more lifelike heroes (human, gull, fish, bacterium).
 * Everything is still faceted and flat-shaded, but built from tapered limbs,
 * lathed bodies and extruded fins instead of stacked spheres.
 */

const mesh = (g: THREE.BufferGeometry, m: THREE.Material, cast = true) => {
  const x = new THREE.Mesh(g, m);
  x.castShadow = cast;
  return x;
};

/** A body of revolution about the Y axis. `profile` is [radius, y] from bottom to top. */
export function lathe(profile: Array<[number, number]>, m: THREE.Material, seg = 10, cast = true): THREE.Mesh {
  return mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), m, cast);
}

/**
 * A limb segment hanging down from its joint (origin at the top, y = 0), tapering
 * from `r0` to `r1` with rounded ends.
 */
export function tube(len: number, r0: number, r1: number, m: THREE.Material, seg = 8): THREE.Mesh {
  const p: Array<[number, number]> = [
    [0, -len - r1 * 0.62],
    [r1 * 0.8, -len - r1 * 0.3],
    [r1, -len],
    [(r0 + r1) * 0.5 * 1.04, -len * 0.5],
    [r0, 0],
    [r0 * 0.8, r0 * 0.3],
    [0, r0 * 0.62],
  ];
  return lathe(p, m, seg);
}

/** A flat polygon extruded to `depth`, lying in the XY plane and centred on z = 0 (fins, tails). */
export function flat(points: Array<[number, number]>, depth: number, m: THREE.Material, cast = false): THREE.Mesh {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return mesh(g, m, cast);
}

/** Like `flat`, but laid in the XZ plane (wings, a bird's tail): shape y becomes world z. */
export function flatXZ(points: Array<[number, number]>, depth: number, m: THREE.Material, cast = false): THREE.Mesh {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  g.rotateX(Math.PI / 2);
  return mesh(g, m, cast);
}

/** Smooth-ish interpolation through [position, value] control points (for body profiles). */
export function curve(pts: Array<[number, number]>, x: number): number {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const u = (x - x0) / (x1 - x0);
      const s = u * u * (3 - 2 * u);
      return y0 + (y1 - y0) * s;
    }
  }
  return pts[pts.length - 1][1];
}

import { THREE, at, ball, capsule, cone, cyl, dome, eyes, glow, grp, lerp, lit, rbox, toy } from './kit';
import type { Hero } from './heroes-sea';

/* ─────────────────────────────── 5 · human ─────────────────────────────── */

export function human(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.z = -3; // walks along the quay
  root.add(inner);
  const jacket = toy('#2a8fa8');
  const pants = toy('#3d4a94');
  const skin = toy('#e0b08a', { rough: 0.5 });
  const hairM = toy('#5a3826');
  const white = toy('#ffffff');
  const orange = toy('#ff7a3d');

  const torso = capsule(0.4, 0.45, jacket);
  torso.position.y = 0.45;
  torso.rotation.z = -0.06;
  inner.add(torso);
  inner.add(at(ball(0.37, skin, [1, 1.04, 1], 18), 0.04, 1.3, 0));
  const hair = dome(0.405, hairM);
  hair.position.set(-0.02, 1.33, 0);
  hair.rotation.z = 0.2;
  inner.add(hair);
  inner.add(at(ball(0.25, hairM, [1, 1, 1.2]), -0.23, 1.25, 0));
  inner.add(eyes(0.07, 0.17, 0.36, 1.33));
  inner.add(at(ball(0.05, toy('#c98f74'), [1, 1, 1], 8), 0.39, 1.25, 0));
  const pack = rbox(0.42, 0.72, 0.62, orange, 0.14);
  pack.position.set(-0.5, 0.5, 0);
  inner.add(pack);
  inner.add(at(rbox(0.1, 0.5, 0.1, toy('#c9531f')), -0.1, 0.6, 0.36, 0, 0, 0));
  inner.add(at(rbox(0.1, 0.5, 0.1, toy('#c9531f')), -0.1, 0.6, -0.36, 0, 0, 0));

  const hips: THREE.Group[] = [];
  const knees: THREE.Group[] = [];
  const shoulders: THREE.Group[] = [];
  const elbows: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const hip = new THREE.Group();
    hip.position.set(0, -0.05, s * 0.2);
    hip.add(at(capsule(0.17, 0.3, pants), 0, -0.26, 0));
    const knee = new THREE.Group();
    knee.position.set(0, -0.55, 0);
    knee.add(at(capsule(0.15, 0.28, pants), 0, -0.24, 0));
    knee.add(at(ball(0.2, white, [1.7, 0.75, 1.05]), 0.12, -0.56, 0));
    knee.add(at(ball(0.2, toy('#ff4d6d'), [1.0, 0.25, 1.07]), 0.1, -0.62, 0));
    hip.add(knee);
    inner.add(hip);
    hips.push(hip);
    knees.push(knee);
    const sh = new THREE.Group();
    sh.position.set(0, 0.78, s * 0.5);
    sh.add(at(capsule(0.12, 0.28, jacket), 0, -0.22, 0));
    const el = new THREE.Group();
    el.position.set(0, -0.45, 0);
    el.add(at(capsule(0.105, 0.2, skin), 0, -0.18, 0));
    el.add(at(ball(0.13, skin), 0, -0.36, 0));
    sh.add(el);
    inner.add(sh);
    shoulders.push(sh);
    elbows.push(el);
  }
  return {
    root,
    sparkle: '#ffb347',
    yaw: -0.4,
    update(t) {
      const ph = t * 6.2;
      [1, -1].forEach((s, i) => {
        const w = Math.sin(ph + (s > 0 ? 0 : Math.PI));
        hips[i].rotation.z = w * 0.75;
        knees[i].rotation.z = -Math.max(0, -Math.cos(ph + (s > 0 ? 0 : Math.PI))) * 0.9 - 0.08;
        shoulders[i].rotation.z = -w * 0.6;
        elbows[i].rotation.z = 0.35 + Math.max(0, -w) * 0.4;
      });
      inner.position.y = Math.abs(Math.sin(ph)) * 0.08;
      inner.rotation.z = -0.04;
    },
  };
}

/* ─────────────────────────────── 6 · bird ─────────────────────────────── */

export function bird(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const blue = toy('#3b8cff');
  const white = toy('#fffaf0');
  const dark = toy('#2757c9');
  inner.add(ball(1.0, blue, [1.25, 1, 0.95], 36));
  inner.add(at(ball(0.9, white, [1.1, 0.85, 0.82], 32), 0.22, -0.3, 0));
  inner.add(at(ball(0.66, blue, [1, 1, 1], 32), 1.05, 0.42, 0));
  const beak = cone(0.2, 0.6, toy('#ffb02e'), 20);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(1.72, 0.34, 0);
  inner.add(beak);
  inner.add(eyes(0.17, 0.48, 1.38, 0.58));
  for (const [r, c] of [[0.5, '#ff5a6e'], [0.25, '#ff5a6e'], [0.1, '#ffd23a']] as const) {
    inner.add(at(cone(0.1, r, toy(c), 12), 0.9 - r * 0.2, 1.1 + r * 0.35, 0, 0, 0, -0.35));
  }
  const tail: THREE.Mesh[] = [];
  for (const [rz, c] of [[0.3, '#2757c9'], [0, '#3b8cff'], [-0.3, '#2757c9']] as const) {
    const f = cone(0.28, 1.2, toy(c), 16);
    f.scale.z = 0.4;
    f.position.set(-1.7, 0.05, 0);
    f.rotation.z = Math.PI / 2 + rz;
    inner.add(f);
    tail.push(f);
  }
  const wings = [1, -1].map((s) => {
    const pivot = new THREE.Group();
    pivot.position.set(0.05, 0.4, s * 0.7);
    const w = rbox(1.2, 0.14, 2.0, dark, 0.07);
    w.position.set(-0.1, 0, s * 1.0);
    const tip = rbox(0.8, 0.1, 1.2, toy('#5aa5ff'), 0.05);
    tip.position.set(-0.45, 0.03, s * 1.1);
    pivot.add(w, tip);
    inner.add(pivot);
    return pivot;
  });
  for (const s of [1, -1]) inner.add(at(cyl(0.05, 0.05, 0.4, toy('#ffb02e'), 8), 0.1, -1.1, s * 0.3));
  return {
    root,
    sparkle: '#5aa5ff',
    yaw: -0.5,
    update(t) {
      const flap = Math.sin(t * 8.5);
      wings.forEach((w, i) => (w.rotation.x = (i === 0 ? 1 : -1) * (flap * 0.75 + 0.15)));
      inner.position.y = Math.sin(t * 8.5 - 0.6) * 0.14 + Math.sin(t * 1.2) * 0.2;
      inner.rotation.z = Math.sin(t * 1.1) * 0.06 + 0.04;
      tail.forEach((f, i) => (f.rotation.z = Math.PI / 2 + [0.3, 0, -0.3][i] + Math.sin(t * 3 + i) * 0.06));
    },
  };
}

/* ───────────────────────────── 7 · helicopter ───────────────────────────── */

export function helicopter(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const red = toy('#c43a4a');
  const dark = toy('#272d52');
  inner.add(ball(1.2, red, [1.4, 1, 0.98], 40));
  inner.add(at(ball(0.92, toy('#8fd6ff', { opacity: 0.62, rough: 0.02, env: 2, depthWrite: false }), [1.0, 0.86, 0.9]), 0.78, 0.2, 0));
  inner.add(at(ball(0.95, toy('#ffffff'), [0.8, 0.12, 0.95]), 0.0, 0.35, 0));
  const boom = cyl(0.1, 0.4, 3.4, red, 20);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(-2.8, 0.25, 0);
  inner.add(boom);
  inner.add(at(rbox(0.9, 1.25, 0.12, red, 0.05), -4.35, 0.8, 0, 0, 0, 0.35));
  inner.add(at(rbox(0.8, 0.12, 1.3, toy('#ffffff'), 0.05), -3.8, 0.28, 0));
  const tailRotor = new THREE.Group();
  tailRotor.position.set(-4.45, 0.95, 0.2);
  for (let i = 0; i < 2; i++) tailRotor.add(at(rbox(0.12, 1.1, 0.06, dark, 0.03), 0, 0, 0, 0, 0, (i * Math.PI) / 2));
  inner.add(tailRotor);
  inner.add(at(cyl(0.14, 0.18, 0.5, dark, 14), 0, 1.3, 0));
  const rotor = new THREE.Group();
  rotor.position.y = 1.6;
  for (let i = 0; i < 2; i++) rotor.add(at(rbox(4.0, 0.06, 0.26, dark, 0.03), 0, 0, 0, 0, (i * Math.PI) / 2, 0));
  rotor.add(at(ball(0.22, toy('#ffd23a')), 0, 0.02, 0));
  inner.add(rotor);
  const blur = cyl(2.05, 2.05, 0.01, toy('#ffffff', { opacity: 0.1, clear: 0, rough: 1, depthWrite: false }), 40);
  blur.castShadow = false;
  blur.position.y = 1.6;
  inner.add(blur);
  for (const s of [1, -1]) {
    const skid = cyl(0.07, 0.07, 3.0, dark, 10);
    skid.rotation.z = Math.PI / 2;
    skid.position.set(0.1, -1.45, s * 0.85);
    inner.add(skid);
    inner.add(at(ball(0.1, dark), 1.6, -1.45, s * 0.85));
    for (const x of [0.6, -0.5]) inner.add(at(cyl(0.05, 0.05, 0.6, dark, 8), x, -1.15, s * 0.8));
  }
  inner.add(glow('#fff6c8', 1.7, 0.8));
  inner.children[inner.children.length - 1].position.set(1.9, -0.2, 0);
  const beacon = glow('#ff4040', 0.9, 0.9);
  beacon.position.set(-4.4, 1.45, 0);
  inner.add(beacon);
  inner.add(at(ball(0.07, lit('#ff4040'), [1, 1, 1], 8), -4.4, 1.45, 0));
  return {
    root,
    sparkle: '#ff4358',
    yaw: -0.5,
    update(t) {
      rotor.rotation.y = t * 38;
      tailRotor.rotation.z = t * 50;
      inner.position.y = Math.sin(t * 1.4) * 0.18;
      inner.rotation.z = Math.sin(t * 0.9) * 0.025 - 0.05;
      inner.rotation.x = Math.sin(t * 1.1) * 0.03;
      beacon.material.opacity = Math.sin(t * 6) > 0.4 ? 0.9 : 0.1;
    },
  };
}

/* ─────────────────────────────── 8 · plane ─────────────────────────────── */

export function plane(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const white = toy('#f6f9ff');
  const blue = toy('#2f6bff');
  const dark = toy('#1c2750', { rough: 0.1 });
  const fuselage = capsule(0.66, 3.9, white);
  fuselage.rotation.z = Math.PI / 2;
  inner.add(fuselage);
  const tailCone = cone(0.64, 2.0, white, 32);
  tailCone.rotation.z = Math.PI / 2;
  tailCone.position.set(-3.1, 0.14, 0);
  inner.add(tailCone);
  for (const s of [1, -1]) {
    inner.add(at(rbox(4.2, 0.13, 0.05, blue, 0.025), -0.1, -0.08, s * 0.65));
    for (let i = 0; i < 11; i++) inner.add(at(ball(0.075, dark, [1, 1.35, 0.5], 10), -1.5 + i * 0.28, 0.18, s * 0.63));
    const wing = rbox(1.25, 0.12, 2.8, toy('#e5ecfa'), 0.06);
    wing.position.set(0.25, -0.22, s * 1.7);
    wing.rotation.set(s * 0.06, -s * 0.52, 0);
    inner.add(wing);
    inner.add(at(rbox(0.4, 0.6, 0.09, blue, 0.04), -0.55, 0.05, s * 2.95, s * 0.15, 0, 0.05));
    const eng = cyl(0.3, 0.3, 1.0, toy('#c8d1e6'), 24);
    eng.rotation.z = Math.PI / 2;
    eng.position.set(0.55, -0.6, s * 1.55);
    inner.add(eng);
    inner.add(at(cyl(0.26, 0.26, 0.04, dark, 24), 1.06, -0.6, s * 1.55, 0, 0, Math.PI / 2));
    inner.add(at(rbox(0.8, 0.09, 1.5, toy('#e5ecfa'), 0.04), -3.15, 0.32, s * 0.72, 0, -s * 0.45, 0));
  }
  inner.add(at(ball(0.34, dark, [0.9, 0.5, 1.0]), 1.85, 0.28, 0));
  const fin = rbox(1.25, 1.35, 0.12, blue, 0.06);
  fin.position.set(-3.1, 1.0, 0);
  fin.rotation.z = 0.2;
  inner.add(fin);
  const trail: THREE.Mesh[] = [];
  const trailMat = toy('#ffffff', { opacity: 0.7, clear: 0, rough: 1, glow: 0.4, emissive: '#ffffff', depthWrite: false });
  for (let k = 0; k < 16; k++) {
    for (const s of [1, -1]) {
      const p = ball(1, trailMat.clone(), [1, 1, 1], 10);
      p.castShadow = false;
      p.userData = { k, s };
      inner.add(p);
      trail.push(p);
    }
  }
  return {
    root,
    sparkle: '#2f6bff',
    yaw: -0.45,
    update(t) {
      inner.position.y = Math.sin(t * 1.0) * 0.16;
      inner.rotation.z = Math.sin(t * 0.8) * 0.03 + 0.03;
      inner.rotation.x = Math.sin(t * 0.55) * 0.09;
      for (const p of trail) {
        const { k, s } = p.userData as { k: number; s: number };
        const f = k / 15;
        p.position.set(-1.1 - k * 0.8, -0.6 + Math.sin(t * 2 + k) * 0.03, s * 1.55);
        p.scale.setScalar(lerp(0.1, 0.5, f));
        (p.material as THREE.MeshPhysicalMaterial).opacity = 0.65 * (1 - f) ** 1.4;
      }
    },
  };
}

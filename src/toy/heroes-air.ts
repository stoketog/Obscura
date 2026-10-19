import { THREE, at, ball, capsule, cone, cyl, dome, glow, grp, lerp, lit, rbox, torus, toy } from './kit';
import { flatXZ, lathe, tube } from './anatomy';
import type { Hero } from './heroes-sea';

/* ─────────────────────────────── 4 · human ─────────────────────────────── */

const HIP_Y = 0.15, THIGH = 0.78, SHIN = 0.68;
/** Height of the lowest sole above the origin when standing: FEET_BELOW_ANCHOR below the anchor. */
const STAND_FOOT_Y = HIP_Y - THIGH - SHIN;

export interface HumanStyle { jacket?: string; jeans?: string; hair?: string; skin?: string; pack?: string | null; z?: number }

/** The walker. Pass a style to make a passer-by (different clothes, hair and skin, no fixed place on the quay). */
export function human(style: HumanStyle = {}): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.z = style.z ?? -3; // walks along the quay
  root.add(inner);
  const body = new THREE.Group();
  inner.add(body);

  const jacket = toy(style.jacket ?? '#2c7f93');
  const jacketDark = toy(new THREE.Color(style.jacket ?? '#2c7f93').multiplyScalar(0.7));
  const tee = toy('#eef1f4');
  const jeans = toy(style.jeans ?? '#33466e');
  const skin = toy(style.skin ?? '#d8a07a', { rough: 0.55, clear: 0 });
  const lip = toy('#b9675e', { clear: 0 });
  const hairM = toy(style.hair ?? '#4a3022', { rough: 0.6, clear: 0.2 });
  const shoe = toy('#f1f3f5');
  const sole = toy('#c3cad2');
  const hasPack = style.pack !== null;
  const pack = toy(style.pack ?? '#d9622b');
  const packDark = toy(new THREE.Color(style.pack ?? '#d9622b').multiplyScalar(0.7));

  /* torso: a lathed jacket, wider than deep, with a tee at the hem and a collar */
  const squash = (o: THREE.Object3D) => (o.scale.set(0.66, 1, 1.12), o);
  body.add(squash(lathe([[0, -0.12], [0.26, -0.1], [0.31, 0.02], [0.3, 0.16], [0, 0.16]], jeans, 10)));
  body.add(squash(lathe([[0, 0.05], [0.31, 0.07], [0.285, 0.42], [0.325, 0.78], [0.36, 1.02], [0.3, 1.13], [0.13, 1.2], [0, 1.2]], jacket, 10)));
  const hem = grp(at(torus(0.31, 0.03, tee, 14), 0, 0, 0, Math.PI / 2));
  squash(hem).position.y = 0.075;
  body.add(hem);
  body.add(at(rbox(0.02, 1.0, 0.035, jacketDark, 0.01), 0.232, 0.62, 0)); // zip
  const collar = grp(at(torus(0.14, 0.05, jacketDark, 12), 0, 0, 0, Math.PI / 2));
  collar.position.y = 1.2;
  body.add(collar);
  body.add(at(cyl(0.085, 0.1, 0.24, skin, 10), 0.01, 1.3, 0)); // neck

  /* head */
  const head = new THREE.Group();
  head.position.set(0.03, 1.55, 0);
  head.rotation.z = -0.03;
  body.add(head);
  head.add(ball(0.2, skin, [1, 1.1, 0.85], 28));
  head.add(at(ball(0.13, skin, [1, 0.85, 0.85], 18), 0.07, -0.15, 0)); // jaw and chin
  head.add(at(cone(0.042, 0.13, skin, 10), 0.215, -0.03, 0, 0, 0, -Math.PI / 2 - 0.25)); // nose
  for (const s of [1, -1]) {
    head.add(at(ball(0.048, skin, [0.55, 1, 0.55], 10), -0.01, -0.02, s * 0.172)); // ears
    head.add(at(ball(0.036, tee, [0.5, 0.8, 1], 10), 0.185, 0.04, s * 0.078)); // eye white
    head.add(at(ball(0.024, toy('#2a1c14', { rough: 0.1, smooth: true }), [0.5, 1, 1], 10), 0.196, 0.04, s * 0.078)); // iris
    head.add(at(rbox(0.05, 0.016, 0.07, hairM, 0.006), 0.19, 0.1, s * 0.08, s * 0.12, 0, 0)); // brow
  }
  head.add(at(rbox(0.012, 0.014, 0.075, lip, 0.005), 0.2, -0.105, 0));
  const hair = dome(0.235, hairM, 24);
  hair.scale.set(1.04, 1, 0.98);
  hair.position.set(-0.015, 0.02, 0);
  hair.rotation.z = 0.34;
  head.add(hair);
  head.add(at(ball(0.13, hairM, [1.25, 0.6, 1.0], 12), 0.1, 0.235, 0, 0, 0, 0.2)); // a quiff
  head.add(at(ball(0.16, hairM, [0.9, 1.0, 1.05], 12), -0.13, 0.0, 0)); // back of the head
  head.add(at(ball(0.07, hairM, [0.8, 1.1, 0.6], 8), 0.02, 0.0, 0.18)); // sideburns
  head.add(at(ball(0.07, hairM, [0.8, 1.1, 0.6], 8), 0.02, 0.0, -0.18));

  /* backpack with straps */
  if (hasPack) {
    body.add(at(rbox(0.3, 0.64, 0.46, pack, 0.12), -0.34, 0.66, 0));
    body.add(at(rbox(0.12, 0.24, 0.36, packDark, 0.05), -0.5, 0.52, 0));
  }
  for (const s of hasPack ? [1, -1] : []) {
    body.add(at(rbox(0.04, 0.62, 0.06, packDark, 0.015), 0.225, 0.76, s * 0.2, 0, 0, 0.03));
    body.add(at(rbox(0.5, 0.045, 0.06, packDark, 0.015), 0.0, 1.1, s * 0.2));
  }

  const hips: THREE.Group[] = [], knees: THREE.Group[] = [], feet: THREE.Group[] = [];
  const shoulders: THREE.Group[] = [], elbows: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const hip = new THREE.Group();
    hip.position.set(0, HIP_Y, s * 0.165);
    hip.add(tube(THIGH, 0.175, 0.118, jeans));
    const knee = new THREE.Group();
    knee.position.y = -THIGH;
    knee.add(tube(SHIN, 0.118, 0.085, jeans));
    const foot = new THREE.Group();
    foot.position.y = -SHIN;
    foot.add(at(rbox(0.2, 0.12, 0.17, shoe, 0.05), 0.09, -0.035, 0)); // upper
    foot.add(at(ball(0.1, shoe, [1.1, 0.7, 0.9], 12), 0.22, -0.065, 0)); // toe cap
    foot.add(at(rbox(0.5, 0.05, 0.2, sole, 0.02), 0.12, -0.115, 0)); // sole
    knee.add(foot);
    hip.add(knee);
    body.add(hip);
    hips.push(hip);
    knees.push(knee);
    feet.push(foot);

    const sh = new THREE.Group();
    sh.position.set(0, 1.07, s * 0.44);
    sh.rotation.x = s * 0.07;
    sh.add(tube(0.56, 0.115, 0.095, jacket));
    const el = new THREE.Group();
    el.position.y = -0.56;
    el.add(tube(0.46, 0.088, 0.062, skin));
    el.add(at(torus(0.092, 0.03, jacketDark, 10), 0, -0.02, 0, Math.PI / 2)); // cuff
    const hand = new THREE.Group();
    hand.position.y = -0.5;
    hand.add(at(ball(0.07, skin, [0.8, 1.35, 0.55], 10), 0.0, -0.06, 0));
    hand.add(at(ball(0.028, skin, [1, 1.4, 1], 8), 0.045, -0.05, 0));
    el.add(hand);
    sh.add(el);
    body.add(sh);
    shoulders.push(sh);
    elbows.push(el);
  }
  return {
    root,
    sparkle: '#ffb347',
    yaw: -0.4,
    update(t) {
      const ph = t * 5.6;
      const A = 0.46;
      const reach = (i: number) => {
        const k = Math.sin(ph + (i ? Math.PI : 0));
        const c = Math.cos(ph + (i ? Math.PI : 0));
        return { k, c };
      };
      let low = Infinity;
      for (let i = 0; i < 2; i++) {
        const { k, c } = reach(i);
        const th = A * k;
        const kn = -(0.07 + Math.max(0, c) * 0.85);
        hips[i].rotation.z = th;
        knees[i].rotation.z = kn;
        feet[i].rotation.z = -(th + kn) * 0.85 + Math.max(0, c) * 0.25;
        shoulders[i].rotation.z = -k * 0.42;
        elbows[i].rotation.z = 0.28 + Math.max(0, k) * 0.35;
        const foot = HIP_Y - THIGH * Math.cos(th) - SHIN * Math.cos(th + kn);
        low = Math.min(low, foot);
      }
      // keep the lowest sole on the ground: no floating, no sinking
      body.position.y = STAND_FOOT_Y - low;
      body.rotation.z = -0.045;
      body.rotation.x = Math.sin(ph) * 0.02;
      head.rotation.z = -0.03 + Math.sin(ph * 2) * 0.012;
    },
  };
}

/* ─────────────────────────────── 5 · bird ─────────────────────────────── */

/** A gull in flight: white body and tail, grey mantle, black wing tips, yellow bill. */
export function bird(): Hero {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);
  const white = toy('#f6f7f4', { rough: 0.5 });
  const mantle = toy('#8fa1b4', { rough: 0.55 });
  const wingTop = toy('#a3b3c4', { rough: 0.55, side: THREE.DoubleSide });
  const black = toy('#22262e', { rough: 0.6, side: THREE.DoubleSide });
  const bill = toy('#f0b522', { rough: 0.35 });
  const legs = toy('#e8a64a', { rough: 0.4 });
  const dark = toy('#111318', { rough: 0.1, smooth: true });

  /* fuselage: tapered along +x */
  const trunk = lathe([[0, -1.35], [0.05, -1.25], [0.2, -0.9], [0.38, -0.4], [0.45, 0.05], [0.42, 0.45], [0.3, 0.8], [0.17, 1.0], [0, 1.05]], white, 10);
  trunk.rotation.z = -Math.PI / 2;
  trunk.scale.set(1, 1, 0.92); // lathe axis y becomes x; keep the belly full, the sides a touch slimmer
  trunk.scale.z = 0.86;
  inner.add(trunk);
  inner.add(at(ball(0.4, mantle, [1.7, 0.32, 0.98], 18), -0.18, 0.26, 0, 0, 0, -0.04)); // grey back
  // neck, head, bill
  inner.add(at(cyl(0.15, 0.2, 0.5, white, 10), 0.98, 0.17, 0, 0, 0, -1.15));
  inner.add(at(ball(0.235, white, [1.18, 0.96, 0.88], 20), 1.28, 0.3, 0));
  const upper = cone(0.082, 0.56, bill, 10);
  upper.rotation.z = -Math.PI / 2;
  upper.scale.z = 0.8;
  upper.position.set(1.7, 0.26, 0);
  inner.add(upper);
  inner.add(at(cone(0.05, 0.15, bill, 8), 1.93, 0.22, 0, 0, 0, Math.PI)); // the hooked tip
  inner.add(at(ball(0.03, toy('#e23a2e', { glow: 0.2 }), [1, 1, 1], 8), 1.86, 0.2, 0.05));
  inner.add(at(ball(0.03, toy('#e23a2e', { glow: 0.2 }), [1, 1, 1], 8), 1.86, 0.2, -0.05));
  for (const s of [1, -1]) {
    inner.add(at(ball(0.066, bill, [0.5, 1, 1], 10), 1.4, 0.35, s * 0.18));
    inner.add(at(ball(0.044, dark, [0.5, 1, 1], 10), 1.415, 0.35, s * 0.19));
  }
  // legs trail behind, tucked
  for (const s of [1, -1]) {
    inner.add(at(cyl(0.022, 0.018, 0.62, legs, 6), -0.5, -0.32, s * 0.12, 0, 0, Math.PI / 2 - 0.22));
    inner.add(at(ball(0.07, legs, [1.6, 0.35, 1.0], 8), -0.84, -0.4, s * 0.12));
  }

  /* tail fan */
  const tail = new THREE.Group();
  tail.position.set(-1.25, 0.02, 0);
  tail.add(flatXZ([[0, 0.14], [-0.45, 0.31], [-0.78, 0.37], [-0.82, 0.14], [-0.84, -0.14], [-0.78, -0.37], [-0.45, -0.31], [0, -0.14]], 0.045, white));
  inner.add(tail);

  /* wings: arm segment + hand segment, both extruded outlines */
  const arm: Array<[number, number]> = [[0.3, 0], [0.36, 0.55], [0.27, 1.1], [-0.2, 1.15], [-0.5, 1.0], [-0.68, 0.7], [-0.72, 0.35], [-0.6, 0]];
  const hand: Array<[number, number]> = [[0.26, 0], [0.2, 0.5], [0.05, 1.0], [-0.12, 1.5], [-0.22, 1.42], [-0.28, 1.22], [-0.42, 1.2], [-0.46, 1.0], [-0.6, 0.96], [-0.62, 0.74], [-0.74, 0.7], [-0.72, 0.45], [-0.66, 0.2], [-0.6, 0]];
  const tips: Array<[number, number]> = [[0.13, 0.78], [0.05, 1.0], [-0.12, 1.5], [-0.22, 1.42], [-0.28, 1.22], [-0.42, 1.2], [-0.46, 1.0], [-0.6, 0.96], [-0.62, 0.78]];
  const wings = [1, -1].map((s) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.12, 0.3, s * 0.3);
    shoulder.add(flatXZ(arm, 0.05, wingTop));
    const wrist = new THREE.Group();
    wrist.position.set(0, 0, 1.12);
    wrist.add(flatXZ(hand, 0.045, wingTop));
    wrist.add(flatXZ(tips, 0.07, black));
    shoulder.add(wrist);
    if (s < 0) {
      shoulder.scale.z = -1;
      shoulder.position.z = -0.3;
    }
    inner.add(shoulder);
    return { shoulder, wrist };
  });
  return {
    root,
    sparkle: '#9fc2e8',
    yaw: -0.5,
    update(t) {
      const w = t * 5.2;
      const flap = Math.sin(w);
      const lag = Math.sin(w - 0.9);
      for (const { shoulder, wrist } of wings) {
        // the mirrored wing is scaled by -1 on z, so the same angle lifts both
        shoulder.rotation.x = -(flap * 0.62 + 0.12);
        wrist.rotation.x = -(lag * 0.5 - 0.05);
        wrist.rotation.y = lag * 0.06;
      }
      inner.position.y = -flap * 0.2 + Math.sin(t * 1.1) * 0.15;
      inner.rotation.z = Math.sin(t * 1.0) * 0.04 + 0.05 + flap * 0.03;
      inner.rotation.x = Math.sin(t * 0.8) * 0.03;
      tail.rotation.z = lag * 0.07;
      tail.rotation.x = Math.sin(t * 1.9) * 0.05;
    },
  };
}

/* ───────────────────────────── 6 · helicopter ───────────────────────────── */

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

/* ─────────────────────────────── 7 · plane ─────────────────────────────── */

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

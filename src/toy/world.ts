import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { THREE, clamp, lerp, lit, smooth, toy } from './kit';
import { aFor, ambienceAt, PACE, RAMP, STAGE_Y, SURFACE_Y } from './layout';
import { astronaut, rocket, satellite, solar } from './heroes-space';
import { bird, helicopter, human, plane } from './heroes-air';
import { fish, jellyfish, microbe, type Hero } from './heroes-sea';
import { seaFloor, seaLife, sky, space, town, water, type Biome, type Ctx } from './biomes';

const HEROES: Array<() => Hero> = [microbe, jellyfish, fish, human, bird, helicopter, plane, rocket, satellite, astronaut, solar];

const BIOMES: Array<{ build: () => Biome; range: [number, number] }> = [
  { build: space, range: [-60, 400] },
  { build: seaFloor, range: [-30, 15] },
  { build: seaLife, range: [-30, 30] },
  { build: water, range: [8, 62] },
  { build: town, range: [18, 60] },
  { build: sky, range: [28, 110] },
];

const LIGHT = {
  sea: { sky: new THREE.Color('#3f9fe0'), ground: new THREE.Color('#05182a'), hemi: 0.85, sun: new THREE.Color('#9fd4ff'), sunI: 1.7, env: 0.35 },
  land: { sky: new THREE.Color('#b9d2f0'), ground: new THREE.Color('#4a3d4c'), hemi: 0.8, sun: new THREE.Color('#ffd2a0'), sunI: 3.4, env: 0.3 },
  space: { sky: new THREE.Color('#33428f'), ground: new THREE.Color('#05071a'), hemi: 0.45, sun: new THREE.Color('#fff4e6'), sunI: 3.8, env: 0.25 },
};

const ramp = RAMP.map(([y, c]) => ({ y, c: new THREE.Color(c) }));
function skyAt(y: number, out: THREE.Color): THREE.Color {
  if (y <= ramp[0].y) return out.copy(ramp[0].c);
  for (let i = 1; i < ramp.length; i++) {
    if (y <= ramp[i].y) {
      const a = ramp[i - 1], b = ramp[i];
      return out.copy(a.c).lerp(b.c, (y - a.y) / (b.y - a.y));
    }
  }
  return out.copy(ramp[ramp.length - 1].c);
}

const backOut = (x: number) => 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2;

/**
 * One continuous world, from the sea floor to the solar system. The camera
 * climbs with the player's points and each form takes over as its height is
 * reached. Everything is faceted, flat-shaded low-poly.
 */
export class ToyWorld {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
  private bgScene = new THREE.Scene();
  private bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private bgTop = new THREE.Color();
  private bgBot = new THREE.Color();
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private heroRoot = new THREE.Group();
  private heroes: Array<Hero | null> = Array(HEROES.length).fill(null);
  private biomes: Array<Biome | null> = Array(BIOMES.length).fill(null);
  private burst: THREE.InstancedMesh;
  private burstDirs: THREE.Vector3[] = [];
  private burstT0 = -10;

  private a = 0;
  private aTarget = 0;
  private aPrev = 0;
  private climb = 0;
  private shown = 0;
  private swap: { from: number; to: number; t0: number } | null = null;
  private t = 0;
  private scroll = 0;
  private pace = 0;
  private focus = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  private w = 1;
  private h = 1;
  private pr = 1;
  private maxPr = 2;
  private ema = 0.016;
  private frames = 0;
  private first = true;
  private lastNow = 0;
  private fogColor = new THREE.Color();
  private tmp = new THREE.Color();
  private pending = 0;
  private soft = false;
  /** Height the camera (and so the scenery) is centred on: it only changes when a new form takes over. */
  private fy = Number.NaN;
  private burstY = 0;

  constructor(canvas: HTMLCanvasElement, opts: { full?: boolean } = {}) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer = r;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    // Software renderers (no GPU) can't afford shadows or full resolution; everything else gets the full look.
    const gl = r.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    this.soft = !opts.full && /swiftshader|llvmpipe|softpipe|software|microsoft basic/i.test(gpu);
    r.shadowMap.enabled = !this.soft;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.autoClear = false;

    const pm = new THREE.PMREMGenerator(r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();

    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: { top: { value: this.bgTop }, bot: { value: this.bgBot } },
        vertexShader: 'varying float vY; void main(){ vY = position.y * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: ['uniform vec3 top;', 'uniform vec3 bot;', 'varying float vY;', 'void main() {', '  gl_FragColor = vec4(mix(bot, top, vY), 1.0);', '  #include <colorspace_fragment>', '}'].join('\n'),
        depthTest: false,
        depthWrite: false,
      }),
    );
    quad.frustumCulled = false;
    this.bgScene.add(quad);

    this.hemi = new THREE.HemisphereLight('#ffffff', '#223344', 1);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#ffffff', 3);
    this.sun.castShadow = !this.soft;
    this.sun.shadow.mapSize.set(1024, 1024);
    const sc = this.sun.shadow.camera;
    sc.left = -15;
    sc.right = 15;
    sc.top = 12;
    sc.bottom = -12;
    sc.near = 1;
    sc.far = 70;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun, this.sun.target);

    this.scene.fog = new THREE.Fog('#000000', 5, 60);
    this.scene.add(this.heroRoot);

    const N = 34;
    this.burst = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), lit('#ffffff', 0.95, true), N);
    this.burst.frustumCulled = false;
    this.burst.visible = false;
    this.scene.add(this.burst);
    for (let i = 0; i < N; i++) this.burstDirs.push(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.35, Math.random() - 0.5).normalize().multiplyScalar(0.6 + Math.random() * 0.8));
    toy('#fff'); // warm the material program cache with the common case
  }

  /* ───────────────────────────── control ───────────────────────────── */

  /** Where the player is. `snap` jumps there instead of climbing. */
  setPoints(points: number, snap = false) {
    this.aTarget = aFor(points);
    if (snap || this.first) {
      this.first = false;
      this.a = this.aPrev = this.aTarget;
      this.swap = null;
      this.shown = Math.min(HEROES.length - 1, Math.floor(this.a + 1e-3));
      this.ensureHero(this.shown);
      this.fy = STAGE_Y[this.shown];
      this.heroes.forEach((h, i) => h && (h.root.visible = i === this.shown));
      this.scroll += 0;
    }
  }

  /** Where on screen (0–1) the player should appear. */
  setFocus(x: number, y: number, snap = false) {
    this.focus.tx = x;
    this.focus.ty = y;
    if (snap) {
      this.focus.x = x;
      this.focus.y = y;
    }
  }

  resize(w: number, h: number, dpr: number) {
    this.w = Math.max(2, w);
    this.h = Math.max(2, h);
    this.maxPr = this.soft ? 0.6 : Math.min(dpr, 2);
    this.pr = Math.min(this.pr || this.maxPr, this.maxPr);
    if (this.frames === 0) this.pr = this.maxPr;
    this.applySize();
  }

  /** True when there is no GPU behind WebGL (software rendering): the world runs in a cut-down mode. */
  get software() {
    return this.soft;
  }

  get stage() {
    return this.shown;
  }

  /** 0 (dark scenery) to 1 (bright scenery) behind the top of the screen right now. */
  get ambience() {
    return Number.isNaN(this.fy) ? 0 : ambienceAt(this.fy + 1.3);
  }

  private applySize() {
    this.renderer.setPixelRatio(this.pr);
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }

  private ensureHero(i: number) {
    if (this.heroes[i]) return this.heroes[i]!;
    const h = HEROES[i]();
    h.root.visible = false;
    this.heroRoot.add(h.root);
    this.heroes[i] = h;
    return h;
  }

  /* ───────────────────────────── frame ───────────────────────────── */

  render(now: number) {
    const dt = this.lastNow ? clamp((now - this.lastNow) / 1000, 0.001, 0.1) : 0.016;
    this.lastNow = now;
    this.frame(dt);
    this.frames++;
    this.ema = lerp(this.ema, dt, 0.05);
    if (this.frames > 90 && this.frames % 30 === 0 && this.ema > 0.04 && this.pr > 0.75) {
      this.pr = Math.max(0.75, this.pr - 0.25);
      this.applySize();
    }
  }

  /** Draws one frame at a fixed time (for stills and tests). */
  still(seconds: number) {
    this.t = seconds;
    this.frame(0.0001, true);
  }

  private frame(dt: number, freeze = false) {
    if (!freeze) this.t += dt;
    const t = this.t;

    // climb
    const diff = this.aTarget - this.a;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), Math.max(Math.abs(diff) * (1 - Math.exp(-dt * 1.5)), dt * 0.22));
    this.a += step;
    this.climb = lerp(this.climb, (this.a - this.aPrev) / Math.max(dt, 1e-3), 0.2);
    this.aPrev = this.a;
    const idx = clamp(Math.floor(this.a + 1e-3), 0, HEROES.length - 1);
    if (idx !== this.shown && !this.swap) {
      this.ensureHero(idx);
      this.swap = { from: this.shown, to: idx, t0: t };
      this.burstT0 = t + 0.2;
      this.burstY = STAGE_Y[idx];
      (this.burst.material as THREE.MeshBasicMaterial).color.set(this.heroes[idx]!.sparkle);
    }
    // Every form lives at its own fixed height. Points never lift a form: the camera only travels
    // (smoothly) to the next form's home when that form takes over.
    const homeIdx = this.swap ? this.swap.to : this.shown;
    if (Number.isNaN(this.fy)) this.fy = STAGE_Y[homeIdx];
    this.fy += (STAGE_Y[homeIdx] - this.fy) * (freeze ? 1 : 1 - Math.exp(-dt * 2.1));
    const heroY = this.fy;

    // hero swap pop
    let scaleFrom = 0, scaleTo = 1;
    if (this.swap) {
      const u = (t - this.swap.t0) / 1.0;
      scaleFrom = 1 - smooth(0, 0.28, u);
      scaleTo = u < 0.24 ? 0.001 : Math.max(0.001, backOut(clamp((u - 0.24) / 0.6)));
      if (u >= 1) {
        this.heroes[this.swap.from]!.root.visible = false;
        this.shown = this.swap.to;
        this.swap = null;
        scaleTo = 1;
      }
    }
    const active = this.swap ? [[this.swap.from, scaleFrom], [this.swap.to, scaleTo]] as const : ([[this.shown, 1]] as const);
    for (const [i, sc] of active) {
      const h = this.heroes[i]!;
      h.root.visible = true;
      h.root.position.y = STAGE_Y[i];
      h.root.scale.setScalar(sc);
      h.root.rotation.y = h.yaw ?? -0.4;
      h.update(t, dt);
    }
    // next form is built ahead of time, off the critical path
    if (!this.swap && this.pending-- <= 0) {
      this.pending = 90;
      const n = this.shown + 1;
      if (n < HEROES.length && !this.heroes[n]) this.ensureHero(n);
    }

    // sparkle burst where the form changes
    const bu = (t - this.burstT0) / 1.1;
    this.burst.visible = bu > 0 && bu < 1;
    if (this.burst.visible) {
      const d = new THREE.Object3D();
      for (let i = 0; i < this.burstDirs.length; i++) {
        const v = this.burstDirs[i];
        d.position.set(v.x * bu * 7, this.burstY + v.y * bu * 6, v.z * bu * 5);
        d.scale.setScalar(0.22 * (1 - bu) * (0.6 + (i % 3) * 0.3));
        d.updateMatrix();
        this.burst.setMatrixAt(i, d.matrix);
      }
      this.burst.instanceMatrix.needsUpdate = true;
    }

    // pace and scroll
    this.pace = lerp(this.pace, PACE[this.shown], Math.min(1, dt * 2));
    this.scroll += this.pace * dt;

    // camera
    this.focus.x = lerp(this.focus.x, this.focus.tx, Math.min(1, dt * 4));
    this.focus.y = lerp(this.focus.y, this.focus.ty, Math.min(1, dt * 4));
    const aspect = this.w / this.h;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const D = clamp(Math.max(5.4 / (tanHalf * aspect), 11 / (tanHalf * Math.max(aspect, 1))), 13, 30);
    const sway = Math.sin(t * 0.22) * 0.2;
    const camY = heroY + 1.3;
    this.camera.position.set(Math.sin(sway) * D, camY, Math.cos(sway) * D);
    this.camera.lookAt(0, heroY, 0);
    this.camera.setViewOffset(this.w, this.h, this.w * (0.5 - this.focus.x), this.h * (0.5 - this.focus.y), this.w, this.h);

    // light, fog and sky depend on height
    const landW = smooth(24.5, 27.5, camY);
    const spaceW = smooth(62, 96, camY);
    const deep = smooth(-4, 20, camY);
    const mixL = (k: 'sky' | 'ground' | 'sun', out: THREE.Color) => out.copy(LIGHT.sea[k]).lerp(LIGHT.land[k], landW).lerp(LIGHT.space[k], spaceW);
    const mixN = (k: 'hemi' | 'sunI' | 'env') => lerp(lerp(LIGHT.sea[k], LIGHT.land[k], landW), LIGHT.space[k], spaceW);
    mixL('sky', this.hemi.color);
    mixL('ground', this.hemi.groundColor);
    const seaDim = lerp(0.35, 1, deep);
    const seaK = (1 - landW) * (1 - spaceW);
    const dim = 1 - seaK * (1 - seaDim);
    this.hemi.intensity = mixN('hemi') * dim;
    mixL('sun', this.sun.color);
    this.sun.intensity = mixN('sunI') * dim;
    this.scene.environmentIntensity = mixN('env') * lerp(0.6, 1, dim);
    this.sun.position.set(8, heroY + 14, 11);
    this.sun.target.position.set(0, heroY, 0);

    // underwater, the sky is never visible: the backdrop stays sea-coloured up to the surface
    const cap = (y: number) => (camY < SURFACE_Y - 0.5 ? Math.min(y, SURFACE_Y - 0.15) : y);
    skyAt(cap(camY + 7), this.bgTop);
    skyAt(cap(camY - 7), this.bgBot);
    const fog = this.scene.fog as THREE.Fog;
    fog.color.copy(skyAt(cap(camY + 3.5), this.fogColor));
    fog.near = lerp(4, 55, landW);
    fog.far = lerp(lerp(26 + 36 * deep, 300, landW), 8000, spaceW);

    // scenery
    const ctx: Ctx = { t, dt, camY, a: this.a, scroll: this.scroll, climb: this.climb, camera: this.camera };
    BIOMES.forEach((def, i) => {
      const [lo, hi] = def.range;
      const near = camY > lo - 14 && camY < hi + 14;
      let b = this.biomes[i];
      if (!b && near) {
        b = def.build();
        this.biomes[i] = b;
        this.scene.add(b.group);
      }
      if (!b) return;
      const vis = camY > lo - 3 && camY < hi + 3;
      b.group.visible = vis;
      if (vis) b.update(ctx);
    });

    this.renderer.clear();
    this.renderer.render(this.bgScene, this.bgCam);
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        for (const v of Object.values(mat as unknown as Record<string, unknown>)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

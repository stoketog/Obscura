import { THREE, ball, globe, canvasTex, glow, rng, toy, TAU } from './kit';

/** Soft blobby continents on an ocean, painted onto an equirectangular canvas. */
export function earthTexture(): THREE.CanvasTexture {
  return canvasTex(512, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2b6bd6');
    g.addColorStop(0.5, '#2f86e8');
    g.addColorStop(1, '#2b6bd6');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const rand = rng(21);
    const land = ['#58c36a', '#7bd36a', '#46b058', '#a9d96a'];
    for (let i = 0; i < 26; i++) {
      const cx = rand() * w, cy = h * (0.2 + rand() * 0.6), r = 14 + rand() * 38;
      c.fillStyle = land[i % land.length];
      for (let k = 0; k < 7; k++) {
        c.beginPath();
        c.arc(cx + (rand() - 0.5) * r * 1.6, cy + (rand() - 0.5) * r * 0.9, r * (0.35 + rand() * 0.5), 0, TAU);
        c.fill();
      }
    }
    c.fillStyle = 'rgba(255,255,255,0.95)';
    c.fillRect(0, 0, w, h * 0.07);
    c.fillRect(0, h * 0.93, w, h * 0.07);
    c.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 24; i++) {
      c.beginPath();
      c.ellipse(rand() * w, rand() * h, 16 + rand() * 40, 5 + rand() * 9, 0, 0, TAU);
      c.fill();
    }
  });
}

export function moonTexture(): THREE.CanvasTexture {
  return canvasTex(256, 128, (c, w, h) => {
    c.fillStyle = '#d4d0cc';
    c.fillRect(0, 0, w, h);
    const rand = rng(8);
    for (let i = 0; i < 46; i++) {
      const x = rand() * w, y = rand() * h, r = 3 + rand() * 12;
      c.fillStyle = 'rgba(120,116,124,0.55)';
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(245,242,238,0.75)';
      c.beginPath();
      c.arc(x - r * 0.18, y - r * 0.18, r * 0.78, 0, TAU);
      c.fill();
    }
  });
}

export function bandTexture(colors: string[], seed = 3): THREE.CanvasTexture {
  return canvasTex(64, 128, (c, w, h) => {
    const rand = rng(seed);
    const bands = 14;
    for (let i = 0; i < bands; i++) {
      c.fillStyle = colors[Math.floor(rand() * colors.length)];
      c.fillRect(0, (i / bands) * h, w, h / bands + 1);
    }
    c.globalAlpha = 0.25;
    for (let i = 0; i < 30; i++) {
      c.fillStyle = colors[Math.floor(rand() * colors.length)];
      c.beginPath();
      c.ellipse(rand() * w, rand() * h, 10 + rand() * 20, 2 + rand() * 4, 0, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
  });
}

export function makeEarth(r: number, withAtmosphere = true): THREE.Group {
  const g = new THREE.Group();
  const m = toy('#ffffff', { rough: 0.55, clear: 0, smooth: true });
  m.map = earthTexture();
  g.add(globe(r, m, 48));
  if (withAtmosphere) {
    g.add(glow('#7cc4ff', r * 3.1, 0.55));
    const atm = ball(r * 1.04, new THREE.MeshBasicMaterial({ color: '#8fd0ff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide, fog: false }), [1, 1, 1], 32);
    atm.castShadow = false;
    g.add(atm);
  }
  return g;
}

export function makeMoon(r: number): THREE.Mesh {
  const m = toy('#9d9893', { rough: 0.9, clear: 0, env: 0.4, smooth: true });
  m.map = moonTexture();
  return globe(r, m, 40);
}

export function makePlanet(r: number, colors: string[], seed: number): THREE.Mesh {
  const m = toy('#ffffff', { rough: 0.5, clear: 0, smooth: true });
  m.map = bandTexture(colors, seed);
  return globe(r, m, 28);
}

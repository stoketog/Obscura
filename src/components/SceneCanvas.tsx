import { useEffect, useRef } from 'react';
import type { SceneId } from '@/data/stages';
import { Renderer } from '@/scene/engine';
import { renderScene } from '@/scene/scenes';

interface Props {
  scene: SceneId;
  /** Cross-fade duration when `scene` changes. */
  fadeMs?: number;
  className?: string;
  /** Render a single frame instead of animating. */
  still?: boolean;
  /** Seconds into the scene for a still frame. */
  at?: number;
  label?: string;
}

const MAX_DPR = 1.5;
const FRAME_MS = 1000 / 30;

/**
 * Draws a scene into a canvas with the in-house renderer, cross-fading when the
 * scene id changes. Pauses while hidden or off-screen and respects
 * prefers-reduced-motion by drawing one still frame.
 */
export function SceneCanvas({ scene, fadeMs = 1400, className = '', still = false, at = 3.3, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const want = useRef<SceneId>(scene);
  const state = useRef({ cur: scene, prev: null as SceneId | null, fadeStart: 0, fadeMs, dirty: true });

  useEffect(() => {
    want.current = scene;
    const s = state.current;
    s.fadeMs = fadeMs;
    if (scene !== s.cur) {
      s.prev = s.cur;
      s.cur = scene;
      s.fadeStart = performance.now();
    }
    s.dirty = true;
  }, [scene, fadeMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const r = new Renderer(ctx);
    const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animate = !still && !reduce;
    let raf = 0;
    let last = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    const t0 = performance.now();

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      const w = Math.max(2, Math.round(rect.width * dpr));
      const h = Math.max(2, Math.round(rect.height * dpr));
      if (w !== width || h !== height) {
        width = w;
        height = h;
        canvas.width = w;
        canvas.height = h;
        r.resize(w, h);
        state.current.dirty = true;
      }
    };

    const draw = (now: number) => {
      const s = state.current;
      const t = animate ? (now - t0) / 1000 + 1.1 : at;
      const f = s.prev ? Math.min(1, (now - s.fadeStart) / Math.max(1, s.fadeMs)) : 1;
      if (s.prev && f < 1) {
        renderScene(r, s.prev, t, 1);
        renderScene(r, s.cur, t, f * f * (3 - 2 * f));
      } else {
        s.prev = null;
        renderScene(r, s.cur, t, 1);
      }
      s.dirty = false;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (now - last < FRAME_MS) return;
      last = now;
      size();
      draw(now);
    };

    size();
    draw(performance.now());
    if (animate) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => {
      size();
      if (!animate) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver((e) => {
      visible = e[0]?.isIntersecting ?? true;
    });
    io.observe(canvas);
    // In still mode a scene change must repaint; poll the dirty flag cheaply.
    const poll = !animate ? window.setInterval(() => state.current.dirty && (size(), draw(performance.now())), 120) : 0;
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (poll) clearInterval(poll);
    };
  }, [still, at]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} role="img" aria-label={label ?? `Animated scene: ${scene}`} data-scene={scene} data-testid="scene-canvas" />;
}

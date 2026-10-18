'use client';

import { useEffect, useRef } from 'react';
import { ToyWorld } from '@/toy/world';

export interface Focus {
  /** Where the hero sits on screen, as a fraction of the width / height (from the top-left). */
  x: number;
  y: number;
}

interface Props {
  points: number;
  focus: Focus;
  /** Called if WebGL isn't available (or the context is lost) so the app can show a plain backdrop instead. */
  onFail: () => void;
}

const FRAME_MS = 1000 / 42;
/** Software rendering is slow, so it is drawn far less often to keep the page responsive. */
const SOFT_FRAME_MS = 1000 / 8;

/** The full-screen 3D world: a single canvas behind the whole game. */
export default function WorldCanvas({ points, focus, onFail }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<ToyWorld | null>(null);
  const latest = useRef({ points, focus });
  latest.current = { points, focus };
  const redraw = useRef<() => void>(() => {});
  const reduce = useRef(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    reduce.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let w: ToyWorld;
    try {
      w = new ToyWorld(el);
    } catch {
      onFail();
      return;
    }
    world.current = w;
    const { points: p0, focus: f0 } = latest.current;
    w.setPoints(p0, true);
    w.setFocus(f0.x, f0.y, true);

    const size = () => {
      const r = el.getBoundingClientRect();
      w.resize(r.width, r.height, window.devicePixelRatio || 1);
    };
    size();

    let raf = 0;
    let last = 0;
    let stage = -1;
    const frameMs = w.software ? SOFT_FRAME_MS : FRAME_MS;
    const still = () => {
      w.setPoints(latest.current.points, true);
      w.setFocus(latest.current.focus.x, latest.current.focus.y, true);
      w.still(3.3);
      el.dataset.stage = String(w.stage);
    };
    redraw.current = () => {
      if (reduce.current) still();
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - last < frameMs) return;
      last = now;
      w.render(now);
      if (w.stage !== stage) {
        stage = w.stage;
        el.dataset.stage = String(stage);
      }
    };
    if (reduce.current) still();
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      size();
      if (reduce.current) still();
    });
    ro.observe(el);
    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      onFail();
    };
    el.addEventListener('webglcontextlost', lost);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('webglcontextlost', lost);
      world.current = null;
      redraw.current = () => {};
      w.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    world.current?.setPoints(points, reduce.current);
    redraw.current();
  }, [points]);

  useEffect(() => {
    world.current?.setFocus(focus.x, focus.y, reduce.current);
    redraw.current();
  }, [focus.x, focus.y]);

  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" data-testid="world-canvas" data-points={Math.round(points)} aria-hidden />;
}

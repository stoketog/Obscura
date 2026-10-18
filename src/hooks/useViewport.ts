import { useEffect, useState } from 'react';

/** Tracks a CSS media query (false on the server and until mounted). */
export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export interface VisualViewport {
  top: number;
  height: number;
  /** True when something (the on-screen keyboard) is covering a good part of the screen. */
  squeezed: boolean;
}

/**
 * The area of the page that is actually visible. On phones the on-screen keyboard shrinks the
 * visual viewport without resizing the layout one, so the app sizes itself to this instead:
 * the answer box then always stays just above the keyboard.
 */
export function useVisualViewport(): VisualViewport | null {
  const [vp, setVp] = useState<VisualViewport | null>(null);
  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const on = () => setVp({ top: v.offsetTop, height: v.height, squeezed: v.height < window.innerHeight * 0.75 });
    on();
    v.addEventListener('resize', on);
    v.addEventListener('scroll', on);
    return () => {
      v.removeEventListener('resize', on);
      v.removeEventListener('scroll', on);
    };
  }, []);
  return vp;
}

import { useEffect, useState } from 'react';

/** Animate a number from 0 to `target` (respects reduced motion). */
export function useCountUp(target: number, ms = 1100, delay = 0, decimals = 0): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || ms <= 0) {
      setV(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const t0 = window.setTimeout(() => {
      const step = (now: number) => {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / ms);
        const eased = 1 - Math.pow(1 - p, 3);
        setV(target * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(t0);
      cancelAnimationFrame(raf);
    };
  }, [target, ms, delay]);
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

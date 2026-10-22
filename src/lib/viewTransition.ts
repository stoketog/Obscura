import { flushSync } from 'react-dom';

/**
 * Run a screen change as a View Transition, so elements that share a `view-transition-name` (the photograph) glide
 * from where they were to where they end up, and everything else crossfades. Browsers without View Transitions,
 * and players who asked for reduced motion, just get the change.
 */
export function withViewTransition(update: () => void): void {
  if (typeof document === 'undefined') return update();
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduced = document.documentElement.dataset.motion === 'reduced' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduced) return update();
  try {
    doc.startViewTransition(() => flushSync(update));
  } catch {
    update();
  }
}

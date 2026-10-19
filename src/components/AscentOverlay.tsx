import { useEffect, useState } from 'react';
import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { useTween } from '@/hooks/useCountUp';
import { useSettings } from '@/hooks/useSettings';

/**
 * The card that appears once the world has finished climbing: where you are now and what you
 * became. It sits at the bottom of the screen so the world stays in view behind it.
 */
export function AscentOverlay({ from, to, onDone }: { from: number; to: number; onDone: () => void }) {
  const a = STAGES[from];
  const b = STAGES[to];
  const [target, setTarget] = useState(altitudeFor(a.threshold));
  const alt = useTween(target, 1600);
  const { play } = useSettings();
  useEffect(() => play('ascent'), [play]);

  useEffect(() => {
    const id = window.setTimeout(() => setTarget(altitudeFor(b.threshold)), 60);
    return () => window.clearTimeout(id);
  }, [b.threshold]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || e.key === 'Enter') && onDone();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-0 sm:px-4 sm:pb-6" data-testid="ascent-overlay">
      <div className="glass-dock pointer-events-auto w-full max-w-md animate-rise rounded-t-[1.75rem] px-5 safe-pb pt-5 text-center sm:rounded-3xl" role="dialog" aria-label="You have risen">
        <p className="font-display text-sm italic text-white/70">You’ve risen</p>
        <p className="mt-0.5 font-display text-4xl font-semibold tabular-nums text-white" data-testid="ascent-altitude">
          {formatAltitude(alt)}
        </p>
        <p className="mt-3 flex items-center justify-center gap-3 text-sm text-white/80">
          <span className="text-xl">{a.emoji}</span>
          <span className="text-white/60">{a.name}</span>
          <span className="text-bio-400">→</span>
          <span className="text-xl">{b.emoji}</span>
          <span className="font-semibold text-white" data-testid="ascent-name">
            {b.name}
          </span>
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-white" data-testid="ascent-place">
          {b.place}
        </h2>
        <p className="mx-auto mt-1 max-w-xs font-display text-base italic text-white/80">{b.blurb}</p>
        <button className="btn-primary mt-4 w-full" onClick={onDone} data-testid="ascent-continue" autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}

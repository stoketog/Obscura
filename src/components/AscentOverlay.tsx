import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { SceneCanvas } from './SceneCanvas';

type Phase = 'rise' | 'reveal';

const RISE_MS = 2600;

/**
 * The ascent sequence: the old scene streaks away beneath you, the altitude
 * readout spins up and the new form's scene fades in with its name.
 */
export function AscentOverlay({ from, to, onDone }: { from: number; to: number; onDone: () => void }) {
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState<Phase>(reduce ? 'reveal' : 'rise');
  const [shown, setShown] = useState<number>(reduce ? to : from);
  const [ready, setReady] = useState(reduce);
  const [alt, setAlt] = useState(STAGES[reduce ? to : from].threshold);
  const raf = useRef(0);
  const a = STAGES[from], b = STAGES[to];
  const altFrom = altitudeFor(a.threshold);
  const altTo = altitudeFor(b.threshold);

  useEffect(() => {
    if (reduce) {
      setAlt(altTo);
      return;
    }
    const start = performance.now();
    const swap = window.setTimeout(() => setShown(to), 500);
    const reveal = window.setTimeout(() => setPhase('reveal'), RISE_MS);
    const ok = window.setTimeout(() => setReady(true), RISE_MS + 700);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / RISE_MS);
      const e = p * p * (3 - 2 * p);
      setAlt(altFrom + (altTo - altFrom) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      [swap, reveal, ok].forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    };
  }, [reduce, to, altFrom, altTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || (ready && (e.key === 'Enter' || e.key === ' '))) && onDone();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ready, onDone]);

  const rising = phase === 'rise';
  return createPortal(
    <div className="fixed inset-0 z-[70] overflow-hidden bg-black" role="dialog" aria-modal="true" aria-label="You are rising" data-testid="ascent-overlay" data-phase={phase} style={{ animation: 'rise 0.5s ease both' }}>
      <div className="absolute inset-0">
        <SceneCanvas scene={STAGES[shown].id} fadeMs={1500} still={reduce} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50" />
      {rising && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="ascent-streak" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.13}s`, height: `${28 + ((i * 53) % 40)}%` }} />
          ))}
        </div>
      )}

      <button className="btn-ghost absolute right-4 top-4 !min-h-10" onClick={onDone} data-testid="ascent-skip" aria-label="Skip animation">
        {ready ? 'Continue' : 'Skip'}
      </button>

      <div className="absolute inset-x-0 top-[14%] text-center">
        <p className="font-display text-sm italic text-white/70">{rising ? 'Rising…' : 'You’ve risen'}</p>
        <p className="mt-1 font-display text-5xl font-semibold tabular-nums text-white drop-shadow-[0_2px_20px_rgb(0_0_0/0.6)] sm:text-6xl" data-testid="ascent-altitude">
          {formatAltitude(alt)}
        </p>
      </div>

      <div className={`absolute inset-x-0 bottom-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center transition-all duration-700 ${rising ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <p className="flex items-center justify-center gap-3 text-sm text-white/80">
          <span className="text-xl">{a.emoji}</span>
          <span className="text-white/60">{a.name}</span>
          <span className="text-bio-400">→</span>
          <span className="text-xl">{b.emoji}</span>
          <span className="font-semibold text-white" data-testid="ascent-name">{b.name}</span>
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl" data-testid="ascent-place">{b.place}</h2>
        <p className="mx-auto mt-2 max-w-xs font-display text-lg italic text-white/80">{b.blurb}</p>
        <button className={`btn-primary mt-6 transition-opacity duration-500 ${ready ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onDone} data-testid="ascent-continue" tabIndex={ready ? 0 : -1}>
          Continue
        </button>
      </div>
    </div>,
    document.body,
  );
}

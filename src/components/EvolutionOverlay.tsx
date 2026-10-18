import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { STAGES } from '@/data/stages';
import { Creature, stageHue } from './Creature';

type Phase = 'gather' | 'flash' | 'reveal';

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/**
 * The evolution sequence:
 *   gather  – particles stream in, the old form charges and whitens
 *   flash   – screen flash + shockwave rings, the new form materialises
 *   reveal  – "EVOLUTION!" with the new form's name
 */
export function EvolutionOverlay({ from, to, onDone }: { from: number; to: number; onDone: () => void }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState<Phase>(reduce ? 'reveal' : 'gather');
  const [ready, setReady] = useState(!!reduce);
  const hFrom = stageHue(from);
  const hTo = stageHue(to);

  useEffect(() => {
    if (reduce) return;
    const t1 = window.setTimeout(() => setPhase('flash'), 2100);
    const t2 = window.setTimeout(() => setPhase('reveal'), 2700);
    const t3 = window.setTimeout(() => setReady(true), 3500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [reduce]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || (ready && (e.key === 'Enter' || e.key === ' '))) && onDone();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ready, onDone]);

  const particles = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 56 }, (_, i) => {
      const a = r() * Math.PI * 2;
      const dist = 150 + r() * 190;
      return { i, x: Math.cos(a) * dist, y: Math.sin(a) * dist, s: 3 + r() * 5, d: 1 + r() * 0.7, delay: r() * 1.1 };
    });
  }, []);

  const after = phase !== 'gather';
  const h = after ? hTo : hFrom;

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-[#010409]/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Evolution" data-testid="evolution-overlay" data-phase={phase} style={{ animation: 'rise 0.5s ease both' }}>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000" style={{ background: `radial-gradient(60% 50% at 50% 48%, hsl(${h} 90% 45% / ${after ? 0.5 : 0.28}), transparent 70%)` }} />

      <button className="btn-ghost absolute right-4 top-4 !min-h-10" onClick={onDone} data-testid="evo-skip" aria-label="Skip animation">
        {ready ? 'Continue' : 'Skip'}
      </button>

      <div className="relative flex flex-col items-center px-6 text-center">
        <p className={`eyebrow mb-6 transition-opacity duration-500 ${phase === 'gather' ? 'opacity-100' : 'opacity-0'}`} style={{ color: `hsl(${hFrom} 90% 75%)` }}>
          Something is changing…
        </p>

        <div className="relative grid h-[min(70vw,300px)] w-[min(70vw,300px)] place-items-center">
          {phase === 'gather' && particles.map((p) => <span key={p.i} className="evo-particle" style={{ ['--x' as string]: `${p.x}px`, ['--y' as string]: `${p.y}px`, ['--s' as string]: `${p.s}px`, ['--d' as string]: `${p.d + 0.6}s`, ['--delay' as string]: `${p.delay}s`, ['--h' as string]: hFrom }} />)}
          {phase !== 'gather' && [0, 0.22, 0.44].map((d) => <span key={d} className="evo-ring" style={{ ['--h' as string]: hTo, ['--delay' as string]: `${d}s` }} />)}

          {phase === 'gather' ? (
            <div className="evo-charge h-full w-full" key="old">
              <Creature stage={from} size="100%" animate={false} />
            </div>
          ) : (
            <div className="evo-reveal h-full w-full" key="new">
              <Creature stage={to} size="100%" />
            </div>
          )}
        </div>

        <div className={`mt-8 transition-all duration-700 ${phase === 'reveal' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="shimmer-text font-display text-4xl font-semibold tracking-[0.08em] sm:text-6xl sm:tracking-[0.12em]" data-testid="evo-title">
            EVOLUTION!
          </h2>
          <p className="mt-3 flex items-center justify-center gap-3 text-sm text-mist-300">
            <span className="text-xl">{STAGES[from].emoji}</span>
            <span className="text-mist-500">{STAGES[from].name}</span>
            <span className="text-bio-400">→</span>
            <span className="text-xl">{STAGES[to].emoji}</span>
            <span className="font-semibold text-white" data-testid="evo-name">{STAGES[to].name}</span>
          </p>
          <p className="mx-auto mt-2 max-w-xs font-display text-lg italic text-mist-300">{STAGES[to].blurb}</p>
          <button className={`btn-primary mt-8 transition-opacity duration-500 ${ready ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onDone} data-testid="evo-continue" tabIndex={ready ? 0 : -1}>
            Continue
          </button>
        </div>
      </div>
      <div className={`evo-flash ${phase === 'flash' ? 'go' : ''}`} />
    </div>,
    document.body,
  );
}

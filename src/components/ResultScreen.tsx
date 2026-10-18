import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { useCountUp } from '@/hooks/useCountUp';
import { STAGES } from '@/data/stages';
import { MAX_GUESSES, stageProgress } from '@/lib/growth';
import { buildShareText, copyText } from '@/lib/share';
import { formatCountdown, msUntilNextDay, prettyDate } from '@/lib/dates';
import { obscurityLabel } from '@/lib/obscurity';
import { Creature } from './Creature';
import { EvolutionOverlay } from './EvolutionOverlay';
import { GrowthBar } from './GrowthBar';
import { IconArrow, IconCheck, IconClock, IconCopy, IconExternal, IconFlame, IconShare } from './Icons';

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function Gauge({ value, delay, animate }: { value: number; delay: number; animate: boolean }) {
  const v = useCountUp(value, animate ? 1500 : 0, delay);
  const r = 78;
  const len = Math.PI * r;
  return (
    <div className="relative mx-auto w-full max-w-[17rem]" data-testid="obscurity-gauge">
      <svg viewBox="0 0 200 112" className="w-full overflow-visible">
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0" stopColor="#22d3bd" />
            <stop offset="0.6" stopColor="#ffc15e" />
            <stop offset="1" stopColor="#ff7a8a" />
          </linearGradient>
        </defs>
        <path d={`M22 100 A${r} ${r} 0 0 1 178 100`} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="12" strokeLinecap="round" />
        <path d={`M22 100 A${r} ${r} 0 0 1 178 100`} fill="none" stroke="url(#gauge)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(v / 100) * len} ${len}`} style={{ filter: 'drop-shadow(0 0 8px rgb(255 193 94 / 0.55))' }} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-display text-5xl font-semibold leading-none text-white" data-testid="result-obscurity">
          {Math.round(v)}
          <span className="ml-1 text-xl font-normal text-mist-500">/ 100</span>
        </div>
      </div>
    </div>
  );
}

export function ResultScreen({ api, onOpenStats }: { api: ObscuraApi; onOpenStats: () => void }) {
  const { puzzle, game, streak, markCelebrated } = api;
  const fresh = useRef(!game?.celebrated).current;
  const out = game?.outcome;
  const evolved = !!out && out.stageAfter > out.stageBefore;
  const [showEvo, setShowEvo] = useState(false);
  const [copied, setCopied] = useState<null | 'ok' | 'fail'>(null);
  const now = useNow();

  useEffect(() => {
    if (!fresh) return;
    if (evolved) {
      const t = window.setTimeout(() => setShowEvo(true), 2300);
      return () => window.clearTimeout(t);
    }
    markCelebrated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparks = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ i, tx: (Math.cos(i * 2.4) * (60 + (i % 5) * 28)) | 0, ty: (Math.sin(i * 2.4) * (40 + (i % 4) * 22)) | 0, d: (i % 6) * 0.08 })),
    [],
  );

  const shareText = useMemo(() => (game && puzzle && out ? buildShareText(game, puzzle, streak) : ''), [game, puzzle, out, streak]);
  const growth = useCountUp(out?.growth ?? 0, fresh ? 1300 : 0, fresh ? 1500 : 0, 1);

  if (!puzzle || !game || !out) return null;
  const won = out.solved;
  const d = (ms: number) => (fresh ? { animationDelay: `${ms}ms` } : { animation: 'none' });
  const cls = fresh ? 'animate-rise' : '';
  const countdown = formatCountdown(msUntilNextDay(now));

  const onCopy = async () => {
    const ok = await copyText(shareText);
    setCopied(ok ? 'ok' : 'fail');
    window.setTimeout(() => setCopied(null), 2200);
  };
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-2 sm:px-5 lg:grid lg:grid-cols-2 lg:gap-8" data-testid="result">
      <section className="text-center">
        <p className="eyebrow">
          Obscura #{String(puzzle.number).padStart(3, '0')} · {prettyDate(puzzle.dateKey)}
        </p>
        <h1 className={`mt-4 font-display text-xl font-semibold uppercase tracking-[0.35em] ${won ? 'text-bio-300' : 'text-mist-300'} ${cls}`} style={d(0)} data-testid="result-headline">
          {won ? 'You found it' : 'The deep keeps its secret'}
        </h1>
        {!won && <p className="mt-2 text-sm text-mist-500">The answer was</p>}

        <div className="relative mt-4">
          {won && fresh && (
            <div className="pointer-events-none absolute left-1/2 top-1/2">
              {sparks.map((s) => (
                <span key={s.i} className="spark" style={{ ['--tx' as string]: `${s.tx}px`, ['--ty' as string]: `${s.ty}px`, animationDelay: `${400 + s.d * 1000}ms` }} />
              ))}
            </div>
          )}
          <h2 className={`shimmer-text mx-auto max-w-[22rem] break-words font-display text-[2.6rem] font-semibold leading-tight sm:text-5xl ${fresh ? 'animate-pop' : ''}`} style={{ ...d(500), animationFillMode: 'both' }} data-testid="result-answer">
            {out.answerName}
          </h2>
          <span className={`mt-3 inline-block rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-mist-300 ${cls}`} style={d(800)} data-testid="result-category">
            {puzzle.category}
          </span>
        </div>

        <div className={`mt-8 ${cls}`} style={d(1000)}>
          <p className="eyebrow mb-2">Obscurity</p>
          <Gauge value={out.obscurity} delay={fresh ? 1100 : 0} animate={fresh} />
          <p className="mt-2 text-sm font-semibold text-amber-glow" data-testid="result-obscurity-label">
            {obscurityLabel(out.obscurity)}
          </p>
        </div>

        <div className={`mt-6 grid grid-cols-3 gap-3 ${cls}`} style={d(1300)}>
          <Stat label={won ? 'Growth' : 'Closest-guess growth'} value={`+${growth.toFixed(1)}%`} accent="text-bio-300" testId="result-growth" />
          <Stat label="Guesses" value={won ? `${out.guessesUsed} / ${MAX_GUESSES}` : `X / ${MAX_GUESSES}`} testId="result-guesses" />
          <Stat label="Streak" value={String(streak)} icon={<IconFlame size={14} />} accent="text-amber-glow" testId="result-streak" />
        </div>
      </section>

      <section className="mt-8 space-y-4 lg:mt-0">
        <div className={`glass relative overflow-hidden rounded-3xl p-5 text-center ${cls}`} style={d(1600)} data-testid="evolution-card">
          {evolved ? (
            <>
              <p className="eyebrow !text-amber-glow">New evolution</p>
              <div className="mt-3 flex items-center justify-center gap-3 sm:gap-6">
                <div className="opacity-60">
                  <Creature stage={out.stageBefore} size={84} animate={false} />
                  <p className="mt-1 text-xs text-mist-500">{STAGES[out.stageBefore].name}</p>
                </div>
                <span className="text-2xl text-bio-400" aria-hidden>
                  →
                </span>
                <div>
                  <Creature stage={out.stageAfter} size={132} />
                  <p className="mt-1 font-display text-lg font-semibold text-white" data-testid="result-new-stage">
                    {STAGES[out.stageAfter].name}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-lg" aria-label="evolution">
                {STAGES[out.stageBefore].emoji} → {STAGES[out.stageAfter].emoji}
              </p>
              <button className="btn-ghost mt-3" onClick={() => setShowEvo(true)} data-testid="replay-evo">
                Watch evolution again
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow">Your form</p>
              <div className="mt-2 flex items-center gap-4">
                <Creature stage={out.stageAfter} size={84} />
                <div className="flex-1 text-left">
                  <GrowthBar total={out.totalAfter} />
                </div>
              </div>
              <p className="mt-2 text-xs text-mist-500">{stageProgress(out.totalAfter) < 100 ? 'Keep finding the obscure to evolve.' : ''}</p>
            </>
          )}
        </div>

        <div className={`glass rounded-3xl p-5 ${cls}`} style={d(1800)}>
          <p className="eyebrow">Why it’s obscure</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-mist-100" data-testid="result-explanation">
            {puzzle.explanation}
          </p>
          <a className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-bio-400 hover:text-bio-300" href={puzzle.source.url} target="_blank" rel="noopener noreferrer">
            {puzzle.source.title} <IconExternal size={14} />
          </a>
        </div>

        <div className={`glass rounded-3xl p-5 ${cls}`} style={d(2000)}>
          <p className="eyebrow">Share · spoiler free</p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-black/30 p-4 text-center font-mono text-[0.92rem] leading-relaxed text-mist-100" data-testid="share-preview">
            {shareText}
          </pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-primary !min-h-12 flex-1 !px-5 !text-xs" onClick={onCopy} data-testid="copy-btn">
              {copied === 'ok' ? <IconCheck size={16} /> : <IconCopy size={16} />}
              {copied === 'ok' ? 'Copied!' : copied === 'fail' ? 'Copy failed' : 'Copy result'}
            </button>
            {canShare && (
              <button className="btn-ghost" onClick={() => navigator.share({ text: shareText }).catch(() => {})} data-testid="native-share">
                <IconShare size={16} /> Share
              </button>
            )}
          </div>
        </div>

        <div className={`flex items-center justify-between gap-3 px-1 text-sm text-mist-500 ${cls}`} style={d(2200)}>
          <span className="flex items-center gap-2" data-testid="countdown">
            <IconClock size={16} /> Next mystery in <span className="font-mono text-mist-100">{countdown}</span>
          </span>
          <button className="btn-ghost !min-h-10" onClick={onOpenStats} data-testid="result-stats">
            Stats <IconArrow size={14} />
          </button>
        </div>
      </section>

      {showEvo && (
        <EvolutionOverlay
          from={out.stageBefore}
          to={out.stageAfter}
          onDone={() => {
            setShowEvo(false);
            markCelebrated();
          }}
        />
      )}
    </main>
  );
}

function Stat({ label, value, icon, accent = 'text-white', testId }: { label: string; value: string; icon?: React.ReactNode; accent?: string; testId: string }) {
  return (
    <div className="glass rounded-2xl px-2 py-3">
      <p className="eyebrow flex items-center justify-center gap-1 !text-[0.58rem]">
        {icon}
        {label}
      </p>
      <p className={`mt-1 font-display text-2xl font-semibold ${accent}`} data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

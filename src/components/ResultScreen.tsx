import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { useCountUp } from '@/hooks/useCountUp';
import { STAGES } from '@/data/stages';
import { MAX_POINTS, pointsFor } from '@/lib/scoring';
import { buildShareText, copyText } from '@/lib/share';
import { formatCountdown, msUntilNextDay, prettyDate } from '@/lib/dates';
import { bestEntries } from '@/lib/prompts';
import { SceneView } from './SceneView';
import { AscentOverlay } from './AscentOverlay';
import { GrowthBar } from './GrowthBar';
import { TierChip } from './TierChip';
import { IconArrow, IconCheck, IconClock, IconCopy, IconFlame, IconShare } from './Icons';

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

export function ResultScreen({ api, onOpenStats }: { api: ObscuraApi; onOpenStats: () => void }) {
  const { daily, game, streak, markCelebrated } = api;
  const fresh = useRef(!game?.celebrated).current;
  const out = game?.outcome;
  const evolvedAtEnd = !!out && out.stage > out.stageBeforeFinal;
  const [showEvo, setShowEvo] = useState(false);
  const [copied, setCopied] = useState<null | 'ok' | 'fail'>(null);
  const now = useNow();

  useEffect(() => {
    if (!fresh) return;
    if (evolvedAtEnd) {
      const t = window.setTimeout(() => setShowEvo(true), 1800);
      return () => window.clearTimeout(t);
    }
    markCelebrated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparks = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ i, tx: (Math.cos(i * 2.4) * (60 + (i % 5) * 28)) | 0, ty: (Math.sin(i * 2.4) * (40 + (i % 4) * 22)) | 0, d: (i % 6) * 0.08 })),
    [],
  );

  const shareText = useMemo(() => (game && daily && out ? buildShareText(game, daily, streak) : ''), [game, daily, out, streak]);
  const points = useCountUp(out?.points ?? 0, fresh ? 1500 : 0, fresh ? 600 : 0);

  if (!daily || !game || !out) return null;
  const stage = STAGES[out.stage];
  const d = (ms: number) => (fresh ? { animationDelay: `${ms}ms` } : { animation: 'none' });
  const cls = fresh ? 'animate-rise' : '';
  const countdown = formatCountdown(msUntilNextDay(now));
  const replayFrom = out.stageBeforeFinal < out.stage ? out.stageBeforeFinal : Math.max(0, out.stage - 1);

  const onCopy = async () => {
    const ok = await copyText(shareText);
    setCopied(ok ? 'ok' : 'fail');
    window.setTimeout(() => setCopied(null), 2200);
  };
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-2 sm:px-5 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-8" data-testid="result">
      <section className="text-center lg:sticky lg:top-4 lg:self-start">
        <p className="eyebrow">
          Obscura #{String(daily.number).padStart(3, '0')} · {prettyDate(daily.dateKey)}
        </p>
        <h1 className={`mt-3 font-display text-xl font-semibold uppercase tracking-[0.3em] text-bio-300 ${cls}`} style={d(0)} data-testid="result-headline">
          Ascent complete
        </h1>

        <div className="relative mt-2">
          {out.points >= 250 && fresh && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10">
              {sparks.map((s) => (
                <span key={s.i} className="spark" style={{ ['--tx' as string]: `${s.tx}px`, ['--ty' as string]: `${s.ty}px`, animationDelay: `${600 + s.d * 1000}ms` }} />
              ))}
            </div>
          )}
          <SceneView stage={out.stage} points={out.points} className="max-w-md" />
        </div>

        <p className={`mt-2 font-display text-3xl font-semibold uppercase tracking-[0.15em] text-white ${cls}`} style={d(300)} data-testid="result-stage">
          {stage.name}
        </p>
        <p className={`mx-auto mt-1 max-w-xs text-sm text-mist-300 ${cls}`} style={d(400)}>
          {stage.blurb}
        </p>

        <div className={`mt-5 grid grid-cols-2 gap-3 ${cls}`} style={d(700)}>
          <Stat label="Points" value={`${Math.round(points)}`} sub={`of ${MAX_POINTS}`} testId="result-points" />
          <Stat label="Streak" value={String(streak)} sub={streak === 1 ? 'day' : 'days'} icon={<IconFlame size={14} />} accent="text-amber-glow" testId="result-streak" />
        </div>

        <div className={`glass mt-4 rounded-2xl p-4 text-left ${cls}`} style={d(900)}>
          <GrowthBar points={out.points} />
        </div>

        {evolvedAtEnd || out.stage > 0 ? (
          <button className={`btn-ghost mt-4 ${cls}`} style={d(1000)} onClick={() => setShowEvo(true)} data-testid="replay-evo">
            Watch the climb
          </button>
        ) : null}
      </section>

      <section className="mt-8 space-y-4 lg:mt-0">
        <div className={`glass rounded-3xl p-5 ${cls}`} style={d(1100)}>
          <p className="eyebrow">Your answers</p>
          <ol className="mt-3 divide-y divide-white/8" data-testid="breakdown">
            {game.rounds.map((r, i) => {
              const prompt = daily.prompts[i];
              const best = bestEntries(prompt, 5);
              return (
                <li key={r.promptId} className="py-3" data-testid="breakdown-row">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-mist-500">{prompt.text}</p>
                      <p className="mt-0.5 break-words font-display text-xl font-semibold text-white" data-testid="breakdown-answer">
                        {r.answer ?? (r.end === 'timeout' ? 'Time’s up' : 'Skipped')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {r.tier ? <TierChip id={r.tier} /> : <span className="chip miss">No answer</span>}
                      <p className="mt-1 font-mono text-sm text-amber-glow">+{r.points}</p>
                    </div>
                  </div>
                  <div className="mt-2.5" data-testid="best-answers">
                    <p className="text-[0.7rem] font-semibold text-mist-500">Best possible answers</p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {best.map((e) => {
                        const mine = r.answer === e.name;
                        return (
                          <li key={e.name} className={`rounded-full border px-2.5 py-1 text-xs ${mine ? 'border-amber-glow/60 bg-amber-glow/10 text-white' : 'border-white/10 bg-white/5 text-mist-300'}`} data-testid="best-answer">
                            {e.name}
                            <span className="ml-1.5 font-mono text-amber-glow/90">{pointsFor(e.score)}</span>
                            {mine && <span className="ml-1">✓</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={`glass rounded-3xl p-5 ${cls}`} style={d(1300)}>
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

        <div className={`flex items-center justify-between gap-3 px-1 text-sm text-mist-500 ${cls}`} style={d(1500)}>
          <span className="flex items-center gap-2" data-testid="countdown">
            <IconClock size={16} /> Next ascent in <span className="font-mono text-mist-100">{countdown}</span>
          </span>
          <button className="btn-ghost !min-h-10" onClick={onOpenStats} data-testid="result-stats">
            Stats <IconArrow size={14} />
          </button>
        </div>
      </section>

      {showEvo && (
        <AscentOverlay
          from={replayFrom}
          to={Math.max(out.stage, replayFrom + 1)}
          onDone={() => {
            setShowEvo(false);
            markCelebrated();
          }}
        />
      )}
    </main>
  );
}

function Stat({ label, value, sub, icon, accent = 'text-white', testId }: { label: string; value: string; sub?: string; icon?: React.ReactNode; accent?: string; testId: string }) {
  return (
    <div className="glass rounded-2xl px-2 py-3">
      <p className="eyebrow flex items-center justify-center gap-1 !text-[0.58rem]">
        {icon}
        {label}
      </p>
      <p className={`mt-1 font-display text-3xl font-semibold ${accent}`} data-testid={testId}>
        {value}
      </p>
      {sub && <p className="text-xs text-mist-500">{sub}</p>}
    </div>
  );
}

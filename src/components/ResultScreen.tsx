import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { useCountUp } from '@/hooks/useCountUp';
import { STAGES } from '@/data/stages';
import { MAX_POINTS, TIERS, pointsFor, tierFor } from '@/lib/scoring';
import type { Prompt } from '@/lib/types';
import { buildShareText, copyText } from '@/lib/share';
import { formatCountdown, msUntilNextDay, prettyDate } from '@/lib/dates';
import { bestEntries } from '@/lib/prompts';
import { AscentOverlay } from './AscentOverlay';
import { GrowthBar } from './GrowthBar';
import { TierChip, TierDot } from './TierChip';
import { useWorld } from './WorldContext';
import { IconArrow, IconCheck, IconClock, IconCopy, IconFlame, IconInfinity, IconShare } from './Icons';

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
  const world = useWorld();
  const fresh = useRef(!game?.celebrated).current;
  const out = game?.outcome;
  const evolvedAtEnd = !!out && out.stage > out.stageBeforeFinal;
  const [showEvo, setShowEvo] = useState(false);
  const [copied, setCopied] = useState<null | 'ok' | 'fail'>(null);
  const timers = useRef<number[]>([]);
  const now = useNow();

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (!fresh) return;
    // The world already climbed during the last reveal, so the finale is just the card.
    if (evolvedAtEnd) {
      const t = window.setTimeout(() => setShowEvo(true), 1400);
      return () => window.clearTimeout(t);
    }
    markCelebrated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Never leave the world pointing somewhere else when this screen goes away.
  useEffect(
    () => () => {
      clearTimers();
      world.setOverride(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Drop the world back to where the climb began, then let it rise again and show the card.
  const watchClimb = () => {
    clearTimers();
    setShowEvo(false);
    world.setOverride(STAGES[replayFrom].threshold);
    timers.current.push(window.setTimeout(() => world.setOverride(null), 1300));
    timers.current.push(window.setTimeout(() => setShowEvo(true), 4800));
  };

  const onCopy = async () => {
    const ok = await copyText(shareText);
    setCopied(ok ? 'ok' : 'fail');
    window.setTimeout(() => setCopied(null), 2200);
  };
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 sm:px-5 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-8" data-testid="result">
      {/* The hero stands in the open space between the title and the stage name. */}
      <section className="flex min-h-[44dvh] flex-col justify-between text-center text-soft-shadow hero-col">
        <div className="mx-auto rounded-2xl bg-black/35 px-4 py-2 backdrop-blur-md">
          <p className="eyebrow !text-white/80">{daily.endless ? `Endless · Dive ${daily.endless}` : `Obscura #${String(daily.number).padStart(3, '0')} · ${prettyDate(daily.dateKey)}`}</p>
          <h1 className={`mt-1 font-display text-lg font-semibold uppercase tracking-[0.3em] text-bio-300 ${cls}`} style={d(0)} data-testid="result-headline">
            {daily.endless ? 'Dive complete' : 'Ascent complete'}
          </h1>
        </div>
        <div className="mx-auto mb-3 rounded-2xl bg-black/35 px-5 py-3 backdrop-blur-md">
          <p className={`font-display text-2xl font-semibold uppercase tracking-[0.15em] text-white sm:text-3xl ${cls}`} style={d(300)} data-testid="result-stage">
            {stage.name}
          </p>
          <p className={`mx-auto mt-1 max-w-xs text-sm text-white/85 ${cls}`} style={d(400)}>
            {stage.blurb}
          </p>
        </div>
      </section>

      <section className="space-y-3 lg:pt-1">
        <div className={`glass-dock rounded-3xl p-4 ${cls}`} style={d(700)}>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Stat label="Points" value={`${Math.round(points)}`} sub={`of ${MAX_POINTS}`} testId="result-points" />
            {daily.endless ? (
              <Stat label="Dive" value={String(daily.endless)} sub="of 2" testId="result-dive" />
            ) : (
              <Stat label="Streak" value={String(streak)} sub={streak === 1 ? 'day' : 'days'} icon={<IconFlame size={14} />} accent="text-amber-glow" testId="result-streak" />
            )}
          </div>
          <div className="mt-4 text-left">
            <GrowthBar points={out.points} />
          </div>
          {out.stage > 0 && (
            <button className="btn-ghost mt-4 w-full" onClick={watchClimb} data-testid="replay-evo">
              Watch the climb
            </button>
          )}
        </div>

        <div className={`glass-dock rounded-3xl p-4 sm:p-5 ${cls}`} style={d(1000)}>
          <p className="eyebrow">Your answers</p>
          <ol className="mt-2 divide-y divide-white/10" data-testid="breakdown">
            {game.rounds.map((r, i) => {
              const prompt = daily.prompts[i];
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
                  <AnswerList prompt={prompt} mine={r.answer} />
                </li>
              );
            })}
          </ol>
        </div>

        {!daily.endless && (
        <div className={`glass-dock rounded-3xl p-4 sm:p-5 ${cls}`} style={d(1200)}>
          <p className="eyebrow">Share · spoiler free</p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-center font-mono text-[0.92rem] leading-relaxed text-mist-100" data-testid="share-preview">
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
        )}

        <div className={`flex items-center justify-between gap-3 rounded-2xl bg-black/30 px-4 py-2 text-sm text-mist-300 backdrop-blur-md ${cls}`} style={d(1400)}>
          {daily.endless ? (
            <>
              <span className="flex items-center gap-2" data-testid="endless-note">
                <IconInfinity size={16} /> More dives are in development
              </span>
              <button className="btn-ghost !min-h-10" onClick={() => api.setView('home')} data-testid="result-home">
                Home <IconArrow size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2" data-testid="countdown">
                <IconClock size={16} /> Next ascent in <span className="font-mono text-mist-100">{countdown}</span>
              </span>
              <button className="btn-ghost !min-h-10" onClick={onOpenStats} data-testid="result-stats">
                Stats <IconArrow size={14} />
              </button>
            </>
          )}
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

/** The five best answers, and a button that opens every accepted answer, rarest first, grouped by colour. */
function AnswerList({ prompt, mine }: { prompt: Prompt; mine?: string }) {
  const [all, setAll] = useState(false);
  const entries = useMemo(() => bestEntries(prompt), [prompt]);
  const best = entries.slice(0, 5);
  return (
    <div className="mt-2.5">
      {!all ? (
        <div data-testid="best-answers">
          <p className="text-[0.7rem] font-semibold text-mist-500">Best possible answers</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {best.map((e) => (
              <Chip key={e.name} name={e.name} score={e.score} mine={mine === e.name} testId="best-answer" />
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-3" data-testid="all-answers">
          {[...TIERS].reverse().map((t) => {
            const group = entries.filter((e) => tierFor(e.score).id === t.id);
            if (!group.length) return null;
            return (
              <div key={t.id}>
                <p className="flex items-center gap-2 text-[0.7rem] font-semibold text-mist-300">
                  <TierDot id={t.id} size={9} />
                  {t.label} · {t.points} pts
                  <span className="font-normal text-mist-500">{group.length}</span>
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.map((e) => (
                    <Chip key={e.name} name={e.name} score={e.score} mine={mine === e.name} testId="all-answer" />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      <button className="mt-2.5 text-xs font-semibold text-bio-300 underline decoration-bio-500/40 underline-offset-2 hover:text-white" onClick={() => setAll((v) => !v)} aria-expanded={all} data-testid="toggle-all-answers">
        {all ? 'Show fewer' : `Show all ${entries.length} answers`}
      </button>
    </div>
  );
}

function Chip({ name, score, mine, testId }: { name: string; score: number; mine: boolean; testId: string }) {
  return (
    <li className={`rounded-full border px-2.5 py-1 text-xs ${mine ? 'border-amber-glow/60 bg-amber-glow/10 text-white' : 'border-white/10 bg-white/5 text-mist-300'}`} data-testid={testId}>
      {name}
      <span className="ml-1.5 font-mono text-amber-glow/90">{pointsFor(score)}</span>
      {mine && <span className="ml-1">✓</span>}
    </li>
  );
}

function Stat({ label, value, sub, icon, accent = 'text-white', testId }: { label: string; value: string; sub?: string; icon?: React.ReactNode; accent?: string; testId: string }) {
  return (
    <div className="rounded-2xl bg-white/6 px-2 py-3">
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

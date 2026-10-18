import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { MAX_POINTS, ROUNDS_PER_DAY, stageIndexFor, stageProgress } from '@/lib/scoring';
import { currentRoundIndex } from '@/lib/game';
import type { ObscuraApi } from '@/hooks/useObscura';
import { prettyDate } from '@/lib/dates';
import { Emblem } from './Emblem';
import { StageIcon } from './StageIcon';
import { IconFlame, IconTrophy, IconArrow } from './Icons';

export function HomeScreen({ api }: { api: ObscuraApi }) {
  const { stats, streak, game, daily, dateKey } = api;
  const points = game?.points ?? 0;
  const stage = stageIndexFor(points);
  const s = STAGES[stage];
  const next = STAGES[stage + 1];
  const pct = stageProgress(points);
  const done = game?.status === 'done';
  const roundsDone = game?.rounds.filter((r) => r.status === 'done').length ?? 0;
  const started = roundsDone > 0 || game?.rounds.some((r) => r.status === 'active');
  const cta = done ? 'View result' : started ? `Continue · round ${Math.max(0, currentRoundIndex(game!)) + 1}` : 'Play today';

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 safe-pb sm:px-5 lg:justify-center lg:pb-10" data-testid="home">
      <div className="flex flex-1 flex-col lg:max-w-[28rem] lg:flex-none">
        {/* The mark and the promise sit at the top; the hero lives in the space beneath. */}
        <section className="flex flex-col items-center pt-1 text-center text-soft-shadow lg:items-start lg:text-left">
          <Emblem size={84} className="animate-float lg:h-[104px] lg:w-[104px]" title="Obscura" />
          <h1 className="logo mt-2 text-[2rem] leading-none text-white sm:text-4xl lg:mt-3 lg:text-6xl" data-testid="home-logo">
            Obscura
          </h1>
          <p className="mt-2 font-display text-xl italic text-white sm:text-2xl">How obscure can you get?</p>
          <p className="mt-3 hidden max-w-sm text-sm leading-relaxed text-mist-100 lg:block">
            {ROUNDS_PER_DAY} prompts a day, the same for everyone. Name anything that fits. The rarer your answer, the higher you rise: from a microbe on the sea floor to the solar system.
          </p>
        </section>

        <div className="min-h-[9rem] flex-1 lg:hidden" />

        <section className="glass-dock mt-4 rounded-3xl p-4 lg:mt-7 lg:p-5" data-testid="home-creature-info">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10">
                <StageIcon stage={stage} size={28} />
              </span>
              <div className="min-w-0 text-left">
                <h2 className="truncate font-display text-xl font-semibold uppercase tracking-[0.16em] text-white" data-testid="home-stage-name">
                  {s.name}
                </h2>
                <p className="truncate text-xs text-mist-300">
                  {s.place} · {formatAltitude(altitudeFor(points))}
                </p>
              </div>
            </div>
            <p className="shrink-0 text-right text-sm font-semibold text-bio-300" data-testid="home-progress">
              {points} <span className="font-normal text-mist-500">/ {MAX_POINTS}</span>
            </p>
          </div>
          <div className="bar-track mt-3 h-2">
            <div className="bar-fill" style={{ width: `${next ? pct : 100}%` }} />
          </div>
          <p className="mt-2 text-left text-xs text-mist-300">{started || done ? (next ? `Next: ${next.name}` : 'You reached the end of the line.') : 'Where you start today. Every answer lifts you.'}</p>

          <button className="btn-primary mt-4 w-full" onClick={() => api.setView('play')} data-testid="play-btn">
            {cta}
            <IconArrow size={18} />
          </button>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-mist-300" data-testid="home-stats">
            <span className="flex items-center gap-1.5">
              <IconFlame size={14} className="text-amber-glow" />
              <span className="font-semibold text-white" data-testid="home-streak">
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
              streak
            </span>
            <span className="flex items-center gap-1.5">
              <IconTrophy size={14} className="text-bio-400" />
              best
              <span className="font-semibold text-white" data-testid="home-best">
                {stats.bestPoints ? `${stats.bestPoints} pts` : '—'}
              </span>
            </span>
          </div>
          <p className="mt-2 text-center text-[0.7rem] text-mist-500">
            {daily ? (
              <>
                Obscura #{String(daily.number).padStart(3, '0')} · {prettyDate(dateKey)}
                {!done && roundsDone > 0 ? ` · ${roundsDone}/${ROUNDS_PER_DAY} rounds done` : ''}
                {done ? ' · Completed ✓' : ''}
              </>
            ) : (
              ' '
            )}
          </p>
        </section>
      </div>
    </main>
  );
}

/** The whole journey at a glance: reached forms lit, future forms as silhouettes. */
export function Ladder({ current, small = false }: { current: number; small?: boolean }) {
  return (
    <div className="mx-auto mt-3 flex max-w-md flex-wrap items-center justify-center gap-x-1.5 gap-y-1" data-testid="ladder" aria-label="The ascent">
      {STAGES.map((st, i) => {
        const reached = i <= current;
        return (
          <div key={st.id} title={reached ? st.name : '???'} className={`grid place-items-center rounded-full ${i === current ? 'bg-white/10 ring-1 ring-bio-400/60' : ''}`} style={{ width: small ? 24 : 30, height: small ? 24 : 30 }}>
            <StageIcon stage={i} size={small ? 18 : 22} silhouette={!reached} />
          </div>
        );
      })}
    </div>
  );
}

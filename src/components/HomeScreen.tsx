import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { MAX_POINTS, ROUNDS_PER_DAY, stageIndexFor, stageProgress } from '@/lib/scoring';
import { currentRoundIndex } from '@/lib/game';
import type { ObscuraApi } from '@/hooks/useObscura';
import { prettyDate } from '@/lib/dates';
import { Emblem } from './Emblem';
import { Wordmark } from './Wordmark';
import { StageIcon } from './StageIcon';
import { IconFlame, IconTrophy, IconArrow, IconInfinity, IconLock } from './Icons';

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
        <section className="ink-shadow flex flex-col items-center pt-1 text-center lg:items-start lg:text-left">
          <Emblem size={84} className="animate-float lg:h-[104px] lg:w-[104px]" title="Obscura" />
          <h1 className="mt-3 text-[1.9rem] leading-none sm:text-4xl lg:mt-4 lg:text-5xl" data-testid="home-logo">
            <Wordmark />
          </h1>
          <p className="ink mt-3 font-display text-xl italic sm:text-2xl">How obscure can you get?</p>
          <p className="ink-soft mt-3 hidden max-w-sm text-sm leading-relaxed lg:block">
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

        <EndlessCard api={api} />
      </div>
    </main>
  );
}

/** Endless mode, in early access: two practice dives, then a clear note that the rest is still being built. */
function EndlessCard({ api }: { api: ObscuraApi }) {
  const dives = api.endlessDives;
  return (
    <section className="glass-dock mb-2 mt-3 rounded-3xl p-4 lg:mb-0" data-testid="endless-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-violet-glow">
            <IconInfinity size={26} />
          </span>
          <div className="min-w-0 text-left">
            <h2 className="font-display text-xl font-semibold text-white">Endless</h2>
            <p className="truncate text-xs text-mist-300">Extra dives. Your streak is safe.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-amber-glow/40 bg-amber-glow/10 px-2.5 py-1 text-[0.68rem] font-semibold text-amber-glow" data-testid="endless-badge">
          Early access
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {dives.map((d) => (
          <li key={d.dive}>
            <button className="btn-ghost !min-h-[3.4rem] w-full !flex-col !gap-0 !rounded-2xl !normal-case !tracking-normal" onClick={() => api.openEndless(d.dive)} data-testid={`endless-dive-${d.dive}`}>
              <span className="text-sm font-semibold text-white">Dive {d.dive}</span>
              <span className="text-[0.7rem] font-normal text-mist-300" data-testid={`endless-dive-${d.dive}-status`}>
                {d.status === 'done' ? `Done · ${d.points} pts` : d.status === 'playing' ? `Round ${d.rounds + 1} of ${ROUNDS_PER_DAY}` : 'Not started'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-dashed border-white/20 bg-black/20 px-3.5 py-3 text-left" data-testid="endless-dev-block">
        <IconLock size={16} className="mt-0.5 shrink-0 text-mist-300" />
        <p className="text-xs leading-relaxed text-mist-300">
          <span className="font-semibold text-white">More dives are in development.</span> Endless mode is limited to these two while we build the rest.
        </p>
      </div>
    </section>
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

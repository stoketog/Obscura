import { ROUNDS_PER_DAY, developedFor } from '@/lib/scoring';
import { currentRoundIndex, dayTotal } from '@/lib/game';
import type { ObscuraApi } from '@/hooks/useObscura';
import { prettyDate } from '@/lib/dates';
import { Emblem } from './Emblem';
import { Wordmark } from './Wordmark';
import { Chamber } from './Chamber';
import { IconFlame, IconTrophy, IconArrow, IconInfinity, IconLock } from './Icons';

export function HomeScreen({ api }: { api: ObscuraApi }) {
  const { stats, streak, game, daily, dateKey } = api;
  const done = game?.status === 'done';
  const guessed = !!game?.guess;
  const roundsDone = game?.rounds.filter((r) => r.status === 'done').length ?? 0;
  const started = roundsDone > 0 || game?.rounds.some((r) => r.status === 'active');
  const developed = developedFor(game?.points ?? 0);
  const cta = guessed ? 'See today’s result' : done ? 'Make your guess' : started ? `Continue · prompt ${Math.max(0, currentRoundIndex(game!)) + 1}` : 'Enter the chamber';

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 safe-pb sm:px-5 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pb-10" data-testid="home">
      <section className="flex flex-col items-start pt-2 lg:pt-0">
        <div className="flex items-center gap-3">
          <Emblem size={52} title="Obscura" />
          <h1 className="text-[2.9rem] leading-none sm:text-6xl" data-testid="home-logo">
            <Wordmark />
          </h1>
        </div>
        <p className="mt-4 font-display text-[1.65rem] italic leading-tight text-mist-100 sm:text-3xl">One photograph. Seven prompts. One guess.</p>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-mist-300">
          Every day a photograph hangs in a dark room. Answer {ROUNDS_PER_DAY} prompts, and the rarer your answers, the more light gets in. Then name what you see. The less you saw, the more it’s worth.
        </p>
      </section>

      <section className="mt-6 lg:mt-0">
        <div className="panel overflow-hidden" data-testid="home-today">
          {daily && <Chamber image={daily.image} developed={developed} revealed={guessed} aspect="16 / 9" className="!rounded-none !border-0" testId="home-chamber" tag={guessed ? undefined : done || started ? `${developed}% developed` : 'Undeveloped'} />}
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow" data-testid="home-progress">
                {daily ? `No. ${daily.number} · ${prettyDate(dateKey)}` : ' '}
              </p>
              <p className="font-mono text-xs text-mist-500">
                {guessed ? `${dayTotal(game!)} pts` : started || done ? `${roundsDone}/${ROUNDS_PER_DAY} prompts` : ''}
              </p>
            </div>
            <button className="btn-primary mt-4 w-full" onClick={() => api.setView('play')} data-testid="play-btn">
              {cta}
              <IconArrow size={18} />
            </button>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-mist-300" data-testid="home-stats">
              <span className="flex items-center gap-1.5">
                <IconFlame size={14} className="text-bio-400" />
                <span className="font-medium text-mist-100" data-testid="home-streak">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </span>
                streak
              </span>
              <span className="flex items-center gap-1.5">
                <IconTrophy size={14} className="text-bio-400" />
                best
                <span className="font-medium text-mist-100" data-testid="home-best">
                  {stats.bestPoints ? `${stats.bestPoints} pts` : '—'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <EndlessCard api={api} />
      </section>
    </main>
  );
}

/** Endless mode, in early access: two practice dives, then a clear note that the rest is still being built. */
function EndlessCard({ api }: { api: ObscuraApi }) {
  const dives = api.endlessDives;
  return (
    <section className="panel mb-2 mt-3 p-4 lg:mb-0" data-testid="endless-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/5 text-bio-400">
            <IconInfinity size={22} />
          </span>
          <div className="min-w-0 text-left">
            <h2 className="font-display text-2xl leading-none text-mist-100">Endless</h2>
            <p className="mt-1 truncate text-xs text-mist-500">Extra photographs. Your streak is safe.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-bio-400/40 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-bio-400" data-testid="endless-badge">
          Early access
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {dives.map((d) => (
          <li key={d.dive}>
            <button className="btn-ghost !min-h-[3.4rem] w-full !flex-col !gap-0" onClick={() => api.openEndless(d.dive)} data-testid={`endless-dive-${d.dive}`}>
              <span className="text-sm font-medium text-mist-100">Dive {d.dive}</span>
              <span className="text-[0.72rem] text-mist-500" data-testid={`endless-dive-${d.dive}-status`}>
                {d.status === 'done' ? `Done · ${d.points} pts` : d.status === 'playing' ? `Prompt ${d.rounds + 1} of ${ROUNDS_PER_DAY}` : 'Not started'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-start gap-3 rounded-md border border-dashed border-white/15 px-3.5 py-3 text-left" data-testid="endless-dev-block">
        <IconLock size={16} className="mt-0.5 shrink-0 text-mist-500" />
        <p className="text-xs leading-relaxed text-mist-300">
          <span className="font-medium text-mist-100">More dives are in development.</span> Endless mode is limited to these two while we build the rest.
        </p>
      </div>
    </section>
  );
}

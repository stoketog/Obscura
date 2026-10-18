import { STAGES } from '@/data/stages';
import { MAX_POINTS, ROUNDS_PER_DAY, stageIndexFor, stageProgress } from '@/lib/scoring';
import { currentRoundIndex } from '@/lib/game';
import type { ObscuraApi } from '@/hooks/useObscura';
import { prettyDate } from '@/lib/dates';
import { Chamber } from './Chamber';
import { Creature } from './Creature';
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
    <main className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 grid-cols-[minmax(0,1fr)] items-center gap-6 px-5 pb-10 pt-2 lg:grid-cols-2 lg:gap-12" data-testid="home">
      <section className="order-2 min-w-0 text-center lg:order-1 lg:text-left">
        <div className="hidden lg:block">
          <h1 className="logo text-6xl text-white" style={{ textShadow: '0 0 40px rgb(94 242 222 / 0.35)' }}>
            Obscura
          </h1>
        </div>
        <p className="font-display text-2xl italic text-mist-100 sm:text-3xl lg:mt-5">How obscure can you get?</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist-300 lg:mx-0">
          {ROUNDS_PER_DAY} prompts a day, the same for everyone. Name anything that fits. The rarer your answer, the more you evolve.
        </p>

        <div className="mx-auto mt-6 max-w-sm lg:mx-0" data-testid="home-creature-info">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <span className="text-2xl" aria-hidden>
              {s.emoji}
            </span>
            <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.18em] text-white" data-testid="home-stage-name">
              {s.name}
            </h2>
          </div>
          <p className="mt-1 text-sm text-mist-300">{started || done ? s.blurb : 'Today’s form. Every answer you give grows it.'}</p>
          <div className="mt-4">
            <div className="bar-track h-2.5">
              <div className="bar-fill" style={{ width: `${next ? pct : 100}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-bio-300" data-testid="home-progress">
              {points} <span className="text-mist-500">/ {MAX_POINTS} points today</span>
              {next && <span className="text-mist-300"> · next: {next.name}</span>}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center gap-4 lg:items-start">
          <button className="btn-primary w-full max-w-sm" onClick={() => api.setView('play')} data-testid="play-btn">
            {cta}
            <IconArrow size={18} />
          </button>
          <p className="text-xs text-mist-500">
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
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3" data-testid="home-stats">
          <div className="glass rounded-2xl px-4 py-3 text-left">
            <div className="flex items-center gap-2 text-amber-glow">
              <IconFlame size={16} />
              <span className="eyebrow !text-mist-500">Streak</span>
            </div>
            <div className="mt-1 font-display text-3xl font-semibold" data-testid="home-streak">
              {streak}
              <span className="ml-1 text-sm font-normal text-mist-500">{streak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          <div className="glass rounded-2xl px-4 py-3 text-left">
            <div className="flex items-center gap-2 text-bio-400">
              <IconTrophy size={16} />
              <span className="eyebrow !text-mist-500">Best day</span>
            </div>
            <div className="mt-1 font-display text-3xl font-semibold" data-testid="home-best">
              {stats.bestPoints || '—'}
              {stats.bestPoints > 0 && <span className="ml-1 text-sm font-normal text-mist-500">pts</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="order-1 min-w-0 lg:order-2">
        <div className="mb-1 text-center lg:hidden">
          <h1 className="logo text-3xl text-white sm:text-4xl" style={{ textShadow: '0 0 40px rgb(94 242 222 / 0.35)' }}>
            Obscura
          </h1>
        </div>
        <Chamber stage={stage} size={420} className="w-[min(64vw,290px)] lg:w-full" />
        <Ladder current={stage} />
      </section>
    </main>
  );
}

/** The whole journey at a glance: reached forms lit, future forms as silhouettes. */
export function Ladder({ current, small = false }: { current: number; small?: boolean }) {
  return (
    <div className="mx-auto mt-3 flex max-w-md flex-wrap items-center justify-center gap-x-1.5 gap-y-1" data-testid="ladder" aria-label="Evolution ladder">
      {STAGES.map((st, i) => {
        const reached = i <= current;
        return (
          <div key={st.id} title={reached ? st.name : '???'} className={`grid place-items-center rounded-full ${i === current ? 'bg-white/10 ring-1 ring-bio-400/60' : ''}`} style={{ width: small ? 24 : 30, height: small ? 24 : 30 }}>
            <Creature stage={i} size={small ? 18 : 22} animate={false} silhouette={!reached} />
          </div>
        );
      })}
    </div>
  );
}

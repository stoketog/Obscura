import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { MAX_GUESSES } from '@/lib/growth';
import { stageIndexFor } from '@/lib/growth';
import { visibleClueCount } from '@/lib/game';
import { prettyDate } from '@/lib/dates';
import { STAGES } from '@/data/stages';
import { Creature } from './Creature';
import { Chamber } from './Chamber';
import { GrowthBar } from './GrowthBar';
import { ClueCard } from './ClueCard';
import { GuessInput } from './GuessInput';
import { GuessCard } from './GuessCard';

export function GameScreen({ api, onFinished }: { api: ObscuraApi; onFinished: () => void }) {
  const { puzzle, game, profile } = api;
  const [burst, setBurst] = useState<{ text: string; key: number } | null>(null);
  const [fresh, setFresh] = useState<number | null>(null);
  const bestRef = useRef(0);

  // Hydrate "best so far" so a reload doesn't re-announce old finds.
  useEffect(() => {
    bestRef.current = Math.max(0, ...(game?.guesses.map((g) => g.provisionalGrowth) ?? [0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!puzzle || !game) return null;
  const guesses = game.guesses;
  const finished = game.status !== 'playing';
  const stage = stageIndexFor(profile.totalGrowth);
  const visible = visibleClueCount(game, puzzle);
  const projected = finished ? 0 : Math.max(0, ...guesses.map((g) => g.provisionalGrowth));
  const bestGuess = guesses.filter((g) => !g.correct).reduce<number>((b, g, _i, arr) => (g.provisionalGrowth > (arr[b]?.provisionalGrowth ?? -1) ? arr.indexOf(g) : b), -1);
  const left = MAX_GUESSES - guesses.length;

  const handle = (text: string) => {
    const res = api.submit(text);
    if (!res.ok) return { ok: false, message: res.reason, suggestions: res.suggestions };
    setFresh(res.result.index);
    if (!res.result.correct && res.result.provisionalGrowth > bestRef.current + 0.05 && res.result.provisionalGrowth >= 2) {
      setBurst({ text: `Rare find  +${res.result.provisionalGrowth.toFixed(1)}%`, key: Date.now() });
    }
    bestRef.current = Math.max(bestRef.current, res.result.provisionalGrowth);
    if (res.finished) onFinished();
    return { ok: true };
  };

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-1 sm:px-5 lg:grid lg:grid-cols-[19rem_1fr] lg:gap-8" data-testid="game">
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <div className="mb-3 flex items-end justify-between lg:mb-5">
          <div>
            <p className="eyebrow !text-bio-400" data-testid="puzzle-number">
              Obscura #{String(puzzle.number).padStart(3, '0')}
            </p>
            <p className="text-xs text-mist-500">{prettyDate(puzzle.dateKey)}</p>
          </div>
          <div className="text-right" data-testid="guesses-left" aria-label={`${left} guesses left`}>
            <div className="flex justify-end gap-1.5">
              {Array.from({ length: MAX_GUESSES }, (_, i) => (
                <span key={i} className={`pip ${i < guesses.length ? (guesses[i].correct ? 'hit' : 'used') : 'left'}`} />
              ))}
            </div>
            <p className="mt-1 text-xs text-mist-500">
              <span className="font-semibold text-mist-100">{left}</span> {left === 1 ? 'guess' : 'guesses'} left
            </p>
          </div>
        </div>

        <div className="glass relative rounded-3xl p-4">
          <div className="hidden lg:block">
            <Chamber stage={stage} size={260} />
            <div className="mt-3" />
          </div>
          <div className="flex items-center gap-4 lg:block">
            <div className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-2xl bg-white/5 lg:hidden">
              <Creature stage={stage} size={60} title={STAGES[stage].name} />
            </div>
            <div className="min-w-0 flex-1">
              <GrowthBar total={profile.totalGrowth} projected={projected} compact />
            </div>
          </div>
          {burst && (
            <div key={burst.key} className="burst pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-glow px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#2a1a00] shadow-[0_0_30px_rgb(255_193_94/0.7)]" data-testid="burst">
              {burst.text}
            </div>
          )}
        </div>
      </aside>

      <div className="mt-4 space-y-4 lg:mt-0">
        <ClueCard puzzle={puzzle} visible={visible} finished={finished} />

        {finished ? (
          <div className="glass animate-pop rounded-2xl p-5 text-center" data-testid="finish-banner">
            <p className={`font-display text-3xl font-semibold ${game.status === 'won' ? 'shimmer-text' : 'text-mist-100'}`}>{game.status === 'won' ? 'You found it' : 'Out of guesses'}</p>
            <p className="mt-1 text-sm text-mist-500">Revealing the answer…</p>
          </div>
        ) : (
          <GuessInput onSubmit={handle} />
        )}

        {guesses.length > 0 && (
          <section aria-label="Your guesses">
            <h2 className="eyebrow mb-3">Your guesses</h2>
            <ul className="space-y-3" data-testid="guess-list">
              {[...guesses].reverse().map((g) => (
                <GuessCard key={g.index} g={g} best={g.index === guesses[bestGuess]?.index && guesses.length > 1} animate={fresh === g.index} />
              ))}
            </ul>
          </section>
        )}
        {guesses.length === 0 && (
          <p className="px-2 text-center text-sm text-mist-500">
            Think laterally. A rare guess that’s <em>close</em> is worth far more than a common one.
          </p>
        )}
      </div>
    </main>
  );
}

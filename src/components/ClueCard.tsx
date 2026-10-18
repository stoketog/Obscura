import type { ResolvedPuzzle } from '@/lib/types';

export function ClueCard({ puzzle, visible, finished }: { puzzle: ResolvedPuzzle; visible: number; finished: boolean }) {
  const total = puzzle.clues.length;
  const current = puzzle.clues[visible - 1];
  const earlier = puzzle.clues.slice(0, visible - 1);
  const hasMore = visible < total;
  return (
    <section className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6" data-testid="clue-card" aria-live="polite">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-bio-500/10 blur-3xl" />
      <div className="flex items-center justify-between">
        <span className="eyebrow !text-bio-400" data-testid="clue-label">
          Clue {visible}
          <span className="text-mist-700"> / {total}</span>
        </span>
        <div className="flex gap-1.5" aria-hidden>
          {puzzle.clues.map((_, i) => (
            <span key={i} className="h-1 rounded-full transition-all duration-500" style={{ width: i < visible ? 22 : 10, background: i < visible ? 'var(--color-bio-400)' : 'rgb(255 255 255 / 0.14)', boxShadow: i === visible - 1 ? '0 0 8px var(--color-bio-400)' : 'none' }} />
          ))}
        </div>
      </div>

      <p key={visible} className="mt-4 animate-rise font-display text-[1.45rem] italic leading-snug text-white sm:text-[1.7rem]" data-testid="clue-text">
        “{current}”
      </p>

      {earlier.length > 0 && (
        <ol className="mt-5 space-y-2 border-t border-white/8 pt-4" data-testid="earlier-clues">
          {earlier.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-mist-300">
              <span className="mt-0.5 w-4 shrink-0 text-right font-mono text-xs text-mist-700">{i + 1}</span>
              <span>{c}</span>
            </li>
          ))}
        </ol>
      )}
      {hasMore && !finished && (
        <p className="mt-4 flex items-center gap-2 text-xs text-mist-700">
          <span className="inline-block h-px w-5 bg-mist-700" />
          Clue {visible + 1} unlocks with your next guess
        </p>
      )}
    </section>
  );
}

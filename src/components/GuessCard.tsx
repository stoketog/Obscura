import type { GuessResult } from '@/lib/types';
import { getEntity } from '@/lib/lexicon';
import { useCountUp } from '@/hooks/useCountUp';
import { IconFlame } from './Icons';

const MARK = { match: '✓', close: '~', miss: '✕' } as const;

function titleCase(s: string) {
  return s.replace(/(^|[\s-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

export function GuessCard({ g, best, animate }: { g: GuessResult; best: boolean; animate: boolean }) {
  const pct = useCountUp(g.similarity, animate ? 800 : 0);
  const entity = getEntity(g.entityId);
  const rare = !g.correct && g.obscurity >= 62 && g.similarity >= 50;
  return (
    <li
      className={`guess-card glass warm-${g.warmth} rounded-2xl p-4 ${animate ? 'animate-rise' : ''} ${rare ? 'rare-glow' : ''}`}
      data-testid="guess-card"
      data-guess={g.name}
      data-similarity={g.similarity}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-mist-700">#{g.index + 1}</span>
            {best && !g.correct && <span className="rounded-full bg-amber-glow/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-widest text-amber-glow">Closest</span>}
            {rare && <span className="rounded-full bg-amber-glow/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-widest text-amber-glow">Rare find</span>}
          </div>
          <h3 className="truncate font-display text-xl font-semibold text-white">{g.name}</h3>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-semibold leading-none" style={{ color: 'hsl(var(--w))' }} data-testid="guess-pct">
            {pct}%
          </div>
          <div className="mt-1 flex items-center justify-end gap-1 text-xs font-semibold" style={{ color: 'hsl(var(--w))' }}>
            {g.warmth !== 'freezing' && g.warmth !== 'cold' && <IconFlame size={13} />}
            <span data-testid="guess-warmth">{g.warmthLabel}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full ${animate ? 'bar-grow' : ''}`} style={{ width: `${g.similarity}%`, background: 'hsl(var(--w))', boxShadow: '0 0 12px hsl(var(--w) / 0.7)' }} />
      </div>

      <div className="relative mt-3 flex flex-wrap gap-1.5">
        {g.rows.map((r) => (
          <span key={r.key} className={`chip ${r.level}`} data-testid={`row-${r.key}`}>
            <span className="text-mist-500">{r.label}</span>
            <span>{r.key === 'category' && entity ? titleCase(entity.group) : r.text}</span>
            <span aria-hidden>{MARK[r.level]}</span>
          </span>
        ))}
      </div>

      <div className="relative mt-3 flex items-center gap-3 text-xs">
        <span className="eyebrow !text-[0.6rem]">Obscurity</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
          <div className={`h-full rounded-full ${animate ? 'bar-grow' : ''}`} style={{ width: `${g.obscurity}%`, background: g.obscurity >= 62 ? 'var(--color-amber-glow)' : 'var(--color-mist-500)' }} />
        </div>
        <span className={g.obscurity >= 62 ? 'font-semibold text-amber-glow' : 'text-mist-500'} data-testid="guess-obscurity">
          {g.obscurityLabel}
        </span>
        {!g.correct && g.provisionalGrowth > 0 && <span className="font-mono text-bio-300">+{g.provisionalGrowth.toFixed(1)}%</span>}
      </div>
    </li>
  );
}

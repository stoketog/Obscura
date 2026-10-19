import type { ObscuraApi } from '@/hooks/useObscura';
import { TIERS } from '@/lib/scoring';
import { Modal } from './Modal';
import { TierChip } from './TierChip';

function Tile({ label, value, sub, testId }: { label: string; value: string | number; sub?: string; testId: string }) {
  return (
    <div className="glass rounded-lg p-4">
      <p className="eyebrow !text-[0.62rem]">{label}</p>
      <p className="mt-1 font-display text-4xl leading-none text-mist-100" data-testid={testId}>
        {value}
      </p>
      {sub && <p className="mt-1 truncate text-xs text-mist-500">{sub}</p>}
    </div>
  );
}

export function StatsModal({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const s = api.stats;
  const max = Math.max(1, ...Object.values(s.tierCounts));
  return (
    <Modal title="Your statistics" onClose={onClose} testId="stats-modal">
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Current streak" value={s.currentStreak} sub={s.currentStreak === 1 ? 'day' : 'days'} testId="stat-streak" />
        <Tile label="Longest streak" value={s.longestStreak} testId="stat-longest" />
        <Tile label="Days played" value={s.played} testId="stat-played" />
        <Tile label="Photographs named" value={s.guessed ? `${s.guessedRight}/${s.guessed}` : '—'} sub={s.guessed ? `${Math.round((s.guessedRight / s.guessed) * 100)}% right` : undefined} testId="stat-named" />
        <Tile label="Best development" value={s.played ? `${s.bestDeveloped}%` : '—'} testId="stat-developed" />
        <Tile label="Best day" value={s.bestPoints || '—'} sub={s.bestPoints ? 'points' : undefined} testId="stat-best" />
        <Tile label="Average day" value={s.averagePoints || '—'} sub={s.averagePoints ? 'points' : undefined} testId="stat-avg" />
        <Tile label="Rarest find" value={s.rarest?.name ?? '—'} sub={s.rarest ? `rarity ${s.rarest.score}` : undefined} testId="stat-rarest" />
      </div>

      <p className="eyebrow mb-3 mt-6">Your answers by rarity</p>
      <div className="space-y-2">
        {[...TIERS].reverse().map((t) => {
          const n = s.tierCounts[t.id];
          return (
            <div key={t.id} className="flex items-center gap-2 text-xs">
              <span className="w-28 shrink-0">
                <TierChip id={t.id} />
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-white/5">
                <div className="flex h-full items-center justify-end rounded px-2 font-mono text-[#1a120a]" style={{ width: n ? `${Math.max(8, (n / max) * 100)}%` : 0, background: t.color }}>
                  {n || ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

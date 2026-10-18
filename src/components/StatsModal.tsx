import type { ObscuraApi } from '@/hooks/useObscura';
import { STAGES } from '@/data/stages';
import { TIERS } from '@/lib/scoring';
import { Modal } from './Modal';
import { StageIcon } from './StageIcon';
import { Ladder } from './HomeScreen';
import { TierChip } from './TierChip';

function Tile({ label, value, sub, testId }: { label: string; value: string | number; sub?: string; testId: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="eyebrow !text-[0.6rem]">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-white" data-testid={testId}>
        {value}
      </p>
      {sub && <p className="mt-0.5 truncate text-xs text-mist-500">{sub}</p>}
    </div>
  );
}

export function StatsModal({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const s = api.stats;
  const stage = STAGES[s.bestStage];
  const max = Math.max(1, ...Object.values(s.tierCounts));
  return (
    <Modal title="Your journey" onClose={onClose} testId="stats-modal">
      <div className="flex items-center gap-4 rounded-2xl bg-white/4 p-4">
        <StageIcon stage={s.bestStage} size={56} />
        <div>
          <p className="eyebrow">Highest point so far</p>
          <p className="font-display text-2xl font-semibold text-white" data-testid="stats-stage">
            {stage.name}
          </p>
          <p className="text-xs text-mist-500">{s.played ? `Reached in one day of ${s.played} played` : 'Play a day to start your journey'}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Tile label="Current streak" value={`🔥 ${s.currentStreak}`} testId="stat-streak" />
        <Tile label="Longest streak" value={s.longestStreak} testId="stat-longest" />
        <Tile label="Days played" value={s.played} testId="stat-played" />
        <Tile label="Average day" value={s.averagePoints || '—'} sub={s.averagePoints ? 'points' : undefined} testId="stat-avg" />
        <Tile label="Best day" value={s.bestPoints || '—'} sub={s.bestPoints ? 'points' : undefined} testId="stat-best" />
        <Tile label="Rarest find" value={s.rarest?.name ?? '—'} sub={s.rarest ? `rarity ${s.rarest.score}` : undefined} testId="stat-rarest" />
      </div>

      <p className="eyebrow mb-3 mt-6">Your answers by rarity</p>
      <div className="space-y-2">
        {TIERS.map((t) => {
          const n = s.tierCounts[t.id];
          return (
            <div key={t.id} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0">
                <TierChip id={t.id} />
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-white/5">
                <div className="flex h-full items-center justify-end rounded-md px-2 font-semibold text-black/80" style={{ width: n ? `${Math.max(8, (n / max) * 100)}%` : 0, background: t.color }}>
                  {n || ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="eyebrow mb-1 mt-6">The ladder</p>
      <Ladder current={s.bestStage} small />
    </Modal>
  );
}

import type { ObscuraApi } from '@/hooks/useObscura';
import { STAGES } from '@/data/stages';
import { MAX_GUESSES } from '@/lib/growth';
import { Modal } from './Modal';
import { Creature } from './Creature';
import { Ladder } from './HomeScreen';

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
  const stage = STAGES[s.stageIndex];
  const max = Math.max(1, ...s.distribution);
  return (
    <Modal title="Your journey" onClose={onClose} testId="stats-modal">
      <div className="flex items-center gap-4 rounded-2xl bg-white/4 p-4">
        <Creature stage={s.stageIndex} size={72} />
        <div>
          <p className="eyebrow">Current form</p>
          <p className="font-display text-2xl font-semibold text-white" data-testid="stats-stage">
            {stage.name}
          </p>
          <p className="text-xs text-mist-500">Total growth {s.totalGrowth.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Tile label="Current streak" value={`🔥 ${s.currentStreak}`} testId="stat-streak" />
        <Tile label="Longest streak" value={s.longestStreak} testId="stat-longest" />
        <Tile label="Puzzles solved" value={s.solved} sub={s.played ? `${s.winRate}% of ${s.played} played` : undefined} testId="stat-solved" />
        <Tile label="Avg. obscurity" value={s.averageObscurity || '—'} testId="stat-avg" />
        <Tile label="Best discovery" value={s.bestObscurity || '—'} sub={s.bestName ?? undefined} testId="stat-best" />
        <Tile label="Total growth" value={`${s.totalGrowth.toFixed(1)}%`} testId="stat-growth" />
      </div>

      <p className="eyebrow mb-3 mt-6">Guesses to solve</p>
      <div className="space-y-1.5">
        {s.distribution.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right font-mono text-mist-500">{i + 1}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-white/5">
              <div className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-bio-600 to-bio-400 px-2 font-semibold text-[#02211d]" style={{ width: n ? `${Math.max(8, (n / max) * 100)}%` : 0 }}>
                {n || ''}
              </div>
            </div>
          </div>
        ))}
        <p className="pt-1 text-[0.7rem] text-mist-700">Out of {MAX_GUESSES} guesses</p>
      </div>

      <p className="eyebrow mb-1 mt-6">The ladder</p>
      <Ladder current={s.stageIndex} small />
    </Modal>
  );
}

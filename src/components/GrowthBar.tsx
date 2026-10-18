import { STAGES } from '@/data/stages';
import { stageIndexFor } from '@/lib/growth';

interface Props {
  total: number;
  /** Extra growth that is "in play" this game (best guess so far). */
  projected?: number;
  compact?: boolean;
}

/** Progress through the current stage towards the next, with an amber "projected" segment. */
export function GrowthBar({ total, projected = 0, compact = false }: Props) {
  const idx = stageIndexFor(total);
  const last = idx >= STAGES.length - 1;
  const start = STAGES[idx].threshold;
  const end = last ? start : STAGES[idx + 1].threshold;
  const span = Math.max(0.0001, end - start);
  const fill = last ? 100 : Math.min(100, ((total - start) / span) * 100);
  const projEnd = last ? 100 : Math.min(100, ((total + projected - start) / span) * 100);
  const projWidth = Math.max(0, projEnd - fill);
  const evolves = !last && total + projected >= end - 1e-9;
  return (
    <div className="w-full" data-testid="growth-bar">
      <div className={`flex items-baseline justify-between ${compact ? 'text-[0.7rem]' : 'text-xs'} tracking-wide`}>
        <span className="font-semibold text-mist-100">{STAGES[idx].name}</span>
        <span className="text-mist-500">{last ? 'Final form' : <>{STAGES[idx + 1].name}</>}</span>
      </div>
      <div className={`bar-track mt-1.5 ${compact ? 'h-2' : 'h-3'}`}>
        <div className="bar-fill" style={{ width: `${fill}%` }} />
        {projWidth > 0.2 && <div className="bar-proj" style={{ left: `${fill}%`, width: `${projWidth}%` }} />}
      </div>
      <div className={`mt-1.5 flex justify-between ${compact ? 'text-[0.68rem]' : 'text-xs'} text-mist-500`}>
        <span data-testid="growth-pct">{last ? 'Complete' : `${Math.round(fill)}% → next evolution`}</span>
        {projected >= 0.5 && (
          <span className="text-amber-glow" data-testid="growth-projected">
            {evolves ? 'Solve it to evolve' : `+${projected.toFixed(1)}% in play`}
          </span>
        )}
      </div>
    </div>
  );
}

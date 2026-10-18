import { STAGES } from '@/data/stages';
import { stageIndexFor } from '@/lib/scoring';

interface Props {
  /** Points scored today. */
  points: number;
  compact?: boolean;
}

/** Progress through today's current form towards the next one. */
export function GrowthBar({ points, compact = false }: Props) {
  const idx = stageIndexFor(points);
  const last = idx >= STAGES.length - 1;
  const start = STAGES[idx].threshold;
  const end = last ? start : STAGES[idx + 1].threshold;
  const fill = last ? 100 : Math.min(100, ((points - start) / Math.max(1, end - start)) * 100);
  return (
    <div className="w-full" data-testid="growth-bar">
      <div className={`flex items-baseline justify-between gap-2 ${compact ? 'text-[0.7rem]' : 'text-xs'} tracking-wide`}>
        <span className="truncate font-semibold text-mist-100">{STAGES[idx].name}</span>
        <span className="truncate text-mist-500">{last ? 'The end of the line' : STAGES[idx + 1].name}</span>
      </div>
      <div className={`bar-track mt-1.5 ${compact ? 'h-2' : 'h-3'}`}>
        <div className="bar-fill" style={{ width: `${fill}%` }} />
      </div>
      <p className={`mt-1.5 ${compact ? 'text-[0.68rem]' : 'text-xs'} text-mist-500`} data-testid="growth-pct">
        {last ? 'Complete' : `${end - points} more points to rise`}
      </p>
    </div>
  );
}

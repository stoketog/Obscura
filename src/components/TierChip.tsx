import type { TierId } from '@/lib/types';
import { tierById } from '@/lib/scoring';

/** A small colour dot for a rarity tier (grey → green → yellow → blue → purple → orange). */
export function TierDot({ id, size = 10, className = '' }: { id: TierId; size?: number; className?: string }) {
  const t = tierById(id);
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size, background: t.color, boxShadow: `0 0 ${size}px ${t.color}99, inset 0 -2px 0 rgb(0 0 0 / 0.18), inset 0 1px 0 rgb(255 255 255 / 0.5)` }}
    />
  );
}

/** A rarity badge: colour dot, label and (optionally) the points it is worth. */
export function TierChip({ id, points = false, className = '' }: { id: TierId; points?: boolean; className?: string }) {
  const t = tierById(id);
  return (
    <span className={`tier-chip ${className}`} style={{ ['--tc' as string]: t.color }} data-tier={t.id}>
      <TierDot id={id} size={8} />
      {t.label}
      {points && <span className="opacity-70">· {t.points}</span>}
    </span>
  );
}

import type { TierId } from '@/lib/types';
import { tierById } from '@/lib/scoring';

/** A rarity badge: emoji, label and (optionally) the points it is worth. */
export function TierChip({ id, points = false, className = '' }: { id: TierId; points?: boolean; className?: string }) {
  const t = tierById(id);
  return (
    <span className={`tier-chip ${className}`} style={{ ['--th' as string]: t.hue }} data-tier={t.id}>
      <span aria-hidden>{t.emoji}</span>
      {t.label}
      {points && <span className="opacity-70">· {t.points}</span>}
    </span>
  );
}

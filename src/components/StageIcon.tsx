import { STAGES } from '@/data/stages';

/** The emoji for a form; unreached forms show as a dim silhouette. */
export function StageIcon({ stage, size = 22, silhouette = false, title }: { stage: number; size?: number; silhouette?: boolean; title?: string }) {
  const st = STAGES[stage];
  return (
    <span
      className="inline-grid select-none place-items-center leading-none"
      style={{ width: size, height: size, fontSize: size * 0.82, filter: silhouette ? 'brightness(0) invert(0.55)' : undefined, opacity: silhouette ? 0.45 : 1 }}
      role="img"
      aria-label={title ?? (silhouette ? 'Locked form' : st.name)}
    >
      {st.emoji}
    </span>
  );
}

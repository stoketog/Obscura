import { useId } from 'react';
import { WAVE_COLORS } from './Emblem';

/** A single flowing line, the wave under the name. */
function wavePath(): string {
  const pts: string[] = [];
  for (let x = 0; x <= 120; x += 3) pts.push(`${x ? 'L' : 'M'}${x} ${(5 + 2.4 * Math.sin((x / 120) * Math.PI * 4)).toFixed(2)}`);
  return pts.join('');
}
const WAVE = wavePath();

/** The name, in the display serif, with a thin wave of light under it. */
export function Wordmark({ className = '', wave = false }: { className?: string; wave?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-text">Obscura</span>
      {wave && (
        <svg className="wordmark-wave" viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              {WAVE_COLORS.map((c, i) => (
                <stop key={c} offset={i / (WAVE_COLORS.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <path d={WAVE} fill="none" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </span>
  );
}

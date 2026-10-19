import { useId } from 'react';

/** The bands of light: dim near the top of the chamber, brightening as they fall (the same road the rarity colours take). */
export const WAVE_COLORS = ['#3a2f25', '#5b4a38', '#86694a', '#b38653', '#d9a45c', '#f2c66d'];

/** One flowing ribbon, as an SVG path, between two sine curves `thick` apart. */
function ribbon(base: number, amp: number, len: number, phase: number, thick: number): string {
  const pts: Array<[number, number]> = [];
  for (let x = -4; x <= 132; x += 4) pts.push([x, base + amp * Math.sin((x / len) * Math.PI * 2 + phase)]);
  const f = (n: number) => n.toFixed(1);
  const top = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
  const bottom = [...pts].reverse().map(([x, y]) => `L${f(x)} ${f(y + thick)}`).join('');
  return `${top}${bottom}Z`;
}

const RIBBONS = WAVE_COLORS.map((_, i) => ribbon(40 + i * 13.5, 5 + i * 0.7, 78 + i * 7, 0.5 + i * 0.85, 11));

/**
 * The Obscura emblem: a round aperture (the lens of a camera obscura) with a single pinhole of light,
 * and bands of light falling through the dark: dim at the top, warm and bright as they fall away.
 */
export function Emblem({ size = 96, className = '', title }: { size?: number; className?: string; title?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1914" />
          <stop offset="1" stopColor="#080706" />
        </linearGradient>
        <linearGradient id={`${id}ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b5a46" />
          <stop offset="0.5" stopColor="#b38653" />
          <stop offset="1" stopColor="#f2c66d" />
        </linearGradient>
        {WAVE_COLORS.map((c, i) => (
          <linearGradient key={c} id={`${id}w${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={c} />
            <stop offset="1" stopColor={WAVE_COLORS[Math.min(WAVE_COLORS.length - 1, i + 1)]} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}pin`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffe2a8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle cx="64" cy="64" r="56" />
        </clipPath>
      </defs>

      <circle cx="64" cy="64" r="62" fill={`url(#${id}bg)`} />
      <g clipPath={`url(#${id}c)`}>
        {/* the pinhole: the only light that gets in */}
        <circle cx="90" cy="27" r="20" fill={`url(#${id}pin)`} />
        <circle cx="90" cy="27" r="3.2" fill="#ffffff" />
        {RIBBONS.map((d, i) => (
          <path key={i} d={d} fill={`url(#${id}w${i})`} opacity={0.5 + i * 0.1} />
        ))}
      </g>
      <circle cx="64" cy="64" r="59" fill="none" stroke={`url(#${id}ring)`} strokeWidth="2.6" />
      <circle cx="64" cy="64" r="55.4" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="0.8" />
    </svg>
  );
}

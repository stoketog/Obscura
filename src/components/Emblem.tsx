import { useId } from 'react';

/** The bands of light: dim near the top of the chamber, brightening as they fall (the same road the rarity colours take). */
export const WAVE_COLORS = ['#3a2f25', '#5b4a38', '#86694a', '#b38653', '#d9a45c', '#f2c66d'];

/**
 * The Obscura emblem: a serif O whose counter is a dark room, with one pinhole of light at its centre. The O is lit
 * from dim bronze to bright amber, the same road the rarity colours take.
 */
export function Emblem({ size = 96, className = '', title }: { size?: number; className?: string; title?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`${id}pin`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#ffe2a8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b5a46" />
          <stop offset="1" stopColor="#f2c66d" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="120" height="120" rx="28" fill="#12100d" />
      <ellipse cx="64" cy="64" rx="38" ry="44" fill={`url(#${id}ring)`} />
      <ellipse cx="64" cy="64" rx="22" ry="34" fill="#12100d" />
      <circle cx="64" cy="64" r="12" fill={`url(#${id}pin)`} />
      <circle cx="64" cy="64" r="2.8" fill="#ffffff" />
    </svg>
  );
}

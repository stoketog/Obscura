import { useId } from 'react';

/**
 * The Obscura emblem: a glossy orb rising out of layered waves, ringed by an
 * orbit. The sea, the climb and the solar system in one badge.
 */
export function Emblem({ size = 96, className = '', title }: { size?: number; className?: string; title?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5ef2de" />
          <stop offset="0.55" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#5b3df0" />
        </linearGradient>
        <radialGradient id={`${id}o`} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.35" stopColor="#ffc15e" />
          <stop offset="1" stopColor="#fb7c3c" />
        </radialGradient>
        <linearGradient id={`${id}w1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7df9e8" />
          <stop offset="1" stopColor="#1aa7c9" />
        </linearGradient>
        <linearGradient id={`${id}w2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b9cf5" />
          <stop offset="1" stopColor="#2447c9" />
        </linearGradient>
        <linearGradient id={`${id}w3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f4be8" />
          <stop offset="1" stopColor="#25177a" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <circle cx="64" cy="64" r="58" />
        </clipPath>
      </defs>

      {/* badge */}
      <circle cx="64" cy="64" r="60" fill="#06121f" />
      <circle cx="64" cy="64" r="58" fill={`url(#${id}d)`} opacity="0.2" />
      <circle cx="64" cy="64" r="59" fill="none" stroke={`url(#${id}d)`} strokeWidth="2.5" />

      <g clipPath={`url(#${id}c)`}>
        {/* stars */}
        <g fill="#fff" opacity="0.85">
          <circle cx="26" cy="30" r="1.4" />
          <circle cx="100" cy="24" r="1.2" />
          <circle cx="92" cy="46" r="1" />
          <circle cx="38" cy="50" r="0.9" />
          <circle cx="108" cy="62" r="1.1" />
        </g>
        {/* orbit, back half */}
        <ellipse cx="64" cy="50" rx="50" ry="13" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2.2" transform="rotate(-14 64 50)" />
        {/* the orb */}
        <circle cx="64" cy="50" r="22" fill={`url(#${id}o)`} />
        <ellipse cx="56" cy="40" rx="8" ry="5" fill="#fff" opacity="0.7" transform="rotate(-30 56 40)" />
        <circle cx="75" cy="62" r="3.2" fill="#fff" opacity="0.22" />
        {/* orbit, front half (drawn over the orb) */}
        <path d="M14 50 A50 13 0 0 0 114 50" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" transform="rotate(-14 64 50)" opacity="0.95" />
        <circle cx="111" cy="40" r="4.2" fill="#e9f7ff" />
        <circle cx="109.8" cy="38.8" r="1.4" fill="#fff" />

        {/* waves */}
        <path d="M-4 80 C 14 70, 30 70, 48 80 S 82 90, 100 80 S 124 72, 134 78 V140 H-4 Z" fill={`url(#${id}w1)`} />
        <path d="M-4 92 C 16 83, 34 84, 52 93 S 86 102, 104 93 S 126 87, 134 91 V140 H-4 Z" fill={`url(#${id}w2)`} />
        <path d="M-4 105 C 18 97, 36 98, 56 106 S 90 114, 108 106 S 128 100, 134 104 V140 H-4 Z" fill={`url(#${id}w3)`} />
        <path d="M-4 80 C 14 70, 30 70, 48 80 S 82 90, 100 80 S 124 72, 134 78" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

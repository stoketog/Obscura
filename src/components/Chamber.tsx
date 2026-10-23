import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { DailyImage, TierId } from '@/lib/types';
import { chamberFilter, chamberScale } from '@/lib/picture';
import { tierById } from '@/lib/scoring';

/** One answer landing: the photograph develops from `from` to `to` percent, at a pace and with a flourish set by its rarity. */
export interface DevelopMoment {
  /** Changes for every new answer, so the moment plays once per answer. */
  key: string;
  tier: TierId;
  from: number;
  to: number;
}

/** How long the photograph takes to come into focus for each rarity: the rarer, the longer and grander. */
export const DEVELOP_MS: Record<TierId, number> = { everyday: 900, uncommon: 1200, rare: 1600, obscure: 2000, mythic: 2400 };

const reducedMotion = () =>
  typeof window !== 'undefined' && (document.documentElement.dataset.motion === 'reduced' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * The back wall of the chamber: the day's photograph, as developed as the player's points allow.
 * At 0% it is a heavy blur showing only colours and rough shapes; every answer clears the blur a little more.
 * The alt text never names the subject until it is revealed.
 */
export function Chamber({
  image,
  developed,
  revealed = false,
  tag,
  className = '',
  aspect = '7 / 6',
  testId = 'chamber',
  transitionName,
  onTap,
  tapLabel,
  moment,
}: {
  image: DailyImage;
  developed: number;
  /** Show the photograph fully, sharp and named. */
  revealed?: boolean;
  /** Small label in the corner, e.g. "54% developed". Replaced by a ticking counter while a moment plays. */
  tag?: string;
  className?: string;
  aspect?: string;
  testId?: string;
  /** Shared with the same photograph on another screen, so it glides between them (see withViewTransition). */
  transitionName?: string;
  /** Tapping the photograph does this (e.g. opens the guess). */
  onTap?: () => void;
  /** What tapping does, for screen readers and the hint in the corner. */
  tapLabel?: string;
  /** An answer just landed: play its develop moment. */
  moment?: DevelopMoment;
}) {
  const target = revealed ? 100 : developed;
  // What the photograph shows right now. During a moment it starts at the old level and eases to the new one.
  const [level, setLevel] = useState(moment && !revealed ? moment.from : target);
  const [count, setCount] = useState<number | null>(null);
  const [stage, setStage] = useState<'idle' | 'focus' | 'stamp'>('idle');
  const [ms, setMs] = useState(1400);
  const played = useRef<string | null>(null);

  // A plain change (no moment): follow it with the usual soft transition and a bloom of light.
  const last = useRef(target);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    const fresh = moment && played.current !== moment.key;
    if (!fresh) {
      if (target > last.current) setBurst((b) => b + 1);
      setMs(1400);
      setLevel(target);
    }
    last.current = target;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    if (!moment || revealed || played.current === moment.key) return;
    played.current = moment.key;
    const D = DEVELOP_MS[moment.tier];
    if (reducedMotion() || moment.to <= moment.from) {
      setLevel(moment.to);
      setStage('stamp');
      const t = window.setTimeout(() => setStage('idle'), 1400);
      return () => window.clearTimeout(t);
    }
    setMs(0);
    setLevel(moment.from);
    setCount(moment.from);
    setStage('focus');
    let raf = 0;
    const timers: number[] = [];
    // Let the old level paint, then ease to the new one.
    timers.push(
      window.setTimeout(() => {
        setMs(D);
        setLevel(moment.to);
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / D);
          const e = 1 - Math.pow(1 - p, 3);
          setCount(Math.round(moment.from + (moment.to - moment.from) * e));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, 60),
    );
    timers.push(window.setTimeout(() => setStage('stamp'), 60 + D * 0.8));
    timers.push(
      window.setTimeout(() => {
        setStage('idle');
        setCount(null);
      }, 60 + D + 1300),
    );
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      // If interrupted (the player moved on), land on the new level.
      setMs(1400);
      setLevel(moment.to);
      setCount(null);
      setStage('idle');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment?.key, revealed]);

  const shown = revealed ? 100 : level;
  const t = moment ? tierById(moment.tier) : null;
  const grand = moment && (moment.tier === 'obscure' || moment.tier === 'mythic');
  const live = stage !== 'idle' && !!t;

  return (
    <div
      className={`projection ${onTap ? 'projection-tap' : ''} ${live ? `projection-moment ${grand ? 'projection-grand' : ''}` : ''} ${className}`}
      style={{
        aspectRatio: aspect,
        ...(transitionName ? { viewTransitionName: transitionName } : {}),
        ...(t ? { ['--tc' as string]: t.color, ['--develop-ms' as string]: `${DEVELOP_MS[moment!.tier]}ms` } : {}),
      }}
      data-testid={testId}
      data-developed={revealed ? 100 : target}
      data-stage={stage}
      {...(onTap
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-label': tapLabel,
            onClick: onTap,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTap();
              }
            },
          }
        : {})}
    >
      <img
        src={image.src}
        alt={revealed ? `${image.answer}. ${image.blurb}` : 'The hidden photograph, partly developed'}
        draggable={false}
        style={{
          filter: revealed ? 'none' : chamberFilter(shown),
          transform: `scale(${revealed ? 1 : chamberScale(shown)})`,
          transitionDuration: `${ms}ms`,
        }}
      />
      {burst > 0 && <span key={burst} className="light-burst" aria-hidden />}
      {live && stage === 'focus' && <span className="focus-sweep" aria-hidden />}
      {live && stage === 'stamp' && (
        <>
          <span key={`${moment!.key}-flare`} className="tier-flare" aria-hidden />
          {grand && <span key={`${moment!.key}-ring`} className="tier-ring" aria-hidden />}
          <span key={`${moment!.key}-stamp`} className="tier-stamp" data-testid={`${testId}-stamp`}>
            {t!.label}
          </span>
        </>
      )}
      {(count !== null || tag) && (
        <span className="projection-tag" data-testid={`${testId}-tag`}>
          {count !== null ? `${count}% developed` : tag}
        </span>
      )}
      {onTap && tapLabel && (
        <span className="projection-hint" aria-hidden data-testid={`${testId}-hint`}>
          {tapLabel}
        </span>
      )}
    </div>
  );
}

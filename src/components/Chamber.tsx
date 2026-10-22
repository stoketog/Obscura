import { useEffect, useRef, useState } from 'react';
import type { DailyImage } from '@/lib/types';
import { chamberFilter, chamberScale } from '@/lib/picture';

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
}: {
  image: DailyImage;
  developed: number;
  /** Show the photograph fully, sharp and named. */
  revealed?: boolean;
  /** Small label in the corner, e.g. "54% developed". */
  tag?: string;
  className?: string;
  aspect?: string;
  testId?: string;
}) {
  const shown = revealed ? 100 : developed;
  // A short bloom of light whenever more light gets in.
  const last = useRef(shown);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (shown > last.current) setBurst((b) => b + 1);
    last.current = shown;
  }, [shown]);
  return (
    <div className={`projection ${className}`} style={{ aspectRatio: aspect }} data-testid={testId} data-developed={shown}>
      <img
        src={image.src}
        alt={revealed ? `${image.answer}. ${image.blurb}` : 'The hidden photograph, partly developed'}
        draggable={false}
        style={{ filter: revealed ? 'none' : chamberFilter(shown), transform: `scale(${revealed ? 1 : chamberScale(shown)})` }}
      />
      {burst > 0 && <span key={burst} className="light-burst" aria-hidden />}
      {tag && (
        <span className="projection-tag" data-testid={`${testId}-tag`}>
          {tag}
        </span>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { SPREAD_BANDS, SPREAD_WIDTH, scoreSpread, type AnswerShare } from '@/lib/online';

/** Who answered what, for one prompt of the day on screen; null until it arrives (or if offline). */
export function useAnswerShare(api: ObscuraApi, promptId: string, enabled = true): AnswerShare | null {
  const [share, setShare] = useState<AnswerShare | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    void api.statsFor(promptId).then((s) => live && setShare(s));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId, enabled]);
  return share;
}

const pct = (n: number, total: number) => {
  const p = (100 * n) / Math.max(1, total);
  return p < 1 ? '<1%' : `${Math.round(p)}%`;
};

/** Under a revealed answer: how many of today's players said the same thing. */
export function ShareLine({ api, promptId, answer, onDay }: { api: ObscuraApi; promptId: string; answer: string | null; onDay: boolean }) {
  const share = useAnswerShare(api, promptId, !!answer);
  if (!answer || !share || share.total < 1) return null;
  const n = share.counts.get(answer) ?? 1;
  const when = onDay ? 'today' : 'on the day';
  let text: string;
  if (share.total < 3) text = `You’re one of the first players to answer this ${when}.`;
  else if (n <= 1) text = `Nobody else has said this ${when}.`;
  else text = `Said by ${pct(n, share.total)} of players ${when}.`;
  return (
    <p className="mt-1 text-xs text-bio-300" data-testid="share-line">
      {text}
    </p>
  );
}

/** Inside each prompt of the results: the most popular answers among everyone who played. */
export function TopAnswers({ api, promptId }: { api: ObscuraApi; promptId: string }) {
  const share = useAnswerShare(api, promptId);
  if (!share || share.total < 3 || !share.counts.size) return null;
  const top = [...share.counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <p className="mb-1 text-xs leading-relaxed text-mist-300" data-testid="top-answers">
      <span className="text-mist-500">Most said ({share.total} players): </span>
      {top.map(([a, n], i) => (
        <span key={a}>
          <span className="text-mist-100">{a}</span> {pct(n, share.total)}
          {i < top.length - 1 ? ' · ' : ''}
        </span>
      ))}
    </p>
  );
}

/** On the results: where the day's total sits among everyone else's, as a small bar chart with your band lit. */
export function StandingLine({ api, total }: { api: ObscuraApi; total: number }) {
  const s = api.standing;
  const date = api.daily?.dateKey;
  const [bands, setBands] = useState<number[] | null>(null);
  useEffect(() => {
    if (!s || !date) return;
    let live = true;
    void scoreSpread(date).then((b) => live && setBands(b));
    return () => {
      live = false;
    };
  }, [s, date]);
  if (!s || s.players < 2) return null;
  const mine = Math.min(SPREAD_BANDS - 1, Math.max(0, Math.floor(Math.min(799, total) / SPREAD_WIDTH)));
  const shown = bands?.map((n, i) => (i === mine ? Math.max(1, n) : n));
  const max = shown ? Math.max(1, ...shown) : 1;
  return (
    <figure className="panel mt-3 px-4 pb-3 pt-3" data-testid="standing">
      <figcaption className="text-sm text-mist-300">
        You beat <b className="font-medium text-bio-400">{s.beatenPct}%</b> of {s.players.toLocaleString('en-GB')} players today
      </figcaption>
      {shown && (
        <>
          <div className="relative mt-5 flex h-20 items-end gap-[3px]" role="img" aria-label={`Today's totals in bands of ${SPREAD_WIDTH} points; yours is in the ${mine * SPREAD_WIDTH}–${mine * SPREAD_WIDTH + SPREAD_WIDTH - 1} band`} data-testid="score-graph">
            {shown.map((n, i) => (
              <span key={i} className="relative flex h-full flex-1 items-end">
                {i === mine && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-bio-400" data-testid="score-graph-you">
                    You
                  </span>
                )}
                <span
                  className={`spread-bar w-full rounded-t-[3px] ${i === mine ? 'bg-bio-400' : 'bg-white/15'}`}
                  style={{ height: `${n ? Math.max(6, (100 * n) / max) : 2}%`, animationDelay: `${i * 25}ms` }}
                  title={`${i * SPREAD_WIDTH}–${i * SPREAD_WIDTH + SPREAD_WIDTH - 1}: ${n} ${n === 1 ? 'player' : 'players'}`}
                />
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[0.62rem] text-mist-500" aria-hidden>
            <span>0</span>
            <span>200</span>
            <span>400</span>
            <span>600</span>
            <span>800 pts</span>
          </div>
        </>
      )}
    </figure>
  );
}

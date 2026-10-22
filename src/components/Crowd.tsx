import { useEffect, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { AnswerShare } from '@/lib/online';

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

/** On the results: how the day ranks against everyone else's. */
export function StandingLine({ api }: { api: ObscuraApi }) {
  const s = api.standing;
  if (!s || s.players < 2) return null;
  return (
    <p className="mt-2 text-center text-sm text-mist-300" data-testid="standing">
      You beat <b className="font-medium text-bio-400">{s.beatenPct}%</b> of {s.players.toLocaleString('en-GB')} players today
    </p>
  );
}

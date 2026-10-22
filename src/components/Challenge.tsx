import { useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { Challenge } from '@/lib/challenge';
import { challengeFor, challengeUrl, loadName, saveName } from '@/lib/challenge';
import { copyText } from '@/lib/share';
import { logEvent } from '@/lib/online';
import { dayTotal } from '@/lib/game';
import { parseDateKey, puzzleNumberFor } from '@/lib/dates';
import { tierById } from '@/lib/scoring';
import { Modal } from './Modal';
import { TierDot } from './TierChip';
import { IconArrow, IconCheck, IconClose, IconShare } from './Icons';

const who = (c: Challenge) => c.name || 'A friend';
const shortDate = (d: string) => parseDateKey(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** "Challenge a friend": one name field, then a link to share or copy. */
export function ChallengeSheet({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const [name, setName] = useState(loadName);
  const [note, setNote] = useState<string | null>(null);
  const daily = api.daily!;
  const game = api.game!;

  const send = async () => {
    saveName(name);
    logEvent('challenge_sent', daily.dateKey);
    const c = challengeFor(game, daily, name);
    if (!c) return;
    const url = challengeUrl(window.location.origin, c);
    const text = `${name.trim() ? `${name.trim()} challenges you` : 'I challenge you'} to Obscura No. ${daily.number}: I scored ${dayTotal(game)}. Can you beat it?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Obscura challenge', text, url });
        onClose();
        return;
      } catch {
        /* cancelled or unsupported: fall back to copying */
      }
    }
    setNote((await copyText(`${text}\n${url}`)) ? 'Link copied. Send it to a friend.' : 'Couldn’t copy the link.');
  };

  return (
    <Modal title="Challenge a friend" onClose={onClose} testId="challenge-sheet">
      <p className="text-sm leading-relaxed text-mist-300">Send a link to today’s game. Once your friend has played, you’ll both see your answers side by side, prompt by prompt.</p>
      <label htmlFor="challenge-name" className="mb-1.5 mt-4 block text-xs text-mist-500">
        Your name (so they know who it’s from)
      </label>
      <input id="challenge-name" className="input-field !pr-4" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" data-testid="challenge-name" />
      <button className="btn-primary mt-4 w-full" onClick={send} data-testid="challenge-send">
        <IconShare size={17} />
        Send the challenge
      </button>
      <p className="mt-2 h-5 text-center text-xs text-bio-300" role="status" data-testid="challenge-note">
        {note ?? ''}
      </p>
    </Modal>
  );
}

/** On the home screen: challenges waiting to be played, or results waiting to be compared. */
export function ChallengeInbox({ api }: { api: ObscuraApi }) {
  const today = api.today;
  const list = api.challenges.filter((c) => c.date <= today).slice(0, 2);
  if (!list.length) return null;
  return (
    <div className="mt-3 space-y-2" data-testid="challenge-inbox">
      {list.map((c) => {
        const g = api.profile.games[c.date];
        const done = g?.status === 'done' && !!g.guess;
        return (
          <button key={`${c.date}-${c.name}`} className="panel flex w-full items-center gap-3 border-bio-400/30 px-3.5 py-3 text-left" onClick={() => api.openChallenge(c)} data-testid={`challenge-${c.date}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bio-400/15 font-display text-lg text-bio-400">{who(c)[0].toUpperCase()}</span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm text-mist-100">{done ? `You vs ${who(c)}: see who won` : `${who(c)} challenged you`}</b>
              <span className="block text-xs text-mist-500">
                No. {puzzleNumberFor(c.date)} · {c.date === today ? 'today' : shortDate(c.date)}
                {done ? '' : ` · they scored ${c.total}`}
              </span>
            </span>
            <IconArrow size={15} className="shrink-0 text-mist-500" />
          </button>
        );
      })}
    </div>
  );
}

function Cell({ answer, tier, points }: { answer: string | null; tier: string | null; points: number }) {
  if (!answer || !tier) return <span className="text-xs text-mist-500">no answer</span>;
  const t = tierById(tier);
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <TierDot id={t.id} size={8} />
      <span className="truncate text-sm text-mist-100">{answer}</span>
      <span className="shrink-0 font-mono text-[0.68rem] text-mist-500">{points}</span>
    </span>
  );
}

/** After the guess: you against each friend who challenged you to this day. */
export function ChallengeCompare({ api }: { api: ObscuraApi }) {
  const daily = api.daily!;
  const game = api.game!;
  const list = api.challenges.filter((c) => c.date === daily.dateKey && !daily.endless);
  const myGuess = game.guess;
  if (!list.length || !myGuess) return null;
  const mine = dayTotal(game);
  return (
    <section className="mt-6 space-y-4" data-testid="challenge-compare">
      {list.map((c) => {
        const verdict = mine > c.total ? 'You win' : mine < c.total ? `${who(c)} wins` : 'A draw';
        return (
          <div key={c.name} className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <p className="eyebrow !text-[0.6rem]">Challenge</p>
                <p className="font-display text-2xl leading-tight text-mist-100" data-testid="challenge-verdict">
                  {verdict}
                </p>
              </div>
              <p className="text-right font-mono text-sm">
                <span className={mine >= c.total ? 'text-bio-400' : 'text-mist-300'}>{mine}</span>
                <span className="text-mist-500"> – </span>
                <span className={c.total >= mine ? 'text-bio-400' : 'text-mist-300'}>{c.total}</span>
              </p>
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-x-3 px-4 pt-2 text-[0.66rem] uppercase tracking-wider text-mist-500">
              <span>You</span>
              <span>{who(c)}</span>
            </div>
            <ul className="divide-y divide-white/5 px-4 pb-2">
              {daily.prompts.map((p, i) => {
                const r = game.rounds[i];
                const t = c.rounds[i];
                return (
                  <li key={p.id} className="py-2">
                    <p className="mb-1 truncate text-[0.7rem] text-mist-500">{p.text}</p>
                    <div className="grid grid-cols-[1fr_1fr] gap-x-3">
                      <Cell answer={r?.answer ?? null} tier={r?.tier ?? null} points={r?.points ?? 0} />
                      {t ? <Cell answer={t.answer} tier={t.tier} points={t.points} /> : <span />}
                    </div>
                  </li>
                );
              })}
              <li className="py-2">
                <p className="mb-1 text-[0.7rem] text-mist-500">The photograph</p>
                <div className="grid grid-cols-[1fr_1fr] gap-x-3 text-sm">
                  <GuessCell correct={myGuess.correct} developed={myGuess.developed} made={!!myGuess.text} />
                  <GuessCell correct={!!c.guess?.correct} developed={c.guess?.developed ?? 0} made={!!c.guess} />
                </div>
              </li>
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function GuessCell({ correct, developed, made }: { correct: boolean; developed: number; made: boolean }) {
  if (!made) return <span className="text-xs text-mist-500">passed</span>;
  return (
    <span className={`flex items-center gap-1.5 ${correct ? 'text-bio-300' : 'text-mist-300'}`}>
      {correct ? <IconCheck size={14} /> : <IconClose size={12} />}
      {correct ? `named at ${developed}%` : 'missed'}
    </span>
  );
}

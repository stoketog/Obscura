import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { RoundState } from '@/lib/types';
import { currentRoundIndex, lastDoneIndex, remainingMs } from '@/lib/game';
import { MAX_POINTS, ROUND_MS, ROUND_SECONDS, ROUNDS_PER_DAY, TIERS, developedFor, tierById } from '@/lib/scoring';
import { prettyDate } from '@/lib/dates';
import { useCountUp } from '@/hooks/useCountUp';
import { Chamber } from './Chamber';
import { TierChip, TierDot } from './TierChip';
import { IconArrow } from './Icons';
import { useSettings } from '@/hooks/useSettings';

interface Props {
  api: ObscuraApi;
  /** The day just ended: keep the last reveal on screen until the player continues. */
  holding: boolean;
  onFinished: () => void;
  onContinue: () => void;
  /** The on-screen keyboard is up, so there is very little room. */
  compact?: boolean;
}

/** "Name a cheese" → ["Name a", "Cheese"], so the subject can be set large on its own line. */
export function splitPrompt(text: string): [string, string] {
  const m = text.match(/^(Name (?:a|an|the|any|one|some)?)\s*(.+)$/i);
  if (!m) return ['', text];
  return [m[1].trim(), m[2].charAt(0).toUpperCase() + m[2].slice(1)];
}

export function GameScreen({ api, holding, onFinished, onContinue, compact = false }: Props) {
  const { daily, game } = api;
  if (!daily || !game) return null;
  const idx = currentRoundIndex(game);
  const active = idx >= 0 && game.rounds[idx].status === 'active' ? game.rounds[idx] : null;
  const lastIdx = lastDoneIndex(game);
  const developed = developedFor(game.points);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-6 sm:px-5 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:pb-12" data-testid="game">
      <section className={`mx-auto w-full max-w-xl ${compact ? 'hidden' : ''} lg:max-w-none`} data-testid="hud">
        <Chamber image={daily.image} developed={developed} tag={`${developed}% developed`} />
        <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-mist-500">
          <span data-testid="puzzle-number">{daily.endless ? `Endless · dive ${daily.endless}` : `No. ${daily.number} · ${prettyDate(daily.dateKey)}`}</span>
          <span>
            <span className="text-mist-100" data-testid="day-points">
              {game.points}
            </span>{' '}
            / {MAX_POINTS} pts
          </span>
        </div>
        <Segments api={api} index={active ? idx : -1} className="mt-2" />
      </section>

      <section className="mx-auto mt-5 w-full max-w-xl lg:mt-0">
        {active ? (
          <ActivePrompt key={active.promptId} api={api} round={active} index={idx} onFinished={onFinished} compact={compact} />
        ) : lastIdx >= 0 ? (
          <Reveal key={lastIdx} api={api} index={lastIdx} done={holding || game.status === 'done'} onContinue={onContinue} />
        ) : (
          <Intro api={api} />
        )}
      </section>
    </main>
  );
}

/** Seven segments, one per prompt, lit in the colour of the answer's rarity. */
export function Segments({ api, index, className = '' }: { api: ObscuraApi; index: number; className?: string }) {
  const game = api.game!;
  const label = game.rounds.map((r, i) => (r.tier ? tierById(r.tier).label : r.status === 'done' ? 'no answer' : i === index ? 'now' : 'to come')).join(', ');
  return (
    <div className={`segments ${className}`} role="img" aria-label={`Prompts: ${label}`} data-testid="round-pips">
      {game.rounds.map((r, i) => (
        <Segment key={r.promptId} round={r} current={i === index} />
      ))}
    </div>
  );
}

function Segment({ round, current }: { round: RoundState; current: boolean }) {
  const t = round.tier ? tierById(round.tier) : null;
  const done = round.status === 'done';
  return <span className="segment" style={t ? { background: t.color } : undefined} data-state={done ? (t ? t.id : round.end) : current ? 'current' : 'pending'} />;
}

/* ───────────────────────── Before the first round ───────────────────────── */

function Intro({ api }: { api: ObscuraApi }) {
  return (
    <section className="animate-rise" data-testid="intro">
      <p className="eyebrow">Today’s chamber is dark</p>
      <h1 className="mt-2 font-display text-[2.4rem] leading-[1.02] text-mist-100 sm:text-5xl">
        {ROUNDS_PER_DAY} prompts. {ROUND_SECONDS} seconds each.
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-mist-300">
        Name anything that fits, like <em>“a cheese”</em> or <em>“a bird”</em>. Every answer lets light into the chamber, and the rarer it is, the more light gets in. When all seven are done, you get one guess at the photograph.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Rarity and points">
        {TIERS.map((t) => (
          <li key={t.id} className="flex items-center gap-1.5 text-xs text-mist-300">
            <TierDot id={t.id} size={9} />
            {t.label}
            <span className="font-mono text-mist-100">{t.points}</span>
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-6 w-full" onClick={api.start} data-testid="start-btn">
        Start round 1
        <IconArrow size={18} />
      </button>
    </section>
  );
}

/* ───────────────────────── A round in progress ───────────────────────── */

function ActivePrompt({ api, round, index, onFinished, compact }: { api: ObscuraApi; round: RoundState; index: number; onFinished: () => void; compact: boolean }) {
  const prompt = api.daily!.prompts[index];
  const [lead, subject] = splitPrompt(prompt.text);
  const [now, setNow] = useState(() => Date.now());
  const expired = useRef(false);
  const { play } = useSettings();
  useEffect(() => play('start'), [play]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  const left = remainingMs(round, now);
  useEffect(() => {
    if (left > 0 || expired.current) return;
    expired.current = true;
    play('timeup');
    if (api.expire()) onFinished();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const frac = left / ROUND_MS;
  const secs = Math.ceil(left / 1000);
  // the clock ticks softly at 10 seconds and every second for the last five
  useEffect(() => {
    if (secs === 10) play('tick');
    else if (secs > 0 && secs <= 5) play('tickUrgent');
  }, [secs, play]);
  const tone = left <= 8000 ? 'danger' : left <= 15000 ? 'warn' : 'ok';

  return (
    <section className="animate-rise" data-testid="round">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow" data-testid="round-label">
          Prompt {index + 1} of {ROUNDS_PER_DAY}
        </p>
        {compact && <Segments api={api} index={index} className="w-28" />}
      </div>
      <div className={compact ? 'mt-1' : 'mt-3'} data-testid="prompt-text" aria-label={prompt.text}>
        {lead && <p className="text-sm text-mist-500">{lead}</p>}
        <h1 className={`font-display leading-[1.02] text-mist-100 ${compact ? 'text-3xl' : 'text-[2.6rem] sm:text-5xl'}`}>{subject}</h1>
      </div>

      <AnswerBox api={api} round={round} onFinished={onFinished} />

      <div className="mt-3 flex items-center gap-3">
        <div className="timer-track flex-1" role="timer" aria-label={`${secs} seconds left`}>
          <div className={`timer-fill ${tone}`} style={{ width: `${Math.max(0, frac) * 100}%` }} />
        </div>
        <p className={`timer-secs ${tone}`} data-testid="timer-secs" aria-live="off">
          0:{String(Math.max(0, secs)).padStart(2, '0')}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-mist-500">
        <span className={compact ? 'hidden' : ''}>Unrecognised answers are free. Keep trying.</span>
        <button
          className="ml-auto rounded-md px-2 py-2 text-mist-300 transition hover:bg-white/5 hover:text-mist-100"
          onClick={() => {
            play('skip');
            if (api.skip()) onFinished();
          }}
          data-testid="skip-btn"
        >
          Skip
        </button>
      </div>
    </section>
  );
}

function AnswerBox({ api, round, onFinished }: { api: ObscuraApi; round: RoundState; onFinished: () => void }) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ text: string; near?: string } | null>(null);
  const [shake, setShake] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { play } = useSettings();

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  const send = (value: string) => {
    const { outcome, finished } = api.submit(value);
    if (outcome.kind === 'hit') {
      play('hit', Math.max(0, TIERS.findIndex((t) => t.id === outcome.tier)));
      setText('');
      setMsg(null);
    } else if (outcome.kind === 'miss') {
      play(outcome.expired ? 'timeup' : 'miss');
      setMsg({ text: outcome.expired ? 'Time’s up.' : 'Not on our list for this prompt. Try another.', near: outcome.near });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      setText('');
    } else if (outcome.kind === 'repeat') {
      play('repeat');
      setMsg({ text: 'You already tried that one.' });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    }
    if (finished) onFinished();
    ref.current?.focus({ preventScroll: true });
  };

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) send(text);
      }}
      data-testid="answer-form"
    >
      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <div className={`flex gap-2 ${shake ? 'shake' : ''}`}>
        <input
          id="answer"
          ref={ref}
          className="input-field !pr-4"
          type="text"
          enterKeyHint="go"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type your answer"
          maxLength={60}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMsg(null);
          }}
          data-testid="answer-input"
        />
        <button type="submit" disabled={!text.trim()} className="btn-primary shrink-0 !px-5" data-testid="answer-submit">
          <span className="hidden sm:inline">Let light in</span>
          <span className="sm:hidden" aria-hidden>
            <IconArrow size={18} />
          </span>
          <span className="sr-only sm:hidden">Submit answer</span>
        </button>
      </div>

      {msg && (
        <div className="panel mt-2 px-3 py-2 text-sm err-text" role="alert" data-testid="answer-error">
          <p>{msg.text}</p>
          {msg.near && (
            <p className="mt-1 text-mist-100">
              Did you mean{' '}
              <button type="button" className="font-medium text-bio-300 underline decoration-bio-500/50 underline-offset-2 hover:text-bio-400" onClick={() => send(msg.near!)} data-testid="did-you-mean">
                {msg.near}
              </button>
              ?
            </p>
          )}
        </div>
      )}

      {round.misses.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Answers you tried" data-testid="misses">
          {round.misses.map((m) => (
            <li key={m} className="chip miss line-through decoration-mist-700">
              {m}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

/* ───────────────────────── After a round ───────────────────────── */

const TIER_LINE: Record<string, string> = {
  everyday: 'Everyone reaches for this one. A sliver of light.',
  uncommon: 'Not everyone would think of that.',
  rare: 'Rare. Few people would name it.',
  obscure: 'Mythic. A deep cut, and a wide beam of light.',
  mythic: 'Obscure. One of the rarest answers there is.',
};

function Reveal({ api, index, done, onContinue }: { api: ObscuraApi; index: number; done: boolean; onContinue: () => void }) {
  const { daily, game } = api;
  const round = game!.rounds[index];
  const prompt = daily!.prompts[index];
  const answered = round.end === 'answered' && round.tier;
  const pts = useCountUp(round.points, 900, 250);
  const before = developedFor(game!.rounds.slice(0, index).reduce((s, r) => s + r.points, 0));
  const after = developedFor(game!.rounds.slice(0, index + 1).reduce((s, r) => s + r.points, 0));
  const next = index + 2;
  const { play } = useSettings();
  useEffect(() => {
    if (after <= before) return;
    const id = window.setTimeout(() => play('ascent'), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="animate-pop" data-testid="reveal">
      <p className="eyebrow">{prompt.text}</p>
      {answered ? (
        <>
          <h2 className="mt-2 break-words font-display text-[2.6rem] leading-[1.02] text-mist-100 sm:text-5xl" data-testid="reveal-answer">
            {round.answer}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <TierChip id={round.tier!} />
            <span className="font-mono text-lg text-bio-400" data-testid="reveal-points">
              +{Math.round(pts)}
            </span>
            <span className="font-mono text-xs text-mist-500" data-testid="reveal-light">
              +{after - before}% light
            </span>
          </div>
          <p className="mt-3 text-sm text-mist-300" data-testid="reveal-line">
            {TIER_LINE[round.tier!]}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-2 font-display text-[2.6rem] leading-none text-mist-100" data-testid="reveal-answer">
            {round.end === 'timeout' ? 'Time’s up' : 'Skipped'}
          </h2>
          <p className="mt-3 text-sm text-mist-300">No light this round. Every possible answer is shown when the day is over.</p>
        </>
      )}

      <button className="btn-primary mt-6 w-full" onClick={done ? onContinue : api.start} data-testid="next-btn" autoFocus>
        {done ? 'Guess the photograph' : `Start round ${next}`}
        <IconArrow size={18} />
      </button>
    </section>
  );
}

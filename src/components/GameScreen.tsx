import { useCallback, useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { RoundState } from '@/lib/types';
import { currentRoundIndex, lastDoneIndex, remainingMs } from '@/lib/game';
import { MAX_POINTS, ROUND_MS, ROUND_SECONDS, ROUNDS_PER_DAY, TIERS, developedFor, tierById } from '@/lib/scoring';
import { prettyDate } from '@/lib/dates';
import { genreOf } from '@/lib/prompts';
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

      <section className="mx-auto mt-5 w-full max-w-xl overflow-x-clip lg:mt-0">
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

/* ───────────────────────── Page transitions ───────────────────────── */

const LEAVE_MS = 320;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Slide the current page out, then run `action` (which brings the next page in). Runs once. */
function useLeave(action: () => void) {
  const [leaving, setLeaving] = useState(false);
  const fired = useRef(false);
  const go = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setLeaving(true);
    window.setTimeout(action, reducedMotion() ? 0 : LEAVE_MS);
  }, [action]);
  return { leaving, go };
}

/* ───────────────────────── Before the first round ───────────────────────── */

function Intro({ api }: { api: ObscuraApi }) {
  const prompts = api.daily!.prompts;
  const { leaving, go } = useLeave(api.start);
  return (
    <section className={leaving ? 'page-leave' : 'page-enter'} data-testid="intro">
      <p className="eyebrow">Today’s chamber is dark</p>
      <h1 className="mt-2 font-display text-[2.4rem] leading-[1.02] text-mist-100 sm:text-5xl">
        {ROUNDS_PER_DAY} prompts. {ROUND_SECONDS} seconds each.
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-mist-300">
        Name anything that fits, like <em>“a cheese”</em> or <em>“a bird”</em>. Every answer lets light into the chamber, and the rarer it is, the more light gets in. When all seven are done, you get one guess at the photograph.
      </p>
      <div className="mt-5">
        <p className="eyebrow">Today’s genres</p>
        <ol className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2" data-testid="lineup">
          {prompts.map((p, i) => (
            <li key={p.id} className="flex items-baseline gap-2.5 text-sm text-mist-300">
              <span className="font-mono text-[0.7rem] text-mist-500">{String(i + 1).padStart(2, '0')}</span>
              {genreOf(p)}
            </li>
          ))}
        </ol>
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2" aria-label="Rarity and points">
        {TIERS.map((t) => (
          <li key={t.id} className="flex items-center gap-1.5 text-xs text-mist-300">
            <TierDot id={t.id} size={9} />
            {t.label}
            <span className="font-mono text-mist-100">{t.points}</span>
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-6 w-full" onClick={go} data-testid="start-btn">
        Start with {genreOf(prompts[0])}
        <IconArrow size={18} />
      </button>
    </section>
  );
}

/* ───────────────────────── A round in progress ───────────────────────── */

function ActivePrompt({ api, round, index, onFinished, compact }: { api: ObscuraApi; round: RoundState; index: number; onFinished: () => void; compact: boolean }) {
  const prompt = api.daily!.prompts[index];
  const nextPrompt = api.daily!.prompts[index + 1];
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
    <section className="page-enter" data-testid="round">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow" data-testid="round-label">
          Prompt {index + 1} of {ROUNDS_PER_DAY} · {genreOf(prompt)}
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

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-mist-500">
        <span className={compact ? 'hidden' : ''}>Unrecognised answers are free. Keep trying.</span>
        <span className="ml-auto shrink-0" data-testid="up-next-hint">
          {nextPrompt ? (
            <>
              Up next: <span className="text-mist-300">{genreOf(nextPrompt)}</span>
            </>
          ) : (
            'Last prompt'
          )}
        </span>
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

/** How long a result stays on screen before the next prompt slides in by itself. */
const AUTO_ADVANCE_MS = 2800;

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
  const nextPrompt = done ? undefined : daily!.prompts[index + 1];
  const { play } = useSettings();
  const { leaving, go } = useLeave(api.start);
  // Counts only while the page is visible, so the next timer never starts while the player is away.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!nextPrompt) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setElapsed((e) => e + 100);
    }, 100);
    return () => window.clearInterval(id);
  }, [nextPrompt]);
  useEffect(() => {
    if (nextPrompt && elapsed >= AUTO_ADVANCE_MS) go();
  }, [elapsed, nextPrompt, go]);
  useEffect(() => {
    if (after <= before) return;
    const id = window.setTimeout(() => play('ascent'), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={leaving ? 'page-leave' : 'page-enter'} data-testid="reveal">
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
            Time’s up
          </h2>
          <p className="mt-3 text-sm text-mist-300">No light this round. Every possible answer is shown when the day is over.</p>
        </>
      )}

      {nextPrompt ? (
        <div className="panel mt-6 overflow-hidden" data-testid="up-next">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="eyebrow">
                Up next · Prompt {index + 2} of {ROUNDS_PER_DAY}
              </p>
              <p className="mt-1 truncate font-display text-2xl leading-tight text-mist-100" data-testid="up-next-genre">
                {genreOf(nextPrompt)}
              </p>
            </div>
            <button className="btn-primary shrink-0" onClick={go} data-testid="next-btn" autoFocus>
              Go now
              <IconArrow size={18} />
            </button>
          </div>
          <div className="h-[3px] bg-white/5" aria-hidden>
            <div className="h-full bg-bio-400" style={{ width: `${Math.min(100, (elapsed / AUTO_ADVANCE_MS) * 100)}%`, transition: 'width 100ms linear' }} />
          </div>
        </div>
      ) : (
        <button className="btn-primary mt-6 w-full" onClick={onContinue} data-testid="next-btn" autoFocus>
          Guess the photograph
          <IconArrow size={18} />
        </button>
      )}
    </section>
  );
}

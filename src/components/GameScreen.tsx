import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { AnswerEntry, Prompt, RoundState, TierId } from '@/lib/types';
import { canGuess, currentRoundIndex, lastDoneIndex, remainingMs } from '@/lib/game';
import { MAX_POINTS, ROUND_MS, ROUND_SECONDS, ROUNDS_PER_DAY, TIERS, developedFor, guessWorth, tierById, tierFor } from '@/lib/scoring';
import { GuessSheet } from './GuessSheet';
import { ShareLine } from './Crowd';
import { prettyDate } from '@/lib/dates';
import { useCountUp } from '@/hooks/useCountUp';
import { Chamber } from './Chamber';
import { TierChip, TierDot } from './TierChip';
import { IconArrow, IconCheck, IconClose, IconSearch } from './Icons';
import { useSettings } from '@/hooks/useSettings';
import { keySoundFor } from '@/lib/sfx';

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
  if (!m) return ['', keepTogether(text)];
  return [m[1].trim(), keepTogether(m[2].charAt(0).toUpperCase() + m[2].slice(1))];
}

/**
 * Small words ("a", "an", "the", "of", "in"...) never end a line on their own: each is joined to the word after it
 * with a non-breaking space, so a heading wraps as "…wearing / a mask", never "…wearing a / mask".
 */
export function keepTogether(text: string): string {
  return text.replace(/(^|\s)(a|an|the|of|in|on|to|for|with|by|or|and|is|it|its|from|at)\s+/gi, (_m, sp, w) => `${sp}${w}\u00a0`);
}

export function GameScreen({ api, holding, onFinished, onContinue, compact = false }: Props) {
  const { daily, game } = api;
  if (!daily || !game) return null;
  const idx = currentRoundIndex(game);
  const active = idx >= 0 && game.rounds[idx].status === 'active' ? game.rounds[idx] : null;
  const lastIdx = lastDoneIndex(game);
  const developed = developedFor(game.points);
  const [guessing, setGuessing] = useState(false);
  const tappable = canGuess(game) && game.status !== 'done' && !holding;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-clip px-4 pb-6 sm:px-5 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:pb-12" data-testid="game">
      <section className={`mx-auto w-full max-w-xl ${compact ? 'hidden' : ''} lg:max-w-none`} data-testid="hud">
        <Chamber
          image={daily.image}
          developed={developed}
          transitionName="chamber"
          revealed={!!game.guess?.correct}
          tag={game.guess?.correct ? `Named · ${daily.image.answer}` : `${developed}% developed`}
          onTap={tappable ? () => setGuessing(true) : undefined}
          tapLabel={tappable ? `Tap to guess · +${guessWorth(game.misses?.length ?? 0)}` : undefined}
        />
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
        {game.guess?.early ? <EarlyGuessNote api={api} /> : game.misses?.length ? <MissNote api={api} /> : null}
        {guessing && <GuessSheet api={api} onClose={() => setGuessing(false)} />}
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

/** Swipe the current card away, then run `fn` (which brings in the next card, swiping in from the right). */
function useSwipeAway(): [boolean, (fn: () => void) => void] {
  const [leaving, setLeaving] = useState(false);
  const go = (fn: () => void) => {
    if (leaving) return;
    const reduced = document.documentElement.dataset.motion === 'reduced' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return fn();
    setLeaving(true);
    window.setTimeout(fn, 210);
  };
  return [leaving, go];
}

/** Under the photograph once the guess is settled early. */
function EarlyGuessNote({ api }: { api: ObscuraApi }) {
  const g = api.game!.guess!;
  return (
    <p className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed ${g.correct ? 'border-bio-400/30 bg-bio-400/5 text-bio-300' : 'border-white/12 bg-white/[0.03] text-mist-300'}`} data-testid="early-note">
      {g.correct ? <IconCheck size={14} className="mt-0.5 shrink-0" /> : <IconClose size={13} className="mt-0.5 shrink-0" />}
      {g.correct ? `Named at ${g.developed}% developed: +${g.bonus}. Every answer still scores.` : `Out of guesses for today. Every answer still scores.`}
    </p>
  );
}

/** Under the photograph after a wrong guess, while guesses are left. */
function MissNote({ api }: { api: ObscuraApi }) {
  const n = api.game!.misses!.length;
  return (
    <p className="mt-3 rounded-md border border-white/12 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-mist-300" data-testid="miss-note">
      {n} wrong {n === 1 ? 'guess' : 'guesses'} so far. A right guess is now worth +{guessWorth(n)}.
    </p>
  );
}

function Intro({ api }: { api: ObscuraApi }) {
  const [leaving, swipe] = useSwipeAway();
  return (
    <section className={leaving ? 'swipe-out' : 'animate-rise'} data-testid="intro">
      <p className="eyebrow">Today’s chamber is dark</p>
      <h1 className="mt-2 font-display text-[2.4rem] leading-[1.02] text-mist-100 sm:text-5xl">
        {ROUNDS_PER_DAY} prompts. {ROUND_SECONDS} seconds each.
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-mist-300">
        Name anything that fits, like <em>“a cheese”</em> or <em>“a bird”</em>. Every answer lets light into the chamber, and the rarer it is, the more light gets in. Tap the photograph to guess what it is at any time. A right guess is worth 100 points, and every wrong guess takes 20 off.
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
      <button className="btn-primary mt-6 w-full" onClick={() => swipe(api.start)} data-testid="start-btn">
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
    <section className="swipe-in" data-testid="round">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow" data-testid="round-label">
          Prompt {index + 1} of {ROUNDS_PER_DAY}
        </p>
        {compact && <Segments api={api} index={index} className="w-28" />}
      </div>
      <div className={compact ? 'mt-1' : 'mt-3'} data-testid="prompt-text" aria-label={prompt.text}>
        {lead && <p className="text-sm text-mist-500">{lead}</p>}
        <h1 className={`prompt-heading font-display leading-[1.02] text-mist-100 ${compact ? 'text-3xl' : 'text-[2.6rem] sm:text-5xl'}`}>{subject}</h1>
      </div>

      {index === 0 && api.stats.played === 0 && !compact && (
        <p className="mt-2 text-xs text-bio-300" data-testid="first-hint">
          Type anything that fits. The rarer it is, the more of the photograph you’ll see.
        </p>
      )}

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
      setMsg({ text: outcome.expired ? 'Time’s up.' : 'Not quite right!', near: outcome.near });
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
            const k = keySoundFor(text, e.target.value);
            if (k !== null) play('key', k);
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
  const [leaving, swipe] = useSwipeAway();
  const rarer = rarerThan(prompt, answered ? round.tier! : null);
  useEffect(() => {
    if (after <= before) return;
    const id = window.setTimeout(() => play('ascent'), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const goNext = () => {
    if (done) return onContinue();
    swipe(api.start);
  };

  return (
    <section className={leaving ? 'swipe-out' : 'animate-pop'} data-testid="reveal">
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
          {!daily!.endless && <ShareLine api={api} promptId={prompt.id} answer={round.answer ?? null} onDay={!daily!.archive} />}
        </>
      ) : (
        <>
          <h2 className="mt-2 font-display text-[2.6rem] leading-none text-mist-100" data-testid="reveal-answer">
            {round.end === 'timeout' ? 'Time’s up' : 'Skipped'}
          </h2>
          <p className="mt-3 text-sm text-mist-300">No light this round.</p>
        </>
      )}

      <RarerLine rarer={rarer} answered={!!answered} answeredTop={!!answered && round.tier === 'mythic'} />

      <button className="btn-primary mt-6 w-full" onClick={goNext} data-testid="next-btn" autoFocus>
        {done ? (game!.guess ? 'See the results' : 'Guess the photograph') : `Start round ${next}`}
        <IconArrow size={18} />
      </button>
    </section>
  );
}


/**
 * After each round, a taste of what scored more: the best-known answer from the next tier up (the "I knew that!"
 * one) and, if that isn't already the top, one of the 100-point answers. Shown once the round is over, so it
 * gives nothing away.
 */
function rarerThan(prompt: Prompt, tier: TierId | null): AnswerEntry[] {
  const order = TIERS.map((t) => t.id);
  const at = tier ? order.indexOf(tier) : -1;
  if (at === order.length - 1) return [];
  const inTier = (id: TierId) => prompt.entries.filter((e) => tierFor(e.score).id === id).sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const out: AnswerEntry[] = [];
  const nextUp = inTier(order[Math.max(0, at + 1)]);
  if (nextUp.length) out.push(nextUp[0]);
  const top = inTier(order[order.length - 1]);
  if (top.length && !out.some((e) => e.name === top[0].name)) out.push(top[0]);
  return out;
}

function RarerLine({ rarer, answered, answeredTop }: { rarer: AnswerEntry[]; answered: boolean; answeredTop: boolean }) {
  if (answeredTop) return <p className="mt-2 text-xs text-bio-300" data-testid="rarer-line">Top marks. Nothing scores higher.</p>;
  if (!rarer.length) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mist-500" data-testid="rarer-line">
      <span>{answered ? 'Rarer:' : 'You could have said:'}</span>
      {rarer.map((e) => {
        const t = tierFor(e.score);
        return (
          <span key={e.name} className="flex items-center gap-1 text-mist-100">
            <TierDot id={t.id} size={7} />
            {e.name}
            <span className="font-mono text-mist-500">{t.points}</span>
          </span>
        );
      })}
    </p>
  );
}

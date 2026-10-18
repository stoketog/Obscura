import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { RoundState } from '@/lib/types';
import { currentRoundIndex, lastDoneIndex, remainingMs } from '@/lib/game';
import { MAX_POINTS, MISS_PENALTY_MS, ROUND_MS, ROUND_SECONDS, ROUNDS_PER_DAY, TIERS, stageIndexFor, tierById } from '@/lib/scoring';
import { prettyDate } from '@/lib/dates';
import { STAGES } from '@/data/stages';
import { useCountUp } from '@/hooks/useCountUp';
import { Creature } from './Creature';
import { Chamber } from './Chamber';
import { GrowthBar } from './GrowthBar';
import { TierChip } from './TierChip';
import { IconArrow } from './Icons';

interface Props {
  api: ObscuraApi;
  /** The day just ended: keep the last reveal on screen until the player continues. */
  holding: boolean;
  onFinished: () => void;
  onContinue: () => void;
}

export function GameScreen({ api, holding, onFinished, onContinue }: Props) {
  const { daily, game } = api;
  if (!daily || !game) return null;
  const idx = currentRoundIndex(game);
  const active = idx >= 0 && game.rounds[idx].status === 'active' ? game.rounds[idx] : null;
  const lastIdx = lastDoneIndex(game);
  const stage = stageIndexFor(game.points);

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-1 sm:px-5 lg:grid lg:grid-cols-[19rem_1fr] lg:gap-8" data-testid="game">
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <div className="mb-3 flex items-end justify-between lg:mb-5">
          <div>
            <p className="eyebrow !text-bio-400" data-testid="puzzle-number">
              Obscura #{String(daily.number).padStart(3, '0')}
            </p>
            <p className="text-xs text-mist-500">{prettyDate(daily.dateKey)}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold leading-none text-white" data-testid="day-points">
              {game.points}
            </p>
            <p className="mt-1 text-xs text-mist-500">of {MAX_POINTS} points</p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-1.5" data-testid="round-pips" aria-label={`Round ${Math.min(ROUNDS_PER_DAY, (idx < 0 ? ROUNDS_PER_DAY : idx) + 1)} of ${ROUNDS_PER_DAY}`}>
          {game.rounds.map((r, i) => (
            <RoundPip key={r.promptId} round={r} current={i === idx} />
          ))}
        </div>

        <div className="glass relative rounded-3xl p-4">
          <div className="hidden lg:block">
            <Chamber stage={stage} size={260} />
            <div className="mt-3" />
          </div>
          <div className="flex items-center gap-4 lg:block">
            <div key={stage} className="animate-pop grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-2xl bg-white/5 lg:hidden" data-testid="mini-creature">
              <Creature stage={stage} size={60} title={STAGES[stage].name} />
            </div>
            <div className="min-w-0 flex-1">
              <GrowthBar points={game.points} compact />
            </div>
          </div>
        </div>
      </aside>

      <div className="mt-4 space-y-4 lg:mt-0">
        {active ? (
          <ActivePrompt key={active.promptId} api={api} round={active} index={idx} onFinished={onFinished} />
        ) : lastIdx >= 0 ? (
          <Reveal key={lastIdx} api={api} index={lastIdx} done={holding || game.status === 'done'} onContinue={onContinue} />
        ) : (
          <Intro api={api} />
        )}
      </div>
    </main>
  );
}

function RoundPip({ round, current }: { round: RoundState; current: boolean }) {
  const t = round.tier ? tierById(round.tier) : null;
  const done = round.status === 'done';
  return (
    <span
      className={`round-pip ${done ? 'done' : ''} ${current ? 'current' : ''}`}
      style={t ? { ['--th' as string]: t.hue } : undefined}
      data-state={done ? (t ? t.id : round.end) : current ? 'current' : 'pending'}
      title={t ? t.label : undefined}
    >
      {done ? (t ? t.emoji : '·') : ''}
    </span>
  );
}

/* ───────────────────────── Before the first round ───────────────────────── */

function Intro({ api }: { api: ObscuraApi }) {
  return (
    <section className="glass animate-rise rounded-3xl p-6 text-center" data-testid="intro">
      <p className="eyebrow">Today’s dive</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
        {ROUNDS_PER_DAY} prompts. {ROUND_SECONDS} seconds each.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-mist-300">
        You’ll get a prompt like <em>“Name a cheese”</em>. Type any answer that fits. The rarer the answer, the more points it earns and the further you evolve.
      </p>
      <ul className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Rarity tiers">
        {TIERS.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/4 px-3 py-2 text-left">
            <TierChip id={t.id} />
            <span className="font-mono text-sm text-white">{t.points}</span>
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-6 w-full max-w-sm" onClick={api.start} data-testid="start-btn">
        Start round 1
        <IconArrow size={18} />
      </button>
    </section>
  );
}

/* ───────────────────────── A round in progress ───────────────────────── */

function ActivePrompt({ api, round, index, onFinished }: { api: ObscuraApi; round: RoundState; index: number; onFinished: () => void }) {
  const prompt = api.daily!.prompts[index];
  const [now, setNow] = useState(() => Date.now());
  const expired = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  const left = remainingMs(round, now);
  useEffect(() => {
    if (left > 0 || expired.current) return;
    expired.current = true;
    if (api.expire()) onFinished();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const frac = left / ROUND_MS;
  const secs = Math.ceil(left / 1000);
  const tone = left <= 8000 ? 'danger' : left <= 15000 ? 'warn' : 'ok';

  return (
    <section className="glass animate-rise rounded-3xl p-5 sm:p-6" data-testid="round">
      <div className="flex items-center justify-between">
        <p className="eyebrow" data-testid="round-label">
          Round {index + 1} of {ROUNDS_PER_DAY}
        </p>
        <p className={`timer-secs ${tone}`} data-testid="timer-secs" aria-live="off">
          {secs}
          <span className="text-xs font-normal opacity-60">s</span>
        </p>
      </div>
      <div className="timer-track mt-2" role="timer" aria-label={`${secs} seconds left`}>
        <div className={`timer-fill ${tone}`} style={{ width: `${Math.max(0, frac) * 100}%` }} />
      </div>

      <h1 className="mt-6 text-center font-display text-[2.1rem] font-semibold leading-tight text-white sm:text-5xl" data-testid="prompt-text">
        {prompt.text}
      </h1>

      <AnswerBox api={api} round={round} onFinished={onFinished} />

      <div className="mt-4 flex items-center justify-between text-xs text-mist-500">
        <span>Unrecognised answers cost {MISS_PENALTY_MS / 1000}s.</span>
        <button
          className="rounded-lg px-2 py-1 text-mist-300 transition hover:bg-white/8 hover:text-white"
          onClick={() => {
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

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const send = (value: string) => {
    const { outcome, finished } = api.submit(value);
    if (outcome.kind === 'hit') {
      setText('');
      setMsg(null);
    } else if (outcome.kind === 'miss') {
      setMsg({ text: outcome.expired ? 'Time’s up.' : `Not on our list for this prompt. −${MISS_PENALTY_MS / 1000}s`, near: outcome.near });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      setText('');
    } else if (outcome.kind === 'repeat') {
      setMsg({ text: 'You already tried that one.' });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    }
    if (finished) onFinished();
    ref.current?.focus();
  };

  return (
    <form
      className="mx-auto mt-6 max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) send(text);
      }}
      data-testid="answer-form"
    >
      <div className={`relative ${shake ? 'shake' : ''}`}>
        <input
          ref={ref}
          className="input-field !pl-5"
          type="text"
          enterKeyHint="go"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type your answer…"
          aria-label="Your answer"
          maxLength={60}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMsg(null);
          }}
          data-testid="answer-input"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-bio-500 text-[#02211d] transition enabled:hover:bg-bio-400 disabled:bg-white/10 disabled:text-mist-700"
          aria-label="Submit answer"
          data-testid="answer-submit"
        >
          <IconArrow size={18} />
        </button>
      </div>

      {msg && (
        <div className="mt-3 rounded-xl border border-coral-glow/30 bg-coral-glow/10 px-4 py-3 text-sm text-[#ffc3cb]" role="alert" data-testid="answer-error">
          <p>{msg.text}</p>
          {msg.near && (
            <p className="mt-1.5 text-mist-100">
              Did you mean{' '}
              <button type="button" className="font-semibold text-bio-300 underline decoration-bio-500/40 underline-offset-2 hover:text-white" onClick={() => send(msg.near!)} data-testid="did-you-mean">
                {msg.near}
              </button>
              ?
            </p>
          )}
        </div>
      )}

      {round.misses.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Answers you tried" data-testid="misses">
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
  everyday: 'Everyone reaches for this one.',
  familiar: 'A familiar find.',
  uncommon: 'Not everyone would think of that.',
  rare: 'Rare. Few people would name it.',
  obscure: 'A deep cut. Very few would name it.',
  mythic: 'Mythic. One of the rarest answers there is.',
};

function Reveal({ api, index, done, onContinue }: { api: ObscuraApi; index: number; done: boolean; onContinue: () => void }) {
  const { daily, game } = api;
  const round = game!.rounds[index];
  const prompt = daily!.prompts[index];
  const before = stageIndexFor(game!.rounds.slice(0, index).reduce((s, r) => s + r.points, 0));
  const after = stageIndexFor(game!.rounds.slice(0, index + 1).reduce((s, r) => s + r.points, 0));
  const evolved = after > before;
  const answered = round.end === 'answered' && round.tier;
  const pts = useCountUp(round.points, 900, 250);
  const next = index + 2;

  return (
    <section className="glass animate-pop relative overflow-hidden rounded-3xl p-6 text-center" data-testid="reveal" style={answered ? ({ ['--th' as string]: tierById(round.tier!).hue } as React.CSSProperties) : undefined}>
      {answered && <div className="reveal-glow" />}
      <p className="eyebrow relative">{prompt.text}</p>
      {answered ? (
        <>
          <p className="relative mt-4 text-5xl" aria-hidden>
            {tierById(round.tier!).emoji}
          </p>
          <h2 className={`relative mt-2 break-words font-display text-4xl font-semibold sm:text-5xl ${round.tier === 'mythic' || round.tier === 'obscure' ? 'shimmer-text' : 'text-white'}`} data-testid="reveal-answer">
            {round.answer}
          </h2>
          <div className="relative mt-3 flex items-center justify-center gap-3">
            <TierChip id={round.tier!} />
            <span className="font-display text-2xl font-semibold text-amber-glow" data-testid="reveal-points">
              +{Math.round(pts)}
            </span>
          </div>
          <p className="relative mt-3 text-sm text-mist-300" data-testid="reveal-line">
            {TIER_LINE[round.tier!]}
          </p>
        </>
      ) : (
        <>
          <p className="relative mt-4 text-5xl" aria-hidden>
            {round.end === 'timeout' ? '⌛' : '⏭️'}
          </p>
          <h2 className="relative mt-2 font-display text-4xl font-semibold text-white" data-testid="reveal-answer">
            {round.end === 'timeout' ? 'Time’s up' : 'Skipped'}
          </h2>
          <p className="relative mt-3 text-sm text-mist-300">No points this round. The rarest answer is revealed when you finish the day.</p>
        </>
      )}

      {evolved && (
        <div className="relative mx-auto mt-5 flex max-w-xs items-center justify-center gap-3 rounded-2xl border border-bio-400/30 bg-bio-500/10 px-4 py-3" data-testid="reveal-evolved">
          <Creature stage={after} size={44} />
          <p className="text-left text-sm">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-widest text-bio-300">Evolved</span>
            <span className="font-display text-lg font-semibold text-white">{STAGES[after].name}</span>
          </p>
        </div>
      )}

      <button className="btn-primary relative mt-6 w-full max-w-sm" onClick={done ? onContinue : api.start} data-testid="next-btn" autoFocus>
        {done ? 'See your results' : `Start round ${next}`}
        <IconArrow size={18} />
      </button>
    </section>
  );
}

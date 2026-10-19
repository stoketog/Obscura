import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { RoundState } from '@/lib/types';
import { currentRoundIndex, lastDoneIndex, remainingMs } from '@/lib/game';
import { MAX_POINTS, ROUND_MS, ROUND_SECONDS, ROUNDS_PER_DAY, TIERS, stageIndexFor, stageProgress, tierById } from '@/lib/scoring';
import { prettyDate } from '@/lib/dates';
import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { useCountUp, useTween } from '@/hooks/useCountUp';
import { StageIcon } from './StageIcon';
import { TierChip, TierDot } from './TierChip';
import { IconArrow } from './Icons';

interface Props {
  api: ObscuraApi;
  /** The day just ended: keep the last reveal on screen until the player continues. */
  holding: boolean;
  onFinished: () => void;
  onContinue: () => void;
  /** The on-screen keyboard is up, so there is very little room. */
  compact?: boolean;
}

export function GameScreen({ api, holding, onFinished, onContinue, compact = false }: Props) {
  const { daily, game } = api;
  if (!daily || !game) return null;
  const idx = currentRoundIndex(game);
  const active = idx >= 0 && game.rounds[idx].status === 'active' ? game.rounds[idx] : null;
  const lastIdx = lastDoneIndex(game);

  return (
    <main className="flex flex-1 flex-col" data-testid="game">
      <Hud api={api} compact={compact} />
      <div className="min-h-2 flex-1" />
      <div className="mx-auto w-full max-w-xl sm:px-4 sm:pb-4">
        <div className="glass-dock rounded-t-[1.75rem] px-4 safe-pb pt-3 sm:rounded-3xl sm:px-5 sm:pb-5">
          {active ? (
            <ActivePrompt key={active.promptId} api={api} round={active} index={idx} onFinished={onFinished} compact={compact} />
          ) : lastIdx >= 0 ? (
            <Reveal key={lastIdx} api={api} index={lastIdx} done={holding || game.status === 'done'} onContinue={onContinue} />
          ) : (
            <Intro api={api} />
          )}
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────── Heads-up display ───────────────────────── */

function Hud({ api, compact }: { api: ObscuraApi; compact: boolean }) {
  const { daily, game } = api;
  const points = game!.points;
  const stage = stageIndexFor(points);
  const st = STAGES[stage];
  const next = STAGES[stage + 1];
  const alt = useTween(altitudeFor(points));
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-1 sm:px-5" data-testid="hud">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-black/30 px-3 py-2 backdrop-blur-md">
          <p className="eyebrow !text-white/80" data-testid="puzzle-number">
            Obscura #{String(daily!.number).padStart(3, '0')}
          </p>
          {!compact && <p className="text-[0.7rem] text-white/60">{prettyDate(daily!.dateKey)}</p>}
        </div>
        <div className="rounded-2xl bg-black/30 px-3 py-2 text-right backdrop-blur-md">
          <p className="font-display text-2xl font-semibold leading-none text-white" data-testid="day-points">
            {points}
          </p>
          <p className="mt-0.5 text-[0.68rem] text-white/60">of {MAX_POINTS} points</p>
        </div>
      </div>
      {!compact && (
        <div className="mx-auto mt-2 w-full max-w-xs rounded-2xl bg-black/30 px-3 py-2 backdrop-blur-md" data-testid="hud-form-card" data-stage={st.id}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white" data-testid="hud-form">
              <StageIcon stage={stage} size={20} />
              <span className="truncate">{st.name}</span>
            </span>
            <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-bio-300" data-testid="hud-altitude">
              {formatAltitude(alt)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[0.68rem] text-white/60" data-testid="hud-place">
            {st.place}
          </p>
          <div className="bar-track mt-1.5 h-1.5">
            <div className="bar-fill" style={{ width: `${next ? stageProgress(points) : 100}%` }} />
          </div>
          <p className="mt-1 text-[0.66rem] text-white/60" data-testid="hud-next">
            {next ? `${next.threshold - points} points to ${next.name}` : 'The end of the line'}
          </p>
        </div>
      )}
    </div>
  );
}

/** Seven tiny dots, one per round, coloured by how rare the answer was. */
function Pips({ api, index }: { api: ObscuraApi; index: number }) {
  const game = api.game!;
  return (
    <div className="flex items-center gap-2" data-testid="round-pips" aria-label={`Round ${Math.min(ROUNDS_PER_DAY, (index < 0 ? ROUNDS_PER_DAY : index) + 1)} of ${ROUNDS_PER_DAY}`}>
      {game.rounds.map((r, i) => (
        <RoundPip key={r.promptId} round={r} current={i === index} />
      ))}
    </div>
  );
}

function RoundPip({ round, current }: { round: RoundState; current: boolean }) {
  const t = round.tier ? tierById(round.tier) : null;
  const done = round.status === 'done';
  return (
    <span
      className={`round-pip ${done ? 'done' : ''} ${current ? 'current' : ''}`}
      style={t ? { background: t.color, boxShadow: `0 0 8px ${t.color}aa, inset 0 1px 0 rgb(255 255 255 / 0.5)` } : undefined}
      data-state={done ? (t ? t.id : round.end) : current ? 'current' : 'pending'}
      title={t ? t.label : undefined}
    />
  );
}

/* ───────────────────────── Before the first round ───────────────────────── */

function Intro({ api }: { api: ObscuraApi }) {
  return (
    <section className="animate-rise text-center" data-testid="intro">
      <Pips api={api} index={-1} />
      <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
        {ROUNDS_PER_DAY} prompts. {ROUND_SECONDS} seconds each.
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mist-300">
        You’ll get a prompt like <em>“Name a cheese”</em>. Type any answer that fits. The rarer it is, the more points you earn and the higher you rise.
      </p>
      <ul className="mx-auto mt-3 flex max-w-sm flex-wrap justify-center gap-x-3 gap-y-1.5" aria-label="Rarity colours">
        {TIERS.map((t) => (
          <li key={t.id} className="flex items-center gap-1.5 text-[0.7rem] text-mist-300">
            <TierDot id={t.id} size={9} />
            {t.label}
            <span className="font-mono text-white/80">{t.points}</span>
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-4 w-full" onClick={api.start} data-testid="start-btn">
        Start round 1
        <IconArrow size={18} />
      </button>
    </section>
  );
}

/* ───────────────────────── A round in progress ───────────────────────── */

function ActivePrompt({ api, round, index, onFinished, compact }: { api: ObscuraApi; round: RoundState; index: number; onFinished: () => void; compact: boolean }) {
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
    <section className="animate-rise" data-testid="round">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Pips api={api} index={index} />
          <p className="eyebrow !text-[0.62rem]" data-testid="round-label">
            Round {index + 1} of {ROUNDS_PER_DAY}
          </p>
        </div>
        <p className={`timer-secs ${tone}`} data-testid="timer-secs" aria-live="off">
          {secs}
          <span className="text-xs font-normal opacity-60">s</span>
        </p>
      </div>
      <div className="timer-track mt-2 !h-1.5" role="timer" aria-label={`${secs} seconds left`}>
        <div className={`timer-fill ${tone}`} style={{ width: `${Math.max(0, frac) * 100}%` }} />
      </div>

      <h1 className={`mt-3 text-center font-display font-semibold leading-tight text-white ${compact ? 'text-xl' : 'text-[1.7rem] sm:text-4xl'}`} data-testid="prompt-text">
        {prompt.text}
      </h1>

      <AnswerBox api={api} round={round} onFinished={onFinished} />

      <div className="mt-2 flex items-center justify-between text-xs text-mist-500">
        <span className={compact ? 'hidden' : ''}>Any answer in the category counts. Guess as many as you like.</span>
        <button
          className="ml-auto rounded-lg px-2 py-1 text-mist-300 transition hover:bg-white/8 hover:text-white"
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
    ref.current?.focus({ preventScroll: true });
  }, []);

  const send = (value: string) => {
    const { outcome, finished } = api.submit(value);
    if (outcome.kind === 'hit') {
      setText('');
      setMsg(null);
    } else if (outcome.kind === 'miss') {
      setMsg({ text: outcome.expired ? 'Time’s up.' : 'Not on our list for this prompt. Try another.', near: outcome.near });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      setText('');
    } else if (outcome.kind === 'repeat') {
      setMsg({ text: 'You already tried that one.' });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    }
    if (finished) onFinished();
    ref.current?.focus({ preventScroll: true });
  };

  return (
    <form
      className="mt-3"
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
        <div className="mt-2 rounded-xl border border-coral-glow/30 bg-coral-glow/10 px-3 py-2 text-sm text-[#ffc3cb]" role="alert" data-testid="answer-error">
          <p>{msg.text}</p>
          {msg.near && (
            <p className="mt-1 text-mist-100">
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
        <ul className="mt-2 flex flex-wrap justify-center gap-1.5" aria-label="Answers you tried" data-testid="misses">
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
  obscure: 'Mythic. A deep cut. Very few would name it.',
  mythic: 'Obscure. One of the rarest answers there is.',
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
  const tier = answered ? tierById(round.tier!) : null;

  return (
    <section className="animate-pop relative text-center" data-testid="reveal" style={tier ? ({ ['--tc' as string]: tier.color } as React.CSSProperties) : undefined}>
      <div className="flex items-center justify-between gap-3">
        <Pips api={api} index={-1} />
        <p className="eyebrow !text-[0.62rem]">{prompt.text}</p>
      </div>
      {tier ? (
        <>
          <h2 className={`mt-3 break-words font-display text-3xl font-semibold sm:text-4xl ${round.tier === 'mythic' || round.tier === 'obscure' ? 'shimmer-text' : 'text-white'}`} data-testid="reveal-answer">
            {round.answer}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3">
            <TierChip id={round.tier!} />
            <span className="font-display text-2xl font-semibold text-amber-glow" data-testid="reveal-points">
              +{Math.round(pts)}
            </span>
          </div>
          <p className="mt-2 text-sm text-mist-300" data-testid="reveal-line">
            {TIER_LINE[round.tier!]}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white" data-testid="reveal-answer">
            {round.end === 'timeout' ? 'Time’s up' : 'Skipped'}
          </h2>
          <p className="mt-2 text-sm text-mist-300">No points this round. The best answers are revealed when you finish the day.</p>
        </>
      )}

      {evolved && (
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-center gap-3 rounded-2xl border border-bio-400/30 bg-bio-500/10 px-4 py-2" data-testid="reveal-evolved">
          <StageIcon stage={after} size={32} />
          <p className="text-left text-sm">
            <span className="block text-[0.62rem] font-semibold uppercase tracking-widest text-bio-300">You’ve risen to</span>
            <span className="font-display text-base font-semibold text-white">{STAGES[after].name}</span>
            <span className="ml-2 text-xs text-mist-300">{STAGES[after].place}</span>
          </p>
        </div>
      )}

      <button className="btn-primary mt-4 w-full" onClick={done ? onContinue : api.start} data-testid="next-btn" autoFocus>
        {done ? 'See your results' : `Start round ${next}`}
        <IconArrow size={18} />
      </button>
    </section>
  );
}

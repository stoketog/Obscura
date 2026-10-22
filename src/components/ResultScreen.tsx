import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { AnswerEntry, Prompt, RoundState, TierId } from '@/lib/types';
import { useCountUp } from '@/hooks/useCountUp';
import { TIERS, guessBonusFor, tierFor } from '@/lib/scoring';
import { dayTotal } from '@/lib/game';
import { buildShareText, copyText } from '@/lib/share';
import { shareCardBlob } from '@/lib/shareCard';
import { formatCountdown, msUntilNextDay, prettyDate } from '@/lib/dates';
import { useSettings } from '@/hooks/useSettings';
import { keySoundFor } from '@/lib/sfx';
import { Chamber } from './Chamber';
import { Segments } from './GameScreen';
import { TierChip, TierDot } from './TierChip';
import { IconArrow, IconCheck, IconClock, IconCopy, IconShare, IconInfinity, IconClose, IconSnow, IconAward, IconCalendar, IconImage, IconSwords } from './Icons';
import { unseenBadges, type Badge } from '@/lib/badges';
import { ChallengeCompare, ChallengeSheet } from './Challenge';
import { StandingLine, TopAnswers } from './Crowd';
import { GoogleMark } from './GoogleMark';
import { logEvent } from '@/lib/online';

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

/** After the seventh prompt: one guess at the photograph, then the full results. */
export function ResultScreen({ api, onOpenStats, onOpenDarkroom }: { api: ObscuraApi; onOpenStats: () => void; onOpenDarkroom: (tab: 'prints' | 'badges') => void }) {
  const { game } = api;
  if (!api.daily || !game?.outcome) return null;
  return game.guess ? <Results api={api} onOpenStats={onOpenStats} onOpenDarkroom={onOpenDarkroom} /> : <GuessScreen api={api} />;
}

/** Badges earned that the player hasn't been told about yet, captured once when the results open. */
function useNewBadges(api: ObscuraApi): Badge[] {
  const [fresh] = useState(() => unseenBadges(api.profile));
  useEffect(() => {
    if (fresh.length) api.markBadgesSeen(fresh.map((b) => b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return fresh;
}

/* ───────────────────────── The one guess ───────────────────────── */

function GuessScreen({ api }: { api: ObscuraApi }) {
  const daily = api.daily!;
  const out = api.game!.outcome!;
  const bonus = guessBonusFor(out.developed);
  const [text, setText] = useState('');
  const [confirmPass, setConfirmPass] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { play } = useSettings();
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  const submit = (value: string) => {
    const g = api.guess(value);
    if (g) play(g.correct ? 'finish' : 'miss');
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8 sm:px-5 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:pb-12" data-testid="guess-screen">
      <section className="mx-auto w-full max-w-xl lg:max-w-none">
        <Chamber image={daily.image} developed={out.developed} transitionName="chamber" />
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-6xl leading-none text-bio-400" data-testid="guess-developed">
              {out.developed}%
            </span>
            <span className="text-sm text-mist-500">developed</span>
          </p>
          <span className="font-mono text-sm text-mist-500" data-testid="guess-points">
            {out.points} / 700
          </span>
        </div>
        <Segments api={api} index={-1} className="mt-3" />
      </section>

      <section className="mx-auto mt-6 w-full max-w-xl animate-rise lg:mt-0">
        <p className="eyebrow">One guess</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] text-mist-100 sm:text-5xl">What’s in the photograph?</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">A place, a person or a thing. Name it. Spelling doesn’t need to be perfect, but you only get one try.</p>
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) submit(text);
          }}
          data-testid="guess-form"
        >
          <label htmlFor="guess" className="mb-1.5 block text-xs text-mist-500">
            Your guess
          </label>
          <input
            id="guess"
            ref={ref}
            className="input-field !pr-4"
            type="text"
            enterKeyHint="go"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Type what you see"
            maxLength={80}
            value={text}
            onChange={(e) => {
              const k = keySoundFor(text, e.target.value);
              if (k !== null) play('key', k);
              setText(e.target.value);
            }}
            data-testid="guess-input"
          />
          <button type="submit" className="btn-primary mt-3 w-full" disabled={!text.trim()} data-testid="guess-submit">
            Submit guess for +{bonus}
          </button>
        </form>

        {confirmPass ? (
          <div className="panel mt-3 flex items-center justify-between gap-3 px-3 py-2.5 text-sm" data-testid="pass-confirm">
            <span className="text-mist-300">Reveal it without a guess?</span>
            <span className="flex gap-2">
              <button className="btn-ghost !min-h-10" onClick={() => setConfirmPass(false)}>
                Keep guessing
              </button>
              <button className="btn-ghost !min-h-10" onClick={() => submit('')} data-testid="pass-yes">
                Reveal
              </button>
            </span>
          </div>
        ) : (
          <button className="mt-3 w-full rounded-md py-2 text-sm text-mist-500 hover:text-mist-100" onClick={() => setConfirmPass(true)} data-testid="guess-pass">
            I don’t know, show me
          </button>
        )}

        <div className="panel mt-5 flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm text-mist-300">The less you can see, the more it’s worth</span>
          <span className="shrink-0 font-mono text-xs text-mist-100">25% → +80</span>
        </div>
      </section>
    </main>
  );
}

/* ───────────────────────── The reveal and every answer ───────────────────────── */

function Results({ api, onOpenStats, onOpenDarkroom }: { api: ObscuraApi; onOpenStats: () => void; onOpenDarkroom: (tab: 'prints' | 'badges') => void }) {
  const newBadges = useNewBadges(api);
  const [challenge, setChallenge] = useState(false);
  const { daily: d, game: g, streak, markCelebrated } = api;
  const daily = d!;
  const game = g!;
  const out = game.outcome!;
  const guess = game.guess!;
  const fresh = useRef(!game.celebrated).current;
  const total = useCountUp(dayTotal(game), fresh ? 1300 : 0, fresh ? 500 : 0);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const now = useNow();
  useEffect(() => {
    if (fresh) markCelebrated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const host = typeof window !== 'undefined' ? window.location.host : '';
  const shareText = useMemo(() => buildShareText(game, daily, streak, host), [game, daily, streak, host]);
  const flash = (m: string) => {
    setNote(m);
    window.setTimeout(() => setNote(null), 2400);
  };

  const onCopy = async () => {
    logEvent('share_text', daily.dateKey);
    await onCopyText();
  };
  const onCopyText = async () => flash((await copyText(shareText)) ? 'Result copied' : 'Couldn’t copy. Select the text and copy it.');
  const onShareCard = async () => {
    logEvent('share_card', daily.dateKey);
    setBusy(true);
    try {
      const blob = await shareCardBlob(game, daily, host);
      if (!blob) throw new Error('no image');
      const file = new File([blob], `obscura-${daily.endless ? `dive-${daily.endless}` : daily.number}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        flash('Image saved');
      }
    } catch {
      flash('Couldn’t make the image. Copy the text instead.');
    } finally {
      setBusy(false);
    }
  };

  const verdict = !guess.text
    ? 'You passed on the guess.'
    : guess.correct
      ? `You named it at ${guess.developed}% developed${guess.early ? `, after prompt ${guess.afterRound}` : ''}.`
      : guess.early
        ? `Your early guess, “${guess.text}”, wasn’t it.`
        : `Your guess, “${guess.text}”, wasn’t it.`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 sm:px-5 lg:grid lg:grid-cols-[1fr_1.05fr] lg:gap-12" data-testid="result">
      <section className="mx-auto w-full max-w-xl lg:sticky lg:top-4 lg:max-w-none lg:self-start">
        <p className="eyebrow">{daily.endless ? `Endless · dive ${daily.endless}` : `No. ${daily.number} · ${prettyDate(daily.dateKey)}${daily.archive ? ' · archive' : ''}`}</p>
        <figure className="mt-3">
          <Chamber image={daily.image} developed={100} revealed transitionName="chamber" aspect={`${daily.image.width} / ${daily.image.height}`} className="max-h-[56dvh] lg:max-h-[62dvh]" testId="reveal-photo" />
          <figcaption className="mt-4">
            <h1 className="font-display text-[2.6rem] leading-[1.02] text-mist-100 sm:text-5xl" data-testid="reveal-name">
              {daily.image.answer}
            </h1>
            <p className={`mt-2 flex items-center gap-2 text-sm ${guess.correct ? 'text-bio-300' : 'text-mist-300'}`} data-testid="guess-verdict">
              {guess.correct ? <IconCheck size={16} /> : guess.text ? <IconClose size={14} /> : null}
              {verdict}
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-mist-300" data-testid="reveal-blurb">
              {daily.image.blurb}
            </p>
            <p className="mt-2 text-[0.72rem] text-mist-500" data-testid="photo-credit">
              Photo: {daily.image.credit.author} · {daily.image.credit.license} ·{' '}
              <a href={daily.image.credit.source} target="_blank" rel="noopener noreferrer" className="underline decoration-mist-700 underline-offset-2 hover:text-mist-100">
                Source
              </a>
            </p>
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto mt-8 w-full max-w-xl lg:mt-0">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Developed" value={`${out.developed}%`} testId="result-developed" />
          <Stat label={guess.correct ? 'Guessed it' : 'Guess'} value={guess.correct ? `+${guess.bonus}` : '—'} accent={guess.correct} testId="result-bonus" />
          <Stat label="Total" value={String(Math.round(total))} testId="result-total" />
        </div>

        {!daily.archive && !daily.endless && <StandingLine api={api} />}

        <div className="mt-4 flex flex-col gap-2">
          <button className="btn-primary w-full" onClick={onShareCard} disabled={busy} data-testid="share-card-btn">
            <IconShare size={18} />
            {busy ? 'Making the image…' : 'Share result card'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost w-full" onClick={onCopy} data-testid="copy-btn">
              <IconCopy size={16} />
              Copy as text
            </button>
            {!daily.endless && (
              <button className="btn-ghost w-full" onClick={() => setChallenge(true)} data-testid="challenge-btn">
                <IconSwords size={16} />
                Challenge a friend
              </button>
            )}
          </div>
          {challenge && <ChallengeSheet api={api} onClose={() => setChallenge(false)} />}
          <p className="h-5 text-center text-xs text-bio-300" role="status" data-testid="share-note">
            {note ?? ''}
          </p>
          <pre className="sr-only" data-testid="share-preview">
            {shareText}
          </pre>
        </div>

        {(out.freezesUsed || out.freezeEarned) && (
          <p className="mt-1 flex items-start gap-2 rounded-md border border-sky-300/25 bg-sky-300/5 px-3.5 py-2.5 text-xs leading-relaxed text-sky-200" data-testid="freeze-note">
            <IconSnow size={15} className="mt-0.5 shrink-0" />
            <span>
              {out.freezesUsed ? `${out.freezesUsed === 1 ? 'A streak freeze' : `${out.freezesUsed} streak freezes`} covered the ${out.freezesUsed === 1 ? 'day' : 'days'} you missed, so your streak lives on. ` : ''}
              {out.freezeEarned ? 'You earned a streak freeze for playing seven days. It will cover a day you miss.' : ''}
            </span>
          </p>
        )}

        {newBadges.length > 0 && (
          <button className="panel mt-3 flex w-full items-center gap-3 border-bio-400/40 px-3.5 py-3 text-left animate-rise" onClick={() => onOpenDarkroom('badges')} data-testid="new-badges">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bio-400/15 text-bio-400">
              <IconAward size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="eyebrow block !text-[0.6rem]">{newBadges.length === 1 ? 'New badge' : `${newBadges.length} new badges`}</span>
              <b className="block truncate text-sm text-mist-100">{newBadges.map((b) => b.name).join(' · ')}</b>
            </span>
            <IconArrow size={15} className="shrink-0 text-mist-500" />
          </button>
        )}

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-mist-300">
          {daily.archive ? (
            <>
              <span className="flex items-center gap-2" data-testid="archive-note">
                <IconCalendar size={17} className="text-bio-400" />
                Archive day. Your streak is safe.
              </span>
              <button className="btn-ghost !min-h-10" onClick={() => api.setView('home')} data-testid="result-home">
                Home
              </button>
            </>
          ) : daily.endless ? (
            <>
              <span className="flex items-center gap-2" data-testid="endless-note">
                <IconInfinity size={18} className="text-bio-400" />
                Practice dive. Your streak is safe.
              </span>
              <button className="btn-ghost !min-h-10" onClick={() => api.setView('home')} data-testid="result-home">
                Home
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2 font-mono text-xs" data-testid="countdown">
                <IconClock size={16} />
                Next photograph in {formatCountdown(msUntilNextDay(now))}
              </span>
              <button className="btn-ghost !min-h-10" onClick={onOpenStats} data-testid="result-stats">
                {streak > 0 ? `${streak} day streak` : 'Stats'}
                <IconArrow size={15} />
              </button>
            </>
          )}
        </div>

        {!api.account && !daily.endless && api.stats.played >= 2 && (
          <button className="panel mt-3 flex w-full items-center gap-3 px-3.5 py-3 text-left" onClick={api.signIn} data-testid="result-sign-in">
            <GoogleMark size={20} />
            <span className="min-w-0 flex-1 text-sm text-mist-300">
              <b className="block font-medium text-mist-100">Keep your {api.streak > 1 ? `${api.streak}-day streak` : 'progress'} safe</b>
              Sign in with Google to play on any device.
            </span>
            <IconArrow size={15} className="shrink-0 text-mist-500" />
          </button>
        )}

        <button className="btn-ghost mt-3 w-full" onClick={() => onOpenDarkroom('prints')} data-testid="result-darkroom">
          <IconImage size={16} />
          Hung in your Darkroom
        </button>

        <ChallengeCompare api={api} />

        <AllAnswers api={api} />
      </section>
    </main>
  );
}

function Stat({ label, value, accent = false, testId }: { label: string; value: string; accent?: boolean; testId: string }) {
  return (
    <div className="panel px-3 py-2.5">
      <p className="text-[0.7rem] text-mist-500">{label}</p>
      <p className={`mt-0.5 font-display text-[2rem] leading-none ${accent ? 'text-bio-400' : 'text-mist-100'}`} data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

/* ───────────────────────── Every answer, cascaded under each prompt ───────────────────────── */

function AllAnswers({ api }: { api: ObscuraApi }) {
  const { daily, game } = api;
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  return (
    <div className="mt-8" data-testid="all-answers">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[1.75rem] leading-none text-mist-100">Every answer, by rarity</h2>
        <button className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist-500 hover:text-mist-100" onClick={() => setOpen(Object.values(open).filter(Boolean).length === 7 ? {} : { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true })} data-testid="toggle-all-answers">
          {Object.values(open).filter(Boolean).length === 7 ? 'Close all' : 'Open all'}
        </button>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Rarity and points">
        {[...TIERS].reverse().map((t) => (
          <li key={t.id} className="flex items-center gap-1.5 text-[0.72rem] text-mist-300">
            <TierDot id={t.id} size={8} />
            {t.label} <span className="font-mono text-mist-500">{t.points}</span>
          </li>
        ))}
      </ul>
      <ol className="mt-4 space-y-2" data-testid="breakdown">
        {daily!.prompts.map((p, i) => (
          <PromptCard key={p.id} api={api} prompt={p} round={game!.rounds[i]} index={i} open={!!open[i]} onToggle={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} />
        ))}
      </ol>
    </div>
  );
}

function PromptCard({ api, prompt, round, index, open, onToggle }: { api?: ObscuraApi; prompt: Prompt; round: RoundState; index: number; open: boolean; onToggle: () => void }) {
  const groups = useMemo(() => {
    const by = new Map<TierId, AnswerEntry[]>();
    for (const e of prompt.entries) {
      const t = tierFor(e.score).id;
      by.set(t, [...(by.get(t) ?? []), e]);
    }
    return [...TIERS].reverse().map((t) => ({ tier: t, entries: (by.get(t.id) ?? []).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)) }));
  }, [prompt]);
  const id = `prompt-${index}`;
  return (
    <li className="panel overflow-hidden" data-testid="breakdown-row">
      <button className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left" onClick={onToggle} aria-expanded={open} aria-controls={id} data-testid="breakdown-toggle">
        <span className="w-5 font-mono text-xs text-mist-500">{String(index + 1).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-mist-500">{prompt.text}</span>
          <span className="block truncate text-base font-medium text-mist-100" data-testid="breakdown-answer">
            {round.answer ?? (round.end === 'timeout' ? 'Time ran out' : 'Skipped')}
          </span>
        </span>
        {round.tier ? <TierChip id={round.tier} points /> : <span className="font-mono text-xs text-mist-500">+0</span>}
        <span className="w-3 text-center text-mist-500" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div id={id} className="border-t border-white/5 px-4 pb-4 pt-2" data-testid="cascade">
          {api && !api.daily?.endless && <TopAnswers api={api} promptId={prompt.id} />}
          {groups.map(({ tier, entries }) => {
            if (!entries.length) return null;
            const mine = round.tier === tier.id;
            return (
              <div key={tier.id} className={`-mx-2 mt-1 flex gap-3 rounded-md px-2 py-2 ${mine ? 'bg-bio-400/10' : ''}`} data-testid={`cascade-${tier.id}`}>
                <TierDot id={tier.id} size={8} className="mt-1.5" />
                <div className="min-w-0">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-mist-500">
                    {tier.label} · {tier.points}
                    {mine ? ' · yours' : ''} <span className="normal-case tracking-normal">({entries.length})</span>
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-mist-100">
                    {entries.map((e, k) => (
                      <span key={e.name}>
                        <span className={e.name === round.answer ? 'text-bio-300 underline decoration-bio-500/60 underline-offset-2' : ''}>{e.name}</span>
                        {k < entries.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

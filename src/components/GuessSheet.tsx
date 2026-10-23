import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { GuessAttempt } from '@/lib/game';
import { GUESS_COST, MAX_GUESSES, developedFor, guessWorth } from '@/lib/scoring';
import { useSettings } from '@/hooks/useSettings';
import { keySoundFor } from '@/lib/sfx';
import { Modal } from './Modal';
import { logEvent } from '@/lib/online';
import { IconCheck, IconClose } from './Icons';

/** Five dots: one per guess still to come, struck out as wrong guesses use them up. */
export function GuessDots({ misses }: { misses: number }) {
  return (
    <span className="flex items-center gap-1" role="img" aria-label={`${MAX_GUESSES - misses} of ${MAX_GUESSES} guesses left`} data-testid="guess-dots">
      {Array.from({ length: MAX_GUESSES }, (_, i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i < MAX_GUESSES - misses ? 'bg-bio-400' : 'bg-white/15'}`} />
      ))}
    </span>
  );
}

/**
 * The guess form, shared by the sheet that opens when the photograph is tapped and by the screen at the end of the
 * day. A right guess is worth 100, less 20 for every wrong guess before it; at 0 the guess closes.
 */
export function GuessForm({ api, onResult, submitLabel }: { api: ObscuraApi; onResult?: (g: GuessAttempt) => void; submitLabel?: (worth: number) => string }) {
  const game = api.game!;
  const misses = game.misses ?? [];
  const worth = guessWorth(misses.length);
  const [text, setText] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const { play } = useSettings();
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  const shakeIt = () => {
    const reduced = document.documentElement.dataset.motion === 'reduced' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) ref.current?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
  };

  const submit = () => {
    if (!text.trim()) return;
    const g = api.guess(text);
    if (!g) return;
    if (g.repeat) {
      setNote(`You’ve already tried “${g.text}”.`);
      shakeIt();
      return;
    }
    play(g.correct ? 'finish' : 'miss');
    logEvent('guess_early', api.daily?.dateKey ?? null, { early: !!g.early, correct: g.correct, developed: g.developed, afterRound: g.afterRound, misses: g.misses?.length ?? 0 });
    if (!g.correct && g.left > 0) {
      setNote(`Not quite right! A right guess is now worth +${guessWorth(MAX_GUESSES - g.left)}.`);
      shakeIt();
      setText('');
      ref.current?.focus({ preventScroll: true });
    }
    onResult?.(g);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      data-testid="guess-form"
    >
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-mist-500">
        <label htmlFor="guess">Your guess</label>
        <span className="flex items-center gap-2">
          <GuessDots misses={misses.length} />
          <span data-testid="guesses-left">{MAX_GUESSES - misses.length} left</span>
        </span>
      </div>
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
          setNote(null);
        }}
        aria-label="Your guess"
        data-testid="guess-input"
      />
      {note && (
        <p className="mt-2 text-sm text-mist-300" role="status" data-testid="guess-note">
          {note}
        </p>
      )}
      {misses.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5" aria-label="Wrong guesses so far" data-testid="guess-misses">
          {misses.map((m, i) => (
            <span key={i} className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-mist-500 line-through">
              {m}
            </span>
          ))}
        </p>
      )}
      <button type="submit" className="btn-primary mt-3 w-full" disabled={!text.trim()} data-testid="guess-submit">
        {submitLabel ? submitLabel(worth) : `Guess for +${worth}`}
      </button>
    </form>
  );
}

/** Opens when the photograph is tapped during the day. */
export function GuessSheet({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const game = api.game!;
  const developed = developedFor(game.points);
  const [result, setResult] = useState<GuessAttempt | null>(null);
  const settled = result && (result.correct || result.left === 0);
  const worth = guessWorth(game.misses?.length ?? 0);

  return (
    <Modal title="Guess the photograph" onClose={onClose} testId="guess-sheet">
      {settled ? (
        <div data-testid="early-result" data-correct={result.correct}>
          <p className={`flex items-center gap-2 font-display text-4xl leading-none ${result.correct ? 'text-bio-400' : 'text-mist-100'}`}>
            {result.correct ? <IconCheck size={30} /> : <IconClose size={26} />}
            {result.correct ? `+${result.bonus}` : 'Out of guesses'}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            {result.correct
              ? `It’s ${api.daily!.image.answer}, named at ${result.developed}% developed. Keep going: every answer still scores.`
              : `That was your last guess, so it’s worth nothing today. Keep going: every answer still scores.`}
          </p>
          <button className="btn-primary mt-5 w-full" onClick={onClose} data-testid="early-continue">
            Keep playing
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-mist-300">
            The photograph is <b className="text-mist-100">{developed}% developed</b>. A right guess is worth <b className="text-bio-400" data-testid="early-bonus">+{worth}</b>; each wrong one takes {GUESS_COST} off.
          </p>
          <div className="mt-4">
            <GuessForm api={api} onResult={setResult} />
          </div>
          <button type="button" className="btn-ghost mt-2 w-full" onClick={onClose} data-testid="early-not-yet">
            Not yet
          </button>
        </>
      )}
    </Modal>
  );
}

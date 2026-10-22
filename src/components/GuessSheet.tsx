import { useEffect, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { GuessRecord } from '@/lib/types';
import { developedFor, guessBonusFor } from '@/lib/scoring';
import { useSettings } from '@/hooks/useSettings';
import { keySoundFor } from '@/lib/sfx';
import { Modal } from './Modal';
import { logEvent } from '@/lib/online';
import { IconCheck, IconClose } from './Icons';

/**
 * The one guess, taken early, between prompts. A right guess earns the bonus for how little is showing now; a
 * wrong one simply uses up the day's only guess (no points lost). `offer` is the version that appears on the way
 * from prompt 3 to 4 and from 5 to 6.
 */
export function GuessSheet({ api, offer = false, onClose }: { api: ObscuraApi; offer?: boolean; onClose: () => void }) {
  const game = api.game!;
  const developed = developedFor(game.points);
  const bonus = guessBonusFor(developed);
  const [text, setText] = useState('');
  const [result, setResult] = useState<GuessRecord | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const { play } = useSettings();
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  const submit = () => {
    if (!text.trim()) return;
    const g = api.guess(text);
    if (!g) return;
    play(g.correct ? 'finish' : 'miss');
    logEvent('guess_early', api.daily?.dateKey ?? null, { correct: g.correct, developed: g.developed, afterRound: g.afterRound });
    setResult(g);
  };

  return (
    <Modal title={offer ? 'Feeling lucky?' : 'Guess the photograph'} onClose={onClose} testId="guess-sheet">
      {result ? (
        <div data-testid="early-result" data-correct={result.correct}>
          <p className={`flex items-center gap-2 font-display text-4xl leading-none ${result.correct ? 'text-bio-400' : 'text-mist-100'}`}>
            {result.correct ? <IconCheck size={30} /> : <IconClose size={26} />}
            {result.correct ? `+${result.bonus}` : 'Not it'}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            {result.correct
              ? `It’s ${api.daily!.image.answer}, named at ${result.developed}% developed. Keep going: every answer still scores.`
              : `“${result.text}” isn’t it, and that was today’s only guess. Keep going: every answer still scores.`}
          </p>
          <button className="btn-primary mt-5 w-full" onClick={onClose} data-testid="early-continue">
            {offer ? 'On to the next prompt' : 'Keep playing'}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-mist-300">
            {offer ? 'Think you know what it is? ' : ''}The photograph is <b className="text-mist-100">{developed}% developed</b>. You get one guess all day.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="panel px-3 py-2.5">
              <p className="text-[0.7rem] text-mist-500">If right</p>
              <p className="font-display text-3xl leading-none text-bio-400" data-testid="early-bonus">
                +{bonus}
              </p>
              <p className="mt-1 text-[0.66rem] leading-tight text-mist-500">less the longer you wait</p>
            </div>
            <div className="panel px-3 py-2.5">
              <p className="text-[0.7rem] text-mist-500">If wrong</p>
              <p className="font-display text-3xl leading-none text-mist-100" data-testid="early-cost">
                0
              </p>
              <p className="mt-1 text-[0.66rem] leading-tight text-mist-500">and no more guesses today</p>
            </div>
          </div>
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
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
              aria-label="Your guess"
              data-testid="early-input"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="btn-ghost" onClick={onClose} data-testid="early-not-yet">
                Not yet
              </button>
              <button type="submit" className="btn-primary" disabled={!text.trim()} data-testid="early-submit">
                Guess · +{bonus}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}

import { ROUND_SECONDS, ROUNDS_PER_DAY, TIERS } from '@/lib/scoring';
import { Modal } from './Modal';
import { TierChip } from './TierChip';

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose} testId="help-modal">
      <p className="font-display text-3xl leading-tight text-mist-100">One photograph. Seven prompts. One guess.</p>
      <ul className="mt-4 space-y-4 text-sm leading-relaxed text-mist-300">
        <li>
          <b className="font-medium text-mist-100">A photograph hangs in a dark room.</b> Everyone gets the same one each day, along with the same {ROUNDS_PER_DAY} prompts, like “Name a cheese” or “Name a bird”. You have {ROUND_SECONDS} seconds for each.
        </li>
        <li>
          <b className="font-medium text-mist-100">Name anything that fits.</b> The first answer we recognise ends the prompt. Spelling doesn’t need to be perfect, and answers we don’t recognise are free: keep trying until the clock runs out.
        </li>
        <li>
          <b className="font-medium text-mist-100">Rare answers let in more light.</b> Every answer has a rarity. The rarer it is, the more points it earns and the more of the photograph develops. Seven Obscure answers develop it fully.
        </li>
        <li>
          <b className="font-medium text-mist-100">Then, one guess.</b> Name what’s in the photograph: a place, a person or a thing. A right guess earns a bonus, and the less you could see, the bigger it is (about +80 at 25% developed, +30 at 80%).
        </li>
        <li>
          <b className="font-medium text-mist-100">See every answer.</b> Afterwards the photograph is revealed, with every answer you could have given for each prompt. Come back tomorrow to keep your streak.
        </li>
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-2" aria-label="Points per rarity">
        {[...TIERS].reverse().map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-md bg-white/4 px-3 py-2">
            <TierChip id={t.id} />
            <span className="font-mono text-sm text-mist-100">{t.points}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[0.7rem] leading-relaxed text-mist-500" data-testid="answer-credits">
        Answer lists draw on{' '}
        <a href="https://wordnet.princeton.edu" target="_blank" rel="noopener noreferrer" className="underline decoration-mist-700 underline-offset-2 hover:text-mist-300">
          Princeton WordNet
        </a>
        ,{' '}
        <a href="https://github.com/f1db/f1db" target="_blank" rel="noopener noreferrer" className="underline decoration-mist-700 underline-offset-2 hover:text-mist-300">
          F1DB
        </a>{' '}
        (
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline decoration-mist-700 underline-offset-2 hover:text-mist-300">
          CC BY 4.0
        </a>
        ), openfootball and dariusk/corpora. Photographs are public domain or CC0; each is credited when it’s revealed.
      </p>
      <button className="btn-primary mt-6 w-full" onClick={onClose} data-testid="help-close">
        Got it
      </button>
    </Modal>
  );
}

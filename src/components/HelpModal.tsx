import { Modal } from './Modal';

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose} testId="help-modal">
      <p className="font-display text-xl italic text-white">There is one mystery a day. It is probably obscure.</p>
      <ul className="mt-4 space-y-4 text-sm leading-relaxed text-mist-300">
        <li>
          <b className="text-white">Follow the clues.</b> You start with one broad clue. Every guess unlocks the next, sharper one. You have 8 guesses.
        </li>
        <li>
          <b className="text-white">Think laterally.</b> Each guess is scored for how close it is: category, habitat, traits, size, family. You never need to know everything; you need to triangulate.
        </li>
        <li>
          <b className="text-white">Rarity is the reward.</b> Every answer has an Obscurity score from 1 to 100, built from public familiarity, how much has been written about it, how specific it is and how niche it is. The more obscure the answer, the more you grow.
        </li>
        <li>
          <b className="text-white">Even a miss can pay off.</b> A rare guess that’s <em>close</em> earns growth in play (the amber bar). A vague common guess like “fish” earns almost nothing.
        </li>
        <li>
          <b className="text-white">Evolve.</b> Grow from Microbe through fish, birds and mammals to the Whale, and beyond. Later forms need much more. Solve daily to keep your streak.
        </li>
      </ul>
      <button className="btn-primary mt-6 w-full" onClick={onClose} data-testid="help-close">
        Got it
      </button>
    </Modal>
  );
}

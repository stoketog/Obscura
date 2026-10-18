import { ROUND_SECONDS, ROUNDS_PER_DAY, TIERS } from '@/lib/scoring';
import { Modal } from './Modal';
import { TierChip } from './TierChip';

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose} testId="help-modal">
      <p className="font-display text-xl italic text-white">Name anything that fits. The rarer, the better.</p>
      <ul className="mt-4 space-y-4 text-sm leading-relaxed text-mist-300">
        <li>
          <b className="text-white">{ROUNDS_PER_DAY} prompts a day.</b> Everyone gets the same ones, like “Name a cheese” or “Name a bird”. You have {ROUND_SECONDS} seconds for each.
        </li>
        <li>
          <b className="text-white">Type any answer.</b> The first answer we recognise ends the round, so choose with care. Spelling doesn’t need to be perfect.
        </li>
        <li>
          <b className="text-white">Not on our list?</b> Nothing is lost: keep trying until the clock runs out. You can also skip a round for no points.
        </li>
        <li>
          <b className="text-white">Rarity is the reward.</b> Every answer has a rarity. Obvious answers barely count; answers few people would think of are worth far more.
        </li>
        <li>
          <b className="text-white">Rise.</b> Your points for the day lift you from a microbe on the sea floor, through fish, a dolphin, a walk through the city, a bird, a helicopter, a plane and a rocket, to the solar system (a perfect 700). Come back tomorrow for seven new prompts and keep your streak.
        </li>
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-2" aria-label="Points per rarity">
        {TIERS.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/4 px-3 py-2">
            <TierChip id={t.id} />
            <span className="font-mono text-sm text-white">{t.points}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6 w-full" onClick={onClose} data-testid="help-close">
        Got it
      </button>
    </Modal>
  );
}

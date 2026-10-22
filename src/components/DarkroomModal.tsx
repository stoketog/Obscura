import { useMemo, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { DailyImage, GameState } from '@/lib/types';
import { imageById } from '@/lib/daily';
import { prettyDate } from '@/lib/dates';
import { dayTotal } from '@/lib/game';
import { BADGES, earnedBadges } from '@/lib/badges';
import { Modal } from './Modal';
import { IconAward, IconBack, IconCheck, IconLock } from './Icons';

interface Print {
  game: GameState;
  image: DailyImage;
}

/** Every photograph the player has developed and seen revealed, newest first. Never shows one they haven't finished. */
export function darkroomPrints(api: ObscuraApi): Print[] {
  return Object.values(api.profile.games)
    .filter((g) => g.status === 'done' && g.guess)
    .map((g) => ({ game: g, image: imageById(g.imageId) }))
    .filter((p): p is Print => !!p.image)
    .sort((a, b) => b.game.dateKey.localeCompare(a.game.dateKey));
}

function label(g: GameState): string {
  if (g.dateKey.startsWith('endless-')) return `Endless dive ${g.dateKey.slice(8)}`;
  return `No. ${g.puzzleNumber} · ${prettyDate(g.dateKey)}${g.archive ? ' · archive' : ''}`;
}

export function DarkroomModal({ api, onClose, start = 'prints' }: { api: ObscuraApi; onClose: () => void; start?: 'prints' | 'badges' }) {
  const [tab, setTab] = useState<'prints' | 'badges'>(start);
  const [open, setOpen] = useState<Print | null>(null);
  const prints = useMemo(() => darkroomPrints(api), [api]);
  const earned = useMemo(() => new Set(earnedBadges(api.profile).map((b) => b.id)), [api.profile]);

  return (
    <Modal title="Darkroom" onClose={onClose} testId="darkroom-modal">
      {open ? (
        <div data-testid="print-detail">
          <button className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => setOpen(null)} data-testid="print-back">
            <IconBack size={15} />
            All photographs
          </button>
          <img src={open.image.src} alt={`${open.image.answer}. ${open.image.blurb}`} className="mt-4 w-full rounded-md object-cover" style={{ aspectRatio: `${open.image.width} / ${open.image.height}` }} />
          <p className="eyebrow mt-4">{label(open.game)}</p>
          <h3 className="mt-1 font-display text-4xl leading-none text-mist-100">{open.image.answer}</h3>
          <p className={`mt-2 flex items-center gap-1.5 text-sm ${open.game.guess?.correct ? 'text-bio-300' : 'text-mist-300'}`}>
            {open.game.guess?.correct && <IconCheck size={15} />}
            {open.game.guess?.correct ? `Named at ${open.game.guess.developed}% developed` : `${open.game.outcome?.developed ?? 0}% developed · not named`} · {dayTotal(open.game)} pts
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-mist-300">{open.image.blurb}</p>
          <p className="mt-2 text-[0.72rem] text-mist-500">
            Photo: {open.image.credit.author} · {open.image.credit.license} ·{' '}
            <a href={open.image.credit.source} target="_blank" rel="noopener noreferrer" className="underline decoration-mist-700 underline-offset-2">
              Source
            </a>
          </p>
        </div>
      ) : (
        <>
          <div className="seg mb-4 grid grid-cols-2" role="tablist">
            <button role="tab" aria-selected={tab === 'prints'} data-on={tab === 'prints'} onClick={() => setTab('prints')} data-testid="tab-prints">
              Photographs · {prints.length}
            </button>
            <button role="tab" aria-selected={tab === 'badges'} data-on={tab === 'badges'} onClick={() => setTab('badges')} data-testid="tab-badges">
              Badges · {earned.size}/{BADGES.length}
            </button>
          </div>

          {tab === 'prints' ? (
            prints.length ? (
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="prints">
                {prints.map((p) => (
                  <li key={p.game.dateKey}>
                    <button className="group block w-full overflow-hidden rounded-md border border-white/10 text-left" onClick={() => setOpen(p)} data-testid={`print-${p.game.dateKey}`}>
                      <span className="relative block aspect-square overflow-hidden">
                        <img src={p.image.src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        {p.game.guess?.correct && (
                          <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-bio-300">
                            <IconCheck size={13} />
                          </span>
                        )}
                      </span>
                      <span className="block px-2.5 py-2">
                        <span className="block truncate text-sm text-mist-100">{p.image.answer}</span>
                        <span className="block font-mono text-[0.66rem] text-mist-500">{p.game.guess?.correct ? `named at ${p.game.guess.developed}%` : `${p.game.outcome?.developed ?? 0}% developed`}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-mist-300" data-testid="prints-empty">
                Every photograph you develop is kept here once it’s revealed. Finish today’s to hang your first print.
              </p>
            )
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" data-testid="badges">
              {BADGES.map((b) => {
                const on = earned.has(b.id);
                return (
                  <li key={b.id} className={`panel flex items-center gap-3 px-3 py-2.5 ${on ? '' : 'opacity-55'}`} data-testid={`badge-${b.id}`} data-earned={on}>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${on ? 'bg-bio-400/15 text-bio-400' : 'bg-white/5 text-mist-500'}`}>{on ? <IconAward size={18} /> : <IconLock size={15} />}</span>
                    <span className="min-w-0">
                      <b className="block text-sm text-mist-100">{b.name}</b>
                      <span className="block text-xs text-mist-500">{b.how}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { DailyImage, GameState } from '@/lib/types';
import { imageById } from '@/lib/daily';
import { displayNumberFor, prettyDate } from '@/lib/dates';
import { dayTotal } from '@/lib/game';
import { BADGES, earnedBadges } from '@/lib/badges';
import { Modal } from './Modal';
import { IconArrow, IconAward, IconBack, IconCheck, IconLock } from './Icons';

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
  // Numbered from the relaunch (21 Oct 2026 is No. 1); earlier games show just their date.
  const n = displayNumberFor(g.dateKey);
  return `${n >= 1 ? `No. ${n} · ` : ''}${prettyDate(g.dateKey)}${g.archive ? ' · archive' : ''}`;
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
              <PrintCarousel prints={prints} onOpen={setOpen} />
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

/**
 * The prints on a turning carousel, newest at the front. Drag or swipe to spin through the days, use the arrows or
 * the keyboard, and tap the print at the front to open it (tapping one at the side turns it to the front).
 */
function PrintCarousel({ prints, onOpen }: { prints: Print[]; onOpen: (p: Print) => void }) {
  const [cur, setCur] = useState(() => Math.min(prints.length - 1, 4));
  const [drag, setDrag] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  // Opening the Darkroom spins the carousel round to the newest print.
  useEffect(() => {
    const id = window.setTimeout(() => setCur(0), 40);
    const done = window.setTimeout(() => setSpinning(false), 1000);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(done);
    };
  }, []);
  const go = (i: number) => setCur(Math.max(0, Math.min(prints.length - 1, i)));
  const width = () => (stage.current?.clientWidth ?? 360) * 0.36;
  const pos = cur + drag;
  const front = prints[cur];

  return (
    <div data-testid="prints">
      <div
        ref={stage}
        className="carousel-stage"
        tabIndex={0}
        role="listbox"
        aria-label="Your photographs, newest first"
        aria-activedescendant={`print-opt-${front.game.dateKey}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(cur + 1);
          else if (e.key === 'ArrowLeft') go(cur - 1);
          else if (e.key === 'Enter') onOpen(front);
          else return;
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          start.current = { x: e.clientX, moved: false };
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          const dx = e.clientX - start.current.x;
          if (Math.abs(dx) > 6 && !start.current.moved) {
            start.current.moved = true;
            stage.current?.setPointerCapture(e.pointerId);
          }
          if (start.current.moved) setDrag(Math.max(-cur - 0.4, Math.min(prints.length - 1 - cur + 0.4, -dx / width())));
        }}
        onPointerUp={() => {
          if (start.current?.moved) go(Math.round(cur + drag));
          start.current = null;
          setDrag(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(0);
        }}
        data-dragging={drag !== 0}
        data-spinning={spinning}
      >
        {prints.map((p, i) => {
          const d = i - pos;
          const a = Math.abs(d);
          if (a > 4) return null;
          return (
            <button
              key={p.game.dateKey}
              id={`print-opt-${p.game.dateKey}`}
              role="option"
              aria-selected={i === cur}
              tabIndex={-1}
              className="carousel-card"
              style={{
                transform: `translateX(calc(-50% + ${d * 62}%)) translateZ(${-a * 150}px) rotateY(${Math.max(-60, Math.min(60, -d * 38))}deg)`,
                zIndex: 100 - Math.round(a * 10),
                opacity: a > 3 ? 0 : 1 - a * 0.16,
                filter: `brightness(${1 - Math.min(a, 3) * 0.18})`,
              }}
              onClick={() => {
                if (start.current?.moved) return;
                if (i === cur) onOpen(p);
                else go(i);
              }}
              data-testid={`print-${p.game.dateKey}`}
            >
              <img src={p.image.src} alt="" loading="lazy" draggable={false} />
              {p.game.guess?.correct && (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-bio-300">
                  <IconCheck size={13} />
                </span>
              )}
              <span className="carousel-date">{p.game.dateKey.startsWith('endless-') ? 'Endless' : prettyDate(p.game.dateKey)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center" aria-live="polite">
        <p className="eyebrow">{label(front.game)}</p>
        <p className="mt-1 font-display text-3xl leading-none text-mist-100" data-testid="carousel-name">
          {front.image.answer}
        </p>
        <p className="mt-1.5 font-mono text-[0.7rem] text-mist-500">
          {front.game.guess?.correct ? `Named at ${front.game.guess.developed}%` : `${front.game.outcome?.developed ?? 0}% developed`} · {dayTotal(front.game)} pts
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button className="btn-ghost !min-h-10 !px-3 text-sm" onClick={() => go(cur - 1)} disabled={cur === 0} data-testid="carousel-newer">
          <IconArrow size={15} className="rotate-180" />
          Newer
        </button>
        <span className="font-mono text-xs text-mist-500" data-testid="carousel-count">
          {cur + 1} / {prints.length}
        </span>
        <button className="btn-ghost !min-h-10 !px-3 text-sm" onClick={() => go(cur + 1)} disabled={cur === prints.length - 1} data-testid="carousel-older">
          Older
          <IconArrow size={15} />
        </button>
      </div>
    </div>
  );
}

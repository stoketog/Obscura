import type { ObscuraApi } from '@/hooks/useObscura';
import { archiveDates } from '@/lib/daily';
import { parseDateKey, puzzleNumberFor } from '@/lib/dates';
import { dayTotal } from '@/lib/game';
import { ROUNDS_PER_DAY } from '@/lib/scoring';
import { Modal } from './Modal';
import { IconCheck, IconSnow } from './Icons';

/**
 * Every past day, newest first, grouped by month. Missed days can be played; finished ones reopen their result.
 * Archive play is practice: it never moves the streak, history or stats.
 */
export function ArchiveModal({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const dates = archiveDates(api.dateKey);
  const frozen = new Set(api.profile.frozenDates ?? []);
  const months = new Map<string, string[]>();
  for (const d of dates) {
    const label = parseDateKey(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    months.set(label, [...(months.get(label) ?? []), d]);
  }
  const open = (d: string) => {
    onClose();
    api.openArchive(d);
  };

  return (
    <Modal title="Archive" onClose={onClose} testId="archive-modal">
      <p className="text-sm leading-relaxed text-mist-300">Play any day you missed, or look back at one you played. Archive days don’t count towards your streak or stats.</p>
      {dates.length === 0 && <p className="mt-6 text-sm text-mist-500">Nothing here yet. Come back tomorrow.</p>}
      {[...months].map(([label, days]) => (
        <section key={label} className="mt-5">
          <p className="eyebrow mb-2">{label}</p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {days.map((d) => {
              const g = api.profile.games[d];
              const done = g?.status === 'done';
              const rounds = g?.rounds.filter((r) => r.status === 'done').length ?? 0;
              const status = done ? (g.guess ? `${dayTotal(g)} pts` : 'Guess waiting') : rounds ? `${rounds}/${ROUNDS_PER_DAY}` : frozen.has(d) ? 'Frozen' : 'Play';
              return (
                <li key={d}>
                  <button className={`btn-ghost !min-h-[3.6rem] w-full !flex-col !items-start !gap-0 !px-3 text-left ${done ? '' : '!border-bio-400/30'}`} onClick={() => open(d)} data-testid={`archive-day-${d}`}>
                    <span className="flex w-full items-center justify-between font-mono text-[0.68rem] text-mist-500">
                      No. {puzzleNumberFor(d)}
                      {done && g.guess?.correct && <IconCheck size={12} className="text-bio-400" />}
                      {!done && frozen.has(d) && <IconSnow size={12} className="text-sky-300" />}
                    </span>
                    <span className="text-sm font-medium text-mist-100">{parseDateKey(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}</span>
                    <span className={`text-[0.7rem] ${done ? 'text-mist-500' : 'text-bio-300'}`}>{status}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Modal>
  );
}

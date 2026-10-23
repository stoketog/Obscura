'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { IMAGES } from '@/data/images';
import { chamberFilter, chamberScale, matchGuess } from '@/lib/picture';
import { addDays } from '@/lib/dates';
import { getPrompts, rarestEntry } from '@/lib/prompts';
import { matchAnswer } from '@/lib/match';
import { pointsFor, tierFor } from '@/lib/scoring';
import { loadUnrecognised } from '@/lib/admin';
import { Modal } from './Modal';

type Tab = 'day' | 'test' | 'player' | 'photos';

const field = 'w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-bio-400';
const label = 'mb-1 block text-[0.65rem] font-semibold uppercase tracking-widest text-mist-500';

export default function AdminPanel({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('day');
  const { admin, dateKey } = api;

  return (
    <Modal title="Admin · developer tools" onClose={onClose} testId="admin-panel">
      <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1 text-xs font-semibold uppercase tracking-wider">
        {(['day', 'test', 'player', 'photos'] as Tab[]).map((t) => (
          <button key={t} className={`flex-1 rounded-lg px-2 py-2 ${tab === t ? 'bg-bio-400 text-[#1a120a]' : 'text-mist-300'}`} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-amber-glow/30 bg-amber-glow/5 p-3">
        <label className={label}>Date {admin.forcedDate ? '(time travel on)' : '(today)'}</label>
        <div className="flex gap-2">
          <button className="btn-ghost !min-h-9 !px-3" onClick={() => admin.setForcedDate(addDays(dateKey, -1))} data-testid="admin-prev">‹</button>
          <input type="date" className={field} value={dateKey} onChange={(e) => e.target.value && admin.setForcedDate(e.target.value === api.today ? null : e.target.value)} data-testid="admin-date" />
          <button className="btn-ghost !min-h-9 !px-3" onClick={() => admin.setForcedDate(addDays(dateKey, 1))} data-testid="admin-next">›</button>
          <button className="btn-ghost !min-h-9 !px-3" onClick={() => admin.setForcedDate(null)} data-testid="admin-today">Today</button>
        </div>
      </div>

      {tab === 'day' && api.daily && <DayTab api={api} />}
      {tab === 'test' && <TestTab api={api} />}
      {tab === 'player' && <PlayerTab api={api} onClose={onClose} />}
      {tab === 'photos' && <PhotosTab api={api} />}
    </Modal>
  );
}

/** Choose which prompt appears in each of the day's seven slots. */
function DayTab({ api }: { api: ObscuraApi }) {
  const { daily, admin, dateKey } = api;
  const all = useMemo(() => getPrompts(), []);
  const ids = daily!.prompts.map((p) => p.id);
  const overridden = !!admin.overrides[dateKey];
  const set = (slot: number, id: string) => {
    const next = [...ids];
    next[slot] = id;
    admin.setOverride(dateKey, next);
  };
  return (
    <div className="space-y-3" data-testid="admin-day">
      <p className="text-xs text-mist-500">
        Puzzle #{daily!.number}. {overridden ? 'This date has an editorial override.' : 'Using the automatic daily selection.'}
      </p>
      {ids.map((id, slot) => (
        <div key={slot}>
          <label className={label}>Round {slot + 1}</label>
          <select className={field} value={id} onChange={(e) => set(slot, e.target.value)} data-testid={`admin-slot-${slot}`}>
            {all.map((p) => (
              <option key={p.id} value={p.id} disabled={ids.includes(p.id) && p.id !== id}>
                {p.text} ({p.entries.length})
              </option>
            ))}
          </select>
        </div>
      ))}
      <button className="btn-ghost w-full" onClick={() => admin.setOverride(dateKey, null)} disabled={!overridden} data-testid="admin-clear-override">
        Clear override
      </button>
    </div>
  );
}

/** Try any answer against any prompt and see exactly how it would score. */
function TestTab({ api }: { api: ObscuraApi }) {
  const all = useMemo(() => getPrompts(), []);
  const [promptId, setPromptId] = useState(api.daily?.prompts[0]?.id ?? all[0].id);
  const [text, setText] = useState('');
  const prompt = all.find((p) => p.id === promptId)!;
  const m = text.trim() ? matchAnswer(prompt, text) : null;
  const rarest = rarestEntry(prompt);
  const logged = loadUnrecognised();
  return (
    <div className="space-y-3" data-testid="admin-test">
      <div>
        <label className={label}>Prompt</label>
        <select className={field} value={promptId} onChange={(e) => setPromptId(e.target.value)} data-testid="admin-test-prompt">
          {all.map((p) => (
            <option key={p.id} value={p.id}>
              {p.text}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Test an answer</label>
        <input className={field} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. gorgonzla" data-testid="admin-test-input" />
      </div>
      <div className="rounded-xl bg-black/30 p-3 text-sm" data-testid="admin-test-result">
        {!m && <span className="text-mist-500">Type to test.</span>}
        {m?.kind === 'hit' && (
          <p>
            ✓ <b className="text-white">{m.entry.name}</b>
            {m.fuzzy && <span className="text-amber-glow"> (typo-corrected)</span>} · score {m.entry.score} · {tierFor(m.entry.score).label} · {pointsFor(m.entry.score)} pts
          </p>
        )}
        {m?.kind === 'miss' && (
          <p className="text-coral-glow">
            ✗ not recognised{m.near ? <span className="text-mist-300"> · closest: {m.near.name}</span> : null}
          </p>
        )}
        {m?.kind === 'empty' && <span className="text-mist-500">Nothing to match.</span>}
      </div>
      <p className="text-xs text-mist-500">
        {prompt.entries.length} accepted answers · rarest: <span className="text-mist-300">{rarest.name}</span> ({rarest.score})
      </p>
      {logged.length > 0 && (
        <div>
          <label className={label}>Unrecognised answers logged on this device ({logged.length})</label>
          <p className="max-h-28 overflow-auto rounded-lg bg-black/30 p-2 font-mono text-[0.7rem] text-mist-300" data-testid="admin-unrecognised">
            {logged.map(([p, t]) => `${p}: ${t}`).join('\n')}
          </p>
        </div>
      )}
    </div>
  );
}

function PlayerTab({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const { admin, dateKey, stats } = api;
  return (
    <div className="space-y-3" data-testid="admin-player">
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-mist-300">
        <div className="rounded-lg bg-white/5 p-2">Streak<br /><b className="text-white">{stats.currentStreak}</b></div>
        <div className="rounded-lg bg-white/5 p-2">Played<br /><b className="text-white">{stats.played}</b></div>
        <div className="rounded-lg bg-white/5 p-2">Best day<br /><b className="text-white">{stats.bestPoints}</b></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-ghost" onClick={() => { admin.autoplay('rarest'); onClose(); }} data-testid="admin-autoplay-rarest">Play day: rarest</button>
        <button className="btn-ghost" onClick={() => { admin.autoplay('common'); onClose(); }} data-testid="admin-autoplay-common">Play day: most common</button>
      </div>
      <button className="btn-ghost w-full" onClick={() => admin.resetGame(dateKey)} data-testid="admin-reset-game">Reset this date’s game</button>
      <button className="btn-ghost w-full !border-coral-glow/40 !text-coral-glow" onClick={() => { admin.resetProfile(); onClose(); }} data-testid="admin-reset-all">Reset all progression</button>
    </div>
  );
}

/** Every photograph in the library: preview it at any stage of development, check its credit and test guesses. */
function PhotosTab({ api }: { api: ObscuraApi }) {
  const [id, setId] = useState(api.daily?.image.id ?? IMAGES[0]?.id);
  const [pct, setPct] = useState(api.game?.outcome?.developed ?? 30);
  const [guess, setGuess] = useState('');
  const img = IMAGES.find((i) => i.id === id) ?? IMAGES[0];
  if (!img) return <p className="text-sm text-mist-500">No photographs in the library yet.</p>;
  const ok = guess.trim() ? matchGuess(img, guess) : null;
  return (
    <div className="space-y-3" data-testid="admin-photos">
      <p className="text-xs text-mist-500">
        {IMAGES.length} photographs. Today’s is <b className="text-mist-100">{api.daily?.image.answer}</b>.
      </p>
      <select className={field} value={img.id} onChange={(e) => setId(e.target.value)} data-testid="admin-photo">
        {IMAGES.map((i) => (
          <option key={i.id} value={i.id}>
            {i.answer} ({i.kind})
          </option>
        ))}
      </select>
      <div className="projection" style={{ aspectRatio: '16 / 10' }}>
        <img src={img.src} alt={img.answer} style={{ filter: chamberFilter(pct), transform: `scale(${chamberScale(pct)})` }} />
      </div>
      <label className={label}>
        Developed: {pct}%
      </label>
      <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="range w-full" style={{ ['--fill' as string]: `${pct}%` }} data-testid="admin-photo-pct" />
      <p className="text-xs text-mist-300">{img.blurb}</p>
      <p className="text-[0.7rem] text-mist-500">
        {img.credit.author} · {img.credit.license} ·{' '}
        <a className="underline" href={img.credit.source} target="_blank" rel="noopener noreferrer">
          Commons record
        </a>
      </p>
      <p className="text-[0.7rem] text-mist-500">Accepted: {[img.answer, ...img.aliases].join(' · ')}</p>
      <input className={field} placeholder="Test a guess" value={guess} onChange={(e) => setGuess(e.target.value)} data-testid="admin-photo-guess" />
      {ok !== null && <p className={`text-sm ${ok ? 'text-bio-300' : 'err-text'}`}>{ok ? 'Accepted' : 'Not accepted'}</p>}
      {(api.game?.guess || api.game?.misses?.length) && (
        <button className="btn-ghost w-full !min-h-9" onClick={api.admin.resetGuess} data-testid="admin-reset-guess">
          Undo today’s guess
        </button>
      )}
    </div>
  );
}

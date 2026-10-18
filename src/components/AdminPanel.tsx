'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import { STAGES } from '@/data/stages';
import { addDays } from '@/lib/dates';
import { getPrompts, rarestEntry } from '@/lib/prompts';
import { matchAnswer } from '@/lib/match';
import { pointsFor, tierFor } from '@/lib/scoring';
import { loadUnrecognised } from '@/lib/admin';
import { Modal } from './Modal';
import { StageIcon } from './StageIcon';
import { useWorld } from './WorldContext';

type Tab = 'day' | 'test' | 'player' | 'gallery';

const field = 'w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-bio-400';
const label = 'mb-1 block text-[0.65rem] font-semibold uppercase tracking-widest text-mist-500';

export default function AdminPanel({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('day');
  const [preview, setPreview] = useState(0);
  const { admin, dateKey } = api;
  const world = useWorld();
  const timer = useRef(0);

  // The gallery flies the real world to each stage, so the panel steps aside to let you see it.
  const show = (i: number) => {
    window.clearTimeout(timer.current);
    setPreview(i);
    world.setOverride(STAGES[i].threshold);
  };
  const ascend = () => {
    window.clearTimeout(timer.current);
    world.setOverride(STAGES[preview - 1].threshold);
    timer.current = window.setTimeout(() => world.setOverride(STAGES[preview].threshold), 900);
  };
  useEffect(() => {
    if (tab !== 'gallery') world.setOverride(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      world.setOverride(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Modal title="Admin · developer tools" onClose={onClose} testId="admin-panel" peek={tab === 'gallery'}>
      <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1 text-xs font-semibold uppercase tracking-wider">
        {(['day', 'test', 'player', 'gallery'] as Tab[]).map((t) => (
          <button key={t} className={`flex-1 rounded-lg px-2 py-2 ${tab === t ? 'bg-bio-500 text-[#02211d]' : 'text-mist-300'}`} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}>
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
      {tab === 'gallery' && (
        <div>
          <p className="mb-2 text-xs text-mist-500" data-testid="gallery-current">
            Showing <b className="text-white">{STAGES[preview].name}</b> in the live world.
          </p>
          <div className="grid grid-cols-6 gap-2">
            {STAGES.map((st, i) => (
              <button key={st.id} className={`rounded-xl p-2 text-center ${i === preview ? 'bg-bio-500/20 ring-1 ring-bio-400/60' : 'bg-white/5'}`} onClick={() => show(i)} title={`Preview ${st.name}`} data-testid={`gallery-${st.id}`}>
                <StageIcon stage={i} size={26} />
                <span className="mt-1 block truncate text-[0.58rem] text-mist-300">{st.name}</span>
              </button>
            ))}
          </div>
          <button className="btn-ghost mt-3 !min-h-9" onClick={ascend} disabled={preview === 0} data-testid="gallery-ascent">
            Preview the climb into {STAGES[preview].name}
          </button>
        </div>
      )}
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

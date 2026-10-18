'use client';

import { useMemo, useState } from 'react';
import type { ObscuraApi } from '@/hooks/useObscura';
import type { Entity } from '@/lib/types';
import { STAGES } from '@/data/stages';
import { addDays } from '@/lib/dates';
import { ALL_ENTITIES } from '@/data/lexicon';
import { findEntity, suggest } from '@/lib/lexicon';
import { evaluateGuess } from '@/lib/similarity';
import { obscurityBreakdown } from '@/lib/obscurity';
import { solveGrowth, stageIndexFor } from '@/lib/growth';
import { pickPuzzle } from '@/lib/puzzles';
import { Modal } from './Modal';
import { Creature } from './Creature';
import { EvolutionOverlay } from './EvolutionOverlay';

type Tab = 'puzzle' | 'lab' | 'player' | 'gallery';

const field = 'w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-bio-400';
const label = 'mb-1 block text-[0.65rem] font-semibold uppercase tracking-widest text-mist-500';

export default function AdminPanel({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('puzzle');
  const [evo, setEvo] = useState<[number, number] | null>(null);
  const { admin, puzzle, dateKey } = api;

  return (
    <Modal title="Admin · developer tools" onClose={onClose} testId="admin-panel">
      <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1 text-xs font-semibold uppercase tracking-wider">
        {(['puzzle', 'lab', 'player', 'gallery'] as Tab[]).map((t) => (
          <button key={t} className={`flex-1 rounded-lg px-2 py-2 ${tab === t ? 'bg-bio-500 text-[#02211d]' : 'text-mist-300'}`} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-amber-glow/30 bg-amber-glow/5 p-3">
        <label className={label}>Puzzle date {admin.forcedDate ? '(time travel on)' : '(today)'}</label>
        <div className="flex gap-2">
          <button className="btn-ghost !min-h-9 !px-3" onClick={() => admin.setForcedDate(addDays(dateKey, -1))} data-testid="admin-prev">‹</button>
          <input type="date" className={field} value={dateKey} onChange={(e) => e.target.value && admin.setForcedDate(e.target.value === api.today ? null : e.target.value)} data-testid="admin-date" />
          <button className="btn-ghost !min-h-9 !px-3" onClick={() => admin.setForcedDate(addDays(dateKey, 1))} data-testid="admin-next">›</button>
          <button className="btn-ghost !min-h-9 !px-3" onClick={() => admin.setForcedDate(null)} data-testid="admin-today">Today</button>
        </div>
      </div>

      {tab === 'puzzle' && puzzle && <PuzzleTab api={api} />}
      {tab === 'lab' && puzzle && <LabTab api={api} />}
      {tab === 'player' && <PlayerTab api={api} onClose={onClose} />}
      {tab === 'gallery' && (
        <div>
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map((s, i) => (
              <button key={s.id} className="rounded-xl bg-white/5 p-2 text-center" onClick={() => i > 0 && setEvo([i - 1, i])} title={`Preview evolution to ${s.name}`}>
                <Creature stage={i} size={64} />
                <span className="mt-1 block truncate text-[0.62rem] text-mist-300">{s.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-mist-500">Tap a creature to preview the evolution animation into it.</p>
        </div>
      )}
      {evo && <EvolutionOverlay from={evo[0]} to={evo[1]} onDone={() => setEvo(null)} />}
    </Modal>
  );
}

function PuzzleTab({ api }: { api: ObscuraApi }) {
  const { puzzle, dateKey, admin } = api;
  const existing = admin.overrides[dateKey] ?? {};
  const base = useMemo(() => pickPuzzle(dateKey), [dateKey]);
  const [answerQ, setAnswerQ] = useState('');
  const [clues, setClues] = useState<string[]>(puzzle!.clues);
  const [obsc, setObsc] = useState<number | null>(puzzle!.obscurityOverride ?? null);
  const [accepted, setAccepted] = useState(puzzle!.accepted.join(', '));
  const [answerId, setAnswerId] = useState(puzzle!.answerId);
  const [note, setNote] = useState('');
  const hits = useMemo(() => (answerQ.length > 1 ? suggest(answerQ, 5) : []), [answerQ]);
  const answer = ALL_ENTITIES.find((e) => e.id === answerId);
  const breakdown = answer ? obscurityBreakdown(answer.factors) : null;

  const save = () => {
    admin.setOverride(dateKey, {
      answerId,
      clues: clues.filter((c) => c.trim()),
      accepted: accepted.split(',').map((s) => s.trim()).filter(Boolean),
      obscurityOverride: obsc,
    });
    setNote('Saved. Reset today’s game on the Player tab to replay with the new puzzle.');
  };

  return (
    <div className="space-y-4" data-testid="admin-puzzle">
      <div className="rounded-xl bg-white/5 p-3 text-sm">
        <p className="eyebrow">Puzzle #{puzzle!.number} · {base.id}</p>
        <p className="mt-1 text-white">Answer: <b data-testid="admin-answer">{puzzle!.answer.name}</b> <span className="text-mist-500">({puzzle!.category})</span></p>
        <p className="text-mist-300">Obscurity <b data-testid="admin-obscurity">{puzzle!.obscurity}</b> · base reward {puzzle!.growthReward.toFixed(1)}% · {puzzle!.difficulty}</p>
        {existing.answerId || existing.clues || existing.obscurityOverride != null ? <p className="mt-1 text-xs text-amber-glow">Override active for this date</p> : null}
      </div>

      <div>
        <label className={label}>Answer (search the lexicon)</label>
        <input className={field} placeholder={`Currently: ${answer?.name ?? answerId}`} value={answerQ} onChange={(e) => setAnswerQ(e.target.value)} data-testid="admin-answer-search" />
        {hits.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {hits.map((h: Entity) => (
              <button key={h.id} className="chip !text-white" onClick={() => { setAnswerId(h.id); setAnswerQ(''); }} data-testid="admin-answer-pick">{h.name}</button>
            ))}
          </div>
        )}
        {answerId !== puzzle!.answerId && <p className="mt-1 text-xs text-amber-glow">Pending answer: {answer?.name}</p>}
      </div>

      <div>
        <label className={label}>Clues (broad → specific)</label>
        <div className="space-y-2">
          {clues.map((c, i) => (
            <div key={i} className="flex gap-2">
              <textarea className={`${field} min-h-[3.2rem]`} value={c} onChange={(e) => setClues(clues.map((x, j) => (j === i ? e.target.value : x)))} data-testid={`admin-clue-${i}`} />
              <button className="btn-ghost !min-h-9 !px-3" onClick={() => setClues(clues.filter((_, j) => j !== i))} aria-label="Remove clue">×</button>
            </div>
          ))}
          <button className="btn-ghost !min-h-9" onClick={() => setClues([...clues, ''])}>+ Add clue</button>
        </div>
      </div>

      <div>
        <label className={label}>Obscurity override: {obsc ?? `computed (${answer ? obscurityBreakdown(answer.factors).score : '—'})`}</label>
        <div className="flex items-center gap-3">
          <input type="range" min={1} max={100} value={obsc ?? (breakdown?.score ?? 50)} onChange={(e) => setObsc(Number(e.target.value))} className="flex-1" data-testid="admin-obscurity-slider" />
          <button className="btn-ghost !min-h-9" onClick={() => setObsc(null)}>Use computed</button>
        </div>
        {breakdown && (
          <p className="mt-1 font-mono text-[0.68rem] text-mist-500">
            familiarity-rarity {Math.round(breakdown.familiarity * 100)} · prominence-rarity {Math.round(breakdown.prominence * 100)} · specificity {Math.round(breakdown.specificity * 100)} · niche {Math.round(breakdown.niche * 100)}{breakdown.commonWordPenalty ? ' · common-word ×0.6' : ''}
          </p>
        )}
      </div>

      <div>
        <label className={label}>Accepted answers (comma separated)</label>
        <input className={field} value={accepted} onChange={(e) => setAccepted(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary !min-h-11 !px-5 !text-xs" onClick={save} data-testid="admin-save">Save override</button>
        <button className="btn-ghost" onClick={() => { admin.setOverride(dateKey, null); setNote('Override cleared.'); }} data-testid="admin-clear">Clear override</button>
        <button className="btn-ghost" onClick={() => navigator.clipboard?.writeText(JSON.stringify({ ...base, ...existing, answerId, clues, obscurityOverride: obsc ?? undefined }, null, 2))}>Copy JSON</button>
      </div>
      {note && <p className="text-xs text-bio-300" data-testid="admin-note">{note}</p>}
    </div>
  );
}

function LabTab({ api }: { api: ObscuraApi }) {
  const { puzzle, profile } = api;
  const [q, setQ] = useState('');
  const entity = findEntity(q);
  const result = entity ? evaluateGuess({ guess: entity, target: puzzle!.answer, index: 0, totalBefore: profile.totalGrowth, targetObscurity: puzzle!.obscurity }) : null;
  const bd = entity ? obscurityBreakdown(entity.factors) : null;
  return (
    <div className="space-y-3" data-testid="admin-lab">
      <p className="text-xs text-mist-500">Type any lexicon entry to see how it would score against today’s answer. Nothing is recorded.</p>
      <input className={field} placeholder="e.g. viperfish" value={q} onChange={(e) => setQ(e.target.value)} data-testid="admin-lab-input" />
      {q && !entity && <p className="text-xs text-coral-glow">Not in the lexicon.</p>}
      {result && bd && (
        <div className="rounded-xl bg-white/5 p-3 text-sm" data-testid="admin-lab-result">
          <p className="text-white"><b>{result.name}</b> → {result.similarity}% · {result.warmthLabel}</p>
          <p className="text-mist-300">Obscurity {result.obscurity} ({result.obscurityLabel}) · in-play growth +{result.provisionalGrowth.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-mist-500">{result.rows.map((r) => `${r.label}: ${r.text}`).join(' · ')}</p>
          {result.correct && <p className="mt-2 text-xs text-bio-300">Solve growth by guess #: {[1, 2, 4, 6, 8].map((n) => `${n}→+${solveGrowth({ obscurity: puzzle!.obscurity, guessesUsed: n, totalBefore: profile.totalGrowth, rewardOverride: puzzle!.growthReward })}`).join('  ')}</p>}
        </div>
      )}
    </div>
  );
}

function PlayerTab({ api, onClose }: { api: ObscuraApi; onClose: () => void }) {
  const { admin, profile, dateKey } = api;
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-4" data-testid="admin-player">
      <div className="rounded-xl bg-white/5 p-3 text-sm text-mist-300">
        Growth <b className="text-white" data-testid="admin-growth">{profile.totalGrowth.toFixed(1)}</b> · {STAGES[stageIndexFor(profile.totalGrowth)].name} · streak {profile.currentStreak} (best {profile.longestStreak})
      </div>
      <div>
        <label className={label}>Set total growth</label>
        <input type="range" min={0} max={100} step={0.5} value={profile.totalGrowth} onChange={(e) => admin.setGrowth(Number(e.target.value))} className="w-full" data-testid="admin-growth-slider" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => { admin.resetGame(dateKey); onClose(); }} data-testid="admin-reset-game">Reset this date’s game</button>
        {!confirm ? (
          <button className="btn-ghost !border-coral-glow/40 !text-coral-glow" onClick={() => setConfirm(true)} data-testid="admin-reset-all">Reset ALL progression…</button>
        ) : (
          <button className="btn-ghost !border-coral-glow !bg-coral-glow/20 !text-white" onClick={() => { admin.resetProfile(); setConfirm(false); onClose(); }} data-testid="admin-reset-confirm">Really reset everything</button>
        )}
      </div>
    </div>
  );
}

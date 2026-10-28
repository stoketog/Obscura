import type { AnswerEntry, Prompt, PromptSeed } from './types';

/** Parse the compact authoring strings (`Name|score|alias;alias`) into entries. */
export function parseAnswer(raw: string): AnswerEntry {
  const [name, score, aliases] = raw.split('|');
  const n = Number(score);
  if (!name || !Number.isFinite(n)) throw new Error(`Bad answer entry: "${raw}"`);
  return {
    name: name.trim(),
    score: Math.min(100, Math.max(1, Math.round(n))),
    aliases: aliases ? aliases.split(';').map((a) => a.trim()).filter(Boolean) : [],
  };
}

const withFact = (e: AnswerEntry, facts?: Record<string, string>): AnswerEntry => (facts?.[e.name] ? { ...e, fact: facts[e.name] } : e);

export function parsePrompt(seed: PromptSeed): Prompt {
  return { id: seed.id, group: seed.group, text: seed.text, category: seed.category, entries: seed.answers.map((a) => withFact(parseAnswer(a), seed.facts)), ...(seed.editorial ? { editorial: true } : {}), ...(seed.closed ? { closed: true } : {}), ...(seed.rejects?.length ? { rejects: seed.rejects } : {}) };
}

/** The rarest accepted answer, revealed once a day is finished. */
export function rarestEntry(prompt: Prompt): AnswerEntry {
  return prompt.entries.reduce((best, e) => (e.score > best.score ? e : best), prompt.entries[0]);
}

/**
 * The highest-scoring accepted answers, best first (ties broken alphabetically
 * so the list is stable). Shown once a day is finished.
 */
export function bestEntries(prompt: Prompt, count = Infinity): AnswerEntry[] {
  return [...prompt.entries].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, count);
}

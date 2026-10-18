import type { Domain, Entity, FeedbackRow, GuessResult, MatchLevel, Warmth } from './types';
import { computeObscurity, obscurityLabel } from './obscurity';
import { guessGrowth } from './growth';

/**
 * GUESS EVALUATION
 * ----------------
 * Closeness is a weighted blend of how a guess relates to the target:
 *
 *   domain  (12%)  animal / person / place / …
 *   group   (22%)  fish / bird / astronomer / island …
 *   setting (20%)  habitat, region or era overlap
 *   traits  (20%)  shared distinguishing characteristics
 *   scale   ( 6%)  size / era / extent
 *   family  (20%)  close-relative cluster (only when the target has one)
 *
 * The rows shown to the player intentionally say *how well* something
 * matches ("Strong match", "Partial") without ever revealing the value.
 */

const WEIGHTS = { domain: 0.12, group: 0.22, setting: 0.2, traits: 0.2, scale: 0.06, family: 0.2 };
const LIVING: Domain[] = ['animal', 'plant', 'microbe'];

function overlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const inter = a.filter((x) => setB.has(x)).length;
  if (inter === 0) return 0;
  const union = new Set([...a, ...b]).size;
  const jaccard = inter / union;
  const coefficient = inter / Math.min(a.length, b.length);
  return (jaccard + coefficient) / 2;
}

function level(score: number, strong = 0.5): MatchLevel {
  if (score >= strong) return 'match';
  if (score > 0) return 'close';
  return 'miss';
}

const TEXT: Record<MatchLevel, string> = { match: 'Strong match', close: 'Partial match', miss: 'No overlap' };

export function scaleLabel(domain: Domain): string {
  switch (domain) {
    case 'animal':
    case 'plant':
    case 'microbe':
      return 'Size';
    case 'place':
      return 'Extent';
    case 'person':
    case 'invention':
    case 'object':
    case 'event':
      return 'Era';
    default:
      return 'Scale';
  }
}

export function warmthFor(pct: number, correct: boolean): { warmth: Warmth; label: string } {
  if (correct) return { warmth: 'correct', label: 'Found it' };
  if (pct < 20) return { warmth: 'freezing', label: 'Ice cold' };
  if (pct < 35) return { warmth: 'cold', label: 'Cold' };
  if (pct < 50) return { warmth: 'cool', label: 'Cool' };
  if (pct < 65) return { warmth: 'warm', label: 'Warm' };
  if (pct < 80) return { warmth: 'hot', label: 'Getting close' };
  if (pct < 92) return { warmth: 'hot', label: 'Very close' };
  return { warmth: 'scorching', label: 'One step away' };
}

export function similarityScore(guess: Entity, target: Entity): number {
  if (guess.id === target.id) return 100;

  const sameDomain = guess.domain === target.domain;
  const domainS = sameDomain ? 1 : LIVING.includes(guess.domain) && LIVING.includes(target.domain) ? 0.35 : 0;
  const groupS = sameDomain ? (guess.group === target.group ? 1 : 0.12) : 0;
  const settingS = overlap(guess.setting, target.setting);
  const traitsS = overlap(guess.traits, target.traits);
  const scaleS = sameDomain ? 1 - Math.abs(guess.scale - target.scale) / 4 : 0;
  const hasFamily = !!target.family;
  const familyS = hasFamily && guess.family === target.family ? 1 : 0;

  let s =
    WEIGHTS.domain * domainS +
    WEIGHTS.group * groupS +
    WEIGHTS.setting * settingS +
    WEIGHTS.traits * traitsS +
    WEIGHTS.scale * scaleS +
    (hasFamily ? WEIGHTS.family * familyS : 0);

  if (!hasFamily) s /= 1 - WEIGHTS.family;
  return Math.min(97, Math.max(0, Math.round(s * 100)));
}

export function feedbackRows(guess: Entity, target: Entity): FeedbackRow[] {
  const sameDomain = guess.domain === target.domain;
  const rows: FeedbackRow[] = [];

  const catLevel: MatchLevel = sameDomain ? (guess.group === target.group ? 'match' : 'close') : 'miss';
  rows.push({
    key: 'category',
    label: 'Category',
    level: catLevel,
    text: catLevel === 'match' ? 'Same type' : catLevel === 'close' ? 'Same field, different type' : 'Different field',
  });

  const settingLevel = level(overlap(guess.setting, target.setting), 0.4);
  rows.push({
    key: 'setting',
    label: target.domain === 'animal' || target.domain === 'plant' || target.domain === 'microbe' ? 'Habitat' : target.domain === 'place' ? 'Region' : 'Setting',
    level: settingLevel,
    text: TEXT[settingLevel],
  });

  const traitLevel = level(overlap(guess.traits, target.traits), 0.4);
  rows.push({ key: 'traits', label: 'Traits', level: traitLevel, text: TEXT[traitLevel] });

  const diff = Math.abs(guess.scale - target.scale);
  const scaleLevel: MatchLevel = !sameDomain ? 'miss' : diff === 0 ? 'match' : diff === 1 ? 'close' : 'miss';
  rows.push({
    key: 'scale',
    label: sameDomain ? scaleLabel(target.domain) : 'Scale',
    level: scaleLevel,
    text: scaleLevel === 'match' ? 'Same' : scaleLevel === 'close' ? 'Nearby' : 'Far apart',
  });

  if (target.family) {
    const famMatch = guess.family === target.family;
    rows.push({
      key: 'family',
      label: 'Family',
      level: famMatch ? 'match' : 'miss',
      text: famMatch ? 'Close relatives' : 'Not related',
    });
  }
  return rows;
}

export function evaluateGuess(opts: {
  guess: Entity;
  target: Entity;
  index: number;
  /** Player's total growth before today (for resistance in provisional growth). */
  totalBefore: number;
  /** Obscurity override for the target (admin tooling). */
  targetObscurity?: number;
}): GuessResult {
  const { guess, target, index, totalBefore } = opts;
  const correct = guess.id === target.id;
  const similarity = similarityScore(guess, target);
  const { warmth, label } = warmthFor(similarity, correct);
  const obscurity = correct && opts.targetObscurity != null ? opts.targetObscurity : computeObscurity(guess.factors);
  return {
    entityId: guess.id,
    name: guess.name,
    correct,
    similarity,
    warmth,
    warmthLabel: label,
    rows: correct ? feedbackRows(guess, target) : feedbackRows(guess, target),
    obscurity,
    obscurityLabel: obscurityLabel(obscurity),
    provisionalGrowth: correct ? 0 : guessGrowth({ guessObscurity: obscurity, similarity, totalBefore }),
    index,
  };
}

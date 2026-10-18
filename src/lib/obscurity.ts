import type { ObscurityFactors } from './types';

/**
 * THE OBSCURITY MODEL
 * -------------------
 * Obscurity is a 1–100 score for how unlikely a thing is to be known, built
 * from five separately-meaningful factors rather than one hand-picked number:
 *
 *   familiarity   (38%)  – would an ordinary person recognise it?
 *   prominence    (27%)  – how much does the world write about it? (log-scaled
 *                          Wikipedia pageviews; search/reference volume later)
 *   specificity   (20%)  – a species/person/event is more specific than a category
 *   nicheness     (15%)  – how confined it is to a specialist field or region
 *   common word   (×0.6) – if the name is an everyday word, it's easy to stumble onto
 *
 * Obscurity alone isn't enough to make a good puzzle answer. A good answer is
 * *obscure but discoverable*, so `isDiscoverable` additionally requires the
 * answer to be well-documented (several independent references).
 */

export const OBSCURITY_WEIGHTS = {
  familiarity: 0.38,
  prominence: 0.27,
  specificity: 0.2,
  niche: 0.15,
} as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** log10(thousands of pageviews/year): 5k ≈ 0.7 (very obscure), 20M ≈ 4.3 (household). */
const WIKI_LOG_MIN = 0.7;
const WIKI_LOG_MAX = 4.3;

export function prominenceRarity(wikiViewsThousands: number): number {
  const v = Math.max(1, wikiViewsThousands);
  return 1 - clamp01((Math.log10(v) - WIKI_LOG_MIN) / (WIKI_LOG_MAX - WIKI_LOG_MIN));
}

export interface ObscurityBreakdown {
  familiarity: number;
  prominence: number;
  specificity: number;
  niche: number;
  commonWordPenalty: boolean;
  score: number;
}

export function obscurityBreakdown(f: ObscurityFactors): ObscurityBreakdown {
  const familiarity = 1 - clamp01(f.familiarity / 100);
  const prominence = prominenceRarity(f.wikiViews);
  const specificity = (f.specificity - 1) / 4;
  const niche = clamp01(f.niche);
  let raw =
    OBSCURITY_WEIGHTS.familiarity * familiarity +
    OBSCURITY_WEIGHTS.prominence * prominence +
    OBSCURITY_WEIGHTS.specificity * specificity +
    OBSCURITY_WEIGHTS.niche * niche;
  if (f.commonWord) raw *= 0.6;
  const score = Math.min(100, Math.max(1, Math.round(raw * 100)));
  return { familiarity, prominence, specificity, niche, commonWordPenalty: !!f.commonWord, score };
}

export function computeObscurity(f: ObscurityFactors): number {
  return obscurityBreakdown(f).score;
}

/** "Obscure but discoverable": rare *and* well-documented enough to be fair. */
export function isDiscoverable(f: ObscurityFactors, minSources = 4): boolean {
  return f.sources >= minSources;
}

export function obscurityLabel(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 78) return 'Excellent';
  if (score >= 62) return 'Very obscure';
  if (score >= 45) return 'Obscure';
  if (score >= 28) return 'Uncommon';
  if (score >= 14) return 'Common';
  return 'Too common';
}

import type { Domain, Entity, Scale } from '@/lib/types';

/**
 * Compact entity constructor so the lexicon stays readable at hundreds of rows.
 *
 *   ent('animal')(id, name, group, setting, traits, scale, familiarity, wikiViewsK, specificity, niche, sources, opts?)
 *
 * `setting` / `traits` are comma-separated tag lists.
 * familiarity = estimated % of adults who could identify it.
 * wikiViewsK  = estimated en.wikipedia pageviews per year, in thousands.
 * All numbers are editorial estimates (see lib/obscurity.ts).
 */
export interface EntOpts {
  /** family / close-relative cluster */
  f?: string;
  aliases?: string[];
  /** name is also an everyday word */
  cw?: boolean;
}

const split = (s: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);

export const ent =
  (domain: Domain) =>
  (
    id: string,
    name: string,
    group: string,
    setting: string,
    traits: string,
    scale: Scale,
    familiarity: number,
    wikiViews: number,
    specificity: 1 | 2 | 3 | 4 | 5,
    niche: number,
    sources: number,
    opts: EntOpts = {},
  ): Entity => ({
    id,
    name,
    aliases: opts.aliases,
    domain,
    group,
    family: opts.f,
    setting: split(setting),
    traits: split(traits),
    scale,
    factors: { familiarity, wikiViews, specificity, niche, commonWord: opts.cw, sources },
  });

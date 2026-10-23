import type { PromptSeed } from '@/lib/types';
import { DAY_2026_10_23 } from './2026-10-23';
import { DAY_2026_10_24 } from './2026-10-24';

/**
 * Prompts written for a particular day. Each day's file is pinned in src/data/schedule.json; these prompts are
 * marked `editorial`, so they are never dealt at random on another day (they stay playable in the archive).
 */
export const DAYS: PromptSeed[] = [...DAY_2026_10_23, ...DAY_2026_10_24];

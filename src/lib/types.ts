/**
 * Core domain types for Obscura.
 *
 * The game is a daily "dive": seven shared prompts ("Name a cheese"). The
 * player types any answer from the category; the rarer the answer, the more
 * points it earns, and the day's points evolve their creature.
 */

/** One accepted answer to a prompt, with how obscure it is (1 = everyone says it, 100 = almost nobody). */
export interface AnswerEntry {
  name: string;
  aliases: string[];
  /** 1–100. Editorial estimate of how rarely players would think of it. */
  score: number;
}

/**
 * Authoring format. Each answer is one string: `Name|score` or `Name|score|alias;alias`.
 * Keeping the data this compact is what lets the library scale to thousands of answers.
 */
export type PromptGroup = 'general' | 'geography' | 'history' | 'sport' | 'screen' | 'music' | 'arts' | 'science' | 'food' | 'nature';

export const PROMPT_GROUPS: PromptGroup[] = ['general', 'geography', 'history', 'sport', 'screen', 'music', 'arts', 'science', 'food', 'nature'];

export interface PromptSeed {
  id: string;
  /** Topic area. The daily set draws from different groups so every day is a mix. */
  group: PromptGroup;
  /** What the player sees, e.g. "Name a cheese". */
  text: string;
  /** Short topic label shown on the result screen. */
  category: string;
  answers: string[];
}

export interface Prompt {
  id: string;
  group: PromptGroup;
  text: string;
  category: string;
  entries: AnswerEntry[];
}

export type TierId = 'everyday' | 'familiar' | 'uncommon' | 'rare' | 'obscure' | 'mythic';

export interface Tier {
  id: TierId;
  label: string;
  /** Lowest obscurity score in this tier. */
  min: number;
  points: number;
  /** The tier's colour (hex): grey → green → yellow → blue → purple → orange. */
  color: string;
  /** The matching square emoji, used in the spoiler-free share text. */
  square: string;
}

export type RoundStatus = 'pending' | 'active' | 'done';
export type RoundEnd = 'answered' | 'timeout' | 'skipped';

export interface RoundState {
  promptId: string;
  status: RoundStatus;
  /** Epoch ms when the timer started. The clock keeps running across reloads. */
  startedAt?: number;
  /** Normalised text of unrecognised answers already tried (listed to the player, never penalised). */
  misses: string[];
  end?: RoundEnd;
  /** Canonical name of the accepted answer. */
  answer?: string;
  score?: number;
  tier?: TierId;
  points: number;
}

export type GameStatus = 'playing' | 'done';

export interface GameState {
  dateKey: string;
  puzzleNumber: number;
  rounds: RoundState[];
  status: GameStatus;
  /** Sum of round points so far. */
  points: number;
  outcome?: Outcome;
  /** True once the end-of-day evolution reveal has been shown. */
  celebrated?: boolean;
}

export interface Outcome {
  points: number;
  stage: number;
  /** The form the creature had before the final round; the finale evolves from here. */
  stageBeforeFinal: number;
  streakAfter: number;
  tiers: Array<TierId | null>;
}

export interface HistoryEntry {
  dateKey: string;
  puzzleNumber: number;
  points: number;
  stage: number;
  tiers: Array<TierId | null>;
  /** Highest-scoring answer of the day. */
  best: { name: string; score: number } | null;
}

export interface PlayerProfile {
  version: 3;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  history: Record<string, HistoryEntry>;
  games: Record<string, GameState>;
  /** Set once the player has seen the how-to-play sheet. */
  seenHelp: boolean;
}

/** A day's seven prompts, resolved. */
export interface DailySet {
  dateKey: string;
  number: number;
  prompts: Prompt[];
  /** Set for an endless-mode dive (1, 2, …). Dives never touch streaks, history or stats. */
  endless?: number;
}

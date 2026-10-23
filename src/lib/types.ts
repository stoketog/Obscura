/**
 * Core domain types for Obscura.
 *
 * Every day is one dark chamber with a hidden photograph and seven shared prompts ("Name a cheese").
 * The player types any answer from the category; the rarer the answer, the more points it earns, and the
 * points let light into the chamber: the day's photograph develops from black to sharp. At the end the
 * player gets one guess at what the photograph shows, worth more the less of it they could see.
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
  /** Written for one particular day (src/data/prompts/days): shown only where the schedule pins it, never dealt at random. */
  editorial?: boolean;
  /** A short closed list (fewer than 12 possible answers, e.g. US states containing a V): checked more leniently. */
  closed?: boolean;
}

export interface Prompt {
  id: string;
  group: PromptGroup;
  text: string;
  category: string;
  entries: AnswerEntry[];
  editorial?: boolean;
  closed?: boolean;
}

export type TierId = 'everyday' | 'uncommon' | 'rare' | 'obscure' | 'mythic';

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
  /** The final guess at the photograph; absent until it is made. */
  guess?: GuessRecord;
  /** True once the end-of-day reveal has been shown. */
  celebrated?: boolean;
  /**
   * The photograph this game was played with. Saved so a past game always shows the photograph it was played with,
   * even after the library grows and the daily deal moves on.
   */
  imageId?: string;
  /** Played from the archive (a past day): never moves the streak, history or stats. */
  archive?: boolean;
}

export interface Outcome {
  points: number;
  /** 0–100: how much of the photograph the day's points developed. */
  developed: number;
  streakAfter: number;
  tiers: Array<TierId | null>;
  /** Streak freezes spent to keep the streak alive across missed days (daily games only). */
  freezesUsed?: number;
  /** True when finishing this day earned a new streak freeze. */
  freezeEarned?: boolean;
}

/** The one guess at the day's photograph. */
export interface GuessRecord {
  /** What the player typed (trimmed). Empty when they passed. */
  text: string;
  correct: boolean;
  /** How developed the photograph was when they guessed (0–100). */
  developed: number;
  /** Bonus points earned (0 when wrong or passed). */
  bonus: number;
  /** Prompts finished when the guess was made (7 = after the last one). */
  afterRound?: number;
  /** Made before the last prompt was finished. */
  early?: boolean;
}

export interface HistoryEntry {
  dateKey: string;
  puzzleNumber: number;
  /** Points from the seven prompts. */
  points: number;
  developed: number;
  tiers: Array<TierId | null>;
  /** Highest-scoring answer of the day. */
  best: { name: string; score: number } | null;
  /** Set once the final guess is made. */
  guess?: { correct: boolean; bonus: number };
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
  /** Streak freezes held (0 to MAX_FREEZES). One is earned for every seven daily puzzles finished. */
  freezes?: number;
  /** Days a freeze covered, so the calendar can show them. */
  frozenDates?: string[];
  /** Badges the player has already been told about. */
  badgesSeen?: string[];
}

/** What a daily photograph shows. Used only as a vague hint before the reveal. */
export type ImageKind = 'place' | 'object' | 'person' | 'nature' | 'artwork' | 'space';

/**
 * A daily photograph. Every image is a real photograph (or a photograph of a real artwork) that is in the
 * public domain or released under CC0, checked against its Wikimedia Commons record, so it can be used on a
 * commercial site with no conditions. The credit is still shown, as good practice.
 */
export interface DailyImage {
  id: string;
  /** The accepted answer, as shown at the reveal. */
  answer: string;
  /** Other accepted spellings and names. */
  aliases: string[];
  kind: ImageKind;
  /** One or two sentences shown at the reveal. */
  blurb: string;
  /** Path under /public. */
  src: string;
  width: number;
  height: number;
  credit: { author: string; license: string; licenseUrl?: string; source: string };
}

/** A day's seven prompts and its photograph, resolved. */
export interface DailySet {
  dateKey: string;
  number: number;
  prompts: Prompt[];
  image: DailyImage;
  /** Set for an endless-mode dive (1, 2, …). Dives never touch streaks, history or stats. */
  endless?: number;
  /** A past day replayed from the archive. Like a dive, it never touches streaks, history or stats. */
  archive?: boolean;
}

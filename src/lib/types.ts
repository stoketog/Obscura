/**
 * Core domain types for Obscura.
 *
 * Everything the game knows about a guessable thing is an `Entity` in the
 * lexicon. A `Puzzle` simply points at one entity and adds clues around it.
 * That means any guess a player makes can be scored for BOTH closeness
 * (similarity to the target) and obscurity (how rare the guess itself is).
 */

export type Domain =
  | 'animal'
  | 'plant'
  | 'microbe'
  | 'person'
  | 'place'
  | 'invention'
  | 'object'
  | 'food'
  | 'science'
  | 'event';

/** Scale is a 1–5 rating whose meaning depends on the domain (size, era, extent). */
export type Scale = 1 | 2 | 3 | 4 | 5;

/**
 * Inputs to the obscurity model. These are editorial estimates today; the
 * shape is deliberately the same as what a data pipeline (Wikipedia
 * pageviews API, search volume, survey data) would produce later.
 */
export interface ObscurityFactors {
  /** Estimated % of English-speaking adults who could identify it (0–100). */
  familiarity: number;
  /** Estimated English Wikipedia pageviews per year, in thousands. */
  wikiViews: number;
  /** Semantic specificity: 1 = whole kingdom/category … 5 = one exact species/person/event. */
  specificity: 1 | 2 | 3 | 4 | 5;
  /** 0–1: how confined it is to a specialist community or region. */
  niche: number;
  /** True if the name is also an everyday word (penalises obscurity). */
  commonWord?: boolean;
  /** Number of independent reputable references that document it (verifiability). */
  sources: number;
}

export interface Entity {
  id: string;
  name: string;
  aliases?: string[];
  domain: Domain;
  /** Sub-category within a domain: fish, bird, astronomer, island, instrument… */
  group: string;
  /** Close-relative cluster (e.g. "anglerfish", "beaked-whale", "cepheid"). */
  family?: string;
  /** Habitat / region / era tags. */
  setting: string[];
  /** Distinguishing characteristics. */
  traits: string[];
  scale: Scale;
  factors: ObscurityFactors;
}

export interface PuzzleSource {
  title: string;
  url: string;
}

export type Difficulty = 'moderate' | 'hard' | 'brutal';

export interface Puzzle {
  id: string;
  /** Optional pin: show this puzzle on exactly this date (YYYY-MM-DD). */
  date?: string;
  /** Entity id of the secret answer. */
  answerId: string;
  /** Human category label shown after the reveal. */
  category: string;
  /** Extra accepted spellings (the entity's own name/aliases are always accepted). */
  accepted: string[];
  /** 5–8 clues, broad → specific. */
  clues: string[];
  /** Semantic tags describing the puzzle (used for admin tooling and future analytics). */
  semanticTags: string[];
  difficulty: Difficulty;
  /** Shown after the puzzle is finished. */
  explanation: string;
  source: PuzzleSource;
  /** Editorial overrides. When omitted, both are computed from the entity. */
  obscurityOverride?: number;
  growthRewardOverride?: number;
}

/** A puzzle after date resolution and overrides, ready to play. */
export interface ResolvedPuzzle extends Puzzle {
  dateKey: string;
  number: number;
  answer: Entity;
  obscurity: number;
  /** Growth (percentage points) awarded for a perfect, 1-guess solve before resistance. */
  growthReward: number;
}

export type MatchLevel = 'match' | 'close' | 'miss';

export interface FeedbackRow {
  key: 'category' | 'setting' | 'traits' | 'scale' | 'family';
  label: string;
  level: MatchLevel;
  /** Short qualitative text: "Strong match", "Partial", "No overlap". */
  text: string;
}

export type Warmth = 'freezing' | 'cold' | 'cool' | 'warm' | 'hot' | 'scorching' | 'correct';

export interface GuessResult {
  entityId: string;
  name: string;
  correct: boolean;
  /** 0–100 closeness to the target. */
  similarity: number;
  warmth: Warmth;
  warmthLabel: string;
  rows: FeedbackRow[];
  /** 1–100 obscurity of the guessed thing itself. */
  obscurity: number;
  obscurityLabel: string;
  /** Provisional growth (pp) this guess is worth if it ends up being the best one. */
  provisionalGrowth: number;
  /** Index (0-based) of the guess in the game. */
  index: number;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  dateKey: string;
  puzzleNumber: number;
  guesses: GuessResult[];
  status: GameStatus;
  /** Set when finished. */
  outcome?: Outcome;
  /** True once the reveal / evolution sequence has been shown, so it never replays by accident. */
  celebrated?: boolean;
}

export interface Outcome {
  solved: boolean;
  guessesUsed: number;
  obscurity: number;
  growth: number;
  stageBefore: number;
  stageAfter: number;
  totalBefore: number;
  totalAfter: number;
  answerName: string;
  /** Streak value after this completion. */
  streakAfter: number;
}

export interface HistoryEntry extends Outcome {
  dateKey: string;
  puzzleNumber: number;
}

export interface PlayerProfile {
  version: 1;
  /** Total growth points, 0–100. Drives the evolutionary stage. */
  totalGrowth: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  history: Record<string, HistoryEntry>;
  games: Record<string, GameState>;
  /** Set once the player has seen the how-to-play sheet. */
  seenHelp: boolean;
}

/**
 * The evolutionary ladder for the first theme ("Evolution").
 *
 * Thresholds are total-growth points on a 0–100 journey. They are
 * deliberately NOT evenly spaced: the early forms arrive quickly so a new
 * player feels progress straight away, and each later form demands more.
 * Swapping this file (and the Creature art) is all a new theme needs.
 */
export interface Stage {
  id: string;
  name: string;
  /** Used in share cards; the on-screen creatures are custom SVG. */
  emoji: string;
  /** Total growth at which this stage is reached. */
  threshold: number;
  blurb: string;
}

export const STAGES: Stage[] = [
  { id: 'microbe', name: 'Microbe', emoji: '🦠', threshold: 0, blurb: 'A speck in the dark water. Everything is ahead of you.' },
  { id: 'bacterium', name: 'Bacterium', emoji: '🧫', threshold: 1, blurb: 'One cell, one purpose: divide and endure.' },
  { id: 'protozoan', name: 'Protozoan', emoji: '🫧', threshold: 3, blurb: 'Hunting by touch with a fringe of cilia.' },
  { id: 'invertebrate', name: 'Tiny Invertebrate', emoji: '🪱', threshold: 6, blurb: 'Soft, segmented and spreading through the silt.' },
  { id: 'insect', name: 'Insect', emoji: '🐞', threshold: 10, blurb: 'Armoured, six-legged and suddenly on land.' },
  { id: 'fish', name: 'Fish', emoji: '🐟', threshold: 15, blurb: 'Back to the water, now with a spine.' },
  { id: 'amphibian', name: 'Amphibian', emoji: '🐸', threshold: 22, blurb: 'Two lives: one wet, one dry.' },
  { id: 'reptile', name: 'Reptile', emoji: '🦎', threshold: 30, blurb: 'Scaled, sun-warmed and finally free of the shore.' },
  { id: 'bird', name: 'Bird', emoji: '🐦', threshold: 40, blurb: 'The sky opens up.' },
  { id: 'small-mammal', name: 'Small Mammal', emoji: '🐭', threshold: 52, blurb: 'Warm-blooded and watchful, a heartbeat in the leaf litter.' },
  { id: 'large-mammal', name: 'Large Mammal', emoji: '🐘', threshold: 65, blurb: 'The ground shakes where you walk.' },
  { id: 'marine-mammal', name: 'Marine Mammal', emoji: '🦭', threshold: 78, blurb: 'Lungs that remember the land, a body that chose the sea.' },
  { id: 'whale', name: 'Whale', emoji: '🐋', threshold: 90, blurb: 'The largest thing that has ever been alive.' },
  { id: 'mythic', name: 'Mythic Form', emoji: '✨', threshold: 100, blurb: 'Final form unknown. Nobody has seen it twice.' },
];

export const FINAL_STAGE_INDEX = STAGES.length - 1;

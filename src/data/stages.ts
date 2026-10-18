/**
 * The evolutionary ladder for the first theme ("Evolution").
 *
 * Thresholds are points scored in a single day (0–700). They are deliberately
 * NOT evenly spaced: the early forms arrive with the first answers so a new
 * player feels progress straight away, and each later form demands rarer finds.
 * Seven everyday answers (70) make a Tiny Invertebrate; reaching the Whale
 * takes a day of genuinely deep answers.
 */
export interface Stage {
  id: string;
  name: string;
  /** Used in share cards; the on-screen creatures are custom SVG. */
  emoji: string;
  /** Points scored in one day at which this stage is reached. */
  threshold: number;
  blurb: string;
}

export const STAGES: Stage[] = [
  { id: 'microbe', name: 'Microbe', emoji: '🦠', threshold: 0, blurb: 'A speck in the dark water. Everything is ahead of you.' },
  { id: 'bacterium', name: 'Bacterium', emoji: '🧫', threshold: 10, blurb: 'One cell, one purpose: divide and endure.' },
  { id: 'protozoan', name: 'Protozoan', emoji: '🫧', threshold: 30, blurb: 'Hunting by touch with a fringe of cilia.' },
  { id: 'invertebrate', name: 'Tiny Invertebrate', emoji: '🪱', threshold: 60, blurb: 'Soft, segmented and spreading through the silt.' },
  { id: 'insect', name: 'Insect', emoji: '🐞', threshold: 95, blurb: 'Armoured, six-legged and suddenly on land.' },
  { id: 'fish', name: 'Fish', emoji: '🐟', threshold: 135, blurb: 'Back to the water, now with a spine.' },
  { id: 'amphibian', name: 'Amphibian', emoji: '🐸', threshold: 180, blurb: 'Two lives: one wet, one dry.' },
  { id: 'reptile', name: 'Reptile', emoji: '🦎', threshold: 230, blurb: 'Scaled, sun-warmed and finally free of the shore.' },
  { id: 'bird', name: 'Bird', emoji: '🐦', threshold: 285, blurb: 'The sky opens up.' },
  { id: 'small-mammal', name: 'Small Mammal', emoji: '🐭', threshold: 345, blurb: 'Warm-blooded and watchful, a heartbeat in the leaf litter.' },
  { id: 'large-mammal', name: 'Large Mammal', emoji: '🐘', threshold: 410, blurb: 'The ground shakes where you walk.' },
  { id: 'marine-mammal', name: 'Marine Mammal', emoji: '🦭', threshold: 480, blurb: 'Lungs that remember the land, a body that chose the sea.' },
  { id: 'whale', name: 'Whale', emoji: '🐋', threshold: 550, blurb: 'The largest thing that has ever been alive.' },
  { id: 'mythic', name: 'Mythic Form', emoji: '✨', threshold: 620, blurb: 'Final form unknown. Nobody has seen it twice.' },
];

export const FINAL_STAGE_INDEX = STAGES.length - 1;

/**
 * The ascent: from a microbe on the sea floor up through the sea, across the
 * city, into the sky and out to the solar system.
 *
 * Thresholds are points scored in a single day (0–700). A perfect day (seven
 * 100-point answers) is the only way to reach the Solar System.
 */
export type SceneId = 'microbe' | 'jellyfish' | 'fish' | 'human' | 'bird' | 'helicopter' | 'plane' | 'rocket' | 'satellite' | 'astronaut' | 'solar';

export interface Stage {
  id: SceneId;
  name: string;
  /** Used in share cards and small icons. */
  emoji: string;
  /** Points scored in one day at which this stage is reached. */
  threshold: number;
  /** Where you are, shown in the scene's readout. */
  place: string;
  /** Accent hue for glows and chips. */
  hue: number;
  blurb: string;
  /** Height in metres relative to sea level when this stage begins (negative = underwater). */
  altitude: number;
}

export const STAGES: Stage[] = [
  { id: 'microbe', name: 'Microbe', emoji: '🦠', threshold: 0, place: 'The sea floor', hue: 175, altitude: -4000, blurb: 'A speck in the dark, four kilometres down.' },
  { id: 'jellyfish', name: 'Jellyfish', emoji: '🪼', threshold: 40, place: 'The deep ocean', hue: 300, altitude: -1500, blurb: 'Drifting upward on a pulse of light.' },
  { id: 'fish', name: 'Fish', emoji: '🐟', threshold: 80, place: 'Open water', hue: 195, altitude: -300, blurb: 'Fins, speed and a whole sea to cross.' },
  { id: 'human', name: 'Human', emoji: '🚶', threshold: 120, place: 'The city', hue: 35, altitude: 4, blurb: 'Two feet on solid ground and a street ahead.' },
  { id: 'bird', name: 'Bird', emoji: '🐦', threshold: 190, place: 'Low sky', hue: 200, altitude: 150, blurb: 'The rooftops fall away beneath you.' },
  { id: 'helicopter', name: 'Helicopter', emoji: '🚁', threshold: 280, place: 'Above the skyline', hue: 28, altitude: 1200, blurb: 'Rotors, noise and a view of everything.' },
  { id: 'plane', name: 'Jet plane', emoji: '✈️', threshold: 370, place: 'Cruising altitude', hue: 215, altitude: 10700, blurb: 'Above the weather, faster than sound is quiet.' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', threshold: 450, place: 'Leaving the atmosphere', hue: 18, altitude: 80000, blurb: 'The sky goes black and the curve of the Earth appears.' },
  { id: 'satellite', name: 'Satellite', emoji: '🛰️', threshold: 540, place: 'Low Earth orbit', hue: 225, altitude: 400000, blurb: 'Silent, steady and circling the whole world.' },
  { id: 'astronaut', name: 'Astronaut', emoji: '🧑‍🚀', threshold: 620, place: 'Deep space', hue: 250, altitude: 384000000, blurb: 'The Moon below, the Earth a small blue marble.' },
  { id: 'solar', name: 'Solar System', emoji: '🪐', threshold: 700, place: 'Beyond Neptune', hue: 45, altitude: 4500000000000, blurb: 'You are all of it. Eight worlds and a star.' },
];

export const FINAL_STAGE_INDEX = STAGES.length - 1;

/** A readable altitude for the HUD, interpolating between stages (log-scaled above sea level). */
export function altitudeFor(points: number): number {
  const clamped = Math.max(0, Math.min(700, points));
  let i = 0;
  for (let k = 0; k < STAGES.length; k++) if (clamped >= STAGES[k].threshold) i = k;
  if (i >= STAGES.length - 1) return STAGES[i].altitude;
  const a = STAGES[i], b = STAGES[i + 1];
  const t = (clamped - a.threshold) / (b.threshold - a.threshold);
  if (a.altitude < 0 && b.altitude <= 10) return a.altitude + (b.altitude - a.altitude) * t;
  const la = a.altitude <= 1 ? 0 : Math.log10(a.altitude);
  const lb = Math.log10(Math.max(2, b.altitude));
  if (a.altitude < 0) return Math.pow(10, lb * t);
  return Math.pow(10, la + (lb - la) * t);
}

/** "−3,200 m", "Sea level", "4.2 km", "384,000 km", "4.5 billion km". */
export function formatAltitude(meters: number): string {
  if (meters < -1) return `−${Math.round(-meters).toLocaleString('en-GB')} m`;
  if (meters < 3) return 'Sea level';
  if (meters < 5000) return `${Math.round(meters).toLocaleString('en-GB')} m`;
  const km = meters / 1000;
  if (km < 100) return `${km.toFixed(1)} km`;
  if (km < 1_000_000) return `${Math.round(km).toLocaleString('en-GB')} km`;
  if (km < 1_000_000_000) return `${Math.round(km / 1_000_000).toLocaleString('en-GB')} million km`;
  return `${(km / 1_000_000_000).toFixed(1)} billion km`;
}

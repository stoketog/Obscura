import type { Entity } from '@/lib/types';
import { FISH_AND_MARINE } from './animals-fish';
import { AMPHIBIANS, REPTILES, BIRDS, MAMMALS, CETACEANS, INSECTS_ETC } from './animals-land';
import { PEOPLE } from './people';
import { PLACES } from './places';
import { INVENTIONS, OBJECTS } from './things';
import { FOODS, SCIENCE, EVENTS, MICROBES, PLANTS } from './misc';

/**
 * The lexicon: every guessable thing. Add rows here (or load them from a
 * database later) and they become instantly guessable and scoreable.
 */
export const ALL_ENTITIES: Entity[] = [
  ...FISH_AND_MARINE,
  ...AMPHIBIANS,
  ...REPTILES,
  ...BIRDS,
  ...MAMMALS,
  ...CETACEANS,
  ...INSECTS_ETC,
  ...MICROBES,
  ...PLANTS,
  ...PEOPLE,
  ...PLACES,
  ...INVENTIONS,
  ...OBJECTS,
  ...FOODS,
  ...SCIENCE,
  ...EVENTS,
];

export const ENTITY_BY_ID: Record<string, Entity> = Object.fromEntries(ALL_ENTITIES.map((e) => [e.id, e]));

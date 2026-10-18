import { createContext, useContext } from 'react';

/**
 * The one 3D world behind every screen. Screens normally just show the day's points,
 * but can point the camera elsewhere for a moment (the result screen's replay of the
 * final climb, or the admin stage gallery).
 */
export interface WorldControl {
  /** Points the world is showing instead of the day's points, or null. */
  override: number | null;
  setOverride: (points: number | null) => void;
}

export const WorldContext = createContext<WorldControl>({ override: null, setOverride: () => {} });

export const useWorld = () => useContext(WorldContext);

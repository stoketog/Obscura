import type { SceneId } from '../data/stages';
import { norm, type Renderer } from './engine';
import { microbe, jellyfish, fish, dolphinScene, type SceneFn } from './scenes-sea';
import { human, birdScene, helicopterScene, planeScene } from './scenes-land';
import { rocketScene, satelliteScene, astronautScene, solarScene } from './scenes-space';

export const SCENES: Record<SceneId, SceneFn> = {
  microbe,
  jellyfish,
  fish,
  dolphin: dolphinScene,
  human,
  bird: birdScene,
  helicopter: helicopterScene,
  plane: planeScene,
  rocket: rocketScene,
  satellite: satelliteScene,
  astronaut: astronautScene,
  solar: solarScene,
};

/**
 * Draws one frame of a scene. Every scene starts from the same defaults so a
 * scene never inherits fog, lighting or opacity from the one drawn before it.
 */
export function renderScene(r: Renderer, id: SceneId, t: number, opacity = 1) {
  r.master = opacity;
  r.fog = null;
  r.ambient = 0.45;
  r.light = norm([0.5, 0.9, 0.6]);
  r.cam.fov = 0.9;
  r.cam.up = [0, 1, 0];
  r.begin();
  SCENES[id](r, t);
  r.flush();
}

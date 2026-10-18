import { STAGES, altitudeFor, formatAltitude } from '@/data/stages';
import { SceneCanvas } from './SceneCanvas';

interface Props {
  stage: number;
  /** Points scored today; drives the altitude readout. Defaults to the stage's own threshold. */
  points?: number;
  className?: string;
  hud?: boolean;
  /** Tailwind aspect ratio class. */
  aspect?: string;
}

/** The viewport onto today's form: an animated scene with a place/altitude readout. */
export function SceneView({ stage, points, className = '', hud = true, aspect = 'aspect-[4/3]' }: Props) {
  const st = STAGES[stage];
  const alt = altitudeFor(points ?? st.threshold);
  return (
    <div
      className={`scene-frame relative mx-auto w-full overflow-hidden rounded-3xl ${aspect} ${className}`}
      style={{ ['--stage-hue' as string]: st.hue }}
      data-testid="scene-view"
      data-stage={st.id}
    >
      <SceneCanvas scene={st.id} label={`${st.name}: ${st.place}`} />
      <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgb(0_0_0/0.45)]" />
      {hud && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md" data-testid="scene-form">
            <span aria-hidden>{st.emoji}</span>
            {st.name}
          </div>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-white">
            <div className="rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur-md">
              <p className="text-[0.68rem] text-white/70" data-testid="scene-place">{st.place}</p>
              <p className="font-display text-lg font-semibold leading-tight tabular-nums" data-testid="scene-altitude">{formatAltitude(alt)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

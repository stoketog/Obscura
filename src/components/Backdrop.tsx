import { STAGES } from '@/data/stages';

/** A plain gradient and the current form's emoji, used only if WebGL isn't available. */
export function Backdrop({ stage }: { stage: number }) {
  const st = STAGES[stage];
  return (
    <div className="backdrop" style={{ ['--stage-hue' as string]: st.hue }} aria-hidden data-testid="backdrop-fallback">
      <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 text-[7rem] opacity-90 animate-float">{st.emoji}</div>
    </div>
  );
}

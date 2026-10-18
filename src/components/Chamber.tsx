import { Creature, stageHue } from './Creature';

/** The "specimen chamber": the player's creature inside slowly rotating instrument rings. */
export function Chamber({ stage, size = 320, className = '' }: { stage: number; size?: number; className?: string }) {
  const h = stageHue(stage);
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return (
    <div className={`relative mx-auto aspect-square ${className}`} style={{ width: size, maxWidth: '100%' }}>
      <div
        className="absolute inset-[6%] rounded-full"
        style={{ background: `radial-gradient(circle at 50% 42%, hsl(${h} 90% 45% / 0.35), hsl(${h} 80% 25% / 0.18) 55%, transparent 72%)`, boxShadow: `0 0 90px -10px hsl(${h} 95% 50% / 0.45), inset 0 0 60px hsl(${h} 90% 50% / 0.18)` }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
        <g className="chamber-ring" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="190" fill="none" stroke={`hsl(${h} 90% 70% / 0.35)`} strokeWidth="1" />
          {ticks.map((i) => {
            const a = (i / 72) * Math.PI * 2;
            const long = i % 6 === 0;
            const r1 = 190;
            const r2 = long ? 178 : 184;
            return <line key={i} x1={200 + Math.cos(a) * r1} y1={200 + Math.sin(a) * r1} x2={200 + Math.cos(a) * r2} y2={200 + Math.sin(a) * r2} stroke={`hsl(${h} 90% 75% / ${long ? 0.7 : 0.3})`} strokeWidth={long ? 1.6 : 1} />;
          })}
        </g>
        <g className="chamber-ring rev" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="164" fill="none" stroke={`hsl(${h} 90% 70% / 0.28)`} strokeWidth="1" strokeDasharray="3 9" />
          <circle cx="200" cy="36" r="4" fill={`hsl(${h} 100% 80%)`} />
          <circle cx="364" cy="200" r="2.6" fill={`hsl(${h} 100% 80% / 0.7)`} />
        </g>
        <circle cx="200" cy="200" r="150" fill="none" stroke={`hsl(${h} 90% 70% / 0.14)`} strokeWidth="1" />
      </svg>
      <div className="absolute inset-[17%] grid place-items-center">
        <Creature stage={stage} size="100%" title={`stage ${stage}`} />
      </div>
    </div>
  );
}

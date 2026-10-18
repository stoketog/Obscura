import { useMemo } from 'react';

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** Deep-water atmosphere: tinted gradient (hue follows the creature) plus drifting marine snow. */
export function Backdrop({ hue }: { hue: number }) {
  const flecks = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 34 }, (_, i) => ({
      id: i,
      left: r() * 100,
      size: 1.5 + r() * 3.2,
      dur: 22 + r() * 30,
      delay: -r() * 40,
      dx: (r() - 0.5) * 90,
      o: 0.25 + r() * 0.55,
    }));
  }, []);
  return (
    <div className="backdrop" style={{ ['--stage-hue' as string]: hue }} aria-hidden>
      {flecks.map((f) => (
        <span
          key={f.id}
          className="snow"
          style={{ left: `${f.left}%`, width: f.size, height: f.size, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, ['--dx' as string]: `${f.dx}px`, ['--o' as string]: f.o }}
        />
      ))}
    </div>
  );
}

import { useId, type CSSProperties, type ReactNode } from 'react';

/**
 * Hand-drawn SVG creatures, one per evolutionary stage. They share a single
 * "bioluminescent specimen" style: translucent gradient body, bright rim line,
 * soft glow. Colour comes from a per-stage hue so the whole UI can echo it.
 */
export const STAGE_HUES = [172, 128, 196, 350, 38, 200, 118, 78, 22, 30, 258, 214, 222, 285];
export const stageHue = (i: number) => STAGE_HUES[Math.max(0, Math.min(STAGE_HUES.length - 1, i))];

interface Pal {
  h: number;
  fill: string; // gradient url
  solid: string;
  rim: string;
  dark: string;
  hi: string;
  sw: number;
  coral?: string;
}
type Draw = (p: Pal, id: string) => ReactNode;

const strokeProps = (p: Pal) => ({ stroke: p.rim, strokeWidth: p.sw, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

/** A limb / appendage: rim pass + body pass, so thin shapes keep the specimen look. */
function Limb({ d, w, p, className }: { d: string; w: number; p: Pal; className?: string }) {
  return (
    <g className={className} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={p.rim} strokeWidth={w + 3.5} />
      <path d={d} stroke={p.solid} strokeWidth={w} />
    </g>
  );
}

const DRAW: Draw[] = [
  // 0 · Microbe — an amoeboid cell with a flagellum
  (p) => (
    <g>
      <g className="pulse-soft">
        <path d="M100 50C130 46 155 70 151 101C148 130 126 153 97 150C68 147 48 126 53 97C56 71 73 53 100 50Z" fill={p.fill} {...strokeProps(p)} />
        <circle cx="100" cy="100" r="17" fill={p.dark} stroke={p.rim} strokeWidth="1.6" />
        <circle cx="100" cy="100" r="6.5" fill={p.hi} opacity="0.85" />
        {[[77, 81, 5], [124, 77, 4], [126, 124, 6.5], [79, 126, 4.5], [140, 100, 3], [66, 104, 3.2], [101, 135, 3.4]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={p.solid} stroke={p.rim} strokeWidth="1.2" opacity="0.9" />
        ))}
        {Array.from({ length: 22 }).map((_, i) => {
          const t = (i / 22) * Math.PI * 2;
          const x1 = 100 + Math.cos(t) * 50;
          const y1 = 100 + Math.sin(t) * 50;
          return <line key={i} x1={x1} y1={y1} x2={100 + Math.cos(t) * 57} y2={100 + Math.sin(t) * 57} stroke={p.rim} strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />;
        })}
      </g>
      <path className="wiggle" d="M150 114C170 108 176 132 194 124" fill="none" stroke={p.rim} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),

  // 1 · Bacterium — a rod with flagella and pili
  (p) => (
    <g transform="rotate(-24 100 100)">
      <rect x="52" y="80" width="104" height="40" rx="20" fill={p.fill} {...strokeProps(p)} />
      <rect x="58" y="86" width="92" height="28" rx="14" fill="none" stroke={p.rim} strokeWidth="1" opacity="0.4" />
      <path d="M68 100q9-14 18 0t18 0t18 0t18 0" fill="none" stroke={p.hi} strokeWidth="2.4" opacity="0.8" strokeLinecap="round" />
      {[66, 82, 98, 114, 130, 146].map((x) => (
        <g key={x} stroke={p.rim} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
          <line x1={x} y1="80" x2={x - 2} y2="71" />
          <line x1={x} y1="120" x2={x + 2} y2="129" />
        </g>
      ))}
      {[-8, 0, 8].map((dy, i) => (
        <path key={i} className="wiggle" style={{ animationDelay: `${i * 0.3}s` }} d={`M52 ${100 + dy}C38 ${88 + dy} 30 ${116 + dy} 16 ${102 + dy}S0 ${96 + dy} -4 ${104 + dy}`} fill="none" stroke={p.rim} strokeWidth="2.2" strokeLinecap="round" />
      ))}
    </g>
  ),

  // 2 · Protozoan — a ciliate (paramecium-like)
  (p) => (
    <g transform="rotate(-18 100 100)">
      {Array.from({ length: 34 }).map((_, i) => {
        const t = (i / 34) * Math.PI * 2;
        const x = 100 + Math.cos(t) * 64;
        const y = 100 + Math.sin(t) * 38;
        return <line key={i} className="cilia" style={{ animationDelay: `${(i % 7) * 0.12}s` }} x1={x} y1={y} x2={x + Math.cos(t) * 10} y2={y + Math.sin(t) * 10} stroke={p.rim} strokeWidth="1.7" strokeLinecap="round" opacity="0.8" />;
      })}
      <ellipse cx="100" cy="100" rx="64" ry="38" fill={p.fill} {...strokeProps(p)} />
      <path d="M52 99C74 96 92 104 108 114" fill="none" stroke={p.hi} strokeWidth="2.4" opacity="0.7" strokeLinecap="round" />
      <ellipse cx="100" cy="96" rx="19" ry="12" fill={p.dark} stroke={p.rim} strokeWidth="1.5" />
      <ellipse cx="100" cy="96" rx="6" ry="4" fill={p.hi} opacity="0.7" />
      <circle className="pulse-soft" cx="137" cy="88" r="9" fill="none" stroke={p.rim} strokeWidth="1.6" />
      <circle className="pulse-soft" cx="70" cy="118" r="8" fill="none" stroke={p.rim} strokeWidth="1.6" style={{ animationDelay: '1.2s' }} />
      {[[120, 118, 2.6], [86, 76, 2.4], [150, 108, 2.2], [64, 90, 2], [112, 70, 2.4]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={p.hi} opacity="0.7" />
      ))}
    </g>
  ),

  // 3 · Tiny invertebrate — a segmented worm
  (p) => {
    const d = 'M34 146C54 78 92 150 120 104C142 68 170 92 162 56';
    return (
      <g>
        <path d={d} fill="none" stroke={p.rim} strokeWidth="32" strokeLinecap="round" />
        <path d={d} fill="none" stroke={p.fill} strokeWidth="27" strokeLinecap="round" />
        <path d={d} fill="none" stroke={p.dark} strokeWidth="27" strokeDasharray="1.5 11" opacity="0.55" />
        <path d={d} fill="none" stroke={p.hi} strokeWidth="5" strokeLinecap="round" opacity="0.35" transform="translate(0 -6)" />
        <path d="M112 112C118 104 124 98 130 92" stroke={p.hi} strokeWidth="9" strokeLinecap="round" opacity="0.4" fill="none" />
        <circle cx="168" cy="52" r="3.6" fill={p.dark} stroke={p.hi} strokeWidth="1" />
        <circle cx="155" cy="52" r="3.6" fill={p.dark} stroke={p.hi} strokeWidth="1" />
        <path d="M156 38 q6 -12 14 -8 M168 40 q8 -10 16 -2" fill="none" stroke={p.rim} strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  },

  // 4 · Insect — a beetle seen from above
  (p) => {
    const legs = ['M74 90L42 72L24 88', 'M70 110L30 114L16 136', 'M74 132L46 156L36 178'];
    return (
      <g>
        {[false, true].map((m) => (
          <g key={String(m)} transform={m ? 'translate(200 0) scale(-1 1)' : undefined}>
            {legs.map((d) => (
              <Limb key={d} d={d} w={4.5} p={p} />
            ))}
            <path className="wiggle" d="M91 50Q80 28 64 24" fill="none" stroke={p.rim} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        ))}
        <ellipse cx="100" cy="116" rx="38" ry="50" fill={p.fill} {...strokeProps(p)} />
        <path d="M100 68V166" stroke={p.rim} strokeWidth="2" opacity="0.8" />
        <path d="M70 100C76 80 88 72 100 70C112 72 124 80 130 100" fill="none" stroke={p.hi} strokeWidth="2" opacity="0.45" />
        {[[84, 112, 7], [116, 112, 7], [85, 140, 5.5], [115, 140, 5.5]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={p.dark} opacity="0.8" />
        ))}
        <ellipse cx="100" cy="78" rx="26" ry="13" fill={p.solid} stroke={p.rim} strokeWidth="2" />
        <ellipse cx="100" cy="58" rx="18" ry="15" fill={p.solid} stroke={p.rim} strokeWidth="2.4" />
        <circle cx="91" cy="55" r="3.6" fill={p.hi} />
        <circle cx="109" cy="55" r="3.6" fill={p.hi} />
      </g>
    );
  },

  // 5 · Fish — side view
  (p) => (
    <g>
      <path d="M92 70C100 44 130 40 142 68Z" fill={p.solid} {...strokeProps(p)} />
      <path d="M168 100C152 66 104 56 68 82L26 56C38 82 38 118 26 144L68 118C104 144 152 134 168 100Z" fill={p.fill} {...strokeProps(p)} />
      {[[92, 100], [112, 90], [112, 112], [132, 100], [94, 82], [94, 118]].map(([x, y], i) => (
        <path key={i} d={`M${x - 8} ${y - 6}Q${x + 2} ${y} ${x - 8} ${y + 6}`} fill="none" stroke={p.hi} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      ))}
      <path d="M124 114C116 134 102 142 90 140C98 130 104 120 110 110Z" fill={p.solid} {...strokeProps(p)} />
      <path d="M134 80C128 94 128 108 134 120" fill="none" stroke={p.rim} strokeWidth="2" opacity="0.8" strokeLinecap="round" />
      <circle cx="152" cy="94" r="6.4" fill={p.dark} stroke={p.rim} strokeWidth="1.6" />
      <circle cx="154" cy="92" r="2.2" fill={p.hi} />
      <path d="M168 104C162 107 156 108 150 106" fill="none" stroke={p.rim} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),

  // 6 · Amphibian — a frog from above
  (p) => (
    <g>
      <Limb d="M74 130L40 138L30 170" w={13} p={p} />
      <Limb d="M126 130L160 138L170 170" w={13} p={p} />
      <Limb d="M72 92L48 98L44 118" w={9} p={p} />
      <Limb d="M128 92L152 98L156 118" w={9} p={p} />
      {[[28, 172], [170, 172]].map(([x, y], i) => (
        <path key={i} d={`M${x - 12} ${y}Q${x} ${y + 10} ${x + 12} ${y}L${x + 8} ${y - 6}L${x} ${y - 2}L${x - 8} ${y - 6}Z`} fill={p.solid} stroke={p.rim} strokeWidth="2" strokeLinejoin="round" />
      ))}
      <ellipse cx="100" cy="116" rx="36" ry="44" fill={p.fill} {...strokeProps(p)} />
      <ellipse cx="100" cy="76" rx="36" ry="26" fill={p.fill} {...strokeProps(p)} />
      <path d="M72 84Q100 100 128 84" fill="none" stroke={p.rim} strokeWidth="2" strokeLinecap="round" />
      {[[84, 112], [116, 112], [96, 134], [106, 100], [112, 140], [88, 96]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill={p.dark} opacity="0.55" />
      ))}
      {[78, 122].map((x) => (
        <g key={x}>
          <circle cx={x} cy="56" r="12" fill={p.solid} stroke={p.rim} strokeWidth="2" />
          <circle cx={x} cy="56" r="6.5" fill={p.dark} />
          <circle cx={x + 2} cy="54" r="2" fill={p.hi} />
        </g>
      ))}
      <circle cx="94" cy="68" r="1.6" fill={p.hi} />
      <circle cx="106" cy="68" r="1.6" fill={p.hi} />
    </g>
  ),

  // 7 · Reptile — a lizard from above
  (p) => (
    <g>
      <path d="M92 138C90 168 118 176 128 194L136 190C128 166 110 160 108 138Z" fill={p.fill} {...strokeProps(p)} />
      {[[80, 80, 54, 66, 40, 80], [120, 80, 146, 66, 160, 80], [82, 128, 54, 138, 44, 160], [118, 128, 146, 138, 156, 160]].map(([x1, y1, x2, y2, x3, y3], i) => (
        <g key={i}>
          <Limb d={`M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}`} w={8} p={p} />
          {[-6, 0, 6].map((o) => (
            <line key={o} x1={x3} y1={y3} x2={x3 + o * (x3 < 100 ? -1 : 1) * 1.3 + (x3 < 100 ? -3 : 3)} y2={y3 + 9} stroke={p.rim} strokeWidth="2.2" strokeLinecap="round" />
          ))}
        </g>
      ))}
      <ellipse cx="100" cy="104" rx="24" ry="44" fill={p.fill} {...strokeProps(p)} />
      <ellipse cx="100" cy="50" rx="17" ry="24" fill={p.fill} {...strokeProps(p)} />
      {[78, 92, 106, 120, 134].map((y) => (
        <path key={y} d={`M84 ${y}L100 ${y + 8}L116 ${y}`} fill="none" stroke={p.hi} strokeWidth="1.8" opacity="0.45" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx="91" cy="44" r="3.6" fill={p.dark} stroke={p.hi} strokeWidth="1.2" />
      <circle cx="109" cy="44" r="3.6" fill={p.dark} stroke={p.hi} strokeWidth="1.2" />
      <path className="wiggle" d="M100 28V18M100 18L94 12M100 18L106 12" stroke={p.coral ?? p.rim} fill="none" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),

  // 8 · Bird — perched songbird
  (p) => (
    <g>
      <path d="M62 112L14 124L22 146L66 132Z" fill={p.solid} {...strokeProps(p)} />
      <path d="M98 142L96 168M112 142L116 168M88 168H104M108 168H124" stroke={p.rim} strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="100" cy="108" rx="46" ry="35" transform="rotate(-14 100 108)" fill={p.fill} {...strokeProps(p)} />
      <path d="M116 112C128 120 140 118 148 106C146 124 130 134 112 130Z" fill={p.hi} opacity="0.25" />
      <circle cx="142" cy="74" r="21" fill={p.fill} {...strokeProps(p)} />
      <path d="M160 70L186 80L160 88Z" fill={p.hi} stroke={p.rim} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="148" cy="70" r="4.2" fill={p.dark} stroke={p.hi} strokeWidth="1.2" />
      <circle cx="149.4" cy="68.6" r="1.4" fill="#fff" />
      <path d="M64 102C84 84 122 90 134 118C110 136 82 130 64 102Z" fill={p.solid} stroke={p.rim} strokeWidth="2.2" strokeLinejoin="round" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${78 + i * 12} ${106 + i * 2}Q${96 + i * 8} ${108 + i * 3} ${108 + i * 8} ${122 - i * 2}`} fill="none" stroke={p.hi} strokeWidth="1.6" opacity="0.5" strokeLinecap="round" />
      ))}
    </g>
  ),

  // 9 · Small mammal — a mouse
  (p) => (
    <g>
      <path className="wiggle" d="M46 128C20 122 10 152 26 170" fill="none" stroke={p.rim} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M40 132C40 94 80 74 118 86C140 92 150 112 150 132C150 148 130 154 100 154C70 154 40 152 40 132Z" fill={p.fill} {...strokeProps(p)} />
      <path d="M128 90C150 80 176 104 182 124C170 136 150 136 140 130Z" fill={p.fill} {...strokeProps(p)} />
      <ellipse cx="102" cy="154" rx="14" ry="6" fill={p.solid} stroke={p.rim} strokeWidth="2" />
      <ellipse cx="138" cy="152" rx="10" ry="5" fill={p.solid} stroke={p.rim} strokeWidth="2" />
      <circle cx="124" cy="78" r="20" fill={p.solid} stroke={p.rim} strokeWidth="2.4" />
      <circle cx="124" cy="78" r="12" fill={p.hi} opacity="0.35" />
      <circle cx="157" cy="106" r="4" fill={p.dark} stroke={p.hi} strokeWidth="1.2" />
      <circle cx="181" cy="123" r="4.4" fill={p.hi} />
      {[-10, 0, 10].map((a) => (
        <line key={a} x1="172" y1="124" x2={196} y2={124 + a * 1.4} stroke={p.rim} strokeWidth="1.4" opacity="0.8" strokeLinecap="round" />
      ))}
      <path d="M62 104C80 92 104 94 118 104" fill="none" stroke={p.hi} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
    </g>
  ),

  // 10 · Large mammal — an elephant
  (p) => (
    <g>
      <rect x="54" y="122" width="20" height="46" rx="9" fill={p.solid} stroke={p.rim} strokeWidth="2" opacity="0.8" />
      <rect x="112" y="122" width="20" height="46" rx="9" fill={p.solid} stroke={p.rim} strokeWidth="2" opacity="0.8" />
      <path d="M34 82C34 62 62 58 96 60C124 60 150 70 150 100V128C150 138 140 140 130 140H48C38 140 34 132 34 122Z" fill={p.fill} {...strokeProps(p)} />
      <circle cx="148" cy="92" r="30" fill={p.fill} {...strokeProps(p)} />
      <Limb d="M168 106C186 128 178 150 160 156" w={15} p={p} />
      <path d="M163 117C172 128 182 126 188 118" fill="none" stroke={p.hi} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="128" cy="90" rx="17" ry="27" transform="rotate(8 128 90)" fill={p.solid} stroke={p.rim} strokeWidth="2.4" />
      <ellipse cx="128" cy="92" rx="9" ry="17" transform="rotate(8 128 92)" fill={p.hi} opacity="0.22" />
      <rect x="70" y="124" width="22" height="46" rx="10" fill={p.fill} {...strokeProps(p)} />
      <rect x="128" y="124" width="22" height="46" rx="10" fill={p.fill} {...strokeProps(p)} />
      <circle cx="160" cy="86" r="3.6" fill={p.dark} stroke={p.hi} strokeWidth="1.2" />
      <path d="M36 92C24 98 22 114 28 124" fill="none" stroke={p.rim} strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),

  // 11 · Marine mammal — a seal
  (p) => (
    <g>
      <path d="M18 142L2 130M18 142L4 156" stroke={p.rim} strokeWidth="9" strokeLinecap="round" />
      <path d="M18 142L2 130M18 142L4 156" stroke={p.solid} strokeWidth="5" strokeLinecap="round" />
      <path d="M16 140C28 98 88 78 128 86C152 92 164 104 168 112C174 128 160 134 146 132C108 150 58 158 16 140Z" fill={p.fill} {...strokeProps(p)} />
      <circle cx="154" cy="98" r="22" fill={p.fill} {...strokeProps(p)} />
      <ellipse cx="172" cy="108" rx="14" ry="10" fill={p.fill} {...strokeProps(p)} />
      <circle cx="160" cy="92" r="5.6" fill={p.dark} stroke={p.hi} strokeWidth="1.4" />
      <circle cx="161.8" cy="90.2" r="1.8" fill="#fff" />
      <ellipse cx="182" cy="105" rx="4.4" ry="3.2" fill={p.hi} />
      {[-8, 0, 8].map((a) => (
        <line key={a} x1="174" y1="112" x2="198" y2={112 + a * 1.5} stroke={p.hi} strokeWidth="1.4" opacity="0.8" strokeLinecap="round" />
      ))}
      <path d="M112 126C124 146 140 152 150 146C144 136 134 128 124 120Z" fill={p.solid} {...strokeProps(p)} />
      <path d="M40 120C60 104 88 100 108 106" fill="none" stroke={p.hi} strokeWidth="2.2" opacity="0.4" strokeLinecap="round" />
      <path className="wiggle" d="M6 172Q26 160 46 172T86 172T126 172T166 172T206 172" fill="none" stroke={p.rim} strokeWidth="2.2" opacity="0.6" strokeLinecap="round" />
    </g>
  ),

  // 12 · Whale
  (p) => (
    <g>
      <path className="wiggle" style={{ transformOrigin: '30% 60%' }} d="M42 112C28 106 16 94 10 76C24 80 34 88 44 98Z" fill={p.solid} {...strokeProps(p)} />
      <path d="M42 114C28 124 16 134 10 152C26 148 36 140 46 130Z" fill={p.solid} {...strokeProps(p)} />
      <path d="M32 114C58 64 142 54 180 90C196 104 192 122 176 130C138 152 66 150 32 118Z" fill={p.fill} {...strokeProps(p)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${100 + i * 12} ${134 + i * 0.4}Q${108 + i * 12} ${126} ${116 + i * 12} ${130 - i * 1.4}`} fill="none" stroke={p.hi} strokeWidth="1.5" opacity="0.45" strokeLinecap="round" />
      ))}
      <path d="M124 122C116 142 98 152 84 152C96 140 102 126 106 114Z" fill={p.solid} {...strokeProps(p)} />
      <circle cx="164" cy="104" r="4.2" fill={p.dark} stroke={p.hi} strokeWidth="1.3" />
      <path d="M194 110C184 116 170 116 158 112" fill="none" stroke={p.rim} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 94C90 72 130 72 156 86" fill="none" stroke={p.hi} strokeWidth="2.4" opacity="0.35" strokeLinecap="round" />
      <g stroke={p.hi} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.8">
        <path className="cilia" d="M132 68C132 52 124 42 114 36" />
        <path className="cilia" d="M132 68C134 52 144 44 156 40" />
        <path className="cilia" d="M132 68V46" />
      </g>
    </g>
  ),

  // 13 · Mythic form — unknown
  (p, id) => (
    <g>
      <defs>
        <radialGradient id={`${id}-core`} cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#ffd98a" />
          <stop offset="0.75" stopColor="#b497ff" />
          <stop offset="1" stopColor="#4a2d9e" />
        </radialGradient>
      </defs>
      <g className="chamber-ring" style={{ transformOrigin: '100px 100px' }}>
        <circle cx="100" cy="100" r="86" fill="none" stroke={p.rim} strokeWidth="1.4" strokeDasharray="2 7" opacity="0.8" />
      </g>
      <g className="chamber-ring rev" style={{ transformOrigin: '100px 100px' }}>
        <circle cx="100" cy="100" r="70" fill="none" stroke="#ffd98a" strokeWidth="1.6" strokeDasharray="14 10" opacity="0.7" />
      </g>
      {[0, 45, 90, 135].map((r) => (
        <ellipse key={r} cx="100" cy="100" rx="78" ry="11" transform={`rotate(${r} 100 100)`} fill={p.fill} stroke={p.rim} strokeWidth="1.6" opacity="0.8" />
      ))}
      <circle cx="100" cy="100" r="34" fill={`url(#${id}-core)`} stroke="#fff" strokeWidth="2" className="pulse-soft" />
      <path d="M100 72C118 88 118 112 100 128C82 112 82 88 100 72Z" fill="#1a0b4a" stroke="#fff" strokeWidth="1.6" opacity="0.92" />
      <ellipse cx="100" cy="100" rx="3.4" ry="14" fill="#ffd98a" />
      {[[100, 14], [186, 100], [100, 186], [14, 100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#fff" className="pulse-soft" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  ),
];

export const STAGE_COUNT = DRAW.length;

interface Props {
  stage: number;
  size?: number | string;
  animate?: boolean;
  silhouette?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function Creature({ stage, size = 200, animate = true, silhouette = false, className = '', style, title }: Props) {
  const id = useId().replace(/:/g, '');
  const idx = Math.max(0, Math.min(DRAW.length - 1, stage));
  const h = stageHue(idx);
  const mythic = idx === DRAW.length - 1;
  const pal: Pal & { coral?: string } = {
    h,
    fill: `url(#${id}-f)`,
    solid: `hsl(${h} 70% 36%)`,
    rim: `hsl(${h} 100% 74%)`,
    dark: `hsl(${h} 70% 14%)`,
    hi: `hsl(${h} 100% 90%)`,
    sw: 2.4,
    coral: '#ff7a8a',
  };
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? 'creature'}
      className={`${animate ? 'creature-idle' : ''} ${silhouette ? '' : 'creature-glow'} ${className}`}
      style={{ ['--h' as string]: mythic ? 270 : h, overflow: 'visible', ...(silhouette ? { filter: 'brightness(0) invert(1) opacity(0.14)' } : null), ...style } as CSSProperties}
    >
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 90% 62%)`} stopOpacity="0.92" />
          <stop offset="0.55" stopColor={`hsl(${h} 80% 40%)`} stopOpacity="0.92" />
          <stop offset="1" stopColor={`hsl(${h} 75% 20%)`} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {DRAW[idx](pal, id)}
    </svg>
  );
}

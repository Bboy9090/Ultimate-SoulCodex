export interface PosterData {
  name?: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  sunSign: string;
  moonSign: string;
  risingSign?: string;
  lifePathNumber: number;
  masterNumber?: number;
  planets?: { name: string; longitude: number }[];
  houseCusps?: number[];
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries:"♈", Taurus:"♉", Gemini:"♊", Cancer:"♋", Leo:"♌", Virgo:"♍",
  Libra:"♎", Scorpio:"♏", Sagittarius:"♐", Capricorn:"♑", Aquarius:"♒", Pisces:"♓",
};
const ZODIAC_GLYPH_LIST = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ZODIAC_SIGNS      = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

const LIFE_PATH_ARCHETYPES: Record<number, string> = {
  1:"THE PIONEER", 2:"THE DIPLOMAT", 3:"THE COMMUNICATOR",
  4:"THE BUILDER", 5:"THE EXPLORER", 6:"THE NURTURER",
  7:"THE SEEKER", 8:"THE EXECUTIVE", 9:"THE HUMANITARIAN",
  11:"THE INTUITIVE", 22:"THE MASTER BUILDER", 33:"THE TEACHER",
};

const MASTER_NUMBER_MEANINGS: Record<number, string> = {
  11:"Intuition", 22:"Mastery", 33:"Compassion",
};

const PLANET_GLYPHS: Record<string, string> = {
  sun:"☉", moon:"☽", mercury:"☿", venus:"♀", mars:"♂",
  jupiter:"♃", saturn:"♄", uranus:"♅", neptune:"♆", pluto:"♇",
  north_node:"☊", chiron:"⚷",
};

/* Star positions [x, y, radius] across 1080-wide canvas */
const STARS: [number,number,number][] = [
  [52,18,1.2],[118,44,0.8],[210,12,1.5],[340,28,1],[480,8,0.9],[620,35,1.3],[750,15,0.8],[880,42,1.1],[980,20,0.7],[1050,55,1.2],
  [30,90,0.7],[160,110,1.4],[290,75,0.9],[430,95,0.8],[570,80,1.2],[710,105,0.7],[840,88,1.5],[970,72,1],[1040,100,0.8],[80,140,1.1],
  [195,160,0.9],[325,130,1.3],[465,155,0.7],[600,145,1],[735,135,0.8],[865,160,1.2],[1010,148,0.9],[45,190,0.7],[175,200,1.4],[310,185,0.8],
  [450,210,1.1],[590,195,0.9],[730,205,0.7],[870,190,1.3],[1000,200,0.8],[70,240,1],[200,230,0.9],[355,248,0.7],[490,235,1.2],[640,245,0.8],
  [780,238,1.1],[920,250,0.9],[1055,232,0.7],[35,285,1.2],[165,275,0.8],[305,290,1],[445,278,0.7],[590,285,1.3],[730,280,0.9],[870,290,0.8],
  [20,330,0.8],[95,355,1.3],[230,345,0.9],[380,360,0.7],[520,340,1],[660,355,0.8],[810,342,1.1],[955,358,0.9],[1060,335,0.7],
  [10,410,1],[140,398,0.8],[270,415,1.2],[410,400,0.9],[555,412,0.7],[700,398,1.1],[845,410,0.8],[1000,402,0.9],[1075,415,0.7],
];

/* Thin constellation-style lines between nearby stars */
const CONSTELLATIONS: [number,number,number,number][] = [
  [52,18, 118,44],[210,12, 340,28],[480,8, 620,35],[750,15, 880,42],
  [30,90, 160,110],[290,75, 430,95],[570,80, 710,105],[840,88, 970,72],
  [80,140, 195,160],[325,130, 465,155],[600,145, 735,135],[865,160, 1010,148],
  [52,18, 30,90],[340,28, 290,75],[620,35, 570,80],[880,42, 840,88],
];

function polarToXY(cx:number, cy:number, r:number, angleDeg:number):[number,number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

function formatTime(t?: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function BirthChartPosterSVG({
  data,
  variant = "free",
}: {
  data: PosterData;
  variant?: "free" | "premium";
}) {
  const W = 1080, H = 1350;
  const cx = W / 2, cy = 625;
  const outerR = 440, ringTextR = 420, wheelR = 370, glyphR = 344, planetR = 305, innerR = 232;

  const lpNum       = data.lifePathNumber;
  const lpArchetype = LIFE_PATH_ARCHETYPES[lpNum] ?? "THE PATHFINDER";
  const birthDateStr = formatDate(data.birthDate);
  const birthTimeStr = formatTime(data.birthTime);
  const nameText    = data.name || "Soul Codex";
  const risingGlyph = data.risingSign ? (ZODIAC_GLYPHS[data.risingSign] ?? "♏") : null;

  /* Circular ring text */
  const ringParts = [
    data.sunSign  ? `SUN IN ${data.sunSign.toUpperCase()}`  : null,
    data.moonSign ? `MOON IN ${data.moonSign.toUpperCase()}` : null,
    data.risingSign ? `RISING ${data.risingSign.toUpperCase()}` : null,
    data.sunSign  ? `${data.sunSign.toUpperCase()} ENERGY`  : null,
  ].filter(Boolean).join("  ·  ") + "  ·  ";

  const ringCirclePath = `M ${cx - ringTextR} ${cy} a ${ringTextR} ${ringTextR} 0 1 1 0.01 0`;

  /* Ribbon */
  const ribbonY  = 1105, ribbonW = 700, ribbonH = 50;
  const ribbonX  = cx - ribbonW / 2;
  const notch    = 26;
  const ribbonPts = `${ribbonX},${ribbonY} ${ribbonX+ribbonW},${ribbonY} ${ribbonX+ribbonW+notch},${ribbonY+ribbonH/2} ${ribbonX+ribbonW},${ribbonY+ribbonH} ${ribbonX},${ribbonY+ribbonH} ${ribbonX-notch},${ribbonY+ribbonH/2}`;

  if (variant === "free") {
    /* ── FREE: clean white/light-gray chart ── */
    const segFills = ["#f4f6f8", "#eaecf0"];
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth:"100%", display:"block" }}>
        <defs>
          <path id="ringPath" d={ringCirclePath} />
        </defs>

        {/* White background */}
        <rect width={W} height={H} fill="#ffffff" />

        {/* Header label */}
        <text x={cx} y={50} fontFamily="sans-serif" fontSize={12} fill="#6b7280" textAnchor="middle" letterSpacing={5}>
          SOUL CODEX  ·  BIRTH CHART
        </text>
        <line x1={cx-220} y1={62} x2={cx+220} y2={62} stroke="#d1d5db" strokeWidth={0.8} />

        {/* Outer decorative rings */}
        <circle cx={cx} cy={cy} r={outerR}   fill="none" stroke="#374151" strokeWidth={1.2} opacity={0.4} />
        <circle cx={cx} cy={cy} r={outerR-8} fill="none" stroke="#374151" strokeWidth={0.4} opacity={0.2} />

        {/* Ring text */}
        <text fontFamily="sans-serif" fontSize={13} fill="#374151" letterSpacing={2.2} opacity={0.6}>
          <textPath href="#ringPath" startOffset="0%">{ringParts.repeat(3)}</textPath>
        </text>

        {/* Zodiac wheel segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startDeg = i * 30, endDeg = (i + 1) * 30;
          const [x1,y1] = polarToXY(cx, cy, wheelR, startDeg);
          const [x2,y2] = polarToXY(cx, cy, wheelR, endDeg);
          const [ix1,iy1] = polarToXY(cx, cy, innerR, endDeg);
          const [ix2,iy2] = polarToXY(cx, cy, innerR, startDeg);
          const path = `M ${x1} ${y1} A ${wheelR} ${wheelR} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
          const [gx, gy] = polarToXY(cx, cy, glyphR, startDeg + 15);
          const isSunSign  = sign === data.sunSign;
          const isMoonSign = sign === data.moonSign;
          const isRising   = sign === data.risingSign;
          const highlight  = isSunSign || isMoonSign || isRising;
          return (
            <g key={sign}>
              <path d={path} fill={highlight ? "#e5e7eb" : segFills[i % 2]} stroke="#9ca3af" strokeWidth={0.7} />
              <text x={gx} y={gy} fontFamily="serif" fontSize={21} fill={highlight ? "#111827" : "#374151"}
                textAnchor="middle" dominantBaseline="central" opacity={highlight ? 1 : 0.7}>
                {ZODIAC_GLYPH_LIST[i]}
              </text>
            </g>
          );
        })}

        {/* Planet ring guide */}
        <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="#9ca3af" strokeWidth={0.4} strokeDasharray="3 8" opacity={0.4} />

        {/* Planet markers */}
        {(data.planets ?? []).map((p, i) => {
          const label = PLANET_GLYPHS[p.name.toLowerCase()] ?? p.name.slice(0,2).toUpperCase();
          const deg   = p.longitude % 360;
          const [px, py] = polarToXY(cx, cy, planetR, deg);
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={15} fill="#ffffff" stroke="#374151" strokeWidth={1.2} />
              <text x={px} y={py+1} fontFamily="serif" fontSize={14} fill="#111827"
                textAnchor="middle" dominantBaseline="central">
                {label}
              </text>
            </g>
          );
        })}

        {/* Wheel rings */}
        <circle cx={cx} cy={cy} r={wheelR}   fill="none" stroke="#6b7280" strokeWidth={0.8} opacity={0.5} />
        <circle cx={cx} cy={cy} r={innerR+2} fill="none" stroke="#6b7280" strokeWidth={0.6} opacity={0.35} />

        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={innerR} fill="#f9fafb" />
        <circle cx={cx} cy={cy} r={innerR-2} fill="none" stroke="#9ca3af" strokeWidth={0.5} opacity={0.4} />

        {/* Center text */}
        {data.name && (
          <text x={cx} y={cy - 70} fontFamily="sans-serif" fontSize={13} fill="#6b7280" textAnchor="middle" letterSpacing={3}>
            {data.name.toUpperCase()}
          </text>
        )}
        <text x={cx} y={cy - 28} fontFamily="Georgia, serif" fontSize={36} fontWeight="bold" fill="#111827" textAnchor="middle">
          {birthDateStr}
        </text>
        <circle cx={cx} cy={cy + 2} r={3} fill="#9ca3af" opacity={0.6} />
        {birthTimeStr && (
          <text x={cx} y={cy + 28} fontFamily="Georgia, serif" fontSize={22} fill="#374151" textAnchor="middle">
            {birthTimeStr}
          </text>
        )}
        {data.birthLocation && (
          <text x={cx} y={cy + (birthTimeStr ? 58 : 34)} fontFamily="sans-serif" fontSize={15} fill="#6b7280" textAnchor="middle">
            {data.birthLocation}
          </text>
        )}

        {/* Divider */}
        <line x1={cx-320} y1={1016} x2={cx+320} y2={1016} stroke="#d1d5db" strokeWidth={0.8} />

        {/* Life Path number */}
        <text x={cx} y={1098} fontFamily="Georgia, serif" fontSize={120} fontWeight="bold"
          fill="#1f2937" textAnchor="middle" opacity={0.9}>
          {lpNum}
        </text>

        {/* Ribbon banner */}
        <polygon points={ribbonPts} fill="#1f2937" />
        <text x={cx} y={ribbonY + ribbonH/2 + 6} fontFamily="sans-serif" fontSize={16}
          fill="#ffffff" textAnchor="middle" letterSpacing={2.5} fontWeight={600}>
          LIFE PATH NUMBER {lpNum}  ·  {lpArchetype}
        </text>

        {/* Master number / footer */}
        {data.masterNumber ? (
          <>
            <text x={cx} y={1214} fontFamily="Georgia, serif" fontSize={42} fill="#374151" textAnchor="middle" letterSpacing={4}>
              {data.masterNumber}:{String(data.masterNumber).padStart(2,"0")}
            </text>
            <text x={cx} y={1255} fontFamily="sans-serif" fontSize={14} fill="#6b7280" textAnchor="middle" letterSpacing={2} fontStyle="italic">
              Master Number {data.masterNumber} · {MASTER_NUMBER_MEANINGS[data.masterNumber] ?? "Vision"}
            </text>
          </>
        ) : (
          <text x={cx} y={1230} fontFamily="sans-serif" fontSize={12} fill="#9ca3af" textAnchor="middle" letterSpacing={1}>
            Soul Codex  ·  {new Date().getFullYear()}
          </text>
        )}

        <text x={cx} y={1320} fontFamily="sans-serif" fontSize={16} fill="#9ca3af" textAnchor="middle" opacity={0.4}>✦</text>
      </svg>
    );
  }

  /* ── PREMIUM: dark teal atmospheric chart ── */
  const segFills = ["rgba(5,35,40,0.88)", "rgba(3,22,28,0.92)"];

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth:"100%", display:"block" }}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="42%" r="65%">
          <stop offset="0%"   stopColor="#0c3038" />
          <stop offset="40%"  stopColor="#071e25" />
          <stop offset="75%"  stopColor="#041318" />
          <stop offset="100%" stopColor="#02080c" />
        </radialGradient>
        <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#0e4d5a" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#072830" stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="innerBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%"  stopColor="#0b3340" />
          <stop offset="100%" stopColor="#041318" />
        </radialGradient>
        <path id="ringPath" d={ringCirclePath} />
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="url(#bg)" />

      {/* Constellation lines */}
      {CONSTELLATIONS.map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#d6b25e" strokeWidth={0.4} opacity={0.08} />
      ))}

      {/* Stars */}
      {STARS.map(([sx,sy,sr], i) => (
        <circle key={i} cx={sx} cy={sy} r={sr} fill="white" opacity={Math.min(0.85, 0.25 + sr * 0.3)} />
      ))}

      {/* Atmospheric glow behind wheel */}
      <circle cx={cx} cy={cy} r={outerR + 60} fill="url(#wheelGlow)" />

      {/* Large decorative Rising Sign glyph (left side) */}
      {risingGlyph && (
        <text
          x={cx - outerR - 10}
          y={cy + 80}
          fontFamily="serif"
          fontSize={240}
          fill="#7a1a1a"
          textAnchor="middle"
          dominantBaseline="central"
          opacity={0.55}
          transform={`rotate(-15, ${cx - outerR - 10}, ${cy + 80})`}
          style={{ filter: "blur(1px)" }}
        >
          {risingGlyph}
        </text>
      )}

      {/* Header label */}
      <text x={cx} y={50} fontFamily="sans-serif" fontSize={12} fill="#d6b25e" textAnchor="middle" letterSpacing={5} opacity={0.6}>
        SOUL CODEX  ·  BIRTH CHART
      </text>
      <line x1={cx-220} y1={62} x2={cx+220} y2={62} stroke="#d6b25e" strokeWidth={0.5} opacity={0.2} />

      {/* Outer decorative rings */}
      <circle cx={cx} cy={cy} r={outerR}   fill="none" stroke="#d6b25e" strokeWidth={1.5} opacity={0.45} />
      <circle cx={cx} cy={cy} r={outerR-8} fill="none" stroke="#d6b25e" strokeWidth={0.5} opacity={0.15} />

      {/* Ring text */}
      <text fontFamily="sans-serif" fontSize={13} fill="#d6b25e" letterSpacing={2.2} opacity={0.8}>
        <textPath href="#ringPath" startOffset="0%">{ringParts.repeat(3)}</textPath>
      </text>

      {/* Zodiac wheel segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = i * 30, endDeg = (i + 1) * 30;
        const [x1,y1] = polarToXY(cx, cy, wheelR, startDeg);
        const [x2,y2] = polarToXY(cx, cy, wheelR, endDeg);
        const [ix1,iy1] = polarToXY(cx, cy, innerR, endDeg);
        const [ix2,iy2] = polarToXY(cx, cy, innerR, startDeg);
        const path = `M ${x1} ${y1} A ${wheelR} ${wheelR} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
        const [gx, gy] = polarToXY(cx, cy, glyphR, startDeg + 15);
        const isSunSign  = sign === data.sunSign;
        const isMoonSign = sign === data.moonSign;
        const isRising   = sign === data.risingSign;
        const highlight  = isSunSign || isMoonSign || isRising;
        return (
          <g key={sign}>
            <path d={path} fill={highlight ? "rgba(30,70,60,0.6)" : segFills[i % 2]} stroke="#d6b25e" strokeWidth={0.8} />
            <text x={gx} y={gy} fontFamily="serif" fontSize={21} fill={highlight ? "#e8d28a" : "#d6b25e"}
              textAnchor="middle" dominantBaseline="central" opacity={highlight ? 1 : 0.75}
              filter={highlight ? "url(#glow)" : undefined}>
              {ZODIAC_GLYPH_LIST[i]}
            </text>
          </g>
        );
      })}

      {/* House cusp lines */}
      {(data.houseCusps ?? []).map((cuspDeg, i) => {
        const [hx1, hy1] = polarToXY(cx, cy, innerR, cuspDeg);
        const [hx2, hy2] = polarToXY(cx, cy, wheelR, cuspDeg);
        const isAngular = [0, 3, 6, 9].includes(i);
        return (
          <line key={i} x1={hx1} y1={hy1} x2={hx2} y2={hy2}
            stroke="#d6b25e" strokeWidth={isAngular ? 1.2 : 0.5}
            opacity={isAngular ? 0.55 : 0.25} />
        );
      })}

      {/* House numbers (angular houses only) */}
      {(data.houseCusps ?? []).map((cuspDeg, i) => {
        if (![0, 3, 6, 9].includes(i)) return null;
        const midDeg = cuspDeg + 15;
        const [lx, ly] = polarToXY(cx, cy, innerR + 30, midDeg);
        const romanLabels = ["I","","","IV","","","VII","","","X","",""];
        return romanLabels[i] ? (
          <text key={i} x={lx} y={ly} fontFamily="sans-serif" fontSize={10} fill="#d6b25e"
            textAnchor="middle" dominantBaseline="central" opacity={0.5} letterSpacing={1}>
            {romanLabels[i]}
          </text>
        ) : null;
      })}

      {/* Wheel rings */}
      <circle cx={cx} cy={cy} r={wheelR}   fill="none" stroke="#d6b25e" strokeWidth={1}   opacity={0.5} />
      <circle cx={cx} cy={cy} r={innerR+2} fill="none" stroke="#d6b25e" strokeWidth={0.8} opacity={0.35} />

      {/* Planet ring guide */}
      <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="#d6b25e" strokeWidth={0.5} opacity={0.12} strokeDasharray="3 8" />

      {/* Planet markers */}
      {(data.planets ?? []).map((p, i) => {
        const label = PLANET_GLYPHS[p.name.toLowerCase()] ?? p.name.slice(0,2).toUpperCase();
        const deg   = p.longitude % 360;
        const [px, py] = polarToXY(cx, cy, planetR, deg);
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={15} fill="rgba(8,30,36,0.88)" stroke="#d6b25e" strokeWidth={1.5} opacity={0.95} />
            <text x={px} y={py+1} fontFamily="serif" fontSize={14} fill="#e8d28a"
              textAnchor="middle" dominantBaseline="central" filter="url(#glow)">
              {label}
            </text>
          </g>
        );
      })}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="url(#innerBg)" opacity={0.96} />
      <circle cx={cx} cy={cy} r={innerR-2} fill="none" stroke="#d6b25e" strokeWidth={0.8} opacity={0.3} />

      {/* Center text */}
      <text x={cx} y={cy - 28} fontFamily="Georgia, serif" fontSize={36} fontWeight="bold" fill="#f8fafc" textAnchor="middle">
        {birthDateStr}
      </text>
      <circle cx={cx} cy={cy + 2} r={3} fill="#d6b25e" opacity={0.6} />
      {birthTimeStr && (
        <text x={cx} y={cy + 28} fontFamily="Georgia, serif" fontSize={22} fill="#d6b25e" textAnchor="middle">
          {birthTimeStr}
        </text>
      )}
      {data.birthLocation && (
        <text x={cx} y={cy + (birthTimeStr ? 58 : 34)} fontFamily="sans-serif" fontSize={15} fill="#94a3b8" textAnchor="middle">
          {data.birthLocation}
        </text>
      )}
      {data.name && (
        <text x={cx} y={cy - 70} fontFamily="sans-serif" fontSize={13} fill="#d6b25e" textAnchor="middle" letterSpacing={3} opacity={0.65}>
          {data.name.toUpperCase()}
        </text>
      )}

      {/* Divider */}
      <line x1={cx-320} y1={1016} x2={cx+320} y2={1016} stroke="#d6b25e" strokeWidth={0.8} opacity={0.3} />

      {/* Life Path number */}
      <text x={cx} y={1098} fontFamily="Georgia, serif" fontSize={120} fontWeight="bold"
        fill="#d6b25e" textAnchor="middle" filter="url(#softGlow)" opacity={0.95}>
        {lpNum}
      </text>

      {/* Ribbon banner */}
      <polygon points={ribbonPts} fill="#071e25" stroke="#d6b25e" strokeWidth={1.5} opacity={0.97} />
      <text x={cx} y={ribbonY + ribbonH/2 + 6} fontFamily="sans-serif" fontSize={16}
        fill="#d6b25e" textAnchor="middle" letterSpacing={2.5} fontWeight={600}>
        LIFE PATH NUMBER {lpNum}  ·  {lpArchetype}
      </text>

      {/* Master number / footer */}
      {data.masterNumber ? (
        <>
          <text x={cx} y={1214} fontFamily="Georgia, serif" fontSize={42} fill="#5ac8d8" textAnchor="middle" letterSpacing={4} filter="url(#glow)">
            {data.masterNumber}:{String(data.masterNumber).padStart(2,"0")}
          </text>
          <text x={cx} y={1255} fontFamily="sans-serif" fontSize={14} fill="#b0c8d8" textAnchor="middle" letterSpacing={2} fontStyle="italic">
            Master Number {data.masterNumber} · {MASTER_NUMBER_MEANINGS[data.masterNumber] ?? "Vision"}
          </text>
        </>
      ) : (
        <text x={cx} y={1230} fontFamily="sans-serif" fontSize={12} fill="#64748b" textAnchor="middle" letterSpacing={1}>
          Soul Codex  ·  {new Date().getFullYear()}
        </text>
      )}

      {/* Bottom glow star */}
      <text x={cx} y={1320} fontFamily="sans-serif" fontSize={16} fill="#d6b25e" textAnchor="middle" opacity={0.3}>✦</text>
    </svg>
  );
}

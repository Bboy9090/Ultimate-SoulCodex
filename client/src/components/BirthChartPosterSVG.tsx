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
}

const ZODIAC_GLYPHS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

const LIFE_PATH_ARCHETYPES: Record<number, string> = {
  1: "THE PIONEER", 2: "THE DIPLOMAT", 3: "THE COMMUNICATOR",
  4: "THE BUILDER", 5: "THE EXPLORER", 6: "THE NURTURER",
  7: "THE SEEKER", 8: "THE EXECUTIVE", 9: "THE HUMANITARIAN",
  11: "THE INTUITIVE", 22: "THE MASTER BUILDER", 33: "THE TEACHER",
};

const MASTER_NUMBER_MEANINGS: Record<number, string> = {
  11: "Intuition", 22: "Mastery", 33: "Compassion",
};

const PLANET_LABELS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  north_node: "☊",
};

const STARS: [number, number, number][] = [
  [52,18,1.2],[118,44,0.8],[210,12,1.5],[340,28,1],[480,8,0.9],[620,35,1.3],[750,15,0.8],[880,42,1.1],[980,20,0.7],[1050,55,1.2],
  [30,90,0.7],[160,110,1.4],[290,75,0.9],[430,95,0.8],[570,80,1.2],[710,105,0.7],[840,88,1.5],[970,72,1],[1040,100,0.8],[80,140,1.1],
  [195,160,0.9],[325,130,1.3],[465,155,0.7],[600,145,1],[735,135,0.8],[865,160,1.2],[1010,148,0.9],[45,190,0.7],[175,200,1.4],[310,185,0.8],
  [450,210,1.1],[590,195,0.9],[730,205,0.7],[870,190,1.3],[1000,200,0.8],[70,240,1],[200,230,0.9],[355,248,0.7],[490,235,1.2],[640,245,0.8],
  [780,238,1.1],[920,250,0.9],[1055,232,0.7],[35,285,1.2],[165,275,0.8],[305,290,1],[445,278,0.7],[590,285,1.3],[730,280,0.9],[870,290,0.8],
  [1010,275,1.1],[60,320,0.7],[190,312,1.2],[330,328,0.9],[470,315,0.8],[610,322,1.1],[750,310,0.7],[890,325,1],[1030,318,0.8],[95,355,1.3],[230,345,0.9],
];

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
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

export default function BirthChartPosterSVG({ data }: { data: PosterData }) {
  const cx = 540, cy = 620;
  const outerR = 450, ringTextR = 430, wheelR = 380, glyphR = 352, planetR = 310, innerR = 240;

  const lpNum = data.lifePathNumber;
  const lpArchetype = LIFE_PATH_ARCHETYPES[lpNum] ?? "THE PATHFINDER";
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const birthDateStr = formatDate(data.birthDate);
  const birthTimeStr = formatTime(data.birthTime);
  const nameText = data.name || "Soul Codex";

  const ringText = [
    `SUN IN ${data.sunSign.toUpperCase()}`,
    `MOON IN ${data.moonSign.toUpperCase()}`,
    data.risingSign ? `RISING ${data.risingSign.toUpperCase()}` : null,
  ].filter(Boolean).join("  •  ") + "  •  ";

  const ringCirclePath = `M ${cx - ringTextR} ${cy} a ${ringTextR} ${ringTextR} 0 1 1 0.01 0`;

  const ribbonY = 1090;
  const ribbonW = 680, ribbonH = 48;
  const ribbonX = cx - ribbonW / 2;
  const notch = 24;
  const ribbonPoints = `${ribbonX},${ribbonY} ${ribbonX + ribbonW},${ribbonY} ${ribbonX + ribbonW + notch},${ribbonY + ribbonH / 2} ${ribbonX + ribbonW},${ribbonY + ribbonH} ${ribbonX},${ribbonY + ribbonH} ${ribbonX - notch},${ribbonY + ribbonH / 2}`;

  const segFills = ["rgba(13,37,53,0.85)", "rgba(7,16,19,0.92)"];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1350"
      width="100%"
      style={{ maxWidth: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#0a1a24" />
          <stop offset="55%" stopColor="#071013" />
          <stop offset="100%" stopColor="#0d2535" />
        </linearGradient>
        <path id="ringPath" d={ringCirclePath} />
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="1080" height="1350" fill="url(#bg)" />

      {/* Stars */}
      {STARS.map(([sx, sy, sr], i) => (
        <circle key={i} cx={sx} cy={sy} r={sr} fill="white" opacity={Math.min(0.9, 0.3 + sr * 0.3)} />
      ))}

      {/* Header */}
      <text x={cx} y={55} fontFamily="sans-serif" fontSize={13} fill="#64748b" textAnchor="middle" letterSpacing={4}>
        SOUL CODEX  •  BIRTH CHART
      </text>
      <line x1={cx - 200} y1={68} x2={cx + 200} y2={68} stroke="#d6b25e" strokeWidth={0.5} opacity={0.25} />

      {/* Outer decorative rings */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#d6b25e" strokeWidth={1.5} opacity={0.4} />
      <circle cx={cx} cy={cy} r={outerR - 8} fill="none" stroke="#d6b25e" strokeWidth={0.5} opacity={0.2} />

      {/* Ring text */}
      <text fontFamily="sans-serif" fontSize={15} fill="#d6b25e" letterSpacing={2.5} opacity={0.85}>
        <textPath href="#ringPath" startOffset="0%">
          {(ringText).repeat(3)}
        </textPath>
      </text>

      {/* Zodiac wheel segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = i * 30;
        const endDeg = (i + 1) * 30;
        const [x1, y1] = polarToXY(cx, cy, wheelR, startDeg);
        const [x2, y2] = polarToXY(cx, cy, wheelR, endDeg);
        const [ix1, iy1] = polarToXY(cx, cy, innerR, endDeg);
        const [ix2, iy2] = polarToXY(cx, cy, innerR, startDeg);
        const path = `M ${x1} ${y1} A ${wheelR} ${wheelR} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
        const [gx, gy] = polarToXY(cx, cy, glyphR, startDeg + 15);
        return (
          <g key={sign}>
            <path d={path} fill={segFills[i % 2]} stroke="#d6b25e" strokeWidth={0.8} />
            <text x={gx} y={gy} fontFamily="serif" fontSize={20} fill="#d6b25e" textAnchor="middle" dominantBaseline="central" opacity={0.85}>
              {ZODIAC_GLYPHS[i]}
            </text>
          </g>
        );
      })}

      {/* Wheel rings */}
      <circle cx={cx} cy={cy} r={wheelR} fill="none" stroke="#d6b25e" strokeWidth={1} opacity={0.5} />
      <circle cx={cx} cy={cy} r={innerR + 2} fill="none" stroke="#d6b25e" strokeWidth={1} opacity={0.4} />

      {/* Planet ring guide */}
      <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="#d6b25e" strokeWidth={0.5} opacity={0.15} strokeDasharray="4 8" />

      {/* Planet dots */}
      {(data.planets ?? []).map((p, i) => {
        const label = PLANET_LABELS[p.name.toLowerCase()] ?? p.name.slice(0, 2);
        const deg = p.longitude % 360;
        const [px, py] = polarToXY(cx, cy, planetR, deg);
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={14} fill="rgba(15,25,40,0.85)" stroke="#d6b25e" strokeWidth={1.5} opacity={0.95} />
            <text x={px} y={py + 1} fontFamily="serif" fontSize={14} fill="#d6b25e" textAnchor="middle" dominantBaseline="central">
              {label}
            </text>
          </g>
        );
      })}

      {/* Inner circle background */}
      <circle cx={cx} cy={cy} r={innerR} fill="#071013" opacity={0.95} />
      <circle cx={cx} cy={cy} r={innerR - 2} fill="none" stroke="#d6b25e" strokeWidth={1} opacity={0.35} />

      {/* Center text block */}
      <text x={cx} y={cy - 32} fontFamily="Georgia, serif" fontSize={34} fontWeight="bold" fill="#f8fafc" textAnchor="middle">
        {nameText}
      </text>
      <text x={cx} y={cy + 12} fontFamily="Georgia, serif" fontSize={20} fill="#d6b25e" textAnchor="middle">
        {birthDateStr}
      </text>
      {birthTimeStr && (
        <text x={cx} y={cy + 40} fontFamily="sans-serif" fontSize={16} fill="#94a3b8" textAnchor="middle">
          {birthTimeStr}
        </text>
      )}
      {data.birthLocation && (
        <text x={cx} y={cy + (birthTimeStr ? 64 : 42)} fontFamily="sans-serif" fontSize={14} fill="#64748b" textAnchor="middle">
          {data.birthLocation}
        </text>
      )}

      {/* Divider */}
      <line x1={cx - 300} y1={1003} x2={cx + 300} y2={1003} stroke="#d6b25e" strokeWidth={0.8} opacity={0.3} />

      {/* Life Path number */}
      <text x={cx} y={1082} fontFamily="Georgia, serif" fontSize={128} fontWeight="bold" fill="#d6b25e" textAnchor="middle" filter="url(#glow)" opacity={0.95}>
        {lpNum}
      </text>

      {/* Ribbon banner */}
      <polygon points={ribbonPoints} fill="#0d2535" stroke="#d6b25e" strokeWidth={1.5} opacity={0.95} />
      <text x={cx} y={ribbonY + ribbonH / 2 + 6} fontFamily="sans-serif" fontSize={17} fill="#d6b25e" textAnchor="middle" letterSpacing={2.5} fontWeight={600}>
        LIFE PATH NUMBER {lpNum}  ·  {lpArchetype}
      </text>

      {/* Bottom line */}
      {data.masterNumber ? (
        <text x={cx} y={1320} fontFamily="sans-serif" fontSize={15} fill="#b0986e" textAnchor="middle" letterSpacing={2}>
          {data.masterNumber}:{String(data.masterNumber).padStart(2,"0")}  •  Master Number {data.masterNumber} · {MASTER_NUMBER_MEANINGS[data.masterNumber] ?? "Vision"}
        </text>
      ) : (
        <text x={cx} y={1320} fontFamily="sans-serif" fontSize={13} fill="#64748b" textAnchor="middle" letterSpacing={1}>
          Soul Codex  •  {todayStr}
        </text>
      )}
    </svg>
  );
}

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

export type PosterVariant = "free" | "premium";

const ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ZODIAC_GLYPHS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

const LIFE_PATH_ARCHETYPES: Record<number, string> = {
  1: "THE PIONEER", 2: "THE DIPLOMAT", 3: "THE COMMUNICATOR",
  4: "THE BUILDER", 5: "THE EXPLORER", 6: "THE NURTURER",
  7: "THE SEEKER", 8: "THE EXECUTIVE", 9: "THE HUMANITARIAN",
  11: "THE INTUITIVE", 22: "THE MASTER BUILDER", 33: "THE TEACHER",
};

const MASTER_NUMBER_MEANINGS: Record<number, string> = {
  11: "Intuition", 22: "Mastery", 33: "Compassion",
};

const STARS: [number, number, number][] = [
  [52,18,1.2],[118,44,0.8],[210,12,1.5],[340,28,1],[480,8,0.9],[620,35,1.3],[750,15,0.8],[880,42,1.1],[980,20,0.7],[1050,55,1.2],
  [30,90,0.7],[160,110,1.4],[290,75,0.9],[430,95,0.8],[570,80,1.2],[710,105,0.7],[840,88,1.5],[970,72,1],[1040,100,0.8],[80,140,1.1],
  [195,160,0.9],[325,130,1.3],[465,155,0.7],[600,145,1],[735,135,0.8],[865,160,1.2],[1010,148,0.9],[45,190,0.7],[175,200,1.4],[310,185,0.8],
  [450,210,1.1],[590,195,0.9],[730,205,0.7],[870,190,1.3],[1000,200,0.8],[70,240,1],[200,230,0.9],[355,248,0.7],[490,235,1.2],[640,245,0.8],
  [780,238,1.1],[920,250,0.9],[1055,232,0.7],[35,285,1.2],[165,275,0.8],[305,290,1],[445,278,0.7],[590,285,1.3],[730,280,0.9],[870,290,0.8],
  [1010,275,1.1],[60,320,0.7],[190,312,1.2],[330,328,0.9],[470,315,0.8],[610,322,1.1],[750,310,0.7],[890,325,1],[1030,318,0.8],[95,355,1.3],[230,345,0.9],
];

const PLANET_LABELS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  north_node: "☊", chiron: "⚷",
};

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
  return `${hour}:${String(m).padStart(2,"0")} ${ampm}`;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function escapeXml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

export function buildPosterSvg(data: PosterData, variant: PosterVariant = "free"): string {
  if (variant === "premium") {
    return buildPremiumPosterSvg(data);
  }
  return buildFreePosterSvg(data);
}

function buildFreePosterSvg(data: PosterData): string {
  const cx = 540, cy = 620;
  const outerR = 440, ringTextR = 420, wheelR = 370, glyphR = 344, planetR = 305, innerR = 232;

  const ringText = [
    `SUN IN ${data.sunSign.toUpperCase()}`,
    data.moonSign ? `MOON IN ${data.moonSign.toUpperCase()}` : null,
    data.risingSign ? `RISING ${data.risingSign.toUpperCase()}` : null,
  ].filter(Boolean).join("  ·  ") + "  ·  ";

  const lpNum = data.lifePathNumber;
  const lpArchetype = LIFE_PATH_ARCHETYPES[lpNum] ?? "THE PATHFINDER";
  const nameText = escapeXml(data.name || "Soul Codex");
  const birthDateStr = escapeXml(formatDate(data.birthDate));
  const birthTimeStr = formatTime(data.birthTime);
  const locationStr = escapeXml(data.birthLocation ?? "");

  const segFills = ["#f4f6f8", "#eaecf0"];

  const segments = ZODIAC_SIGNS.map((sign, i) => {
    const startDeg = i * 30;
    const endDeg   = (i + 1) * 30;
    const [x1, y1] = polarToXY(cx, cy, wheelR, startDeg);
    const [x2, y2] = polarToXY(cx, cy, wheelR, endDeg);
    const [ix1, iy1] = polarToXY(cx, cy, innerR, endDeg);
    const [ix2, iy2] = polarToXY(cx, cy, innerR, startDeg);
    const path = `M ${x1} ${y1} A ${wheelR} ${wheelR} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
    const [gx, gy] = polarToXY(cx, cy, glyphR, startDeg + 15);
    const highlight = sign === data.sunSign || sign === data.moonSign || sign === data.risingSign;
    return `<path d="${path}" fill="${highlight ? "#dbeafe" : segFills[i % 2]}" stroke="#9ca3af" stroke-width="0.7"/>
     <text x="${gx}" y="${gy}" font-family="serif" font-size="21" fill="${highlight ? "#1e40af" : "#374151"}" text-anchor="middle" dominant-baseline="central" opacity="${highlight ? 1 : 0.7}">${ZODIAC_GLYPHS[i]}</text>`;
  }).join("");

  const planetDotsSvg = (data.planets ?? []).map(p => {
    const label = PLANET_LABELS[p.name.toLowerCase()] ?? p.name.slice(0,2);
    const deg = ((p.longitude % 360) + 360) % 360;
    const [px, py] = polarToXY(cx, cy, planetR, deg);
    return `<circle cx="${px}" cy="${py}" r="15" fill="#ffffff" stroke="#374151" stroke-width="1.2"/>
     <text x="${px}" y="${py + 1}" font-family="serif" font-size="14" fill="#111827" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`;
  }).join("");

  const ribbonY = 1105, ribbonW = 700, ribbonH = 50;
  const ribbonX = cx - ribbonW / 2;
  const notch = 26;
  const ribbonPath = `${ribbonX},${ribbonY} ${ribbonX+ribbonW},${ribbonY} ${ribbonX+ribbonW+notch},${ribbonY+ribbonH/2} ${ribbonX+ribbonW},${ribbonY+ribbonH} ${ribbonX},${ribbonY+ribbonH} ${ribbonX-notch},${ribbonY+ribbonH/2}`;

  const masterLine = data.masterNumber
    ? `<text x="${cx}" y="1214" font-family="Georgia, serif" font-size="42" fill="#374151" text-anchor="middle" letter-spacing="4">${data.masterNumber}:${String(data.masterNumber).padStart(2,"0")}</text>
       <text x="${cx}" y="1255" font-family="sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" letter-spacing="2" font-style="italic">Master Number ${data.masterNumber} · ${escapeXml(MASTER_NUMBER_MEANINGS[data.masterNumber] ?? "Vision")}</text>`
    : `<text x="${cx}" y="1230" font-family="sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" letter-spacing="1">Soul Codex  ·  ${new Date().getFullYear()}</text>`;

  const ringPathId = "ringTextPath";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <path id="${ringPathId}" d="M ${cx - ringTextR} ${cy} a ${ringTextR} ${ringTextR} 0 1 1 0.01 0"/>
  </defs>

  <!-- White background -->
  <rect width="1080" height="1350" fill="#ffffff"/>

  <!-- Header label -->
  <text x="${cx}" y="50" font-family="sans-serif" font-size="12" fill="#6b7280" text-anchor="middle" letter-spacing="5">SOUL CODEX  ·  BIRTH CHART</text>
  <line x1="${cx-220}" y1="62" x2="${cx+220}" y2="62" stroke="#d1d5db" stroke-width="0.8"/>

  <!-- Outer decorative rings -->
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#374151" stroke-width="1.2" opacity="0.4"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR - 8}" fill="none" stroke="#374151" stroke-width="0.4" opacity="0.2"/>

  <!-- Ring text -->
  <text font-family="sans-serif" font-size="13" fill="#374151" letter-spacing="2.2" opacity="0.6">
    <textPath href="#${ringPathId}" startOffset="0%">${escapeXml(ringText.repeat(3))}</textPath>
  </text>

  <!-- Zodiac wheel segments -->
  ${segments}

  <!-- Wheel rings -->
  <circle cx="${cx}" cy="${cy}" r="${wheelR}" fill="none" stroke="#6b7280" stroke-width="0.8" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR + 2}" fill="none" stroke="#6b7280" stroke-width="0.6" opacity="0.35"/>

  <!-- Planet ring guide -->
  <circle cx="${cx}" cy="${cy}" r="${planetR}" fill="none" stroke="#9ca3af" stroke-width="0.4" stroke-dasharray="3 8" opacity="0.4"/>

  <!-- Planet markers -->
  ${planetDotsSvg}

  <!-- Inner circle -->
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#f9fafb"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR - 2}" fill="none" stroke="#9ca3af" stroke-width="0.5" opacity="0.4"/>

  <!-- Center text -->
  ${data.name ? `<text x="${cx}" y="${cy - 70}" font-family="sans-serif" font-size="13" fill="#6b7280" text-anchor="middle" letter-spacing="3">${nameText.toUpperCase()}</text>` : ""}
  <text x="${cx}" y="${cy - 28}" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#111827" text-anchor="middle">${birthDateStr}</text>
  <circle cx="${cx}" cy="${cy + 2}" r="3" fill="#9ca3af" opacity="0.6"/>
  ${birthTimeStr ? `<text x="${cx}" y="${cy + 28}" font-family="Georgia, serif" font-size="22" fill="#374151" text-anchor="middle">${escapeXml(birthTimeStr)}</text>` : ""}
  ${locationStr ? `<text x="${cx}" y="${cy + (birthTimeStr ? 58 : 34)}" font-family="sans-serif" font-size="15" fill="#6b7280" text-anchor="middle">${locationStr}</text>` : ""}

  <!-- Divider -->
  <line x1="${cx - 320}" y1="1016" x2="${cx + 320}" y2="1016" stroke="#d1d5db" stroke-width="0.8"/>

  <!-- Life path number -->
  <text x="${cx}" y="1098" font-family="Georgia, serif" font-size="120" font-weight="bold" fill="#1f2937" text-anchor="middle" opacity="0.9">${lpNum}</text>

  <!-- Ribbon banner -->
  <polygon points="${ribbonPath}" fill="#1f2937"/>
  <text x="${cx}" y="${ribbonY + ribbonH / 2 + 6}" font-family="sans-serif" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="2.5" font-weight="600">LIFE PATH NUMBER ${lpNum}  ·  ${escapeXml(lpArchetype)}</text>

  <!-- Master number / footer -->
  ${masterLine}

  <!-- Bottom star -->
  <text x="${cx}" y="1320" font-family="sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" opacity="0.4">✦</text>
</svg>`;
}

function buildPremiumPosterSvg(data: PosterData): string {
  const cx = 540, cy = 620;
  const outerR = 450, ringTextR = 430, wheelR = 380, glyphR = 355, planetR = 310, innerR = 240;

  const ringText = [
    `SUN IN ${data.sunSign.toUpperCase()}`,
    data.moonSign ? `MOON IN ${data.moonSign.toUpperCase()}` : null,
    data.risingSign ? `RISING ${data.risingSign.toUpperCase()}` : null,
  ].filter(Boolean).join("  ·  ") + "  ·  ";

  const lpNum = data.lifePathNumber;
  const lpArchetype = LIFE_PATH_ARCHETYPES[lpNum] ?? "THE PATHFINDER";
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const nameText = escapeXml(data.name || "Soul Codex");
  const birthDateStr = escapeXml(formatDate(data.birthDate));
  const birthTimeStr = formatTime(data.birthTime);
  const locationStr = escapeXml(data.birthLocation ?? "");

  const segmentFills = ["rgba(13,37,53,0.85)","rgba(7,16,19,0.92)"];

  const segments = ZODIAC_SIGNS.map((sign, i) => {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const [gx, gy] = polarToXY(cx, cy, glyphR, startDeg + 15);
    const [x1, y1] = polarToXY(cx, cy, wheelR, startDeg);
    const [x2, y2] = polarToXY(cx, cy, wheelR, endDeg);
    const [ix1, iy1] = polarToXY(cx, cy, innerR, endDeg);
    const [ix2, iy2] = polarToXY(cx, cy, innerR, startDeg);
    const path = `M ${x1} ${y1} A ${wheelR} ${wheelR} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
    const highlight = sign === data.sunSign || sign === data.moonSign || sign === data.risingSign;
    return `<path d="${path}" fill="${highlight ? "rgba(30,70,60,0.6)" : segmentFills[i % 2]}" stroke="#d6b25e" stroke-width="0.8"/>
     <text x="${gx}" y="${gy}" font-family="serif" font-size="18" fill="${highlight ? "#e8d28a" : "#d6b25e"}" text-anchor="middle" dominant-baseline="central" opacity="${highlight ? 1 : 0.85}">${ZODIAC_GLYPHS[i]}</text>`;
  }).join("");

  const planetDotsSvg = (data.planets ?? []).map(p => {
    const label = PLANET_LABELS[p.name.toLowerCase()] ?? p.name.slice(0,2);
    const deg = ((p.longitude % 360) + 360) % 360;
    const [px, py] = polarToXY(cx, cy, planetR, deg);
    return `<circle cx="${px}" cy="${py}" r="14" fill="rgba(15,25,40,0.85)" stroke="#d6b25e" stroke-width="1.5" opacity="0.95"/>
     <text x="${px}" y="${py + 1}" font-family="serif" font-size="14" fill="#d6b25e" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`;
  }).join("");

  const stars = STARS.map(([sx, sy, sr]) =>
    `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="white" opacity="${Math.min(0.85, 0.3 + sr * 0.3).toFixed(2)}"/>`
  ).join("");

  const ribbonY = 1090;
  const ribbonW = 680, ribbonH = 48;
  const ribbonX = cx - ribbonW / 2;
  const notchSize = 24;
  const ribbonPath = `M ${ribbonX} ${ribbonY} L ${ribbonX + ribbonW} ${ribbonY} L ${ribbonX + ribbonW + notchSize} ${ribbonY + ribbonH / 2} L ${ribbonX + ribbonW} ${ribbonY + ribbonH} L ${ribbonX} ${ribbonY + ribbonH} L ${ribbonX - notchSize} ${ribbonY + ribbonH / 2} Z`;

  const masterLine = data.masterNumber
    ? `<text x="${cx}" y="1218" font-family="Georgia, serif" font-size="42" fill="#5ac8d8" text-anchor="middle" letter-spacing="4">${data.masterNumber}:${String(data.masterNumber).padStart(2,"0")}</text>
       <text x="${cx}" y="1258" font-family="sans-serif" font-size="14" fill="#b0c8d8" text-anchor="middle" letter-spacing="2" font-style="italic">Master Number ${data.masterNumber} · ${escapeXml(MASTER_NUMBER_MEANINGS[data.masterNumber] ?? "Vision")}</text>`
    : `<text x="${cx}" y="1318" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle" letter-spacing="1">Soul Codex  ·  ${escapeXml(todayStr)}</text>`;

  const ringPathId = "ringTextPath";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#0c3038"/>
      <stop offset="40%" stop-color="#071e25"/>
      <stop offset="75%" stop-color="#041318"/>
      <stop offset="100%" stop-color="#02080c"/>
    </linearGradient>
    <path id="${ringPathId}" d="M ${cx - ringTextR} ${cy} a ${ringTextR} ${ringTextR} 0 1 1 0.01 0"/>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1350" fill="url(#bg)"/>

  <!-- Stars -->
  ${stars}

  <!-- Outer decorative ring -->
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#d6b25e" stroke-width="1.5" opacity="0.45"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR - 8}" fill="none" stroke="#d6b25e" stroke-width="0.5" opacity="0.15"/>

  <!-- Ring text -->
  <text font-family="sans-serif" font-size="15" fill="#d6b25e" letter-spacing="2.5" opacity="0.85">
    <textPath href="#${ringPathId}" startOffset="0%">${escapeXml(ringText.repeat(3))}</textPath>
  </text>

  <!-- Zodiac wheel segments -->
  ${segments}

  <!-- Wheel rings -->
  <circle cx="${cx}" cy="${cy}" r="${wheelR}" fill="none" stroke="#d6b25e" stroke-width="1" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR + 2}" fill="none" stroke="#d6b25e" stroke-width="0.8" opacity="0.35"/>

  <!-- Planet ring guide -->
  <circle cx="${cx}" cy="${cy}" r="${planetR}" fill="none" stroke="#d6b25e" stroke-width="0.5" stroke-dasharray="3 8" opacity="0.12"/>

  <!-- Planet markers -->
  ${planetDotsSvg}

  <!-- Inner circle -->
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#071013" stroke="#d6b25e" stroke-width="1" opacity="0.95"/>

  <!-- Center text -->
  ${data.name ? `<text x="${cx}" y="${cy - 70}" font-family="sans-serif" font-size="13" fill="#d6b25e" text-anchor="middle" letter-spacing="3" opacity="0.65">${nameText.toUpperCase()}</text>` : ""}
  <text x="${cx}" y="${cy - 28}" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#f8fafc" text-anchor="middle">${birthDateStr}</text>
  <circle cx="${cx}" cy="${cy + 2}" r="3" fill="#d6b25e" opacity="0.6"/>
  ${birthTimeStr ? `<text x="${cx}" y="${cy + 28}" font-family="Georgia, serif" font-size="22" fill="#d6b25e" text-anchor="middle">${escapeXml(birthTimeStr)}</text>` : ""}
  ${locationStr ? `<text x="${cx}" y="${cy + (birthTimeStr ? 62 : 40)}" font-family="sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle">${locationStr}</text>` : ""}

  <!-- Thin divider line below wheel -->
  <line x1="${cx - 300}" y1="1000" x2="${cx + 300}" y2="1000" stroke="#d6b25e" stroke-width="0.8" opacity="0.35"/>

  <!-- Life Path number -->
  <text x="${cx}" y="1080" font-family="Georgia, serif" font-size="130" font-weight="bold" fill="#d6b25e" text-anchor="middle" filter="url(#softGlow)" opacity="0.95">${lpNum}</text>

  <!-- Banner ribbon -->
  <path d="${ribbonPath}" fill="#071e25" stroke="#d6b25e" stroke-width="1.5" opacity="0.97"/>
  <text x="${cx}" y="${ribbonY + ribbonH / 2 + 6}" font-family="sans-serif" font-size="17" fill="#d6b25e" text-anchor="middle" letter-spacing="2.5" font-weight="600">LIFE PATH NUMBER ${lpNum}  ·  ${escapeXml(lpArchetype)}</text>

  <!-- Bottom master number / date line -->
  ${masterLine}

  <!-- Bottom glow star -->
  <text x="${cx}" y="1340" font-family="sans-serif" font-size="16" fill="#d6b25e" text-anchor="middle" opacity="0.3">✦</text>

  <!-- Top header -->
  <text x="${cx}" y="55" font-family="sans-serif" font-size="13" fill="#d6b25e" text-anchor="middle" letter-spacing="4" opacity="0.6">SOUL CODEX  ·  BIRTH CHART</text>
  <line x1="${cx - 220}" y1="68" x2="${cx + 220}" y2="68" stroke="#d6b25e" stroke-width="0.5" opacity="0.2"/>
</svg>`;
}

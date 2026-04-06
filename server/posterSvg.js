const ZODIAC_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const LIFE_PATH_ARCHETYPES = {
    1: "THE PIONEER", 2: "THE DIPLOMAT", 3: "THE COMMUNICATOR",
    4: "THE BUILDER", 5: "THE EXPLORER", 6: "THE NURTURER",
    7: "THE SEEKER", 8: "THE EXECUTIVE", 9: "THE HUMANITARIAN",
    11: "THE INTUITIVE", 22: "THE MASTER BUILDER", 33: "THE TEACHER",
};
const MASTER_NUMBER_MEANINGS = {
    11: "Intuition", 22: "Mastery", 33: "Compassion",
};
const STARS = [
    [52, 18, 1.2], [118, 44, 0.8], [210, 12, 1.5], [340, 28, 1], [480, 8, 0.9], [620, 35, 1.3], [750, 15, 0.8], [880, 42, 1.1], [980, 20, 0.7], [1050, 55, 1.2],
    [30, 90, 0.7], [160, 110, 1.4], [290, 75, 0.9], [430, 95, 0.8], [570, 80, 1.2], [710, 105, 0.7], [840, 88, 1.5], [970, 72, 1], [1040, 100, 0.8], [80, 140, 1.1],
    [195, 160, 0.9], [325, 130, 1.3], [465, 155, 0.7], [600, 145, 1], [735, 135, 0.8], [865, 160, 1.2], [1010, 148, 0.9], [45, 190, 0.7], [175, 200, 1.4], [310, 185, 0.8],
    [450, 210, 1.1], [590, 195, 0.9], [730, 205, 0.7], [870, 190, 1.3], [1000, 200, 0.8], [70, 240, 1], [200, 230, 0.9], [355, 248, 0.7], [490, 235, 1.2], [640, 245, 0.8],
    [780, 238, 1.1], [920, 250, 0.9], [1055, 232, 0.7], [35, 285, 1.2], [165, 275, 0.8], [305, 290, 1], [445, 278, 0.7], [590, 285, 1.3], [730, 280, 0.9], [870, 290, 0.8],
    [1010, 275, 1.1], [60, 320, 0.7], [190, 312, 1.2], [330, 328, 0.9], [470, 315, 0.8], [610, 322, 1.1], [750, 310, 0.7], [890, 325, 1], [1030, 318, 0.8], [95, 355, 1.3], [230, 345, 0.9],
];
const PLANET_LABELS = {
    sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
    jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
    north_node: "☊",
};
function formatDate(iso) {
    try {
        const d = new Date(iso + "T12:00:00");
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    catch {
        return iso;
    }
}
function formatTime(t) {
    if (!t)
        return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}
function polarToXY(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function arcPath(cx, cy, r, startDeg, endDeg) {
    const [x1, y1] = polarToXY(cx, cy, r, startDeg);
    const [x2, y2] = polarToXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}
export function buildPosterSvg(data) {
    const cx = 540, cy = 620;
    const outerR = 450, ringTextR = 430, wheelR = 380, glyphR = 355, planetR = 310, innerR = 240;
    const ringText = [
        `SUN IN ${data.sunSign.toUpperCase()}`,
        data.moonSign ? `MOON IN ${data.moonSign.toUpperCase()}` : null,
        data.risingSign ? `RISING ${data.risingSign.toUpperCase()}` : null,
    ].filter(Boolean).join("  •  ") + "  •  ";
    const lpNum = data.lifePathNumber;
    const lpArchetype = LIFE_PATH_ARCHETYPES[lpNum] ?? "THE PATHFINDER";
    const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const segmentFills = ["rgba(13,37,53,0.85)", "rgba(7,16,19,0.92)"];
    const segments = ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = i * 30;
        const endDeg = (i + 1) * 30;
        const midDeg = startDeg + 15;
        const [gx, gy] = polarToXY(cx, cy, glyphR, startDeg + 15);
        const [x1, y1] = polarToXY(cx, cy, wheelR, startDeg);
        const [x2, y2] = polarToXY(cx, cy, wheelR, endDeg);
        const [ix1, iy1] = polarToXY(cx, cy, innerR, endDeg);
        const [ix2, iy2] = polarToXY(cx, cy, innerR, startDeg);
        const path = `M ${x1} ${y1} A ${wheelR} ${wheelR} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
        return { sign, glyph: ZODIAC_GLYPHS[i], path, gx, gy, fill: segmentFills[i % 2], midDeg };
    });
    const planetDots = (data.planets ?? []).map(p => {
        const label = PLANET_LABELS[p.name.toLowerCase()] ?? p.name.slice(0, 2);
        const deg = p.longitude % 360;
        const [px, py] = polarToXY(cx, cy, planetR, deg);
        return { label, px, py };
    });
    const ringPathId = "ringTextPath";
    const stars = STARS.map(([sx, sy, sr]) => `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="white" opacity="${(0.3 + sr * 0.3).toFixed(2)}"/>`).join("");
    const segmentPaths = segments.map(s => `<path d="${s.path}" fill="${s.fill}" stroke="#d6b25e" stroke-width="0.8"/>
     <text x="${s.gx}" y="${s.gy}" font-family="serif" font-size="18" fill="#d6b25e" text-anchor="middle" dominant-baseline="central" opacity="0.85">${s.glyph}</text>`).join("");
    const planetDotsSvg = planetDots.map(d => `<circle cx="${d.px}" cy="${d.py}" r="14" fill="rgba(15,25,40,0.85)" stroke="#d6b25e" stroke-width="1.5" opacity="0.95"/>
     <text x="${d.px}" y="${d.py + 1}" font-family="serif" font-size="14" fill="#d6b25e" text-anchor="middle" dominant-baseline="central">${d.label}</text>`).join("");
    const nameText = data.name || "Soul Codex";
    const birthDateStr = formatDate(data.birthDate);
    const birthTimeStr = formatTime(data.birthTime);
    const locationStr = data.birthLocation ?? "";
    const centerY = cy;
    const centerLines = [
        `<text x="${cx}" y="${centerY - 30}" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#f8fafc" text-anchor="middle">${escapeXml(nameText)}</text>`,
        `<text x="${cx}" y="${centerY + 10}" font-family="Georgia, serif" font-size="20" fill="#d6b25e" text-anchor="middle">${escapeXml(birthDateStr)}</text>`,
        birthTimeStr ? `<text x="${cx}" y="${centerY + 38}" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">${escapeXml(birthTimeStr)}</text>` : "",
        locationStr ? `<text x="${cx}" y="${centerY + (birthTimeStr ? 62 : 40)}" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">${escapeXml(locationStr)}</text>` : "",
    ].filter(Boolean);
    const ribbonY = 1090;
    const ribbonW = 680, ribbonH = 48;
    const ribbonX = cx - ribbonW / 2;
    const notchSize = 24;
    const ribbonPath = `M ${ribbonX} ${ribbonY} L ${ribbonX + ribbonW} ${ribbonY} L ${ribbonX + ribbonW + notchSize} ${ribbonY + ribbonH / 2} L ${ribbonX + ribbonW} ${ribbonY + ribbonH} L ${ribbonX} ${ribbonY + ribbonH} L ${ribbonX - notchSize} ${ribbonY + ribbonH / 2} Z`;
    const masterLine = data.masterNumber
        ? `<text x="${cx}" y="1318" font-family="sans-serif" font-size="15" fill="#b0986e" text-anchor="middle" letter-spacing="2">${data.masterNumber}:${data.masterNumber}  •  Master Number ${data.masterNumber} · ${MASTER_NUMBER_MEANINGS[data.masterNumber] ?? "Vision"}</text>`
        : `<text x="${cx}" y="1318" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle" letter-spacing="1">Soul Codex  •  ${escapeXml(todayStr)}</text>`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#0a1a24"/>
      <stop offset="55%" stop-color="#071013"/>
      <stop offset="100%" stop-color="#0d2535"/>
    </linearGradient>
    <path id="${ringPathId}" d="M ${cx - ringTextR} ${cy} a ${ringTextR} ${ringTextR} 0 1 1 0.01 0"/>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1350" fill="url(#bg)"/>

  <!-- Stars -->
  ${stars}

  <!-- Outer decorative ring -->
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#d6b25e" stroke-width="1.5" opacity="0.4"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR - 8}" fill="none" stroke="#d6b25e" stroke-width="0.5" opacity="0.2"/>

  <!-- Ring text -->
  <text font-family="sans-serif" font-size="15" fill="#d6b25e" letter-spacing="2.5" opacity="0.85">
    <textPath href="#${ringPathId}" startOffset="0%">${escapeXml(ringText.repeat(3))}</textPath>
  </text>

  <!-- Zodiac wheel segments -->
  ${segmentPaths}

  <!-- Inner circle (center area) -->
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#071013" stroke="#d6b25e" stroke-width="1" opacity="0.95"/>

  <!-- Planet dots on planet ring -->
  ${planetDotsSvg}

  <!-- Center text -->
  ${centerLines.join("\n  ")}

  <!-- Thin divider line below wheel -->
  <line x1="${cx - 300}" y1="1000" x2="${cx + 300}" y2="1000" stroke="#d6b25e" stroke-width="0.8" opacity="0.35"/>

  <!-- Life Path number -->
  <text x="${cx}" y="1080" font-family="Georgia, serif" font-size="130" font-weight="bold" fill="#d6b25e" text-anchor="middle" filter="url(#glow)" opacity="0.95">${lpNum}</text>

  <!-- Banner ribbon -->
  <path d="${ribbonPath}" fill="#0d2535" stroke="#d6b25e" stroke-width="1.5" opacity="0.95"/>
  <text x="${cx}" y="${ribbonY + ribbonH / 2 + 6}" font-family="sans-serif" font-size="17" fill="#d6b25e" text-anchor="middle" letter-spacing="2.5" font-weight="600">LIFE PATH NUMBER ${lpNum}  ·  ${escapeXml(lpArchetype)}</text>

  <!-- Bottom master number / date line -->
  ${masterLine}

  <!-- Top header -->
  <text x="${cx}" y="55" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle" letter-spacing="4">SOUL CODEX  •  BIRTH CHART</text>
  <line x1="${cx - 200}" y1="68" x2="${cx + 200}" y2="68" stroke="#d6b25e" stroke-width="0.5" opacity="0.25"/>
</svg>`;
}
function escapeXml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

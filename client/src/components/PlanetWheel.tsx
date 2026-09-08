import { useState } from "react";

interface Planet {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
}

interface Alignment {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  interpretation: string;
}

interface PlanetWheelProps {
  planets: Planet[];
  alignments: Alignment[];
  size?: number;
  natalOverlay?: Planet[];
}

const SIGNS = [
  { name: "Aries", symbol: "ARI" },
  { name: "Taurus", symbol: "TAU" },
  { name: "Gemini", symbol: "GEM" },
  { name: "Cancer", symbol: "CAN" },
  { name: "Leo", symbol: "LEO" },
  { name: "Virgo", symbol: "VIR" },
  { name: "Libra", symbol: "LIB" },
  { name: "Scorpio", symbol: "SCO" },
  { name: "Sagittarius", symbol: "SAG" },
  { name: "Capricorn", symbol: "CAP" },
  { name: "Aquarius", symbol: "AQU" },
  { name: "Pisces", symbol: "PIS" },
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "SUN",
  Moon: "MON",
  Mercury: "MER",
  Venus: "VEN",
  Mars: "MAR",
  Jupiter: "JUP",
  Saturn: "SAT",
  Uranus: "URA",
  Neptune: "NEP",
  Pluto: "PLU",
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "#fbbf24",
  Moon: "#e2e8f0",
  Mercury: "#a78bfa",
  Venus: "#f472b6",
  Mars: "#ef4444",
  Jupiter: "#f59e0b",
  Saturn: "#94a3b8",
  Uranus: "#22d3ee",
  Neptune: "#818cf8",
  Pluto: "#a855f7",
};

const ASPECT_STYLES: Record<string, { color: string; dasharray: string }> = {
  Trine: { color: "#22c55e", dasharray: "6 4" },
  Square: { color: "#ef4444", dasharray: "6 4" },
  Opposition: { color: "#a855f7", dasharray: "" },
  Conjunction: { color: "#fbbf24", dasharray: "" },
  Sextile: { color: "#2dd4bf", dasharray: "6 4" },
};

function longitudeToAngle(longitude: number): number {
  return (270 - longitude + 360) % 360;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

export default function PlanetWheel({ planets, alignments, size = 400, natalOverlay }: PlanetWheelProps) {
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null);

  const cx = 200;
  const cy = 200;
  const outerR = 180;
  const signR = 160;
  const planetR = 135;
  const innerR = 110;
  const natalR = 95;

  const handlePlanetClick = (planet: Planet) => {
    if (activePlanet?.name === planet.name) {
      setActivePlanet(null);
    } else {
      setActivePlanet(planet);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: size }} className="animate-fade-in">
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(124,58,237,0.15)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.1)" />
          </linearGradient>
          <filter id="planetGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={outerR} fill="url(#wheelGrad)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={signR} fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />

        {SIGNS.map((sign, i) => {
          const startAngle = (270 - i * 30 + 360) % 360;
          const endAngle = (270 - (i + 1) * 30 + 360) % 360;
          const p1 = polarToCartesian(cx, cy, outerR, startAngle);
          const p2 = polarToCartesian(cx, cy, innerR, startAngle);

          const midAngle = (startAngle + endAngle + (startAngle > endAngle ? 360 : 0)) / 2;
          const realMid = midAngle > 360 ? midAngle - 360 : midAngle;
          const labelPos = polarToCartesian(cx, cy, (outerR + signR) / 2, realMid);

          return (
            <g key={sign.name}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(167,139,250,0.7)"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {alignments.map((al, i) => {
          const p1 = planets.find((p) => p.name === al.planet1);
          const p2 = planets.find((p) => p.name === al.planet2);
          if (!p1 || !p2) return null;

          const a1 = longitudeToAngle(p1.longitude);
          const a2 = longitudeToAngle(p2.longitude);
          const pos1 = polarToCartesian(cx, cy, planetR, a1);
          const pos2 = polarToCartesian(cx, cy, planetR, a2);
          const style = ASPECT_STYLES[al.aspect] || { color: "#64748b", dasharray: "3 3" };

          return (
            <line
              key={`aspect-${i}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={style.color}
              strokeWidth={al.aspect === "Conjunction" ? "2" : "1"}
              strokeDasharray={style.dasharray}
              opacity="0.5"
            />
          );
        })}

        {planets.map((planet) => {
          const angle = longitudeToAngle(planet.longitude);
          const pos = polarToCartesian(cx, cy, planetR, angle);
          const color = PLANET_COLORS[planet.name] || "#94a3b8";
          const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
          const isActive = activePlanet?.name === planet.name;

          return (
            <g
              key={planet.name}
              style={{ cursor: "pointer" }}
              onClick={() => handlePlanetClick(planet)}
              filter={isActive ? "url(#planetGlow)" : undefined}
            >
              <circle cx={pos.x} cy={pos.y} r={isActive ? 14 : 12} fill="rgba(10,1,24,0.8)" stroke={color} strokeWidth={isActive ? "2" : "1.5"} />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={isActive ? "13" : "11"}
                fontFamily="serif"
                fontWeight="bold"
              >
                {symbol}
              </text>
            </g>
          );
        })}

        {natalOverlay &&
          natalOverlay.map((planet) => {
            const angle = longitudeToAngle(planet.longitude);
            const pos = polarToCartesian(cx, cy, natalR, angle);
            const color = PLANET_COLORS[planet.name] || "#94a3b8";
            const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];

            return (
              <g key={`natal-${planet.name}`} opacity="0.5">
                <circle cx={pos.x} cy={pos.y} r={9} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill={color} fontSize="8" fontFamily="serif">
                  {symbol}
                </text>
              </g>
            );
          })}
      </svg>

      {activePlanet && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "0",
            transform: "translateX(-50%)",
            background: "rgba(15,3,32,0.95)",
            border: "1px solid rgba(139,92,246,0.4)",
            borderRadius: "12px",
            padding: "12px 16px",
            minWidth: "200px",
            zIndex: 10,
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
          onClick={() => setActivePlanet(null)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: PLANET_COLORS[activePlanet.name] || "#94a3b8" }}>
              {PLANET_SYMBOLS[activePlanet.name] || activePlanet.name.slice(0, 3).toUpperCase()}
            </span>
            <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "14px" }}>{activePlanet.name}</span>
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
            <div>
              {activePlanet.sign} {activePlanet.degree.toFixed(1)}°
            </div>
            <div style={{ marginTop: "4px", color: "#a78bfa", fontSize: "12px" }}>{getBehavioralNote(activePlanet.name, activePlanet.sign)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function getBehavioralNote(planet: string, sign: string): string {
  const notes: Record<string, Record<string, string>> = {
    Sun: {
      Aries: "I lead with instinct and impatience.",
      Taurus: "I build slowly and resist being rushed.",
      Gemini: "I process by talking through every angle.",
      Cancer: "I protect what matters, sometimes too tightly.",
      Leo: "I need to be seen and I perform best when I am.",
      Virgo: "I fix problems before anyone asks me to.",
      Libra: "I weigh options endlessly to avoid conflict.",
      Scorpio: "I go deep or not at all.",
      Sagittarius: "I chase meaning and resist being pinned down.",
      Capricorn: "I earn my place and expect others to do the same.",
      Aquarius: "I detach to see the bigger pattern.",
      Pisces: "I absorb everything around me, for better or worse.",
    },
    Moon: {
      Aries: "My emotions hit fast and burn out quick.",
      Taurus: "I need comfort and stability to feel safe.",
      Gemini: "I process feelings by analyzing them out loud.",
      Cancer: "My moods run deep and shift with the tides.",
      Leo: "I need warmth and recognition to feel loved.",
      Virgo: "I worry as a way of caring.",
      Libra: "I seek harmony and avoid emotional extremes.",
      Scorpio: "I feel everything intensely and hide most of it.",
      Sagittarius: "I escape heavy emotions by moving forward.",
      Capricorn: "I contain my feelings behind discipline.",
      Aquarius: "I observe my emotions from a distance.",
      Pisces: "I feel what everyone around me feels.",
    },
  };

  if (notes[planet]?.[sign]) return notes[planet][sign];

  const genericPlanetNotes: Record<string, string> = {
    Mercury: "How I think and communicate right now.",
    Venus: "What I value and find attractive today.",
    Mars: "Where my energy and drive are focused.",
    Jupiter: "Where I feel expansion and opportunity.",
    Saturn: "Where I feel pressure and responsibility.",
    Uranus: "Where I crave change and independence.",
    Neptune: "Where my imagination runs, for better or worse.",
    Pluto: "Where deep transformation is happening beneath the surface.",
  };

  return genericPlanetNotes[planet] || `${planet} in ${sign} — pay attention to how this shapes my day.`;
}

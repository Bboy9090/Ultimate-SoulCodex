import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";

const PLANETS = [
  { key: "sun", label: "Sun", glyph: "☉", theme: "Identity", meaning: "The symbolic lens for vitality, purpose, and conscious self-expression." },
  { key: "moon", label: "Moon", glyph: "☽", theme: "Emotional needs", meaning: "The symbolic lens for emotional rhythms, safety, and instinctive responses." },
  { key: "mercury", label: "Mercury", glyph: "☿", theme: "Communication", meaning: "The symbolic lens for thinking, language, learning, and interpretation." },
  { key: "venus", label: "Venus", glyph: "♀", theme: "Values and connection", meaning: "The symbolic lens for attraction, aesthetics, affection, and personal values." },
  { key: "mars", label: "Mars", glyph: "♂", theme: "Action", meaning: "The symbolic lens for initiative, drive, conflict, and boundaries." },
  { key: "jupiter", label: "Jupiter", glyph: "♃", theme: "Growth", meaning: "The symbolic lens for opportunity, perspective, learning, and expansion." },
  { key: "saturn", label: "Saturn", glyph: "♄", theme: "Structure", meaning: "The symbolic lens for limits, responsibility, patience, and commitment." },
  { key: "uranus", label: "Uranus", glyph: "♅", theme: "Change", meaning: "The symbolic lens for independence, innovation, and disruption." },
  { key: "neptune", label: "Neptune", glyph: "♆", theme: "Imagination", meaning: "The symbolic lens for ideals, dreams, uncertainty, and inspiration." },
  { key: "pluto", label: "Pluto", glyph: "♇", theme: "Transformation", meaning: "The symbolic lens for deep change, power, endings, and renewal." },
] as const;

type PlanetKey = (typeof PLANETS)[number]["key"];

export default function InteractivePlanetaryPreview() {
  const reducedMotion = useReducedMotion();
  const [selectedKey, setSelectedKey] = useState<PlanetKey>("sun");
  const selected = PLANETS.find((planet) => planet.key === selectedKey) ?? PLANETS[0];

  return (
    <section
      className="sc-panel sc-panel-gold mx-auto max-w-5xl overflow-hidden p-5 sm:p-7"
      aria-label="Educational interactive planetary explorer"
      data-testid="planetary-educational-preview"
    >
      <p className="sc-eyebrow">Interactive planetary explorer · no profile needed</p>
      <h2 className="mt-2 font-serif text-3xl text-[var(--sc-ivory)]">Explore every planet before your chart is ready.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
        Select a planet to learn what it represents in astrology. This is an educational
        interface, not a personal chart: the positions are decorative, not calculated
        birth positions, zodiac signs, house placements, or live sky positions.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,480px)_1fr] lg:items-center">
        <div className="mx-auto aspect-square w-full max-w-[480px]">
          <svg viewBox="0 0 360 360" className="h-full w-full" role="img" aria-label="Decorative ring of ten selectable planetary symbols">
            <circle cx="180" cy="180" r="147" fill="none" stroke="rgba(217,182,111,.23)" />
            <circle cx="180" cy="180" r="104" fill="none" stroke="rgba(154,116,220,.17)" strokeDasharray="4 8" />
            <circle cx="180" cy="180" r="58" fill="rgba(217,182,111,.045)" stroke="rgba(217,182,111,.14)" />
            <motion.g
              aria-hidden="true"
              style={{ transformOrigin: "180px 180px" }}
              animate={reducedMotion ? undefined : { rotate: [0, 360] }}
              transition={reducedMotion ? undefined : { duration: 95, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="180" cy="33" r="2" fill="rgba(114,216,197,.8)" />
              <circle cx="327" cy="180" r="2" fill="rgba(217,182,111,.8)" />
              <circle cx="180" cy="327" r="2" fill="rgba(154,116,220,.8)" />
            </motion.g>
            {PLANETS.map((planet, index) => {
              const angle = (index * Math.PI * 2) / PLANETS.length - Math.PI / 2;
              const x = 180 + Math.cos(angle) * 122;
              const y = 180 + Math.sin(angle) * 122;
              const active = planet.key === selectedKey;
              return (
                <g
                  key={planet.key}
                  role="button"
                  tabIndex={0}
                  aria-label={"Explore " + planet.label}
                  aria-pressed={active}
                  onClick={() => setSelectedKey(planet.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedKey(planet.key);
                    }
                  }}
                  className="cursor-pointer outline-none focus-visible:opacity-70"
                >
                  <circle
                    cx={x} cy={y} r={active ? 19 : 17}
                    fill={active ? "rgba(217,182,111,.18)" : "rgba(8,6,13,.94)"}
                    stroke={active ? "#efd08d" : "rgba(245,234,215,.4)"}
                    strokeWidth={active ? 2 : 1}
                  />
                  <text
                    x={x} y={y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={active ? "#efd08d" : "#f5ead7"}
                    fontSize={active ? 22 : 19}
                    pointerEvents="none"
                  >
                    {planet.glyph}
                  </text>
                </g>
              );
            })}
            <text x="180" y="180" textAnchor="middle" dominantBaseline="middle" fill="#efd08d" fontSize="23" aria-hidden="true">✦</text>
          </svg>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.035)] p-5" aria-live="polite" data-testid="planetary-preview-selection">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">{selected.glyph} {selected.label}</p>
            <h3 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">{selected.theme}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{selected.meaning}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PLANETS.map((planet) => (
              <button
                key={planet.key}
                type="button"
                aria-pressed={selectedKey === planet.key}
                onClick={() => setSelectedKey(planet.key)}
                className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3 py-3 text-left text-sm text-[var(--sc-ivory)] transition hover:border-[var(--sc-gold)] focus-visible:outline focus-visible:outline-2"
              >
                {planet.glyph} {planet.label}
              </button>
            ))}
          </div>
          <Link href="/create" className="sc-button-primary inline-flex">Create your profile for a personal chart</Link>
          <p className="text-xs leading-5 text-[var(--sc-stone)]">
            Personal degrees, houses, and aspects appear only when supported by the saved profile and its verification evidence.
          </p>
        </div>
      </div>
    </section>
  );
}

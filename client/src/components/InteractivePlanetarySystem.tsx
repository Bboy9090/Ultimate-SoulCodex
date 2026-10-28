import { chartPlacementReading } from "@/lib/chartPlacementReading";
import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { UltimateCodexPlacement, UltimateCodexSynthesis } from "@/lib/ultimateCodexSynthesis";

const GLYPH: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
};

const SIGN_GLYPH = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const SIGN_NAMES = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function pointFor(longitude: number, radius = 132) {
  const radians = ((longitude - 90) * Math.PI) / 180;
  return {
    x: 180 + radius * Math.cos(radians),
    y: 180 + radius * Math.sin(radians),
  };
}

function placementSummary(placement: UltimateCodexPlacement) {
  const degree = placement.degree === null ? "" : ` · ${placement.degree.toFixed(2)}°`;
  const house = placement.house === null ? "" : ` · House ${placement.house}`;
  const evidence = placement.evidenceState === "verified" ? "verified" : "stable across birth-time range";
  return `${placement.sign}${degree}${house} · ${evidence}`;
}

export default function InteractivePlanetarySystem({
  synthesis,
}: {
  synthesis: UltimateCodexSynthesis;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const reducedMotion = prefersReducedMotion || motionPaused;
  const coreGradientId = useId();
  const [selectedKey, setSelectedKey] = useState<string | null>(
    synthesis.placements[0]?.key ?? null,
  );

  const drawable = useMemo(
    () => synthesis.placements.filter((placement) => placement.longitude !== null),
    [synthesis.placements],
  );
  const signOnly = useMemo(
    () => synthesis.placements.filter((placement) => placement.longitude === null),
    [synthesis.placements],
  );
  const selected =
    synthesis.placements.find((placement) => placement.key === selectedKey) ??
    synthesis.placements[0] ??
    null;

  const selectedReading = selected ? chartPlacementReading(selected.key, selected.sign, selected.house, placementSummary(selected)) : null;

  return (
    <section className="sc-panel sc-panel-gold mb-6 overflow-hidden p-5 sm:p-7" data-testid="interactive-planetary-system">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="sc-eyebrow">Interactive planetary system</p>
          <h2 className="mt-2 font-serif text-3xl font-medium text-[var(--sc-ivory)]">
            Touch the chart. See what is actually known.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
            Planets with evidence-qualified zodiac longitude are placed on the zodiac wheel. Stable sign-only placements stay interactive without inventing an exact degree. Motion is interface animation only—not a claim about real-time transit speed.
          </p>
        </div>
        <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] px-3 py-1 text-xs font-semibold text-[var(--sc-gold-bright)]">
          {synthesis.placements.length} supported placement{synthesis.placements.length === 1 ? "" : "s"}
        </span>
      </div>

      {!prefersReducedMotion && <button type="button" className="sc-button-ghost mt-4 text-sm" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? "Resume cosmic motion" : "Pause cosmic motion"}</button>}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(ellipse_at_30%_35%,rgba(139,92,246,.28),transparent_55%),radial-gradient(ellipse_at_70%_65%,rgba(45,212,191,.16),transparent_55%)] blur-xl"
            animate={reducedMotion ? undefined : { opacity: [0.45, 0.85, 0.45], scale: [0.96, 1.06, 0.96] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
          <svg viewBox="0 0 360 360" className="h-full w-full overflow-visible" role="img" aria-label="Interactive zodiac planetary map">
            <defs>
              <radialGradient id={coreGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(239,208,141,.30)" />
                <stop offset="55%" stopColor="rgba(154,116,220,.10)" />
                <stop offset="100%" stopColor="rgba(8,6,13,0)" />
              </radialGradient>
            </defs>

            <motion.g aria-hidden="true" animate={reducedMotion ? undefined : { rotate: [0, -360] }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "180px 180px" }}>
              {Array.from({length: 36}, (_, i) => { const star = pointFor(i * 137.508, 35 + (i * 31 % 125)); return <circle key={i} cx={star.x} cy={star.y} r={i % 3 === 0 ? 1.3 : 0.7} fill={i % 2 ? "#c4b5fd" : "#99f6e4"} opacity={0.25 + (i % 4) * 0.12} />; })}
            </motion.g>
            <circle cx="180" cy="180" r="156" fill="none" stroke="rgba(255,255,255,.08)" />
            <circle cx="180" cy="180" r="132" fill="none" stroke="rgba(217,182,111,.18)" />
            <circle cx="180" cy="180" r="94" fill="none" stroke="rgba(154,116,220,.15)" strokeDasharray="3 7" />
            <circle cx="180" cy="180" r="58" fill={`url(#${coreGradientId})`} />

            {SIGN_GLYPH.map((glyph, index) => {
              const p = pointFor(index * 30 + 15, 154);
              return (
                <g key={SIGN_NAMES[index]} aria-hidden="true">
                  <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(245,234,215,.62)" fontSize="13">
                    {glyph}
                  </text>
                </g>
              );
            })}

            <motion.g
              animate={reducedMotion ? undefined : { rotate: [0, 360] }}
              transition={reducedMotion ? undefined : { duration: 90, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "180px 180px" }}
              aria-hidden="true"
            >
              <circle cx="180" cy="48" r="2" fill="rgba(114,216,197,.65)" />
              <circle cx="312" cy="180" r="1.5" fill="rgba(217,182,111,.65)" />
              <circle cx="180" cy="312" r="2" fill="rgba(154,116,220,.65)" />
            </motion.g>

            {drawable.map((placement, index) => {
              const p = pointFor(placement.longitude!, 132);
              const active = selected?.key === placement.key;
              return (
                <motion.g
                  key={placement.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`${placement.label} in ${placement.sign}`}
                  aria-pressed={active}
                  onClick={() => setSelectedKey(placement.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedKey(placement.key);
                    }
                  }}
                  animate={reducedMotion ? undefined : { y: [0, index % 2 === 0 ? -2.5 : 2.5, 0] }}
                  transition={reducedMotion ? undefined : { duration: 2.6 + index * 0.13, repeat: Infinity, ease: "easeInOut" }}
                  className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={active ? 15 : 12}
                    fill={active ? "rgba(217,182,111,.20)" : "rgba(8,6,13,.88)"}
                    stroke={active ? "rgba(239,208,141,.9)" : "rgba(245,234,215,.28)"}
                    strokeWidth={active ? 2 : 1}
                  />
                  <text
                    x={p.x}
                    y={p.y + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={active ? "#efd08d" : "#f5ead7"}
                    fontSize={active ? 16 : 14}
                    pointerEvents="none"
                  >
                    {GLYPH[placement.key] ?? placement.label.slice(0, 1)}
                  </text>
                </motion.g>
              );
            })}

            <motion.circle
              cx="180"
              cy="180"
              r="28"
              fill="rgba(217,182,111,.08)"
              stroke="rgba(217,182,111,.32)"
              animate={reducedMotion ? undefined : { r: [27, 30, 27], opacity: [0.7, 1, 0.7] }}
              transition={reducedMotion ? undefined : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <text x="180" y="181" textAnchor="middle" dominantBaseline="middle" fill="#efd08d" fontSize="18" aria-hidden="true">✦</text>
          </svg>
        </div>

        <div className="space-y-4">
          {selected ? (
            <motion.article
              key={selected.key}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.035)] p-5"
              data-testid="planetary-system-selection"
            >
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">
                {GLYPH[selected.key]} {selected.label}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">
                {selected.label} in {selected.sign}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{placementSummary(selected)}</p>
              {selectedReading && <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--sc-ivory-soft)]" aria-live="polite">
                <p>{selectedReading.meaning}</p>
                <div><h4 className="font-semibold text-[var(--sc-gold-bright)]">Possible strength</h4><p>{selectedReading.gift}</p></div>
                <div><h4 className="font-semibold text-[var(--sc-gold-bright)]">Watch the tradeoff</h4><p>{selectedReading.tension}</p></div>
                <div><h4 className="font-semibold text-[var(--sc-gold-bright)]">Try this in your life</h4><p>{selectedReading.action}</p></div>
              </div>}
              <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">
                Tap another planet to move through the supported chart. Evidence state stays visible; unresolved houses or degrees remain unresolved.
              </p>
            </motion.article>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--sc-line)] p-5 text-sm text-[var(--sc-stone)]">
              No evidence-qualified planetary placement is available yet. Verify profile astronomy to populate this system.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {synthesis.placements.map((placement) => (
              <button
                type="button"
                key={placement.key}
                aria-pressed={selected?.key === placement.key}
                onClick={() => setSelectedKey(placement.key)}
                className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--sc-gold)] focus-visible:outline focus-visible:outline-2"
              >
                <span className="block text-sm font-semibold text-[var(--sc-ivory)]">
                  {GLYPH[placement.key]} {placement.label}
                </span>
                <span className="mt-1 block text-xs text-[var(--sc-stone)]">
                  {placement.sign} · {placement.evidenceState === "verified" ? "verified" : "stable range"}
                </span>
              </button>
            ))}
          </div>

          {signOnly.length > 0 ? (
            <p className="text-xs leading-5 text-[var(--sc-stone)]">
              {signOnly.length} placement{signOnly.length === 1 ? "" : "s"} shown in the controls have a supported sign but no exact drawable longitude. Soul Codex intentionally leaves them off the wheel rather than placing them at an invented degree.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

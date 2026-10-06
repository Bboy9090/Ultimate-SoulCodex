import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { UltimateCodexSynthesis } from "@/lib/ultimateCodexSynthesis";
import { atlasEntry, atlasSignMeaning, personalAngleMeaning, personalAspectMeaning, personalPlacementMeaning } from "@/lib/astrologyAtlas";
import type { AtlasSign } from "@/lib/astrologyAtlas";

const GLYPH: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

const POINT_GLYPH: Record<string, string> = {
  rising: "ASC", midheaven: "MC", northNode: "☊", southNode: "☋", chiron: "⚷",
};

type ChartSelection =
  | { kind: "planet"; key: string }
  | { kind: "house"; house: number }
  | { kind: "sign"; sign: AtlasSign }
  | { kind: "aspect"; index: number }
  | { kind: "point"; key: string };

function selectWithKeyboard(event: React.KeyboardEvent<SVGGElement>, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

function pointFor(longitude: number, ascendant: number, radius: number) {
  const screenDegrees = longitude - ascendant + 180;
  const radians = (screenDegrees * Math.PI) / 180;
  return { x: 180 + radius * Math.cos(radians), y: 180 - radius * Math.sin(radians) };
}

function validLongitude(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? ((n % 360) + 360) % 360 : null;
}

function guideStopLabel(stop: ChartSelection): string {
  if (stop.kind === "sign") return `${stop.sign} sign`;
  if (stop.kind === "house") return `House ${stop.house}`;
  if (stop.kind === "planet") return `${stop.key} placement`;
  if (stop.kind === "point") return `${stop.key} point`;
  return `Aspect ${stop.index + 1}`;
}

export default function VerifiedNatalChart({
  astrology,
  synthesis,
}: {
  astrology: Record<string, any>;
  synthesis: UltimateCodexSynthesis;
}) {
  const reducedMotion = useReducedMotion();
  const [selection, setSelection] = useState<ChartSelection | null>(null);
  const [guideIndex, setGuideIndex] = useState<number | null>(null);
  const ascendant =
    validLongitude(astrology?.rising?.internalCandidate?.longitude) ??
    synthesis.houseCusps.find((house) => house.house === 1)?.longitude ??
    null;

  const drawablePlacements = synthesis.placements.filter((placement) => placement.longitude !== null);

  if (ascendant === null || synthesis.houseCusps.length !== 12 || drawablePlacements.length < 3) {
    return (
      <section className="sc-panel p-6" data-testid="verified-natal-chart-unavailable">
        <p className="sc-eyebrow">Verified natal wheel</p>
        <h2 className="mt-2 font-serif text-2xl">Geometry is not drawable from the stored evidence.</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
          Soul Codex will not invent missing longitudes. Verified sign-and-house rows remain usable,
          but the wheel stays withheld until enough verified coordinates are present.
        </p>
      </section>
    );
  }

  const planetPoints = new Map(
    drawablePlacements.map((placement) => [placement.key, pointFor(placement.longitude as number, ascendant, 118)]),
  );

  const aspectLines = synthesis.aspects
    .map((aspect) => {
      const a = planetPoints.get(aspect.planet1.toLowerCase());
      const b = planetPoints.get(aspect.planet2.toLowerCase());
      return a && b ? { ...aspect, a, b } : null;
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  const guideStops: ChartSelection[] = [
    ...Object.keys(SIGN_GLYPH).map((sign) => ({ kind: "sign", sign: sign as AtlasSign } as const)),
    ...synthesis.placements.map((placement) => ({ kind: "planet", key: placement.key } as const)),
    ...synthesis.houseCusps.map((house) => ({ kind: "house", house: house.house } as const)),
    ...synthesis.supportingPoints.map((point) => ({ kind: "point", key: point.key } as const)),
    ...synthesis.aspects.map((_, index) => ({ kind: "aspect", index } as const)),
  ];

  function startGuide() {
    if (!guideStops.length) return;
    setSelection(guideStops[0]);
    setGuideIndex(0);
  }

  function moveGuide(direction: -1 | 1) {
    if (guideIndex === null) return;
    const next = guideIndex + direction;
    if (next < 0) return;
    if (next >= guideStops.length) {
      setGuideIndex(null);
      setSelection(null);
      return;
    }
    setGuideIndex(next);
    setSelection(guideStops[next]);
  }

  const selectedPlanet = selection?.kind === "planet"
    ? synthesis.placements.find((placement) => placement.key === selection.key) ?? null
    : null;
  const selectedHouse = selection?.kind === "house"
    ? synthesis.houseCusps.find((house) => house.house === selection.house) ?? null
    : null;
  const selectedAspect = selection?.kind === "aspect"
    ? synthesis.aspects[selection.index] ?? null
    : null;
  const selectedPoint = selection?.kind === "point"
    ? synthesis.supportingPoints.find((point) => point.key === selection.key) ?? null
    : null;

  return (
    <section className="sc-panel p-5 sm:p-6" data-testid="verified-natal-chart">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sc-eyebrow">Verified natal wheel</p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">Your actual sign, house, planet, and aspect geometry</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
            The wheel uses only verified longitudes and verified Equal House cusps. Rising is placed
            at the left side for readability. Symbolic meanings are separate from this geometry.
          </p>
        </div>
        <span className="sc-trust-chip">verified geometry</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,460px)_1fr] xl:items-start">
        <div className="mx-auto w-full max-w-[460px]">
          <svg viewBox="0 0 360 360" role="img" aria-label="Verified natal chart wheel" className="h-auto w-full">
            <circle cx="180" cy="180" r="166" fill="rgba(8,6,14,.72)" stroke="var(--sc-line-gold)" />
            <circle cx="180" cy="180" r="144" fill="none" stroke="var(--sc-line)" />
            <circle cx="180" cy="180" r="103" fill="rgba(13,9,22,.76)" stroke="var(--sc-line)" />

            {Object.keys(SIGN_GLYPH).map((sign, index) => {
              const p = pointFor(index * 30 + 15, ascendant, 154);
              const edge = pointFor(index * 30, ascendant, 166);
              const inner = pointFor(index * 30, ascendant, 144);
              return (
                <motion.g
                  key={sign}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${sign} sign meaning`}
                  aria-pressed={selection?.kind === "sign" && selection.sign === sign}
                  className="cursor-pointer outline-none"
                  onClick={() => setSelection({ kind: "sign", sign: sign as AtlasSign })}
                  onKeyDown={(event) => selectWithKeyboard(event, () => setSelection({ kind: "sign", sign: sign as AtlasSign }))}
                  animate={{ opacity: selection && !(selection.kind === "sign" && selection.sign === sign) ? 0.6 : 1, scale: selection?.kind === "sign" && selection.sign === sign ? 1.22 : 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                >
                  <line x1={edge.x} y1={edge.y} x2={inner.x} y2={inner.y} stroke="var(--sc-line)" />
                  <circle cx={p.x} cy={p.y} r="13" fill={selection?.kind === "sign" && selection.sign === sign ? "rgba(217,182,111,.17)" : "transparent"} />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fill={selection?.kind === "sign" && selection.sign === sign ? "var(--sc-gold-bright)" : "var(--sc-stone)"} fontSize="15">{SIGN_GLYPH[sign]}</text>
                </motion.g>
              );
            })}

            {synthesis.houseCusps.map((house) => {
              const outer = pointFor(house.longitude as number, ascendant, 144);
              const inner = pointFor(house.longitude as number, ascendant, 103);
              const label = pointFor((house.longitude as number) + 15, ascendant, 90);
              const angular = house.house === 1 || house.house === 10;
              const selected = selection?.kind === "house" && selection.house === house.house;
              return (
                <motion.g
                  key={house.house}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open House ${house.house} in ${house.sign}`}
                  aria-pressed={selected}
                  className="cursor-pointer outline-none"
                  onClick={() => setSelection({ kind: "house", house: house.house })}
                  onKeyDown={(event) => selectWithKeyboard(event, () => setSelection({ kind: "house", house: house.house }))}
                  animate={{ opacity: selection && !selected ? 0.68 : 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                >
                  <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={selected || angular ? "var(--sc-gold-bright)" : "rgba(255,255,255,.16)"} strokeWidth={selected ? 3 : angular ? 1.8 : 1} />
                  <circle cx={label.x} cy={label.y} r={selected ? 12 : 10} fill={selected ? "rgba(217,182,111,.18)" : "rgba(8,6,14,.01)"} stroke={selected ? "var(--sc-line-gold)" : "transparent"} />
                  <text x={label.x} y={label.y + 4} textAnchor="middle" fill={selected ? "var(--sc-gold-bright)" : "var(--sc-stone)"} fontSize={selected ? "12" : "10"}>{house.house}</text>
                </motion.g>
              );
            })}

            {aspectLines.map((line, index) => {
              const sourceIndex = synthesis.aspects.findIndex((aspect) =>
                aspect.planet1 === line.planet1 && aspect.planet2 === line.planet2 && aspect.aspect === line.aspect && aspect.orb === line.orb
              );
              const selected = selection?.kind === "aspect" && selection.index === sourceIndex;
              return <motion.line
                key={line.planet1 + "-" + line.aspect + "-" + line.planet2 + "-" + index}
                x1={line.a.x} y1={line.a.y} x2={line.b.x} y2={line.b.y}
                stroke={line.aspect === "square" || line.aspect === "opposition" ? "rgba(255,150,160,.42)" : "rgba(147,214,196,.34)"}
                strokeWidth={selected ? "4" : "1"}
                strokeDasharray={line.aspect === "conjunction" ? "2 4" : undefined}
                opacity={selection && !selected ? 0.35 : 1}
                role="button"
                tabIndex={0}
                aria-label={`Open ${line.planet1} ${line.aspect} ${line.planet2}`}
                aria-pressed={selected}
                className="cursor-pointer outline-none"
                onClick={() => setSelection({ kind: "aspect", index: sourceIndex })}
                onKeyDown={(event) => selectWithKeyboard(event, () => setSelection({ kind: "aspect", index: sourceIndex }))}
                animate={{ pathLength: selected ? 1 : 0.96 }}
                transition={{ duration: reducedMotion ? 0 : 0.25 }}
              />
            })}

            {drawablePlacements.map((placement, index) => {
              const p = planetPoints.get(placement.key)!;
              const jitter = ((index % 3) - 1) * 6;
              const selected = selection?.kind === "planet" && selection.key === placement.key;
              return (
                <motion.g
                  key={placement.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${placement.label} in ${placement.sign}${placement.house ? `, House ${placement.house}` : ""}`}
                  aria-pressed={selected}
                  className="cursor-pointer outline-none"
                  onClick={() => setSelection({ kind: "planet", key: placement.key })}
                  onKeyDown={(event) => selectWithKeyboard(event, () => setSelection({ kind: "planet", key: placement.key }))}
                  animate={{ scale: selected ? 1.18 : 1, opacity: selection && !selected ? 0.72 : 1 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24, duration: reducedMotion ? 0 : undefined }}
                  style={{ transformOrigin: `${p.x + jitter}px ${p.y + jitter}px` }}
                >
                  <circle cx={p.x + jitter} cy={p.y + jitter} r="18" fill="transparent" />
                  <circle cx={p.x + jitter} cy={p.y + jitter} r={selected ? "13" : "11"} fill="rgba(25,18,39,.96)" stroke={selected ? "var(--sc-gold-bright)" : "var(--sc-line-gold)"} strokeWidth={selected ? "2.4" : "1"} />
                  <text x={p.x + jitter} y={p.y + jitter + 5} textAnchor="middle" fill="var(--sc-gold-bright)" fontSize="14">
                    {GLYPH[placement.key] ?? placement.label.slice(0, 1)}
                  </text>
                </motion.g>
              );
            })}

            <text x="180" y="174" textAnchor="middle" fill="var(--sc-ivory)" fontSize="13">ASC ←</text>
            <text x="180" y="193" textAnchor="middle" fill="var(--sc-stone)" fontSize="10">Equal House · verified</text>
          </svg>
        </div>

        <div className="space-y-4">
          <section className="min-h-[280px] rounded-2xl border border-[var(--sc-line-gold)] bg-[radial-gradient(circle_at_top,rgba(217,182,111,.09),transparent_62%)] p-5" aria-live="polite" aria-atomic="true" data-testid="interactive-chart-guide">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="sc-eyebrow">Aureon · Walk the chart</p>
                <h3 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">Aureon walks your chart</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {guideIndex === null && <button type="button" className="sc-button-secondary" onClick={startGuide}>Walk me through it</button>}
                {selection && <button type="button" className="sc-button-ghost" onClick={() => { setSelection(null); setGuideIndex(null); }}>Close</button>}
              </div>
            </div>

            {guideIndex !== null && <div className="mt-4 rounded-xl border border-[var(--sc-line-gold)] bg-black/10 p-3" data-testid="soul-guide-walkthrough" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--sc-ivory-soft)]"><strong className="text-[var(--sc-gold-bright)]">Block {guideIndex + 1} of {guideStops.length}:</strong> {guideStopLabel(guideStops[guideIndex])}</p>
                <div className="flex gap-2">
                  <button type="button" className="sc-button-ghost" onClick={() => moveGuide(-1)} disabled={guideIndex === 0}>Back</button>
                  <button type="button" className="sc-button-secondary" onClick={() => moveGuide(1)}>{guideIndex === guideStops.length - 1 ? "Finish walk" : "Next"}</button>
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">Aureon’s quick key: planet is what’s moving, sign is its style, house is where it shows up, and aspects are how the parts work together—or rub each other wrong. Take what rings true; your chart is a mirror, never a sentence.</p>
            </div>}

            <AnimatePresence mode="wait">
              {!selection && (
                <motion.div key="guide-empty" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl border border-dashed border-[var(--sc-line)] p-5 text-center">
                  <p className="font-serif text-xl text-[var(--sc-ivory)]">Every symbol has a job.</p>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--sc-stone)]">Aureon’s got you—let’s read this chart one piece at a time. A planet points to what’s active; its sign shows the style; its house shows where it lands; aspects show which parts flow and which need a little work. Tap a planet to learn its role, sign, and house. Tap a house number for its life area. Tap an aspect line to see how two placements work together. Choose a sign for its story, or start the walkthrough and move at your own pace.</p>
                </motion.div>
              )}

              {selection?.kind === "sign" && (() => {
                const meaning = atlasSignMeaning(selection.sign);
                const placements = synthesis.placements.filter((placement) => placement.sign === selection.sign);
                const points = synthesis.supportingPoints.filter((point) => point.sign === selection.sign);
                const houses = synthesis.houseCusps.filter((house) => house.sign === selection.sign);
                return <motion.article key={`sign-${selection.sign}`} initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">{SIGN_GLYPH[selection.sign]} Zodiac sign · chart guide</p>
                  <h4 className="mt-2 font-serif text-3xl text-[var(--sc-ivory)]">{selection.sign} in your chart</h4>
                  <p className="mt-4 text-base leading-7 text-[var(--sc-ivory-soft)]">This sign’s symbolic style is {meaning.approach}. Its possible gift is {meaning.gift.toLowerCase()}.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Watch point</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.tension}.</p></div>
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Ground it</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.practice}.</p></div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-[var(--sc-stone)]">
                    <p><strong className="text-[var(--sc-ivory)]">Planets here:</strong> {placements.length ? placements.map((item) => `${item.label}${item.house ? ` · House ${item.house}` : ""}`).join(", ") : "No verified planetary placements in this sign."}</p>
                    {points.length > 0 && <p><strong className="text-[var(--sc-ivory)]">Chart points here:</strong> {points.map((item) => item.label).join(", ")}.</p>}
                    {houses.length > 0 && <p><strong className="text-[var(--sc-ivory)]">House cusps here:</strong> {houses.map((item) => `House ${item.house}`).join(", ")}.</p>}
                  </div>
                </motion.article>;
              })()}

              {selectedPlanet && (
                <motion.article key={`planet-${selectedPlanet.key}`} initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">{GLYPH[selectedPlanet.key]} Planet story</p>
                  <h4 className="mt-2 font-serif text-3xl text-[var(--sc-ivory)]">{selectedPlanet.label} in {selectedPlanet.sign}{selectedPlanet.house ? ` · House ${selectedPlanet.house}` : ""}</h4>
                  {selectedPlanet.house ? (() => {
                    const meaning = personalPlacementMeaning(selectedPlanet.key, selectedPlanet.sign as AtlasSign, selectedPlanet.house);
                    return <>
                      <p className="mt-4 font-serif text-2xl leading-tight text-[var(--sc-ivory-soft)]">{meaning.headline}</p>
                      <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{meaning.synthesis}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Planet · what</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.what}</p></div>
                        <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Sign · how</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.how}</p></div>
                        <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">House · where</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.where}</p></div>
                      </div>
                      <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-3"><p className="text-sm leading-6 text-[var(--sc-ivory-soft)]">{meaning.friction}</p></div>
                      <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory)]">Try this:</strong> {meaning.practice}</p>
                    </>;
                  })() : <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]">The sign is verified, but the house is unresolved. Soul Codex stops before inventing where this theme lands in life.</p>}
                </motion.article>
              )}

              {selectedHouse && (() => {
                const meaning = atlasEntry(selectedHouse.sign as AtlasSign, selectedHouse.house);
                return <motion.article key={`house-${selectedHouse.house}`} initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">House {selectedHouse.house} · life area</p>
                  <h4 className="mt-2 font-serif text-3xl text-[var(--sc-ivory)]">{selectedHouse.sign} on House {selectedHouse.house}</h4>
                  <p className="mt-4 text-base leading-7 text-[var(--sc-ivory-soft)]">{meaning.meaning}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Strength</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.gift}</p></div>
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Watch point</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.tension}</p></div>
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">Ground it</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.practice}</p></div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[var(--sc-stone)]">A cusp sign describes the house’s symbolic style. It is not the same as a planet occupying that house.</p>
                </motion.article>;
              })()}

              {selectedAspect && (() => {
                const meaning = personalAspectMeaning(selectedAspect.planet1, selectedAspect.aspect, selectedAspect.planet2, selectedAspect.orb);
                return <motion.article key={`aspect-${selection?.kind === "aspect" ? selection.index : 0}`} initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">Aspect · planetary conversation</p>
                  <h4 className="mt-2 font-serif text-3xl capitalize text-[var(--sc-ivory)]">{meaning.label}</h4>
                  <p className="mt-1 text-xs text-[var(--sc-gold-bright)]">{meaning.orb}</p>
                  <p className="mt-4 font-serif text-2xl leading-tight text-[var(--sc-ivory-soft)]">{meaning.headline}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">The two jobs</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.what}</p></div>
                    <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">The connection</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.dynamic}</p></div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--sc-ivory-soft)]">{meaning.tension}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory)]">Try this:</strong> {meaning.practice}</p>
                </motion.article>;
              })()}

              {selectedPoint && (() => {
                const angle = selectedPoint.key === "rising" || selectedPoint.key === "midheaven";
                const meaning = angle
                  ? personalAngleMeaning(selectedPoint.key as "rising" | "midheaven", selectedPoint.sign as AtlasSign)
                  : selectedPoint.house
                    ? personalPlacementMeaning(selectedPoint.key, selectedPoint.sign as AtlasSign, selectedPoint.house)
                    : null;
                return <motion.article key={`point-${selectedPoint.key}`} initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">{POINT_GLYPH[selectedPoint.key]} Verified chart point</p>
                  <h4 className="mt-2 font-serif text-3xl text-[var(--sc-ivory)]">{selectedPoint.label} in {selectedPoint.sign}{selectedPoint.house ? ` · House ${selectedPoint.house}` : ""}</h4>
                  {meaning ? <>
                    <p className="mt-4 text-base leading-7 text-[var(--sc-ivory-soft)]">{meaning.synthesis}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[var(--sc-gold)]">What</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.what}</p></div>
                      <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[var(--sc-gold)]">How</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.how}</p></div>
                      <div className="rounded-xl border border-white/[0.07] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[var(--sc-gold)]">Where</p><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.where}</p></div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory)]">Reflection:</strong> {meaning.question}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory)]">Try this:</strong> {meaning.practice}</p>
                  </> : <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]">This point is verified, but Soul Codex does not have enough governed context to produce a house interpretation.</p>}
                </motion.article>;
              })()}
            </AnimatePresence>
          </section>

          <div className="grid gap-2 sm:grid-cols-2">
            {synthesis.placements.map((placement) => {
              const cusp = placement.house ? synthesis.houseCusps.find((house) => house.house === placement.house) : null;
              return (
                <button type="button" key={placement.key} aria-pressed={selection?.kind === "planet" && selection.key === placement.key} onClick={() => setSelection({ kind: "planet", key: placement.key })} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--sc-gold)] focus-visible:outline focus-visible:outline-2">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-[var(--sc-ivory)]">{GLYPH[placement.key]} {placement.label}</strong>
                    <span className="text-sm font-semibold text-[var(--sc-gold-bright)]">{placement.sign}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">
                    {placement.degree !== null ? placement.degree.toFixed(2) + "°" : "degree unavailable"}
                    {placement.house ? " · House " + placement.house + " · " + (cusp?.sign ?? "unresolved") + " cusp" : " · house unresolved"}
                  </p>
                </button>
              );
            })}
          </div>

          {synthesis.supportingPoints.length > 0 && <section className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-4" aria-labelledby="supporting-points-title">
            <p className="sc-eyebrow">Angles, Nodes &amp; Chiron</p>
            <h3 id="supporting-points-title" className="mt-2 font-serif text-xl text-[var(--sc-ivory)]">Other important chart points</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {synthesis.supportingPoints.map((point) => <button
                type="button"
                key={point.key}
                aria-pressed={selection?.kind === "point" && selection.key === point.key}
                onClick={() => setSelection({ kind: "point", key: point.key })}
                className="rounded-full border border-[var(--sc-line)] px-3 py-2 text-sm text-[var(--sc-ivory-soft)] transition hover:border-[var(--sc-gold)] hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2"
              >{POINT_GLYPH[point.key]} {point.label} · {point.sign}{point.house ? ` · H${point.house}` : ""}</button>)}
            </div>
          </section>}

          <details className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">All 12 verified house cusps · sign-on-house meanings</summary>
            <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">
              A cusp sign describes the symbolic style of a house. It is not the same thing as a planet occupying that house.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {synthesis.houseCusps.map((house) => (
                  <button type="button" key={house.house} aria-pressed={selection?.kind === "house" && selection.house === house.house} onClick={() => setSelection({ kind: "house", house: house.house })} className="rounded-xl border border-[var(--sc-line)] bg-black/10 p-3 text-left transition hover:border-[var(--sc-gold)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <strong className="text-[var(--sc-ivory)]">House {house.house} · {house.sign}</strong>
                      <span className="text-xs text-[var(--sc-gold-bright)]">{house.degree !== null ? house.degree.toFixed(2) + "°" : ""}</span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--sc-stone)]">Tap to open this sign-and-house story.</p>
                  </button>
              ))}
            </div>
          </details>

          <details className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">
              {synthesis.aspects.length} verified major aspect{synthesis.aspects.length === 1 ? "" : "s"}
            </summary>
            <ul className="mt-3 space-y-2 text-sm text-[var(--sc-stone)]">
              {synthesis.aspects.length ? synthesis.aspects.map((aspect, index) => (
                <li key={aspect.planet1 + "-" + aspect.planet2 + "-" + index}>
                  <button type="button" aria-pressed={selection?.kind === "aspect" && selection.index === index} onClick={() => setSelection({ kind: "aspect", index })} className="w-full rounded-xl border border-transparent p-2 text-left transition hover:border-[var(--sc-line)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2">
                    <strong className="capitalize text-[var(--sc-ivory-soft)]">{aspect.planet1}</strong>
                    {" "}{aspect.aspect}{" "}
                    <strong className="capitalize text-[var(--sc-ivory-soft)]">{aspect.planet2}</strong>
                    {" · "}{aspect.orb.toFixed(2)}° orb
                  </button>
                </li>
              )) : <li>No governed major aspects were stored.</li>}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}

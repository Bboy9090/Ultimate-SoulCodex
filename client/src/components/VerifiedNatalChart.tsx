import type { UltimateCodexSynthesis } from "@/lib/ultimateCodexSynthesis";

const GLYPH: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

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

export default function VerifiedNatalChart({
  astrology,
  synthesis,
}: {
  astrology: Record<string, any>;
  synthesis: UltimateCodexSynthesis;
}) {
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
                <g key={sign}>
                  <line x1={edge.x} y1={edge.y} x2={inner.x} y2={inner.y} stroke="var(--sc-line)" />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fill="var(--sc-stone)" fontSize="15">{SIGN_GLYPH[sign]}</text>
                </g>
              );
            })}

            {synthesis.houseCusps.map((house) => {
              const outer = pointFor(house.longitude as number, ascendant, 144);
              const inner = pointFor(house.longitude as number, ascendant, 103);
              const label = pointFor((house.longitude as number) + 15, ascendant, 90);
              const angular = house.house === 1 || house.house === 10;
              return (
                <g key={house.house}>
                  <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={angular ? "var(--sc-gold-bright)" : "rgba(255,255,255,.16)"} strokeWidth={angular ? 1.8 : 1} />
                  <text x={label.x} y={label.y + 4} textAnchor="middle" fill="var(--sc-stone)" fontSize="10">{house.house}</text>
                </g>
              );
            })}

            {aspectLines.map((line, index) => (
              <line
                key={line.planet1 + "-" + line.aspect + "-" + line.planet2 + "-" + index}
                x1={line.a.x} y1={line.a.y} x2={line.b.x} y2={line.b.y}
                stroke={line.aspect === "square" || line.aspect === "opposition" ? "rgba(255,150,160,.42)" : "rgba(147,214,196,.34)"}
                strokeWidth="1"
                strokeDasharray={line.aspect === "conjunction" ? "2 4" : undefined}
              />
            ))}

            {drawablePlacements.map((placement, index) => {
              const p = planetPoints.get(placement.key)!;
              const jitter = ((index % 3) - 1) * 6;
              return (
                <g key={placement.key}>
                  <circle cx={p.x + jitter} cy={p.y + jitter} r="11" fill="rgba(25,18,39,.96)" stroke="var(--sc-line-gold)" />
                  <text x={p.x + jitter} y={p.y + jitter + 5} textAnchor="middle" fill="var(--sc-gold-bright)" fontSize="14">
                    {GLYPH[placement.key] ?? placement.label.slice(0, 1)}
                  </text>
                </g>
              );
            })}

            <text x="180" y="174" textAnchor="middle" fill="var(--sc-ivory)" fontSize="13">ASC ←</text>
            <text x="180" y="193" textAnchor="middle" fill="var(--sc-stone)" fontSize="10">Equal House · verified</text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {synthesis.placements.map((placement) => {
              const cusp = placement.house ? synthesis.houseCusps.find((house) => house.house === placement.house) : null;
              return (
                <div key={placement.key} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-[var(--sc-ivory)]">{GLYPH[placement.key]} {placement.label}</strong>
                    <span className="text-sm font-semibold text-[var(--sc-gold-bright)]">{placement.sign}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">
                    {placement.degree !== null ? placement.degree.toFixed(2) + "°" : "degree unavailable"}
                    {placement.house ? " · House " + placement.house + " · " + (cusp?.sign ?? "unresolved") + " cusp" : " · house unresolved"}
                  </p>
                </div>
              );
            })}
          </div>

          <details className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">All 12 verified house cusps</summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {synthesis.houseCusps.map((house) => (
                <div key={house.house} className="flex justify-between text-sm">
                  <span className="text-[var(--sc-stone)]">House {house.house}</span>
                  <span className="font-semibold text-[var(--sc-ivory)]">
                    {house.sign}{house.degree !== null ? " " + house.degree.toFixed(2) + "°" : ""}
                  </span>
                </div>
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
                  <strong className="capitalize text-[var(--sc-ivory-soft)]">{aspect.planet1}</strong>
                  {" "}{aspect.aspect}{" "}
                  <strong className="capitalize text-[var(--sc-ivory-soft)]">{aspect.planet2}</strong>
                  {" · "}{aspect.orb.toFixed(2)}° orb
                </li>
              )) : <li>No governed major aspects were stored.</li>}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}

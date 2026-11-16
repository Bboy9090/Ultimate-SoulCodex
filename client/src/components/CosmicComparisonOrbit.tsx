import { useState } from "react";
import type { AtlasSign } from "@/lib/astrologyAtlas";

export type OrbitalPair = {
  key: string;
  label: string;
  yours: { sign: AtlasSign; house?: number };
  theirs: { sign: AtlasSign; house?: number };
};

/** Positions are deliberately decorative and NOT astronomical longitudes or aspects. */
export default function CosmicComparisonOrbit({ pairs }: { pairs: readonly OrbitalPair[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const supported = pairs.filter(row => row.key && row.yours?.sign && row.theirs?.sign).slice(0, 10);
  const active = supported.find(row => row.key === selected) ?? supported[0];
  if (!active) return (
    <section className="sc-panel p-5" aria-label="Orbital chart comparison">
      <p className="sc-eyebrow">Orbital comparison</p>
      <p className="mt-3 text-sm text-[var(--sc-stone)]">Add overlapping, supported chart placements to explore two saved charts. No missing planets are filled in.</p>
    </section>
  );

  return (
    <section className="sc-panel sc-orbit-explorer p-5 sm:p-7" aria-label="Interactive orbital chart comparison" data-testid="cosmic-comparison-orbit">
      <p className="sc-eyebrow">Soul Circle · Chart-to-chart</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Explore the connection</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sc-stone)]">
        Choose a shared planet or chart point. Its orbit location is an interface arrangement—not a calculated sky position, aspect or compatibility score.
      </p>
      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.8fr)]">
        <div className="sc-orbit-stage" role="group" aria-label="Select a shared chart placement">
          <span className="sc-orbit-track sc-orbit-track--outer" aria-hidden="true" />
          <span className="sc-orbit-track sc-orbit-track--inner" aria-hidden="true" />
          <div className="sc-orbit-core" aria-hidden="true"><span>SOUL</span><span>CODEX</span></div>
          {supported.map((pair, index) => {
            const angle = ((index / supported.length) * Math.PI * 2) - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 39;
            const top = 50 + Math.sin(angle) * 39;
            return (
              <button key={pair.key} type="button" aria-pressed={active.key === pair.key}
                aria-label={`Compare ${pair.label}: ${pair.yours.sign} with ${pair.theirs.sign}`}
                className="sc-orbit-body"
                style={{ left: `${left}%`, top: `${top}%` }}
                onClick={() => setSelected(pair.key)}>
                <span className="sc-orbit-body-label">{pair.label}</span>
              </button>
            );
          })}
        </div>
        <div className="sc-orbit-inspector" aria-live="polite" aria-atomic="true" key={active.key}>
          <p className="sc-eyebrow">Selected signal · {active.label}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="sc-orbit-fact"><span>You</span><strong>{active.yours.sign}</strong><small>{active.yours.house ? `House ${active.yours.house}` : "House not available"}</small></div>
            <div className="sc-orbit-fact"><span>Them</span><strong>{active.theirs.sign}</strong><small>{active.theirs.house ? `House ${active.theirs.house}` : "House not available"}</small></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--sc-stone)]">These are saved chart facts, not an astronomical simulation. Exact synastry aspects require verified planetary degrees for both people.</p>
        </div>
      </div>
    </section>
  );
}

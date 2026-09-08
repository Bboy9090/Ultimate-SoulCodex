import { ShieldCheck } from "lucide-react";

type Props = {
  evidenceLabel?: string;
  summary?: string;
  layers?: string[];
  excludedLayers?: string[];
  className?: string;
};

/** Shared trust disclosure for evidence-aware result surfaces. */
export default function EvidenceLimitations({
  evidenceLabel,
  summary = "Symbolic scores organize reflection. They are not measured probabilities, diagnoses, or guaranteed outcomes.",
  layers = [],
  excludedLayers = [],
  className = "",
}: Props) {
  return (
    <details className={`sc-panel p-5 sm:p-6 ${className}`.trim()}>
      <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">
        Evidence & limitations
      </summary>
      <div className="mt-5 flex gap-3 rounded-2xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.055)] p-4 text-sm">
        <ShieldCheck className="mt-0.5 shrink-0 text-[var(--sc-teal)]" size={18} />
        <div>
          {evidenceLabel ? (
            <p className="m-0 font-semibold text-[var(--sc-ivory-soft)]">{evidenceLabel}</p>
          ) : null}
          <p className={`${evidenceLabel ? "mt-2" : "m-0"} leading-6 text-[var(--sc-stone)]`}>
            {summary}
          </p>
        </div>
      </div>

      {layers.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--sc-ivory-soft)]">Used in this result</p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--sc-stone)]">
            {layers.map((layer) => <li key={layer}>• {layer}</li>)}
          </ul>
        </div>
      ) : null}

      {excludedLayers.length ? (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="m-0 text-sm font-semibold text-amber-400">Not used in this formula</p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--sc-stone)]">
            {excludedLayers.map((layer) => <li key={layer}>• {layer}</li>)}
          </ul>
        </div>
      ) : null}
    </details>
  );
}

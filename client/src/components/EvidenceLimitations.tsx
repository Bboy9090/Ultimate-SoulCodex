import { ShieldCheck } from "lucide-react";

export default function EvidenceLimitations({
  evidenceLabel,
  layers = [],
  excluded = [],
  note,
}: {
  evidenceLabel?: string | null;
  layers?: string[];
  excluded?: string[];
  note?: string;
}) {
  return (
    <details className="sc-panel mt-6 p-5">
      <summary className="cursor-pointer font-semibold">Evidence & limitations</summary>
      <div className="mt-4 flex gap-3 rounded-xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.05)] p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" />
        <div className="text-sm leading-6 text-[var(--sc-ivory-soft)]">
          {evidenceLabel && <p className="m-0 font-semibold text-[var(--sc-ivory)]">{evidenceLabel}</p>}
          <p className={evidenceLabel ? "mt-2" : "m-0"}>
            {note || "Symbolic scores organize reflection. They are not measured relationship probabilities, scientific predictions, or guarantees of outcome."}
          </p>
        </div>
      </div>
      {layers.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Used in this result</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--sc-stone)]">
            {layers.map((layer) => <li key={layer}>• {layer}</li>)}
          </ul>
        </div>
      )}
      {excluded.length > 0 && (
        <div className="mt-4 rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-4">
          <p className="m-0 text-sm font-semibold text-[var(--sc-gold-bright)]">Not used in this formula</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--sc-stone)]">
            {excluded.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      )}
    </details>
  );
}

import { phaseSummary } from "@/lifemap/narrative";

export default function NextPhaseCard({ nextPhase }: { nextPhase: string }) {
  const summary = phaseSummary(nextPhase as any);

  return (
    <div className="card">
      <p className="text-xs text-codex-textMuted uppercase tracking-wide">What opens next</p>
      <h2 className="text-xl font-semibold mt-1">{nextPhase}</h2>
      <p className="text-sm text-codex-textMuted mt-2">
        {summary || "This is the next likely chapter after the current phase stabilizes."}
      </p>
    </div>
  );
}

type YearItem = {
  year: number;
  phase: string;
  summary: string;
  why?: string;
  do?: string[];
  dont?: string[];
};

function signalFromPhase(phase: string) {
  switch (phase) {
    case "Ignition":
      return "Next year opens with fresh momentum. Something new will demand your attention — the question is whether you choose it or let it choose you.";
    case "Expansion":
      return "Next year brings growth opportunities. Your world gets bigger, but only the growth you actively choose will stick.";
    case "Construction":
      return "Next year shifts toward building. The energy moves from exploring to constructing. Patience and structure will matter more than speed.";
    case "Friction":
      return "Next year brings pressure. Things that aren't working will become harder to ignore. The discomfort is diagnostic, not punitive.";
    case "Exposure":
      return "Next year increases visibility. What you've been building (or avoiding) becomes harder to hide. Truth gets louder.";
    case "Refinement":
      return "Next year is about editing. Less becomes more. The work is cutting what doesn't serve the core.";
    case "Integration":
      return "Next year settles into consolidation. The pace slows so the lessons can land. Rest is part of the progress.";
    case "Legacy":
      return "Next year turns toward meaning. The focus shifts from personal achievement to what you're building for others.";
    default:
      return "Next year brings a transition. The current pattern is shifting and the new direction will become clearer as it arrives.";
  }
}

export default function NextYearSignal({
  years,
  currentYear,
}: {
  years: YearItem[];
  currentYear: number;
}) {
  const nextYear = years.find(y => y.year === currentYear + 1);

  if (!nextYear) return null;

  const signal = signalFromPhase(nextYear.phase);

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-codex-textMuted uppercase tracking-wide">
            Next Year Signal
          </p>
          <h2 className="text-lg font-semibold mt-1">
            {nextYear.year} · {nextYear.phase}
          </h2>
        </div>
      </div>

      <p className="text-sm mt-3">{signal}</p>

      <p className="text-xs text-codex-textMuted mt-2">
        {nextYear.summary}
      </p>
    </div>
  );
}

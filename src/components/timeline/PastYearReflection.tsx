type YearItem = {
  year: number;
  phase: string;
  summary: string;
  why?: string;
  do?: string[];
  dont?: string[];
};

function reflectionFromPhase(phase: string) {
  switch (phase) {
    case "Ignition":
      return {
        title: "A starting point",
        text: "Last year likely pushed you to begin a new project or direction. Momentum mattered more than certainty.",
      };
    case "Expansion":
      return {
        title: "Growth pressure",
        text: "Opportunities or movement probably increased. The challenge was choosing what actually deserved your time and attention.",
      };
    case "Construction":
      return {
        title: "Structure demanded",
        text: "Last year rewarded discipline and punished scattered focus. It was a building year, not a wandering one.",
      };
    case "Friction":
      return {
        title: "Resistance phase",
        text: "Tension likely exposed weak spots in plans, relationships, or habits. Pressure was meant to reveal what needed change.",
      };
    case "Exposure":
      return {
        title: "Truth surfaced",
        text: "Situations or patterns probably became harder to ignore. This phase often forces honesty even when it's uncomfortable.",
      };
    case "Refinement":
      return {
        title: "Editing season",
        text: "Last year was about removing noise. Simplifying commitments and sharpening priorities was the real work.",
      };
    case "Integration":
      return {
        title: "Stabilization",
        text: "Lessons from previous years likely began to settle. Progress may have felt slower but more grounded.",
      };
    case "Legacy":
      return {
        title: "Contribution phase",
        text: "Focus may have shifted toward work or choices that outlast the moment.",
      };
    default:
      return {
        title: "Transitional year",
        text: "It was a year of transition before the next clear phase.",
      };
  }
}

export default function PastYearReflection({
  years,
  currentYear,
}: {
  years: YearItem[];
  currentYear: number;
}) {
  const lastYear = years.find(y => y.year === currentYear - 1);

  if (!lastYear) return null;

  const reflection = reflectionFromPhase(lastYear.phase);

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-codex-textMuted uppercase tracking-wide">
            Last Year Reflection
          </p>
          <h2 className="text-lg font-semibold mt-1">
            {lastYear.year} · {reflection.title}
          </h2>
        </div>
      </div>

      <p className="text-sm mt-3">{reflection.text}</p>

      <p className="text-xs text-codex-textMuted mt-2">
        Phase: {lastYear.phase}
      </p>
    </div>
  );
}

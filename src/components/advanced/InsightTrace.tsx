import type { CodexSynthesis } from "@/types/soulcodex"

export default function InsightTrace({ synthesis }: { synthesis?: CodexSynthesis | null }){

  if (!synthesis) return null;

  const traces = [
    { system: "Archetype", insight: synthesis.archetype },
    { system: "Core Nature", insight: synthesis.coreNature.split(".")[0] + "." },
    { system: "Stress Pattern", insight: synthesis.stressPattern.split(".")[0] + "." },
    { system: "Decision Style", insight: synthesis.decisionStyle.split(".")[0] + "." },
    { system: "Blind Spot", insight: synthesis.blindSpot.split(".")[0] + "." },
  ];

  return(
    <div className="card">

      <h2 className="card-title">Insight Trace</h2>

      <div className="space-y-3">
        {traces.map((t, i) => (
          <div key={i} className="border-b border-codex-border pb-2 last:border-0">
            <p className="text-xs text-codex-purple font-semibold uppercase tracking-wider">{t.system}</p>
            <p className="text-sm text-codex-text mt-1">{t.insight}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

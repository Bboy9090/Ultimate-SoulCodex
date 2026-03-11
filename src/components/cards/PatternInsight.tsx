import type { CodexSynthesis } from "@/types/soulcodex"

export default function PatternInsight({ synthesis }: { synthesis?: CodexSynthesis | null }) {

  if (!synthesis) return null

  const insights = [
    synthesis.coreNature,
    synthesis.stressPattern,
    synthesis.blindSpot,
    synthesis.relationshipStyle,
    synthesis.growthEdge,
  ].filter(Boolean)

  const dayIndex = new Date().getDate() % insights.length
  const todayInsight = insights[dayIndex] || insights[0]

  if (!todayInsight) return null

  return (
    <div className="card">
      <p className="text-xs text-codex-gold font-bold uppercase tracking-wider mb-3">
        Pattern Insight
      </p>
      <p className="text-sm leading-relaxed">{todayInsight}</p>
    </div>
  )
}

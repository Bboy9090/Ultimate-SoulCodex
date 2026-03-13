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
    <div className="card animate-pulseGlow">
      <p className="section-label text-center text-codex-gold mb-4">Pattern Insight</p>
      <p className="oracle-text text-sm">{todayInsight}</p>
    </div>
  )
}

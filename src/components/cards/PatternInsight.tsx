import type { CodexSynthesis } from "@/types/soulcodex"

const INSIGHT_LABELS = [
  "Core Nature",
  "Stress Pattern",
  "Blind Spot",
  "Relationship Style",
  "Growth Edge",
]

export default function PatternInsight({ synthesis }: { synthesis?: CodexSynthesis | null }) {
  if (!synthesis) return null

  const insights = [
    synthesis.coreNature,
    synthesis.stressPattern,
    synthesis.blindSpot,
    synthesis.relationshipStyle,
    synthesis.growthEdge,
  ].filter(Boolean)

  if (insights.length === 0) return null

  const dayIndex = new Date().getDate() % insights.length
  const todayInsight = insights[dayIndex] || insights[0]
  const todayLabel = INSIGHT_LABELS[dayIndex] || "Pattern Insight"

  return (
    <div
      className="card animate-pulseGlow"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(242,201,76,0.14)",
        textAlign: "center",
      }}
    >
      {/* Decorative sigil */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(242,201,76,0.08)",
          border: "1px solid rgba(242,201,76,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 0.85rem",
          fontSize: "0.9rem",
          color: "#F2C94C",
        }}
      >
        ✦
      </div>

      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#F2C94C",
          marginBottom: "0.75rem",
        }}
      >
        {todayLabel}
      </p>

      <p
        className="oracle-text"
        style={{
          fontSize: "0.9rem",
          fontStyle: "italic",
          lineHeight: 1.8,
          color: "rgba(234,234,245,0.9)",
        }}
      >
        {todayInsight}
      </p>

      <p
        style={{
          fontSize: "0.65rem",
          color: "rgba(139,135,168,0.45)",
          marginTop: "1rem",
          letterSpacing: "0.08em",
        }}
      >
        Soul Codex &middot; Today&apos;s Mirror
      </p>
    </div>
  )
}

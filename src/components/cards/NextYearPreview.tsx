const PHASE_SIGNAL: Record<string, string> = {
  Ignition: "Fresh momentum. A new project or direction demands your attention.",
  Expansion: "Growth window. New options appear — choose what actually deserves your time.",
  Construction: "Building season. Patience and structure matter more than speed.",
  Friction: "Pressure incoming. What isn't working becomes impossible to ignore.",
  Exposure: "Visibility increases. What you've been building (or avoiding) gets harder to hide.",
  Refinement: "Editing phase. Less becomes more. Cut what doesn't serve the core.",
  Integration: "Consolidation. The pace slows so you can absorb what you've learned.",
  Legacy: "Contribution shift. The focus moves from personal achievement to what you leave behind.",
}

const PHASE_COLOR: Record<string, string> = {
  Ignition: "#F2C94C",
  Expansion: "#22c55e",
  Construction: "#6BA7FF",
  Friction: "#ef4444",
  Exposure: "#f59e0b",
  Refinement: "#9B8AFF",
  Integration: "#7B61FF",
  Legacy: "#F2C94C",
}

type LifeMapYear = {
  year: number
  phase: string
  summary: string
}

export default function NextYearPreview({ years }: { years?: LifeMapYear[] }) {
  const nextYear = new Date().getFullYear() + 1
  const nextData = years?.find(y => y.year === nextYear)

  if (!nextData) return null

  const signal = PHASE_SIGNAL[nextData.phase] || nextData.summary
  const color = PHASE_COLOR[nextData.phase] || "#7B61FF"

  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: `1px solid ${color}22`,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(139,135,168,0.7)",
          marginBottom: "0.5rem",
        }}
      >
        {nextYear} Signal
      </p>

      <h3
        className="heading-display"
        style={{ fontSize: "1.2rem", color, marginBottom: "0.75rem" }}
      >
        {nextData.phase}
      </h3>

      <p
        className="oracle-text"
        style={{ fontSize: "0.875rem", color: "#8B87A8" }}
      >
        {signal}
      </p>
    </div>
  )
}

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

  return (
    <div className="card">
      <p className="text-xs text-codex-textMuted uppercase tracking-wider text-center mb-2">
        {nextYear} Signal
      </p>
      <h3 className="text-lg font-semibold text-center">{nextData.phase}</h3>
      <p className="oracle-text text-sm text-codex-textMuted mt-2">
        {signal}
      </p>
    </div>
  )
}

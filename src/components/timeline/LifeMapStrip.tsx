export default function LifeMapStrip(){

  const years = [
    { year: 2024, phase: "Construction" },
    { year: 2025, phase: "Construction" },
    { year: 2026, phase: "Expansion" },
  ]

  return(
    <div className="card">

      <h2 className="card-title">Life Map</h2>

      <div className="space-y-2">
        {years.map(y => (
          <div key={y.year} className="flex justify-between text-sm border-b border-codex-border pb-2 last:border-0">
            <span className="text-codex-textMuted">{y.year}</span>
            <span className="text-codex-gold">{y.phase}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

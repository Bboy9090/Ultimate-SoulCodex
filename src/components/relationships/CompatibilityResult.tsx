import type { CompatibilityResult as CompatResult } from "@/types/soulcodex"

export default function CompatibilityResult({ data }: { data?: CompatResult | null }){

  if (!data) {
    return(
      <div className="card">
        <h2 className="card-title">Compatibility Result</h2>
        <p className="text-lg font-semibold text-codex-textMuted">Score: —</p>
        <p className="card-subtitle mt-2">
          Submit two birthdates above to see your compatibility analysis.
        </p>
      </div>
    )
  }

  return(
    <div className="card">

      <h2 className="card-title">Compatibility Result</h2>

      <p className="text-lg font-semibold text-codex-gold">Score: {data.score}%</p>

      {data.overlap.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-codex-textMuted mb-1">Synergy</p>
          <ul className="text-sm space-y-1">
            {data.overlap.map((o, i) => <li key={i} className="text-green-400">{o}</li>)}
          </ul>
        </div>
      )}

      {data.friction.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-codex-textMuted mb-1">Friction</p>
          <ul className="text-sm space-y-1">
            {data.friction.map((f, i) => <li key={i} className="text-red-400">{f}</li>)}
          </ul>
        </div>
      )}

      {data.advice.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-codex-textMuted mb-1">Advice</p>
          <ul className="text-sm space-y-1">
            {data.advice.map((a, i) => <li key={i} className="text-codex-blue">{a}</li>)}
          </ul>
        </div>
      )}

    </div>
  )
}

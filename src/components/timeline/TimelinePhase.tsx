import type { TimelineProfile } from "@/types/soulcodex"

export default function TimelinePhase({ data }: { data?: TimelineProfile | null }){

  return(
    <div className="card">

      <h2 className="card-title">Current Phase</h2>

      <p className="text-lg font-semibold text-codex-purple">
        {data?.currentPhase || "—"}
      </p>

      {data?.nextPhase && (
        <p className="text-xs text-codex-textMuted mt-1">
          Next phase: {data.nextPhase}
        </p>
      )}

      {data?.reasons && data.reasons.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-codex-textMuted mb-1">Why this phase:</p>
          <ul className="text-sm space-y-1">
            {data.reasons.map((r, i) => <li key={i} className="text-codex-textMuted">{r}</li>)}
          </ul>
        </div>
      )}

    </div>
  )
}

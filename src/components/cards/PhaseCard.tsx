import type { TimelineProfile } from "@/types/soulcodex"

export default function PhaseCard({ data }: { data?: TimelineProfile | null }){

  return(
    <div className="card">

      <h2 className="card-title">Current Phase</h2>

      <p className="text-lg font-semibold text-codex-purple">
        {data?.currentPhase || "—"}
      </p>

      {data?.nextPhase && (
        <p className="text-xs text-codex-textMuted mt-1">
          Next: {data.nextPhase}
        </p>
      )}

      {data?.reasons && data.reasons.length > 0 && (
        <ul className="mt-2 text-sm text-codex-textMuted space-y-1">
          {data.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}

    </div>
  )
}

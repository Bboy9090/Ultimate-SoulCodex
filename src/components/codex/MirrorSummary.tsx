import type { MirrorProfile } from "@/types/soulcodex"

export default function MirrorSummary({ data }: { data?: MirrorProfile | null }){

  return(
    <div className="card">

      <h2 className="card-title">Mirror Summary</h2>

      <div className="space-y-2 text-sm">
        <p>
          <span className="text-codex-textMuted">Driver:</span>{" "}
          {data?.driver || "—"}
        </p>
        <p>
          <span className="text-codex-textMuted">Shadow Trigger:</span>{" "}
          <span className="text-red-400">{data?.shadowTrigger || "—"}</span>
        </p>
        <p>
          <span className="text-codex-textMuted">Decision Style:</span>{" "}
          <span className="text-codex-blue">{data?.decisionStyle || "—"}</span>
        </p>
      </div>

    </div>
  )
}

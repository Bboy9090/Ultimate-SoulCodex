import type { SoulProfile } from "@/types/soulcodex"

type Props = {
  profile?: SoulProfile | null
}

export default function CoreSnapshot({ profile }: Props){

  const chart = profile?.chart
  const numerology = profile?.numerology

  return(
    <div className="card">

      <h2 className="card-title">Core Snapshot</h2>

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-codex-textMuted">Sun:</span>{" "}
          <span className="text-codex-gold">{chart?.sun?.sign || "—"}</span>
        </p>
        <p>
          <span className="text-codex-textMuted">Moon:</span>{" "}
          <span className="text-codex-blue">{chart?.moon?.sign || "—"}</span>
        </p>
        <p>
          <span className="text-codex-textMuted">Rising:</span>{" "}
          <span className="text-codex-purple">{chart?.rising?.sign || "—"}</span>
        </p>
      </div>

      <p className="mt-3 text-sm">
        <span className="text-codex-textMuted">Life Path:</span>{" "}
        <span className="text-codex-gold font-semibold">{numerology?.lifePath ?? "—"}</span>
      </p>

    </div>
  )
}

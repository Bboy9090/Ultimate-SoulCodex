import type { Archetype } from "@/types/soulcodex"

export default function SoulMirrorReport({ archetype }: { archetype?: Archetype | null }){

  return(
    <div className="card">

      <h2 className="card-title">Soul Mirror Report</h2>

      {archetype ? (
        <div className="space-y-2">
          <p className="text-lg font-semibold text-codex-gold">{archetype.name}</p>
          <p className="text-sm text-codex-textMuted">{archetype.tagline}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-codex-card border border-codex-border rounded-full">{archetype.element}</span>
            <span className="text-xs px-2 py-1 bg-codex-card border border-codex-border rounded-full">{archetype.role}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-codex-textMuted leading-relaxed">
          Complete onboarding to generate your soul mirror report.
        </p>
      )}

    </div>
  )
}

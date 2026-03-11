import type { SoulProfile } from "@/types/soulcodex"

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

export default function NextYearPreview({ synthesis }: { synthesis?: { currentPhaseMeaning?: string; practicalGuidance?: string[] } | null }) {

  if (!synthesis?.currentPhaseMeaning) return null

  const nextYear = new Date().getFullYear() + 1

  const guidance = synthesis.practicalGuidance?.[0] || ""

  return (
    <div className="card">
      <p className="text-xs text-codex-textMuted uppercase tracking-wider mb-2">
        {nextYear} Signal
      </p>
      <p className="text-sm leading-relaxed">
        {guidance}
      </p>
    </div>
  )
}

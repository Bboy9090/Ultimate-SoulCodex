"use client"

import Link from "next/link"
import ConfidenceBadge from "@/components/ui/ConfidenceBadge"
import TodayCard from "@/components/cards/TodayCard"
import PatternInsight from "@/components/cards/PatternInsight"
import { useProfile } from "@/hooks/useProfile"

export default function HomePage() {

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile } = useProfile(profileId)

  const synthesis = profile?.synthesis
  const phase = profile?.timeline?.currentPhase || synthesis?.currentPhaseMeaning?.split("—")[0]?.trim()
  const confidence = profile?.confidence?.badge

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">

      {/* 1. Current Signal */}
      <div className="pt-4 pb-2">
        <p className="text-xs text-codex-textMuted uppercase tracking-widest">Soul Codex</p>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-codex-textMuted uppercase tracking-wide">Current Phase</p>
            <h1 className="text-xl font-bold mt-1">
              {phase || "—"}
            </h1>
          </div>
          {confidence && <ConfidenceBadge level={confidence} />}
        </div>
        {synthesis?.currentPhaseMeaning && (
          <p className="text-sm text-codex-textMuted mt-3 leading-relaxed">
            {synthesis.currentPhaseMeaning}
          </p>
        )}
      </div>

      {/* 2. Today's Card */}
      <TodayCard data={profile?.dailyCard} />

      {/* 3. Pattern Insight */}
      <PatternInsight synthesis={synthesis} />

      {/* 4. Guidance */}
      {synthesis?.practicalGuidance && synthesis.practicalGuidance.length > 0 && (
        <div className="card">
          <p className="text-xs text-codex-blue font-bold uppercase tracking-wider mb-3">
            Guidance
          </p>
          <ul className="space-y-2">
            {synthesis.practicalGuidance.map((g, i) => (
              <li key={i} className="text-sm leading-relaxed">{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Ask the Codex */}
      <Link
        href="/decode"
        className="block w-full text-center bg-codex-purple text-sm font-semibold py-3 rounded-codex hover:opacity-90 transition-opacity"
      >
        Decode a Life Pattern
      </Link>

      <Link
        href="/reading"
        className="block w-full text-center bg-codex-card border border-codex-border text-sm font-semibold py-3 rounded-codex hover:border-codex-gold/60 transition-colors"
      >
        Read My Soul
      </Link>

    </div>
  )
}

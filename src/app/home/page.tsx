"use client"

import Link from "next/link"
import ConfidenceBadge from "@/components/ui/ConfidenceBadge"
import LoadingCards from "@/components/ui/LoadingCards"
import TodayCard from "@/components/cards/TodayCard"
import PatternInsight from "@/components/cards/PatternInsight"
import { useProfile } from "@/hooks/useProfile"

export default function HomePage() {

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile, loading } = useProfile(profileId)

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-codex-textMuted uppercase tracking-widest">Soul Codex</p>
        </div>
        <LoadingCards count={3} />
      </div>
    )
  }

  const synthesis = profile?.synthesis
  const phase = profile?.timeline?.currentPhase || synthesis?.currentPhaseMeaning?.split("—")[0]?.trim()
  const confidence = profile?.confidence?.badge

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">

      {/* Header */}
      <div className="pt-4 pb-2 text-center">
        <p className="text-xs text-codex-textMuted uppercase tracking-widest">Soul Codex</p>
      </div>

      {/* 1. Current Signal — centered title, left body */}
      <div className="card">
        <p className="text-xs text-codex-textMuted uppercase tracking-wide text-center">Current Phase</p>
        <h1 className="text-xl font-bold mt-1 text-center">
          {phase || "—"}
        </h1>
        {confidence && (
          <div className="flex justify-center mt-2">
            <ConfidenceBadge level={confidence} />
          </div>
        )}
        {synthesis?.currentPhaseMeaning && (
          <p className="oracle-text text-sm text-codex-textMuted mt-3">
            {synthesis.currentPhaseMeaning}
          </p>
        )}
      </div>

      {/* 2. Today's Card */}
      <TodayCard data={profile?.dailyCard} />

      {/* 3. Pattern Insight — oracle centered */}
      <PatternInsight synthesis={synthesis} />

      {/* 4. Guidance — centered title, left body */}
      {synthesis?.practicalGuidance && synthesis.practicalGuidance.length > 0 && (
        <div className="card">
          <p className="text-xs text-codex-blue font-bold uppercase tracking-wider mb-3 text-center">
            Guidance
          </p>
          <ul className="space-y-2">
            {synthesis.practicalGuidance.map((g, i) => (
              <li key={i} className="text-sm leading-relaxed">{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Actions */}
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

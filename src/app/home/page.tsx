"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ConfidenceBadge from "@/components/ui/ConfidenceBadge"
import LoadingCards from "@/components/ui/LoadingCards"
import OracleOnboarding from "@/components/cards/OracleOnboarding"
import TodayCard from "@/components/cards/TodayCard"
import PatternInsight from "@/components/cards/PatternInsight"
import NextYearPreview from "@/components/cards/NextYearPreview"
import ShareableInsight from "@/components/cards/ShareableInsight"
import AskCodex from "@/components/cards/AskCodex"
import { useProfile } from "@/hooks/useProfile"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function HomePage() {

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile, loading } = useProfile(profileId)
  const [lifeMapYears, setLifeMapYears] = useState<any[]>([])

  useEffect(() => {
    async function fetchLifeMap() {
      try {
        if (profileId) {
          const res = await fetch(`${API_BASE}/api/profiles/${profileId}/lifemap`)
          if (res.ok) {
            const json = await res.json()
            const result = json.result || json
            if (result.years) { setLifeMapYears(result.years); return }
          }
        }
        const rawProfile = localStorage.getItem("soulProfile")
        if (rawProfile) {
          const stored = JSON.parse(rawProfile)
          const res = await fetch(`${API_BASE}/api/lifemap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentYear: new Date().getFullYear(), profile: stored }),
          })
          if (res.ok) {
            const json = await res.json()
            const result = json.result || json
            if (result.years) setLifeMapYears(result.years)
          }
        }
      } catch {
        // non-critical
      }
    }
    fetchLifeMap()
  }, [profileId])

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

      {/* Onboarding — shows once */}
      <OracleOnboarding />

      {/* 1. Current Phase */}
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

      {/* 3. Pattern Insight + Share */}
      <PatternInsight synthesis={synthesis} />
      <ShareableInsight synthesis={synthesis} />

      {/* 4. Next Year Signal */}
      <NextYearPreview years={lifeMapYears} />

      {/* 5. Guidance */}
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

      {/* 6. Ask the Codex */}
      <AskCodex />

      {/* Actions */}
      <Link
        href="/reading"
        className="block w-full text-center bg-codex-card border border-codex-border text-sm font-semibold py-3 rounded-codex hover:border-codex-gold/60 transition-colors"
      >
        Read My Soul
      </Link>

    </div>
  )
}

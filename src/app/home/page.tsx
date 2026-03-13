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
      } catch {}
    }
    fetchLifeMap()
  }, [profileId])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
        <div className="pt-8 pb-4 text-center">
          <p className="section-label">Soul Codex</p>
        </div>
        <LoadingCards count={3} />
      </div>
    )
  }

  const synthesis = profile?.synthesis
  const phase = profile?.timeline?.currentPhase || synthesis?.currentPhaseMeaning?.split("—")[0]?.trim()
  const confidence = profile?.confidence?.badge
  const archetype = synthesis?.archetype

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="pt-8 pb-2 text-center">
        <p className="section-label">Soul Codex</p>
        {archetype && (
          <h1 className="heading-display text-2xl mt-2">{archetype}</h1>
        )}
      </div>

      {/* Onboarding */}
      <OracleOnboarding />

      {/* Current Phase */}
      <div className="card">
        <p className="section-label text-center mb-2">Current Phase</p>
        <h2 className="heading-display text-xl text-center">
          {phase || "—"}
        </h2>
        {confidence && (
          <div className="flex justify-center mt-3">
            <ConfidenceBadge level={confidence} />
          </div>
        )}
        {synthesis?.currentPhaseMeaning && (
          <p className="oracle-text text-sm text-codex-textMuted mt-4">
            {synthesis.currentPhaseMeaning}
          </p>
        )}
      </div>

      {/* Today */}
      <TodayCard data={profile?.dailyCard} />

      {/* Pattern Insight + Share */}
      <PatternInsight synthesis={synthesis} />
      <ShareableInsight synthesis={synthesis} />

      {/* Next Year */}
      <NextYearPreview years={lifeMapYears} />

      {/* Guidance */}
      {synthesis?.practicalGuidance && synthesis.practicalGuidance.length > 0 && (
        <div className="card">
          <p className="section-label text-center text-codex-blue mb-4">Guidance</p>
          <ul className="space-y-3">
            {synthesis.practicalGuidance.map((g, i) => (
              <li key={i} className="text-sm leading-relaxed flex gap-3">
                <span className="text-codex-purple shrink-0 mt-0.5">›</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ask the Codex */}
      <AskCodex />

      {/* Actions */}
      <Link
        href="/reading"
        className="block w-full text-center py-3.5 rounded-codex text-sm font-semibold tracking-wide transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, rgba(123,97,255,0.2) 0%, rgba(242,201,76,0.1) 100%)",
          border: "1px solid rgba(123,97,255,0.2)",
        }}
      >
        Read My Soul
      </Link>

    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { generateMotto, generatePersonalCode } from "@/codex/motto"
import { usePremium } from "@/hooks/usePremium"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function HomePage() {
  const router = useRouter()
  const { isPremium, loading: premiumLoading } = usePremium()

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile, loading } = useProfile(profileId)
  const [lifeMapYears, setLifeMapYears] = useState<any[]>([])
  const [expanded, setExpanded] = useState(false)

  // Redirect new users to onboarding
  useEffect(() => {
    if (!loading && !profile) {
      const hasData = localStorage.getItem("soulProfile") || localStorage.getItem("profileId")
      if (!hasData) router.push("/onboarding")
    }
  }, [loading, profile, router])

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
        <LoadingCards count={2} />
      </div>
    )
  }

  const synthesis = profile?.synthesis
  const phase = profile?.timeline?.currentPhase || synthesis?.currentPhaseMeaning?.split("—")[0]?.trim()
  const confidence = profile?.confidence?.badge
  const archetype = synthesis?.archetype
  const motto = profile ? generateMotto(profile) : null
  const personalCode = profile ? generatePersonalCode(profile) : []

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6 animate-fadeIn">

      {/* Calm first screen — one focal element */}
      <div className="pt-10 pb-4 text-center">
        <p className="section-label mb-3">Soul Codex</p>
        {archetype && (
          <h1 className="heading-display text-2xl">{archetype}</h1>
        )}
        {motto && (
          <p className="oracle-text text-sm text-codex-textMuted mt-3 italic">
            "{motto}"
          </p>
        )}
        {confidence && (
          <div className="flex justify-center mt-3">
            <ConfidenceBadge level={confidence} />
          </div>
        )}
      </div>

      <OracleOnboarding />

      {/* Premium upgrade banner for free users */}
      {!premiumLoading && !isPremium && (
        <button
          onClick={() => router.push("/upgrade")}
          className="w-full animate-fadeIn"
          style={{
            background: "linear-gradient(135deg, rgba(242,201,76,0.09) 0%, rgba(123,97,255,0.07) 50%, rgba(242,201,76,0.05) 100%)",
            border: "1.5px solid rgba(242,201,76,0.18)",
            borderRadius: 16,
            padding: "0.85rem 1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textAlign: "left" as const,
          }}
        >
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#F2C94C", letterSpacing: "0.04em", marginBottom: 2 }}>
              ✦ Unlock Premium
            </p>
            <p style={{ fontSize: "0.68rem", color: "#8B87A8" }}>
              Unlimited AI · Full chart wheel · Poster generator
            </p>
          </div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#0B0E23",
              background: "linear-gradient(135deg, #F2C94C, #E6A817)",
              borderRadius: 9999,
              padding: "0.3rem 0.75rem",
              whiteSpace: "nowrap" as const,
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(242,201,76,0.3)",
            }}
          >
            $9.99/mo
          </span>
        </button>
      )}

      {/* Current phase — minimal */}
      {phase && (
        <div className="card text-center">
          <p className="section-label mb-1">Current Phase</p>
          <h2 className="heading-display text-lg">{phase}</h2>
          {synthesis?.currentPhaseMeaning && (
            <p className="oracle-text text-sm text-codex-textMuted mt-3">
              {synthesis.currentPhaseMeaning}
            </p>
          )}
        </div>
      )}

      {/* Expand for full insight */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-center text-xs text-codex-purple font-medium tracking-wide py-2"
        >
          Open Full Insight
        </button>
      )}

      {expanded && (
        <>
          <TodayCard data={profile?.dailyCard} />

          <PatternInsight synthesis={synthesis} />
          <ShareableInsight synthesis={synthesis} />

          <NextYearPreview years={lifeMapYears} />

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

          {/* Personal Code */}
          {personalCode.length > 0 && (
            <div className="card text-center">
              <p className="section-label text-codex-gold mb-4">Your Code</p>
              <ul className="space-y-2">
                {personalCode.map((line, i) => (
                  <li key={i} className="text-sm font-medium">{line}</li>
                ))}
              </ul>
            </div>
          )}

          <AskCodex />
        </>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/reading"
          className="block w-full text-center py-3 rounded-codex text-sm font-semibold tracking-wide transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, rgba(123,97,255,0.2) 0%, rgba(242,201,76,0.1) 100%)",
            border: "1px solid rgba(123,97,255,0.2)",
          }}
        >
          Read My Soul
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <Link href="/journal" className="block text-center py-2.5 rounded-codex text-xs font-medium border border-codex-border/50 hover:border-codex-purple/40 transition-colors">
            Journal
          </Link>
          <Link href="/growth" className="block text-center py-2.5 rounded-codex text-xs font-medium border border-codex-border/50 hover:border-codex-gold/40 transition-colors">
            Growth
          </Link>
          <Link href="/guide" className="block text-center py-2.5 rounded-codex text-xs font-medium border border-codex-border/50 hover:border-codex-blue/40 transition-colors">
            Guide
          </Link>
        </div>
      </div>

    </div>
  )
}

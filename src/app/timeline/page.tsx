"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import PageContainer from "@/components/layout/PageContainer"

type CurrentEra = {
  phase: string
  meaning: string
  reasons: string[]
  do: string[]
  dont: string[]
  nextPhase: string
  nextMeaning: string
  previousPhase: string
  previousMeaning: string
}

type LifeMapYearData = {
  year: number
  age: number
  phase: string
  isCurrent: boolean
}

type LifeMapData = {
  currentEra: CurrentEra
  years: LifeMapYearData[]
  currentYear: number
}

const PHASE_COLORS: Record<string, string> = {
  Ignition: "text-orange-500",
  Exposure: "text-yellow-500",
  Construction: "text-codex-blue",
  Expansion: "text-green-500",
  Friction: "text-red-500",
  Refinement: "text-codex-purple",
  Integration: "text-indigo-400",
  Legacy: "text-codex-gold",
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function TimelinePage() {
  const [data, setData] = useState<LifeMapData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const profileId = localStorage.getItem("profileId")
        if (profileId) {
          const res = await fetch(`${API_BASE}/api/profiles/${profileId}/lifemap`)
          if (res.ok) {
            setData(await res.json())
            setLoading(false)
            return
          }
        }

        const rawProfile = localStorage.getItem("soulProfile")
        if (rawProfile) {
          const profile = JSON.parse(rawProfile)
          const birthDate = profile.birthDate || profile.birth?.birthDate
          if (birthDate) {
            const res = await fetch(`${API_BASE}/api/lifemap/forecast`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthDate, futureYears: 5 }),
            })
            if (res.ok) {
              setData(await res.json())
              setLoading(false)
              return
            }
          }
        }

        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    load()
  }, [])

  const era = data?.currentEra
  const phaseColor = era ? PHASE_COLORS[era.phase] || "text-codex-text" : ""

  const nearYears = data?.years
    .filter(y => Math.abs(y.year - (data.currentYear || 2026)) <= 3)
    || []

  return (
    <PageContainer>

      <h1 className="text-xl font-bold">Timeline</h1>

      {loading && (
        <div className="card">
          <p className="card-subtitle">Loading your timeline...</p>
        </div>
      )}

      {/* Current Era */}
      {era && (
        <>
          <div className="card">
            <p className="text-xs text-codex-textMuted uppercase tracking-widest mb-2">Your Current Era</p>
            <h2 className={`text-2xl font-bold ${phaseColor}`}>{era.phase}</h2>
            <p className="text-sm text-codex-text mt-2">{era.meaning}</p>
          </div>

          {/* Why this phase is active */}
          {era.reasons.length > 0 && (
            <div className="card">
              <h3 className="card-title">Why This Phase Is Active</h3>
              <ul className="space-y-2">
                {era.reasons.map((r, i) => (
                  <li key={i} className="text-sm text-codex-textMuted flex gap-2">
                    <span className="text-codex-purple shrink-0">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Do / Don't */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <p className="text-xs text-codex-gold font-semibold uppercase tracking-wider mb-2">What To Do</p>
              <ul className="space-y-2">
                {era.do.map((d, i) => (
                  <li key={i} className="text-sm text-codex-text">{d}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">What To Stop</p>
              <ul className="space-y-2">
                {era.dont.map((d, i) => (
                  <li key={i} className="text-sm text-codex-text">{d}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* What opens next */}
          <div className="card">
            <p className="text-xs text-codex-textMuted uppercase tracking-widest mb-2">What Opens Next</p>
            <h3 className={`text-lg font-semibold ${PHASE_COLORS[era.nextPhase] || "text-codex-text"}`}>
              {era.nextPhase}
            </h3>
            <p className="text-sm text-codex-textMuted mt-1">{era.nextMeaning}</p>
          </div>
        </>
      )}

      {/* Year strip */}
      {nearYears.length > 0 && (
        <div className="card">
          <h3 className="card-title">Your Life Map</h3>
          <div className="space-y-2">
            {nearYears.map(y => (
              <div
                key={y.year}
                className={`flex justify-between text-sm border-b border-codex-border pb-2 last:border-0 ${y.isCurrent ? "font-semibold" : ""}`}
              >
                <span className={y.isCurrent ? "text-codex-gold" : "text-codex-textMuted"}>
                  {y.year} {y.isCurrent && "←"}
                </span>
                <span className={PHASE_COLORS[y.phase] || "text-codex-text"}>
                  {y.phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/lifemap"
        className="block w-full text-center bg-codex-purple text-sm font-semibold py-3 rounded-codex hover:opacity-90 transition-opacity"
      >
        View Full Life Map
      </Link>

    </PageContainer>
  )
}

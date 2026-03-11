"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

type LifeMapYear = {
  year: number
  age: number
  phase: string
  personalYear: number
  explanation: string
  isCurrent: boolean
}

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

type LifeMap = {
  birthYear: number
  currentYear: number
  currentEra: CurrentEra
  years: LifeMapYear[]
}

const PHASE_COLORS: Record<string, string> = {
  Ignition: "border-orange-500",
  Exposure: "border-yellow-500",
  Construction: "border-codex-blue",
  Expansion: "border-green-500",
  Friction: "border-red-500",
  Refinement: "border-codex-purple",
  Integration: "border-indigo-400",
  Legacy: "border-codex-gold",
}

const PHASE_DOT_COLORS: Record<string, string> = {
  Ignition: "bg-orange-500",
  Exposure: "bg-yellow-500",
  Construction: "bg-codex-blue",
  Expansion: "bg-green-500",
  Friction: "bg-red-500",
  Refinement: "bg-codex-purple",
  Integration: "bg-indigo-400",
  Legacy: "bg-codex-gold",
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function LifeMapPage() {
  const [lifeMap, setLifeMap] = useState<LifeMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const currentYear = new Date().getFullYear()

        const mapFromResult = (result: any): LifeMap => ({
          birthYear: result.years?.[0]?.year || currentYear - 2,
          currentYear,
          currentEra: {
            phase: result.currentPhase || "Integration",
            meaning: result.years?.find((y: any) => y.year === currentYear)?.summary || "",
            reasons: (result.reasons || []).map((r: any) => r.label || r),
            do: result.do || [],
            dont: result.dont || [],
            nextPhase: result.nextPhase || "",
            nextMeaning: result.years?.find((y: any) => y.phase === result.nextPhase)?.summary || "",
            previousPhase: result.previousPhase || "",
            previousMeaning: "",
          },
          years: (result.years || []).map((y: any) => ({
            ...y,
            age: y.age ?? y.year - (result.years?.[0]?.year || currentYear - 2),
            personalYear: y.personalYear ?? 0,
            explanation: y.summary || y.explanation || "",
            isCurrent: y.year === currentYear,
          })),
        })

        const profileId = localStorage.getItem("profileId")
        if (profileId) {
          const res = await fetch(`${API_BASE}/api/profiles/${profileId}/lifemap`)
          if (res.ok) {
            const json = await res.json()
            const result = json.result || json
            setLifeMap(mapFromResult(result))
            setLoading(false)
            return
          }
        }

        const rawProfile = localStorage.getItem("soulProfile")
        if (rawProfile) {
          const profile = JSON.parse(rawProfile)
          const res = await fetch(`${API_BASE}/api/lifemap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentYear, profile }),
          })
          if (res.ok) {
            const json = await res.json()
            const result = json.result || json
            setLifeMap(mapFromResult(result))
            setLoading(false)
            return
          }
        }

        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (lifeMap && currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 300)
    }
  }, [lifeMap])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 pt-12 text-center">
        <p className="text-codex-textMuted text-sm">Building your Life Map...</p>
      </div>
    )
  }

  if (!lifeMap) {
    return (
      <div className="max-w-xl mx-auto p-4 pt-12 text-center space-y-4">
        <h1 className="text-xl font-bold">Life Map</h1>
        <p className="text-codex-textMuted text-sm">
          Complete your profile to see your full timeline.
        </p>
        <Link href="/timeline" className="text-codex-purple text-sm underline">
          Back to Timeline
        </Link>
      </div>
    )
  }

  const pastYears = lifeMap.years.filter(y => y.year < lifeMap.currentYear)
  const currentYearData = lifeMap.years.find(y => y.isCurrent)
  const futureYears = lifeMap.years.filter(y => y.year > lifeMap.currentYear)

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">

      <div className="pt-6 pb-4 text-center">
        <p className="text-xs text-codex-textMuted uppercase tracking-widest">Life Map</p>
        <h1 className="text-xl font-bold mt-2">Your Timeline</h1>
        <p className="text-xs text-codex-textMuted mt-1">
          {lifeMap.birthYear} — {lifeMap.currentYear + 5} · {lifeMap.years.length} years mapped
        </p>
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {Object.entries(PHASE_DOT_COLORS).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-codex-textMuted">{phase}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-codex-border" />

        {/* Past section */}
        {pastYears.length > 0 && (
          <>
            <div className="mb-3">
              <span className="text-xs text-codex-textMuted uppercase tracking-widest">Past</span>
            </div>
            {pastYears.map(y => (
              <TimelineNode
                key={y.year}
                data={y}
                expanded={expandedYear === y.year}
                onToggle={() => setExpandedYear(expandedYear === y.year ? null : y.year)}
              />
            ))}
          </>
        )}

        {/* Current */}
        {currentYearData && (
          <>
            <div className="mb-3 mt-6">
              <span className="text-xs text-codex-gold uppercase tracking-widest font-bold">Now</span>
            </div>
            <div ref={currentRef}>
              <TimelineNode
                data={currentYearData}
                expanded={expandedYear === currentYearData.year || expandedYear === null}
                onToggle={() => setExpandedYear(expandedYear === currentYearData.year ? null : currentYearData.year)}
                highlight
              />
            </div>
          </>
        )}

        {/* Future */}
        {futureYears.length > 0 && (
          <>
            <div className="mb-3 mt-6">
              <span className="text-xs text-codex-textMuted uppercase tracking-widest">Coming</span>
            </div>
            {futureYears.map(y => (
              <TimelineNode
                key={y.year}
                data={y}
                expanded={expandedYear === y.year}
                onToggle={() => setExpandedYear(expandedYear === y.year ? null : y.year)}
                future
              />
            ))}
          </>
        )}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/timeline"
          className="inline-block bg-codex-card border border-codex-border text-sm px-6 py-2 rounded-codex hover:bg-codex-surface transition-colors"
        >
          Back to Timeline
        </Link>
      </div>

    </div>
  )
}

function TimelineNode({
  data,
  expanded,
  onToggle,
  highlight,
  future,
}: {
  data: LifeMapYear
  expanded: boolean
  onToggle: () => void
  highlight?: boolean
  future?: boolean
}) {
  const dotColor = PHASE_DOT_COLORS[data.phase] || "bg-codex-textMuted"
  const borderColor = PHASE_COLORS[data.phase] || "border-codex-border"

  return (
    <div className="relative mb-4">
      {/* Dot */}
      <div className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full ${dotColor} ${highlight ? "ring-2 ring-codex-gold ring-offset-2 ring-offset-codex-void" : ""}`} />

      <button
        onClick={onToggle}
        className={`w-full text-left rounded-codex p-3 transition-colors ${
          highlight
            ? "bg-codex-card border border-codex-gold/30"
            : future
              ? "bg-codex-surface/50 border border-codex-border/50"
              : "hover:bg-codex-surface/30"
        }`}
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`text-sm font-semibold ${highlight ? "text-codex-gold" : future ? "text-codex-textMuted" : "text-codex-text"}`}>
              {data.year}
            </span>
            <span className="text-xs text-codex-textMuted">age {data.age}</span>
          </div>
          <span className={`text-xs font-medium ${highlight ? "text-codex-gold" : "text-codex-purple"}`}>
            {data.phase}
          </span>
        </div>

        {expanded && (
          <p className={`mt-2 text-sm leading-relaxed ${future ? "text-codex-textMuted" : "text-codex-text"}`}>
            {data.explanation}
          </p>
        )}
      </button>
    </div>
  )
}

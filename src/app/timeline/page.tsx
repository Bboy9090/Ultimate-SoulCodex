"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import CurrentPhaseCard from "@/components/timeline/CurrentPhaseCard"
import WhyActiveList from "@/components/timeline/WhyActiveList"
import DoDontCard from "@/components/timeline/DoDontCard"
import YearStrip from "@/components/timeline/YearStrip"
import NextPhaseCard from "@/components/timeline/NextPhaseCard"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function TimelinePage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function run() {
      try {
        setLoading(true)
        setError("")

        const profileId = localStorage.getItem("profileId")
        if (profileId) {
          const res = await fetch(`${API_BASE}/api/profiles/${profileId}/lifemap`)
          if (res.ok) {
            const json = await res.json()
            const data = json.result || json
            if (data.currentPhase) {
              setResult(data)
              setLoading(false)
              return
            }
          }
        }

        const rawProfile = localStorage.getItem("soulProfile")
        let profile: any = null
        let fullChart: any = undefined

        if (rawProfile) {
          const stored = JSON.parse(rawProfile)
          profile = {
            confidence: stored.confidence || stored.soulConfidence,
            numerology: stored.numerology || {
              personalYear: stored.numerologyData?.personalYear || stored.personalYear,
              lifePath: stored.numerologyData?.lifePath || stored.lifePath,
            },
            themes: stored.themes || {
              topThemes: stored.archetypeData?.themes || stored.archetype?.themes || [],
            },
            mirror: stored.mirror || {
              driver: stored.synthesis?.moralCode?.name || stored.archetypeData?.driver,
              decisionStyle: stored.mirror?.decisionStyle || stored.synthesis?.decisionStyle,
            },
          }
        }

        const res = await fetch(`${API_BASE}/api/lifemap`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentYear: new Date().getFullYear(),
            profile: profile || {},
            fullChart,
          }),
        })

        const json = await res.json()
        if (!json.ok) throw new Error(json.error || "Failed to load timeline")
        setResult(json.result)
      } catch (e: any) {
        setError(e.message || "Timeline failed")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 pt-8">
        <p className="text-codex-textMuted text-sm">Loading timeline...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 pt-8 space-y-4">
        <p className="text-red-400 text-sm">{error}</p>
        <Link href="/home" className="text-codex-purple text-sm underline">Back to Home</Link>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-24">

      <h1 className="text-xl font-bold">Timeline</h1>

      <CurrentPhaseCard
        phase={result.currentPhase}
        confidence={result.confidence}
      />

      <WhyActiveList reasons={result.reasons} />

      <DoDontCard doList={result.do} dontList={result.dont} />

      <NextPhaseCard nextPhase={result.nextPhase} />

      <YearStrip years={result.years} currentYear={new Date().getFullYear()} />

      <Link
        href="/lifemap"
        className="block w-full text-center bg-codex-card border border-codex-border text-sm font-semibold py-3 rounded-codex hover:bg-codex-surface transition-colors"
      >
        View Full Life Map
      </Link>

    </div>
  )
}

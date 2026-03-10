"use client"

import { useState, useCallback } from "react"
import type { TimelineProfile, LifeMap } from "@/types/soulcodex"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export function useTimeline() {
  const [timeline, setTimeline] = useState<TimelineProfile | null>(null)
  const [lifeMap, setLifeMap] = useState<LifeMap | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = useCallback(async (profile: any, fullChart: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/timeline/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          fullChart,
          currentDateISO: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`)
      const data = await res.json()
      setTimeline({
        currentPhase: data.phase,
        nextPhase: data.nextPhase,
        reasons: data.reasons,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load timeline")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLifeMap = useCallback(async (currentYear: number, personalYear: number, horizonYears?: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/lifemap/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentYear, personalYear, horizonYears }),
      })
      if (!res.ok) throw new Error(`Life map fetch failed: ${res.status}`)
      const data = await res.json()
      setLifeMap(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load life map")
    }
  }, [])

  return { timeline, lifeMap, loading, error, fetchTimeline, fetchLifeMap }
}

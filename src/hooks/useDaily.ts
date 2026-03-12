"use client"

import { useState, useCallback } from "react"
import type { DailyCard } from "@/types/soulcodex"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export function useDaily() {
  const [daily, setDaily] = useState<DailyCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDaily = useCallback(async (phase: string, decisionStyle: string, astrologyData?: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/transits/today`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, decisionStyle, astrologyData }),
      })
      if (!res.ok) throw new Error(`Daily card fetch failed: ${res.status}`)
      const data = await res.json()
      setDaily(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load daily card")
    } finally {
      setLoading(false)
    }
  }, [])

  return { daily, loading, error, fetchDaily }
}

"use client"

import { useState, useCallback } from "react"
import type { CompatibilityResult } from "@/types/soulcodex"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export function useCompatibility() {
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (profile1Id: string, profile2Id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/compatibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile1Id, profile2Id }),
      })
      if (!res.ok) throw new Error(`Compatibility analysis failed: ${res.status}`)
      const data = await res.json()
      setResult({
        score: data.overallScore ?? 0,
        overlap: data.synergy || data.overlap || [],
        friction: data.friction || [],
        advice: data.advice || data.rituals || [],
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze compatibility")
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, analyze }
}

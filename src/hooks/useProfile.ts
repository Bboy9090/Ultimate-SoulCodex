"use client"

import { useState, useEffect, useCallback } from "react"
import type { SoulProfile } from "@/types/soulcodex"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export function useProfile(profileId?: string) {
  const [profile, setProfile] = useState<SoulProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${id}/unified`)
      if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`)
      const data = await res.json()
      setProfile(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profileId) fetchProfile(profileId)
  }, [profileId, fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}

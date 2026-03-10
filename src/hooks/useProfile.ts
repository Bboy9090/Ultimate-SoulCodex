"use client"

import { useState, useEffect } from "react"
import type { SoulProfile } from "@/types/soulcodex"

export function useProfile() {
  const [profile, setProfile] = useState<SoulProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return { profile, loading, setProfile }
}

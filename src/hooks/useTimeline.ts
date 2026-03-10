"use client"

import { useState, useEffect } from "react"
import type { TimelineProfile, LifeMap } from "@/types/soulcodex"

export function useTimeline() {
  const [timeline, setTimeline] = useState<TimelineProfile | null>(null)
  const [lifeMap, setLifeMap] = useState<LifeMap | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return { timeline, lifeMap, loading }
}

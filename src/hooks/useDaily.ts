"use client"

import { useState, useEffect } from "react"
import type { DailyCard } from "@/types/soulcodex"

export function useDaily() {
  const [daily, setDaily] = useState<DailyCard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return { daily, loading }
}

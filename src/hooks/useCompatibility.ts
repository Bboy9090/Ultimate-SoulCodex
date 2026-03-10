"use client"

import { useState } from "react"
import type { CompatibilityResult } from "@/types/soulcodex"

export function useCompatibility() {
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function analyze(birthA: string, birthB: string) {
    setLoading(true)
    setLoading(false)
  }

  return { result, loading, analyze }
}

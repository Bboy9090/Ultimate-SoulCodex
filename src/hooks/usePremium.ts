"use client"
/**
 * Soul Codex — usePremium Hook
 * Manages premium tier state client-side.
 * Uses localStorage for optimistic reads + API validation.
 * Works for both anonymous and authenticated users.
 */
import { useState, useEffect, useCallback } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""
const STORAGE_KEY = "soulcodex_premium"
const USAGE_KEY = "soulcodex_usage"

export interface PremiumStatus {
  isPremium: boolean
  plan: "monthly" | "yearly" | null
  source: "session" | "user" | "local" | "none" | "error"
  loading: boolean
}

export interface UsageCounters {
  chatMessages: number      // resets monthly
  compatibilityReads: number // resets monthly
  pdfExports: number        // resets monthly
  lastReset: string         // ISO date string
}

// Free tier limits
export const FREE_LIMITS = {
  chatMessages: 10,
  compatibilityReads: 3,
  pdfExports: 1,
} as const

function getStoredPremium(): { isPremium: boolean; plan: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { isPremium: false, plan: null }
    return JSON.parse(raw)
  } catch {
    return { isPremium: false, plan: null }
  }
}

function storePremium(isPremium: boolean, plan: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isPremium, plan, ts: Date.now() }))
  } catch {}
}

function getUsage(): UsageCounters {
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (!raw) return getDefaultUsage()
    const data = JSON.parse(raw) as UsageCounters
    // Reset if it's a new month
    const lastReset = new Date(data.lastReset)
    const now = new Date()
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      return getDefaultUsage()
    }
    return data
  } catch {
    return getDefaultUsage()
  }
}

function getDefaultUsage(): UsageCounters {
  return {
    chatMessages: 0,
    compatibilityReads: 0,
    pdfExports: 0,
    lastReset: new Date().toISOString(),
  }
}

function saveUsage(usage: UsageCounters) {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage))
  } catch {}
}

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    plan: null,
    source: "none",
    loading: true,
  })
  const [usage, setUsage] = useState<UsageCounters>(getDefaultUsage())

  // Load from localStorage immediately (optimistic)
  useEffect(() => {
    const stored = getStoredPremium()
    const currentUsage = getUsage()
    setUsage(currentUsage)
    if (stored.isPremium) {
      setStatus({
        isPremium: true,
        plan: stored.plan as "monthly" | "yearly" | null,
        source: "local",
        loading: true, // still validating with server
      })
    }

    // Validate with server
    fetch(`${API_BASE}/api/paypal/status`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const isPremium = data.isPremium === true
        const plan = data.plan || null
        storePremium(isPremium, plan)
        setStatus({
          isPremium,
          plan: plan as "monthly" | "yearly" | null,
          source: data.source || "none",
          loading: false,
        })
      })
      .catch(() => {
        // Fall back to localStorage value on network error
        setStatus((prev) => ({ ...prev, loading: false }))
      })
  }, [])

  /** Activate premium after PayPal approval */
  const activatePremium = useCallback(
    async (subscriptionId: string, plan: "monthly" | "yearly" = "monthly") => {
      try {
        const res = await fetch(`${API_BASE}/api/paypal/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ subscriptionId, plan }),
        })
        const data = await res.json()
        if (data.success) {
          storePremium(true, plan)
          setStatus({ isPremium: true, plan, source: "session", loading: false })
          return { success: true }
        }
        return { success: false, error: data.error }
      } catch (e) {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  /** Check if a feature is available for the current tier */
  const canUse = useCallback(
    (feature: keyof typeof FREE_LIMITS): boolean => {
      if (status.isPremium) return true
      return usage[feature] < FREE_LIMITS[feature]
    },
    [status.isPremium, usage]
  )

  /** Increment usage counter for a feature */
  const recordUsage = useCallback(
    (feature: keyof typeof FREE_LIMITS) => {
      if (status.isPremium) return // premium users don't count
      const current = getUsage()
      const updated = { ...current, [feature]: current[feature] + 1 }
      saveUsage(updated)
      setUsage(updated)
    },
    [status.isPremium]
  )

  /** Get remaining uses for a feature */
  const remaining = useCallback(
    (feature: keyof typeof FREE_LIMITS): number => {
      if (status.isPremium) return Infinity
      return Math.max(0, FREE_LIMITS[feature] - usage[feature])
    },
    [status.isPremium, usage]
  )

  return {
    ...status,
    usage,
    canUse,
    recordUsage,
    remaining,
    activatePremium,
    FREE_LIMITS,
  }
}

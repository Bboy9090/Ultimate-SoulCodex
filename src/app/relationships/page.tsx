"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PageContainer from "@/components/layout/PageContainer"
import CompatibilityForm from "@/components/relationships/CompatibilityForm"
import CompatibilityResult from "@/components/relationships/CompatibilityResult"
import { usePremium, FREE_LIMITS } from "@/hooks/usePremium"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function RelationshipsPage() {
  const router = useRouter()
  const { isPremium, canUse, recordUsage, remaining } = usePremium()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  const handleAnalyze = async (nameA: string, birthA: string, nameB: string, birthB: string) => {
    // Check free tier limit
    if (!isPremium && !canUse("compatibilityReads")) {
      setLimitReached(true)
      return
    }
    setLimitReached(false)
    setLoading(true)
    setResult(null)

    // Record usage for free tier
    if (!isPremium) recordUsage("compatibilityReads")

    try {
      const profileA = buildProfileFromBirth(nameA, birthA)
      const profileB = buildProfileFromBirth(nameB, birthB)

      const res = await fetch(`${API_BASE}/api/compat/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileA, profileB }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.result) {
          setResult(data.result)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const rem = remaining("compatibilityReads")

  return (
    <PageContainer>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h1 className="text-xl font-bold">Relationships</h1>
        {!isPremium && (
          <span
            style={{
              fontSize: "0.65rem",
              color: rem <= 1 ? "#F2C94C" : "#8B87A8",
              letterSpacing: "0.04em",
            }}
          >
            {rem} read{rem !== 1 ? "s" : ""} left
          </span>
        )}
        {isPremium && (
          <span style={{ fontSize: "0.65rem", color: "#F2C94C", letterSpacing: "0.06em" }}>✦ Premium</span>
        )}
      </div>

      {/* Limit reached banner */}
      {limitReached && (
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(242,201,76,0.12) 0%, rgba(123,97,255,0.08) 100%)",
            border: "1.5px solid rgba(242,201,76,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#F2C94C", marginBottom: 2 }}>
              Monthly limit reached
            </p>
            <p style={{ fontSize: "0.72rem", color: "#8B87A8" }}>
              You've used all {FREE_LIMITS.compatibilityReads} free compatibility reads this month
            </p>
          </div>
          <button
            onClick={() => router.push("/upgrade")}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #F2C94C, #E6A817)",
              color: "#0B0E23",
              fontSize: "0.72rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Upgrade ✦
          </button>
        </div>
      )}

      <CompatibilityForm onAnalyze={handleAnalyze} loading={loading} />
      <CompatibilityResult data={result} />
    </PageContainer>
  )
}

function buildProfileFromBirth(name: string, birthDate: string) {
  const d = new Date(birthDate)
  const month = d.getMonth()
  const day = d.getDate()

  const signs = ["Capricorn","Aquarius","Pisces","Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn"]
  const cutoffs = [20,19,21,20,21,21,23,23,23,23,22,22,20]
  const signIdx = day < cutoffs[month] ? month : (month + 1) % 12
  const sunSign = signs[signIdx] || "Aries"

  const digitSum = (n: number): number => Math.abs(n).toString().split("").reduce((a, b) => a + Number(b), 0)
  let lp = digitSum(d.getFullYear()) + digitSum(month + 1) + digitSum(day)
  while (![11, 22, 33].includes(lp) && lp > 9) lp = digitSum(lp)

  return {
    name: name || undefined,
    birth: { birthDate, name },
    chart: { sun: { planet: "Sun", sign: sunSign } },
    numerology: { lifePath: lp },
  }
}

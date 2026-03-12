"use client"

import { useState } from "react"
import PageContainer from "@/components/layout/PageContainer"
import CompatibilityForm from "@/components/relationships/CompatibilityForm"
import CompatibilityResult from "@/components/relationships/CompatibilityResult"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function RelationshipsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async (nameA: string, birthA: string, nameB: string, birthB: string) => {
    setLoading(true)
    setResult(null)
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

  return (
    <PageContainer>

      <h1 className="text-xl font-bold">Relationships</h1>

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

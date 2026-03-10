"use client"

import { useEffect } from "react"
import PageContainer from "@/components/layout/PageContainer"
import TodayCard from "@/components/cards/TodayCard"
import PhaseCard from "@/components/cards/PhaseCard"
import ThemeTag from "@/components/cards/ThemeTag"
import { useProfile } from "@/hooks/useProfile"

export default function HomePage() {

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile } = useProfile(profileId)

  const themes = profile?.themes?.topThemes || ["Truth", "Precision", "Legacy"]

  return (
    <PageContainer>

      <h1 className="text-xl font-bold">Home</h1>

      <TodayCard data={profile?.dailyCard} />

      <PhaseCard data={profile?.timeline} />

      <div className="flex gap-2 flex-wrap">
        {themes.map(t => <ThemeTag key={t} label={t} />)}
      </div>

    </PageContainer>
  )
}

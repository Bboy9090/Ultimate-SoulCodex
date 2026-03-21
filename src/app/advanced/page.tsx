"use client"

import PageContainer from "@/components/layout/PageContainer"
import LoadingCards from "@/components/ui/LoadingCards"
import ChartWheel from "@/components/advanced/ChartWheel"
import AspectTable from "@/components/advanced/AspectTable"
import InsightTrace from "@/components/advanced/InsightTrace"
import PosterGenerator from "@/components/advanced/PosterGenerator"
import PremiumGate from "@/components/premium/PremiumGate"
import { useProfile } from "@/hooks/useProfile"

export default function AdvancedPage(){

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile, loading } = useProfile(profileId)

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-xl font-bold">Birth Chart</h1>
        <LoadingCards count={2} />
      </PageContainer>
    )
  }

  const planets = profile?.chart
    ? Object.entries(profile.chart)
        .filter(([_, v]) => v && typeof v === "object" && "degree" in v)
        .map(([key, v]) => ({
          name: (v as any).planet || key,
          degree: (v as any).degree ?? 0,
        }))
    : undefined

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Birth Chart</h1>

      {/* Chart Wheel — Premium */}
      <PremiumGate
        title="Interactive Chart Wheel"
        description="See your full birth chart wheel with all planets, houses, and aspects visualized."
      >
        <ChartWheel planets={planets} aspects={profile?.aspects} />
      </PremiumGate>

      {/* Aspect Table — free */}
      <AspectTable aspects={profile?.aspects} />
      <InsightTrace synthesis={profile?.synthesis} />

      {/* Poster Generator — Premium */}
      <PremiumGate
        title="Soul Poster Generator"
        description="Generate a beautiful shareable poster of your soul's blueprint."
      >
        <PosterGenerator />
      </PremiumGate>

    </PageContainer>
  )
}

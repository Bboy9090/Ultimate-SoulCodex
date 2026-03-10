"use client"

import PageContainer from "@/components/layout/PageContainer"
import ChartWheel from "@/components/advanced/ChartWheel"
import AspectTable from "@/components/advanced/AspectTable"
import InsightTrace from "@/components/advanced/InsightTrace"
import PosterGenerator from "@/components/advanced/PosterGenerator"
import { useProfile } from "@/hooks/useProfile"

export default function AdvancedPage(){

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile } = useProfile(profileId)

  const planets = profile?.chart
    ? Object.entries(profile.chart)
        .filter(([_, v]) => v && typeof v === "object" && "degree" in v)
        .map(([key, v]) => ({
          name: (v as any).planet || key,
          degree: (v as any).degree ?? 0,
        }))
    : [
        { name: "Sun", degree: 175 },
        { name: "Moon", degree: 182 },
        { name: "Mercury", degree: 168 },
        { name: "Venus", degree: 210 },
        { name: "Mars", degree: 88 },
      ]

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Birth Chart</h1>

      <ChartWheel planets={planets} />

      <AspectTable />

      <InsightTrace />

      <PosterGenerator />

    </PageContainer>
  )
}

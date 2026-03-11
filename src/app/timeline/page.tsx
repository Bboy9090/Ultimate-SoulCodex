"use client"

import Link from "next/link"
import PageContainer from "@/components/layout/PageContainer"
import TimelinePhase from "@/components/timeline/TimelinePhase"
import LifeMapStrip from "@/components/timeline/LifeMapStrip"
import { useProfile } from "@/hooks/useProfile"

export default function TimelinePage(){

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile } = useProfile(profileId)

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Timeline</h1>

      <TimelinePhase data={profile?.timeline} />

      <LifeMapStrip />

      <Link
        href="/lifemap"
        className="block w-full text-center bg-codex-card border border-codex-border text-sm font-semibold py-3 rounded-codex hover:bg-codex-surface transition-colors"
      >
        View Full Life Map
      </Link>

    </PageContainer>
  )
}

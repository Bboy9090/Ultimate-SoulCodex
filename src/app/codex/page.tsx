"use client"

import Link from "next/link"
import PageContainer from "@/components/layout/PageContainer"
import LoadingCards from "@/components/ui/LoadingCards"
import CoreSnapshot from "@/components/codex/CoreSnapshot"
import MirrorSummary from "@/components/codex/MirrorSummary"
import SoulMirrorReport from "@/components/codex/SoulMirrorReport"
import SystemAccordion from "@/components/codex/SystemAccordion"
import { useProfile } from "@/hooks/useProfile"

export default function CodexPage(){

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile, loading } = useProfile(profileId)

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-xl font-bold">Your Codex</h1>
        <LoadingCards count={4} />
      </PageContainer>
    )
  }

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Your Codex</h1>

      <Link
        href="/reading"
        className="block w-full text-center bg-codex-purple text-sm font-semibold py-3 rounded-codex hover:opacity-90 transition-opacity"
      >
        Read My Soul
      </Link>

      <CoreSnapshot profile={profile} />

      <MirrorSummary data={profile?.mirror} />

      <SoulMirrorReport archetype={profile?.archetype} />

      <SystemAccordion profile={profile} />

    </PageContainer>
  )
}

"use client"

import PageContainer from "@/components/layout/PageContainer"
import CoreSnapshot from "@/components/codex/CoreSnapshot"
import MirrorSummary from "@/components/codex/MirrorSummary"
import SoulMirrorReport from "@/components/codex/SoulMirrorReport"
import SystemAccordion from "@/components/codex/SystemAccordion"
import { useProfile } from "@/hooks/useProfile"

export default function CodexPage(){

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile } = useProfile(profileId)

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Your Codex</h1>

      <CoreSnapshot profile={profile} />

      <MirrorSummary data={profile?.mirror} />

      <SoulMirrorReport archetype={profile?.archetype} />

      <SystemAccordion profile={profile} />

    </PageContainer>
  )
}

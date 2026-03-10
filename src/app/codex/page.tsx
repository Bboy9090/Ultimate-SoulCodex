import PageContainer from "@/components/layout/PageContainer"
import CoreSnapshot from "@/components/codex/CoreSnapshot"
import MirrorSummary from "@/components/codex/MirrorSummary"
import SoulMirrorReport from "@/components/codex/SoulMirrorReport"
import SystemAccordion from "@/components/codex/SystemAccordion"

export default function CodexPage(){

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Your Codex</h1>

      <CoreSnapshot />

      <MirrorSummary />

      <SoulMirrorReport />

      <SystemAccordion />

    </PageContainer>
  )
}

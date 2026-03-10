import CoreSnapshot from "@/components/codex/CoreSnapshot"
import MirrorSummary from "@/components/codex/MirrorSummary"
import SoulMirrorReport from "@/components/codex/SoulMirrorReport"
import SystemAccordion from "@/components/codex/SystemAccordion"

export default function CodexPage(){

  return(
    <div>

      <CoreSnapshot />

      <MirrorSummary />

      <SoulMirrorReport />

      <SystemAccordion />

    </div>
  )
}

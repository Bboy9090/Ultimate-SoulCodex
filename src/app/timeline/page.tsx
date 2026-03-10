import PageContainer from "@/components/layout/PageContainer"
import TimelinePhase from "@/components/timeline/TimelinePhase"
import LifeMapStrip from "@/components/timeline/LifeMapStrip"

export default function TimelinePage(){

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Timeline</h1>

      <TimelinePhase />

      <LifeMapStrip />

    </PageContainer>
  )
}

import PageContainer from "@/components/layout/PageContainer"
import ChartWheel from "@/components/advanced/ChartWheel"
import AspectTable from "@/components/advanced/AspectTable"
import InsightTrace from "@/components/advanced/InsightTrace"
import PosterGenerator from "@/components/advanced/PosterGenerator"

export default function AdvancedPage(){

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Advanced</h1>

      <ChartWheel />

      <AspectTable />

      <InsightTrace />

      <PosterGenerator />

    </PageContainer>
  )
}

import PageContainer from "@/components/layout/PageContainer"
import ChartWheel from "@/components/advanced/ChartWheel"
import AspectTable from "@/components/advanced/AspectTable"
import InsightTrace from "@/components/advanced/InsightTrace"
import PosterGenerator from "@/components/advanced/PosterGenerator"

const planets = [
  { name: "Sun", degree: 175 },
  { name: "Moon", degree: 182 },
  { name: "Mercury", degree: 168 },
  { name: "Venus", degree: 210 },
  { name: "Mars", degree: 88 },
]

export default function AdvancedPage(){

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

import PageContainer from "@/components/layout/PageContainer"
import TodayCard from "@/components/cards/TodayCard"
import PhaseCard from "@/components/cards/PhaseCard"
import ThemeTag from "@/components/cards/ThemeTag"

export default function HomePage() {

  return (
    <PageContainer>

      <h1 className="text-xl font-bold">Home</h1>

      <TodayCard />

      <PhaseCard />

      <div className="flex gap-2 flex-wrap">
        <ThemeTag label="Truth"/>
        <ThemeTag label="Precision"/>
        <ThemeTag label="Legacy"/>
      </div>

    </PageContainer>
  )
}

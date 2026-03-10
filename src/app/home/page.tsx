import TodayCard from "@/components/cards/TodayCard"
import PhaseCard from "@/components/cards/PhaseCard"
import ThemeTag from "@/components/cards/ThemeTag"

export default function HomePage() {

  return (
    <div>

      <TodayCard />

      <PhaseCard />

      <div>
        <ThemeTag label="Truth"/>
        <ThemeTag label="Precision"/>
        <ThemeTag label="Legacy"/>
      </div>

    </div>
  )
}

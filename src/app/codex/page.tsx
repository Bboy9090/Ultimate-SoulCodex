"use client"

import Link from "next/link"
import PageContainer from "@/components/layout/PageContainer"
import LoadingCards from "@/components/ui/LoadingCards"
import InsightCard from "@/components/ui/InsightCard"
import ShareableArchetypeCard from "@/components/cards/ShareableArchetypeCard"
import SystemAccordion from "@/components/codex/SystemAccordion"
import { useProfile } from "@/hooks/useProfile"
import { useDisplayMode, type DisplayMode } from "@/hooks/useDisplayMode"
import { buildPlanetInsight, buildLifePathInsight, buildHDInsight } from "@/codex/interpretations"

const MODE_LABELS: { key: DisplayMode; label: string }[] = [
  { key: "simple", label: "Simple" },
  { key: "advanced", label: "Advanced" },
  { key: "research", label: "Research" },
]

export default function CodexPage(){

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined

  const { profile, loading } = useProfile(profileId)
  const { mode, setDisplayMode, defaultExpanded } = useDisplayMode()

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-xl font-bold">Your Codex</h1>
        <LoadingCards count={4} />
      </PageContainer>
    )
  }

  const chart = profile?.chart
  const numerology = profile?.numerology
  const hd = profile?.humanDesign

  const planetInsights = chart ? [
    buildPlanetInsight("Sun", chart.sun?.sign, chart.sun?.degree),
    buildPlanetInsight("Moon", chart.moon?.sign, chart.moon?.degree),
    chart.rising ? buildPlanetInsight("Sun", chart.rising.sign, chart.rising.degree) : null,
    chart.mercury ? buildPlanetInsight("Mercury", chart.mercury.sign, chart.mercury.degree) : null,
    chart.venus ? buildPlanetInsight("Venus", chart.venus.sign, chart.venus.degree) : null,
    chart.mars ? buildPlanetInsight("Mars", chart.mars.sign, chart.mars.degree) : null,
  ].filter(Boolean) : []

  const lpInsight = numerology?.lifePath ? buildLifePathInsight(numerology.lifePath) : null
  const hdInsight = hd?.type ? buildHDInsight(hd.type, hd.strategy, hd.authority) : null

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Your Codex</h1>

      {/* Mode toggle */}
      <div className="flex justify-center gap-1">
        {MODE_LABELS.map(m => (
          <button
            key={m.key}
            onClick={() => setDisplayMode(m.key)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200"
            style={{
              borderColor: mode === m.key ? "rgba(123,97,255,0.5)" : "rgba(45,37,84,0.5)",
              background: mode === m.key ? "rgba(123,97,255,0.15)" : "transparent",
              color: mode === m.key ? "#EAEAF5" : "#8B87A8",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Link
        href="/reading"
        className="block w-full text-center py-3 rounded-codex text-sm font-semibold tracking-wide transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, rgba(123,97,255,0.2) 0%, rgba(242,201,76,0.1) 100%)",
          border: "1px solid rgba(123,97,255,0.2)",
        }}
      >
        Read My Soul
      </Link>

      {/* Archetype card */}
      <ShareableArchetypeCard synthesis={profile?.synthesis} />

      {/* Planet insights */}
      {planetInsights.map((insight, i) => (
        insight && <InsightCard key={i} data={insight} defaultExpanded={defaultExpanded} />
      ))}

      {/* Life Path */}
      {lpInsight && <InsightCard data={lpInsight} defaultExpanded={defaultExpanded} />}

      {/* Human Design */}
      {hdInsight && <InsightCard data={hdInsight} defaultExpanded={defaultExpanded} />}

      {/* System breakdown */}
      <SystemAccordion profile={profile} />

    </PageContainer>
  )
}

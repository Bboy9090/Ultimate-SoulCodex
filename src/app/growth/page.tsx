"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useProfile } from "@/hooks/useProfile"
import { analyzeGrowth, type GrowthSnapshot } from "@/growth/engine"

const SIGNAL_COLORS: Record<string, string> = {
  up: "text-green-400",
  down: "text-red-400",
  stable: "text-codex-textMuted",
}

const SIGNAL_ARROWS: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
}

const COMPASS_COLORS: Record<string, string> = {
  clarity: "#F2C94C",
  pressure: "#ef4444",
  emotion: "#7B61FF",
  strategy: "#6BA7FF",
}

export default function GrowthPage() {
  const [snapshot, setSnapshot] = useState<GrowthSnapshot | null>(null)

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined
  const { profile } = useProfile(profileId)

  const archetype = profile?.synthesis?.archetype || "Soul Architect"

  useEffect(() => {
    const stored = localStorage.getItem("soul_journal")
    const entries = stored ? JSON.parse(stored) : []
    setSnapshot(analyzeGrowth(entries))
  }, [])

  if (!snapshot) return null

  const { signals, compass, weeklyMirror, stage, streakDays, totalEntries } = snapshot

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6 animate-fadeIn">

      <div className="pt-6 text-center">
        <p className="section-label">Growth</p>
        <h1 className="heading-display text-xl mt-2">{archetype}</h1>
        <p className="text-sm text-codex-purple mt-1">
          Stage {stage.stage} — {stage.label}
        </p>
      </div>

      {/* Archetype Evolution */}
      <div className="card">
        <p className="section-label text-center text-codex-gold mb-3">Evolution Stage</p>
        <div className="flex justify-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-all"
              style={{
                background: s <= stage.stage
                  ? "linear-gradient(90deg, #7B61FF, #F2C94C)"
                  : "rgba(45,37,84,0.5)",
              }}
            />
          ))}
        </div>
        <p className="oracle-text text-sm text-codex-textMuted">{stage.description}</p>
      </div>

      {/* Inner Compass */}
      <div className="card">
        <p className="section-label text-center text-codex-purple mb-4">Inner Compass</p>
        <div className="space-y-3">
          {(Object.entries(compass) as [string, number][]).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="capitalize text-codex-textMuted">{key}</span>
                <span style={{ color: COMPASS_COLORS[key] }}>{value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-codex-border/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${value}%`,
                    background: COMPASS_COLORS[key],
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {compass.pressure > 60 && compass.strategy < 40 && (
          <p className="text-xs text-codex-textMuted mt-3 pt-3 border-t border-codex-border/30">
            Pressure high, strategy low. Pause major decisions until the ratio shifts.
          </p>
        )}
      </div>

      {/* Growth Signals */}
      <div className="card">
        <p className="section-label text-center text-codex-gold mb-4">Growth Signals</p>
        <div className="space-y-3">
          {signals.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm">{s.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-codex-border/50 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.value}%`, background: s.direction === "up" ? "#22c55e" : s.direction === "down" ? "#ef4444" : "#8B87A8" }}
                  />
                </div>
                <span className={`text-xs font-medium ${SIGNAL_COLORS[s.direction]}`}>
                  {SIGNAL_ARROWS[s.direction]} {Math.abs(s.change)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Mirror */}
      <div className="card">
        <p className="section-label text-center text-codex-blue mb-3">This Week</p>
        <p className="text-sm leading-relaxed">{weeklyMirror.summary}</p>
        {weeklyMirror.patterns.length > 0 && (
          <div className="mt-3 pt-3 border-t border-codex-border/30">
            <p className="text-xs text-codex-textMuted mb-2">Patterns detected</p>
            <ul className="space-y-1">
              {weeklyMirror.patterns.map((p, i) => (
                <li key={i} className="text-xs text-codex-text flex gap-2">
                  <span className="text-codex-purple shrink-0">›</span> {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-codex-border/30">
          <p className="text-xs text-codex-gold">{weeklyMirror.suggestion}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-codex-gold">{streakDays}</p>
          <p className="text-xs text-codex-textMuted mt-1">Day Streak</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-codex-purple">{totalEntries}</p>
          <p className="text-xs text-codex-textMuted mt-1">Total Entries</p>
        </div>
      </div>

      {/* Actions */}
      <Link
        href="/journal"
        className="block w-full text-center py-3 rounded-codex text-sm font-semibold tracking-wide transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, rgba(123,97,255,0.2) 0%, rgba(242,201,76,0.1) 100%)",
          border: "1px solid rgba(123,97,255,0.2)",
        }}
      >
        Open Journal
      </Link>

      <Link href="/home" className="block text-center text-xs text-codex-textMuted underline">
        Back to Oracle
      </Link>

    </div>
  )
}

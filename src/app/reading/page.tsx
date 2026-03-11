"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

type ReadingStep = {
  id: string
  title: string
  body: string
}

type SoulReading = {
  archetype: string
  steps: ReadingStep[]
}

const STEP_COLORS: Record<string, string> = {
  identity: "text-codex-gold",
  mind: "text-codex-blue",
  emotion: "text-codex-purple",
  stress: "text-red-400",
  relationships: "text-codex-gold",
  blindspot: "text-red-400",
  purpose: "text-codex-purple",
  phase: "text-codex-blue",
  guidance: "text-codex-gold",
}

const STEP_LABELS: Record<string, string> = {
  identity: "01",
  mind: "02",
  emotion: "03",
  stress: "04",
  relationships: "05",
  blindspot: "06",
  purpose: "07",
  phase: "08",
  guidance: "09",
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function SoulReadingPage() {
  const [reading, setReading] = useState<SoulReading | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const profileId = localStorage.getItem("profileId")

        if (profileId) {
          const res = await fetch(`${API_BASE}/api/profiles/${profileId}/soul-reading`)
          if (res.ok) {
            const data = await res.json()
            setReading(data)
            setRevealedCount(1)
            setLoading(false)
            return
          }
        }

        const rawProfile = localStorage.getItem("soulProfile")
        if (rawProfile) {
          const profile = JSON.parse(rawProfile)
          const res = await fetch(`${API_BASE}/api/codex/soul-reading`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile }),
          })
          if (res.ok) {
            const data = await res.json()
            setReading(data)
            setRevealedCount(1)
            setLoading(false)
            return
          }
        }

        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [revealedCount])

  const revealNext = () => {
    if (reading && revealedCount < reading.steps.length) {
      setRevealedCount(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 pt-12 text-center">
        <p className="text-codex-textMuted text-sm">Preparing your reading...</p>
      </div>
    )
  }

  if (!reading) {
    return (
      <div className="max-w-xl mx-auto p-4 pt-12 text-center space-y-4">
        <h1 className="text-xl font-bold">Soul Reading</h1>
        <p className="text-codex-textMuted text-sm">
          Complete your profile to unlock your full reading.
        </p>
        <Link href="/codex" className="text-codex-purple text-sm underline">
          Go to Codex
        </Link>
      </div>
    )
  }

  const revealed = reading.steps.slice(0, revealedCount)
  const hasMore = revealedCount < reading.steps.length

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-8">

      <div className="pt-6 pb-2 text-center">
        <p className="text-xs text-codex-textMuted uppercase tracking-widest">Soul Reading</p>
        <h1 className="text-xl font-bold mt-2">{reading.archetype}</h1>
        <p className="text-xs text-codex-textMuted mt-1">
          {reading.steps.length} revelations
        </p>
      </div>

      {revealed.map((step, i) => (
        <div
          key={step.id}
          className="card"
          style={{
            animation: i === revealedCount - 1 ? "fadeIn 0.6s ease-out" : undefined,
          }}
        >
          <div className="text-center mb-3">
            <span className={`text-xs font-bold ${STEP_COLORS[step.id] || "text-codex-textMuted"}`}>
              {STEP_LABELS[step.id] || String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="text-lg font-semibold mt-1">{step.title}</h2>
          </div>
          <p className="text-sm leading-relaxed text-codex-text">
            {step.body}
          </p>
        </div>
      ))}

      <div ref={bottomRef} />

      {hasMore && (
        <div className="text-center">
          <button
            onClick={revealNext}
            className="bg-codex-purple text-sm font-semibold px-8 py-3 rounded-codex hover:opacity-90 transition-opacity"
          >
            Reveal Next
          </button>
          <p className="text-xs text-codex-textMuted mt-2">
            {revealedCount} of {reading.steps.length}
          </p>
        </div>
      )}

      {!hasMore && (
        <div className="text-center space-y-3 pb-8">
          <p className="text-xs text-codex-textMuted">Reading complete.</p>
          <Link
            href="/codex"
            className="inline-block bg-codex-card border border-codex-border text-sm px-6 py-2 rounded-codex hover:bg-codex-surface transition-colors"
          >
            Back to Codex
          </Link>
        </div>
      )}

    </div>
  )
}

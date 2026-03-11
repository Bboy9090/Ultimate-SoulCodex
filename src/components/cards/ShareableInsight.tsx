"use client"

import { useState } from "react"
import type { CodexSynthesis } from "@/types/soulcodex"

export default function ShareableInsight({ synthesis }: { synthesis?: CodexSynthesis | null }) {
  const [copied, setCopied] = useState(false)

  if (!synthesis) return null

  const insights = [
    synthesis.coreNature,
    synthesis.stressPattern,
    synthesis.blindSpot,
    synthesis.relationshipStyle,
    synthesis.growthEdge,
  ].filter(Boolean)

  const dayIndex = new Date().getDate() % insights.length
  const todayInsight = insights[dayIndex]
  if (!todayInsight) return null

  const shareText = `${todayInsight}\n\n— Soul Codex`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch {
        // user cancelled or not supported
      }
    }
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="w-full text-center text-xs text-codex-textMuted hover:text-codex-text transition-colors py-2"
    >
      {copied ? "Copied to clipboard" : "Share today's insight"}
    </button>
  )
}

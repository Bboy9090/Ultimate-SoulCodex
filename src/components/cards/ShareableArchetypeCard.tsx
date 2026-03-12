"use client"

import { useState } from "react"
import type { CodexSynthesis } from "@/types/soulcodex"

export default function ShareableArchetypeCard({ synthesis }: { synthesis?: CodexSynthesis | null }) {
  const [copied, setCopied] = useState(false)

  if (!synthesis) return null

  const shareText = `${synthesis.archetype}\n\nTop themes: ${synthesis.topThemes.slice(0, 3).join(", ")}\n\n${synthesis.coreNature.split(".")[0]}.\n\n— Soul Codex`

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return } catch {}
    }
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card text-center animate-fadeIn">
      <p className="text-xs text-codex-textMuted uppercase tracking-widest mb-3">Your Archetype</p>

      <h2 className="text-xl font-bold text-codex-gold">{synthesis.archetype}</h2>

      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {synthesis.topThemes.slice(0, 4).map((t, i) => (
          <span key={i} className="px-3 py-1 bg-codex-card border border-codex-border rounded-full text-xs">
            {t}
          </span>
        ))}
      </div>

      <p className="oracle-text text-sm text-codex-textMuted mt-4">
        {synthesis.coreNature.split(".").slice(0, 2).join(".")}.
      </p>

      <p className="text-xs text-codex-textMuted mt-4 opacity-40">Soul Codex</p>

      <button
        onClick={handleShare}
        className="mt-3 text-xs text-codex-purple underline hover:text-codex-text transition-colors"
      >
        {copied ? "Copied to clipboard" : "Share this card"}
      </button>
    </div>
  )
}

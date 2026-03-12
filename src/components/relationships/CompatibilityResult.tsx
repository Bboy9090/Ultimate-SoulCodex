"use client"

import { useState } from "react"

type FrictionZone = {
  area: string
  description: string
  repair: string
}

type CompatAnalysis = {
  score: number
  sharedThemes: string[]
  stressClash: string
  frictionZones: FrictionZone[]
  chemistry: string
  growthEdge: string
  summary: string
}

export default function CompatibilityResult({ data }: { data?: CompatAnalysis | null }) {

  const [copied, setCopied] = useState(false)

  if (!data) {
    return (
      <div className="card">
        <h2 className="card-title">Compatibility Result</h2>
        <p className="oracle-text text-sm text-codex-textMuted">
          Enter two birthdates above to see your full compatibility analysis.
        </p>
      </div>
    )
  }

  const shareText = `Compatibility: ${data.score}%\n\n${data.summary}\n\nChemistry: ${data.chemistry}\n\n— Soul Codex`

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return } catch {}
    }
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4" style={{ animation: "fadeIn 0.5s ease-out" }}>

      {/* Score */}
      <div className="card text-center">
        <p className="text-xs text-codex-textMuted uppercase tracking-wider">Compatibility</p>
        <p className="text-3xl font-bold text-codex-gold mt-1">{data.score}%</p>
        <p className="oracle-text text-sm text-codex-textMuted mt-2">{data.summary}</p>
      </div>

      {/* Chemistry */}
      <div className="card">
        <p className="text-xs text-codex-purple font-bold uppercase tracking-wider text-center mb-3">Chemistry</p>
        <p className="text-sm leading-relaxed">{data.chemistry}</p>
      </div>

      {/* Shared themes */}
      {data.sharedThemes.length > 0 && (
        <div className="card">
          <p className="text-xs text-codex-gold font-bold uppercase tracking-wider text-center mb-3">Shared Themes</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {data.sharedThemes.map((t, i) => (
              <span key={i} className="px-3 py-1 bg-codex-card border border-codex-border rounded-full text-xs">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stress clash */}
      <div className="card">
        <p className="text-xs text-red-400 font-bold uppercase tracking-wider text-center mb-3">Stress Response</p>
        <p className="text-sm leading-relaxed">{data.stressClash}</p>
      </div>

      {/* Friction zones with repair */}
      {data.frictionZones.map((zone, i) => (
        <div key={i} className="card">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider text-center mb-1">Friction Zone</p>
          <h3 className="text-sm font-semibold text-center mb-3">{zone.area}</h3>
          <p className="text-sm leading-relaxed">{zone.description}</p>
          <div className="mt-3 pt-3 border-t border-codex-border">
            <p className="text-xs text-codex-blue font-bold uppercase tracking-wider mb-1">Repair Strategy</p>
            <p className="text-sm leading-relaxed">{zone.repair}</p>
          </div>
        </div>
      ))}

      {/* Growth edge */}
      <div className="card">
        <p className="text-xs text-codex-purple font-bold uppercase tracking-wider text-center mb-3">Growth Edge</p>
        <p className="oracle-text text-sm">{data.growthEdge}</p>
      </div>

      {/* Share */}
      <button
        onClick={handleShare}
        className="w-full text-center text-xs text-codex-textMuted hover:text-codex-text transition-colors py-2"
      >
        {copied ? "Copied to clipboard" : "Share this compatibility reading"}
      </button>
    </div>
  )
}

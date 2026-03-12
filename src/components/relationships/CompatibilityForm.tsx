"use client"

import { useState } from "react"

type Props = {
  onAnalyze: (nameA: string, birthA: string, nameB: string, birthB: string) => void
  loading: boolean
}

export default function CompatibilityForm({ onAnalyze, loading }: Props) {
  const [nameA, setNameA] = useState("")
  const [birthA, setBirthA] = useState("")
  const [nameB, setNameB] = useState("")
  const [birthB, setBirthB] = useState("")

  const canSubmit = birthA && birthB && !loading

  return (
    <div className="card">
      <h2 className="card-title">Compare Two People</h2>

      <div className="space-y-3 mt-4">
        <div>
          <p className="text-xs text-codex-gold font-semibold uppercase tracking-wider mb-2">Person A</p>
          <input
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="Name (optional)"
            className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-2 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple mb-2"
          />
          <input
            type="date"
            value={birthA}
            onChange={(e) => setBirthA(e.target.value)}
            className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-2 text-sm text-codex-text focus:outline-none focus:border-codex-purple"
          />
        </div>

        <div>
          <p className="text-xs text-codex-blue font-semibold uppercase tracking-wider mb-2">Person B</p>
          <input
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="Name (optional)"
            className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-2 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple mb-2"
          />
          <input
            type="date"
            value={birthB}
            onChange={(e) => setBirthB(e.target.value)}
            className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-2 text-sm text-codex-text focus:outline-none focus:border-codex-purple"
          />
        </div>

        <button
          onClick={() => canSubmit && onAnalyze(nameA, birthA, nameB, birthB)}
          disabled={!canSubmit}
          className="w-full bg-codex-purple text-sm font-semibold py-2.5 rounded-codex hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "Analyzing..." : "Analyze Compatibility"}
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

type PatternResult = {
  category: string
  pattern: string
  explanation: string
  strategy: string
}

export default function AskCodex() {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState<PatternResult | null>(null)
  const [loading, setLoading] = useState(false)

  const decode = async () => {
    if (!question.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      const rawProfile = localStorage.getItem("soulProfile")
      const profile = rawProfile ? JSON.parse(rawProfile) : {}
      const res = await fetch(`${API_BASE}/api/pattern/decode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, profile }),
      })
      const data = await res.json()
      if (data.ok && data.result) setResult(data.result)
    } catch {
      // silent — user can retry
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <p className="text-xs text-codex-purple font-bold uppercase tracking-wider text-center mb-3">
        Ask the Codex
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); decode(); }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Why does this keep happening?"
          disabled={loading}
          className="flex-1 bg-codex-surface border border-codex-border rounded-codex px-3 py-2 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple"
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="bg-codex-purple text-sm font-semibold px-4 py-2 rounded-codex hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>

      {result && (
        <div className="mt-4 space-y-3" style={{ animation: "fadeIn 0.4s ease-out" }}>
          <div>
            <p className="text-xs text-codex-gold font-semibold uppercase tracking-wider">Pattern</p>
            <p className="text-sm mt-1">{result.pattern}</p>
          </div>
          <div>
            <p className="text-xs text-codex-blue font-semibold uppercase tracking-wider">Mirror</p>
            <p className="text-sm mt-1">{result.explanation}</p>
          </div>
          <div>
            <p className="text-xs text-codex-purple font-semibold uppercase tracking-wider">Strategy</p>
            <p className="text-sm mt-1">{result.strategy}</p>
          </div>
          <button
            onClick={() => { setResult(null); setQuestion(""); }}
            className="text-xs text-codex-textMuted underline"
          >
            Ask another question
          </button>
        </div>
      )}
    </div>
  )
}

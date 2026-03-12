"use client"

import { useState } from "react"
import Link from "next/link"

type PatternResult = {
  category: string
  pattern: string
  explanation: string
  strategy: string
}

const QUICK_QUESTIONS = [
  { label: "Relationships", q: "Why do I end relationships quickly?" },
  { label: "Work", q: "Why do I get bored with jobs quickly?" },
  { label: "Motivation", q: "Why do I lose motivation after starting projects?" },
  { label: "Stress", q: "Why do arguments stay in my head for days?" },
  { label: "Conflict", q: "Why do I lose patience when people aren't honest?" },
  { label: "Direction", q: "Why do I feel pressure to build something meaningful?" },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function DecodePage() {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState<PatternResult | null>(null)
  const [loading, setLoading] = useState(false)

  const decode = async (q: string) => {
    if (!q.trim() || loading) return
    setLoading(true)
    setResult(null)

    try {
      const rawProfile = localStorage.getItem("soulProfile")
      const profile = rawProfile ? JSON.parse(rawProfile) : {}

      const res = await fetch(`${API_BASE}/api/pattern/decode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, profile }),
      })

      const data = await res.json()
      if (data.ok && data.result) {
        setResult(data.result)
      }
    } catch {
      setResult({
        category: "general",
        pattern: "Could not decode this pattern right now.",
        explanation: "Try again or complete your profile for deeper results.",
        strategy: "Focus on one specific situation and ask again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">

      <div className="pt-4">
        <h1 className="text-xl font-bold">Pattern Decoder</h1>
        <p className="text-xs text-codex-textMuted mt-1">
          Ask why something keeps happening. Your profile decodes the answer.
        </p>
      </div>

      {/* Quick questions */}
      {!result && (
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((qq) => (
            <button
              key={qq.label}
              onClick={() => { setQuestion(qq.q); decode(qq.q); }}
              disabled={loading}
              className="px-3 py-1.5 bg-codex-card border border-codex-border rounded-full text-xs hover:border-codex-gold/60 transition-colors"
            >
              {qq.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); decode(question); }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Why does this keep happening to me?"
          disabled={loading}
          className="flex-1 bg-codex-surface border border-codex-border rounded-codex px-4 py-2.5 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple"
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="bg-codex-purple text-sm font-semibold px-5 py-2.5 rounded-codex hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "..." : "Decode"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="space-y-4" style={{ animation: "fadeIn 0.5s ease-out" }}>

          <div className="card">
            <p className="text-xs text-codex-gold font-bold uppercase tracking-wider mb-1 text-center">Pattern</p>
            <p className="text-xs text-codex-textMuted capitalize text-center mb-3">{result.category}</p>
            <p className="oracle-text text-sm font-semibold">{result.pattern}</p>
          </div>

          <div className="card">
            <p className="text-xs text-codex-blue font-bold uppercase tracking-wider mb-3 text-center">Mirror</p>
            <p className="text-sm leading-relaxed">{result.explanation}</p>
          </div>

          <div className="card">
            <p className="text-xs text-codex-purple font-bold uppercase tracking-wider mb-3 text-center">Strategy</p>
            <p className="text-sm leading-relaxed">{result.strategy}</p>
          </div>

          <button
            onClick={() => { setResult(null); setQuestion(""); }}
            className="w-full text-center bg-codex-card border border-codex-border text-sm py-2.5 rounded-codex hover:bg-codex-surface transition-colors"
          >
            Ask another question
          </button>

        </div>
      )}

      {!result && !loading && (
        <div className="text-center pt-4">
          <Link href="/home" className="text-xs text-codex-textMuted underline">
            Back to Home
          </Link>
        </div>
      )}

    </div>
  )
}

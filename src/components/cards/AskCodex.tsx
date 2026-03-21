"use client"
import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

type PatternResult = {
  category: string
  pattern: string
  explanation: string
  strategy: string
}

const QUICK_PROMPTS = [
  "Why does this keep happening?",
  "What's my blind spot?",
  "Why do I self-sabotage?",
  "What's driving my decisions?",
]

export default function AskCodex() {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState<PatternResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const decode = async (q?: string) => {
    const text = (q || question).trim()
    if (!text || loading) return
    setLoading(true)
    setResult(null)
    setError("")
    try {
      const rawProfile = localStorage.getItem("soulProfile")
      const profile = rawProfile ? JSON.parse(rawProfile) : {}
      const res = await fetch(`${API_BASE}/api/pattern/decode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, profile }),
      })
      const data = await res.json()
      if (data.ok && data.result) {
        setResult(data.result)
      } else {
        setError("Could not decode pattern. Try rephrasing.")
      }
    } catch {
      setError("Connection issue. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(123,97,255,0.16)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <p
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7B61FF",
            marginBottom: "0.25rem",
          }}
        >
          Pattern Decoder
        </p>
        <p style={{ fontSize: "0.8rem", color: "#8B87A8", lineHeight: 1.5 }}>
          Ask about any pattern in your life
        </p>
      </div>

      {/* Quick prompts */}
      {!result && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginBottom: "0.85rem",
          }}
        >
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => { setQuestion(p); decode(p); }}
              disabled={loading}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: 9999,
                border: "1px solid rgba(123,97,255,0.2)",
                background: "transparent",
                color: "#8B87A8",
                fontSize: "0.72rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minHeight: "unset",
                minWidth: "unset",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = "rgba(123,97,255,0.4)"
                el.style.color = "#EAEAF5"
                el.style.background = "rgba(123,97,255,0.07)"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = "rgba(123,97,255,0.2)"
                el.style.color = "#8B87A8"
                el.style.background = "transparent"
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      {!result && (
        <form
          onSubmit={e => { e.preventDefault(); decode(); }}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask your own question..."
            disabled={loading}
            style={{
              flex: 1,
              background: "rgba(20,16,40,0.65)",
              border: "1px solid rgba(45,37,84,0.85)",
              borderRadius: 10,
              padding: "0.6rem 0.85rem",
              fontSize: "0.875rem",
              color: "#EAEAF5",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s ease",
              width: "auto",
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(123,97,255,0.5)" }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(45,37,84,0.85)" }}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: 10,
              background: question.trim() && !loading
                ? "linear-gradient(135deg, #7B61FF, #9B8AFF)"
                : "rgba(45,37,84,0.5)",
              border: "none",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: question.trim() && !loading ? "pointer" : "default",
              transition: "all 0.2s ease",
              minHeight: "unset",
              minWidth: "unset",
              fontFamily: "inherit",
              boxShadow: question.trim() && !loading
                ? "0 4px 14px rgba(123,97,255,0.3)"
                : "none",
              flexShrink: 0,
            }}
          >
            {loading ? "···" : "Decode"}
          </button>
        </form>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.5rem", textAlign: "center" }}>
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div
          className="animate-fadeIn"
          style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
        >
          {/* Pattern */}
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "rgba(242,201,76,0.06)",
              border: "1px solid rgba(242,201,76,0.14)",
              borderRadius: 14,
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#F2C94C",
                marginBottom: "0.4rem",
              }}
            >
              Pattern
            </p>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#EAEAF5" }}>
              {result.pattern}
            </p>
          </div>

          {/* Mirror */}
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "rgba(107,167,255,0.06)",
              border: "1px solid rgba(107,167,255,0.14)",
              borderRadius: 14,
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#6BA7FF",
                marginBottom: "0.4rem",
              }}
            >
              Mirror
            </p>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#EAEAF5" }}>
              {result.explanation}
            </p>
          </div>

          {/* Strategy */}
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "rgba(123,97,255,0.06)",
              border: "1px solid rgba(123,97,255,0.14)",
              borderRadius: 14,
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#9B8AFF",
                marginBottom: "0.4rem",
              }}
            >
              Strategy
            </p>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#EAEAF5" }}>
              {result.strategy}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setResult(null); setQuestion(""); setError(""); }}
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#8B87A8",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "inherit",
              minHeight: "unset",
              minWidth: "unset",
              padding: "0.25rem",
            }}
          >
            Ask another question
          </button>
        </div>
      )}
    </div>
  )
}

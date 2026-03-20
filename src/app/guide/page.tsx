"use client"
import { useState, useEffect, useRef } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""

interface Message {
  role: "user" | "model"
  text: string
}

type Tone = "oracle" | "mirror" | "strategy"

const TONE_CONFIG: Record<Tone, { label: string; description: string; color: string }> = {
  oracle: {
    label: "Oracle",
    description: "Poetic, symbolic, archetypal",
    color: "#F2C94C",
  },
  mirror: {
    label: "Mirror",
    description: "Direct, honest, no softening",
    color: "#7B61FF",
  },
  strategy: {
    label: "Strategy",
    description: "Tactical, practical, actionable",
    color: "#6BA7FF",
  },
}

const SUGGESTIONS = [
  "What pattern am I repeating right now?",
  "What do I need to stop tolerating?",
  "What is this phase trying to teach me?",
  "Why does this keep happening to me?",
  "What's my blind spot in relationships?",
]

function getProfileContext() {
  try {
    const raw = localStorage.getItem("soulProfile")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function GuidePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [tone, setTone] = useState<Tone>("oracle")
  const [statusLine, setStatusLine] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: "user", text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setStatusLine("")

    const profileContext = getProfileContext()
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    }))

    try {
      const res = await fetch(`${API_BASE}/api/chat/soul-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, profileContext, tone }),
      })

      if (!res.ok) {
        setStatusLine("Guide is reconnecting. Your profile insight is still available.")
        setMessages(prev => [
          ...prev,
          { role: "model", text: "The guide is temporarily unavailable. Try again in a moment." },
        ])
        return
      }

      // Streaming response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ""
      setMessages(prev => [...prev, { role: "model", text: "" }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantText += chunk
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "model", text: assistantText }
            return updated
          })
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "model", text: "Could not reach the guide. Check your connection and try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: 640,
        margin: "0 auto",
        padding: "0 0 5rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1rem 0.75rem",
          borderBottom: "1px solid rgba(45,37,84,0.5)",
          background: "rgba(11,14,35,0.6)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
          <p className="section-label" style={{ color: "#7B61FF" }}>Soul Guide</p>
          <h1 style={{ fontSize: "1rem", fontWeight: 600, color: "#EAEAF5" }}>
            Ask your Codex anything
          </h1>
        </div>

        {/* Tone selector (Replit-style) */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {(Object.entries(TONE_CONFIG) as [Tone, typeof TONE_CONFIG[Tone]][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTone(key)}
              style={{
                padding: "0.3rem 0.85rem",
                borderRadius: 9999,
                border: `1px solid ${tone === key ? cfg.color : "rgba(45,37,84,0.6)"}`,
                background: tone === key ? `${cfg.color}20` : "transparent",
                color: tone === key ? cfg.color : "#8B87A8",
                fontSize: "0.75rem",
                fontWeight: tone === key ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: tone === key ? `0 0 10px ${cfg.color}30` : "none",
                minHeight: "unset",
                minWidth: "unset",
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
        {statusLine && (
          <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#8B87A8", marginTop: "0.5rem" }}>
            {statusLine}
          </p>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Empty state */}
        {isEmpty && (
          <div className="animate-fadeIn" style={{ textAlign: "center", paddingTop: "2rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(123,97,255,0.12)",
                border: "1px solid rgba(123,97,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: "1.5rem",
                boxShadow: "0 0 20px rgba(123,97,255,0.15)",
              }}
            >
              ◎
            </div>
            <h2 className="heading-display" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Your Oracle is listening
            </h2>
            <p style={{ color: "#8B87A8", fontSize: "0.875rem", maxWidth: 320, margin: "0 auto 2rem" }}>
              Ask about patterns, decisions, relationships, or what this phase means for you.
            </p>
            {/* Suggestion chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400, margin: "0 auto" }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  style={{
                    padding: "0.65rem 1rem",
                    background: "rgba(28,22,53,0.65)",
                    border: "1px solid rgba(123,97,255,0.15)",
                    borderRadius: 12,
                    color: "#EAEAF5",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    minHeight: "unset",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(123,97,255,0.35)"
                    ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(123,97,255,0.06)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(123,97,255,0.15)"
                    ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(28,22,53,0.65)"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className="animate-fadeIn"
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                padding: "0.75rem 1rem",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, rgba(123,97,255,0.25), rgba(123,97,255,0.15))"
                    : "rgba(28,22,53,0.7)",
                border:
                  msg.role === "user"
                    ? "1px solid rgba(123,97,255,0.3)"
                    : "1px solid rgba(45,37,84,0.5)",
                fontSize: "0.875rem",
                lineHeight: 1.65,
                color: "#EAEAF5",
                backdropFilter: "blur(8px)",
              }}
            >
              {msg.text || (loading && i === messages.length - 1 ? (
                <span style={{ opacity: 0.5 }}>▌</span>
              ) : "")}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && messages[messages.length - 1]?.role !== "model" && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "16px 16px 16px 4px",
                background: "rgba(28,22,53,0.7)",
                border: "1px solid rgba(45,37,84,0.5)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#7B61FF",
                    display: "inline-block",
                    animation: "pulseGlow 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1px solid rgba(45,37,84,0.5)",
          background: "rgba(11,14,35,0.8)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          bottom: "5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask your Codex..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "rgba(28,22,53,0.8)",
              border: "1px solid rgba(45,37,84,0.8)",
              borderRadius: 12,
              padding: "0.7rem 1rem",
              color: "#EAEAF5",
              fontSize: "0.875rem",
              width: "auto",
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #7B61FF, #9B8AFF)"
                : "rgba(45,37,84,0.4)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              color: "#fff",
              transition: "all 0.2s ease",
              boxShadow: input.trim() && !loading ? "0 4px 12px rgba(123,97,255,0.3)" : "none",
              flexShrink: 0,
            }}
          >
            ›
          </button>
        </div>
        <p style={{ fontSize: "0.65rem", color: "#8B87A8", textAlign: "center", marginTop: "0.4rem" }}>
          Tone: {TONE_CONFIG[tone].label} — {TONE_CONFIG[tone].description}
        </p>
      </div>
    </div>
  )
}

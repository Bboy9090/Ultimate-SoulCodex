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
    <div
      className="card animate-fadeIn"
      style={{
        textAlign: "center",
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(242,201,76,0.16)",
        boxShadow: "0 0 32px rgba(242,201,76,0.06), 0 8px 36px rgba(0,0,0,0.42)",
      }}
    >
      {/* Archetype sigil */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(242,201,76,0.08)",
          border: "1px solid rgba(242,201,76,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 0.85rem",
          fontSize: "1rem",
          color: "#F2C94C",
          boxShadow: "0 0 14px rgba(242,201,76,0.14)",
        }}
      >
        ⬡
      </div>

      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(139,135,168,0.7)",
          marginBottom: "0.5rem",
        }}
      >
        Your Archetype
      </p>

      <h2
        className="heading-display"
        style={{ fontSize: "1.35rem", marginBottom: "0.85rem" }}
      >
        {synthesis.archetype}
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center", marginBottom: "1rem" }}>
        {synthesis.topThemes.slice(0, 4).map((t, i) => (
          <span
            key={i}
            style={{
              padding: "0.25rem 0.75rem",
              background: "rgba(242,201,76,0.07)",
              border: "1px solid rgba(242,201,76,0.2)",
              borderRadius: 9999,
              fontSize: "0.72rem",
              color: "#F2C94C",
              fontWeight: 500,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <p
        className="oracle-text"
        style={{ fontSize: "0.875rem", color: "#8B87A8", marginBottom: "1rem" }}
      >
        {synthesis.coreNature.split(".").slice(0, 2).join(".")}.
      </p>

      <div
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(242,201,76,0.15) 50%, transparent)",
          marginBottom: "0.85rem",
        }}
      />

      <button
        onClick={handleShare}
        style={{
          fontSize: "0.72rem",
          color: copied ? "#22c55e" : "#7B61FF",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          fontFamily: "inherit",
          minHeight: "unset",
          minWidth: "unset",
          transition: "color 0.2s ease",
        }}
      >
        {copied ? "Copied to clipboard" : "Share this card"}
      </button>
    </div>
  )
}

"use client"
import { useState } from "react"

const BADGE_CONFIG: Record<string, { bg: string; border: string; text: string; label: string; tooltip: string }> = {
  verified: {
    bg: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.35)",
    text: "#22c55e",
    label: "Verified",
    tooltip: "Time + location locked. Highest accuracy. Rising sign and houses included.",
  },
  partial: {
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    text: "#f59e0b",
    label: "Partial",
    tooltip: "Birth time unknown. No houses or rising-based conclusions. Sun and Moon are still accurate.",
  },
  unverified: {
    bg: "rgba(107, 114, 128, 0.12)",
    border: "rgba(107, 114, 128, 0.35)",
    text: "#6b7280",
    label: "Unverified",
    tooltip: "Missing geo/timezone lock. Chart positions may drift by up to a degree.",
  },
}

export default function ConfidenceBadge({
  level,
  showTooltip = true,
}: {
  level: "verified" | "partial" | "unverified"
  showTooltip?: boolean
}) {
  const [open, setOpen] = useState(false)
  const cfg = BADGE_CONFIG[level] || BADGE_CONFIG.unverified

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span
        className="text-xs font-semibold tracking-widest uppercase"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.32rem",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: "9999px",
          padding: "0.18rem 0.65rem",
          color: cfg.text,
          cursor: showTooltip ? "help" : "default",
          userSelect: "none",
        }}
        onMouseEnter={() => showTooltip && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: cfg.text,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        {cfg.label}
        {showTooltip && <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>?</span>}
      </span>

      {open && showTooltip && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "#1a1a2e",
            border: `1px solid ${cfg.border}`,
            borderRadius: "8px",
            padding: "0.6rem 0.85rem",
            fontSize: "0.73rem",
            color: "#e2e8f0",
            lineHeight: 1.5,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          <strong style={{ color: cfg.text }}>{cfg.label}:</strong> {cfg.tooltip}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              border: "5px solid transparent",
              borderTopColor: cfg.border,
            }}
          />
        </span>
      )}
    </span>
  )
}

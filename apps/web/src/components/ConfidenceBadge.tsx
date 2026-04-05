import { useState } from "react";

export type ConfidenceLevel = "verified" | "partial" | "unverified";

interface ConfidenceBadgeProps {
  badge: ConfidenceLevel | string;
  label?: string;
  reason?: string;
  size?: "sm" | "md";
  showTooltip?: boolean;
}

const BADGE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; tooltip: string }> = {
  verified: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
    label: "Verified",
    tooltip: "Birth time + location are set. Rising sign + houses included."
  },
  partial: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
    label: "Partial",
    tooltip: "Birth time unknown. Rising sign + houses omitted; Sun + Moon stay grounded."
  },
  unverified: {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    border: "rgba(107,114,128,0.35)",
    label: "Unverified",
    tooltip: "Location or timezone missing. Rising sign + houses are not reliable."
  }
};

export default function ConfidenceBadge({
  badge,
  label,
  reason,
  size = "sm",
  showTooltip = true
}: ConfidenceBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const key = (badge ?? "unverified").toLowerCase() as ConfidenceLevel;
  const cfg = BADGE_CONFIG[key] ?? BADGE_CONFIG.unverified;

  const dotSize = size === "md" ? 9 : 7;
  const fontSize = size === "md" ? "0.78rem" : "0.68rem";
  const padding  = size === "md" ? "0.3rem 0.85rem" : "0.18rem 0.6rem";

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.32rem",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: "99px", padding, fontSize, color: cfg.color,
          letterSpacing: "0.07em", cursor: showTooltip ? "help" : "default",
          userSelect: "none"
        }}
        onMouseEnter={() => showTooltip && setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onClick={() => showTooltip && setTooltipOpen(v => !v)}
      >
        <span style={{
          width: dotSize, height: dotSize, borderRadius: "50%",
          background: cfg.color, display: "inline-block", flexShrink: 0
        }} />
        {label ?? cfg.label}
        {showTooltip && <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>?</span>}
      </span>

      {tooltipOpen && showTooltip && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", zIndex: 999,
          background: "#1a1a2e", border: `1px solid ${cfg.border}`,
          borderRadius: "8px", padding: "0.6rem 0.85rem",
          fontSize: "0.73rem", color: "#e2e8f0", lineHeight: 1.5,
          whiteSpace: "nowrap", pointerEvents: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
        }}>
          <strong style={{ color: cfg.color }}>{cfg.label}:</strong> {reason || cfg.tooltip}
          <span style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            border: "5px solid transparent", borderTopColor: cfg.border
          }} />
        </span>
      )}
    </span>
  );
}

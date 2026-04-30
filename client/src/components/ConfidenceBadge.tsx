import { useState } from "react";

export type ConfidenceLevel = "verified" | "partial" | "unverified";

interface ConfidenceBadgeProps {
  badge: ConfidenceLevel | string;
  label?: string;
  reason?: string;
  size?: "sm" | "md";
  showTooltip?: boolean;
  /** Render the reason text inline below the badge pill */
  showReason?: boolean;
}

export const BADGE_CONFIG: Record<string, {
  color: string; bg: string; border: string; label: string; tooltip: string;
}> = {
  verified: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    label: "Verified",
    tooltip: "Birth time and location confirmed. Rising sign and houses are included. Highest signal accuracy.",
  },
  partial: {
    color: "var(--sc-gold)",
    bg: "rgba(212,168,95,0.08)",
    border: "rgba(212,168,95,0.3)",
    label: "Partial",
    tooltip: "Birth time not provided. Sun and Moon are accurate. Houses and rising sign are not included.",
  },
  unverified: {
    color: "var(--sc-text-muted)",
    bg: "rgba(176,160,128,0.08)",
    border: "rgba(176,160,128,0.3)",
    label: "Unverified",
    tooltip: "Location data missing. Chart positions may vary by up to a degree.",
  },
};

/** Normalize any casing / alternate string to one of the three keys */
export function normalizeConfidenceKey(raw: string): ConfidenceLevel {
  const lower = (raw ?? "").toLowerCase();
  if (lower === "verified")   return "verified";
  if (lower === "partial")    return "partial";
  return "unverified";
}

export default function ConfidenceBadge({
  badge,
  label,
  reason,
  size = "sm",
  showTooltip = true,
  showReason = false,
}: ConfidenceBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const key = normalizeConfidenceKey(badge ?? "");
  const cfg = BADGE_CONFIG[key];

  const dotSize  = size === "md" ? 9 : 7;
  const fontSize = size === "md" ? "0.78rem" : "0.68rem";
  const padding  = size === "md" ? "0.3rem 0.85rem" : "0.18rem 0.6rem";

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: "0.3rem" }}>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <span
          role="status"
          tabIndex={0}
          aria-label={`Confidence level: ${label ?? cfg.label}. ${reason || cfg.tooltip}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.32rem",
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: "99px", padding, fontSize, color: cfg.color,
            letterSpacing: "0.07em", cursor: showTooltip ? "help" : "default",
            userSelect: "none", transition: "opacity 0.15s",
          }}
          onMouseEnter={() => showTooltip && setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          onClick={() => showTooltip && setTooltipOpen(v => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              showTooltip && setTooltipOpen(v => !v);
            }
          }}
        >
          <span style={{
            width: dotSize, height: dotSize, borderRadius: "50%",
            background: cfg.color, display: "inline-block", flexShrink: 0,
          }} />
          {label ?? cfg.label}
          {showTooltip && (
            <span style={{ opacity: 0.55, fontSize: "0.65rem", fontStyle: "normal" }}>ⓘ</span>
          )}
        </span>

        {tooltipOpen && showTooltip && (
          <span style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
            transform: "translateX(-50%)", zIndex: 999,
            background: "var(--sc-bg-ink)", border: `1px solid ${cfg.border}`,
            borderRadius: "10px", padding: "0.65rem 0.9rem",
            fontSize: "0.73rem", color: "var(--sc-ivory)", lineHeight: 1.55,
            maxWidth: "260px", whiteSpace: "normal",
            pointerEvents: "none",
            boxShadow: "0 6px 24px rgba(0,0,0,0.8)",
          }}>
            <strong style={{ color: cfg.color, display: "block", marginBottom: "0.2rem" }}>
              {cfg.label}
            </strong>
            {reason || cfg.tooltip}
            <span style={{
              position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
              border: "5px solid transparent", borderTopColor: cfg.border,
            }} />
          </span>
        )}
      </span>

      {showReason && reason && (
        <span style={{
          fontSize: "0.7rem", color: "var(--muted-foreground)",
          fontStyle: "italic", lineHeight: 1.4,
        }}>
          {reason}
        </span>
      )}
    </span>
  );
}

/**
 * EvidenceBadge - Phase 2
 *
 * Visual tags for evidence status
 * Replaces repeated prose explanations with compact indicators
 *
 * Types:
 * [Verified] [Calculated] [Estimated] [Provisional] [Self-reported]
 *
 * On hover: tooltip explains what this means
 */

interface EvidenceBadgeProps {
  type: "verified" | "calculated" | "estimated" | "provisional" | "self_reported" | "missing";
  label?: string;
  tooltip?: string;
  count?: number; // "2 supporting layers"
}

const badgeConfig = {
  verified: {
    bg: "rgba(76, 175, 80, 0.15)",
    border: "1px solid rgba(76, 175, 80, 0.3)",
    color: "rgba(76, 175, 80, 1)",
    icon: "✓",
    defaultLabel: "Verified",
    defaultTooltip: "Calculation confirmed against trusted astronomy data",
  },
  calculated: {
    bg: "rgba(33, 150, 243, 0.15)",
    border: "1px solid rgba(33, 150, 243, 0.3)",
    color: "rgba(33, 150, 243, 1)",
    icon: "⚙",
    defaultLabel: "Calculated",
    defaultTooltip: "Deterministically computed from input data",
  },
  estimated: {
    bg: "rgba(255, 152, 0, 0.15)",
    border: "1px solid rgba(255, 152, 0, 0.3)",
    color: "rgba(255, 152, 0, 1)",
    icon: "≈",
    defaultLabel: "Estimated",
    defaultTooltip: "Computed from incomplete data; range shown",
  },
  provisional: {
    bg: "rgba(156, 39, 176, 0.15)",
    border: "1px solid rgba(156, 39, 176, 0.3)",
    color: "rgba(156, 39, 176, 1)",
    icon: "?",
    defaultLabel: "Provisional",
    defaultTooltip: "Applies pending verification or additional data",
  },
  self_reported: {
    bg: "rgba(103, 58, 183, 0.15)",
    border: "1px solid rgba(103, 58, 183, 0.3)",
    color: "rgba(103, 58, 183, 1)",
    icon: "◆",
    defaultLabel: "Self-reported",
    defaultTooltip: "User-provided information, not independently verified",
  },
  missing: {
    bg: "rgba(158, 158, 158, 0.15)",
    border: "1px dashed rgba(158, 158, 158, 0.3)",
    color: "rgba(158, 158, 158, 1)",
    icon: "—",
    defaultLabel: "Missing",
    defaultTooltip: "Data not available; verification not possible",
  },
};

export default function EvidenceBadge({
  type,
  label,
  tooltip,
  count,
}: EvidenceBadgeProps) {
  const config = badgeConfig[type];
  const displayLabel = label || config.defaultLabel;
  const displayTooltip = tooltip || config.defaultTooltip;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.65rem",
        background: config.bg,
        border: config.border,
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: config.color,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        cursor: "help",
        transition: "all 0.2s ease",
        title: displayTooltip,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = config.bg.replace(
          "0.15",
          "0.25"
        );
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = config.bg;
      }}
    >
      <span style={{ fontSize: "0.85em" }}>{config.icon}</span>
      <span>{displayLabel}</span>
      {count && <span style={{ opacity: 0.7 }}>({count})</span>}
    </span>
  );
}

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  verified: {
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#22c55e",
    label: "Verified",
  },
  partial: {
    bg: "rgba(242, 201, 76, 0.15)",
    text: "#F2C94C",
    label: "Partial",
  },
  unverified: {
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#ef4444",
    label: "Unverified",
  },
}

export default function ConfidenceBadge({ level }: { level: "verified" | "partial" | "unverified" }){
  const style = BADGE_STYLES[level] || BADGE_STYLES.unverified

  return(
    <span
      className="text-xs px-3 py-1 rounded-full font-medium tracking-wide"
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.text}33`,
      }}
    >
      {style.label}
    </span>
  )
}

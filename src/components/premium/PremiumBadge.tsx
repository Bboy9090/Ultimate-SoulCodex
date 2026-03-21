"use client"
import { usePremium } from "@/hooks/usePremium"

interface PremiumBadgeProps {
  className?: string
  size?: "sm" | "md"
}

export default function PremiumBadge({ className = "", size = "sm" }: PremiumBadgeProps) {
  const { isPremium, loading } = usePremium()
  if (loading || !isPremium) return null

  const sizeStyles = size === "sm"
    ? { fontSize: 10, padding: "2px 8px", gap: 4 }
    : { fontSize: 12, padding: "4px 12px", gap: 5 }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-widest uppercase ${className}`}
      style={{
        ...sizeStyles,
        background: "linear-gradient(135deg, rgba(242,201,76,0.18) 0%, rgba(123,97,255,0.12) 100%)",
        border: "1px solid rgba(242,201,76,0.35)",
        color: "#F2C94C",
        letterSpacing: "0.08em",
      }}
    >
      <span>✦</span>
      <span>Premium</span>
    </span>
  )
}

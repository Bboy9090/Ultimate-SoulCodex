"use client"
/**
 * Soul Codex — PremiumGate
 * Wraps any content with a beautiful locked overlay for free-tier users.
 * Shows a preview (blurred) + upgrade CTA.
 */
import { useRouter } from "next/navigation"
import { usePremium, FREE_LIMITS } from "@/hooks/usePremium"

interface PremiumGateProps {
  children: React.ReactNode
  feature?: keyof typeof FREE_LIMITS
  title?: string
  description?: string
  /** If true, shows a usage counter instead of hard-locking */
  soft?: boolean
}

export default function PremiumGate({
  children,
  feature,
  title = "Premium Feature",
  description = "Unlock unlimited access with Soul Codex Premium",
  soft = false,
}: PremiumGateProps) {
  const router = useRouter()
  const { isPremium, loading, canUse, remaining } = usePremium()

  // While loading, show children (optimistic)
  if (loading) return <>{children}</>

  // Premium users see everything
  if (isPremium) return <>{children}</>

  // Soft gate: show usage warning but don't block
  if (soft && feature && canUse(feature)) {
    const rem = remaining(feature)
    return (
      <div className="relative">
        {children}
        {rem <= 3 && rem > 0 && (
          <div
            className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl text-xs"
            style={{
              background: "rgba(242,201,76,0.08)",
              border: "1px solid rgba(242,201,76,0.2)",
            }}
          >
            <span style={{ color: "#F2C94C" }}>
              {rem} {rem === 1 ? "use" : "uses"} remaining this month
            </span>
            <button
              onClick={() => router.push("/upgrade")}
              className="font-semibold underline"
              style={{ color: "#F2C94C" }}
            >
              Upgrade
            </button>
          </div>
        )}
      </div>
    )
  }

  // Hard gate: feature exhausted or premium-only
  const isExhausted = feature && !canUse(feature)

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div
        style={{
          filter: "blur(6px)",
          opacity: 0.35,
          pointerEvents: "none",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-8"
        style={{
          background: "rgba(11,14,35,0.82)",
          backdropFilter: "blur(2px)",
          borderRadius: "inherit",
        }}
      >
        {/* Crown icon */}
        <div
          className="mb-4 flex items-center justify-center w-14 h-14 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(242,201,76,0.2) 0%, rgba(123,97,255,0.15) 100%)",
            border: "1.5px solid rgba(242,201,76,0.35)",
            boxShadow: "0 0 24px rgba(242,201,76,0.15)",
          }}
        >
          <span style={{ fontSize: 24 }}>✦</span>
        </div>

        <h3
          className="font-semibold text-base mb-2"
          style={{ fontFamily: "var(--font-display)", color: "#F2C94C" }}
        >
          {isExhausted ? "Monthly Limit Reached" : title}
        </h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "#8B87A8", maxWidth: 260 }}>
          {isExhausted
            ? `You've used all your free ${feature?.replace(/([A-Z])/g, " $1").toLowerCase()} this month. Upgrade for unlimited access.`
            : description}
        </p>

        <button
          onClick={() => router.push("/upgrade")}
          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #F2C94C 0%, #E6A817 100%)",
            color: "#0B0E23",
            boxShadow: "0 4px 20px rgba(242,201,76,0.35)",
          }}
        >
          Unlock Premium ✦
        </button>

        <p className="mt-3 text-xs" style={{ color: "#8B87A8" }}>
          From $9.99/month · Cancel anytime
        </p>
      </div>
    </div>
  )
}

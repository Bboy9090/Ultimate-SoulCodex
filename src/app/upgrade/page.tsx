"use client"
import { Suspense, useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePremium } from "@/hooks/usePremium"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

interface PlanConfig {
  id: string
  price: string
  interval: string
}

interface PayPalConfig {
  clientId: string
  plans: { monthly: PlanConfig; yearly: PlanConfig }
  currency: string
  sandboxMode: boolean
}

const FREE_FEATURES = [
  "Full Soul Codex profile",
  "Birth chart & all 30+ systems",
  "10 AI Soul Guide messages / month",
  "3 compatibility reads / month",
  "Daily insights & biorhythms",
  "1 PDF export / month",
]

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Unlimited AI Soul Guide conversations",
  "Unlimited compatibility reads",
  "Advanced birth chart wheel",
  "Soul Poster generator",
  "Full Life Map timeline",
  "Unlimited PDF & image exports",
  "Priority AI responses",
  "Early access to new features",
]

function UpgradeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isPremium, loading, activatePremium } = usePremium()

  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly")
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check for PayPal return params
  useEffect(() => {
    const subscriptionId = searchParams?.get("subscription_id")
    const successParam = searchParams?.get("success")
    const cancelled = searchParams?.get("cancelled")

    if (cancelled) {
      setError("Subscription was cancelled. You can try again anytime.")
      return
    }

    if (successParam && subscriptionId) {
      handleActivation(subscriptionId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Load PayPal config
  useEffect(() => {
    fetch(`${API_BASE}/api/paypal/config`)
      .then((r) => r.json())
      .then(setPaypalConfig)
      .catch(() => {})
  }, [])

  const handleActivation = useCallback(
    async (subscriptionId: string) => {
      setProcessing(true)
      const result = await activatePremium(subscriptionId, plan)
      setProcessing(false)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push("/home"), 2500)
      } else {
        setError(result.error || "Activation failed. Please contact support.")
      }
    },
    [activatePremium, plan, router]
  )

  const handleSubscribe = async () => {
    setError(null)
    setProcessing(true)
    try {
      const res = await fetch(`${API_BASE}/api/paypal/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.approveUrl) {
        window.location.href = data.approveUrl
      } else {
        setError(data.message || "Could not start subscription. Please try again.")
        setProcessing(false)
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-codex-purple border-t-transparent animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm animate-fadeIn">
          <div
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(242,201,76,0.25) 0%, rgba(123,97,255,0.2) 100%)",
              border: "2px solid rgba(242,201,76,0.5)",
              boxShadow: "0 0 40px rgba(242,201,76,0.2)",
            }}
          >
            <span style={{ fontSize: 36 }}>✦</span>
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "#F2C94C" }}
          >
            Welcome to Premium
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#8B87A8" }}>
            Your soul's full depth is now unlocked. Returning to your Codex…
          </p>
        </div>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div
            className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(242,201,76,0.2) 0%, rgba(123,97,255,0.15) 100%)",
              border: "1.5px solid rgba(242,201,76,0.4)",
            }}
          >
            <span style={{ fontSize: 28 }}>✦</span>
          </div>
          <h1
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#F2C94C" }}
          >
            You're Premium
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B87A8" }}>
            All features are unlocked for you.
          </p>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(123,97,255,0.15)",
              border: "1px solid rgba(123,97,255,0.3)",
              color: "#9B8AFF",
            }}
          >
            Back to Codex
          </button>
        </div>
      </div>
    )
  }

  const yearlyMonthly = (79.99 / 12).toFixed(2)
  const yearlySavings = Math.round(((9.99 * 12 - 79.99) / (9.99 * 12)) * 100)

  return (
    <div className="min-h-screen px-4 pb-24 pt-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fadeIn" style={{ position: "relative" }}>
        <button
          onClick={() => router.back()}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            padding: "0.5rem",
            borderRadius: "50%",
            color: "#8B87A8",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.1rem",
            lineHeight: 1,
            minHeight: 44,
            minWidth: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Go back"
        >
          ←
        </button>

        <div
          className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(242,201,76,0.2) 0%, rgba(123,97,255,0.15) 100%)",
            border: "1.5px solid rgba(242,201,76,0.35)",
            boxShadow: "0 0 32px rgba(242,201,76,0.15)",
          }}
        >
          <span style={{ fontSize: 28 }}>✦</span>
        </div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Soul Codex Premium
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#8B87A8" }}>
          Unlock the full depth of your soul's blueprint
        </p>
      </div>

      {/* Plan toggle */}
      <div
        className="flex rounded-full p-1 mb-6 mx-auto"
        style={{
          background: "rgba(28,22,53,0.8)",
          border: "1px solid rgba(123,97,255,0.2)",
          maxWidth: 280,
        }}
      >
        {(["monthly", "yearly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className="flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 capitalize"
            style={
              plan === p
                ? {
                    background: "linear-gradient(135deg, rgba(123,97,255,0.3) 0%, rgba(242,201,76,0.15) 100%)",
                    color: "#EAEAF5",
                    border: "1px solid rgba(123,97,255,0.4)",
                  }
                : { color: "#8B87A8" }
            }
          >
            {p}
            {p === "yearly" && (
              <span
                className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(242,201,76,0.2)", color: "#F2C94C" }}
              >
                -{yearlySavings}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            ${plan === "monthly" ? "9.99" : yearlyMonthly}
          </span>
          <span className="text-sm" style={{ color: "#8B87A8" }}>
            / month
          </span>
        </div>
        {plan === "yearly" && (
          <p className="text-xs mt-1" style={{ color: "#8B87A8" }}>
            Billed as $79.99/year · Save ${(9.99 * 12 - 79.99).toFixed(2)}/year
          </p>
        )}
      </div>

      {/* Feature comparison */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Free */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(28,22,53,0.5)",
            border: "1px solid rgba(123,97,255,0.12)",
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#8B87A8" }}
          >
            Free
          </p>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#8B87A8" }}>
                <span className="mt-0.5 shrink-0" style={{ color: "#4A4570" }}>○</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(28,22,53,0.9) 0%, rgba(20,16,40,0.9) 100%)",
            border: "1.5px solid rgba(242,201,76,0.3)",
            boxShadow: "0 0 24px rgba(242,201,76,0.08)",
          }}
        >
          {/* Glow accent */}
          <div
            className="absolute top-0 right-0 w-16 h-16 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(242,201,76,0.15) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#F2C94C" }}
          >
            ✦ Premium
          </p>
          <ul className="space-y-2">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#EAEAF5" }}>
                <span className="mt-0.5 shrink-0" style={{ color: "#F2C94C" }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255,107,107,0.1)",
            border: "1px solid rgba(255,107,107,0.25)",
            color: "#FF9999",
          }}
        >
          {error}
        </div>
      )}

      {/* PayPal CTA */}
      <button
        onClick={handleSubscribe}
        disabled={processing}
        className="w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 disabled:opacity-60"
        style={{
          background: processing
            ? "rgba(242,201,76,0.3)"
            : "linear-gradient(135deg, #F2C94C 0%, #E6A817 100%)",
          color: "#0B0E23",
          boxShadow: processing ? "none" : "0 6px 28px rgba(242,201,76,0.35)",
          border: "none",
          cursor: processing ? "default" : "pointer",
          minHeight: 56,
        }}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Processing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <PayPalIcon />
            Subscribe with PayPal
          </span>
        )}
      </button>

      <p className="text-center text-xs mt-3 leading-relaxed" style={{ color: "#8B87A8" }}>
        Secure payment via PayPal · Cancel anytime · No hidden fees
      </p>

      {paypalConfig?.sandboxMode && (
        <p
          className="text-center text-xs mt-2 px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(107,167,255,0.08)", color: "#6BA7FF" }}
        >
          Sandbox mode active — use PayPal test credentials
        </p>
      )}

      {/* Testimonial / trust signal */}
      <div
        className="mt-8 p-4 rounded-2xl text-center"
        style={{
          background: "rgba(28,22,53,0.4)",
          border: "1px solid rgba(123,97,255,0.1)",
        }}
      >
        <p
          className="text-sm italic leading-relaxed mb-2"
          style={{ fontFamily: "var(--font-oracle)", color: "#EAEAF5" }}
        >
          "The Soul Codex changed how I understand myself. Premium unlocked layers I didn't know existed."
        </p>
        <p className="text-xs" style={{ color: "#8B87A8" }}>
          — Soul Codex Premium member
        </p>
      </div>
    </div>
  )
}

function PayPalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    </svg>
  )
}

// Default export wraps content in Suspense for useSearchParams
export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-codex-purple border-t-transparent animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  )
}

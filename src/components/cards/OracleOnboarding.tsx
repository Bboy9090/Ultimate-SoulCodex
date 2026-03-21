"use client"
import { useState, useEffect } from "react"

const STEPS = [
  {
    icon: "◎",
    title: "This is your Oracle",
    body: "Soul Codex synthesizes astrology, numerology, human design, elements, and behavioral patterns into one intelligence that speaks directly about you.",
    accent: "#F2C94C",
  },
  {
    icon: "◈",
    title: "It updates daily",
    body: "Your daily card uses real planetary transit calculations. Your pattern insight rotates to show different facets of your profile each day.",
    accent: "#7B61FF",
  },
  {
    icon: "✦",
    title: "Ask it anything",
    body: "Use the Guide to decode life patterns — why relationships end the same way, why motivation fades, why certain years felt the way they did.",
    accent: "#6BA7FF",
  },
]

export default function OracleOnboarding() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("oracle_onboarding_done")
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem("oracle_onboarding_done", "true")
  }

  const goToStep = (s: number) => {
    setFading(true)
    setTimeout(() => {
      setStep(s)
      setFading(false)
    }, 180)
  }

  if (!visible) return null

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div
      className="card animate-fadeInScale"
      style={{
        border: `1px solid ${current.accent}28`,
        boxShadow: `0 0 32px ${current.accent}0A, 0 8px 36px rgba(0,0,0,0.42)`,
        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        textAlign: "center",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: "rgba(45,37,84,0.55)",
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${current.accent}, ${current.accent}AA)`,
            borderRadius: 2,
            transition: "width 0.45s cubic-bezier(0.16,1,0.3,1), background 0.4s ease",
            boxShadow: `0 0 8px ${current.accent}55`,
          }}
        />
      </div>

      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: `${current.accent}12`,
          border: `1px solid ${current.accent}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem",
          fontSize: "1.4rem",
          color: current.accent,
          boxShadow: `0 0 18px ${current.accent}18`,
          transition: "all 0.4s ease",
        }}
      >
        {current.icon}
      </div>

      {/* Step counter */}
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: current.accent,
          marginBottom: "0.5rem",
          transition: "color 0.4s ease",
        }}
      >
        {step + 1} of {STEPS.length}
      </p>

      {/* Title */}
      <h3
        className="heading-display"
        style={{
          fontSize: "1.15rem",
          opacity: fading ? 0 : 1,
          transform: fading ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        {current.title}
      </h3>

      {/* Body */}
      <p
        className="oracle-text"
        style={{
          fontSize: "0.875rem",
          color: "#8B87A8",
          marginTop: "0.75rem",
          opacity: fading ? 0 : 1,
          transform: fading ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        {current.body}
      </p>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.25rem" }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToStep(i)}
            style={{
              width: i === step ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === step ? current.accent : "rgba(139,135,168,0.28)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.32s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: i === step ? `0 0 10px ${current.accent}55` : "none",
              padding: 0,
              minHeight: "unset",
              minWidth: "unset",
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.25rem" }}>
        <button
          type="button"
          onClick={() => {
            if (step < STEPS.length - 1) goToStep(step + 1)
            else dismiss()
          }}
          style={{
            padding: "0.6rem 1.75rem",
            borderRadius: 12,
            background: `linear-gradient(135deg, ${current.accent}CC, ${current.accent}88)`,
            border: "none",
            color: step === STEPS.length - 1 ? "#0B0E23" : "#fff",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            minHeight: "unset",
            minWidth: "unset",
            fontFamily: "inherit",
            boxShadow: `0 4px 16px ${current.accent}30`,
          }}
        >
          {step < STEPS.length - 1 ? "Next" : "Enter the Codex"}
        </button>

        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={dismiss}
            style={{
              fontSize: "0.75rem",
              color: "#8B87A8",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "inherit",
              minHeight: "unset",
              minWidth: "unset",
              padding: "0.25rem",
            }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

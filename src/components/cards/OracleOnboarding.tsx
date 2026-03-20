"use client"
import { useState, useEffect } from "react"

const STEPS = [
  {
    title: "This is your Oracle",
    body: "Soul Codex synthesizes astrology, numerology, human design, elements, and behavioral patterns into one intelligence that speaks directly about you.",
  },
  {
    title: "It updates daily",
    body: "Your daily card uses real planetary transit calculations. Your pattern insight rotates to show different facets of your profile each day.",
  },
  {
    title: "Ask it anything",
    body: "Use the Codex to decode life patterns — why relationships end the same way, why motivation fades, why certain years felt the way they did.",
  },
]

export default function OracleOnboarding() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const dismissed = localStorage.getItem("oracle_onboarding_done")
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem("oracle_onboarding_done", "true")
  }

  if (!visible) return null

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div
      className="card animate-fadeInScale"
      style={{
        border: "1px solid rgba(242, 201, 76, 0.2)",
        boxShadow: "0 0 30px rgba(242, 201, 76, 0.08), 0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Progress bar (Replit-style) */}
      <div className="progress-bar mb-4">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="section-label text-center text-codex-gold mb-1">
        {step + 1} of {STEPS.length}
      </p>
      <h3 className="heading-display text-lg text-center">{current.title}</h3>
      <p className="oracle-text text-sm text-codex-textMuted mt-3">{current.body}</p>

      {/* Step dots (Replit-style pill indicators) */}
      <div className="flex justify-center gap-2 mt-4">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? "#7B61FF" : "rgba(139,135,168,0.3)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: i === step ? "0 0 8px rgba(123,97,255,0.5)" : "none",
              padding: 0,
              minHeight: "unset",
              minWidth: "unset",
            }}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-5">
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="btn-primary text-sm"
            style={{ padding: "0.5rem 1.5rem" }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={dismiss}
            className="btn-primary text-sm"
            style={{ padding: "0.5rem 1.5rem" }}
          >
            Enter the Codex
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button
            onClick={dismiss}
            className="text-xs text-codex-textMuted underline"
            style={{ minHeight: "unset", minWidth: "unset", background: "none", border: "none", cursor: "pointer" }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

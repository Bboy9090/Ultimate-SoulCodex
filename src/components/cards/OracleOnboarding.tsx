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

  return (
    <div className="card animate-fadeInScale" style={{
      border: "1px solid rgba(242, 201, 76, 0.2)",
      boxShadow: "0 0 30px rgba(242, 201, 76, 0.06)",
    }}>
      <p className="section-label text-center text-codex-gold mb-1">
        {step + 1} of {STEPS.length}
      </p>
      <h3 className="heading-display text-lg text-center">{current.title}</h3>
      <p className="oracle-text text-sm text-codex-textMuted mt-3">{current.body}</p>

      <div className="flex justify-center gap-3 mt-5">
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="text-sm font-semibold px-6 py-2 rounded-codex transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7B61FF, #9B8AFF)" }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={dismiss}
            className="text-sm font-semibold px-6 py-2 rounded-codex transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7B61FF, #9B8AFF)" }}
          >
            Enter the Codex
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button onClick={dismiss} className="text-xs text-codex-textMuted underline">
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

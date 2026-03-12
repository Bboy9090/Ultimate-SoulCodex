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
    <div className="card border-codex-gold/30">
      <p className="text-xs text-codex-gold font-bold uppercase tracking-wider text-center mb-2">
        {step + 1} of {STEPS.length}
      </p>
      <h3 className="text-lg font-semibold text-center">{current.title}</h3>
      <p className="oracle-text text-sm text-codex-textMuted mt-2">{current.body}</p>

      <div className="flex justify-center gap-3 mt-4">
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="bg-codex-purple text-sm font-semibold px-6 py-2 rounded-codex hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        ) : (
          <button
            onClick={dismiss}
            className="bg-codex-purple text-sm font-semibold px-6 py-2 rounded-codex hover:opacity-90 transition-opacity"
          >
            Start
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button
            onClick={dismiss}
            className="text-xs text-codex-textMuted underline"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { BirthData, MirrorAnswers } from "@/types/soulcodex"

const TOTAL_STEPS = 5
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""

/* ─── Option Card Component (Replit-style) ─── */
function OptionCard({
  selected,
  onClick,
  label,
  description,
  emoji,
}: {
  selected: boolean
  onClick: () => void
  label: string
  description: string
  emoji?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`option-card${selected ? " selected" : ""}`}
      style={{ textAlign: "left" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        {emoji && (
          <span style={{ fontSize: "1.25rem", flexShrink: 0, marginTop: 2 }}>{emoji}</span>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, marginBottom: "0.2rem", fontSize: "0.9rem" }}>{label}</p>
          <p style={{ fontSize: "0.8rem", color: "#8B87A8", lineHeight: 1.5 }}>{description}</p>
        </div>
        {selected && (
          <span
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#7B61FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              color: "#fff",
              boxShadow: "0 0 8px rgba(123,97,255,0.5)",
            }}
          >
            ✓
          </span>
        )}
      </div>
    </button>
  )
}

/* ─── Chip Button Component (Replit-style) ─── */
function ChipButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip-btn${selected ? " selected" : ""}`}
    >
      {label}
    </button>
  )
}

/* ─── Step 1: Birth Data ─── */
function StepBirth({
  birth,
  update,
}: {
  birth: BirthData
  update: (field: keyof BirthData, value: any) => void
}) {
  return (
    <div className="stagger">
      <h2 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Where and when were you born?
      </h2>
      <p style={{ color: "#8B87A8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        This anchors your chart calculations. The more precise, the deeper the reading.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B87A8", marginBottom: "0.4rem" }}>
            Your Name
          </label>
          <input
            type="text"
            placeholder="What do you go by?"
            value={birth.name || ""}
            onChange={e => update("name", e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B87A8", marginBottom: "0.4rem" }}>
            Birth Date <span style={{ color: "#7B61FF" }}>*</span>
          </label>
          <input
            type="date"
            value={birth.birthDate}
            onChange={e => update("birthDate", e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B87A8", marginBottom: "0.4rem" }}>
            Birth Time{" "}
            <span style={{ color: "#8B87A8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              (optional — unlocks Rising sign)
            </span>
          </label>
          <input
            type="time"
            value={birth.birthTime || ""}
            onChange={e => update("birthTime", e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B87A8", marginBottom: "0.4rem" }}>
            Birth Location <span style={{ color: "#7B61FF" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="City, Country (e.g. Chicago, USA)"
            value={birth.birthPlace}
            onChange={e => update("birthPlace", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 2: Mirror Questions (Multi-Select) ─── */
function StepMirror({
  mirror,
  toggle,
}: {
  mirror: Partial<MirrorAnswers>
  toggle: (field: keyof MirrorAnswers, value: any) => void
}) {
  const selected = mirror.reaction || []
  return (
    <div className="stagger">
      <h2 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        When I&apos;m stressed, I...
      </h2>
      <p style={{ color: "#8B87A8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Pick up to 2. This reveals how your energy shifts under pressure.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <OptionCard
          selected={selected.includes("fix")}
          onClick={() => toggle("reaction", "fix")}
          emoji="⚙️"
          label="Fix it immediately"
          description="I go into problem-solving mode. I need to do something about it right now."
        />
        <OptionCard
          selected={selected.includes("analyze")}
          onClick={() => toggle("reaction", "analyze")}
          emoji="🔍"
          label="Analyze what went wrong"
          description="I replay the situation. I need to understand it before I can move."
        />
        <OptionCard
          selected={selected.includes("talk")}
          onClick={() => toggle("reaction", "talk")}
          emoji="💬"
          label="Talk it through"
          description="I process out loud. Silence makes it worse."
        />
        <OptionCard
          selected={selected.includes("withdraw")}
          onClick={() => toggle("reaction", "withdraw")}
          emoji="🌑"
          label="Go quiet and disappear"
          description="I need space before I can engage. Pushing me makes me shut down further."
        />
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#8B87A8" }}>
        {selected.length}/2 selected
      </p>
    </div>
  )
}

/* ─── Step 3: Drain (Multi-Select) ─── */
function StepDrain({
  mirror,
  toggle,
}: {
  mirror: Partial<MirrorAnswers>
  toggle: (field: keyof MirrorAnswers, value: any) => void
}) {
  const selected = mirror.drain || []
  return (
    <div className="stagger">
      <h2 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        What drains me fastest?
      </h2>
      <p style={{ color: "#8B87A8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Pick up to 2. These identify your core energetic leaks.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <OptionCard
          selected={selected.includes("chaos")}
          onClick={() => toggle("drain", "chaos")}
          emoji="🌪️"
          label="Chaos and unpredictability"
          description="When nothing is stable and I can't plan, I start to unravel."
        />
        <OptionCard
          selected={selected.includes("repetition")}
          onClick={() => toggle("drain", "repetition")}
          emoji="🔄"
          label="Repetition without progress"
          description="Doing the same thing with no movement forward kills my energy."
        />
        <OptionCard
          selected={selected.includes("lies")}
          onClick={() => toggle("drain", "lies")}
          emoji="🎭"
          label="Dishonesty and performance"
          description="When people aren't real with me, I can't function in that environment."
        />
        <OptionCard
          selected={selected.includes("misunderstood")}
          onClick={() => toggle("drain", "misunderstood")}
          emoji="📡"
          label="Being misread or misunderstood"
          description="When people project onto me or assume they know my intentions."
        />
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#8B87A8" }}>
        {selected.length}/2 selected
      </p>
    </div>
  )
}

/* ─── Step 4: Non-Negotiables ─── */
const NON_NEGOTIABLES = [
  "Loyalty", "Honesty", "Respect", "Freedom", "Privacy",
  "Consistency", "Depth", "Clarity", "Fairness", "Autonomy",
]

function StepNonNegotiables({
  selected,
  toggle,
}: {
  selected: string[]
  toggle: (item: string) => void
}) {
  return (
    <div className="stagger">
      <h2 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        I won&apos;t tolerate...
      </h2>
      <p style={{ color: "#8B87A8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Pick exactly 2. These are the hard boundaries of your moral compass.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {NON_NEGOTIABLES.map(item => (
          <ChipButton
            key={item}
            selected={selected.includes(item)}
            onClick={() => toggle(item)}
            label={item}
          />
        ))}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#8B87A8" }}>
        {selected.length}/2 selected
      </p>
    </div>
  )
}

/* ─── Step 5: Goals + Freedom Build (Multi-Select) ─── */
const GOALS = [
  "Build something", "Master a craft", "Lead others", "Change systems",
  "Help others", "Freedom", "Influence", "Stability",
]

function StepGoals({
  goals,
  toggleGoal,
  mirror,
  toggleMirror,
}: {
  goals: string[]
  toggleGoal: (item: string) => void
  mirror: Partial<MirrorAnswers>
  toggleMirror: (field: keyof MirrorAnswers, value: any) => void
}) {
  const selectedFreedom = mirror.freedomBuild || []
  return (
    <div className="stagger">
      <h2 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        What I&apos;m here to do
      </h2>
      <p style={{ color: "#8B87A8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Pick up to 2. These define your primary life drivers.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {GOALS.map(item => (
          <ChipButton
            key={item}
            selected={goals.includes(item)}
            onClick={() => toggleGoal(item)}
            label={item}
          />
        ))}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#8B87A8", marginBottom: "2rem" }}>
        {goals.length}/2 selected
      </p>

      <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600 }}>
        When I imagine freedom, I build...
      </h3>
      <p style={{ marginBottom: "1rem", color: "#8B87A8", fontSize: "0.875rem" }}>
        Pick up to 2. This reveals your structural ideal.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <OptionCard
          selected={selectedFreedom.includes("system")}
          onClick={() => toggleMirror("freedomBuild", "system")}
          emoji="🏗️"
          label="A system or structure"
          description="Something that runs without me having to be present every day."
        />
        <OptionCard
          selected={selectedFreedom.includes("movement")}
          onClick={() => toggleMirror("freedomBuild", "movement")}
          emoji="🌍"
          label="A movement or community"
          description="People gathered around something I believe in."
        />
        <OptionCard
          selected={selectedFreedom.includes("masterpiece")}
          onClick={() => toggleMirror("freedomBuild", "masterpiece")}
          emoji="🎨"
          label="A masterpiece or body of work"
          description="Something that outlasts me and stands on its own."
        />
        <OptionCard
          selected={selectedFreedom.includes("sanctuary")}
          onClick={() => toggleMirror("freedomBuild", "sanctuary")}
          emoji="🏡"
          label="A sanctuary"
          description="A life with peace, beauty, and space to think."
        />
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#8B87A8" }}>
        {selectedFreedom.length}/2 selected
      </p>
    </div>
  )
}

/* ─── Main Onboarding Page ─── */
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [birth, setBirth] = useState<BirthData>({
    birthDate: "",
    birthPlace: "",
    timeKnown: false,
  })

  const [mirror, setMirror] = useState<Partial<MirrorAnswers>>({
    reaction: [],
    betrayal: [],
    drain: [],
    freedomBuild: [],
  })
  const [nonNegotiables, setNonNegotiables] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])

  const updateBirth = (field: keyof BirthData, value: any) => {
    setBirth(prev => ({
      ...prev,
      [field]: value,
      timeKnown: field === "birthTime" ? !!value : prev.timeKnown,
    }))
  }

  const toggleMirror = (field: keyof MirrorAnswers, value: any) => {
    setMirror(prev => {
      const current = prev[field] as any[] || []
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(x => x !== value) }
      }
      if (current.length >= 2) return prev
      return { ...prev, [field]: [...current, value] }
    })
  }

  const toggleNonNeg = (item: string) => {
    setNonNegotiables(prev => {
      if (prev.includes(item)) return prev.filter(x => x !== item)
      if (prev.length >= 2) return prev
      return [...prev, item]
    })
  }

  const toggleGoal = (item: string) => {
    setGoals(prev => {
      if (prev.includes(item)) return prev.filter(x => x !== item)
      if (prev.length >= 2) return prev
      return [...prev, item]
    })
  }

  const canNext = (): boolean => {
    switch (step) {
      case 1: return birth.birthDate.length > 0 && birth.birthPlace.length > 0
      case 2: return (mirror.reaction?.length || 0) > 0
      case 3: return (mirror.drain?.length || 0) > 0
      case 4: return nonNegotiables.length === 2
      case 5: return goals.length === 2 && (mirror.freedomBuild?.length || 0) > 0
      default: return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        birth: { ...birth, timeKnown: !!birth.birthTime },
        mirror: mirror as MirrorAnswers,
        nonNegotiables: nonNegotiables.map(n => n.toLowerCase()),
        goals: goals.map(g => g.toLowerCase()),
      }
      const res = await fetch(`${API_BASE}/api/soul-archetype`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const result = await res.json()
      localStorage.setItem("soulProfile", JSON.stringify(result))
      localStorage.setItem("onboardingData", JSON.stringify(payload))
      if (result?.confidence) {
        localStorage.setItem("soulConfidence", JSON.stringify(result.confidence))
      }
      router.push("/home")
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
    else handleSubmit()
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "2rem 1rem 6rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#7B61FF",
              marginBottom: "0.5rem",
            }}
          >
            Soul Codex
          </p>
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#EAEAF5",
              letterSpacing: "-0.01em",
            }}
          >
            Build your psychological profile
          </h1>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: "0.5rem" }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i < step ? "#7B61FF" : "rgba(45,37,84,0.6)",
                transition: "background 0.3s ease",
                boxShadow: i < step ? "0 0 6px rgba(123,97,255,0.4)" : "none",
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: "0.75rem", color: "#8B87A8", marginBottom: "2rem" }}>
          Step {step} of {TOTAL_STEPS}
        </p>

        {/* Step content */}
        <div key={step} className="animate-fadeIn">
          {step === 1 && <StepBirth birth={birth} update={updateBirth} />}
          {step === 2 && <StepMirror mirror={mirror} toggle={toggleMirror} />}
          {step === 3 && <StepDrain mirror={mirror} toggle={toggleMirror} />}
          {step === 4 && <StepNonNegotiables selected={nonNegotiables} toggle={toggleNonNeg} />}
          {step === 5 && (
            <StepGoals
              goals={goals}
              toggleGoal={toggleGoal}
              mirror={mirror}
              toggleMirror={toggleMirror}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: "#ef4444", marginTop: "1rem", fontSize: "0.875rem" }}>{error}</p>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          {step > 1 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep(step - 1)}
              style={{ flex: "0 0 auto" }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1, opacity: !canNext() || loading ? 0.5 : 1 }}
            disabled={!canNext() || loading}
            onClick={handleNext}
          >
            {loading
              ? "Generating your profile..."
              : step === TOTAL_STEPS
              ? "Reveal My Profile"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  )
}

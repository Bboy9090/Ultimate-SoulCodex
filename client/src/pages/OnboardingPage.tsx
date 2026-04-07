import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

type StressElement = "fire" | "water" | "air" | "earth" | "metal";
type DecisionStyle = "gut" | "analysis" | "consensus" | "impulse" | "avoidance";
type SocialEnergy = "steady" | "bursts" | "sensitive";

interface FormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  stressElement: StressElement | "";
  decisionStyle: DecisionStyle | "";
  nonNegotiables: string[];
  goals: string[];
  socialEnergy: SocialEnergy | "";
}

interface SuccessResult {
  archetype?: { name?: string; tagline?: string; element?: string; role?: string };
  confidence?: { badge?: string; label?: string; reason?: string };
  synthesis?: Record<string, unknown>;
  id?: string;
  profileId?: string;
}

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Basics", "Pressure", "Decisions", "Values", "Purpose"];

const STRESS_OPTIONS: { value: StressElement; label: string; description: string }[] = [
  { value: "air", label: "My mind races", description: "I loop, overthink, and can't stop analyzing every angle" },
  { value: "fire", label: "I explode outward", description: "I get sharp, reactive, and say things I don't mean" },
  { value: "water", label: "I shut down emotionally", description: "I withdraw, go numb, and need space to process" },
  { value: "earth", label: "I lock up physically", description: "My body tenses, I freeze, and I can't make a move" },
  { value: "metal", label: "I get hyper-controlled", description: "I go cold, strategic, and cut off all feeling" },
];

const DECISION_OPTIONS: { value: DecisionStyle; label: string; description: string }[] = [
  { value: "gut", label: "I feel it in my body", description: "I know before I can explain — instinct first, logic later" },
  { value: "analysis", label: "I need all the data", description: "I research, compare, weigh every option before committing" },
  { value: "consensus", label: "I ask people I trust", description: "I check in with others to see if my thinking makes sense" },
  { value: "impulse", label: "I just go for it", description: "I decide fast and deal with the consequences after" },
  { value: "avoidance", label: "I put it off", description: "I avoid choosing until the deadline forces my hand" },
];

const NON_NEGOTIABLES = [
  "Dishonesty",
  "Betrayal",
  "Disrespect",
  "Manipulation",
  "Laziness",
  "Cruelty",
  "Incompetence",
  "Selfishness",
];

const GOALS = [
  "Build something",
  "Understand life",
  "Help others",
  "Freedom",
  "Influence",
  "Stability",
];

const SOCIAL_OPTIONS: { value: SocialEnergy; label: string; description: string }[] = [
  { value: "steady", label: "Steady", description: "I can engage with people consistently without burning out" },
  { value: "bursts", label: "Bursts", description: "I go all-in socially, then need to disappear and recharge" },
  { value: "sensitive", label: "Sensitive", description: "I absorb other people's energy — I have to be selective" },
];

const DEST_CARDS = [
  { glyph: "◉", label: "My Profile", desc: "Your archetype, synthesis, and pattern map", path: "/profile" },
  { glyph: "☽", label: "Today's Reading", desc: "Your daily card, moon phase, and active signals", path: "/today" },
  { glyph: "◈", label: "My Codex", desc: "Your full 30-point soul reading and codename", path: "/codex" },
];

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [successResult, setSuccessResult] = useState<SuccessResult | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    stressElement: "",
    decisionStyle: "",
    nonNegotiables: [],
    goals: [],
    socialEnergy: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("/api/soul-archetype", {
        method: "POST",
        body: JSON.stringify({
          birth_data: {
            name: data.name,
            birthDate: data.birthDate,
            birthTime: data.birthTime || undefined,
            birthLocation: data.birthLocation || undefined,
          },
          stressElement: data.stressElement,
          decisionStyle: data.decisionStyle,
          pressureStyle: "adapt",
          nonNegotiables: data.nonNegotiables.map((n) => n.toLowerCase()),
          goals: data.goals.map((g) => g.toLowerCase()),
          socialEnergy: data.socialEnergy,
        }),
      });
    },
    onSuccess: (result) => {
      localStorage.setItem("soulProfile", JSON.stringify(result));
      localStorage.setItem("onboardingData", JSON.stringify(form));
      if (result?.confidence) {
        localStorage.setItem("soulConfidence", JSON.stringify(result.confidence));
      }
      setSuccessResult(result as SuccessResult);
    },
  });

  const update = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "nonNegotiables" | "goals", item: string, max: number) => {
    setForm((prev) => {
      const arr = prev[field];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter((x) => x !== item) };
      if (arr.length >= max) return prev;
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1: return form.name.trim().length > 0 && form.birthDate.length > 0;
      case 2: return form.stressElement !== "";
      case 3: return form.decisionStyle !== "";
      case 4: return form.nonNegotiables.length === 2;
      case 5: return form.goals.length === 2 && form.socialEnergy !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      mutation.mutate(form);
    }
  };

  // ── O2: Success / handoff screen ─────────────────────────────────────────
  if (successResult) {
    const archetypeName = successResult?.archetype?.name ?? "Your Archetype";
    const archetypeTagline = successResult?.archetype?.tagline ?? "";
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <div style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderTop: "3px solid var(--cosmic-purple)",
            borderRadius: "var(--radius)",
            padding: "2.5rem 2rem",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.6 }}>✦</div>
            <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 5vw, 2.2rem)", marginBottom: "0.5rem", lineHeight: 1.2 }}>
              {archetypeName}
            </h1>
            {archetypeTagline && (
              <p style={{ color: "var(--cosmic-lavender)", fontSize: "0.95rem", marginBottom: "0.75rem", fontStyle: "italic" }}>
                {archetypeTagline}
              </p>
            )}
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
              Your soul profile is ready.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.75rem" }}>
            {DEST_CARDS.map((card) => (
              <button
                key={card.path}
                type="button"
                onClick={() => navigate(card.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                  textAlign: "left",
                  padding: "1rem 1.25rem",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cosmic-purple)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--glass-border)")}
              >
                <span style={{ fontSize: "1.25rem", color: "var(--cosmic-lavender)", flexShrink: 0 }}>{card.glyph}</span>
                <span>
                  <span style={{ fontWeight: 600, display: "block", fontSize: "0.9rem" }}>{card.label}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{card.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="btn btn-primary" onClick={() => navigate("/profile")} type="button" style={{ width: "100%" }}>
              View My Profile
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/today")} type="button" style={{ width: "100%" }}>
              See Today's Reading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── O1: Step form ─────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: 600 }}>

      {/* Progress bar with named labels */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{ flex: 1, position: "relative" }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: i < step ? "var(--cosmic-purple)" : "var(--muted)",
                  transition: "background 0.3s",
                  boxShadow: i < step ? "0 0 6px rgba(124,58,237,0.5)" : "none",
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <span style={{
                fontSize: "0.6rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: i < step ? "var(--cosmic-lavender)" : "var(--muted-foreground)",
                opacity: i < step ? 1 : 0.5,
                transition: "color 0.3s",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in" key={step}>
        {step === 1 && <StepBasicInfo form={form} update={update} />}
        {step === 2 && <StepStress form={form} update={update} />}
        {step === 3 && <StepDecisions form={form} update={update} />}
        {step === 4 && <StepNonNegotiables form={form} toggle={toggleArrayItem} />}
        {step === 5 && <StepGoals form={form} toggle={toggleArrayItem} update={update} />}
      </div>

      {mutation.isError && (
        <p style={{ color: "var(--destructive)", marginTop: "1rem", fontSize: "0.875rem" }}>
          Something went wrong. Please try again.
        </p>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        {step > 1 && (
          <button className="btn btn-secondary" onClick={() => setStep(step - 1)} type="button">
            Back
          </button>
        )}
        <button
          className="btn btn-primary"
          style={{ marginLeft: "auto" }}
          disabled={!canNext() || mutation.isPending}
          onClick={handleNext}
          type="button"
        >
          {mutation.isPending ? "Building your profile…" : step === TOTAL_STEPS ? "Reveal My Profile" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function StepBasicInfo({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  const hasTime = form.birthTime.length > 0;
  const hasLocation = form.birthLocation.trim().length > 0;

  return (
    <div>
      {/* Branded welcome */}
      <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
        <img src="/logo.png" alt="Soul Codex" style={{ height: 80, width: 80, objectFit: "contain", marginBottom: "1rem", display: "block", margin: "0 auto 1rem" }} />
        <h2 className="gradient-text" style={{ marginBottom: "0.4rem", textAlign: "left" }}>
          Map your soul
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.6, textAlign: "left" }}>
          Soul Codex synthesizes 31+ systems — astrology, numerology, Human Design, and more — into one unified profile built around how you actually move through the world.
        </p>
      </div>

      <div className="form-group" style={{ marginBottom: "1.1rem" }}>
        <label className="label">Name</label>
        <input
          className="input"
          type="text"
          placeholder="Your first name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "1.1rem" }}>
        <label className="label">Birth Date</label>
        <input
          className="input"
          type="date"
          value={form.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
        />
      </div>

      {/* Birth time with tiered accuracy pills */}
      <div className="form-group" style={{ marginBottom: "1.1rem" }}>
        <label className="label">Birth Time <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span></label>
        <input
          className="input"
          type="time"
          value={form.birthTime}
          onChange={(e) => update("birthTime", e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
          {/* "Without time" — neutral baseline; dims when time is provided */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.25rem 0.6rem", borderRadius: 99, fontSize: "0.7rem",
            fontWeight: 500, letterSpacing: "0.02em",
            background: "rgba(139,92,246,0.07)",
            border: "1px solid rgba(139,92,246,0.18)",
            color: "var(--muted-foreground)",
            opacity: hasTime ? 0.4 : 0.9,
            transition: "opacity 0.2s",
          }}>
            <span>○</span>
            <span>Without time — Sun · Moon only</span>
          </span>
          {/* "With time" — lights up green when time is entered */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.25rem 0.6rem", borderRadius: 99, fontSize: "0.7rem",
            fontWeight: 500, letterSpacing: "0.02em",
            background: hasTime ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${hasTime ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.07)"}`,
            color: hasTime ? "#22c55e" : "var(--muted-foreground)",
            opacity: hasTime ? 1 : 0.45,
            transition: "all 0.2s",
          }}>
            <span>{hasTime ? "✦" : "◌"}</span>
            <span>With time — Rising · Houses · Full aspects</span>
          </span>
        </div>
      </div>

      {/* Birth location with note */}
      <div className="form-group">
        <label className="label">Birth Location <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span></label>
        <input
          className="input"
          type="text"
          placeholder="City, State/Country"
          value={form.birthLocation}
          onChange={(e) => update("birthLocation", e.target.value)}
        />
        <p style={{ fontSize: "0.72rem", color: hasLocation ? "var(--cosmic-lavender)" : "var(--muted-foreground)", marginTop: "0.4rem", marginBottom: 0, opacity: hasLocation ? 1 : 0.65, transition: "color 0.2s" }}>
          {hasLocation
            ? "✦ Enables personalized transit calculations and relocation accuracy"
            : "◌ Unlocks personalized transits and relocation chart accuracy"}
        </p>
      </div>
    </div>
  );
}

function StepStress({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        When I'm stressed, I...
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick the one that sounds most like you under pressure.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {STRESS_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={form.stressElement === opt.value}
            onClick={() => update("stressElement", opt.value)}
            label={opt.label}
            description={opt.description}
          />
        ))}
      </div>
    </div>
  );
}

function StepDecisions({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        How I make decisions
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        What's your default mode when facing a big choice?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {DECISION_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={form.decisionStyle === opt.value}
            onClick={() => update("decisionStyle", opt.value)}
            label={opt.label}
            description={opt.description}
          />
        ))}
      </div>
    </div>
  );
}

function StepNonNegotiables({ form, toggle }: { form: FormData; toggle: (f: "nonNegotiables" | "goals", item: string, max: number) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        I won't tolerate...
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick exactly 2 things that cross your line.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {NON_NEGOTIABLES.map((item) => (
          <ChipButton
            key={item}
            selected={form.nonNegotiables.includes(item)}
            onClick={() => toggle("nonNegotiables", item, 2)}
            label={item}
          />
        ))}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
        {form.nonNegotiables.length}/2 selected
      </p>
    </div>
  );
}

function StepGoals({ form, toggle, update }: { form: FormData; toggle: (f: "nonNegotiables" | "goals", item: string, max: number) => void; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        What I'm here to do
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick 2 goals that drive you most.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {GOALS.map((item) => (
          <ChipButton
            key={item}
            selected={form.goals.includes(item)}
            onClick={() => toggle("goals", item, 2)}
            label={item}
          />
        ))}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "2rem" }}>
        {form.goals.length}/2 selected
      </p>

      {/* Divider between Goals and Social Energy */}
      <div style={{ borderTop: "1px solid var(--glass-border)", marginBottom: "1.5rem" }} />

      <h3 style={{ marginBottom: "0.4rem", fontSize: "1.1rem", fontWeight: 600 }}>My social energy</h3>
      <p style={{ marginBottom: "1rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
        How do you handle being around people?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {SOCIAL_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={form.socialEnergy === opt.value}
            onClick={() => update("socialEnergy", opt.value)}
            label={opt.label}
            description={opt.description}
          />
        ))}
      </div>
    </div>
  );
}

function OptionCard({ selected, onClick, label, description }: { selected: boolean; onClick: () => void; label: string; description: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "1rem 1.25rem",
        background: selected ? "rgba(124, 58, 237, 0.15)" : "var(--glass-bg)",
        border: selected ? "1px solid var(--cosmic-purple)" : "1px solid var(--glass-border)",
        borderLeft: selected ? "3px solid var(--cosmic-purple)" : "3px solid transparent",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: selected ? "0 0 18px rgba(124, 58, 237, 0.25)" : "none",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</span>
      <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{description}</span>
    </button>
  );
}

function ChipButton({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "0.75rem 1rem",
        background: selected ? "rgba(124, 58, 237, 0.2)" : "var(--glass-bg)",
        border: selected ? "1px solid var(--cosmic-purple)" : "1px solid var(--glass-border)",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        color: selected ? "var(--foreground)" : "var(--muted-foreground)",
        fontWeight: selected ? 600 : 400,
        fontFamily: "var(--font-sans)",
        fontSize: "0.875rem",
        transition: "all 0.2s",
        boxShadow: selected ? "0 0 12px rgba(124, 58, 237, 0.2)" : "none",
      }}
    >
      {label}
    </button>
  );
}

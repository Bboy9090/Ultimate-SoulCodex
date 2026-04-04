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
  goals: string[];
  socialEnergy: SocialEnergy | "";
}

const TOTAL_STEPS = 4;

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

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    stressElement: "",
    decisionStyle: "",
    goals: [],
    socialEnergy: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("/api/soul-archetype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          nonNegotiables: [],
          goals: data.goals.map((g) => g.toLowerCase()),
          socialEnergy: data.socialEnergy,
        }),
      });
      return res.json();
    },
    onSuccess: (result) => {
      localStorage.setItem("soulProfile", JSON.stringify(result));
      localStorage.setItem("onboardingData", JSON.stringify(form));
      if (result?.confidence) {
        localStorage.setItem("soulConfidence", JSON.stringify(result.confidence));
      }
      navigate("/profile");
    },
  });

  const update = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "goals", item: string, max: number) => {
    setForm((prev) => {
      const arr = prev[field];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter((x) => x !== item) };
      if (arr.length >= max) return prev;
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1:
        return form.name.trim().length > 0 && form.birthDate.length > 0;
      case 2:
        return form.stressElement !== "";
      case 3:
        return form.decisionStyle !== "";
      case 4:
        return form.goals.length >= 1 && form.socialEnergy !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      mutation.mutate(form);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: 600 }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i < step ? "var(--cosmic-purple)" : "var(--muted)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      <div className="animate-fade-in" key={step}>
        {step === 1 && <StepBasicInfo form={form} update={update} />}
        {step === 2 && <StepStress form={form} update={update} />}
        {step === 3 && <StepDecisions form={form} update={update} />}
        {step === 4 && <StepGoals form={form} toggle={toggleArrayItem} update={update} />}
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
          {mutation.isPending ? "Generating..." : step === TOTAL_STEPS ? "Reveal My Profile" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function StepBasicInfo({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        Let's start with the basics
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Your name and birth details anchor the math. Add a city so we can lock timezone and rising sign when you have a birth time.
      </p>
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label className="label">Name</label>
        <input
          className="input"
          type="text"
          placeholder="Your first name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label className="label">Birth Date</label>
        <input
          className="input"
          type="date"
          value={form.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
        />
      </div>
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label className="label">
          Accuracy Mode{" "}
          <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>
            — enter your birth time for a Verified chart (rising sign, houses, full aspects)
          </span>
        </label>
        <input
          className="input"
          type="time"
          value={form.birthTime}
          onChange={(e) => update("birthTime", e.target.value)}
          placeholder="HH:MM — leave blank if unknown"
        />
        {!form.birthTime && (
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem", marginBottom: 0 }}>
            No birth time → Partial accuracy. Sun + Moon calculated; rising sign and houses omitted.
          </p>
        )}
      </div>
      <div className="form-group">
        <label className="label">
          Birth location{" "}
          <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>
            (recommended — needed for Verified charts)
          </span>
        </label>
        <input
          className="input"
          type="text"
          placeholder="City, State/Country"
          value={form.birthLocation}
          onChange={(e) => update("birthLocation", e.target.value)}
        />
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

function StepGoals({ form, toggle, update }: { form: FormData; toggle: (f: "goals", item: string, max: number) => void; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        What I'm here to do
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick one or two goals that drive you most right now.
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
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
        {form.goals.length}/2 selected (at least 1)
      </p>

      <h3 style={{ marginBottom: "0.5rem", fontSize: "1.125rem" }}>My social energy</h3>
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
        background: selected ? "rgba(124, 58, 237, 0.2)" : "var(--glass-bg)",
        border: selected ? "1px solid var(--cosmic-purple)" : "1px solid var(--glass-border)",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: selected ? "0 0 20px rgba(124, 58, 237, 0.3)" : "none",
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
        background: selected ? "rgba(124, 58, 237, 0.25)" : "var(--glass-bg)",
        border: selected ? "1px solid var(--cosmic-purple)" : "1px solid var(--glass-border)",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        color: selected ? "var(--foreground)" : "var(--muted-foreground)",
        fontWeight: selected ? 600 : 400,
        fontFamily: "var(--font-sans)",
        fontSize: "0.875rem",
        transition: "all 0.2s",
        boxShadow: selected ? "0 0 15px rgba(124, 58, 237, 0.25)" : "none",
      }}
    >
      {label}
    </button>
  );
}

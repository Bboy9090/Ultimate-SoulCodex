import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, apiFetch } from "../lib/queryClient";
import CosmicLoader from "@/components/CosmicLoader";
import ScButton from "@/components/ScButton";
import { IconCircle, IconLogo, IconSparkles } from "@/components/Icons";
import { saveActiveProfile as saveActiveProfileLegacy } from "../lib/profileStorage";
import { saveActiveProfile } from "../lib/ActiveProfileRepository";
import { getVerifiedPlacement } from "../lib/placementVerification";

type PressurePattern =
  | "spiral_inward"
  | "explode_outward"
  | "shut_down"
  | "lock_up"
  | "hyper_control"
  | "flee_distract";

type EscalationPattern =
  | "suppress_until_snap"
  | "escalate_fast"
  | "go_cold"
  | "people_please"
  | "intellectualize"
  | "withdraw_disappear";

type DecisionFriction =
  | "analysis_paralysis"
  | "fear_of_wrong"
  | "need_consensus"
  | "impulse_regret"
  | "avoidance_freeze"
  | "overthink_intuition";

type DrainPattern =
  | "unstructured_time"
  | "conflict_tension"
  | "performing_energy"
  | "unclear_expectations"
  | "being_needed"
  | "sensory_overload";

type WarmupMode = "love" | "attraction" | "friendship" | "growth";

interface FormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  primary_pressure_pattern: PressurePattern | "";
  secondary_pressure_pattern: PressurePattern | "";
  escalation_pattern: EscalationPattern | "";
  decision_friction_primary: DecisionFriction | "";
  decision_friction_secondary: DecisionFriction | "";
  drain_pattern_primary: DrainPattern | "";
  drain_pattern_secondary: DrainPattern | "";
}

interface SuccessResult {
  archetype?: { name?: string; tagline?: string; element?: string; role?: string };
  confidence?: { badge?: string; label?: string; reason?: string };
  synthesis?: Record<string, unknown>;
  id?: string;
  profileId?: string;
  astrologyData?: { sunSign?: string };
  natalChart?: { sunSign?: string };
  chart?: { sunSign?: string };
  sunSign?: string;
  numerologyData?: { lifePathNumber?: number };
  numerology?: { lifePathNumber?: number; lifePath?: number };
  humanDesignData?: { type?: string };
  humanDesign?: { type?: string };
}

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Birth", "Pressure", "Conflict", "Decisions", "Energy"];
const WARMUP_MODES: WarmupMode[] = ["love", "attraction", "friendship", "growth"];

const PRESSURE_OPTIONS: { value: PressurePattern; label: string; description: string }[] = [
  { value: "spiral_inward", label: "I spiral inward", description: "My thoughts loop and I overthink every angle." },
  { value: "explode_outward", label: "I explode outward", description: "I get sharp, reactive, and say things too fast." },
  { value: "shut_down", label: "I shut down", description: "I go quiet and need space before I can respond." },
  { value: "lock_up", label: "I lock up", description: "My body tenses and I freeze before I move." },
  { value: "hyper_control", label: "I get controlling", description: "I go cold, strategic, and try to manage every detail." },
  { value: "flee_distract", label: "I distract myself", description: "I look for anything else to focus on." },
];

const ESCALATION_OPTIONS: { value: EscalationPattern; label: string; description: string }[] = [
  { value: "suppress_until_snap", label: "I suppress until I snap", description: "I hold it together until it comes out at once." },
  { value: "escalate_fast", label: "I escalate fast", description: "The intensity rises before I can slow it down." },
  { value: "go_cold", label: "I go cold", description: "I detach and become hard to reach." },
  { value: "people_please", label: "I people-please", description: "I smooth things over even when I am not okay." },
  { value: "intellectualize", label: "I intellectualize", description: "I analyze the conflict instead of feeling it." },
  { value: "withdraw_disappear", label: "I disappear", description: "I pull back until the moment passes." },
];

const DECISION_OPTIONS: { value: DecisionFriction; label: string; description: string }[] = [
  { value: "analysis_paralysis", label: "I over-research", description: "I keep gathering facts and delay the choice." },
  { value: "fear_of_wrong", label: "I fear the wrong call", description: "I second-guess myself when the stakes feel high." },
  { value: "need_consensus", label: "I need buy-in", description: "I look for outside agreement before I move." },
  { value: "impulse_regret", label: "I decide too fast", description: "I commit quickly and notice what I missed later." },
  { value: "avoidance_freeze", label: "I avoid it", description: "I wait until pressure forces the choice." },
  { value: "overthink_intuition", label: "I overthink instinct", description: "I sense the answer, then talk myself out of it." },
];

const DRAIN_OPTIONS: { value: DrainPattern; label: string; description: string }[] = [
  { value: "unstructured_time", label: "Unstructured time", description: "Too much open time with no plan drains me." },
  { value: "conflict_tension", label: "Unresolved tension", description: "I cannot relax when something is unresolved." },
  { value: "performing_energy", label: "Performing", description: "Being 'on' when I am tired costs me fast." },
  { value: "unclear_expectations", label: "Unclear expectations", description: "Not knowing what people want creates stress." },
  { value: "being_needed", label: "Being needed too much", description: "Giving without receiving drains me." },
  { value: "sensory_overload", label: "Too much input", description: "Noise, people, and stimulation hit a wall." },
];

const LOADING_LINES = [
  "Reading your birth pattern...",
  "Building compatibility scores...",
  "Mapping numerology and astrology...",
  "Blending your answers into the profile...",
  "Preparing your Soul Codex...",
];

function isValidBirthDate(value: string): boolean {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime()) && date <= new Date();
}

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [successResult, setSuccessResult] = useState<SuccessResult | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    primary_pressure_pattern: "",
    secondary_pressure_pattern: "",
    escalation_pattern: "",
    decision_friction_primary: "",
    decision_friction_secondary: "",
    drain_pattern_primary: "",
    drain_pattern_secondary: "",
  });

  const pressureCount = [form.primary_pressure_pattern, form.secondary_pressure_pattern].filter(Boolean).length;
  const decisionCount = [form.decision_friction_primary, form.decision_friction_secondary].filter(Boolean).length;
  const drainCount = [form.drain_pattern_primary, form.drain_pattern_secondary].filter(Boolean).length;

  const prefetchCompatibility = (sunSign: string, lifePathNumber?: number, hdType?: string) => {
    WARMUP_MODES.forEach((mode) => {
      queryClient.prefetchQuery({
        queryKey: ["/api/compatibility/archetype-matches", sunSign, mode, lifePathNumber, hdType],
        queryFn: async () => {
          const res = await apiFetch("/api/compatibility/archetype-matches", {
            method: "POST",
            body: JSON.stringify({ sunSign, mode, lifePathNumber, hdType }),
          });
          return res.data;
        },
      });
    });
  };

  useEffect(() => {
    if (!isValidBirthDate(form.birthDate) || !form.birthLocation.trim()) return;
    try { localStorage.setItem("soulOnboardingWarmup", JSON.stringify({ status: "pending_verified_calculation", birthDate: form.birthDate, birthTime: form.birthTime || null, birthLocation: form.birthLocation.trim(), startedAt: new Date().toISOString() })); } catch {}
    queryClient.prefetchQuery({ queryKey: ["/api/astro/fullchart", form.birthDate, form.birthTime || "unknown", form.birthLocation.trim()], queryFn: async () => { const res = await apiFetch("/api/astro/fullchart", { method: "POST", body: JSON.stringify({ birthDate: form.birthDate, birthTime: form.birthTime || undefined, timeUnknown: !form.birthTime, birthLocation: form.birthLocation.trim() }) }); return res.data; } });
  }, [form.birthDate, form.birthTime, form.birthLocation, queryClient]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const drainPatterns = [data.drain_pattern_primary, data.drain_pattern_secondary].filter(Boolean) as DrainPattern[];
      const socialEnergyMap: Record<DrainPattern, "steady" | "bursts" | "sensitive"> = {
        sensory_overload: "sensitive",
        being_needed: "sensitive",
        performing_energy: "bursts",
        conflict_tension: "bursts",
        unstructured_time: "steady",
        unclear_expectations: "steady",
      };
      const nonNegotiablesMap: Record<EscalationPattern, string> = {
        suppress_until_snap: "Suppression",
        escalate_fast: "Disrespect",
        go_cold: "Dishonesty",
        people_please: "Manipulation",
        intellectualize: "Incompetence",
        withdraw_disappear: "Betrayal",
      };
      const drainToNonNegotiable: Record<DrainPattern, string> = {
        conflict_tension: "Cruelty",
        being_needed: "Selfishness",
        performing_energy: "Laziness",
        unclear_expectations: "Disrespect",
        unstructured_time: "Incompetence",
        sensory_overload: "Manipulation",
      };
      const drainToGoal: Record<DrainPattern, string> = {
        unstructured_time: "Build something",
        conflict_tension: "Stability",
        performing_energy: "Freedom",
        unclear_expectations: "Understand life",
        being_needed: "Help others",
        sensory_overload: "Freedom",
      };
      const decisionToGoal: Record<DecisionFriction, string> = {
        analysis_paralysis: "Understand life",
        fear_of_wrong: "Stability",
        need_consensus: "Help others",
        impulse_regret: "Build something",
        avoidance_freeze: "Freedom",
        overthink_intuition: "Influence",
      };

      const nonNegotiables: string[] = [];
      if (data.escalation_pattern) nonNegotiables.push(nonNegotiablesMap[data.escalation_pattern as EscalationPattern]);
      if (drainPatterns[0]) nonNegotiables.push(drainToNonNegotiable[drainPatterns[0]]);

      const goals: string[] = [];
      if (drainPatterns[0]) goals.push(drainToGoal[drainPatterns[0]]);
      if (data.decision_friction_primary) {
        const goal = decisionToGoal[data.decision_friction_primary as DecisionFriction];
        if (!goals.includes(goal)) goals.push(goal);
      }

      return apiRequest("https://ultimate-soulcodex.up.railway.app/api/soul-archetype", {
        method: "POST",
        body: JSON.stringify({
          birth_data: {
            name: data.name,
            birthDate: data.birthDate,
            birthTime: data.birthTime || undefined,
            birthLocation: data.birthLocation || undefined,
          },
          primary_pressure_pattern: data.primary_pressure_pattern,
          secondary_pressure_pattern: data.secondary_pressure_pattern,
          escalation_pattern: data.escalation_pattern,
          decision_friction_primary: data.decision_friction_primary,
          decision_friction_secondary: data.decision_friction_secondary,
          drain_pattern_primary: data.drain_pattern_primary,
          drain_pattern_secondary: data.drain_pattern_secondary,
          stressElement: data.primary_pressure_pattern,
          decisionStyle: data.decision_friction_primary,
          pressureStyle: "adapt",
          nonNegotiables: nonNegotiables.map((n) => n.toLowerCase()),
          goals: goals.map((g) => g.toLowerCase()),
          socialEnergy: drainPatterns.length > 0 ? socialEnergyMap[drainPatterns[0]] : "steady",
        }),
      });
    },
    onSuccess: (result: SuccessResult) => {
      const isGuest = localStorage.getItem("soulIsGuest") === "true";
      const storageKey = isGuest ? "soulGuestProfile" : "soulProfile";
      localStorage.setItem(storageKey, JSON.stringify(result));

      // Save to canonical repository with validation
      const saveResult = saveActiveProfile(result);
      if (!saveResult.success) {
        console.warn("[OnboardingPage] Profile save failed:", saveResult.error);
      }

      if (!isGuest) localStorage.setItem("onboardingData", JSON.stringify(form));
      if (result?.confidence) localStorage.setItem(isGuest ? "soulGuestConfidence" : "soulConfidence", JSON.stringify(result.confidence));

      const astro: any = result.astrologyData || result.natalChart || result.chart || {};
      const verifiedSun = getVerifiedPlacement(astro.sun ?? result.chart?.sun);
      const sunSign = verifiedSun?.sign;
      if (sunSign) {
        const lifePath = (result.numerologyData || result.numerology)?.lifePathNumber || result.numerology?.lifePath;
        const hdType = (result.humanDesignData || result.humanDesign)?.type;
        prefetchCompatibility(sunSign, lifePath, hdType);
        queryClient.prefetchQuery({
          queryKey: ["/api/astro/horoscope/daily", sunSign],
          queryFn: async () => {
            const res = await apiFetch(`/api/astro/horoscope/daily?sign=${sunSign}`);
            return res.data;
          },
        });
      }

      try {
        localStorage.setItem("soulOnboardingWarmup", JSON.stringify({ status: sunSign ? "complete_verified" : "complete_unresolved", sunSign: sunSign ?? null, verificationStatus: verifiedSun?.verificationStatus ?? "unresolved", provenance: verifiedSun?.evidence ?? null, completedAt: new Date().toISOString() }));
      } catch {}
      setSuccessResult(result);
    },
  });

  useEffect(() => {
    if (!mutation.isPending) return;
    const interval = setInterval(() => setLoadingLineIndex((prev) => (prev + 1) % LOADING_LINES.length), 3500);
    return () => clearInterval(interval);
  }, [mutation.isPending]);

  const update = (field: keyof FormData, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const togglePair = <T extends string>(primary: keyof FormData, secondary: keyof FormData, value: T) => {
    setForm((prev) => {
      if (prev[primary] === value) return { ...prev, [primary]: "", [secondary]: "" };
      if (prev[secondary] === value) return { ...prev, [secondary]: "" };
      if (prev[primary] === "") return { ...prev, [primary]: value };
      if (prev[secondary] === "") return { ...prev, [secondary]: value };
      return prev;
    });
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1: return form.name.trim().length > 0 && isValidBirthDate(form.birthDate);
      case 2: return pressureCount >= 1;
      case 3: return form.escalation_pattern !== "";
      case 4: return decisionCount >= 1;
      case 5: return drainCount >= 1;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else mutation.mutate(form);
  };

  if (mutation.isPending) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <CosmicLoader label={LOADING_LINES[loadingLineIndex]} />
        <p style={{ marginTop: "1.25rem", color: "var(--sc-stone)", maxWidth: 340, fontSize: "0.85rem", lineHeight: 1.55 }}>
          Your birth-based sections were already warming up while you answered. We are now joining those results with your behavior answers.
        </p>
      </div>
    );
  }

  if (successResult) {
    const archetypeName = successResult?.archetype?.name || "The Seeker";
    const archetypeTagline = successResult?.archetype?.tagline || "Your profile is ready.";
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--safe-top) 2rem var(--safe-bottom)" }}>
        <div className="glassmorphism stagger" style={{ maxWidth: 520, width: "100%", padding: "3rem 2rem", textAlign: "center", borderRadius: 28 }}>
          <IconLogo size={80} className="sc-luminous-logo" />
          <h1 className="heading-display" style={{ fontSize: "2rem", margin: "1.5rem 0 0.75rem" }}>Profile Ready</h1>
          <div style={{ display: "inline-block", padding: "0.5rem 1.25rem", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 99, marginBottom: "1rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--sc-gold)", letterSpacing: "0.05em" }}>{archetypeName}</span>
          </div>
          <p className="oracle-text" style={{ fontSize: "1rem", opacity: 0.82, marginBottom: "2rem" }}>{archetypeTagline}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            <button className="btn btn-primary" style={{ height: "4rem" }} onClick={() => navigate("/today")}>Enter Dashboard</button>
            <button className="btn btn-secondary" style={{ height: "4rem" }} onClick={() => navigate("/compat")}>View Compatibility</button>
            <button className="btn btn-secondary" style={{ height: "4rem" }} onClick={() => navigate("/profile")}>View Soul Map</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "var(--safe-top) 2rem var(--safe-bottom)" }}>
        <IconLogo size={170} className="sc-luminous-logo" />
        <div style={{ maxWidth: 480, marginTop: "2.5rem" }}>
          <h1 className="heading-display" style={{ fontSize: "3rem", marginBottom: "1.25rem", lineHeight: 1.1 }}>Build Your Soul Codex</h1>
          <p style={{ color: "var(--sc-stone)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "3rem", opacity: 0.82 }}>
            Enter your birth details first. We start the birth-based readings in the background while you answer the rest.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <button id="calibration-begin-btn" className="btn btn-primary" style={{ height: "4rem", fontSize: "1.1rem" }} onClick={() => { localStorage.setItem("soulIsGuest", "false"); setStep(1); }}>Build My Profile</button>
            <button id="guest-terminal-btn" className="btn btn-secondary" style={{ height: "4rem", fontSize: "1rem" }} onClick={() => { localStorage.removeItem("soulGuestProfile"); localStorage.setItem("soulIsGuest", "true"); setStep(1); }}>Start as Guest</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: 600, position: "relative", overflow: "hidden" }}>
      <img
        src="/soul-codex-logo-star.png"
        aria-hidden="true"
        style={{
          position: "absolute", top: "-80px", left: "50%",
          transform: "translateX(-50%)",
          width: 500, height: 500, objectFit: "contain",
          opacity: 0.07, mixBlendMode: "screen",
          filter: "blur(30px)",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>

        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} style={{ flex: 1, position: "relative" }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: i < step ? "var(--sc-gold)" : "var(--muted)",
                    transition: "background 0.3s",
                    boxShadow: i < step ? "0 0 6px rgba(212,168,95,0.5)" : "none",
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
                  color: i < step ? "var(--sc-gold)" : "var(--muted-foreground)",
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

        <div className="animate-fade-in" key={step} style={{ minHeight: "360px" }}>
          {step === 1 && <StepBasicInfo form={form} update={update} />}
          {step === 2 && <StepPressure form={form} toggle={togglePressure} count={pressureCount} />}
          {step === 3 && <StepEscalation form={form} update={update} />}
          {step === 4 && <StepDecisions form={form} toggle={toggleDecisionFriction} count={decisionCount} />}
          {step === 5 && <StepDrain form={form} toggle={toggleDrain} count={drainCount} />}
        </div>

        {mutation.isError && (
          <p style={{ color: "var(--destructive)", marginTop: "1rem", fontSize: "0.875rem" }}>
            {mutation.error instanceof Error ? mutation.error.message : "Something went wrong. Please try again."}
          </p>
        )}

        <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
          <ScButton
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || mutation.isPending}
            className={step === 1 ? "invisible" : ""}
          >
            ← Back
          </ScButton>
          
          <ScButton
            onClick={handleNext}
            disabled={!canNext()}
            loading={mutation.isPending}
            className="flex-1 text-glow"
          >
            {step === TOTAL_STEPS ? "Reveal My Profile" : "Continue"}
          </ScButton>
        </div>

        {/* ── Legal Compliance Footer ─────────────────────────────────── */}
        {step === 1 && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{
              fontSize: "0.72rem",
              color: "var(--muted-foreground)",
              lineHeight: 1.5,
              opacity: 0.7,
              maxWidth: "320px",
              margin: "0 auto"
            }}>
              By continuing, you acknowledge that you have read our{" "}
              <a href="/privacy" target="_blank" style={{ color: "var(--sc-gold)", textDecoration: "underline" }}>Privacy Policy</a>
              {" "}and agree to our{" "}
              <a href="/terms" target="_blank" style={{ color: "var(--sc-gold)", textDecoration: "underline" }}>Terms of Service</a>.
            </p>
          </div>
        )}
      </div>

      {mutation.isError && <div style={{ color: "#ff4444", marginTop: "1.5rem", fontSize: "0.875rem", lineHeight: 1.5, background: "rgba(255,68,68,0.1)", padding: "1rem", borderRadius: 8, border: "1px solid rgba(255,68,68,0.2)", textAlign: "left" }}><strong style={{ display: "block", marginBottom: "0.25rem" }}>Profile generation failed</strong>{(mutation.error as Error)?.message || "Check your connection and try again."}</div>}

      <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
        <ScButton id="onboarding-back-btn" variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || mutation.isPending} className={step === 1 ? "invisible" : ""}>Back</ScButton>
        <ScButton id="onboarding-continue-btn" onClick={handleNext} disabled={!canNext()} loading={mutation.isPending} className="flex-1 text-glow">{step === TOTAL_STEPS ? "Reveal My Profile" : "Continue"}</ScButton>
      </div>

      {step === 1 && <p style={{ margin: "2rem auto 0", textAlign: "center", fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.5, opacity: 0.72, maxWidth: 340 }}>By continuing, you agree to the <a href="/privacy" target="_blank" style={{ color: "var(--sc-gold)", textDecoration: "underline" }}>Privacy Policy</a> and <a href="/terms" target="_blank" style={{ color: "var(--sc-gold)", textDecoration: "underline" }}>Terms of Service</a>.</p>}
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? "var(--sc-gold)" : "var(--muted)", boxShadow: i < step ? "0 0 6px rgba(212,168,95,0.5)" : "none" }} />)}
      </div>
      <div style={{ display: "flex", gap: 5 }}>{STEP_LABELS.map((label, i) => <div key={label} style={{ flex: 1, textAlign: "center" }}><span style={{ fontSize: "0.58rem", letterSpacing: "0.05em", textTransform: "uppercase", color: i < step ? "var(--sc-gold)" : "var(--muted-foreground)", opacity: i < step ? 1 : 0.5, whiteSpace: "nowrap" }}>{label}</span></div>)}</div>
    </div>
  );
}

function StepBasicInfo({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  const hasTime = form.birthTime.length > 0;
  const hasLocation = form.birthLocation.trim().length > 0;
  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 className="gradient-text" style={{ marginBottom: "0.4rem" }}>Birth details first</h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.6 }}>We start the astrology, numerology, and compatibility prep as soon as your birth date is entered. Time and location make the chart more specific.</p>
      </div>
      <Field id="name" label="Name" type="text" placeholder="Your first name" value={form.name} onChange={(value) => update("name", value)} />
      <Field id="birthDate" label="Birth Date" type="date" value={form.birthDate} onChange={(value) => update("birthDate", value)} />
      <Field id="birthTime" label="Birth Time" type="time" optional value={form.birthTime} onChange={(value) => update("birthTime", value)} />
      <div style={{ display: "flex", gap: "0.6rem", marginTop: "-0.3rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
        <span className="system-badge" style={{ opacity: hasTime ? 0.4 : 1 }}><IconCircle size={10} /><span>No time: Sun and Moon focus</span></span>
        <span className="system-badge" style={{ opacity: hasTime ? 1 : 0.45, color: hasTime ? "#22c55e" : "inherit" }}>{hasTime ? <IconSparkles size={10} /> : <IconCircle size={10} />}<span>With time: Rising, houses, aspects</span></span>
      </div>
      <Field id="birthLocation" label="Birth Location" type="text" optional placeholder="City, State/Country" value={form.birthLocation} onChange={(value) => update("birthLocation", value)} />
      <p style={{ fontSize: "0.72rem", color: hasLocation ? "var(--cosmic-lavender)" : "var(--muted-foreground)", marginTop: "0.4rem", opacity: hasLocation ? 1 : 0.65 }}>{hasLocation ? "Location-based chart prep will start in the background." : "Add location for houses, rising sign, and more accurate timing."}</p>
    </div>
  );
}

function Field({ id, label, optional, type, placeholder, value, onChange }: { id: string; label: string; optional?: boolean; type: string; placeholder?: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="form-group" style={{ marginBottom: "1.1rem" }}>
      <label className="label" htmlFor={id}>{label} {optional && <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span>}</label>
      <input id={id} className="input" type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ChoiceStep<T extends string>({ title, help, options, selected, count, onSelect }: { title: string; help: string; options: { value: T; label: string; description: string }[]; selected: (T | "")[]; count: number; onSelect: (value: T) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>{title}</h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>{help}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{options.map((opt) => <OptionCard key={opt.value} selected={selected.includes(opt.value)} disabled={!selected.includes(opt.value) && count >= 2} onClick={() => onSelect(opt.value)} label={opt.label} description={opt.description} />)}</div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{count}/2 selected</p>
    </div>
  );
}

function SingleChoiceStep<T extends string>({ title, help, options, selected, onSelect }: { title: string; help: string; options: { value: T; label: string; description: string }[]; selected: T | ""; onSelect: (value: T) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>{title}</h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>{help}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{options.map((opt) => <OptionCard key={opt.value} selected={selected === opt.value} disabled={false} onClick={() => onSelect(opt.value)} label={opt.label} description={opt.description} />)}</div>
    </div>
  );
}

function OptionCard({ selected, disabled, onClick, label, description }: { selected: boolean; disabled: boolean; onClick: () => void; label: string; description: string }) {
  return (
    <button type="button" className={`onboarding-option-btn ${selected ? "selected" : ""}`} onClick={onClick} disabled={disabled}>
      <span style={{ fontWeight: 600, marginBottom: 4 }}>{label}</span>
      <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{description}</span>
    </button>
  );
}

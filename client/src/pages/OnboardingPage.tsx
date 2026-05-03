import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, apiFetch } from "../lib/queryClient";
import CosmicLoader from "@/components/CosmicLoader";
import ScButton from "@/components/ScButton";
import AppleSignInButton from "@/components/AppleSignInButton";
import { 
  IconIdentity, IconMoon, IconCodex, IconSparkles, 
  IconArrowRight, IconCircle, IconLogo
} from "@/components/Icons";

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
}

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Blueprint", "Pressure", "Escalation", "Decisions", "Drain"];

const PRESSURE_OPTIONS: { value: PressurePattern; label: string; description: string }[] = [
  { value: "spiral_inward", label: "I spiral inward", description: "My thoughts loop — I overthink every angle and can't find the exit" },
  { value: "explode_outward", label: "I explode outward", description: "I get sharp, reactive, and say things I don't mean" },
  { value: "shut_down", label: "I shut down", description: "I go quiet, withdraw emotionally, and need to disappear to process" },
  { value: "lock_up", label: "I lock up physically", description: "My body tenses, I freeze, and I can't make a move" },
  { value: "hyper_control", label: "I get hyper-controlled", description: "I go cold, strategic, and cut off all feeling to function" },
  { value: "flee_distract", label: "I flee or distract", description: "I find something — anything — else to focus on instead" },
];

const ESCALATION_OPTIONS: { value: EscalationPattern; label: string; description: string }[] = [
  { value: "suppress_until_snap", label: "I suppress until I snap", description: "I hold it together until I can't — then it comes out all at once" },
  { value: "escalate_fast", label: "I escalate fast", description: "The intensity spikes quickly — I react before I can moderate" },
  { value: "go_cold", label: "I go cold", description: "I detach, stop responding, and become hard to reach" },
  { value: "people_please", label: "I people-please to de-escalate", description: "I smooth it over even when I'm not okay — just to end the tension" },
  { value: "intellectualize", label: "I intellectualize", description: "I analyze the conflict instead of feeling it — keep it in my head" },
  { value: "withdraw_disappear", label: "I withdraw and disappear", description: "I remove myself physically or emotionally until the moment passes" },
];

const DECISION_OPTIONS: { value: DecisionFriction; label: string; description: string }[] = [
  { value: "analysis_paralysis", label: "I over-research and stall", description: "I need more data — the decision stays open while I gather more" },
  { value: "fear_of_wrong", label: "I fear making the wrong call", description: "The stakes feel high and I second-guess myself into inaction" },
  { value: "need_consensus", label: "I need buy-in before I move", description: "I check with others — I don't fully trust my own read" },
  { value: "impulse_regret", label: "I decide fast then regret it", description: "I commit quickly under pressure and realize later what I missed" },
  { value: "avoidance_freeze", label: "I avoid until the deadline forces me", description: "I put it off until the last possible moment — then decide fast" },
  { value: "overthink_intuition", label: "I overthink my own instincts", description: "I sense the answer but talk myself out of trusting it" },
];

const DRAIN_OPTIONS: { value: DrainPattern; label: string; description: string }[] = [
  { value: "unstructured_time", label: "Unstructured open time", description: "Long stretches with no clear container or agenda deplete me" },
  { value: "conflict_tension", label: "Unresolved conflict or tension", description: "I can't fully relax when there's something unresolved in the air" },
  { value: "performing_energy", label: "Performing energy I don't have", description: "Showing up 'on' when I'm running empty costs me significantly" },
  { value: "unclear_expectations", label: "Unclear expectations", description: "Not knowing what's expected of me creates constant low-grade anxiety" },
  { value: "being_needed", label: "Being needed without reciprocity", description: "Giving without anything coming back empties me faster than most things" },
  { value: "sensory_overload", label: "Sensory or social overload", description: "Too much stimulation — noise, people, input — hits a wall fast" },
];

const LOADING_LINES = [
  "Reading your birth pattern...",
  "Mapping symbolic systems...",
  "Calculating numerology and astrology...",
  "Synthesizing your archetype...",
  "Preparing your profile results..."
];

const DEST_CARDS = [
  { glyph: IconIdentity, label: "My Profile", desc: "Your archetype, synthesis, and pattern map", path: "/profile" },
  { glyph: IconMoon, label: "Today's Reading", desc: "Your daily card, moon phase, and active signals", path: "/today" },
  { glyph: IconCodex, label: "My Codex", desc: "Your full 30-point soul reading and codename", path: "/codex" },
];

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [successResult, setSuccessResult] = useState<SuccessResult | null>(null);
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
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);


  const startGuestMode = () => {
    // Clear any previous guest session but leave owner session intact
    localStorage.removeItem("soulGuestProfile");
    localStorage.setItem("soulIsGuest", "true");
    setStep(1); // Start the process
  };

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
      const legacySocialEnergy: "steady" | "bursts" | "sensitive" =
        drainPatterns.length > 0 ? socialEnergyMap[drainPatterns[0]] : "steady";

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
      const legacyNonNegotiables: string[] = [];
      if (data.escalation_pattern) legacyNonNegotiables.push(nonNegotiablesMap[data.escalation_pattern as EscalationPattern]);
      if (drainPatterns[0]) legacyNonNegotiables.push(drainToNonNegotiable[drainPatterns[0]]);

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
      const legacyGoals: string[] = [];
      if (drainPatterns[0]) legacyGoals.push(drainToGoal[drainPatterns[0]]);
      if (data.decision_friction_primary) {
        const goal = decisionToGoal[data.decision_friction_primary as DecisionFriction];
        if (!legacyGoals.includes(goal)) legacyGoals.push(goal);
      }

      return apiRequest("/api/soul-archetype", {
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
          nonNegotiables: legacyNonNegotiables.map((n) => n.toLowerCase()),
          goals: legacyGoals.map((g) => g.toLowerCase()),
          socialEnergy: legacySocialEnergy,
        }),
      });
    },
    onSuccess: (result) => {
      const isGuest = localStorage.getItem("soulIsGuest") === "true";
      const storageKey = isGuest ? "soulGuestProfile" : "soulProfile";
      
      localStorage.setItem(storageKey, JSON.stringify(result));
      if (!isGuest) {
        localStorage.setItem("onboardingData", JSON.stringify(form));
      }
      
      if (result?.confidence) {
        localStorage.setItem(isGuest ? "soulGuestConfidence" : "soulConfidence", JSON.stringify(result.confidence));
      }
      setSuccessResult(result as SuccessResult);

      // --- Pre-warm Compatibility & Horoscope ---
      const astro = result.astrologyData || result.natalChart || result.chart || {};
      const sunSign = astro.sunSign || result.sunSign;
      if (sunSign) {
        const lifePath = (result.numerologyData || result.numerology)?.lifePathNumber;
        const hdType = (result.humanDesignData || result.humanDesign)?.type;

        // Warm up archetype matches
        queryClient.prefetchQuery({
          queryKey: ["/api/compatibility/archetype-matches", sunSign, "love", lifePath, hdType],
          queryFn: async () => {
            const res = await apiFetch("/api/compatibility/archetype-matches", {
              method: "POST",
              body: JSON.stringify({ sunSign, mode: "love", lifePathNumber: lifePath, hdType })
            });
            return res.data;
          }
        });

        // Warm up daily horoscope
        queryClient.prefetchQuery({
          queryKey: ["/api/astro/horoscope/daily", sunSign],
          queryFn: async () => {
            const res = await apiFetch(`/api/astro/horoscope/daily?sign=${sunSign}`);
            return res.data;
          }
        });
      }
    },
  });

  useEffect(() => {
    if (mutation.isPending) {
      const interval = setInterval(() => {
        setLoadingLineIndex((prev) => (prev + 1) % LOADING_LINES.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [mutation.isPending]);

  const update = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePressure = (value: PressurePattern) => {
    setForm((prev) => {
      if (prev.primary_pressure_pattern === value) {
        return { ...prev, primary_pressure_pattern: "", secondary_pressure_pattern: "" };
      }
      if (prev.secondary_pressure_pattern === value) {
        return { ...prev, secondary_pressure_pattern: "" };
      }
      if (prev.primary_pressure_pattern === "") {
        return { ...prev, primary_pressure_pattern: value };
      }
      if (prev.secondary_pressure_pattern === "") {
        return { ...prev, secondary_pressure_pattern: value };
      }
      return prev;
    });
  };

  const toggleDecisionFriction = (value: DecisionFriction) => {
    setForm((prev) => {
      if (prev.decision_friction_primary === value) {
        return { ...prev, decision_friction_primary: "", decision_friction_secondary: "" };
      }
      if (prev.decision_friction_secondary === value) {
        return { ...prev, decision_friction_secondary: "" };
      }
      if (prev.decision_friction_primary === "") {
        return { ...prev, decision_friction_primary: value };
      }
      if (prev.decision_friction_secondary === "") {
        return { ...prev, decision_friction_secondary: value };
      }
      return prev;
    });
  };

  const toggleDrain = (value: DrainPattern) => {
    setForm((prev) => {
      if (prev.drain_pattern_primary === value) {
        return { ...prev, drain_pattern_primary: "", drain_pattern_secondary: "" };
      }
      if (prev.drain_pattern_secondary === value) {
        return { ...prev, drain_pattern_secondary: "" };
      }
      if (prev.drain_pattern_primary === "") {
        return { ...prev, drain_pattern_primary: value };
      }
      if (prev.drain_pattern_secondary === "") {
        return { ...prev, drain_pattern_secondary: value };
      }
      return prev;
    });
  };

  const pressureCount = [form.primary_pressure_pattern, form.secondary_pressure_pattern].filter(Boolean).length;
  const decisionCount = [form.decision_friction_primary, form.decision_friction_secondary].filter(Boolean).length;
  const drainCount = [form.drain_pattern_primary, form.drain_pattern_secondary].filter(Boolean).length;

  const canNext = (): boolean => {
    switch (step) {
      case 1: {
        const hasName = form.name.trim().length > 0;
        const hasDate = form.birthDate.length > 0;
        if (!hasDate) return false;
        
        // Prevent future dates
        const date = new Date(form.birthDate);
        const isFuture = date > new Date();
        return hasName && hasDate && !isFuture;
      }
      case 2: return pressureCount >= 1;
      case 3: return form.escalation_pattern !== "";
      case 4: return decisionCount >= 1;
      case 5: return drainCount >= 1;
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



  if (mutation.isPending) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <CosmicLoader label={LOADING_LINES[loadingLineIndex]} />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ marginTop: "1.5rem", maxWidth: "320px" }}
        >
          <p style={{ color: "var(--sc-gold)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
            The engine is mapping your behavioral loops.
          </p>
          <p style={{ color: "var(--sc-stone)", fontSize: "0.8rem", opacity: 0.7, lineHeight: 1.5 }}>
            This synthesis usually takes 30-60 seconds. Please keep this window open while we finalize your architecture.
          </p>
        </motion.div>
      </div>
    );
  }

  if (successResult) {
    const archetypeName = successResult?.archetype?.name || "The Seeker";
    const archetypeTagline = successResult?.archetype?.tagline || "Aligning your natal signals...";

    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--safe-top) 2rem var(--safe-bottom)" }}>
        
        <div className="glassmorphism stagger" style={{ maxWidth: 520, width: "100%", padding: "3rem 2rem", textAlign: "center", borderRadius: 32 }}>
          
          <div style={{ marginBottom: "2rem" }}>
            <IconLogo size={80} className="sc-luminous-logo" />
          </div>

          <h1 className="heading-display" style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
            Calibration Complete
          </h1>
          
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "inline-block", padding: "0.5rem 1.25rem", background: "rgba(255, 215, 0, 0.1)", border: "1px solid rgba(255, 215, 0, 0.3)", borderRadius: 99, marginBottom: "1rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--sc-gold)", letterSpacing: "0.05em" }}>{archetypeName}</span>
            </div>
            <p className="oracle-text" style={{ fontSize: "1rem", opacity: 0.8 }}>{archetypeTagline}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", width: "100%" }}>
            <button className="btn btn-primary" style={{ height: "4rem" }} onClick={() => navigate("/today")}>
              Enter Your Dashboard
            </button>
            <button className="btn btn-secondary" style={{ height: "4rem" }} onClick={() => navigate("/profile")}>
              View Soul Map
            </button>
            <button className="btn btn-secondary" style={{ height: "4rem" }} onClick={() => navigate("/codex")}>
              Open Codex Reading
            </button>
          </div>

          <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "var(--sc-stone)", opacity: 0.6 }}>
            Your signal is locked. You can refine your data at any time.
          </p>
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "var(--safe-top) 2rem var(--safe-bottom)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ marginBottom: "3rem" }}
        >
          <IconLogo size={180} className="sc-luminous-logo" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ maxWidth: "480px" }}
        >
          <h1 className="heading-display" style={{ fontSize: "3rem", marginBottom: "1.25rem", lineHeight: 1.1 }}>Audit Your Architecture</h1>
          <p style={{ color: "var(--sc-stone)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "3rem", opacity: 0.8 }}>
            Expose the loop. Map your behavioral blueprint and decode the costs of your instinctive reactions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
            <button 
              id="calibration-begin-btn"
              className="btn btn-primary" 
              style={{ height: "4rem", fontSize: "1.1rem" }}
              onClick={() => {
                localStorage.setItem("soulIsGuest", "false");
                setStep(1);
              }}
            >
              Begin Calibration
            </button>
            
            <button 
              id="guest-terminal-btn"
              className="btn btn-secondary"
              style={{ height: "4rem", fontSize: "1rem" }}
              onClick={startGuestMode}
            >
              Open Guest Terminal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: 600, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "-80px", left: "50%",
        transform: "translateX(-50%)",
        width: 500, height: 500,
        opacity: 0.07, mixBlendMode: "screen",
        filter: "blur(30px)",
        pointerEvents: "none", userSelect: "none", zIndex: 0,
      }}>
        <IconLogo size={500} />
      </div>

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
          <div style={{ 
            color: "#ff4444", 
            marginTop: "1.5rem", 
            fontSize: "0.875rem", 
            lineHeight: 1.5,
            background: "rgba(255, 68, 68, 0.1)",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid rgba(255, 68, 68, 0.2)",
            textAlign: "left"
          }}>
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>Profile generation failed</strong>
            {(mutation.error as Error)?.message || "The server did not return a readable error. Check your connection and try again."}
          </div>
        )}

        <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
          <ScButton
            id="onboarding-back-btn"
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || mutation.isPending}
            className={step === 1 ? "invisible" : ""}
          >
            ← Back
          </ScButton>
          
          <ScButton
            id="onboarding-continue-btn"
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
    </div>
  );
}

function StepBasicInfo({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  const hasTime = form.birthTime.length > 0;
  const hasLocation = form.birthLocation.trim().length > 0;

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 className="gradient-text" style={{ marginBottom: "0.4rem" }}>
          Audit your architecture
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Soul Codex synthesizes birth patterns and behavioral friction into one surgical analysis of your current loop and the immediate costs of your instinctive responses.
        </p>
      </div>

      <div className="form-group" style={{ marginBottom: "1.1rem" }}>
        <label className="label" htmlFor="name">Name</label>
        <input
          id="name"
          className="input"
          type="text"
          placeholder="Your first name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "1.1rem" }}>
        <label className="label" htmlFor="birthDate">Birth Date</label>
        <input
          id="birthDate"
          className="input"
          type="date"
          value={form.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "1.1rem" }}>
        <label className="label" htmlFor="birthTime">Birth Time <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span></label>
        <input
          id="birthTime"
          className="input"
          type="time"
          value={form.birthTime}
          onChange={(e) => update("birthTime", e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <span className="system-badge" style={{
            opacity: hasTime ? 0.35 : 1,
            borderColor: hasTime ? "rgba(212,168,95,0.1)" : "rgba(212,168,95,0.3)",
          }}>
            <IconCircle size={10} />
            <span>Without time — Sun · Moon only</span>
          </span>
          <span className="system-badge" style={{
            background: hasTime ? "rgba(34,197,94,0.08)" : "rgba(212,168,95,0.06)",
            border: `1px solid ${hasTime ? "rgba(34,197,94,0.3)" : "rgba(212,168,95,0.18)"}`,
            color: hasTime ? "#22c55e" : "inherit",
            opacity: hasTime ? 1 : 0.4,
          }}>
            {hasTime ? <IconSparkles size={10} /> : <IconCircle size={10} />}
            <span>With time — Rising · Houses · Full aspects</span>
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="label" htmlFor="birthLocation">Birth Location <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span></label>
        <input
          id="birthLocation"
          className="input"
          type="text"
          placeholder="City, State/Country"
          value={form.birthLocation}
          onChange={(e) => update("birthLocation", e.target.value)}
        />
        <p style={{ fontSize: "0.72rem", color: hasLocation ? "var(--cosmic-lavender)" : "var(--muted-foreground)", marginTop: "0.4rem", marginBottom: 0, opacity: hasLocation ? 1 : 0.65, transition: "color 0.2s" }}>
          {hasLocation ? <IconSparkles size={10} style={{ display: "inline", marginRight: 4 }} /> : <IconCircle size={10} style={{ display: "inline", marginRight: 4 }} />}
          {hasLocation
            ? "Enables personalized transit calculations and behavioral accuracy"
            : "Required for transit calculations and specific behavioral mapping"}
        </p>
      </div>
    </div>
  );
}

function StepPressure({ form, toggle, count }: { form: FormData; toggle: (v: PressurePattern) => void; count: number }) {
  const selected = [form.primary_pressure_pattern, form.secondary_pressure_pattern].filter(Boolean) as PressurePattern[];
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        Under pressure, I...
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick up to 2 patterns that show up most when the load gets heavy.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {PRESSURE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && count >= 2;
          return (
            <OptionCard
              key={opt.value}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(opt.value)}
              label={opt.label}
              description={opt.description}
            />
          );
        })}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
        {count}/2 selected
      </p>
    </div>
  );
}

function StepEscalation({ form, update }: { form: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        When conflict escalates, I...
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick the single pattern that describes your most instinctive response.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {ESCALATION_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={form.escalation_pattern === opt.value}
            disabled={false}
            onClick={() => update("escalation_pattern", opt.value)}
            label={opt.label}
            description={opt.description}
          />
        ))}
      </div>
    </div>
  );
}

function StepDecisions({ form, toggle, count }: { form: FormData; toggle: (v: DecisionFriction) => void; count: number }) {
  const selected = [form.decision_friction_primary, form.decision_friction_secondary].filter(Boolean) as DecisionFriction[];
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        What slows my decisions
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick up to 2 friction points that most often get in your way.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {DECISION_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && count >= 2;
          return (
            <OptionCard
              key={opt.value}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(opt.value)}
              label={opt.label}
              description={opt.description}
            />
          );
        })}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
        {count}/2 selected
      </p>
    </div>
  );
}

function StepDrain({ form, toggle, count }: { form: FormData; toggle: (v: DrainPattern) => void; count: number }) {
  const selected = [form.drain_pattern_primary, form.drain_pattern_secondary].filter(Boolean) as DrainPattern[];
  return (
    <div>
      <h2 className="gradient-text" style={{ marginBottom: "0.5rem" }}>
        What drains me fastest
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)" }}>
        Pick up to 2 situations that cost you the most energy.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {DRAIN_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && count >= 2;
          return (
            <OptionCard
              key={opt.value}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(opt.value)}
              label={opt.label}
              description={opt.description}
            />
          );
        })}
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
        {count}/2 selected
      </p>
    </div>
  );
}

function OptionCard({ selected, disabled, onClick, label, description }: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className={`onboarding-option-btn ${selected ? "selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span style={{ fontWeight: 600, marginBottom: 4 }}>{label}</span>
      <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{description}</span>
    </button>
  );
}

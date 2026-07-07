import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import CodexSkeleton from "@/components/CodexSkeleton";
import {
  IconLogo, IconArrowLeft, IconDiamond, IconSparkles,
  IconIdentity, IconCompass, IconZap, IconActivity, IconAlert
} from "../components/Icons";
import { cleanCodexLine } from "../lib/soul-codex/utils/cleanCodexLine";
import {
  calcPersonalDay,
  calcPersonalYear,
  getPersonalDayLabel,
  getPersonalYearLabel
} from "@soulcodex/core";

interface CodexSynthesis {
  codename: string;
  archetype: string;
  badges: { confidenceLabel: string; reason: string };
  topThemes: { tag: string; score: number }[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  narrative: string;
}

interface CodexSection {
  title: string;
  content: string;
  icon?: string;
}

function buildCodexSections(
  synthesis: CodexSynthesis,
  profile: any,
  confidenceLevel: string
): CodexSection[] {
  const birthDate = profile?.birthDate;
  const today = new Date();
  let personalDay = null, personalYear = null;
  let personalDayLabel = "", personalYearLabel = "";

  if (birthDate) {
    try {
      personalDay = calcPersonalDay(birthDate, today);
      personalDayLabel = getPersonalDayLabel(personalDay);
      personalYear = calcPersonalYear(birthDate, today.getFullYear());
      personalYearLabel = getPersonalYearLabel(personalYear);
    } catch (e) {
      console.warn("Failed to calculate personal numbers:", e);
    }
  }

  const sections: CodexSection[] = [];

  // 1. WHO I AM
  const strengths = synthesis.strengths.slice(0, 3);
  const whoIAm =
    strengths.length > 0
      ? `${synthesis.codename}. Your strengths: ${strengths.join(", ")}. You embody these qualities as your core gifts.`
      : `${synthesis.codename}. You are a unique convergence of patterns, wisdom, and potential.`;
  sections.push({
    title: "WHO I AM",
    content: cleanCodexLine(whoIAm, "Your soul carries distinct gifts and a unique way of being."),
  });

  // 2. HOW I OPERATE
  const authority = profile?.humanDesignData?.authority;
  const strategy = profile?.humanDesignData?.strategy;
  const topTheme = synthesis.topThemes?.[0]?.tag || "your unique pattern";
  const howIOperate =
    strategy || authority
      ? `Your decision-making flows through ${authority || "your inner guidance"}. Your strategy is ${strategy || "to trust your process"}. Your natural rhythm centers on ${topTheme}.`
      : `You operate best when aligned with ${topTheme}. Your natural rhythm is your compass.`;
  sections.push({
    title: "HOW I OPERATE",
    content: cleanCodexLine(
      howIOperate,
      "Your operating system processes the world through your unique lens."
    ),
  });

  // 3. CURRENT PHASE
  const phaseContent =
    personalYear && personalYearLabel
      ? `You are in Year ${personalYear} — ${personalYearLabel}. Today's frequency is Day ${personalDay} — ${personalDayLabel}. This phase calls you toward ${personalYearLabel.toLowerCase()}.`
      : confidenceLevel === "partial"
      ? "You are in a transformational phase. Complete your birth time for precise cycle guidance."
      : "Your current phase is unfolding. Trust the timing of your emergence.";
  sections.push({
    title: "CURRENT PHASE",
    content: cleanCodexLine(phaseContent, "You are in a cycle of growth and integration."),
  });

  // 4. SHADOW PATTERN
  const shadows = synthesis.shadows.slice(0, 2);
  const shadowContent =
    shadows.length > 0
      ? `Your shadow aspects include: ${shadows.join(" and ")}. These patterns appear under stress. Awareness transforms them into wisdom.`
      : "Your shadow contains the raw material for your deepest growth. Integrate what you resist.";
  sections.push({
    title: "SHADOW PATTERN",
    content: cleanCodexLine(shadowContent, "Your shadow is not an enemy—it is guidance."),
  });

  // 5. GROWTH KEY
  const triggers = synthesis.triggers.slice(0, 2);
  const growthKey =
    triggers.length > 0
      ? `Your growth edge activates around: ${triggers.join(" and ")}. Meet these moments with curiosity. They contain your next evolution.`
      : "Your growth emerges through challenges that mirror your deepest values.";
  sections.push({
    title: "GROWTH KEY",
    content: cleanCodexLine(growthKey, "Your evolution lives in what you resist."),
  });

  // 6. ONE MOVE TODAY
  const prescription = synthesis.prescriptions?.[0];
  const oneMove = prescription
    ? `${prescription}. This small action aligns you with your current cycle.`
    : personalDay
    ? `Anchor today's frequency (Day ${personalDay}) with one intentional act. Move, create, or rest according to this number's wisdom.`
    : "Take one action today that honors your deepest values.";
  sections.push({
    title: "ONE MOVE TODAY",
    content: cleanCodexLine(oneMove, "Small, aligned actions compound into transformation."),
  });

  return sections;
}

export default function CodexReadingPage() {
  const [, navigate] = useLocation();
  const [synthesis, setSynthesis] = useState<CodexSynthesis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("soulCodexReading");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) setSynthesis(parsed);
      } catch (e) {}
    }
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("/api/codex30/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // The server returns { ok: true, synthesis: { ... } }
      if (!res.ok || !res.synthesis) {
        throw new Error(res.error || "Failed to generate synthesis");
      }
      return res.synthesis as CodexSynthesis;
    },
    onSuccess: (data) => {
      setSynthesis(data);
      localStorage.setItem("soulCodexReading", JSON.stringify(data));
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "The synthesis engine is currently calibrating. Please try again in a moment.");
    },
  });

  useEffect(() => {
    if (!synthesis && !generateMutation.isPending && !error) {
      buildAndGenerate();
    }
  }, [synthesis, error]);

  function buildAndGenerate() {
    const rawProfile = localStorage.getItem("soulProfile");
    if (!rawProfile) {
      setError("No profile found. Please complete your calibration first.");
      return;
    }
    try {
      const profile = JSON.parse(rawProfile);
      generateMutation.mutate({ profile });
    } catch (e) {
      setError("Profile data is corrupted. Please recalibrate.");
    }
  }

  if (generateMutation.isPending && !synthesis) return <CodexSkeleton />;

  if (error) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="glassmorphism" style={{ maxWidth: 420, width: "100%", padding: "2.5rem", textAlign: "center", borderRadius: 24, borderTop: "4px solid var(--sc-danger)" }}>
          <IconAlert size={48} style={{ color: "var(--sc-danger)", marginBottom: "1.5rem" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--sc-ivory)" }}>Reading Delayed</h2>
          <p style={{ color: "var(--sc-stone)", marginBottom: "2rem" }}>{error}</p>
          <button id="codex-try-again-btn" className="btn btn-primary w-full" onClick={() => { setError(null); setSynthesis(null); }}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!synthesis) return <CodexSkeleton />;

  const profile = (() => {
    try {
      const raw = localStorage.getItem("soulProfile");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const confidenceLevel = synthesis.badges?.confidenceLabel || "unverified";
  const sections = buildCodexSections(synthesis, profile, confidenceLevel);

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: "6rem" }}>

        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0", marginBottom: "2rem" }}>
          <button onClick={() => navigate("/today")} className="btn btn-ghost" style={{ padding: "0.5rem" }}>
            <IconArrowLeft size={20} />
          </button>
          <IconLogo size={48} />
          <div style={{ width: 44 }} />
        </div>

        <div className="stagger">
          {/* 1. CODENAME SECTION */}
          <div className="glassmorphism" style={{ padding: "3rem 2rem", borderRadius: "32px", marginBottom: "1.5rem", textAlign: "center", border: "1px solid rgba(255, 215, 0, 0.2)" }}>
             <h2 className="section-label" style={{ color: "var(--sc-gold)", marginBottom: "1.5rem" }}>SOUL CODENAME</h2>
             <h1 className="heading-display" style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--sc-gold)", textShadow: "0 0 20px rgba(255, 215, 0, 0.3)" }}>
               {synthesis.codename}
             </h1>
             <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                <ConfidenceBadge
                  badge={synthesis.badges.confidenceLabel}
                  reason={synthesis.badges.reason}
                />
             </div>
          </div>

          {/* 2. EXPANDED PREMIUM SECTIONS */}
          {sections.map((sec, idx) => (
            <div key={idx} className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
              <h2 className="section-label" style={{ marginBottom: "1.25rem", color: "var(--sc-stone)" }}>{sec.title}</h2>
              <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>
                {sec.content}
              </p>
            </div>
          ))}

          {/* 3. PRESCRIPTIONS */}
          {synthesis.prescriptions.length > 0 && (
            <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(45, 226, 255, 0.05)", borderLeft: "4px solid var(--sc-cyan)" }}>
              <h2 className="section-label" style={{ color: "var(--sc-cyan)", marginBottom: "1.5rem" }}>PRESCRIPTIONS</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                {synthesis.prescriptions.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    <IconZap size={16} style={{ color: "var(--sc-cyan)", marginTop: "0.2rem", flexShrink: 0 }} />
                    <span style={{ fontSize: "1rem", color: "var(--sc-ivory)" }}>{cleanCodexLine(p, "Optimize your core signature.")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          <button id="codex-back-to-dashboard-btn" className="btn btn-primary" style={{ height: "3.5rem" }} onClick={() => navigate("/today")}>
            Back to Dashboard
          </button>
          <button id="codex-regenerate-btn" className="btn btn-secondary" style={{ height: "3.5rem" }} onClick={() => { localStorage.removeItem("soulCodexReading"); setSynthesis(null); setError(null); }}>
            Regenerate Reading
          </button>
        </div>

      </div>
    </div>
  );
}

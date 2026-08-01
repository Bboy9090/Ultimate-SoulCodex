import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import CodexSkeleton from "@/components/CodexSkeleton";
import ReadingElement from "@/components/soul-codex/ReadingElement";
import LimitationsPanel from "@/components/soul-codex/LimitationsPanel";
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
import type { DisplayMode, ReadingElement as ReadingElementType } from "@soulcodex/core";
import { loadActiveProfile } from "../lib/profileStorage";

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
  coreDrivers?: CoreDriver[];
  predictions?: BehaviorPrediction[];
}

function getProfile() {
  return loadActiveProfile();
}

function extractNarrativeSection(narrative: string, heading: string): string | null {
  const sections = narrative.split("\n\n");
  for (const sec of sections) {
    const lines = sec.split("\n");
    const title = lines[0]?.replace(/[:#]/g, "").trim().toLowerCase();
    if (title.includes(heading.toLowerCase())) {
      return lines.slice(1).join(" ").trim();
    }
  }
  return null;
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
      ? `${synthesis.codename}. Your core strengths: ${strengths.join(", ")}. These are your operating gifts.`
      : `${synthesis.codename}. Your identity is built from verifiable patterns—astrology, numerology, Human Design.`;
  sections.push({
    title: "WHO I AM",
    content: cleanCodexLine(whoIAm, "Your pattern emerges from multiple systems of knowing."),
  });

  // 2. HOW I OPERATE
  const authority = profile?.humanDesignData?.authority;
  const strategy = profile?.humanDesignData?.strategy;
  const topTheme = synthesis.topThemes?.[0]?.tag || "your core theme";
  const howIOperate =
    strategy || authority
      ? `Your decision-making flows through ${authority || "your inner guidance"}. Your strategy is ${strategy || "to trust your process"}. Your natural rhythm centers on ${topTheme}.`
      : `Your operating rhythm follows ${topTheme}. Decision-making works best when you trust your mechanical pattern.`;
  sections.push({
    title: "HOW I OPERATE",
    content: cleanCodexLine(
      howIOperate,
      "Your operating system is hardwired from your birth chart and Human Design."
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
    ? `${prescription}. This action anchors you in your current cycle.`
    : personalDay
    ? `Anchor today's frequency (Day ${personalDay}) with one act: move, create, or rest per this number's logic.`
    : "Take one action today that moves you toward your stated goals.";
  sections.push({
    title: "ONE MOVE TODAY",
    content: cleanCodexLine(oneMove, "Small, specific actions compound. Your move today shapes your cycle."),
  });

  return sections;
}

function buildReadingElements(profile: any): Record<string, ReadingElementType> {
  if (!profile?.chart) {
    return {};
  }

  const chart = profile.chart;
  const readings: Record<string, ReadingElementType> = {};

  // Sun Sign
  if (chart.sun) {
    readings.sunSign = {
      headline: `You see patterns others miss—your ${chart.sun.sign} Sun drives constant analysis.`,
      mechanism: `${chart.sun.sign} Sun creates a drive to understand systems. Your mind automatically scans for structure, logic, and improvement. When you spot inefficiency, your impulse is to fix it.`,
      protection: "You may protect against chaos by making yourself indispensable through expertise and attention to detail.",
      howOthersSeeit: `People experience you as unusually capable and perceptive. They trust your discernment. They may not see the cost of constant vigilance you carry.`,
      gift: `Your ability to see what needs fixing makes you invaluable in any role requiring systems thinking, quality assurance, or deep analysis.`,
      cost: `Over time, constant analysis can exhaust you. The gap between how things are and how they should be can become paralyzing.`,
      action: "This week, notice one thing you're fixing that nobody asked you to fix. Ask: Would this break without my intervention?",
      evidence: [
        {
          source: "ephemeris",
          description: `Sun at ${chart.sun.degree}° ${chart.sun.sign}`,
          value: `${chart.sun.degree}°`,
          verified: true,
        },
      ],
      confidence: 98,
      verified: true,
      visibleIn: ["essential", "complete", "technical"],
    };
  }

  // Moon Sign
  if (chart.moon) {
    readings.moonSign = {
      headline: `You process emotions through logic—your ${chart.moon.sign} Moon needs understanding before expression.`,
      mechanism: `${chart.moon.sign} Moon means you analyze feelings before you express them. You prefer observation and analysis to raw emotional response. Chaos—emotional or otherwise—makes you deeply uncomfortable.`,
      protection: "By keeping emotions analyzed and compartmentalized, you maintain control. Raw feeling without understanding feels unsafe.",
      howOthersSeeit: `People often think you're calmer or less emotional than you are. They may not realize how much you're processing internally.`,
      gift: `Your ability to step back and observe gives you clarity others lose in the moment. You don't make emotional decisions you regret later.`,
      cost: `You can intellectualize emotions so much that you lose touch with what you actually feel. Others may feel you don't truly understand them—not because you don't, but because you're not showing them.`,
      action: "Next time someone shares a feeling with you, resist the urge to analyze. Instead, ask: 'What do you need from me right now?'",
      evidence: [
        {
          source: "ephemeris",
          description: `Moon at ${chart.moon.degree}° ${chart.moon.sign}`,
          value: `${chart.moon.degree}°`,
          verified: profile.birthTime ? true : false,
        },
      ],
      confidence: profile.birthTime ? 95 : 60,
      verified: profile.birthTime ? true : false,
      visibleIn: ["complete", "technical"],
    };
  }

  // Rising Sign (requires birth time)
  if (chart.rising && profile.birthTime) {
    readings.risingSign = {
      headline: `You appear as ${chart.rising.sign} to the world—intense, observant, hard to read.`,
      mechanism: `${chart.rising.sign} Rising is your mask, how people first experience you. It's protective—you signal depth and complexity. People feel like you're reading them.`,
      protection: "This intensity protects you. If you seem like someone who investigates thoroughly, people think twice before deceiving you.",
      howOthersSeeit: `People take you seriously. They don't mess with you casually. But they may also keep you at a distance, experiencing you as intimidating.`,
      gift: `Your presence commands respect. People trust you with their deep truths. You attract meaningful connections because you signal you can handle complexity.`,
      cost: `This intensity can isolate you. People may keep you at arm's length because you seem too powerful or too serious.`,
      action: "Intentionally show someone one thing about yourself that's vulnerable—not a weakness, but a real part of you.",
      evidence: [
        {
          source: "ephemeris",
          description: `Ascendant at ${chart.rising.degree}° ${chart.rising.sign} (calculated from birth time)`,
          value: `${chart.rising.degree}°`,
          verified: true,
        },
      ],
      confidence: 97,
      verified: true,
      visibleIn: ["complete", "technical"],
    };
  }

  // Life Path Number
  if (profile.numerology?.lifePath !== undefined) {
    const lifePath = profile.numerology.lifePath;
    readings.lifePath = {
      headline: `Your Life Path ${lifePath} means you're wired for ${lifePath === 9 ? "completion and synthesis" : "your unique contribution"}.`,
      mechanism: `Life Path ${lifePath} is calculated from your birth date. You're naturally drawn toward ${lifePath === 9 ? "seeing how all patterns connect, bringing things to completion" : "your specific role"}.`,
      protection: `By focusing on larger, universal concerns, you may avoid your own smaller, more personal needs.`,
      howOthersSeeit: `People see you as someone with wisdom and perspective. They may expect you to have all the answers.`,
      gift: `You can see patterns across domains. You synthesize information naturally and offer perspective that helps others understand trajectories.`,
      cost: `You can exhaust yourself by taking on too many causes. You may finish others' work while your own remains incomplete.`,
      action: "Identify one personal project that matters only to you, not to anyone else. Commit to finishing it.",
      evidence: [
        {
          source: "calculation",
          description: `Life Path calculated from birth date ${profile.birthDate}`,
          value: `${lifePath}`,
          verified: true,
        },
      ],
      confidence: 100,
      verified: true,
      visibleIn: ["essential", "complete", "technical"],
    };
  }

  return readings;
}

export default function CodexReadingPage() {
  const [, navigate] = useLocation();
  const [synthesis, setSynthesis] = useState<CodexSynthesis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("complete");
  const profile = getProfile();

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
    const activeProfile = loadActiveProfile();
    if (!activeProfile) {
      setError("No profile found. Please complete your calibration first.");
      return;
    }
    generateMutation.mutate({ profile: activeProfile });
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
  const readingElements = buildReadingElements(profile);
  const elementsForMode = Object.values(readingElements).filter((el) =>
    el.visibleIn.includes(displayMode)
  );

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
          {/* CODENAME */}
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

          {/* NEW READING EXPERIENCE - Display Mode Toggle */}
          {elementsForMode.length > 0 && (
            <>
              <div style={{
                display: "flex",
                gap: "0.75rem",
                marginBottom: "2rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}>
                {(["essential", "complete", "technical"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDisplayMode(mode)}
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "8px",
                      border: displayMode === mode ? "2px solid var(--sc-gold)" : "1px solid rgba(212,168,95,0.3)",
                      background: displayMode === mode ? "rgba(212,168,95,0.15)" : "transparent",
                      color: displayMode === mode ? "var(--sc-gold)" : "var(--sc-stone)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: displayMode === mode ? 600 : 400,
                      textTransform: "capitalize",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* NEW READING EXPERIENCE - Elements */}
              <div style={{ marginBottom: "3rem" }}>
                <h2 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--sc-gold)",
                  marginBottom: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Your Core Patterns
                </h2>
                {elementsForMode.map((element, i) => (
                  <ReadingElement key={i} element={element} mode={displayMode} showEvidence={displayMode === "technical"} />
                ))}
                <LimitationsPanel profile={profile} />
              </div>
            </>
          )}

          {/* 2. EXPANDED PREMIUM SECTIONS */}
          {sections.map((sec, idx) => (
            <div key={idx} className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
              <h2 className="section-label" style={{ marginBottom: "1.25rem", color: "var(--sc-stone)" }}>{sec.title}</h2>
              <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>
                {sec.content}
              </p>
            </div>
          ))}

          {/* 2. HOW I OPERATE */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconCompass size={14} color="var(--sc-cyan)" /> HOW I OPERATE
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>
              {cleanCodexLine(howIOperate, "Your operating pattern is calibrated.")}
            </p>
          </div>

          {/* 3. CURRENT PHASE */}
          {synthesis.topThemes?.length > 0 && (
            <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid var(--sc-gold)" }}>
              <h2 className="section-label" style={{ color: "var(--sc-gold)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconActivity size={14} /> CURRENT PHASE
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {synthesis.topThemes.slice(0, 4).map((t, i) => (
                  <span key={i} style={{
                    padding: "0.35rem 0.85rem",
                    background: "rgba(212, 168, 95, 0.1)",
                    border: "1px solid rgba(212, 168, 95, 0.25)",
                    borderRadius: "99px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--sc-gold)",
                  }}>
                    {t.tag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 4. SYSTEM INTERACTIONS (Layer 2: Synergy) */}
          {synthesis.synergy && synthesis.synergy.length > 0 && (
            <>
              {/* Reinforcements */}
              {synthesis.synergy.some(s => s.type === "reinforcement") && (
                <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid #22c55e" }}>
                  <h2 className="section-label" style={{ color: "#22c55e", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <IconSparkles size={14} /> WHAT AMPLIFIES YOU
                  </h2>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {synthesis.synergy
                      .filter(s => s.type === "reinforcement")
                      .slice(0, 3)
                      .map((interaction, i) => (
                        <div key={i} style={{ padding: "1rem", background: "rgba(34, 197, 94, 0.05)", borderRadius: "12px", borderLeft: "3px solid #22c55e" }}>
                          <p style={{ fontSize: "0.85rem", color: "#22c55e", fontWeight: 600, marginBottom: "0.5rem" }}>
                            {interaction.system1} + {interaction.system2}
                          </p>
                          <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                            {cleanCodexLine(interaction.explanation, "These systems amplify each other.")}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Balances */}
              {synthesis.synergy.some(s => s.type === "balance") && (
                <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid #22d3ee" }}>
                  <h2 className="section-label" style={{ color: "#22d3ee", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <IconCompass size={14} /> WHAT STABILIZES YOU
                  </h2>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {synthesis.synergy
                      .filter(s => s.type === "balance")
                      .slice(0, 3)
                      .map((interaction, i) => (
                        <div key={i} style={{ padding: "1rem", background: "rgba(34, 211, 238, 0.05)", borderRadius: "12px", borderLeft: "3px solid #22d3ee" }}>
                          <p style={{ fontSize: "0.85rem", color: "#22d3ee", fontWeight: 600, marginBottom: "0.5rem" }}>
                            {interaction.system1} + {interaction.system2}
                          </p>
                          <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                            {cleanCodexLine(interaction.explanation, "These systems balance each other.")}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Conflicts */}
              {synthesis.synergy.some(s => s.type === "conflict") && (
                <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(236, 72, 153, 0.05)", borderLeft: "4px solid var(--sc-danger)" }}>
                  <h2 className="section-label" style={{ color: "var(--sc-danger)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <IconAlert size={14} /> INTERNAL TENSIONS YOU'RE MANAGING
                  </h2>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {synthesis.synergy
                      .filter(s => s.type === "conflict")
                      .slice(0, 3)
                      .map((interaction, i) => (
                        <div key={i} style={{ padding: "1rem", background: "rgba(236, 72, 153, 0.1)", borderRadius: "12px", borderLeft: "3px solid var(--sc-danger)" }}>
                          <p style={{ fontSize: "0.85rem", color: "var(--sc-danger)", fontWeight: 600, marginBottom: "0.5rem" }}>
                            {interaction.system1} ↔ {interaction.system2}
                          </p>
                          <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                            {cleanCodexLine(interaction.explanation, "These systems create productive friction.")}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 4. CORE DRIVERS (Layer 3: Dominance Engine) */}
          {synthesis.coreDrivers && synthesis.coreDrivers.length > 0 && (
            <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid #f59e0b" }}>
              <h2 className="section-label" style={{ color: "#f59e0b", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconDiamond size={14} /> WHAT ACTUALLY DRIVES YOU
              </h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {synthesis.coreDrivers.slice(0, 3).map((driver, i) => (
                  <div key={i} style={{ padding: "1rem", background: "rgba(245, 158, 11, 0.05)", borderRadius: "12px", borderLeft: "3px solid #f59e0b" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <p style={{ fontSize: "0.85rem", color: "#f59e0b", fontWeight: 600 }}>
                        {driver.name}
                      </p>
                      <span style={{ fontSize: "0.75rem", color: "#f59e0b", opacity: 0.7 }}>
                        {driver.archetype}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                      {cleanCodexLine(driver.explanation, "This is one of your core archetypal drivers.")}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#f59e0b", opacity: 0.6, marginTop: "0.5rem" }}>
                      Source: {driver.sources.join(" + ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. BEHAVIOR PREDICTIONS (Layer 7: Predictive Behavior Engine) */}
          {synthesis.predictions && synthesis.predictions.length > 0 && (
            <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(59, 130, 246, 0.05)", borderLeft: "4px solid #3b82f6" }}>
              <h2 className="section-label" style={{ color: "#3b82f6", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconZap size={14} /> HOW YOU'LL LIKELY REACT
              </h2>
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {synthesis.predictions.slice(0, 2).map((pred, i) => (
                  <div key={i} style={{ padding: "1.25rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "12px", borderLeft: "3px solid #3b82f6" }}>
                    <h3 style={{ fontSize: "0.95rem", color: "#3b82f6", fontWeight: 600, marginBottom: "1rem" }}>
                      {pred.situation}
                    </h3>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "0.8rem", color: "#3b82f6", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.4rem" }}>
                          What you'll likely do:
                        </p>
                        <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                          {cleanCodexLine(pred.likely, "This is your natural response pattern.")}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.8rem", color: "var(--sc-danger)", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.4rem" }}>
                          The trap:
                        </p>
                        <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                          {cleanCodexLine(pred.trap, "This is what goes wrong if you follow the pattern.")}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.8rem", color: "#10b981", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.4rem" }}>
                          Try instead:
                        </p>
                        <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>
                          {cleanCodexLine(pred.alternative, "This shifts the dynamic.")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.8rem", color: "#3b82f6", opacity: 0.6, marginTop: "1rem", fontStyle: "italic" }}>
                These are situational predictions grounded in your Core Drivers. They're not destiny — they're patterns you can recognize and redirect.
              </p>
            </div>
          )}

          {/* 6. SHADOW PATTERN */}
          {synthesis.shadows?.length > 0 && (
            <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(236, 72, 153, 0.05)", borderLeft: "4px solid var(--sc-danger)" }}>
              <h2 className="section-label" style={{ color: "var(--sc-danger)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconAlert size={14} /> SHADOW PATTERN
              </h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {synthesis.shadows.slice(0, 3).map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    <span style={{ color: "var(--sc-danger)", fontSize: "0.75rem", marginTop: "0.15rem", flexShrink: 0 }}>▪</span>
                    <span style={{ fontSize: "1rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>{cleanCodexLine(s, "Observe your default under pressure.")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. GROWTH KEY */}
          {(synthesis.strengths?.length > 0 || synthesis.prescriptions?.length > 1) && (
            <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(34, 197, 94, 0.05)", borderLeft: "4px solid #22c55e" }}>
              <h2 className="section-label" style={{ color: "#22c55e", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconSparkles size={14} /> GROWTH KEY
              </h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {(synthesis.prescriptions?.slice(1, 4) ?? synthesis.strengths?.slice(0, 3) ?? []).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    <IconZap size={14} style={{ color: "#22c55e", marginTop: "0.15rem", flexShrink: 0 }} />
                    <span style={{ fontSize: "1rem", color: "var(--sc-ivory)", lineHeight: 1.6 }}>{cleanCodexLine(item, "Optimize your core signature.")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ONE MOVE TODAY */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", background: "rgba(45, 226, 255, 0.05)", borderLeft: "4px solid var(--sc-cyan)" }}>
            <h2 className="section-label" style={{ color: "var(--sc-cyan)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconZap size={14} /> ONE MOVE TODAY
            </h2>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--sc-ivory)", lineHeight: 1.6 }}>{oneMove}</p>
          </div>
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

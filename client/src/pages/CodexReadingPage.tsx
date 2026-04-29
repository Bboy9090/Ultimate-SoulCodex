import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Capacitor } from "@capacitor/core";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { Link } from "wouter";
import CodexSkeleton from "@/components/CodexSkeleton";

interface ThemeScore {
  tag: string;
  score: number;
  sources?: string[];
}

interface CodexSynthesis {
  codename: string;
  archetype: string;
  badges: { confidenceLabel: string; reason: string };
  topThemes: ThemeScore[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  narrative: string;
  isPremium: boolean;
}

// Map section header prefixes to accent colors + glyphs
const SECTION_ACCENTS: Record<string, { color: string; glyph: string }> = {
  "CODENAME":   { color: "#9D4EDD", glyph: "⧫" },
  "MOTTO":      { color: "#a78bfa", glyph: "◈" },
  "WHO I AM":   { color: "#E0CCFF", glyph: "◉" },
  "HOW I MOVE": { color: "#FF007F", glyph: "⬡" },
  "WHAT I WON": { color: "#f472b6", glyph: "◌" },
  "WHAT I'M B": { color: "#F2C94C", glyph: "◆" },
  "THIS WEEK":  { color: "#22d3ee", glyph: "◎" },
};

function getSectionAccent(header: string) {
  const upper = header.toUpperCase();
  for (const [key, val] of Object.entries(SECTION_ACCENTS)) {
    if (upper.startsWith(key)) return val;
  }
  return { color: "#D4A85F", glyph: "◈" };
}

const SECTION_HEADERS = [
  "CODENAME:", "MOTTO:", "WHO I AM", "HOW I MOVE UNDER PRESSURE",
  "WHAT I WON'T TOLERATE", "WHAT I'M BUILDING", "THIS WEEK",
];

function parseNarrative(text: string) {
  if (!text) return [];
  const lines = text.split("\n");
  const sections: { header: string; lines: string[] }[] = [];
  let current: { header: string; lines: string[] } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const isHeader = SECTION_HEADERS.some(h => line.startsWith(h));
    if (isHeader) {
      if (current) sections.push(current);
      current = { header: line, lines: [] };
    } else if (current && line) {
      current.lines.push(line);
    } else if (!current && line) {
      current = { header: "", lines: [line] };
    }
  }
  if (current) sections.push(current);
  return sections;
}

const THEME_ICONS: Record<string, string> = {
  precision: "◈", service: "✦", privacy: "◉", intensity: "⬡", freedom: "◎",
  leadership: "▲", healing: "✿", order: "⊞", innovation: "⚙", intuition: "☽",
  discipline: "⬛", rebellion: "⚡", craft: "⬟", legacy: "⧫", emotion_depth: "◇",
  social_sensitivity: "◌", truth: "◆", boundaries: "▪", courage: "▶", focus: "⊕",
};

const THEME_DISPLAY: Record<string, string> = {
  precision: "Precision", service: "Service", privacy: "Discretion",
  intensity: "Intensity", freedom: "Freedom", leadership: "Leadership",
  healing: "Healing", order: "Order", innovation: "Innovation",
  intuition: "Intuition", discipline: "Discipline", rebellion: "Independence",
  craft: "Craft", legacy: "Legacy", emotion_depth: "Emotional Depth",
  social_sensitivity: "Social Attunement", truth: "Truth",
  boundaries: "Sovereignty", courage: "Courage", focus: "Focus",
};

function displayTheme(tag: string): string {
  return THEME_DISPLAY[tag] ?? tag.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const PREMIUM_FEATURES = [
  "Full narrative (all 4 sections)",
  "Signal Strengths",
  "Growth Edges",
  "What Drains Me",
  "Prescriptions",
];

export default function CodexReadingPage() {
  const [, navigate] = useLocation();
  const [synthesis, setSynthesis] = useState<CodexSynthesis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPremium = localStorage.getItem("soulPremium") === "true";

  // 1. Initial load from persistence (Zero Lag)
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
      try {
        const data = await apiRequest("/api/codex30/generate", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!data || !data.synthesis) throw new Error("Empty synthesis");
        return data.synthesis as CodexSynthesis;
      } catch (err) {
        if (import.meta.env.DEV) console.warn("[Codex] AI synthesis failed, using fallback:", err);
        return CODEX_FALLBACK_TEMPLATE;
      }
    },
    onSuccess: (data) => {
      setSynthesis(data);
      localStorage.setItem("soulCodexReading", JSON.stringify(data));
      setError(null);
    },
    onError: () => {
      // Fallback is handled in mutationFn, but just in case
      if (!synthesis) setSynthesis(CODEX_FALLBACK_TEMPLATE);
    },
  });

  useEffect(() => {
    if (!synthesis && !generateMutation.isPending) {
      buildAndGenerate();
    }
  }, [synthesis]);

  // If no synthesis and loading, show skeleton (not blocking loader)
  if (generateMutation.isPending && !synthesis) {
    return <CodexSkeleton />;
  }

  function buildAndGenerate() {
    const rawProfile    = localStorage.getItem("soulProfile");
    const rawChart      = localStorage.getItem("soulFullChart");
    const rawInputs     = localStorage.getItem("soulUserInputs");
    const rawOnboarding = localStorage.getItem("onboardingData");
    const rawConf       = localStorage.getItem("soulConfidence");

    console.log("[CodexReading] Building payload from localStorage...");
    let profile: any    = {};
    let fullChart: any  = undefined;
    let userInputs: any = {};

    try { if (rawProfile) profile = JSON.parse(rawProfile); } catch {}
    try { if (rawChart)   fullChart = JSON.parse(rawChart); } catch {}
    if (rawInputs)     { try { userInputs = JSON.parse(rawInputs); } catch {} }
    else if (rawOnboarding) { try { userInputs = JSON.parse(rawOnboarding); } catch {} }
    else if (profile?.signals) { userInputs = profile.signals; }
    if (rawConf) { try { const c = JSON.parse(rawConf); profile.confidence = c; } catch {} }

    console.log("[CodexReading] Final payload structure:", { profile, fullChart, userInputs });

    if (!rawProfile && !rawOnboarding) {
      console.warn("[CodexReading] No profile found in localStorage");
      setError("No profile found. Complete the onboarding first.");
      return;
    }
    generateMutation.mutate({ profile, fullChart, userInputs });
  }

  function handleRegenerate() {
    try { localStorage.removeItem("soulCodexReading"); } catch {}
    setSynthesis(null);
    setError(null);
    buildAndGenerate();
  }

  const sections = parseNarrative(synthesis?.narrative ?? "");
  const isPremium = synthesis?.isPremium ?? false;

  // Loading
  if (generateMutation.isPending && !synthesis) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
        <div style={{ fontSize: "3rem", animation: "spin 3s linear infinite" }}>✦</div>
        <h2 style={{ color: "var(--cosmic-lavender)", fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
          Building your Codex Reading…
        </h2>
        <p style={{ color: "var(--muted-foreground)", textAlign: "center", maxWidth: "380px", fontSize: "0.9rem" }}>
          Collecting signals from your chart, numerology, moral compass, and more.
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    const noProfile = error.toLowerCase().includes("no profile") || error.toLowerCase().includes("onboarding");
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 460, width: "100%" }}>
          <div style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderTop: `3px solid ${noProfile ? "var(--sc-gold)" : "#ef4444"}`,
            borderRadius: "var(--radius)",
            padding: "2.25rem 2rem",
            textAlign: "center",
          }}>
            {noProfile ? (
              <>
                <div style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "var(--cosmic-lavender)", opacity: 0.75 }}>◈</div>
                <h3 style={{ marginBottom: "0.65rem", fontSize: "1.15rem", fontWeight: 600 }}>Your Codex isn't unlocked yet</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                  The Codex is a 30-point synthesis that gives you a codename, a first-person narrative, and a ranked map of your core patterns across 15+ systems — astrology, numerology, Human Design, and behavioral archetypes. It needs your profile to generate.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem", textAlign: "left" }}>
                  {[
                    { glyph: "◈", label: "Your codename", desc: "A single word that distills your core operating pattern" },
                    { glyph: "◉", label: "30-point pattern map", desc: "Your ranked signals across astrology, numerology, and more" },
                    { glyph: "✦", label: "First-person narrative", desc: "Your full synthesis written from your own voice" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.6rem 0.75rem", background: "rgba(212,168,95,0.04)", border: "1px solid rgba(212,168,95,0.12)", borderRadius: 8 }}>
                      <span style={{ color: "var(--cosmic-lavender)", fontSize: "0.85rem", marginTop: "0.05rem", flexShrink: 0 }}>{item.glyph}</span>
                      <span>
                        <span style={{ fontWeight: 600, fontSize: "0.8rem", display: "block" }}>{item.label}</span>
                        <span style={{ color: "var(--muted-foreground)", fontSize: "0.73rem" }}>{item.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/start")}>Finish My Profile</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "1.5rem", marginBottom: "1rem", opacity: 0.5 }}>⚠</div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600 }}>Could not generate your reading</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.35rem" }}>
                  The synthesis engine hit an error. Your profile data is intact — retrying usually resolves this.
                </p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem", opacity: 0.6, marginBottom: "1.5rem" }}>{error}</p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setError(null); buildAndGenerate(); }}>Try Again</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate("/start")}>Start Over</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!synthesis) return null;

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "2rem 1rem 4rem" }}>
      <div style={{ maxWidth: "740px", margin: "0 auto", position: "relative", zIndex: 1 }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          display: "inline-block", background: "rgba(157, 78, 221, 0.15)",
          border: "1px solid rgba(157, 78, 221, 0.4)", borderRadius: "99px",
          padding: "0.4rem 1.2rem", fontSize: "0.75rem", letterSpacing: "0.2em",
          color: "#E0CCFF", marginBottom: "1.25rem", textTransform: "uppercase",
          fontWeight: 700, fontFamily: "var(--font-display)"
        }}>
          Soul Codex Reading
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 7vw, 3.5rem)",
          color: "#F2C94C", marginBottom: "0.75rem", lineHeight: 1.1,
          fontWeight: 800, letterSpacing: "-0.03em",
          textShadow: "0 0 40px rgba(242, 201, 76, 0.3)",
        }}>
          {synthesis.codename}
        </h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <ConfidenceBadge
            badge={synthesis.badges.confidenceLabel}
            reason={synthesis.badges.reason}
            size="sm"
          />
        </div>
      </div>

      {/* ── Top Themes ───────────────────────────────────────────────────── */}
      {synthesis.topThemes.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.85rem" }}>
            Core Themes
          </h3>
          {isPremium ? (
            /* Premium: full bar chart with scores */
            (() => {
              const themes = synthesis.topThemes.slice(0, 8);
              const maxScore = Math.max(...themes.map(t => t.score), 1);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {themes.map((t, i) => {
                    const pct = Math.round((t.score / maxScore) * 100);
                    const icon = THEME_ICONS[t.tag] ?? "◈";
                    const isTop = i === 0;
                    return (
                      <div key={t.tag} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{
                          fontSize: "0.7rem", color: "var(--cosmic-lavender)",
                          opacity: isTop ? 1 : 0.6, width: "1.1rem", textAlign: "right", flexShrink: 0,
                        }}>
                          {icon}
                        </span>
                        <span style={{
                          fontSize: "0.72rem", color: "var(--foreground)",
                          width: "5.5rem", flexShrink: 0,
                          fontWeight: isTop ? 600 : 400,
                          letterSpacing: "0.02em",
                        }}>
                          {displayTheme(t.tag)}
                        </span>
                        <div style={{
                          flex: 1, height: "6px", borderRadius: "99px",
                          background: "rgba(212,168,95,0.12)",
                          overflow: "hidden", position: "relative",
                        }}>
                          <div style={{
                            position: "absolute", left: 0, top: 0, bottom: 0,
                            width: `${pct}%`,
                            borderRadius: "99px",
                            background: isTop
                              ? "linear-gradient(90deg, #D4A85F, #C49450)"
                              : `rgba(212,168,95,${0.35 + (pct / 100) * 0.45})`,
                            transition: "width 0.4s ease",
                          }} />
                        </div>
                        <span style={{
                          fontSize: "0.62rem", color: "var(--muted-foreground)",
                          width: "2rem", textAlign: "right", flexShrink: 0,
                          opacity: 0.55,
                        }}>
                          {t.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            /* Free: compact chips for top 3 themes only */
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {synthesis.topThemes.map((t) => {
                const icon = THEME_ICONS[t.tag] ?? "◈";
                return (
                  <span key={t.tag} style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.3rem 0.75rem",
                    background: "rgba(212,168,95,0.1)",
                    border: "1px solid rgba(212,168,95,0.25)",
                    borderRadius: "99px",
                    fontSize: "0.75rem",
                    color: "var(--cosmic-lavender)",
                    letterSpacing: "0.02em",
                  }}>
                    <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>{icon}</span>
                    {displayTheme(t.tag)}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Narrative Sections ───────────────────────────────────────────── */}
      <div style={{ marginBottom: isPremium ? "2.5rem" : "0" }}>
        {isPremium ? (
          /* Premium: all sections */
          sections.map((sec, i) => {
            const accent = sec.header ? getSectionAccent(sec.header) : { color: "#D4A85F", glyph: "◈" };
            const isIdentity = i < 2;
            return (
              <div key={i} style={{
                background: `rgba(26, 11, 46, 0.8)`,
                border: "1px solid rgba(157, 78, 221, 0.15)",
                borderTop: `3px solid ${accent.color}`,
                borderRadius: "16px", padding: "1.6rem 1.75rem", marginBottom: "1.25rem",
                boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px ${accent.color}08`,
                backdropFilter: "blur(12px)"
              }}>
                {sec.header && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                    <span style={{ color: accent.color, fontSize: "0.9rem", flexShrink: 0 }}>
                      {accent.glyph}
                    </span>
                    <h2 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: accent.color, margin: 0,
                      fontWeight: 800
                    }}>
                      {sec.header}
                    </h2>
                  </div>
                )}
                {sec.lines.map((line, j) => (
                  <p key={j} style={{
                    color: line.startsWith("-") ? "#D6BCFA" : "#EAEAF5",
                    lineHeight: 1.8, marginBottom: j < sec.lines.length - 1 ? "0.75rem" : 0,
                    fontFamily: i < 2 ? "var(--font-oracle)" : "var(--font-sans)",
                    fontSize: i === 0 ? "1.15rem" : "0.95rem",
                    paddingLeft: line.startsWith("-") ? "0.5rem" : 0,
                    fontWeight: 400
                  }}>
                    {line}
                  </p>
                ))}
              </div>
            );
          })
        ) : (
          /* Free: MOTTO (plain) + WHO I AM teaser with gradient fade, then upgrade card */
          <>
            {/* MOTTO section — shown without fade */}
            {sections.filter(s => s.header.toUpperCase().startsWith("MOTTO")).map((sec, i) => {
              const accent = getSectionAccent(sec.header);
              return (
                <div key={`motto-${i}`} style={{
                  background: `rgba(26, 11, 46, 0.8)`,
                  border: "1px solid rgba(157, 78, 221, 0.15)",
                  borderTop: `3px solid ${accent.color}`,
                  borderRadius: "16px", padding: "1.6rem 1.75rem", marginBottom: "1.25rem",
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px ${accent.color}08`,
                  backdropFilter: "blur(12px)"
                }}>
                  {sec.header && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <span style={{ color: accent.color, fontSize: "0.85rem", flexShrink: 0 }}>{accent.glyph}</span>
                      <h2 style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: accent.color, margin: 0,
                      }}>
                        {sec.header}
                      </h2>
                    </div>
                  )}
                  {sec.lines.map((line, j) => (
                    <p key={j} style={{
                      color: "#EAEAF5",
                      lineHeight: 1.75,
                      marginBottom: j < sec.lines.length - 1 ? "0.55rem" : 0,
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9375rem",
                    }}>
                      {line}
                    </p>
                  ))}
                </div>
              );
            })}

            {/* WHO I AM teaser — faded out */}
            {sections.filter(s => s.header.toUpperCase().startsWith("WHO I AM")).map((sec, i) => (
              <div key={`who-${i}`} style={{ position: "relative", marginBottom: "1.5rem" }}>
                <div style={{
                  background: `rgba(26, 11, 46, 0.8)`,
                  border: "1px solid rgba(157, 78, 221, 0.15)",
                  borderTop: `3px solid #E0CCFF`,
                  borderRadius: "16px", padding: "1.6rem 1.75rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
                  backdropFilter: "blur(12px)"
                }}>
                  {sec.header && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <span style={{ color: "#D4A85F", fontSize: "0.85rem", flexShrink: 0 }}>◉</span>
                      <h2 style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "#D4A85F", margin: 0,
                      }}>
                        {sec.header}
                      </h2>
                    </div>
                  )}
                  {sec.lines.map((line, j) => (
                    <p key={j} style={{
                      color: "#EAEAF5",
                      lineHeight: 1.75,
                      marginBottom: j < sec.lines.length - 1 ? "0.55rem" : 0,
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9375rem",
                    }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* ── BLURRED CLIFFHANGER ── */}
            <div style={{ position: "relative" }}>
              <div style={{ opacity: 0.4, pointerEvents: "none", filter: "blur(6px)", userSelect: "none" }}>
                {[
                  { header: "HOW I MOVE", glyph: "▶", lines: ["When the pressure hits, I don't hesitate. I leverage my natural momentum to bypass friction. My decision-making process relies entirely on...", "There is a specific way I need to structure my day to avoid immediate burnout, which involves protecting my energy from..."] },
                  { header: "MY GROWTH EDGE", glyph: "◈", lines: ["The biggest trap I fall into is assuming everyone else processes reality at my speed. I often sabotage my own foundations by...", "To break this cycle, I must intentionally adopt a strategy of..."] },
                  { header: "PRESCRIPTIONS", glyph: "✦", lines: ["- Establish a rigid boundary around unstructured time.", "- Decline requests that require high emotional performing energy.", "- Implement a 24-hour delay before committing to new projects."] }
                ].map((fakeSec, idx) => (
                  <div key={idx} style={{
                    background: `rgba(26, 11, 46, 0.8)`,
                    border: "1px solid rgba(157, 78, 221, 0.15)",
                    borderTop: `3px solid #9D4EDD`,
                    borderRadius: "16px", padding: "1.6rem 1.75rem", marginBottom: "1.25rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <span style={{ color: "#D4A85F", fontSize: "0.85rem", flexShrink: 0 }}>{fakeSec.glyph}</span>
                      <h2 style={{
                        fontFamily: "var(--font-serif)", fontSize: "0.75rem",
                        letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A85F", margin: 0,
                      }}>
                        {fakeSec.header}
                      </h2>
                    </div>
                    {fakeSec.lines.map((line, j) => (
                      <p key={j} style={{
                        color: "#EAEAF5", lineHeight: 1.75,
                        marginBottom: j < fakeSec.lines.length - 1 ? "0.55rem" : 0,
                        fontFamily: "var(--font-serif)", fontSize: "0.9375rem",
                      }}>
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Overlay Lock Icon */}
              <div style={{
                position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", zIndex: 10
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(10,1,24,0.8)", border: "1px solid rgba(212,168,95,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem", color: "var(--cosmic-gold)",
                  boxShadow: "0 4px 30px rgba(212,168,95,0.25)",
                  backdropFilter: "blur(4px)"
                }}>
                  🔒
                </div>
                <div style={{
                  background: "rgba(10,1,24,0.8)", border: "1px solid rgba(212,168,95,0.3)",
                  padding: "0.5rem 1.25rem", borderRadius: "99px", color: "var(--sc-ivory)",
                  fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em",
                  backdropFilter: "blur(4px)", textTransform: "uppercase"
                }}>
                  Top Secret Signals
                </div>
              </div>
            </div>

            {/* Upgrade card */}
            {Capacitor.getPlatform() !== "ios" && (
              <div style={{
                background: "linear-gradient(135deg, rgba(212,168,95,0.12), rgba(212,168,95,0.05))",
                border: "1px solid rgba(212,168,95,0.35)",
                borderRadius: "12px",
                padding: "2rem 1.75rem",
                marginBottom: "2rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "1.8rem", color: "#F2C94C" }}>🔒</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", color: "#F2C94C", fontWeight: 800, fontSize: "1.15rem", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Unlock Your Full Codex Reading
                    </div>
                    <div style={{ color: "rgba(234, 234, 245, 0.8)", fontSize: "0.9rem" }}>
                      Your synthesis is ready — unlock it to see the full picture
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.75rem" }}>
                  {PREMIUM_FEATURES.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.6rem 0",
                      borderBottom: i < PREMIUM_FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}>
                      <span style={{ color: "#F2C94C", fontSize: "0.8rem", opacity: 0.8 }}>✦</span>
                      <span style={{ color: "rgba(234, 234, 245, 0.9)", fontSize: "0.9rem", fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/profile">
                  <button className="btn btn-primary" style={{
                    width: "100%", fontSize: "0.9rem", padding: "0.85rem",
                    background: "linear-gradient(135deg, rgba(212,168,95,0.25), rgba(212,168,95,0.12))",
                    border: "1px solid rgba(212,168,95,0.5)", color: "var(--cosmic-gold)", marginBottom: "0.75rem",
                  }}>
                    Unlock Full Access
                  </button>
                </Link>
                <div style={{ textAlign: "center" }}>
                  <Link href="/profile" style={{ fontSize: "0.78rem", color: "var(--sc-gold)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                    Have an access code? Enter it on your profile page
                  </Link>
                </div>
              </div>
            )}

          </>
        )}
      </div>

      {/* ── Prescriptions (premium only) ─────────────────────────────────── */}
      {isPremium && synthesis.prescriptions.length > 0 && (
        <div style={{
          background: "rgba(157, 78, 221, 0.12)", border: "1px solid rgba(157, 78, 221, 0.3)",
          borderTop: "3px solid #9D4EDD", borderRadius: "16px",
          padding: "1.6rem 1.75rem", marginBottom: "2.5rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(157,78,221,0.05)",
          backdropFilter: "blur(12px)"
        }}>
          <h3 style={{ 
            fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", 
            color: "#E0CCFF", marginBottom: "1rem", fontWeight: 800,
            fontFamily: "var(--font-display)"
          }}>
            ◆ Prescriptions
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {synthesis.prescriptions.map((p, i) => (
              <li key={i} style={{
                fontSize: "0.95rem", color: "#EAEAF5",
                lineHeight: 1.7, paddingBottom: "0.75rem",
                display: "flex", gap: "0.75rem",
              }}>
                <span style={{ color: "#9D4EDD", flexShrink: 0, fontWeight: 900 }}>→</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Strengths / Shadows (premium only) ───────────────────────────── */}
      {isPremium && (synthesis.strengths.length > 0 || synthesis.shadows.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", marginBottom: "1.5rem" }}>
          {synthesis.strengths.length > 0 && (
            <div style={{
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
              borderLeft: "3px solid #22c55e", borderRadius: "12px", padding: "1.2rem",
            }}>
              <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#22c55e", marginBottom: "0.65rem" }}>
                Signal Strengths
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {synthesis.strengths.slice(0, 5).map((s, i) => (
                  <li key={i} style={{ fontSize: "0.82rem", color: "rgba(230,255,230,0.82)", lineHeight: 1.6, paddingBottom: "0.3rem" }}>
                    <span style={{ color: "#22c55e", marginRight: "0.4rem" }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {synthesis.shadows.length > 0 && (
            <div style={{
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
              borderLeft: "3px solid #f87171", borderRadius: "12px", padding: "1.2rem",
            }}>
              <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f87171", marginBottom: "0.65rem" }}>
                Growth Edges
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {synthesis.shadows.slice(0, 5).map((s, i) => (
                  <li key={i} style={{ fontSize: "0.82rem", color: "rgba(255,220,220,0.82)", lineHeight: 1.6, paddingBottom: "0.3rem" }}>
                    <span style={{ color: "#f87171", marginRight: "0.4rem" }}>◈</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── What Drains Me / Triggers (premium only) ─────────────────────── */}
      {isPremium && synthesis.triggers.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
          borderLeft: "3px solid #f59e0b", borderRadius: "12px",
          padding: "1.2rem", marginBottom: "2rem",
        }}>
          <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "0.65rem" }}>
            What Drains Me
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {synthesis.triggers.map((t, i) => (
              <li key={i} style={{ fontSize: "0.83rem", color: "rgba(255,240,200,0.85)", lineHeight: 1.7, paddingBottom: "0.25rem" }}>
                <span style={{ color: "#f59e0b", marginRight: "0.4rem" }}>▪</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", paddingTop: "0.5rem" }}>
        {isPremium && (
          <button className="btn btn-secondary" onClick={handleRegenerate} disabled={generateMutation.isPending} style={{ fontSize: "0.85rem" }}>
            {generateMutation.isPending ? "Regenerating…" : "↺ Regenerate"}
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => navigate("/profile")} style={{ fontSize: "0.85rem" }}>
          ← Profile
        </button>
        {isPremium && (
          <button className="btn btn-ghost" onClick={() => navigate("/poster")} style={{ fontSize: "0.85rem" }}>
            Poster →
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

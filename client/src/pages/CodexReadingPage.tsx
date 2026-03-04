import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ThemeScore {
  tag: string;
  score: number;
  sources: string[];
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
}

const SECTION_HEADERS = [
  "CODENAME:",
  "MOTTO:",
  "WHO I AM",
  "HOW I MOVE UNDER PRESSURE",
  "WHAT I WON'T TOLERATE",
  "WHAT I'M BUILDING",
  "THIS WEEK",
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

const BADGE_COLORS: Record<string, string> = {
  Verified:   "#22c55e",
  Partial:    "#f59e0b",
  Unverified: "#6b7280",
};

const THEME_ICONS: Record<string, string> = {
  precision:          "◈",
  service:            "✦",
  privacy:            "◉",
  intensity:          "⬡",
  freedom:            "◎",
  leadership:         "▲",
  healing:            "✿",
  order:              "⊞",
  innovation:         "⚙",
  intuition:          "☽",
  discipline:         "⬛",
  rebellion:          "⚡",
  craft:              "⬟",
  legacy:             "⧫",
  emotion_depth:      "◇",
  social_sensitivity: "◌",
  truth:              "◆",
  boundaries:         "▪",
  courage:            "▶",
  focus:              "⊕",
};

export default function CodexReadingPage() {
  const [, navigate] = useLocation();
  const [synthesis, setSynthesis] = useState<CodexSynthesis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const data = await apiRequest("/api/codex30/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!data.ok) throw new Error(data.error ?? "Generation failed");
      return data.synthesis as CodexSynthesis;
    },
    onSuccess: (data) => {
      setSynthesis(data);
      try {
        localStorage.setItem("soulCodexReading", JSON.stringify(data));
      } catch {}
    },
    onError: (err: any) => setError(err.message ?? "Unknown error"),
  });

  useEffect(() => {
    const cached = localStorage.getItem("soulCodexReading");
    if (cached) {
      try { setSynthesis(JSON.parse(cached)); return; } catch {}
    }
    buildAndGenerate();
  }, []);

  function buildAndGenerate() {
    const rawProfile  = localStorage.getItem("soulProfile");
    const rawChart    = localStorage.getItem("soulFullChart");
    const rawInputs   = localStorage.getItem("soulUserInputs");
    const rawOnboarding = localStorage.getItem("onboardingData");
    const rawConf     = localStorage.getItem("soulConfidence");

    let profile: any    = {};
    let fullChart: any  = undefined;
    let userInputs: any = {};

    try { if (rawProfile) profile = JSON.parse(rawProfile); } catch {}
    try { if (rawChart)   fullChart = JSON.parse(rawChart); } catch {}

    if (rawInputs) {
      try { userInputs = JSON.parse(rawInputs); } catch {}
    } else if (rawOnboarding) {
      try { userInputs = JSON.parse(rawOnboarding); } catch {}
    } else if (profile?.signals) {
      userInputs = profile.signals;
    }

    if (rawConf) {
      try {
        const c = JSON.parse(rawConf);
        profile.confidence = c;
      } catch {}
    }

    if (!rawProfile && !rawOnboarding) {
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
  const badgeColor = BADGE_COLORS[synthesis?.badges?.confidenceLabel ?? "Unverified"] ?? "#6b7280";

  if (generateMutation.isPending && !synthesis) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.5rem",
        padding: "2rem"
      }}>
        <div style={{ fontSize: "3rem", animation: "spin 3s linear infinite" }}>✦</div>
        <h2 style={{ color: "var(--cosmic-lavender)", fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>
          Building your Codex Reading…
        </h2>
        <p style={{ color: "var(--muted-foreground)", textAlign: "center", maxWidth: "400px" }}>
          Collecting signals from your chart, numerology, moral compass, and more. This takes about 20 seconds.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.5rem",
        padding: "2rem", textAlign: "center"
      }}>
        <div style={{ fontSize: "2.5rem" }}>⚠</div>
        <h2 style={{ color: "#ef4444" }}>Could not generate your reading</h2>
        <p style={{ color: "var(--muted-foreground)", maxWidth: "400px" }}>{error}</p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => { setError(null); buildAndGenerate(); }}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (!synthesis) return null;

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem", maxWidth: "760px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "99px",
          padding: "0.35rem 1rem",
          fontSize: "0.75rem",
          letterSpacing: "0.12em",
          color: "var(--cosmic-lavender)",
          marginBottom: "1rem",
          textTransform: "uppercase"
        }}>
          Soul Codex Reading
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
          color: "var(--cosmic-gold)",
          marginBottom: "0.5rem",
          lineHeight: 1.2
        }}>
          {synthesis.codename}
        </h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.35rem",
            background: `${badgeColor}20`, border: `1px solid ${badgeColor}50`,
            borderRadius: "99px", padding: "0.2rem 0.75rem",
            fontSize: "0.72rem", color: badgeColor, letterSpacing: "0.08em"
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: badgeColor, display: "inline-block" }} />
            {synthesis.badges.confidenceLabel}
          </span>
          {synthesis.badges.reason && (
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
              — {synthesis.badges.reason}
            </span>
          )}
        </div>
      </div>

      {/* Top Themes */}
      {synthesis.topThemes.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{
            fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--muted-foreground)", marginBottom: "0.75rem"
          }}>
            Core Themes
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {synthesis.topThemes.slice(0, 8).map(t => (
              <span key={t.tag} style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: "8px", padding: "0.3rem 0.7rem",
                fontSize: "0.78rem", color: "var(--cosmic-lavender)"
              }}>
                <span style={{ opacity: 0.7 }}>{THEME_ICONS[t.tag] ?? "◈"}</span>
                {t.tag.replace(/_/g, " ")}
                <span style={{ opacity: 0.5, fontSize: "0.68rem" }}>{t.score}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Narrative Sections */}
      <div style={{ marginBottom: "2.5rem" }}>
        {sections.map((sec, i) => (
          <div key={i} style={{
            background: "rgba(15,25,40,0.6)",
            border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1rem"
          }}>
            {sec.header && (
              <h2 style={{
                fontFamily: sec.header.startsWith("CODENAME") || sec.header.startsWith("WHO") ? "var(--font-serif)" : undefined,
                fontSize: sec.header.startsWith("CODENAME") ? "0.7rem" : "0.85rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--cosmic-gold)",
                marginBottom: "0.75rem"
              }}>
                {sec.header}
              </h2>
            )}
            {sec.lines.map((line, j) => (
              <p key={j} style={{
                color: line.startsWith("-") ? "var(--cosmic-lavender)" : "rgba(230,230,255,0.87)",
                lineHeight: 1.75,
                marginBottom: j < sec.lines.length - 1 ? "0.6rem" : 0,
                fontFamily: i < 2 ? "var(--font-serif)" : undefined,
                fontSize: i === 0 ? "1.15rem" : "0.95rem",
                paddingLeft: line.startsWith("-") ? "0.25rem" : 0
              }}>
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Strengths / Shadows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {synthesis.strengths.length > 0 && (
          <div style={{
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "12px", padding: "1.25rem"
          }}>
            <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#22c55e", marginBottom: "0.75rem" }}>
              Signal Strengths
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {synthesis.strengths.slice(0, 5).map((s, i) => (
                <li key={i} style={{ fontSize: "0.82rem", color: "rgba(230,255,230,0.8)", lineHeight: 1.6, paddingBottom: "0.35rem" }}>
                  <span style={{ color: "#22c55e", marginRight: "0.4rem" }}>✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {synthesis.shadows.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px", padding: "1.25rem"
          }}>
            <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f87171", marginBottom: "0.75rem" }}>
              Growth Edges
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {synthesis.shadows.slice(0, 5).map((s, i) => (
                <li key={i} style={{ fontSize: "0.82rem", color: "rgba(255,220,220,0.8)", lineHeight: 1.6, paddingBottom: "0.35rem" }}>
                  <span style={{ color: "#f87171", marginRight: "0.4rem" }}>◈</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Triggers */}
      {synthesis.triggers.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "12px", padding: "1.25rem", marginBottom: "2rem"
        }}>
          <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "0.75rem" }}>
            What Drains Me
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {synthesis.triggers.map((t, i) => (
              <li key={i} style={{ fontSize: "0.83rem", color: "rgba(255,240,200,0.85)", lineHeight: 1.7, paddingBottom: "0.3rem" }}>
                <span style={{ color: "#f59e0b", marginRight: "0.4rem" }}>▪</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", paddingTop: "1rem" }}>
        <button
          className="btn btn-secondary"
          onClick={handleRegenerate}
          disabled={generateMutation.isPending}
          style={{ fontSize: "0.85rem" }}
        >
          {generateMutation.isPending ? "Regenerating…" : "↺ Regenerate Reading"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/profile")}
          style={{ fontSize: "0.85rem" }}
        >
          ← Back to Profile
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/poster")}
          style={{ fontSize: "0.85rem" }}
        >
          Poster →
        </button>
      </div>
    </div>
  );
}

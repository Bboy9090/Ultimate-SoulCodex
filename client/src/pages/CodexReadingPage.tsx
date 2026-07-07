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

function getProfile() {
  try {
    const raw = localStorage.getItem("soulProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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

export default function CodexReadingPage() {
  const [, navigate] = useLocation();
  const [synthesis, setSynthesis] = useState<CodexSynthesis | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    const rawProfile = localStorage.getItem("soulProfile");
    if (!rawProfile) {
      setError("No profile found. Please complete your calibration first.");
      return;
    }
    try {
      const p = JSON.parse(rawProfile);
      generateMutation.mutate({ profile: p });
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

  const sunSign = profile?.sunSign || profile?.astrologyData?.sunSign || profile?.chartData?.sunSign;
  const moonSign = profile?.moonSign || profile?.astrologyData?.moonSign || profile?.chartData?.moonSign;
  const hdType = profile?.humanDesignData?.type;
  const hdAuth = profile?.humanDesignData?.authority;
  const hdProfile = profile?.humanDesignData?.profile;

  const whoIAm = extractNarrativeSection(synthesis.narrative, "who")
    || extractNarrativeSection(synthesis.narrative, "identity")
    || (sunSign && moonSign
      ? `${sunSign} Sun with ${moonSign} Moon${hdType ? `, operating as a ${hdType}` : ""}. Your core frequency is mapped.`
      : "Your identity architecture is active.");

  const howIOperate = extractNarrativeSection(synthesis.narrative, "operat")
    || extractNarrativeSection(synthesis.narrative, "how")
    || (hdAuth
      ? `${hdType || "Your type"} with ${hdAuth} authority${hdProfile ? `, ${hdProfile} profile` : ""}. Trust that decision-making channel.`
      : "Your operating pattern is calibrated.");

  const oneMove = synthesis.prescriptions?.[0]
    ? cleanCodexLine(synthesis.prescriptions[0], "Audit the current state before making the next move.")
    : "Audit the current state before making the next move.";

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

          {/* 1. WHO I AM */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconIdentity size={14} color="var(--sc-gold)" /> WHO I AM
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>
              {cleanCodexLine(whoIAm, "Your identity architecture is active.")}
            </p>
          </div>

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

          {/* 4. SHADOW PATTERN */}
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

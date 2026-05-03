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

  const sections = synthesis.narrative.split("\n\n").map(sec => {
    const [title, ...lines] = sec.split("\n");
    return { title: title.replace(/[:#]/g, "").trim(), content: lines.join(" ").trim() };
  }).filter(s => s.title && s.content);

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

          {/* 2. NARRATIVE SECTIONS */}
          {sections.map((sec, idx) => (
            <div key={idx} className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
              <h2 className="section-label" style={{ marginBottom: "1.25rem", color: "var(--sc-stone)" }}>{sec.title}</h2>
              <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>
                {cleanCodexLine(sec.content, "Your soul architecture is forming...")}
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

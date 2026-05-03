import { useLocation } from "wouter";
import { 
  IconLogo, IconArrowLeft, IconDiamond, IconStar, 
  IconIdentity, IconCompass, IconZap, IconActivity
} from "../components/Icons";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { cleanCodexLine } from "../lib/soul-codex/utils/cleanCodexLine";

function getProfile() {
  try {
    const raw = localStorage.getItem("soulProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const profile = getProfile();

  if (!profile) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <button className="btn btn-primary" onClick={() => navigate("/start")}>Return to Calibration</button>
      </div>
    );
  }

  const archetypeName = profile.archetype?.name || "The Seeker";
  const archetypeTagline = profile.archetype?.tagline || "Aligning your natal signals...";

  // Sanitize synthesis lines
  const coreEssence = cleanCodexLine(profile.synthesis?.coreEssence, "Your core architecture is forming.");
  const myPattern = cleanCodexLine(profile.synthesis?.myPattern, "Observing your behavioral loops...");
  const growthPath = cleanCodexLine(profile.synthesis?.growthPath, "Your next evolutionary stage is calibrating.");

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: "6rem" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0", marginBottom: "2rem" }}>
          <button onClick={() => navigate("/today")} className="btn btn-ghost" style={{ padding: "0.5rem" }}>
            <IconArrowLeft size={20} />
          </button>
          <IconLogo size={48} />
          <div style={{ width: 44 }} /> {/* Spacer */}
        </div>

        <div className="stagger">
          {/* 1. IDENTITY HEADER */}
          <div className="glassmorphism" style={{ padding: "2.5rem 2rem", borderRadius: "28px", marginBottom: "1.5rem", textAlign: "center" }}>
             <h2 className="section-label" style={{ color: "var(--sc-gold)", marginBottom: "1.25rem" }}>MY IDENTITY</h2>
             <h1 className="heading-display" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{archetypeName}</h1>
             <p className="oracle-text" style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>{archetypeTagline}</p>

             <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                <ConfidenceBadge 
                  badge={profile.confidence?.badge || "unverified"} 
                  label={profile.confidence?.label}
                  reason={profile.confidence?.reason}
                />
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
               <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Natal Sun</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--sc-gold)" }}>{profile.chartData?.sunSign || "—"}</div>
               </div>
               <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Natal Moon</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--sc-ivory)" }}>{profile.chartData?.moonSign || "—"}</div>
               </div>
             </div>
          </div>

          {/* 2. ARCHITECTURE PANELS */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconDiamond size={14} color="var(--sc-gold)" /> CORE ESSENCE
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>{coreEssence}</p>
          </div>

          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconCompass size={14} color="var(--sc-cyan)" /> OPERATING PATTERN
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>{myPattern}</p>
          </div>

          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(183, 148, 244, 0.05)" }}>
            <h2 className="section-label" style={{ color: "var(--sc-slate)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconActivity size={14} /> EVOLUTIONARY PATH
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--sc-ivory)" }}>{growthPath}</p>
          </div>

          {/* 3. HARDWARE (HD) */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.5rem" }}>MECHANICAL SIGNALS</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
               {[
                 { label: "Type", value: profile.humanDesignData?.type },
                 { label: "Authority", value: profile.humanDesignData?.authority },
                 { label: "Profile", value: profile.humanDesignData?.profile },
                 { label: "Strategy", value: profile.humanDesignData?.strategy },
               ].map((item, idx) => (
                 <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                   <span style={{ fontSize: "0.8rem", color: "var(--sc-stone)" }}>{item.label}</span>
                   <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--sc-ivory)" }}>{item.value || "—"}</span>
                 </div>
               ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          <button id="profile-back-to-dashboard-btn" className="btn btn-primary" style={{ height: "3.5rem" }} onClick={() => navigate("/today")}>
            Back to Dashboard
          </button>
          <button id="profile-recalibrate-btn" className="btn btn-ghost" style={{ height: "3.5rem", borderColor: "rgba(255,255,255,0.1)" }} onClick={() => navigate("/start")}>
            Recalibrate Birth Data
          </button>
        </div>

      </div>
    </div>
  );
}

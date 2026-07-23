import { useLocation } from "wouter";
import {
  IconLogo, IconArrowLeft, IconDiamond, IconStar,
  IconIdentity, IconCompass, IconZap, IconActivity
} from "../components/Icons";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { cleanCodexLine } from "../lib/soul-codex/utils/cleanCodexLine";
import {
  calcPersonalDay,
  calcPersonalYear,
  calcPersonalMonth,
  getPersonalDayLabel,
  getPersonalYearLabel,
  getPersonalMonthLabel
} from "@soulcodex/core";

function getProfile() {
  return loadActiveProfile();
}

function getLifePathLabel(num: number | undefined): string {
  if (!num) return "—";
  const labels: Record<number, string> = {
    1: "The Innovator",
    2: "The Peacemaker",
    3: "The Creator",
    4: "The Builder",
    5: "The Explorer",
    6: "The Caregiver",
    7: "The Seeker",
    8: "The Leader",
    9: "The Humanitarian",
  };
  return labels[num] || `Path ${num}`;
}

function buildIdentityStatement(profile: any): string {
  const confidence = profile.confidence?.badge || "unverified";
  const archetype = profile.archetype?.name || "The Seeker";
  const sunSign = profile.chartData?.sunSign;
  const moonSign = profile.chartData?.moonSign;
  const lifePath = profile.numerologyData?.lifePath;
  const hdType = profile.humanDesignData?.type;

  if (confidence === "unverified" || !profile.birthDate) {
    return "Complete your birth details to unlock your full identity architecture.";
  }

  const parts = [];
  if (sunSign) parts.push(`${sunSign} Sun`);
  if (moonSign) parts.push(`${moonSign} Moon`);
  if (hdType) parts.push(`Type ${hdType}`);
  if (lifePath) parts.push(`Life Path ${lifePath}`);

  if (parts.length === 0) {
    return `You are ${archetype}—a pattern woven from your birth chart and life experience.`;
  }

  return `${archetype}. ${parts.join(", ")}. Your essence bridges multiple systems of knowing.`;
}

function buildCoreEssenceStatement(profile: any): string {
  const confidence = profile.confidence?.badge || "unverified";
  const archetype = profile.archetype?.name;
  const sunSign = profile.chartData?.sunSign;
  const lifePathLabel = getLifePathLabel(profile.numerologyData?.lifePath);

  if (!profile.synthesis?.coreEssence || confidence === "unverified") {
    if (confidence === "partial") {
      return `You carry the ${sunSign || "archetypal"} core of ${archetype}. Birth time would reveal your complete foundation.`;
    }
    return `Your core architecture is still being calibrated. Complete your profile to see your essence.`;
  }

  return profile.synthesis.coreEssence;
}

function buildOperatingPatternStatement(profile: any): string {
  const confidence = profile.confidence?.badge || "unverified";
  const hdType = profile.humanDesignData?.type;
  const strategy = profile.humanDesignData?.strategy;

  if (!profile.synthesis?.myPattern || confidence === "unverified") {
    if (confidence === "partial" && hdType) {
      return `As a Type ${hdType}, your operating system processes the world through ${strategy || "your unique strategy"}. This pattern is your mechanical gift.`;
    }
    return `Your behavioral patterns are still being mapped. Add Human Design insights to understand how you operate.`;
  }

  return profile.synthesis.myPattern;
}

function buildGrowthPathStatement(profile: any): string {
  const confidence = profile.confidence?.badge || "unverified";
  const birthDate = profile.birthDate;

  if (!profile.synthesis?.growthPath || confidence === "unverified") {
    if (confidence === "partial" || birthDate) {
      const today = new Date();
      const personalYear = birthDate ? calcPersonalYear(birthDate, today.getFullYear()) : null;
      const yearLabel = personalYear ? getPersonalYearLabel(personalYear) : null;
      if (yearLabel) {
        return `Your 2026 cycle is ${yearLabel}—a phase calling you toward deeper evolution. Trust the unfolding.`;
      }
    }
    return `Your evolutionary stage is still calibrating. Your growth path will reveal itself as your profile completes.`;
  }

  return profile.synthesis.growthPath;
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

  // Calculate Personal Day/Year/Month if we have birthDate
  const today = new Date();
  const birthDate = profile.birthDate;
  let personalDay = null;
  let personalYear = null;
  let personalMonth = null;
  let personalDayLabel = "";
  let personalYearLabel = "";
  let personalMonthLabel = "";

  if (birthDate) {
    try {
      personalDay = calcPersonalDay(birthDate, today);
      personalDayLabel = getPersonalDayLabel(personalDay);
      personalYear = calcPersonalYear(birthDate, today.getFullYear());
      personalYearLabel = getPersonalYearLabel(personalYear);
      personalMonth = calcPersonalMonth(personalYear, today.getMonth() + 1);
      personalMonthLabel = getPersonalMonthLabel(personalMonth);
    } catch (e) {
      console.warn("Failed to calculate personal numbers:", e);
    }
  }

  // Sanitize synthesis lines with hydration-aware copy
  const coreEssence = cleanCodexLine(buildCoreEssenceStatement(profile), "Your core architecture is forming.");
  const myPattern = cleanCodexLine(buildOperatingPatternStatement(profile), "Observing your behavioral loops...");
  const growthPath = cleanCodexLine(buildGrowthPathStatement(profile), "Your next evolutionary stage is calibrating.");
  const identityStatement = buildIdentityStatement(profile);

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
             <p className="oracle-text" style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "var(--sc-ivory)" }}>{identityStatement}</p>

             <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                <ConfidenceBadge
                  badge={profile.confidence?.badge || "unverified"}
                  label={profile.confidence?.label}
                  reason={profile.confidence?.reason}
                />
             </div>

             {/* Natal Big 3 */}
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
               <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Natal Sun</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--sc-gold)" }}>{sunSign || "—"}</div>
               </div>
               <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Natal Moon</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--sc-ivory)" }}>{moonSign || "—"}</div>
               </div>
             </div>

             {/* Numerology + Today Cycle */}
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
               <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Life Path</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--sc-ivory)" }}>{profile.numerologyData?.lifePath || "—"}</div>
               </div>
               <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Personal Year</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--sc-cyan)" }}>{personalYear || "—"}</div>
               </div>
               <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>Today's Frequency</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--sc-slate)" }}>{personalDay || "—"}</div>
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

          {/* Galactic Code Section */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(212, 168, 95, 0.05)", border: "1px solid rgba(212, 168, 95, 0.3)" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>👁</span> GALACTIC CODE
            </h2>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--sc-gold)", marginBottom: "1.5rem" }}>
              Your fused identity fingerprint across astrology, Human Design, numerology, and behavioral pattern analysis.
            </p>
            {hasVerifiedData ? (
              <button
                className="btn btn-primary"
                style={{ width: "100%", height: "2.5rem" }}
                onClick={() => navigate("/galactic-code")}
              >
                View Galactic Code
              </button>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)" }}>
                Complete your astrology and Human Design data to unlock your Galactic Code.
              </p>
            )}
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

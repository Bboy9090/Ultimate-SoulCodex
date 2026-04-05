import { useEffect } from "react";
import { useLocation } from "wouter";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { getJson, removeKey, storageKeys } from "@/lib/storage";

interface Archetype {
  name: string;
  tagline: string;
  element: string;
  role: string;
}

interface Synthesis {
  coreEssence: string;
  stressPattern: string;
  relationshipPattern: string;
  moralCode: { name: string; notes: string };
  powerMode: string;
  growthEdges: string[];
}

interface SoulProfile {
  archetype: Archetype;
  synthesis: Synthesis;
}

function getProfile(): SoulProfile | null {
  const data = getJson<any>(storageKeys.profile);
  if (data?.archetype && data?.synthesis) return data as SoulProfile;
  return null;
}

interface ConfidenceData {
  badge: "verified" | "partial" | "unverified";
  label: string;
  reason: string;
  aiAssuranceNote?: string;
}

function getConfidence(): ConfidenceData | null {
  const stored = getJson<ConfidenceData>(storageKeys.confidence);
  if (stored) return stored;
  const p = getJson<any>(storageKeys.profile);
  return (p?.confidence as ConfidenceData) ?? null;
}


export default function ProfilePage() {
  const [, navigate] = useLocation();
  const profile = getProfile();
  const confidence = getConfidence();
  const showWelcome = (() => {
    try {
      return localStorage.getItem(storageKeys.justOnboarded) === "1";
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!showWelcome) return;
    removeKey(storageKeys.justOnboarded);
  }, [showWelcome]);

  if (!profile) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <h2 className="gradient-text" style={{ marginBottom: "1rem" }}>No profile found</h2>
        <p style={{ marginBottom: "2rem", color: "var(--muted-foreground)" }}>
          Complete the onboarding to generate your profile.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/")} type="button">
          Start Onboarding
        </button>
      </div>
    );
  }

  const { archetype, synthesis } = profile;

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem", maxWidth: 720 }}>
      <div className="stagger">
        <section style={{ textAlign: "center", marginBottom: "3rem" }}>
          {showWelcome && (
            <div
              className="glass-card-static animate-fade-in"
              style={{
                padding: "1rem 1.25rem",
                margin: "0 auto 1.25rem",
                maxWidth: 620,
                border: "1px solid rgba(34,197,94,0.22)",
                background: "rgba(34,197,94,0.06)",
              }}
            >
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(230,230,255,0.7)", fontWeight: 700 }}>
                Welcome
              </div>
              <div style={{ marginTop: "0.35rem", color: "rgba(230,230,255,0.92)", fontWeight: 600 }}>
                Your profile is ready.
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Next: open your Codex Reading for the full synthesis, then check “Today” for one grounded step.
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    try { localStorage.removeItem("soulJustOnboarded"); } catch {}
                    navigate("/codex");
                  }}
                  type="button"
                  style={{ padding: "0.6rem 1.2rem" }}
                >
                  Open Codex Reading
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    try { localStorage.removeItem("soulJustOnboarded"); } catch {}
                    navigate("/horoscope");
                  }}
                  type="button"
                  style={{ padding: "0.6rem 1.2rem" }}
                >
                  Today’s Reading
                </button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
            <div
              style={{
                display: "inline-block",
                padding: "0.375rem 1rem",
                background: "rgba(124, 58, 237, 0.15)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                borderRadius: 9999,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--cosmic-lavender)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {archetype.element} {archetype.role}
            </div>
            {confidence && (
              <ConfidenceBadge
                badge={confidence.badge}
                label={confidence.label}
                reason={confidence.reason}
                size="md"
              />
            )}
          </div>
          {confidence?.reason && (
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginBottom: "0.5rem", fontStyle: "italic" }}>
              {confidence.reason}
            </p>
          )}
          {confidence?.aiAssuranceNote && (
            <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginBottom: "0.75rem", lineHeight: 1.55 }}>
              {confidence.aiAssuranceNote}
            </p>
          )}
          <h1
            className="gradient-text"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 7vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: "0.75rem",
            }}
          >
            {archetype.name}
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "var(--muted-foreground)",
              fontStyle: "italic",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            {archetype.tagline}
          </p>
        </section>

        <ProfileSection icon="🔍" title="Who I Am">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem", whiteSpace: "pre-wrap" }}>
            {synthesis.coreEssence}
          </p>
        </ProfileSection>

        <ProfileSection icon="⚡" title="How I React Under Stress">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem", whiteSpace: "pre-wrap" }}>
            {synthesis.stressPattern}
          </p>
        </ProfileSection>

        <ProfileSection icon="💜" title="How I Love & Relate">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem", whiteSpace: "pre-wrap" }}>
            {synthesis.relationshipPattern}
          </p>
        </ProfileSection>

        <ProfileSection icon="⚖️" title="My Moral Compass">
          <div
            style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              background: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              borderRadius: 9999,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--cosmic-rose)",
              marginBottom: "0.75rem",
            }}
          >
            {synthesis.moralCode.name}
          </div>
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem" }}>
            {synthesis.moralCode.notes}
          </p>
        </ProfileSection>

        <ProfileSection icon="🏗️" title="What I'm Built to Build">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem", whiteSpace: "pre-wrap" }}>
            {synthesis.powerMode}
          </p>
        </ProfileSection>

        <ProfileSection icon="🌱" title="Growth Edges">
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {synthesis.growthEdges.map((edge, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  padding: "0.75rem 1rem",
                  background: "rgba(251, 191, 36, 0.08)",
                  border: "1px solid rgba(251, 191, 36, 0.15)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span style={{ color: "var(--cosmic-gold)", flexShrink: 0, fontSize: "1rem" }}>→</span>
                <span style={{ color: "var(--card-foreground)", lineHeight: 1.6, fontSize: "0.9375rem" }}>
                  {edge}
                </span>
              </li>
            ))}
          </ul>
        </ProfileSection>

        <div style={{ textAlign: "center", marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/codex")}
            type="button"
            style={{ fontSize: "0.95rem", padding: "0.75rem 1.75rem" }}
          >
            ✦ Open Codex Reading
          </button>
          <button
            className="btn btn-glow btn-large"
            onClick={() => navigate("/horoscope")}
            type="button"
          >
            See Today's Reading
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="glass-card-static"
      style={{ padding: "1.5rem", marginBottom: "1.25rem" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

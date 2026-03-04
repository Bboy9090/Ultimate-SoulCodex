import { useLocation } from "wouter";

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
  try {
    const raw = localStorage.getItem("soulProfile");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.archetype && data.synthesis) return data as SoulProfile;
    return null;
  } catch {
    return null;
  }
}

interface ConfidenceData {
  badge: "verified" | "partial" | "unverified";
  label: string;
  reason: string;
}

function getConfidence(): ConfidenceData | null {
  try {
    const raw = localStorage.getItem("soulConfidence");
    if (!raw) {
      const profile = localStorage.getItem("soulProfile");
      if (profile) {
        const p = JSON.parse(profile);
        if (p.confidence) return p.confidence as ConfidenceData;
      }
      return null;
    }
    return JSON.parse(raw) as ConfidenceData;
  } catch {
    return null;
  }
}

const BADGE_STYLES: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  verified: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#4ade80", dot: "#22c55e" },
  partial: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", color: "#fbbf24", dot: "#f59e0b" },
  unverified: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", color: "#94a3b8", dot: "#64748b" },
};

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const profile = getProfile();
  const confidence = getConfidence();

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
            {confidence && (() => {
              const s = BADGE_STYLES[confidence.badge] ?? BADGE_STYLES.unverified;
              return (
                <div
                  title={confidence.reason}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.875rem",
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 9999,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: s.color,
                    letterSpacing: "0.05em",
                    cursor: "default",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }} />
                  {confidence.label}
                </div>
              );
            })()}
          </div>
          {confidence && (
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.75rem", fontStyle: "italic" }}>
              {confidence.reason}
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
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem" }}>
            {synthesis.coreEssence}
          </p>
        </ProfileSection>

        <ProfileSection icon="⚡" title="How I React Under Stress">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem" }}>
            {synthesis.stressPattern}
          </p>
        </ProfileSection>

        <ProfileSection icon="💜" title="How I Love & Relate">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem" }}>
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
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "1rem" }}>
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

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
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

import type { ReactNode } from "react";
import { useLocation } from "wouter";
import ConfidenceBadge from "@/components/ConfidenceBadge";

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

interface ConfidenceData {
  badge: "verified" | "partial" | "unverified";
  label: string;
  reason: string;
}

function getProfile(): SoulProfile | null {
  try {
    const raw = localStorage.getItem("soulProfile");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.archetype && data.synthesis) return data as SoulProfile;
    return null;
  } catch { return null; }
}

function getConfidence(): ConfidenceData | null {
  try {
    const raw = localStorage.getItem("soulConfidence");
    if (raw) return JSON.parse(raw) as ConfidenceData;
    const profile = localStorage.getItem("soulProfile");
    if (profile) {
      const p = JSON.parse(profile);
      if (p.confidence) return p.confidence as ConfidenceData;
    }
    return null;
  } catch { return null; }
}

function getCodexPrescription(): string | null {
  try {
    const raw = localStorage.getItem("soulCodexReading");
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d?.prescriptions?.[0] ?? null;
  } catch { return null; }
}

// Section visual config
const SECTION_STYLES: Record<string, { glyph: string; accent: string; bg: string }> = {
  who:      { glyph: "◉", accent: "#8b5cf6", bg: "rgba(139,92,246,0.07)" },
  stress:   { glyph: "⬡", accent: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
  relate:   { glyph: "◌", accent: "#f472b6", bg: "rgba(244,114,182,0.06)" },
  compass:  { glyph: "◆", accent: "#22d3ee", bg: "rgba(34,211,238,0.06)" },
  build:    { glyph: "⧫", accent: "#fbbf24", bg: "rgba(251,191,36,0.06)" },
  growth:   { glyph: "◎", accent: "#22c55e", bg: "rgba(34,197,94,0.06)" },
};

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const profile      = getProfile();
  const confidence   = getConfidence();
  const prescription = getCodexPrescription();

  if (!profile) {
    return (
      <div style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.4 }}>◉</div>
        <h2 className="gradient-text" style={{ marginBottom: "1rem" }}>No profile found</h2>
        <p style={{ marginBottom: "2rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
          Complete the onboarding to generate your soul profile.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/")} type="button">
          Begin Onboarding
        </button>
      </div>
    );
  }

  const { archetype, synthesis } = profile;

  // Snapshot strip data
  const snapshotCards = [
    {
      label: "Pattern",
      value: (synthesis.coreEssence ?? "").split(".")[0] + ".",
      accent: "#8b5cf6",
    },
    {
      label: "Under Pressure",
      value: (synthesis.stressPattern ?? "").split(".")[0] + ".",
      accent: "#f59e0b",
    },
    {
      label: prescription ? "One Move" : "Growth Edge",
      value: prescription ?? synthesis.growthEdges?.[0] ?? "",
      accent: "#22c55e",
    },
  ];

  return (
    <div style={{ padding: "2rem 1rem 5rem", maxWidth: 720, margin: "0 auto" }}>

      {/* ── Identity header ─────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", marginBottom: "2.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <span style={{
            display: "inline-block", padding: "0.3rem 0.9rem",
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600,
            color: "var(--cosmic-lavender)", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {archetype.element} · {archetype.role}
          </span>
          {confidence && (
            <ConfidenceBadge
              badge={confidence.badge}
              label={confidence.label}
              reason={confidence.reason}
              size="sm"
            />
          )}
        </div>

        <h1
          className="gradient-text"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.2rem, 7vw, 3.75rem)",
            fontWeight: 700, lineHeight: 1.1, marginBottom: "0.75rem",
          }}
        >
          {archetype.name}
        </h1>

        <p style={{
          fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
          color: "var(--muted-foreground)", fontStyle: "italic",
          maxWidth: 480, margin: "0 auto",
        }}>
          {archetype.tagline}
        </p>
      </section>

      {/* ── Snapshot strip ───────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "0.75rem", marginBottom: "2.25rem",
      }}>
        {snapshotCards.map(card => (
          <div
            key={card.label}
            style={{
              background: "rgba(15,20,40,0.6)", borderRadius: "12px",
              padding: "1rem 1.1rem",
              border: `1px solid ${card.accent}30`,
              borderLeft: `3px solid ${card.accent}`,
            }}
          >
            <div style={{
              fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase",
              color: card.accent, fontWeight: 700, marginBottom: "0.45rem",
            }}>
              {card.label}
            </div>
            <p style={{
              fontSize: "0.82rem", color: "rgba(230,228,255,0.82)",
              lineHeight: 1.55, margin: 0,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Deep sections ────────────────────────────────────────────────── */}
      <div className="stagger">

        <ProfileSection sectionKey="who" title="Who I Am">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
            {synthesis.coreEssence}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="stress" title="How I React Under Stress">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
            {synthesis.stressPattern}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="relate" title="How I Connect and Relate">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
            {synthesis.relationshipPattern}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="compass" title="Moral Compass">
          <div style={{ marginBottom: "0.75rem" }}>
            <span style={{
              display: "inline-block", padding: "0.2rem 0.7rem",
              background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 9999, fontSize: "0.78rem", fontWeight: 600,
              color: "var(--cosmic-cyan)",
            }}>
              {synthesis.moralCode.name}
            </span>
          </div>
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
            {synthesis.moralCode.notes}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="build" title="What I'm Built to Build">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
            {synthesis.powerMode}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="growth" title="Growth Edges">
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {synthesis.growthEdges.map((edge, i) => (
              <li
                key={i}
                style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.7rem 0.9rem",
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: "8px",
                }}
              >
                <span style={{ color: "#22c55e", flexShrink: 0, fontSize: "0.85rem", marginTop: "0.1rem" }}>→</span>
                <span style={{ color: "var(--card-foreground)", lineHeight: 1.6, fontSize: "0.9rem" }}>
                  {edge}
                </span>
              </li>
            ))}
          </ul>
        </ProfileSection>

      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "0.75rem", flexWrap: "wrap",
        justifyContent: "center", marginTop: "2.5rem",
      }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/codex")}
          type="button"
          style={{ fontSize: "0.9rem", padding: "0.7rem 1.6rem" }}
        >
          ✦ Open Codex Reading
        </button>
        <button
          className="btn btn-glow btn-large"
          onClick={() => navigate("/today")}
          type="button"
          style={{ fontSize: "0.9rem" }}
        >
          ☽ Today's Card
        </button>
      </div>

    </div>
  );
}

// ── Section component ────────────────────────────────────────────────────────

function ProfileSection({
  sectionKey,
  title,
  children,
}: {
  sectionKey: keyof typeof SECTION_STYLES;
  title: string;
  children: ReactNode;
}) {
  const s = SECTION_STYLES[sectionKey];
  return (
    <section
      style={{
        background: s.bg,
        border: "1px solid rgba(139,92,246,0.12)",
        borderLeft: `3px solid ${s.accent}`,
        borderRadius: "12px",
        padding: "1.4rem 1.5rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.9rem" }}>
        <span style={{ color: s.accent, fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>
          {s.glyph}
        </span>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

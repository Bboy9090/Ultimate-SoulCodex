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

function getSecondPrescription(): string | null {
  try {
    const raw = localStorage.getItem("soulCodexReading");
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d?.prescriptions?.[1] ?? null;
  } catch { return null; }
}

// ── Text helpers ─────────────────────────────────────────────────────────────

/** Returns the first complete sentence of a text block. */
function firstSentence(text: string): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  const s = trimmed.split(/(?<=[.!?])\s/)[0];
  return s.endsWith(".") || s.endsWith("!") || s.endsWith("?") ? s : s + ".";
}

/**
 * Returns the text with the first sentence removed — so the deep section
 * doesn't repeat what was already shown in the snapshot card above.
 * Falls back to the full text when it's a single sentence.
 */
function afterFirstSentence(text: string): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/(?<=[.!?])\s+/);
  if (parts.length <= 1) return trimmed;
  return parts.slice(1).join(" ");
}

/**
 * Strips zodiac-sign-first openers so behavioral observations lead.
 * "As a Scorpio, I tend to…" → "I tend to…"
 */
const ZODIAC = "Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces";
const SIGN_OPENER = new RegExp(
  `^(?:As (?:a |an )?(?:Sun |Moon |Rising )?(${ZODIAC})|My (${ZODIAC}) (?:Sun|Moon|Rising|nature))[^,]*,\\s*`,
  "i"
);

function cleanBehavioralText(text: string): string {
  if (!text) return text;
  const match = text.match(SIGN_OPENER);
  if (match) {
    const rest = text.slice(match[0].length);
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return text;
}

// ── Section visual config ────────────────────────────────────────────────────
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
  const prescription  = getCodexPrescription();
  const prescription2 = getSecondPrescription();

  if (!profile) {
    return (
      <div style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem", opacity: 0.25, color: "var(--cosmic-lavender)" }}>◉</div>
        <h2 className="gradient-text" style={{ marginBottom: "0.75rem" }}>No profile found</h2>
        <p style={{ marginBottom: "2rem", color: "var(--muted-foreground)", lineHeight: 1.65, fontSize: "0.9rem" }}>
          Complete the onboarding to generate your soul profile.
        </p>
        <button
          className="btn btn-primary btn-large"
          onClick={() => navigate("/start")}
          type="button"
          style={{ minWidth: 200 }}
        >
          ◉ Begin Your Reading
        </button>
      </div>
    );
  }

  const { archetype, synthesis } = profile;

  const whyNowValue = prescription
    ? prescription
    : synthesis.growthEdges?.[0]
      ? `Now is the time to ${synthesis.growthEdges[0].replace(/^you (should|need to|must)\s+/i, "").toLowerCase()}`
      : "";

  const oneMoveValue = prescription2
    ? prescription2
    : synthesis.growthEdges?.[1] ?? synthesis.growthEdges?.[0] ?? "";

  const snapshotCards = [
    {
      label: "Who I Am",
      value: firstSentence(synthesis.coreEssence ?? ""),
      accent: "#8b5cf6",
      bg: "rgba(139,92,246,0.08)",
    },
    {
      label: "Why Now",
      value: whyNowValue,
      accent: "#22d3ee",
      bg: "rgba(34,211,238,0.07)",
    },
    {
      label: "One Pattern to Watch",
      value: firstSentence(synthesis.stressPattern ?? ""),
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.07)",
    },
    {
      label: "One Move Today",
      value: oneMoveValue,
      accent: "#22c55e",
      bg: "rgba(34,197,94,0.07)",
    },
  ];

  // Deep-section text: strip the first sentence already shown in snapshot
  const whoIAmDeep    = cleanBehavioralText(afterFirstSentence(synthesis.coreEssence ?? "") || synthesis.coreEssence ?? "");
  const stressDeep    = cleanBehavioralText(afterFirstSentence(synthesis.stressPattern ?? "") || synthesis.stressPattern ?? "");
  const relateDeep    = cleanBehavioralText(synthesis.relationshipPattern ?? "");
  const buildDeep     = cleanBehavioralText(synthesis.powerMode ?? "");
  const compassNotes  = cleanBehavioralText(synthesis.moralCode?.notes ?? "");

  return (
    <div style={{ padding: "2rem 1rem 5rem", maxWidth: 720, margin: "0 auto", position: "relative", overflow: "hidden" }}>

      {/* ── Atmospheric background glow ──────────────────────────────────── */}
      <img
        src="/logo.png"
        aria-hidden="true"
        style={{
          position: "absolute", top: "-60px", left: "50%",
          transform: "translateX(-50%)",
          width: 520, height: 520, objectFit: "contain",
          opacity: 0.07, mixBlendMode: "screen",
          filter: "blur(28px)",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />

      {/* ── Identity header ─────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", marginBottom: "2.5rem", position: "relative", zIndex: 1 }}>

        <div style={{
          fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--muted-foreground)", marginBottom: "1rem", fontWeight: 500,
        }}>
          Soul Snapshot
        </div>

        <div style={{
          fontSize: "2.25rem", marginBottom: "0.75rem",
          background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 12px rgba(139,92,246,0.5))",
        }}>
          ◉
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

        <div style={{
          display: "flex", gap: "0.5rem", justifyContent: "center",
          flexWrap: "wrap", marginBottom: "0.85rem",
        }}>
          <span style={{
            display: "inline-block", padding: "0.3rem 0.9rem",
            background: "rgba(124,58,237,0.13)", border: "1px solid rgba(124,58,237,0.28)",
            borderRadius: 9999, fontSize: "0.68rem", fontWeight: 600,
            color: "var(--cosmic-lavender)", letterSpacing: "0.08em", textTransform: "uppercase",
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

        <p style={{
          fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
          color: "var(--muted-foreground)", fontStyle: "italic",
          maxWidth: 460, margin: "0 auto",
        }}>
          {archetype.tagline}
        </p>

        <div style={{
          marginTop: "2rem",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
        }} />
      </section>

      {/* ── Snapshot strip — 4 named signal cards ────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "0.85rem", marginBottom: "2.5rem",
        position: "relative", zIndex: 1,
      }}>
        {snapshotCards.map(card => (
          <div
            key={card.label}
            style={{
              background: card.bg,
              borderRadius: "14px",
              padding: "1.25rem 1.35rem",
              border: `1px solid ${card.accent}28`,
              borderLeft: `3px solid ${card.accent}`,
            }}
          >
            <div style={{
              fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase",
              color: card.accent, fontWeight: 700, marginBottom: "0.55rem",
            }}>
              {card.label}
            </div>
            <p style={{
              fontSize: "0.855rem", color: "rgba(230,228,255,0.88)",
              lineHeight: 1.6, margin: 0,
              display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Action buttons — Today first (primary), Codex second ──────────── */}
      <div style={{
        display: "flex", gap: "0.85rem", flexWrap: "wrap",
        justifyContent: "center", marginBottom: "3rem",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flex: "1 1 200px" }}>
          <button
            className="btn btn-glow btn-large"
            onClick={() => navigate("/today")}
            type="button"
            style={{ fontSize: "0.9rem", width: "100%" }}
          >
            ☽ Today's Card
          </button>
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textAlign: "center" }}>
            Your daily signal, guidance &amp; focus
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flex: "1 1 200px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/codex")}
            type="button"
            style={{ fontSize: "0.9rem", padding: "0.85rem 1.6rem", width: "100%" }}
          >
            ✦ Open Codex Reading
          </button>
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textAlign: "center" }}>
            Deep dive into your soul architecture
          </span>
        </div>
      </div>

      {/* ── Full Reading divider ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        marginBottom: "1.75rem", position: "relative", zIndex: 1,
      }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.18))" }} />
        <span style={{
          fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--muted-foreground)", opacity: 0.45, whiteSpace: "nowrap",
        }}>
          Full Reading
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(139,92,246,0.18), transparent)" }} />
      </div>

      {/* ── Deep sections ────────────────────────────────────────────────── */}
      <div className="stagger" style={{ position: "relative", zIndex: 1 }}>

        <ProfileSection sectionKey="who" title="Who I Am">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {whoIAmDeep}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="stress" title="How I React Under Stress">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {stressDeep}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="relate" title="How I Connect and Relate">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {relateDeep}
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
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {compassNotes}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="build" title="What I'm Built to Build">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {buildDeep}
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
                <span style={{ color: "var(--card-foreground)", lineHeight: 1.6, fontSize: "0.875rem" }}>
                  {edge}
                </span>
              </li>
            ))}
          </ul>
        </ProfileSection>

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
        border: `1px solid ${s.accent}18`,
        borderRadius: "12px",
        padding: "1.4rem 1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.9rem" }}>
        <span style={{ color: s.accent, fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>
          {s.glyph}
        </span>
        <h3 style={{
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--foreground)", margin: 0,
        }}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

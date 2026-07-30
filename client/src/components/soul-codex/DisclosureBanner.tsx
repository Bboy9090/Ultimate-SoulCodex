/**
 * DisclosureBanner - Phase 2
 *
 * Single persistent status banner replacing repeated disclaimers
 *
 * Old: Every paragraph had disclaimers about symbolic/approximation/reflective/not identity
 * New: One banner at top, badges on individual layers
 *
 * Banner says once what used to be repeated 20+ times
 */

interface DisclosureBannerProps {
  mode?: "reflective" | "technical" | "mixed";
}

export default function DisclosureBanner({ mode = "reflective" }: DisclosureBannerProps) {
  return (
    <div
      style={{
        padding: "1rem 1.5rem",
        background: "linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(103,58,183,0.08) 100%)",
        border: "1px solid rgba(33,150,243,0.2)",
        borderRadius: "8px",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "1.2rem", minWidth: "24px" }}>ℹ</div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--sc-ivory)",
              marginBottom: "0.5rem",
            }}
          >
            {mode === "technical"
              ? "Technical Interpretation"
              : mode === "mixed"
              ? "Mixed Verification"
              : "Reflective Synthesis"}
          </div>

          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--sc-stone)",
              lineHeight: "1.6",
            }}
          >
            {mode === "technical" ? (
              <>
                Soul Codex combines deterministic calculations (astronomy, numerology) with interpretive
                synthesis (symbolism, patterns). Verified facts, estimates, and missing data are
                labeled separately below.
              </>
            ) : mode === "mixed" ? (
              <>
                This reading blends verified calculations with interpretive frameworks. Use the "Why this
                reading?" drawer to see which layers are confirmed and which depend on additional data.
              </>
            ) : (
              <>
                Soul Codex interprets symbolic systems through the lens of your birth data. It is not
                biography, identity, or destiny—it is a reflective mirror. Your lived experience remains
                the final authority.
              </>
            )}
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              marginTop: "0.75rem",
              color: "var(--sc-teal)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            View evidence · Expand "Why this reading?" below
          </div>
        </div>
      </div>
    </div>
  );
}

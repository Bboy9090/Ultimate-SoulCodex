/**
 * CodexHeader - Phase 3
 *
 * Clean top section following golden template
 * Fewer labels, clearer hierarchy, no contradictions
 *
 * OLD "Your locally generated biography" contradicted "reflective frameworks"
 * NEW "Your Codex Summary" properly frames what this is
 */

interface CodexHeaderProps {
  subjectName: string;
  archetypeName: string;
  archetypeTagline: string;
  archetypeStatus: "provisional" | "complete";
  coreInsight: string;
  systems: {
    astrology: string;
    numerology?: string;
    humanDesign?: string;
  };
  coreGift: string;
  primaryTension: string;
  groundedAction: string;
  calculationConfidence: "High" | "Moderate" | "Low";
  verifiedSystems: string[];
}

export default function CodexHeader({
  subjectName,
  archetypeName,
  archetypeTagline,
  archetypeStatus,
  coreInsight,
  systems,
  coreGift,
  primaryTension,
  groundedAction,
  calculationConfidence,
  verifiedSystems,
}: CodexHeaderProps) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      {/* Subject Name + Timestamp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            color: "var(--sc-ivory)",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          {subjectName}'s Soul Codex
        </h1>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--sc-stone)",
            textTransform: "uppercase",
          }}
        >
          Generated {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Archetype + Status */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--sc-gold)",
            margin: "0 0 0.5rem 0",
          }}
        >
          {archetypeName}
        </h2>
        <div
          style={{
            fontSize: "0.95rem",
            color: "var(--sc-ivory)",
            marginBottom: "0.75rem",
            lineHeight: "1.6",
          }}
        >
          {archetypeTagline}
        </div>
        {archetypeStatus === "provisional" && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--sc-teal)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Provisional until all systems are verified
          </div>
        )}
      </div>

      {/* Core Insight */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(212,168,95,0.08)",
          border: "1px solid rgba(212,168,95,0.15)",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--sc-ivory)",
            lineHeight: "1.8",
            margin: 0,
          }}
        >
          {coreInsight}
        </p>
      </div>

      {/* Systems Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Left: Systems */}
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "var(--sc-gold)",
              marginBottom: "1rem",
            }}
          >
            Systems
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            {systems.astrology && (
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--sc-stone)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Astrology
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "var(--sc-ivory)",
                    fontWeight: 500,
                  }}
                >
                  {systems.astrology}
                </div>
              </div>
            )}
            {systems.numerology && (
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--sc-stone)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Numerology
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "var(--sc-ivory)",
                    fontWeight: 500,
                  }}
                >
                  {systems.numerology}
                </div>
              </div>
            )}
            {systems.humanDesign && (
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--sc-stone)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Human Design
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "var(--sc-ivory)",
                    fontWeight: 500,
                  }}
                >
                  {systems.humanDesign}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Confidence */}
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "var(--sc-gold)",
              marginBottom: "1rem",
            }}
          >
            Calculation Confidence
          </div>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color:
                calculationConfidence === "High"
                  ? "rgba(76,175,80,1)"
                  : calculationConfidence === "Moderate"
                  ? "rgba(255,152,0,1)"
                  : "rgba(158,158,158,1)",
              marginBottom: "1rem",
            }}
          >
            {calculationConfidence}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--sc-stone)" }}>
            {verifiedSystems.map((sys, idx) => (
              <div key={idx}>
                <span style={{ color: "var(--sc-teal)" }}>✓</span> {sys}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Key Points */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "2rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "var(--sc-gold)",
              marginBottom: "0.75rem",
            }}
          >
            Core Gift
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--sc-ivory)",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {coreGift}
          </p>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "var(--sc-amber)",
              marginBottom: "0.75rem",
            }}
          >
            Primary Tension
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--sc-ivory)",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {primaryTension}
          </p>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "var(--sc-teal)",
              marginBottom: "0.75rem",
            }}
          >
            Grounded Action
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--sc-ivory)",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {groundedAction}
          </p>
        </div>
      </div>
    </div>
  );
}

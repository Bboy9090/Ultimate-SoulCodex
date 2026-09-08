/**
 * VerifiedSystemsPanel - Phase 1
 *
 * Shows exact degrees and calculated values (technical depth only)
 * CRITICAL: Respects AstrologyDataStatus
 * - Only shows Moon when status is "verified_ephemeris" or "estimated_birth_window"
 * - Only shows Ascendant when status is "verified_ephemeris"
 * - Never shows legacy approximations alongside verified data
 */

import type { VerifiedSystems, AstrologyDataStatus } from "@soulcodex/core";

interface VerifiedSystemsPanelProps {
  systems: VerifiedSystems;
  astrologyStatus: AstrologyDataStatus;
}

export default function VerifiedSystemsPanel({
  systems,
  astrologyStatus
}: VerifiedSystemsPanelProps) {
  const astrology = systems.astrology;
  const showMoon = astrologyStatus === "verified_ephemeris" || astrologyStatus === "estimated_birth_window";
  const showAscendant = astrologyStatus === "verified_ephemeris";

  return (
    <div
      style={{
        padding: "2rem",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
      }}
    >
      <h2
        style={{
          fontSize: "1rem",
          textTransform: "uppercase",
          color: "var(--sc-gold)",
          margin: "0 0 1.5rem 0",
        }}
      >
        Verified Systems
      </h2>

      {/* Astrology */}
      {astrology && (
        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "var(--sc-stone)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Astrology
          </h3>

          {/* Status indicator */}
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--sc-teal)",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {astrology.status === "verified_ephemeris" && "✓ Verified Ephemeris"}
            {astrology.status === "estimated_birth_window" && "≈ Estimated Window"}
            {astrology.status === "date_only" && "📅 Date Only"}
            {astrology.status === "legacy_approximation" && "⚠ Legacy Approximation"}
            {astrology.status === "unavailable" && "⊘ Data Unavailable"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* Sun - Always shown when astrology exists */}
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Sun</div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--sc-ivory)",
                  fontWeight: 600,
                }}
              >
                {astrology.sunSign} {astrology.sunDegree.toFixed(2)}°
              </div>
            </div>

            {/* Moon - Only shown when verified or estimated */}
            {showMoon && astrology.moonSign && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Moon</div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--sc-ivory)",
                    fontWeight: 600,
                  }}
                >
                  {astrology.moonSign} {astrology.moonDegree?.toFixed(2)}°
                </div>
                {astrologyStatus === "estimated_birth_window" && (
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--sc-teal)",
                      marginTop: "0.25rem",
                    }}
                  >
                    depends on exact time
                  </div>
                )}
              </div>
            )}

            {/* Ascendant - Only shown when verified */}
            {showAscendant && astrology.ascendant && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Ascendant</div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--sc-ivory)",
                    fontWeight: 600,
                  }}
                >
                  {astrology.ascendant} {astrology.ascendantDegree?.toFixed(2)}°
                </div>
              </div>
            )}

            {/* Remark for date-only or estimated cases */}
            {astrology.remark && !showAscendant && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(255,152,0,0.08)",
                  border: "1px dashed rgba(255,152,0,0.2)",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  color: "var(--sc-stone)",
                  gridColumn: "1 / -1",
                }}
              >
                {astrology.remark}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Numerology */}
      {systems.numerology && (
        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "var(--sc-stone)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Numerology
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Life Path</div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--sc-ivory)",
                  fontWeight: 600,
                }}
              >
                {systems.numerology.lifePathNumber}
              </div>
            </div>
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Birthday</div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--sc-ivory)",
                  fontWeight: 600,
                }}
              >
                {systems.numerology.birthdayNumber}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human Design */}
      {systems.humanDesign && (
        <div>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "var(--sc-stone)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Human Design
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Profile</div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--sc-ivory)",
                  fontWeight: 600,
                }}
              >
                {systems.humanDesign.profileType}
              </div>
            </div>
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Strategy</div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--sc-ivory)",
                  fontWeight: 600,
                }}
              >
                {systems.humanDesign.strategy}
              </div>
            </div>
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Authority</div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--sc-ivory)",
                  fontWeight: 600,
                }}
              >
                {systems.humanDesign.authority}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

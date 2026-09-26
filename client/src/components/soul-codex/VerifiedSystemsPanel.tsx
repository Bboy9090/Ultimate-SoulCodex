/**
 * VerifiedSystemsPanel - Phase 1
 *
 * Verified / deterministic technical depth only.
 * Astrology appears here only when the full ephemeris contract is verified.
 * Estimated, date-only, legacy, and unavailable astrology belong in inspectable
 * surfaces with explicit uncertainty labels, not in this verified panel.
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
  const showVerifiedAstrology = astrologyStatus === "verified_ephemeris" && astrology.status === "verified_ephemeris";
  const showMoon = showVerifiedAstrology;
  const showAscendant = showVerifiedAstrology;
  const showVerifiedHumanDesign =
    systems.humanDesign?.status === "verified" &&
    Boolean(
      systems.humanDesign.verificationReceiptId?.trim() &&
      systems.humanDesign.independentSource?.trim() &&
      systems.humanDesign.verifiedAt?.trim(),
    );

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
        Verified / Deterministic Systems
      </h2>

      {/* Astrology */}
      {showVerifiedAstrology && astrology && (
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
            ✓ Verified Ephemeris
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
      {showVerifiedHumanDesign && systems.humanDesign && (
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

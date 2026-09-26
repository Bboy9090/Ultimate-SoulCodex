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
      <style>{`
        @keyframes soulCodexFoundationRise {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        [data-verified-system-section] {
          animation: soulCodexFoundationRise 520ms cubic-bezier(.2,.8,.2,1) both;
        }
        [data-verified-system-section="numerology"] { animation-delay: 70ms; }
        [data-verified-system-section="human-design"] { animation-delay: 140ms; }
        [data-verified-system-card] {
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
          border: 1px solid rgba(255,255,255,0.06);
        }
        [data-verified-system-card]:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.05) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-verified-system-section] { animation: none; }
          [data-verified-system-card] { transition: none; }
          [data-verified-system-card]:hover { transform: none; }
        }
      `}</style>

      <h2
        style={{
          fontSize: "1rem",
          textTransform: "uppercase",
          color: "var(--sc-gold)",
          margin: "0 0 0.5rem 0",
          letterSpacing: "0.08em",
        }}
      >
        Your Verified Foundations
      </h2>
      <p
        style={{
          margin: "0 0 1.5rem 0",
          maxWidth: "62ch",
          color: "var(--sc-stone)",
          fontSize: "0.82rem",
          lineHeight: 1.6,
        }}
      >
        Each system appears only when its own evidence contract passes. When two systems repeat a theme,
        Soul Codex treats that as symbolic resonance — not extra certainty.
      </p>

      {/* Astrology */}
      {showVerifiedAstrology && astrology && (
        <div data-verified-system-section="astrology" style={{ marginBottom: "2rem" }}>
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
              data-verified-system-card
              style={{
                padding: "0.9rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
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
        <div data-verified-system-section="numerology" style={{ marginBottom: "2rem" }}>
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
              data-verified-system-card
              style={{
                padding: "0.9rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
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
              data-verified-system-card
              style={{
                padding: "0.9rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
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
        <div data-verified-system-section="human-design">
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
              data-verified-system-card
              style={{
                padding: "0.9rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
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
              data-verified-system-card
              style={{
                padding: "0.9rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
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
              data-verified-system-card
              style={{
                padding: "0.9rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
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

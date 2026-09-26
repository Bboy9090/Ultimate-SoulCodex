/**
 * VerifiedSystemsPanel - Phase 1
 *
 * Verified / deterministic technical depth only.
 * Astrology appears here only when the full ephemeris contract is verified.
 * Estimated, date-only, legacy, and unavailable astrology belong in inspectable
 * surfaces with explicit uncertainty labels, not in this verified panel.
 */

import type { VerifiedSystems, AstrologyDataStatus } from "@soulcodex/core";
import {
  buildVerifiedSystemMethodSummaries,
  type VerifiedSystemMethodSummary,
} from "@/lib/verifiedSystemMethodSummary";

interface VerifiedSystemsPanelProps {
  systems: VerifiedSystems;
  astrologyStatus: AstrologyDataStatus;
}

function MethodDisclosure({
  summary,
}: {
  summary: VerifiedSystemMethodSummary;
}) {
  return (
    <details
      data-verified-system-method={summary.id}
      style={{
        marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.025)",
        padding: "0.7rem 0.8rem",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          color: "var(--sc-ivory-soft)",
          fontSize: "0.78rem",
          fontWeight: 600,
        }}
      >
        Why this system is included
      </summary>
      <div
        style={{
          marginTop: "0.65rem",
          display: "grid",
          gap: "0.45rem",
          color: "var(--sc-stone)",
          fontSize: "0.75rem",
          lineHeight: 1.55,
        }}
      >
        <div>
          <strong style={{ color: "var(--sc-teal)" }}>{summary.statusLabel}</strong>
        </div>
        <div>{summary.basis}</div>
        <div>{summary.interpretationBoundary}</div>
      </div>
    </details>
  );
}

export default function VerifiedSystemsPanel({
  systems,
  astrologyStatus
}: VerifiedSystemsPanelProps) {
  const astrology = systems.astrology;
  const methodSummaries = buildVerifiedSystemMethodSummaries(
    systems,
    astrologyStatus,
  );
  const methodSummaryById = new Map(
    methodSummaries.map((summary) => [summary.id, summary]),
  );
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

          {methodSummaryById.get("astrology") && (
            <MethodDisclosure summary={methodSummaryById.get("astrology")!} />
          )}

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
                data-verified-system-card
                style={{
                  padding: "0.9rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
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
                data-verified-system-card
                style={{
                  padding: "0.9rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
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
          {methodSummaryById.get("numerology") && (
            <MethodDisclosure summary={methodSummaryById.get("numerology")!} />
          )}
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
            {typeof systems.numerology.expressionNumber === "number" && (
              <div
                data-verified-system-card
                style={{
                  padding: "0.9rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Expression</div>
                <div style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", fontWeight: 600 }}>
                  {systems.numerology.expressionNumber}
                </div>
              </div>
            )}
            {typeof systems.numerology.soulUrgeNumber === "number" && (
              <div
                data-verified-system-card
                style={{
                  padding: "0.9rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Soul Urge</div>
                <div style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", fontWeight: 600 }}>
                  {systems.numerology.soulUrgeNumber}
                </div>
              </div>
            )}
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
          {methodSummaryById.get("human-design") && (
            <MethodDisclosure summary={methodSummaryById.get("human-design")!} />
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {systems.humanDesign.type && (
              <div
                data-verified-system-card
                style={{
                  padding: "0.9rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "var(--sc-stone)" }}>Type</div>
                <div style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", fontWeight: 600 }}>
                  {systems.humanDesign.type}
                </div>
              </div>
            )}
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

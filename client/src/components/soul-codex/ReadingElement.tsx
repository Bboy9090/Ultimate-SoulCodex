/**
 * ReadingElement Component
 *
 * Renders a single reading element with the direct communication structure:
 * Headline → Mechanism → Protection → How Others See It → Gift → Cost → Action
 *
 * Supports three display modes and marks verified vs provisional data.
 * All text speaks directly to the user, not analyzing from distance.
 */

import { useState } from "react";
import type { ReadingElement as ReadingElementType, DisplayMode } from "@soulcodex/core";

interface ReadingElementProps {
  element: ReadingElementType;
  mode: DisplayMode;
  showEvidence?: boolean;
}

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginTop: "1rem" }}>
    <p
      style={{
        margin: "0 0 0.5rem 0",
        fontSize: "0.85rem",
        textTransform: "uppercase",
        color: "var(--sc-gold)",
        opacity: 0.9,
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: 0,
        fontSize: "0.95rem",
        color: "var(--sc-ivory)",
        lineHeight: 1.7,
      }}
    >
      {children}
    </p>
  </div>
);

export default function ReadingElement({
  element,
  mode,
  showEvidence = false,
}: ReadingElementProps) {
  const [expandEvidence, setExpandEvidence] = useState(showEvidence);

  const isVerified = element.verified;
  const showConfidence = mode !== "essential";
  const isEssential = mode === "essential";

  return (
    <div
      style={{
        marginBottom: "2.5rem",
        padding: "2rem",
        background: isVerified
          ? "rgba(212,168,95,0.08)"
          : "rgba(150,150,150,0.05)",
        borderLeft: isVerified
          ? "4px solid rgba(212,168,95,0.6)"
          : "4px solid rgba(150,150,150,0.3)",
        borderRadius: "8px",
      }}
    >
      {/* Verified Badge */}
      {!isVerified && (
        <div
          style={{
            display: "inline-block",
            marginBottom: "1rem",
            padding: "0.3rem 0.8rem",
            background: "rgba(150,150,150,0.2)",
            borderRadius: "4px",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            color: "var(--sc-stone)",
            letterSpacing: "0.05em",
          }}
        >
          Provisional
        </div>
      )}

      {/* Headline - Direct communication */}
      <h3
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--sc-gold)",
          lineHeight: 1.5,
        }}
      >
        {element.headline}
      </h3>

      {/* Core Sections - in order */}
      <Section label="Why this happens">
        {element.mechanism}
      </Section>

      <Section label="What you may be protecting">
        {element.protection}
      </Section>

      {/* How Others See It - only if not essential mode */}
      {!isEssential && (
        <Section label="How you appear to others">
          {element.howOthersSeeit}
        </Section>
      )}

      {/* Gift */}
      <Section label="The gift">
        {element.gift}
      </Section>

      {/* Cost */}
      <Section label="The cost when overused">
        {element.cost}
      </Section>

      {/* Action - highlighted */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(212,168,95,0.12)",
          borderLeft: "3px solid var(--sc-gold)",
          borderRadius: "4px",
        }}
      >
        <p
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            color: "var(--sc-gold)",
            letterSpacing: "0.05em",
          }}
        >
          One grounded next step
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.95rem",
            color: "var(--sc-ivory)",
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          {element.action}
        </p>
      </div>

      {/* Evidence & Confidence Footer */}
      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(212,168,95,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {/* Evidence Drawer Toggle */}
          {element.evidence.length > 0 && (
            <button
              onClick={() => setExpandEvidence(!expandEvidence)}
              style={{
                background: "none",
                border: "none",
                color: "var(--sc-gold)",
                cursor: "pointer",
                fontSize: "0.85rem",
                textDecoration: "underline",
                padding: 0,
                fontWeight: 500,
              }}
            >
              {expandEvidence ? "Hide" : "Show"} evidence ({element.evidence.length})
            </button>
          )}

          {/* Verified Indicator */}
          {isVerified && (
            <span style={{ color: "var(--sc-gold)", opacity: 0.8 }}>
              ✓ Verified
            </span>
          )}
        </div>

        {/* Confidence Badge */}
        {showConfidence && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--sc-stone)",
            }}
          >
            <span>Confidence:</span>
            <div
              style={{
                display: "inline-block",
                width: "50px",
                height: "6px",
                background: "rgba(150,150,150,0.3)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${element.confidence}%`,
                  height: "100%",
                  background:
                    element.confidence >= 80
                      ? "var(--sc-gold)"
                      : element.confidence >= 60
                        ? "var(--sc-stone)"
                        : "rgba(200,100,100,0.8)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span>{element.confidence}%</span>
          </div>
        )}
      </div>

      {/* Evidence Drawer (Collapsible) */}
      {expandEvidence && element.evidence.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "6px",
            fontSize: "0.8rem",
            color: "var(--sc-stone)",
            fontFamily: "monospace",
          }}
        >
          <p
            style={{
              margin: "0 0 0.75rem 0",
              textTransform: "uppercase",
              opacity: 0.7,
              fontSize: "0.75rem",
            }}
          >
            Evidence
          </p>
          {element.evidence.map((ev, i) => (
            <div
              key={i}
              style={{
                marginBottom: "0.75rem",
                paddingBottom: "0.75rem",
                borderBottom:
                  i < element.evidence.length - 1
                    ? "1px solid rgba(150,150,150,0.2)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                  {ev.source}
                </span>
                {ev.verified && <span style={{ opacity: 0.7 }}>✓</span>}
              </div>
              <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>
                {ev.description}
              </p>
              {ev.value && (
                <p style={{ margin: "0.25rem 0 0 0", opacity: 0.6 }}>
                  Value: {ev.value}
                </p>
              )}
              {ev.confidence !== undefined && (
                <p style={{ margin: "0.25rem 0 0 0", opacity: 0.6 }}>
                  Confidence: {ev.confidence}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

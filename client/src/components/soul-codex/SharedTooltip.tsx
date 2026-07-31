/**
 * SharedTooltip - Phase 4
 *
 * Reusable tooltip for common patterns across Soul Codex
 * Examples: "2-system synthesis", "estimated calculation", "human design profile"
 *
 * Single source of truth for pattern explanations
 */

import { useState } from "react";

export type TooltipPattern =
  | "2-system-synthesis"
  | "3-system-synthesis"
  | "estimated-calculation"
  | "verified-ephemeris"
  | "legacy-approximation"
  | "human-design-profile"
  | "life-path-number"
  | "astrological-house"
  | "birth-time-sensitivity"
  | "date-only-limitation";

interface SharedTooltipProps {
  pattern: TooltipPattern;
  children?: React.ReactNode;
  inline?: boolean;
}

const tooltips: Record<TooltipPattern, { label: string; explanation: string }> = {
  "2-system-synthesis": {
    label: "2-System Synthesis",
    explanation:
      "Combines astrology and numerology. Missing human design or full verification limits archetype depth.",
  },
  "3-system-synthesis": {
    label: "3-System Synthesis",
    explanation:
      "Full synthesis: astrology + numerology + human design. All major systems verified and integrated.",
  },
  "estimated-calculation": {
    label: "Estimated Calculation",
    explanation:
      "Calculated from available data without full verification. May change with additional information.",
  },
  "verified-ephemeris": {
    label: "Verified Ephemeris",
    explanation: "Calculated from precise birth time and location. Most accurate astronomical position.",
  },
  "legacy-approximation": {
    label: "Legacy Approximation",
    explanation:
      "Simplified calculation when birth time is unavailable. Less accurate than verified ephemeris.",
  },
  "human-design-profile": {
    label: "Human Design Profile",
    explanation:
      "Individual life strategy determined by birth time, date, and location. Example: Reflector 2/5.",
  },
  "life-path-number": {
    label: "Life Path Number",
    explanation:
      "Calculated from birth date numerology. Represents core life purpose and principal lessons.",
  },
  "astrological-house": {
    label: "Astrological House",
    explanation:
      "Twelve sections of the chart representing different life areas. Requires accurate birth time.",
  },
  "birth-time-sensitivity": {
    label: "Birth Time Sensitivity",
    explanation:
      "Rising sign and house placements shift ~1 degree per 4 minutes of birth time error. Precise time is crucial.",
  },
  "date-only-limitation": {
    label: "Date Only (No Time)",
    explanation:
      "When birth time is unknown, moon sign and rising sign cannot be calculated. Sun sign remains accurate.",
  },
};

export default function SharedTooltip({ pattern, children, inline = false }: SharedTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltip = tooltips[pattern];

  if (inline) {
    // Inline mode: hover tooltip without box
    return (
      <span
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children || (
          <span style={{ borderBottom: "1px dotted var(--sc-gold)", cursor: "help" }}>
            {tooltip.label}
          </span>
        )}

        {isOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "120%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.9)",
              color: "var(--sc-ivory)",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
              zIndex: 1000,
              pointerEvents: "none",
              border: "1px solid rgba(212,168,95,0.3)",
            }}
          >
            {tooltip.explanation}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid rgba(0,0,0,0.9)",
              }}
            />
          </div>
        )}
      </span>
    );
  }

  // Block mode: labeled box with toggle
  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: "var(--sc-teal)",
          fontSize: "0.85rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: 0,
          fontWeight: 500,
        }}
      >
        <span>{isOpen ? "▼" : "▶"}</span>
        {tooltip.label}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem 1rem",
            background: "rgba(76,175,80,0.08)",
            border: "1px solid rgba(76,175,80,0.2)",
            borderRadius: "6px",
            fontSize: "0.85rem",
            color: "var(--sc-ivory)",
            lineHeight: "1.6",
          }}
        >
          {tooltip.explanation}
        </div>
      )}
    </div>
  );
}

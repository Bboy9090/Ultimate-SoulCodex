/**
 * LimitationsPanel Component
 *
 * Groups data quality limitations into user-facing categories
 * instead of displaying 35 technical notes.
 *
 * Categories:
 * - Time Dependent: Rising, Houses, Lunar phenomena
 * - Name Dependent: Expression, Soul Urge numbers
 * - Data Quality: Accuracy notes and caveats
 */

import type { SoulProfile } from "@soulcodex/core";

interface LimitationsPanelProps {
  profile: SoulProfile | null;
}

export default function LimitsPanel({ profile }: LimitationsPanelProps) {
  const timeKnown = (profile as any)?.timeKnown ?? false;
  const name = (profile as any)?.name || "";

  const categories = {
    timeDependent: [
      "Rising sign is estimated without exact birth time",
      "Houses and planetary house placements require precise time",
      "Lunar nodes and lunar aspects are approximate",
    ].filter(() => !timeKnown),

    nameDependent: [
      "Expression number requires verified full name",
      "Soul Urge number requires verified full name",
      "Personality number requires verified full name",
    ].filter(() => !name || name === "Unknown"),

    dataQuality: [
      "All calculations use ephemeris data as of 2026",
      "Astrology is symbolic interpretation, not prediction",
      "Human Design type requires exact birth time to within 1 minute",
    ],
  };

  const hasLimitations =
    categories.timeDependent.length > 0 ||
    categories.nameDependent.length > 0 ||
    categories.dataQuality.length > 0;

  if (!hasLimitations) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: "rgba(150,150,150,0.08)",
        borderLeft: "3px solid rgba(150,150,150,0.4)",
        borderRadius: "8px",
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem 0",
          fontSize: "0.95rem",
          textTransform: "uppercase",
          color: "var(--sc-stone)",
          letterSpacing: "0.05em",
        }}
      >
        Data Quality Notes
      </h3>

      {/* Time Dependent */}
      {categories.timeDependent.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <p
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              color: "var(--sc-stone)",
              opacity: 0.7,
            }}
          >
            ⏰ Time-Dependent
          </p>
          <ul style={{ margin: "0 0 0 1.5rem", padding: 0, fontSize: "0.9rem" }}>
            {categories.timeDependent.map((limit, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "0.4rem",
                  color: "var(--sc-ivory)",
                  opacity: 0.9,
                }}
              >
                {limit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Name Dependent */}
      {categories.nameDependent.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <p
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              color: "var(--sc-stone)",
              opacity: 0.7,
            }}
          >
            📝 Name Verification
          </p>
          <ul style={{ margin: "0 0 0 1.5rem", padding: 0, fontSize: "0.9rem" }}>
            {categories.nameDependent.map((limit, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "0.4rem",
                  color: "var(--sc-ivory)",
                  opacity: 0.9,
                }}
              >
                {limit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Quality */}
      {categories.dataQuality.length > 0 && (
        <div>
          <p
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              color: "var(--sc-stone)",
              opacity: 0.7,
            }}
          >
            ℹ️ General Notes
          </p>
          <ul style={{ margin: "0 0 0 1.5rem", padding: 0, fontSize: "0.9rem" }}>
            {categories.dataQuality.map((limit, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "0.4rem",
                  color: "var(--sc-ivory)",
                  opacity: 0.9,
                }}
              >
                {limit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

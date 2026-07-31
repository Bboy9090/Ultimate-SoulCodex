/**
 * DominancePanel
 *
 * Shows relative influence scores (not clinical measurements)
 */

import type { DominantSignal } from "@soulcodex/core";

interface DominancePanelProps {
  dominance: DominantSignal[];
}

const influenceColors: Record<string, string> = {
  "Very High": "var(--sc-gold)",
  High: "var(--sc-teal)",
  Moderate: "var(--sc-violet)",
  Low: "var(--sc-stone)",
};

export default function DominancePanel({ dominance }: DominancePanelProps) {
  return (
    <div
      style={{
        padding: "2rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(212,168,95,0.2)",
        borderRadius: "12px",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: "1rem",
          textTransform: "uppercase",
          color: "var(--sc-gold)",
          margin: "0 0 1.5rem 0",
        }}
      >
        Dominant Influences
      </h2>

      {/* Disclaimer */}
      <div
        style={{
          padding: "1rem",
          background: "rgba(212,168,95,0.08)",
          border: "1px dashed rgba(212,168,95,0.2)",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          fontSize: "0.8rem",
          color: "var(--sc-stone)",
          lineHeight: "1.5",
        }}
      >
        These rankings reflect relative influence within this Soul Codex synthesis. They are not clinical or
        population-based measurements.
      </div>

      {/* Signals Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {dominance.map((signal, idx) => (
          <div
            key={idx}
            style={{
              padding: "1.5rem",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${influenceColors[signal.influence]}40`,
              borderRadius: "12px",
            }}
          >
            {/* Theme */}
            <h3
              style={{
                fontSize: "0.9rem",
                color: influenceColors[signal.influence],
                textTransform: "uppercase",
                margin: "0 0 0.75rem 0",
              }}
            >
              {signal.theme}
            </h3>

            {/* Influence Level */}
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: influenceColors[signal.influence],
                margin: "0 0 1rem 0",
              }}
            >
              {signal.influence}
            </div>

            {/* Reasoning */}
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--sc-stone)",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              {signal.reasoning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

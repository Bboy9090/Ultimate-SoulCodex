/**
 * InteractionCard
 *
 * Shows how two systems interact (reinforcement/balance/conflict)
 * Visual: InputA → [relationship] → InputB
 */

import type { InteractionInsight } from "@soulcodex/core";

interface InteractionCardProps {
  interaction: InteractionInsight;
}

const interactionStyles: Record<
  string,
  { color: string; bg: string; operator: string }
> = {
  reinforcement: {
    color: "var(--sc-teal)",
    bg: "rgba(0,150,136,0.08)",
    operator: "+",
  },
  balance: {
    color: "var(--sc-violet)",
    bg: "rgba(168,85,247,0.08)",
    operator: "⇄",
  },
  conflict: {
    color: "var(--sc-amber)",
    bg: "rgba(255,152,0,0.08)",
    operator: "×",
  },
};

export default function InteractionCard({ interaction }: InteractionCardProps) {
  const styles = interactionStyles[interaction.relationship];

  return (
    <div
      style={{
        padding: "1.5rem",
        background: styles.bg,
        border: `1px solid ${styles.color}30`,
        borderRadius: "12px",
      }}
    >
      {/* Title */}
      <h4
        style={{
          fontSize: "0.9rem",
          color: styles.color,
          textTransform: "uppercase",
          margin: "0 0 1rem 0",
        }}
      >
        {interaction.title}
      </h4>

      {/* Interaction Visualization */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
          padding: "1rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "8px",
        }}
      >
        {/* Input A */}
        <div
          style={{
            flex: 1,
            padding: "0.75rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "6px",
            fontSize: "0.85rem",
            color: "var(--sc-ivory)",
            textAlign: "center",
          }}
        >
          {interaction.inputA.detail}
        </div>

        {/* Operator */}
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: styles.color,
            minWidth: "3rem",
            textAlign: "center",
          }}
        >
          {styles.operator}
        </div>

        {/* Input B */}
        <div
          style={{
            flex: 1,
            padding: "0.75rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "6px",
            fontSize: "0.85rem",
            color: "var(--sc-ivory)",
            textAlign: "center",
          }}
        >
          {interaction.inputB.detail}
        </div>
      </div>

      {/* Result */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "var(--sc-stone)",
            marginBottom: "0.5rem",
          }}
        >
          Result
        </div>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--sc-ivory)",
            margin: 0,
            lineHeight: "1.6",
            fontWeight: 600,
          }}
        >
          {interaction.result}
        </p>
      </div>

      {/* Explanation */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "var(--sc-stone)",
            marginBottom: "0.5rem",
          }}
        >
          How This Works
        </div>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--sc-stone)",
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          {interaction.explanation}
        </p>
      </div>

      {/* Behavioral Consequence */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "var(--sc-stone)",
            marginBottom: "0.5rem",
          }}
        >
          Behavioral Pattern
        </div>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--sc-ivory)",
            margin: 0,
            lineHeight: "1.6",
            fontStyle: "italic",
          }}
        >
          {interaction.behavior}
        </p>
      </div>

      {/* Recommended Action */}
      <div
        style={{
          padding: "1rem",
          background: `${styles.color}15`,
          borderLeft: `3px solid ${styles.color}`,
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: styles.color,
            marginBottom: "0.5rem",
          }}
        >
          Recommended Action
        </div>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--sc-ivory)",
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          {interaction.action}
        </p>
      </div>

      {/* Strength Indicator */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.75rem",
          color: "var(--sc-stone)",
        }}
      >
        Strength:{" "}
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "0.4rem",
                height: "0.4rem",
                borderRadius: "50%",
                background: i < interaction.strength ? styles.color : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

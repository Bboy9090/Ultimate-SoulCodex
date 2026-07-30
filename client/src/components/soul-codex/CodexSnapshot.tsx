/**
 * CodexSnapshot
 *
 * The first viewport: complete reading understanding in 30 seconds
 * Shows identity, core pattern, gift, tension, next action
 */

import type { CodexSnapshot } from "@soulcodex/core";

interface CodexSnapshotProps {
  snapshot: CodexSnapshot;
  archetype: string;
}

export default function CodexSnapshotComponent({ snapshot, archetype }: CodexSnapshotProps) {
  return (
    <div
      style={{
        padding: "2rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(212,168,95,0.2)",
        borderRadius: "20px",
        marginBottom: "2rem",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", color: "var(--sc-ivory)", margin: "0 0 0.5rem 0" }}>
          {archetype}
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", margin: 0 }}>
          {snapshot.coreFormula.join(" · ")}
        </p>
      </div>

      {/* 2x2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Core Gift */}
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(0,150,136,0.1)",
            borderLeft: "3px solid var(--sc-teal)",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>
            Core Gift
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.5" }}>
            {snapshot.coreGift}
          </p>
        </div>

        {/* Primary Tension */}
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(255,152,0,0.1)",
            borderLeft: "3px solid var(--sc-amber)",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>
            Primary Tension
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.5" }}>
            {snapshot.primaryTension}
          </p>
        </div>
      </div>

      {/* Central Pattern (full width) */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(212,168,95,0.05)",
          border: "1px solid rgba(212,168,95,0.15)",
          borderRadius: "12px",
          marginBottom: "2rem",
        }}
      >
        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
          Your Central Pattern
        </div>
        <p style={{ fontSize: "1rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.6" }}>
          {snapshot.centralPattern}
        </p>
      </div>

      {/* Next Action (primary CTA) */}
      <div
        style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, rgba(212,168,95,0.2) 0%, rgba(212,168,95,0.1) 100%)",
          border: "2px solid rgba(212,168,95,0.3)",
          borderRadius: "12px",
        }}
      >
        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
          Next Action
        </div>
        <p style={{ fontSize: "1.05rem", color: "var(--sc-ivory)", fontWeight: 600, margin: 0, lineHeight: "1.6" }}>
          {snapshot.nextAction}
        </p>
      </div>
    </div>
  );
}

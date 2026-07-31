/**
 * EngineCard
 *
 * Individual engine insight with consistent grammar:
 * Observation, Meaning, Gift, Shadow, Action, Evidence
 */

import type { EngineInsight, ReadingDepth } from "@soulcodex/core";
import { IconChevronDown } from "../Icons";

interface EngineCardProps {
  engine: EngineInsight;
  isExpanded: boolean;
  onToggle: () => void;
  depth: ReadingDepth;
}

const engineColors: Record<string, { color: string; bg: string }> = {
  identity: { color: "var(--sc-gold)", bg: "rgba(212,168,95,0.1)" },
  emotional: { color: "var(--sc-violet)", bg: "rgba(168,85,247,0.1)" },
  decision: { color: "var(--sc-cyan)", bg: "rgba(34,211,238,0.1)" },
  relationship: { color: "var(--sc-rose)", bg: "rgba(244,63,94,0.1)" },
  stress: { color: "var(--sc-amber)", bg: "rgba(255,152,0,0.1)" },
  work: { color: "var(--sc-teal)", bg: "rgba(0,150,136,0.1)" },
  shadow: { color: "var(--sc-indigo)", bg: "rgba(99,102,241,0.1)" },
  growth: { color: "var(--sc-lime)", bg: "rgba(132,204,22,0.1)" },
};

export default function EngineCard({ engine, isExpanded, onToggle, depth }: EngineCardProps) {
  const colors = engineColors[engine.type] || engineColors.identity;

  return (
    <div
      style={{
        padding: "1.5rem",
        background: colors.bg,
        border: `1px solid ${colors.color}20`,
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={onToggle}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isExpanded ? "1.5rem" : 0 }}>
        <div>
          <h3 style={{ fontSize: "0.95rem", color: colors.color, textTransform: "uppercase", margin: "0 0 0.5rem 0" }}>
            {engine.title}
          </h3>
          {!isExpanded && (
            <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", margin: 0, lineHeight: "1.5" }}>
              {engine.summary}
            </p>
          )}
        </div>
        <IconChevronDown
          size={20}
          style={{
            color: colors.color,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
            marginLeft: "1rem",
          }}
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Observation */}
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>
              Observation
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.6" }}>
              {engine.observation}
            </p>
          </div>

          {/* Meaning */}
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>
              Meaning
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.6" }}>
              {engine.meaning}
            </p>
          </div>

          {/* Gift */}
          <div
            style={{
              padding: "1rem",
              background: `${colors.color}15`,
              borderLeft: `3px solid ${colors.color}`,
              borderRadius: "6px",
            }}
          >
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: colors.color, marginBottom: "0.5rem" }}>
              Gift
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.6" }}>
              {engine.gift}
            </p>
          </div>

          {/* Shadow */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(255,152,0,0.08)",
              borderLeft: "3px solid var(--sc-amber)",
              borderRadius: "6px",
            }}
          >
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-amber)", marginBottom: "0.5rem" }}>
              Shadow
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.6" }}>
              {engine.shadow}
            </p>
          </div>

          {/* Action */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(212,168,95,0.1)",
              borderLeft: "3px solid var(--sc-gold)",
              borderRadius: "6px",
            }}
          >
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.5rem" }}>
              Action
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-ivory)", margin: 0, lineHeight: "1.6" }}>
              {engine.action}
            </p>
          </div>

          {/* Evidence */}
          {engine.evidence.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>
                Supporting Evidence ({engine.evidence.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {engine.evidence.slice(0, 4).map((fact, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.4rem 0.75rem",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "4px",
                      color: "var(--sc-stone)",
                    }}
                  >
                    {fact.detail}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Badge */}
          <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)" }}>
            Confidence:{" "}
            <span style={{ color: engine.confidence === "high" ? "var(--sc-teal)" : "var(--sc-amber)" }}>
              {engine.confidence.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

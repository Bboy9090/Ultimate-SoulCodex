/**
 * SoulCodexReadingDisplay
 *
 * Progressive disclosure reader supporting three depths:
 * - Essential: snapshot + 3 drivers + 1 reinforcement + growth + action
 * - Complete: all engines + interactions + dominance
 * - Technical: exact degrees, calculations, metadata
 */

import { useState } from "react";
import type { SoulCodexReading, ReadingDepth } from "@soulcodex/core";
import { getVisibilityRules } from "@soulcodex/core";

import CodexSnapshot from "./CodexSnapshot";
import VerifiedSystemsPanel from "./VerifiedSystemsPanel";
import EngineCard from "./EngineCard";
import InteractionCard from "./InteractionCard";
import DominancePanel from "./DominancePanel";
import ActionPlanCard from "./ActionPlanCard";
import TechnicalAppendix from "./TechnicalAppendix";
import ConfidenceBadge from "../ConfidenceBadge";

interface SoulCodexReadingDisplayProps {
  reading: SoulCodexReading;
  initialDepth?: ReadingDepth;
}

export default function SoulCodexReadingDisplay({
  reading,
  initialDepth = "complete",
}: SoulCodexReadingDisplayProps) {
  const [depth, setDepth] = useState<ReadingDepth>(initialDepth);
  const [expandedEngines, setExpandedEngines] = useState<Set<string>>(new Set());

  const visibility = getVisibilityRules(depth);

  const toggleEngine = (engineId: string) => {
    const newExpanded = new Set(expandedEngines);
    if (newExpanded.has(engineId)) {
      newExpanded.delete(engineId);
    } else {
      newExpanded.add(engineId);
    }
    setExpandedEngines(newExpanded);
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Reading Depth Toggle */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          justifyContent: "center",
          padding: "1rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
        }}
      >
        {(["essential", "complete", "technical"] as const).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDepth(d);
              setExpandedEngines(new Set()); // Reset expanded sections on depth change
            }}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: depth === d ? "2px solid var(--sc-gold)" : "1px solid rgba(212,168,95,0.3)",
              background: depth === d ? "rgba(212,168,95,0.15)" : "transparent",
              color: depth === d ? "var(--sc-gold)" : "var(--sc-stone)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: depth === d ? 600 : 400,
              textTransform: "capitalize",
              transition: "all 0.2s ease",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Confidence Badge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <ConfidenceBadge
          badge={reading.meta.confidence === "high" ? "verified" : reading.meta.confidence === "medium" ? "partial" : "unverified"}
          reason={`Birth time: ${reading.meta.birthData.time ? "known" : "unknown"}`}
        />
      </div>

      {/* Snapshot (all depths) */}
      {visibility.snapshot && (
        <div style={{ marginBottom: "3rem" }}>
          <CodexSnapshot snapshot={reading.snapshot} archetype={reading.snapshot.archetype} />
        </div>
      )}

      {/* Verified Systems (technical only) */}
      {visibility.verifiedSystems && (
        <div style={{ marginBottom: "3rem" }}>
          <VerifiedSystemsPanel systems={reading.verifiedSystems} />
        </div>
      )}

      {/* Engines */}
      {(depth === "complete" || depth === "essential") && (
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "1.5rem" }}>
            Core Engines
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {reading.engines.slice(0, visibility.topEngines || reading.engines.length).map((engine) => (
              <EngineCard
                key={engine.id}
                engine={engine}
                isExpanded={expandedEngines.has(engine.id)}
                onToggle={() => toggleEngine(engine.id)}
                depth={depth}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interactions */}
      {visibility.interactions && (
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "1.5rem" }}>
            System Interactions
          </h2>

          {reading.interactions.reinforcements.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--sc-teal)", marginBottom: "1rem" }}>Reinforcements</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reading.interactions.reinforcements.slice(0, visibility.topInteractions || undefined).map((interaction, idx) => (
                  <InteractionCard key={idx} interaction={interaction} />
                ))}
              </div>
            </div>
          )}

          {reading.interactions.balances.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--sc-violet)", marginBottom: "1rem" }}>Balances</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reading.interactions.balances.map((interaction, idx) => (
                  <InteractionCard key={idx} interaction={interaction} />
                ))}
              </div>
            </div>
          )}

          {reading.interactions.conflicts.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "var(--sc-amber)", marginBottom: "1rem" }}>Conflicts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reading.interactions.conflicts.map((interaction, idx) => (
                  <InteractionCard key={idx} interaction={interaction} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dominance (complete & technical) */}
      {visibility.dominance && (
        <div style={{ marginBottom: "3rem" }}>
          <DominancePanel dominance={reading.dominance} />
        </div>
      )}

      {/* Action Plan (essential & complete) */}
      {visibility.actionPlan && (
        <div style={{ marginBottom: "3rem" }}>
          <ActionPlanCard actionPlan={reading.actionPlan} />
        </div>
      )}

      {/* Technical Appendix (technical only) */}
      {visibility.technicalAppendix && reading.meta && (
        <div style={{ marginBottom: "3rem" }}>
          <TechnicalAppendix birthData={reading.meta.birthData} meta={reading.meta} />
        </div>
      )}
    </div>
  );
}

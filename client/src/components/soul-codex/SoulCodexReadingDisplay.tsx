/**
 * SoulCodexReadingDisplay - Phase 4 Refactored
 *
 * 11-Section Structured Layout:
 * 1. Header (Name, Archetype, Timestamp)
 * 2. Status Banner (Disclosure - persistent)
 * 3. Core Systems (Astrology, Numerology, Human Design)
 * 4. Core Insight (Mechanism-driven observation)
 * 5. Psychological Mirror (What people see/miss)
 * 6. Core Pattern (Observation, Mechanism, Tension)
 * 7. Gift & Shadow (Distinct capabilities)
 * 8. Actionable Insights (Work, Relationships, Self)
 * 9. System Interactions (Reinforcements, Balances, Conflicts)
 * 10. Dominance & Pattern (System hierarchy)
 * 11. Evidence Drawer (Collapsible, hidden by default)
 *
 * Progressive disclosure with depth toggles
 */

import { useState } from "react";
import type { SoulCodexReading, ReadingDepth } from "@soulcodex/core";
import { getVisibilityRules } from "@soulcodex/core/soul-codex/reading-validator.js";

import CodexHeader from "./CodexHeader";
import DisclosureBanner from "./DisclosureBanner";
import VerifiedSystemsPanel from "./VerifiedSystemsPanel";
import PsychologicalMirror from "./PsychologicalMirror";
import ActionInsights from "./ActionInsights";
import EngineCard from "./EngineCard";
import InteractionCard from "./InteractionCard";
import DominancePanel from "./DominancePanel";
import ActionPlanCard from "./ActionPlanCard";
import TechnicalAppendix from "./TechnicalAppendix";
import EvidenceDrawer from "./EvidenceDrawer";
import SectionContainer from "./SectionContainer";
import SharedTooltip from "./SharedTooltip";
import ResponsiveContainer from "./ResponsiveContainer";

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

  // Determine disclosure mode based on reading data
  const getDisclosureMode = (): "reflective" | "technical" | "mixed" => {
    const hasVerified =
      reading.meta.calculationStatus === "verified_ephemeris" ||
      reading.meta.calculationStatus === "estimated_birth_window";
    const hasLegacy = reading.meta.calculationStatus === "legacy_approximation";

    if (hasVerified && !hasLegacy) return "technical";
    if (hasLegacy) return "mixed";
    return "reflective";
  };

  return (
    <ResponsiveContainer>
      {/* ===== DEPTH TOGGLE (Above sections) ===== */}
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
              setExpandedEngines(new Set());
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
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== SECTION 1: HEADER ===== */}
      {visibility.snapshot && reading.snapshot && (
        <SectionContainer variant="primary">
          <CodexHeader
            subjectName={reading.snapshot.subjectName}
            archetypeName={reading.snapshot.archetype.name}
            archetypeTagline={reading.snapshot.archetype.tagline}
            archetypeStatus={reading.snapshot.archetype.status === "complete" ? "complete" : "provisional"}
            coreInsight={reading.snapshot.coreInsight}
            systems={{
              astrology: reading.snapshot.systemsSummary?.astrology || "",
              numerology: reading.snapshot.systemsSummary?.numerology,
              humanDesign: reading.snapshot.systemsSummary?.humanDesign,
            }}
            coreGift={reading.snapshot.coreGift}
            primaryTension={reading.snapshot.primaryTension}
            groundedAction={reading.snapshot.groundedAction}
            calculationConfidence={reading.meta.confidence === "high" ? "High" : reading.meta.confidence === "medium" ? "Moderate" : "Low"}
            verifiedSystems={reading.meta.verifiedSystems || []}
          />
        </SectionContainer>
      )}

      {/* ===== SECTION 2: STATUS BANNER ===== */}
      <SectionContainer variant="secondary">
        <DisclosureBanner mode={getDisclosureMode()} />
      </SectionContainer>

      {/* ===== SECTION 3: CORE SYSTEMS ===== */}
      {visibility.verifiedSystems && (
        <SectionContainer title="Core Systems" variant="secondary">
          <VerifiedSystemsPanel
            systems={reading.verifiedSystems}
            astrologyStatus={reading.meta.calculationStatus}
          />
        </SectionContainer>
      )}

      {/* ===== SECTION 4: CORE INSIGHT ===== */}
      {visibility.snapshot && reading.snapshot && (
        <SectionContainer title="Core Pattern" subtitle="How your systems create this central dynamic">
          <div style={{ lineHeight: "1.8", color: "var(--sc-ivory)", fontSize: "1rem" }}>
            <p style={{ margin: "0 0 1rem 0" }}>{reading.snapshot.coreInsight}</p>
          </div>
        </SectionContainer>
      )}

      {/* ===== SECTION 5: PSYCHOLOGICAL MIRROR ===== */}
      {visibility.snapshot && reading.snapshot.psychologicalMirror && (
        <SectionContainer title="The Mirror Others See">
          <PsychologicalMirror
            whatPeopleSee={reading.snapshot.psychologicalMirror.whatPeopleSee}
            whatTheyMiss={reading.snapshot.psychologicalMirror.whatTheyMiss}
            howTheyMissIt={reading.snapshot.psychologicalMirror.howTheyMissIt}
          />
        </SectionContainer>
      )}

      {/* ===== SECTION 6: CORE PATTERN ===== */}
      {visibility.snapshot && reading.snapshot.corePattern && (
        <SectionContainer title="Core Pattern Detail">
          <style>{`
            @media (max-width: 767px) {
              [data-pattern-grid] {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1.5rem;
              }
            }
            @media (min-width: 768px) {
              [data-pattern-grid] {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
              }
            }
          `}</style>
          <div data-pattern-grid>
            <div>
              <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
                The Mechanism
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: "1.6", margin: 0 }}>
                {reading.snapshot.corePattern.mechanism}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--sc-amber)", marginBottom: "0.75rem" }}>
                The Tension
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: "1.6", margin: 0 }}>
                {reading.snapshot.corePattern.tension}
              </p>
            </div>
          </div>
        </SectionContainer>
      )}

      {/* ===== SECTION 7: GIFT & SHADOW ===== */}
      {visibility.snapshot && reading.snapshot.corePattern && (
        <SectionContainer title="Gift & Shadow">
          <style>{`
            @media (max-width: 767px) {
              [data-shadow-grid] {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1.5rem;
              }
            }
            @media (min-width: 768px) {
              [data-shadow-grid] {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
              }
            }
          `}</style>
          <div data-shadow-grid>
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(76,175,80,0.08)",
                border: "1px solid rgba(76,175,80,0.2)",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--sc-teal)", marginBottom: "0.75rem" }}>
                Your Gift
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: "1.6", margin: 0 }}>
                {reading.snapshot.corePattern.gift}
              </p>
            </div>
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(233,30,99,0.08)",
                border: "1px solid rgba(233,30,99,0.2)",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--sc-rose)", marginBottom: "0.75rem" }}>
                Shadow Side
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", lineHeight: "1.6", margin: 0 }}>
                {reading.snapshot.corePattern.shadow}
              </p>
            </div>
          </div>
        </SectionContainer>
      )}

      {/* ===== SECTION 8: ACTIONABLE INSIGHTS ===== */}
      {visibility.actionInsights && reading.actionInsights && (
        <SectionContainer title="Actionable Insights">
          <ActionInsights insights={reading.actionInsights} />
        </SectionContainer>
      )}

      {/* ===== SECTION 8.5: ENGINES (Core System Analysis) ===== */}
      {(visibility.engines || visibility.topEngines) && reading.engines && reading.engines.length > 0 && (
        <SectionContainer title="Core Systems Analysis">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {reading.engines
              .slice(0, visibility.topEngines || undefined)
              .map((engine, idx) => (
                <EngineCard key={idx} engine={engine} />
              ))}
          </div>
        </SectionContainer>
      )}

      {/* ===== SECTION 8.7: ACTION PLAN ===== */}
      {visibility.actionPlan && reading.actionPlan && (
        <SectionContainer title="Recommended Next Steps">
          <ActionPlanCard actionPlan={reading.actionPlan} />
        </SectionContainer>
      )}

      {/* ===== SECTION 9: SYSTEM INTERACTIONS ===== */}
      {visibility.interactions && (
        <SectionContainer title="System Interactions" subtitle="How your core systems work together">
          {reading.interactions.reinforcements.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--sc-teal)", marginBottom: "1rem", textTransform: "uppercase" }}>
                ✓ Reinforcements
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reading.interactions.reinforcements
                  .slice(0, visibility.topInteractions || undefined)
                  .map((interaction, idx) => (
                    <InteractionCard key={idx} interaction={interaction} />
                  ))}
              </div>
            </div>
          )}

          {reading.interactions.balances.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--sc-violet)", marginBottom: "1rem", textTransform: "uppercase" }}>
                ⟷ Balances
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reading.interactions.balances.map((interaction, idx) => (
                  <InteractionCard key={idx} interaction={interaction} />
                ))}
              </div>
            </div>
          )}

          {reading.interactions.conflicts.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "var(--sc-amber)", marginBottom: "1rem", textTransform: "uppercase" }}>
                ⚡ Tensions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reading.interactions.conflicts.map((interaction, idx) => (
                  <InteractionCard key={idx} interaction={interaction} />
                ))}
              </div>
            </div>
          )}
        </SectionContainer>
      )}

      {/* ===== SECTION 10: DOMINANCE & PATTERN ===== */}
      {visibility.dominance && reading.dominance && (
        <SectionContainer title="System Dominance">
          <DominancePanel dominance={reading.dominance} />
        </SectionContainer>
      )}

      {/* ===== SECTION 11: EVIDENCE DRAWER ===== */}
      {visibility.technicalAppendix && reading.meta && (
        <SectionContainer title="Verification & Methods" variant="technical">
          <EvidenceDrawer
            evidenceLayers={reading.evidenceLayers || []}
            limitations={reading.limitations || []}
            calculatedAt={reading.meta.generatedAt}
            engineVersion={reading.meta.engineVersion}
            calculationMethod={reading.meta.calculationStatus}
          />

          {/* Technical Appendix (inside drawer) */}
          <div style={{ marginTop: "2rem" }}>
            <TechnicalAppendix birthData={reading.meta.birthData} meta={reading.meta} />
          </div>
        </SectionContainer>
      )}

      {/* Pattern Help */}
      {depth === "technical" && (
        <SectionContainer title="Pattern Reference" variant="technical">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <SharedTooltip pattern="2-system-synthesis" />
            <SharedTooltip pattern="3-system-synthesis" />
            <SharedTooltip pattern="verified-ephemeris" />
            <SharedTooltip pattern="birth-time-sensitivity" />
          </div>
        </SectionContainer>
      )}
    </ResponsiveContainer>
  );
}

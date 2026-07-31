/**
 * SoulCodexReadingGenerator
 *
 * Converts raw analysis data into normalized SoulCodexReading structure
 * Enforces separation of computation from interpretation
 */

import type {
  SoulCodexReading,
  BirthData,
  AstrologyOutput,
  NumerologyOutput,
  HumanDesignOutput,
  EngineInsight,
  InteractionInsight,
  ActionPlan,
  CodexSnapshot,
  DominantSignal,
  EvidenceReference,
} from "../types/soul-codex-reading";

export interface RawAnalysisInput {
  subject: {
    name: string;
    birthData: BirthData;
  };

  astrology: AstrologyOutput;
  numerology: NumerologyOutput;
  humanDesign?: HumanDesignOutput;

  // Pre-computed insights from domain experts
  archetype: {
    title: string;
    description: string;
  };

  engines: {
    identity: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    emotional: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    decision: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    relationship: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    stress: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    work: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    shadow: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
    growth: {
      observation: string;
      meaning: string;
      gift: string;
      shadow: string;
      action: string;
      evidenceFactIds: string[];
    };
  };

  interactions: {
    reinforcements: Array<{
      title: string;
      inputA: { system: string; detail: string };
      inputB: { system: string; detail: string };
      result: string;
      explanation: string;
      behavior: string;
      action: string;
      strength: 1 | 2 | 3 | 4 | 5;
    }>;
    balances: Array<{
      title: string;
      inputA: { system: string; detail: string };
      inputB: { system: string; detail: string };
      result: string;
      explanation: string;
      behavior: string;
      action: string;
      strength: 1 | 2 | 3 | 4 | 5;
    }>;
    conflicts: Array<{
      title: string;
      inputA: { system: string; detail: string };
      inputB: { system: string; detail: string };
      result: string;
      explanation: string;
      behavior: string;
      action: string;
      strength: 1 | 2 | 3 | 4 | 5;
    }>;
  };

  dominance: Array<{
    theme: string;
    influence: "Very High" | "High" | "Moderate" | "Low";
    reasoning: string;
  }>;

  actionPlan: {
    today: string;
    thisWeek: string;
    avoid: string;
    relationshipAction: string;
    workAction: string;
  };

  snapshot: {
    coreFormula: string[];
    centralPattern: string;
    coreGift: string;
    primaryTension: string;
    nextAction: string;
  };
}

export function generateSoulCodexReading(input: RawAnalysisInput): SoulCodexReading {
  const engineTypes: (keyof typeof input.engines)[] = [
    "identity",
    "emotional",
    "decision",
    "relationship",
    "stress",
    "work",
    "shadow",
    "growth",
  ];

  // Build engine insights from structured input
  const engines: EngineInsight[] = engineTypes.map((type, idx) => {
    const engineData = input.engines[type];
    const categoryMap: Record<string, keyof typeof input.engines> = {
      identity: "identity",
      emotional: "emotional",
      decision: "decision",
      relationship: "relationship",
      stress: "stress",
      work: "work",
      shadow: "shadow",
      growth: "growth",
    };

    // Derive summary from observation (max 45 words)
    const summary = engineData.observation.split(/\s+/).slice(0, 25).join(" ");

    return {
      id: `engine-${type}`,
      type: type as any,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Engine`,
      summary,
      observation: engineData.observation,
      meaning: engineData.meaning,
      gift: engineData.gift,
      shadow: engineData.shadow,
      action: engineData.action,
      evidence: engineData.evidenceFactIds.map((factId) => ({
        factId,
        system: "astrology", // Will be derived from fact ID in real implementation
        detail: factId,
      })),
      confidence: deriveConfidence(input.subject.birthData),
    };
  });

  return {
    meta: {
      subjectName: input.subject.name,
      birthData: input.subject.birthData,
      calculationStatus: deriveCalculationStatus(input.subject.birthData),
      confidence: deriveConfidence(input.subject.birthData),
      engineVersion: "1.0.0-soulcodex",
      generatedAt: new Date().toISOString(),
    },

    snapshot: {
      archetype: input.archetype.title,
      coreFormula: input.snapshot.coreFormula,
      centralPattern: input.snapshot.centralPattern,
      coreGift: input.snapshot.coreGift,
      primaryTension: input.snapshot.primaryTension,
      nextAction: input.snapshot.nextAction,
    },

    verifiedSystems: {
      astrology: input.astrology,
      numerology: input.numerology,
      humanDesign: input.humanDesign,
    },

    engines,

    interactions: {
      reinforcements: input.interactions.reinforcements.map((r) => ({
        title: r.title,
        relationship: "reinforcement" as const,
        inputA: { factId: r.inputA.factId || "", system: r.inputA.system as any, detail: r.inputA.detail },
        inputB: { factId: r.inputB.factId || "", system: r.inputB.system as any, detail: r.inputB.detail },
        result: r.result,
        explanation: r.explanation,
        behavior: r.behavior,
        action: r.action,
        strength: r.strength,
      })),
      balances: input.interactions.balances.map((b) => ({
        title: b.title,
        relationship: "balance" as const,
        inputA: { factId: b.inputA.factId || "", system: b.inputA.system as any, detail: b.inputA.detail },
        inputB: { factId: b.inputB.factId || "", system: b.inputB.system as any, detail: b.inputB.detail },
        result: b.result,
        explanation: b.explanation,
        behavior: b.behavior,
        action: b.action,
        strength: b.strength,
      })),
      conflicts: input.interactions.conflicts.map((c) => ({
        title: c.title,
        relationship: "conflict" as const,
        inputA: { factId: c.inputA.factId || "", system: c.inputA.system as any, detail: c.inputA.detail },
        inputB: { factId: c.inputB.factId || "", system: c.inputB.system as any, detail: c.inputB.detail },
        result: c.result,
        explanation: c.explanation,
        behavior: c.behavior,
        action: c.action,
        strength: c.strength,
      })),
    },

    dominance: input.dominance,

    actionPlan: input.actionPlan,
  };
}

function deriveCalculationStatus(birthData: BirthData): "verified" | "partial" | "blocked" {
  if (!birthData.date) return "blocked";
  if (!birthData.time) return "partial";
  return "verified";
}

function deriveConfidence(birthData: BirthData): "high" | "medium" | "low" {
  if (!birthData.date) return "low";
  if (!birthData.time) return "medium";
  return "high";
}

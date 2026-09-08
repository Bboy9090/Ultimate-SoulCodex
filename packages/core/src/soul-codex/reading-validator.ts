/**
 * SoulCodexReading validation layer
 *
 * Quality gates ensure:
 * - No unsupported placements
 * - No missing evidence references
 * - No contradictory claims
 * - Every engine has an action
 * - Every interpretation has confidence
 * - Unknown birth time restrictions applied
 * - No duplicate insights
 * - No vague language
 * - Reading length within mode constraints
 */

import type { SoulCodexReading, ValidationResult, ReadingDepth } from "../types/soul-codex-reading";

const VAGUE_PATTERNS = [
  /a door is opening/i,
  /something is stirring/i,
  /energies are shifting/i,
  /the universe is/i,
  /soon you will/i,
  /may feel/i,
  /might experience/i,
  /possibly/i,
  /perhaps/i,
];

function hasVagueLanguage(text: string): boolean {
  return VAGUE_PATTERNS.some((pattern) => pattern.test(text));
}

function checkUnsupportedPlacements(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  // If birth time is unknown, can't have Ascendant or houses
  if (reading.meta.calculationStatus === "partial" || reading.meta.calculationStatus === "blocked") {
    if (reading.meta.birthData.time === undefined) {
      if (reading.verifiedSystems.astrology.ascendant !== "Unknown") {
        errors.push("Ascendant shown without verified birth time");
      }
      if (reading.verifiedSystems.astrology.houses.length > 0) {
        errors.push("Houses shown without verified birth time");
      }
    }
  }

  return errors;
}

function checkMissingEvidenceReferences(reading: SoulCodexReading): string[] {
  const errors: string[] = [];
  const validFactIds = new Set<string>();

  // Collect all valid fact IDs from verified systems
  Object.values(reading.verifiedSystems).forEach((system) => {
    if (system && typeof system === "object") {
      Object.entries(system).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          validFactIds.add(`${key}`);
        }
      });
    }
  });

  // Check engines
  reading.engines.forEach((engine) => {
    engine.evidence.forEach((ref) => {
      if (!validFactIds.has(ref.factId)) {
        errors.push(`Engine "${engine.title}" references undefined fact: ${ref.factId}`);
      }
    });
  });

  // Check interactions
  [...reading.interactions.reinforcements, ...reading.interactions.balances, ...reading.interactions.conflicts].forEach(
    (interaction) => {
      if (!validFactIds.has(interaction.inputA.factId)) {
        errors.push(`Interaction "${interaction.title}" references undefined fact: ${interaction.inputA.factId}`);
      }
      if (!validFactIds.has(interaction.inputB.factId)) {
        errors.push(`Interaction "${interaction.title}" references undefined fact: ${interaction.inputB.factId}`);
      }
    }
  );

  return errors;
}

function checkContradictoryClaims(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  // Check if dominance claims conflict with interaction strengths
  const reinforcementStrengths = reading.interactions.reinforcements.map((r) => r.strength);
  const highReinforcements = reinforcementStrengths.filter((s) => s >= 4).length;

  if (highReinforcements === 0 && reading.dominance.some((d) => d.influence === "Very High")) {
    errors.push("Dominance signals marked 'Very High' but no strong reinforcements detected");
  }

  return errors;
}

function checkEveryEngineHasAction(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  reading.engines.forEach((engine) => {
    if (!engine.action || engine.action.trim().length === 0) {
      errors.push(`Engine "${engine.title}" is missing an action step`);
    }
    if (engine.action.length > 150) {
      errors.push(`Engine "${engine.title}" action is too verbose (>${150} chars)`);
    }
  });

  return errors;
}

function checkEveryInterpretationHasConfidence(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  reading.engines.forEach((engine) => {
    if (!engine.confidence || !["high", "medium", "low"].includes(engine.confidence)) {
      errors.push(`Engine "${engine.title}" has invalid confidence level`);
    }
  });

  return errors;
}

function checkUnknownBirthTimeRestrictions(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  if (reading.meta.calculationStatus !== "verified" && !reading.meta.birthData.time) {
    // These should be disabled or heavily caveated
    if (reading.engines.some((e) => e.type === "identity" && e.evidence.length === 0)) {
      errors.push("Identity engine lacks evidence; missing birth time should reduce confidence");
    }

    // Human Design requires precise birth time
    if (reading.verifiedSystems.humanDesign) {
      if (!reading.meta.birthData.time) {
        errors.push("Human Design displayed without verified birth time");
      }
    }
  }

  return errors;
}

function checkNoDuplicateInsights(reading: SoulCodexReading): string[] {
  const errors: string[] = [];
  const seenSummaries = new Map<string, string>();

  reading.engines.forEach((engine) => {
    const summary = engine.summary.toLowerCase();
    if (seenSummaries.has(summary)) {
      errors.push(
        `Duplicate insight: "${engine.title}" and "${seenSummaries.get(summary)}" have nearly identical summaries`
      );
    }
    seenSummaries.set(summary, engine.title);
  });

  return errors;
}

function checkNoVagueLanguage(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  reading.engines.forEach((engine) => {
    if (hasVagueLanguage(engine.observation)) {
      errors.push(`Engine "${engine.title}" observation contains vague language`);
    }
    if (hasVagueLanguage(engine.meaning)) {
      errors.push(`Engine "${engine.title}" meaning contains vague language`);
    }
  });

  reading.interactions.reinforcements.forEach((int) => {
    if (hasVagueLanguage(int.explanation)) {
      errors.push(`Reinforcement "${int.title}" contains vague language`);
    }
  });

  return errors;
}

function checkReadingLengthWithinMode(reading: SoulCodexReading): string[] {
  const errors: string[] = [];

  // Estimate word count
  const textContent = [
    reading.snapshot.centralPattern,
    ...reading.engines.map((e) => e.summary + " " + e.observation),
    ...reading.interactions.reinforcements.map((i) => i.explanation),
  ]
    .join(" ")
    .split(/\s+/).length;

  // Complete mode should be 2000-3500 words
  if (textContent > 4000) {
    errors.push(`Reading exceeds recommended word count for Complete mode (${textContent} words)`);
  }

  // Essential mode should be 500-800 words
  const essentialContent = [reading.snapshot.centralPattern, reading.snapshot.coreGift, reading.snapshot.nextAction]
    .join(" ")
    .split(/\s+/).length;

  if (essentialContent < 100) {
    errors.push(`Essential mode content too brief (${essentialContent} words)`);
  }

  return errors;
}

export function validateReading(reading: SoulCodexReading): ValidationResult {
  const checks = [
    checkUnsupportedPlacements,
    checkMissingEvidenceReferences,
    checkContradictoryClaims,
    checkEveryEngineHasAction,
    checkEveryInterpretationHasConfidence,
    checkUnknownBirthTimeRestrictions,
    checkNoDuplicateInsights,
    checkNoVagueLanguage,
    checkReadingLengthWithinMode,
  ];

  const allErrors = checks.flatMap((check) => {
    try {
      return check(reading);
    } catch (e) {
      return [`Validation check failed: ${e instanceof Error ? e.message : String(e)}`];
    }
  });

  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: [],
  };
}

/**
 * Get visibility rules for different display depths
 */
export function getVisibilityRules(depth: ReadingDepth) {
  switch (depth) {
    case "essential":
      return {
        snapshot: true,
        topEngines: 3,
        topInteractions: 1,
        dominance: false,
        technicalAppendix: false,
        actionPlan: true,
      };

    case "complete":
      return {
        snapshot: true,
        engines: true, // all engines visible but collapsed by default
        interactions: true,
        dominance: true,
        technicalAppendix: false,
        actionPlan: true,
      };

    case "technical":
      return {
        snapshot: true,
        engines: true,
        interactions: true,
        dominance: true,
        verifiedSystems: true, // show exact degrees
        technicalAppendix: true,
        actionPlan: false,
      };
  }
}

/**
 * Soul Codex Reading Generator - Phase 1
 *
 * Architecture rule:
 * if (ephemerisResult.status === "verified_ephemeris") {
 *   hideLegacyApproximation();
 *   useVerifiedNatalData();
 * }
 *
 * Never show legacy approximations alongside verified ephemeris.
 * Never invent Moon or Rising signs when exact data is available.
 */

import type {
  SoulCodexReading,
  AstrologyDataStatus,
  VerifiedSystems,
  AstrologyOutput,
} from "./soul-codex-reading-types.js";
import type { BirthData } from "./types.js";

export interface RawAnalysisInput {
  subjectName: string;
  birthData: BirthData;
  ephemeris?: {
    status: AstrologyDataStatus;
    sunSign: string;
    sunDegree: number;
    moonSign?: string;
    moonDegree?: number;
    ascendant?: string;
    ascendantDegree?: number;
    houses?: Array<{ number: number; sign: string; degree: number }>;
    remark?: string;
  };
  numerology?: {
    lifePathNumber: number;
    birthdayNumber: number;
    expressionNumber?: number;
    soulUrgeNumber?: number;
  };
  humanDesign?: {
    profileType: string;
    strategy: string;
    authority: string;
  };
}

/**
 * Phase 1: Establish data integrity
 * Verify all inputs before generating reading
 */
function validateEphemerisInput(
  ephemeris: RawAnalysisInput["ephemeris"]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ephemeris) {
    return { valid: false, errors: ["No ephemeris data provided"] };
  }

  // Rule: If status is "verified_ephemeris", all three must be present
  if (ephemeris.status === "verified_ephemeris") {
    if (!ephemeris.sunSign) errors.push("Verified ephemeris missing Sun sign");
    if (typeof ephemeris.sunDegree !== "number") errors.push("Verified ephemeris missing Sun degree");
    if (!ephemeris.moonSign) errors.push("Verified ephemeris missing Moon sign");
    if (typeof ephemeris.moonDegree !== "number") errors.push("Verified ephemeris missing Moon degree");
    if (!ephemeris.ascendant) errors.push("Verified ephemeris missing Ascendant");
    if (typeof ephemeris.ascendantDegree !== "number") errors.push("Verified ephemeris missing Ascendant degree");
  }

  // Rule: Never invent Moon when date-only
  if (ephemeris.status === "date_only" && ephemeris.moonSign && !ephemeris.remark) {
    errors.push("Date-only reading cannot reliably determine Moon sign without birth time");
  }

  // Rule: Never invent Ascendant from date-only
  if (ephemeris.status === "date_only" && ephemeris.ascendant) {
    errors.push("Ascendant requires exact birth time; date-only calculation is unreliable");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Phase 1: Build AstrologyOutput
 * Apply the core rule: verified data suppresses legacy approximations
 */
function buildAstrologyOutput(
  ephemeris: RawAnalysisInput["ephemeris"]
): AstrologyOutput {
  if (!ephemeris) {
    return {
      status: "unavailable",
      sunSign: "",
      sunDegree: 0,
      moonSign: "",
      moonDegree: 0,
    };
  }

  // Core Phase 1 rule: If ephemeris is verified, use it exclusively
  if (ephemeris.status === "verified_ephemeris") {
    return {
      status: "verified_ephemeris",
      sunSign: ephemeris.sunSign,
      sunDegree: ephemeris.sunDegree,
      moonSign: ephemeris.moonSign || "",
      moonDegree: ephemeris.moonDegree || 0,
      ascendant: ephemeris.ascendant,
      ascendantDegree: ephemeris.ascendantDegree,
      houses: ephemeris.houses,
      remark: "Calculation status: Verified",
    };
  }

  // For estimated_birth_window: show range or possibilities
  if (ephemeris.status === "estimated_birth_window") {
    return {
      status: "estimated_birth_window",
      sunSign: ephemeris.sunSign,
      sunDegree: ephemeris.sunDegree,
      moonSign: ephemeris.moonSign || "",
      moonDegree: ephemeris.moonDegree || 0,
      ascendant: ephemeris.ascendant,
      ascendantDegree: ephemeris.ascendantDegree,
      remark: ephemeris.remark || "Moon/Ascendant dependent on exact birth time",
    };
  }

  // For date_only: only Sun is reliable
  if (ephemeris.status === "date_only") {
    return {
      status: "date_only",
      sunSign: ephemeris.sunSign,
      sunDegree: ephemeris.sunDegree,
      moonSign: "", // Do not guess
      moonDegree: 0,
      ascendant: undefined, // Do not guess
      remark: "Birth time required for Moon and Ascendant",
    };
  }

  // Legacy approximation is the lowest fallback
  if (ephemeris.status === "legacy_approximation") {
    return {
      status: "legacy_approximation",
      sunSign: ephemeris.sunSign,
      sunDegree: ephemeris.sunDegree,
      moonSign: ephemeris.moonSign || "",
      moonDegree: ephemeris.moonDegree || 0,
      ascendant: ephemeris.ascendant,
      ascendantDegree: ephemeris.ascendantDegree,
      remark: "Calculated from birth date only using simplified formula. Birth time discovery recommended.",
    };
  }

  // Unavailable
  return {
    status: "unavailable",
    sunSign: "",
    sunDegree: 0,
    moonSign: "",
    moonDegree: 0,
    remark: "No ephemeris data available",
  };
}

/**
 * Phase 1: Generate reading with verified data integrity
 */
export function generateSoulCodexReadingV1(input: RawAnalysisInput): SoulCodexReading {
  // Validate inputs
  const validation = validateEphemerisInput(input.ephemeris);
  if (!validation.valid) {
    throw new Error(`Invalid ephemeris input: ${validation.errors.join("; ")}`);
  }

  // Build astrology output (applies verified-vs-legacy rule)
  const astrologyOutput = buildAstrologyOutput(input.ephemeris);

  // Build verified systems
  const verifiedSystems: VerifiedSystems = {
    astrology: astrologyOutput,
    numerology: input.numerology,
    humanDesign: input.humanDesign,
  };

  // Confidence level based on data completeness
  let confidence: "high" | "moderate" | "low" = "low";
  if (astrologyOutput.status === "verified_ephemeris") {
    confidence = "high";
  } else if (astrologyOutput.status === "estimated_birth_window") {
    confidence = "moderate";
  }

  // Build reading stub (interpretations come after verification)
  const reading: SoulCodexReading = {
    meta: {
      subjectName: input.subjectName,
      birthData: input.birthData,
      calculationStatus: astrologyOutput.status,
      confidence,
      engineVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
    },
    snapshot: {
      archetype: "",
      archetypeStatus: "provisional",
      coreFormula: "",
      centralPattern: "",
      gift: "",
      tension: "",
      nextAction: "",
    },
    verifiedSystems,
    engines: [],
    interactions: {
      reinforcements: [],
      balances: [],
      conflicts: [],
    },
    dominance: [],
    actionPlan: {
      avoid: "",
      today: "",
      thisWeek: "",
      relationshipAction: "",
      workAction: "",
    },
  };

  return reading;
}

/**
 * Phase 1 Rules (embedded in code, not comments)
 *
 * 1. If status === "verified_ephemeris": use all three (Sun, Moon, Ascendant)
 *    Never show legacy approximation beside it
 *
 * 2. If status === "estimated_birth_window": show range
 *    Example: "Moon could be Virgo or Libra depending on birth time"
 *
 * 3. If status === "date_only": show only Sun
 *    Moon and Ascendant fields are empty/undefined
 *    Message: "Birth time required for Moon and Ascendant"
 *
 * 4. If status === "legacy_approximation": lowest priority fallback
 *    Never used when verified ephemeris is available
 *    Marked clearly: "Calculated from birth date using simplified formula"
 *
 * 5. If status === "unavailable": show nothing
 *    Offer: "Start Birth Time Discovery"
 */

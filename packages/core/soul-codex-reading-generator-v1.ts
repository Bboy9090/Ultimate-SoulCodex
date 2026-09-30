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

  // Legacy estimated-window payloads cannot represent the canonical
  // verified/stable/conditional/unavailable state model. Do not promote their
  // single-value Moon/Rising fields. The supported unknown-time range engine is
  // responsible for explicit branches and stable-across-range placements.
  if (ephemeris.status === "estimated_birth_window") {
    return {
      status: "estimated_birth_window",
      sunSign: "",
      sunDegree: 0,
      moonSign: "",
      moonDegree: 0,
      ascendant: undefined,
      ascendantDegree: undefined,
      houses: undefined,
      remark: "Legacy estimated-window data is excluded from synthesis. Use the full-day range verifier to expose stable placements and conditional branches.",
    };
  }

  // A naked date-only Sun cannot prove that the Sun stayed in one sign across
  // the full civil day, especially on ingress dates. This legacy contract lacks
  // range provenance, so it cannot populate certified chart data.
  if (ephemeris.status === "date_only") {
    return {
      status: "date_only",
      sunSign: "",
      sunDegree: 0,
      moonSign: "",
      moonDegree: 0,
      ascendant: undefined,
      houses: undefined,
      remark: "Date-only legacy input is not synthesis-eligible. Use the full-day range verifier to certify stable placements and branch changing ones.",
    };
  }

  // Legacy approximations are retained only for migration/inspection. They never
  // populate certified chart data or synthesis.
  if (ephemeris.status === "legacy_approximation") {
    return {
      status: "legacy_approximation",
      sunSign: "",
      sunDegree: 0,
      moonSign: "",
      moonDegree: 0,
      ascendant: undefined,
      ascendantDegree: undefined,
      houses: undefined,
      remark: "Legacy approximation excluded from synthesis. No default noon, midnight, location, Moon, Rising, or house value is promoted.",
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
    numerology: input.numerology
      ? {
          lifePathNumber: input.numerology.lifePathNumber,
          birthdayNumber: input.numerology.birthdayNumber,
        }
      : undefined,
    // Raw Phase-1 Human Design inputs carry no verification receipt and cannot
    // prove stability across an unknown-time range. Keep them out of synthesis.
    humanDesign: undefined,
  };

  // Confidence level based on data completeness
  let confidence: "high" | "moderate" | "low" = "low";
  if (astrologyOutput.status === "verified_ephemeris") {
    confidence = "high";
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

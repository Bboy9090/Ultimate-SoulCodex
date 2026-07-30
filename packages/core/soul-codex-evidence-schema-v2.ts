/**
 * Soul Codex Evidence Schema - Phase 2
 *
 * Separate concerns: input source vs calculation method vs interpretation status
 * No more collapsing all uncertainty into single "unverified" label
 *
 * Example:
 * Sun sign: Virgo
 * - Input source: User-entered birth date
 * - Calculation: Deterministic ephemeris
 * - Interpretation: Direct (no synthesis)
 * - Confidence: High
 *
 * Expression Number: 4
 * - Input source: Self-reported name (Robert Gonzalez)
 * - Calculation: Pythagorean numerology
 * - Interpretation: Provisional (incomplete name may exist)
 * - Confidence: Moderate (missing middle name)
 */

export type InputStatus =
  | "user_entered"        // user typed it in
  | "document_verified"   // passport, birth certificate
  | "self_reported"       // user told us, not independently verified
  | "system_imported"     // came from another system
  | "inferred";           // we computed it from other inputs

export type CalculationStatus =
  | "deterministic"       // same input always produces same output (Sun sign)
  | "ephemeris_verified"  // calculated from reliable astronomy library
  | "estimated"           // calculated from incomplete inputs (Moon range)
  | "legacy"              // old/approximate formula
  | "not_calculated";     // raw data, no computation

export type InterpretationStatus =
  | "direct"              // fixed meaning (Sun in Virgo = specific symbol)
  | "synthesized"         // combination of systems (Virgo + Life Path 9)
  | "provisional"         // applies if conditions change (Moon if time verified)
  | "reflective"          // about patterns, not identity;
  | "contextual";         // depends on lived experience

export interface EvidenceLayer {
  name: string;           // "Sun sign", "Expression Number", "Life Path"
  value: string;          // "Virgo", "4", "9"

  // Source: where did this input come from?
  inputStatus: InputStatus;
  inputRemark?: string;   // "Birth date: 1990-09-17 (user-entered)"

  // Method: how was it calculated?
  calculationStatus: CalculationStatus;
  calculationRemark?: string; // "SOFA ephemeris for 11:11 AM EDT"
  calculationTrail?: string;  // "R(9)+O(6)+B(2)+E(5)+R(9)+T(2)..."

  // Meaning: what does it signify?
  interpretationStatus: InterpretationStatus;
  interpretationRemark?: string; // "Symbolizes practical precision"

  // Overall confidence in this layer
  confidence: "high" | "moderate" | "low";

  // Why confidence is at this level
  confidenceReason?: string; // "Complete birth data available"

  // Time sensitivity: does this change if inputs change?
  timeSensitive?: boolean; // true = "Moon depends on exact birth time"

  // Related systems that corroborate this
  supportingSystems?: string[]; // ["Numerology Life Path 9", "Human Design 5/1"]

  // Version/method info for audit
  method?: string;        // "Pythagorean numerology"
  methodVersion?: string; // "1.0"
}

export interface EvidenceAudit {
  totalLayers: number;
  layersByConfidence: {
    high: EvidenceLayer[];
    moderate: EvidenceLayer[];
    low: EvidenceLayer[];
  };
  missingData: string[];  // "Middle name for full numerology calculation"
  limitations: LimitationCategory[];
  calculatedAt: string;
  engineVersion: string;
}

export type LimitationCategory =
  | "missing_birth_time"
  | "incomplete_name_data"
  | "unverified_source"
  | "estimated_data"
  | "offline_generation";

export interface LimitationGroup {
  category: LimitationCategory;
  count: number;
  userFacingLabel: string;
  examples: string[];
}

/**
 * Phase 2 Rule: Replace "35 recorded limitations" with grouped categories
 *
 * Instead of: "Recorded limitations: 35" (sounds catastrophic)
 * Show: "5 active limitations" (grouped and manageable)
 *
 * Categories:
 * 1. Missing birth-time verification (2 limitations)
 * 2. Incomplete name data (1 limitation)
 * 3. Unverified data sources (0 limitations)
 * 4. Offline engine unavailable (1 limitation)
 * 5. Provisional synthesis pending verification (1 limitation)
 */

export interface SoulCodexReadingAudit {
  // Evidence layers: one per verified value
  evidenceLayers: EvidenceLayer[];

  // Grouped limitations: 5 categories max
  limitations: LimitationGroup[];

  // Sources used
  dataSources: {
    astrology?: "ephemeris" | "legacy" | "unavailable";
    numerology?: "confirmed" | "provisional" | "unavailable";
    humanDesign?: "self_reported" | "unavailable";
  };

  // Calculation details
  calculationMethod: string;
  houseSystem?: string;
  zodiacType?: string;
  ephemerisVersion?: string;

  // Timestamps
  generatedAt: string;
  inputsVerifiedAt?: string;

  // Version tracking
  engineVersion: string;
  schemaVersion: string;

  // Disclaimer
  disclaimer: string;
}

/**
 * Helper to count limitations by category
 */
export function categorizeLimitations(
  limitations: string[]
): LimitationGroup[] {
  const groups = new Map<LimitationCategory, string[]>();

  // Pre-populate categories
  const categories: LimitationCategory[] = [
    "missing_birth_time",
    "incomplete_name_data",
    "unverified_source",
    "estimated_data",
    "offline_generation",
  ];

  categories.forEach((cat) => groups.set(cat, []));

  // Categorize each limitation
  limitations.forEach((limit) => {
    if (
      limit.includes("birth time") ||
      limit.includes("Ascendant") ||
      limit.includes("exact time")
    ) {
      groups.get("missing_birth_time")?.push(limit);
    } else if (limit.includes("name") || limit.includes("numerology")) {
      groups.get("incomplete_name_data")?.push(limit);
    } else if (limit.includes("verify") || limit.includes("source")) {
      groups.get("unverified_source")?.push(limit);
    } else if (limit.includes("estimate") || limit.includes("approximat")) {
      groups.get("estimated_data")?.push(limit);
    } else if (limit.includes("offline") || limit.includes("unavailable")) {
      groups.get("offline_generation")?.push(limit);
    }
  });

  // Convert to display format
  const labelMap: Record<LimitationCategory, string> = {
    missing_birth_time: "Birth time not verified",
    incomplete_name_data: "Full birth name not confirmed",
    unverified_source: "Data source unverified",
    estimated_data: "Some values estimated",
    offline_generation: "Generated without live APIs",
  };

  return Array.from(groups.entries())
    .filter(([, examples]) => examples.length > 0)
    .map(([category, examples]) => ({
      category,
      count: examples.length,
      userFacingLabel: labelMap[category],
      examples: examples.slice(0, 2), // Show first 2 examples
    }))
    .sort((a, b) => b.count - a.count); // Highest count first
}

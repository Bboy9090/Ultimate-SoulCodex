import type {
  CalculationStatus,
  InputStatus,
  InterpretationStatus,
} from "@soulcodex/core";

const INPUT_STATUS_LABELS: Record<InputStatus, string> = {
  user_entered: "User entered",
  document_verified: "Document verified",
  self_reported: "Self reported",
  system_imported: "Imported from connected system",
  inferred: "Derived from supplied evidence",
};

const CALCULATION_STATUS_LABELS: Record<CalculationStatus, string> = {
  deterministic: "Deterministic calculation",
  ephemeris_verified: "Ephemeris verified",
  estimated: "Estimated from incomplete inputs",
  legacy: "Legacy / non-verified calculation",
  not_calculated: "Not calculated",
};

const INTERPRETATION_STATUS_LABELS: Record<InterpretationStatus, string> = {
  direct: "Direct symbolic interpretation",
  synthesized: "Symbolic synthesis",
  provisional: "Provisional interpretation",
  reflective: "Reflection framework",
  contextual: "Context-dependent interpretation",
};

export function inputStatusLabel(status: InputStatus): string {
  return INPUT_STATUS_LABELS[status];
}

export function calculationStatusLabel(status: CalculationStatus): string {
  return CALCULATION_STATUS_LABELS[status];
}

export function interpretationStatusLabel(
  status: InterpretationStatus,
): string {
  return INTERPRETATION_STATUS_LABELS[status];
}

export type HumanDesignVerificationStatus =
  | "unresolved"
  | "calculated_unverified"
  | "verified";

export type HumanDesignCoreField = "type" | "strategy" | "authority" | "profile";

type HumanDesignCandidateFields = Partial<Record<HumanDesignCoreField, string>>;

interface HumanDesignEvidenceBase {
  limitations: readonly string[];
}

export interface HumanDesignCandidateEvidence extends HumanDesignEvidenceBase {
  status: "calculated_unverified";
  engine: "soulcodex-hd-candidate-v0";
  source: "Soul Codex deterministic Human Design candidate engine";
  calculatedAt: string;
  inputTimestampUtc: string;
  birthTimeKnown: true;
  candidate: HumanDesignCandidateFields;
}

export interface HumanDesignVerifiedEvidence extends HumanDesignEvidenceBase {
  status: "verified";
  engine: string;
  source: string;
  calculatedAt: string;
  inputTimestampUtc: string;
  birthTimeKnown: true;
  candidate: HumanDesignCandidateFields;
  verificationReceiptId: string;
  independentSource: string;
  verifiedAt: string;
}

export interface HumanDesignUnresolvedEvidence extends HumanDesignEvidenceBase {
  status: "unresolved";
  engine: null;
  source: null;
  calculatedAt: null;
  inputTimestampUtc: null;
  birthTimeKnown: false;
  candidate: Record<string, never>;
}

export type HumanDesignTrustRecord =
  | HumanDesignCandidateEvidence
  | HumanDesignVerifiedEvidence
  | HumanDesignUnresolvedEvidence;

const UNVERIFIED_LIMITATIONS = Object.freeze([
  "Human Design output has not passed an independent reference comparison.",
  "Advanced values such as variables and incarnation cross are not authoritative.",
  "Candidate fields must not drive compatibility scores or interpretation as verified facts.",
]);

function isValidIsoTimestamp(value: string): boolean {
  return Boolean(value.trim()) && !Number.isNaN(new Date(value).getTime());
}

export function createHumanDesignTrustRecord(input: {
  birthTimeKnown: boolean;
  inputTimestampUtc?: string | null;
  calculatedAt?: string;
  candidate?: HumanDesignCandidateFields | null;
}): HumanDesignTrustRecord {
  if (!input.birthTimeKnown || !input.inputTimestampUtc) {
    return {
      status: "unresolved",
      engine: null,
      source: null,
      calculatedAt: null,
      inputTimestampUtc: null,
      birthTimeKnown: false,
      candidate: {},
      limitations: Object.freeze([
        "Exact birth time and timezone are required for Human Design calculation.",
        ...UNVERIFIED_LIMITATIONS,
      ]),
    };
  }

  if (!isValidIsoTimestamp(input.inputTimestampUtc)) {
    throw new Error("human_design_input_timestamp_invalid");
  }

  const calculatedAt = input.calculatedAt ?? new Date().toISOString();
  if (!isValidIsoTimestamp(calculatedAt)) {
    throw new Error("human_design_calculation_timestamp_invalid");
  }

  const candidate = Object.fromEntries(
    Object.entries(input.candidate ?? {}).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0,
    ),
  ) as HumanDesignCandidateFields;

  return {
    status: "calculated_unverified",
    engine: "soulcodex-hd-candidate-v0",
    source: "Soul Codex deterministic Human Design candidate engine",
    calculatedAt,
    inputTimestampUtc: input.inputTimestampUtc,
    birthTimeKnown: true,
    candidate,
    limitations: UNVERIFIED_LIMITATIONS,
  };
}

export function getVerifiedHumanDesignField(
  record: HumanDesignTrustRecord,
  field: HumanDesignCoreField,
): string | null {
  if (record.status !== "verified") {
    return null;
  }

  const value = record.candidate[field];
  return typeof value === "string" && value.trim() ? value : null;
}

export function mayUseHumanDesignForCompatibility(
  record: HumanDesignTrustRecord,
): boolean {
  return record.status === "verified";
}

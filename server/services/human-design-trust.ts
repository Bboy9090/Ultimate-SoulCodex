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

export const APPROVED_HUMAN_DESIGN_CORE_VERIFICATION = Object.freeze({
  policyId: "HUMAN-DESIGN-CORE-v1",
  status: "approved" as const,
  engine: "soulcodex-hd-geocentric-v1",
  independentSource: "free-human-design@1.0.1 differential verifier",
  verificationReceiptId: "35474994858:human-design-repair-audit",
  evidenceArtifactId: "10594227976",
  evidenceArtifactSha256:
    "ace8b24057905de304750c363c1981b405b2519076112c11b831881d387531af",
  exactCandidateSha: "d57b747658668492d72869e8a973d5708e21d09d",
  fixtureCount: 20,
  activationCount: 520,
  exactGateMatches: 520,
  exactGateLineMatches: 520,
  typeMatches: 20,
  authorityMatches: 20,
  profileMatches: 20,
  centerSetMatches: 20,
  channelSetMatches: 20,
  approvedAt: "2026-09-19T23:03:08.000Z",
  approvedBy: "Bboy9090",
});

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


export function createVerifiedHumanDesignTrustRecord(input: {
  birthTimeKnown: boolean;
  inputTimestampUtc?: string | null;
  calculatedAt?: string;
  candidate?: HumanDesignCandidateFields | null;
}): HumanDesignTrustRecord {
  if (!input.birthTimeKnown || !input.inputTimestampUtc) {
    return createHumanDesignTrustRecord(input);
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
    status: "verified",
    engine: APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.engine,
    source: "Soul Codex deterministic Human Design core engine",
    calculatedAt,
    inputTimestampUtc: input.inputTimestampUtc,
    birthTimeKnown: true,
    candidate,
    verificationReceiptId:
      APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.verificationReceiptId,
    independentSource:
      APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.independentSource,
    verifiedAt: APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.approvedAt,
    limitations: Object.freeze([
      "Verification covers the core activation/bodygraph layer: gates, lines, Type, Strategy, Authority, Profile, channels, and centers.",
      "Advanced values such as Variables and Incarnation Cross naming remain outside HUMAN-DESIGN-CORE-v1 and must not be presented as independently verified facts.",
    ]),
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

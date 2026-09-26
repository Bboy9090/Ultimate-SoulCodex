export const APPROVED_HUMAN_DESIGN_TRUST = Object.freeze({
  engine: "soulcodex-hd-geocentric-v1",
  verificationReceiptId: "35474994858:human-design-repair-audit",
  independentSource: "free-human-design@1.0.1 differential verifier",
  verifiedAt: "2026-09-19T23:03:08.000Z",
});

const HUMAN_DESIGN_STRATEGIES: Readonly<Record<string, readonly string[]>> = Object.freeze({
  Manifestor: Object.freeze(["to inform", "inform"]),
  Generator: Object.freeze(["to respond", "respond"]),
  "Manifesting Generator": Object.freeze([
    "to respond & inform",
    "to respond and inform",
    "respond & inform",
    "respond and inform",
  ]),
  Projector: Object.freeze([
    "to wait for invitation",
    "wait for invitation",
    "wait for the invitation",
  ]),
  Reflector: Object.freeze([
    "to wait a lunar cycle",
    "wait a lunar cycle",
    "wait for lunar month",
    "wait a full lunar cycle",
  ]),
});

const HUMAN_DESIGN_AUTHORITIES: Readonly<Record<string, readonly string[]>> = Object.freeze({
  Manifestor: Object.freeze(["emotional authority", "splenic authority", "ego authority"]),
  Generator: Object.freeze(["emotional authority", "sacral authority"]),
  "Manifesting Generator": Object.freeze(["emotional authority", "sacral authority"]),
  Projector: Object.freeze([
    "emotional authority",
    "splenic authority",
    "ego authority",
    "self-projected authority",
    "mental authority",
  ]),
  Reflector: Object.freeze(["lunar authority"]),
});

function nonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validIsoLikeTimestamp(value: unknown): value is string {
  return nonEmptyText(value) && !Number.isNaN(Date.parse(value));
}

function normalizedHumanDesignText(value: unknown): string | null {
  return nonEmptyText(value)
    ? value.trim().toLowerCase().replace(/\s+/g, " ")
    : null;
}

export function hasCoherentVerifiedHumanDesignCore(
  humanDesignData: Record<string, unknown> | null | undefined,
): boolean {
  if (!humanDesignData) return false;

  const type = nonEmptyText(humanDesignData.type) ? humanDesignData.type.trim() : null;
  const strategy = normalizedHumanDesignText(humanDesignData.strategy);
  const authority = normalizedHumanDesignText(humanDesignData.authority);
  const profile = nonEmptyText(humanDesignData.profile) ? humanDesignData.profile.trim() : null;

  if (!type || !strategy || !authority || !profile) return false;
  if (!(type in HUMAN_DESIGN_STRATEGIES)) return false;
  if (!HUMAN_DESIGN_STRATEGIES[type].includes(strategy)) return false;
  if (!HUMAN_DESIGN_AUTHORITIES[type]?.includes(authority)) return false;
  return /^[1-6]\/[1-6]$/.test(profile);
}

export function hasVerifiedHumanDesignTrust(
  humanDesignData: Record<string, unknown> | null | undefined,
): boolean {
  return Boolean(
    humanDesignData?.status === "verified" &&
    hasCoherentVerifiedHumanDesignCore(humanDesignData) &&
    humanDesignData.engine === APPROVED_HUMAN_DESIGN_TRUST.engine &&
    nonEmptyText(humanDesignData.source) &&
    validIsoLikeTimestamp(humanDesignData.calculatedAt) &&
    validIsoLikeTimestamp(humanDesignData.inputTimestampUtc) &&
    humanDesignData.verificationReceiptId === APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId &&
    humanDesignData.independentSource === APPROVED_HUMAN_DESIGN_TRUST.independentSource &&
    humanDesignData.verifiedAt === APPROVED_HUMAN_DESIGN_TRUST.verifiedAt
  );
}

export type ConfidenceBadge = "verified" | "partial" | "unverified";

export interface ConfidenceResult {
  badge: ConfidenceBadge;
  label: string;
  reason: string;
  /** Plain-language note that chart math is solid; AI wording may still vary. */
  aiAssuranceNote: string;
}

export function computeConfidence(input: {
  timeUnknown: boolean;
  hasGeo: boolean;
  hasTimezone: boolean;
  hasRising?: boolean;
}): ConfidenceResult {
  const { timeUnknown, hasGeo, hasTimezone, hasRising } = input;

  // STRICT RULE: Verified requires EVERYTHING
  if (!timeUnknown && hasGeo && hasTimezone && hasRising !== false) {
    return {
      badge: "verified",
      label: "Verified",
      reason: "Full birth data confirmed — Rising sign and house layers are locked.",
      aiAssuranceNote:
        "Your chart data is high-fidelity. If something feels off, verify your exact birth time.",
    };
  }

  // PARTIAL: We have the date, but missing precision (Time or Geo)
  if (!hasGeo || !hasTimezone || timeUnknown) {
    return {
      badge: "partial",
      label: "Partial",
      reason: "Precision data missing — Sun and Moon are stable, but Rising sign is estimated.",
      aiAssuranceNote:
        "Your primary signals are active, but house-based insights require an exact birth time.",
    };
  }

  // UNVERIFIED: Missing core birth data
  return {
    badge: "unverified",
    label: "Unverified",
    reason: "Missing birth record — using general archetype fallbacks.",
    aiAssuranceNote:
      "Onboard with your birth record to unlock your specific soul architecture.",
  };
}

const DEFAULT_AI_ASSURANCE: Record<ConfidenceBadge, string> = {
  verified:
    "Your wheel data is computed from the birth record you gave. AI phrasing is tuned for clarity; if something feels off, re-check time and place.",
  partial:
    "Chart math for Sun and Moon is stable. Written insights may still vary in tone — use the badge above as the source of truth for what is locked in.",
  unverified:
    "We only show placements we can compute from your date (and time when given). Interpretive text is guidance, not a guarantee.",
};

/** Normalize profile confidence for Codex reading + UI (badge key + display label + AI disclaimer). */
export function buildCodexReadingBadges(
  conf:
    | Partial<ConfidenceResult> & { badge?: ConfidenceBadge; label?: string }
    | null
    | undefined
): ConfidenceResult {
  let badge: ConfidenceBadge = "unverified";
  if (conf?.badge === "verified" || conf?.badge === "partial" || conf?.badge === "unverified") {
    badge = conf.badge;
  } else if (conf?.label === "Verified") badge = "verified";
  else if (conf?.label === "Partial") badge = "partial";
  else if (conf?.label === "Unverified") badge = "unverified";

  const label =
    conf?.label ??
    ({ verified: "Verified", partial: "Partial", unverified: "Unverified" } as const)[badge];

  return {
    badge,
    label,
    reason: conf?.reason ?? "",
    aiAssuranceNote: conf?.aiAssuranceNote?.trim() || DEFAULT_AI_ASSURANCE[badge],
  };
}

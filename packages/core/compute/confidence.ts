export type ConfidenceBadge = "verified" | "partial" | "unverified";

export interface ConfidenceResult {
  badge: ConfidenceBadge;
  label: string;
  reason: string;
  /** Plain-language evidence note. This is not a probability of psychological truth. */
  aiAssuranceNote: string;
}

export interface ConfidenceInput {
  timeUnknown: boolean;
  hasGeo: boolean;
  hasTimezone: boolean;
  /**
   * True only when the caller has an approved astronomy verification result.
   * Complete birth inputs alone are not enough to promote this badge.
   */
  astronomyVerified?: boolean;
}

/**
 * Conservative profile-support badge.
 *
 * This helper describes whether exact-time chart layers are permitted to be
 * treated as verified. It does not manufacture placements and it does not
 * authorize Human Design or any other system.
 */
export function computeConfidence(input: ConfidenceInput): ConfidenceResult {
  const {
    timeUnknown,
    hasGeo,
    hasTimezone,
    astronomyVerified = false,
  } = input;

  if (!hasGeo || !hasTimezone) {
    return {
      badge: "unverified",
      label: "Unverified",
      reason:
        "Location or timezone evidence is incomplete — location-sensitive chart layers remain unresolved.",
      aiAssuranceNote:
        "Use only calculations supported by the available inputs. Do not substitute guessed locations, timezones, houses, or archetype fallbacks.",
    };
  }

  if (timeUnknown) {
    return {
      badge: "partial",
      label: "Partial",
      reason:
        "Birth time is unknown — Rising, houses, and other time-sensitive placements stay omitted or unresolved unless their own date-window checks support them.",
      aiAssuranceNote:
        "Date-stable and deterministic layers may still be used under their own contracts. Moon and other time-sensitive placements must not be assumed stable from the date alone.",
    };
  }

  if (!astronomyVerified) {
    return {
      badge: "partial",
      label: "Partial",
      reason:
        "Birth time, location, and timezone are present, but no approved astronomy verification state was supplied.",
      aiAssuranceNote:
        "Complete inputs allow calculation; they do not by themselves prove the resulting chart. Exact-time placements remain calculated/unverified until their verification contract passes.",
    };
  }

  return {
    badge: "verified",
    label: "Verified",
    reason:
      "Required birth inputs are present and the caller supplied an approved astronomy verification state.",
    aiAssuranceNote:
      "The astronomical calculation is verified under its evidence contract. Psychological or symbolic meaning remains interpretation, not measured fact.",
  };
}

const DEFAULT_AI_ASSURANCE: Record<ConfidenceBadge, string> = {
  verified:
    "The relevant calculation passed its verification contract. Symbolic interpretation remains separate from verified calculation.",
  partial:
    "Some precision or verification requirements are incomplete. Time-sensitive layers stay omitted or unresolved rather than guessed.",
  unverified:
    "Verification requirements are not satisfied. Unsupported placements remain unresolved; no generic archetype fallback is substituted.",
};

/**
 * Normalize an explicit confidence record for legacy Codex reading surfaces.
 *
 * A display label alone is never authority to promote a profile to Verified.
 * Only an explicit structured badge may carry that state.
 */
export function buildCodexReadingBadges(
  conf:
    | Partial<ConfidenceResult> & { badge?: ConfidenceBadge; label?: string }
    | null
    | undefined,
): ConfidenceResult {
  let badge: ConfidenceBadge = "unverified";

  if (
    conf?.badge === "verified" ||
    conf?.badge === "partial" ||
    conf?.badge === "unverified"
  ) {
    badge = conf.badge;
  } else if (conf?.label === "Partial") {
    badge = "partial";
  }

  const label = (
    {
      verified: "Verified",
      partial: "Partial",
      unverified: "Unverified",
    } as const
  )[badge];

  return {
    badge,
    label,
    reason: conf?.reason?.trim() || "",
    aiAssuranceNote:
      conf?.aiAssuranceNote?.trim() || DEFAULT_AI_ASSURANCE[badge],
  };
}

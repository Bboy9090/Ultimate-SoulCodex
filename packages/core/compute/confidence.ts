export type ConfidenceBadge = "verified" | "partial" | "unverified";

export interface ConfidenceResult {
  badge: ConfidenceBadge;
  label: string;
  reason: string;
}

export function computeConfidence(input: {
  timeUnknown: boolean;
  hasGeo: boolean;
  hasTimezone: boolean;
}): ConfidenceResult {
  const { timeUnknown, hasGeo, hasTimezone } = input;

  if (!hasGeo || !hasTimezone) {
    return {
      badge: "unverified",
      label: "Unverified",
      reason: "Location couldn't be resolved. Rising sign and houses may be inaccurate.",
    };
  }

  if (timeUnknown) {
    return {
      badge: "partial",
      label: "Partial",
      reason: "Birth time unknown — Rising sign and houses are omitted.",
    };
  }

  return {
    badge: "verified",
    label: "Verified",
    reason: "Birth time + location locked. Full chart available.",
  };
}

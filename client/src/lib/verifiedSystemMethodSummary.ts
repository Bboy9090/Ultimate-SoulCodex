import type {
  AstrologyDataStatus,
  VerifiedSystems,
} from "@soulcodex/core";

export type VerifiedSystemMethodId =
  | "astrology"
  | "numerology"
  | "human-design";

export interface VerifiedSystemMethodSummary {
  id: VerifiedSystemMethodId;
  label: string;
  statusLabel: string;
  basis: string;
  interpretationBoundary: string;
}

function hasVerifiedHumanDesignEvidence(
  systems: VerifiedSystems,
): boolean {
  const humanDesign = systems.humanDesign;
  return (
    humanDesign?.status === "verified" &&
    Boolean(
      humanDesign.verificationReceiptId?.trim() &&
      humanDesign.independentSource?.trim() &&
      humanDesign.verifiedAt?.trim(),
    )
  );
}

export function buildVerifiedSystemMethodSummaries(
  systems: VerifiedSystems,
  astrologyStatus: AstrologyDataStatus,
): VerifiedSystemMethodSummary[] {
  const summaries: VerifiedSystemMethodSummary[] = [];

  if (
    astrologyStatus === "verified_ephemeris" &&
    systems.astrology.status === "verified_ephemeris"
  ) {
    summaries.push({
      id: "astrology",
      label: "Astrology",
      statusLabel: "Verified ephemeris",
      basis:
        "The displayed astronomical placements passed the app's verified ephemeris contract before they were allowed into this panel.",
      interpretationBoundary:
        "The placements are calculated evidence. Their personal meaning remains symbolic interpretation rather than a measured psychological fact.",
    });
  }

  if (systems.numerology) {
    summaries.push({
      id: "numerology",
      label: "Numerology",
      statusLabel: "Deterministic arithmetic",
      basis:
        "The displayed core numbers come from the governed numerology arithmetic applied to the supplied date and, where required, name inputs.",
      interpretationBoundary:
        "The arithmetic is deterministic. The meaning attached to each number is a symbolic reflection framework, not proof of personality or future events.",
    });
  }

  if (hasVerifiedHumanDesignEvidence(systems)) {
    summaries.push({
      id: "human-design",
      label: "Human Design",
      statusLabel: "Verified core",
      basis:
        "The displayed core bodygraph fields are included only after the approved Human Design verification receipt and an independent source are both present.",
      interpretationBoundary:
        "The calculation status is verified within the approved core scope. Human Design interpretation remains a symbolic framework, and unqualified extensions stay excluded.",
    });
  }

  return summaries;
}

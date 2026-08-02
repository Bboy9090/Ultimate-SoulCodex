export interface PlacementEvidence {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
}

export interface PlacementLike {
  sign?: string | null;
  status?: string | null;
  verificationStatus?: string | null;
  evidence?: PlacementEvidence | null;
  provenance?: PlacementEvidence | null;
}

export interface VerifiedAstrology {
  sun?: string;
  moon?: string;
  rising?: string;
  unresolved: string[];
}

function verifiedSign(value: PlacementLike | null | undefined): string | undefined {
  if (!value?.sign) return undefined;
  const state = value.verificationStatus ?? value.status;
  if (state !== "verified") return undefined;
  const evidence = value.provenance ?? value.evidence;
  if (!evidence?.source || !evidence?.engine || !evidence?.calculatedAt) return undefined;
  return value.sign;
}

function placementFromProfile(profile: any, key: "sun" | "moon" | "rising"): PlacementLike | undefined {
  return (
    profile?.astrologyData?.[key] ??
    profile?.astrology?.[key] ??
    profile?.natalChart?.[key] ??
    profile?.chart?.[key]
  );
}

export function extractVerifiedAstrology(profile: any): VerifiedAstrology {
  const sun = verifiedSign(placementFromProfile(profile, "sun"));
  const moon = verifiedSign(placementFromProfile(profile, "moon"));
  const rising = verifiedSign(placementFromProfile(profile, "rising"));
  const unresolved = [
    !sun ? "Sun" : null,
    !moon ? "Moon" : null,
    !rising ? "Ascendant" : null,
  ].filter((value): value is string => Boolean(value));

  return { sun, moon, rising, unresolved };
}

export function buildVerifiedAstrologyLines(profile: any): string[] {
  const astrology = extractVerifiedAstrology(profile);
  const lines: string[] = [];
  if (astrology.sun) lines.push(`- Sun: ${astrology.sun}`);
  if (astrology.moon) lines.push(`- Moon: ${astrology.moon}`);
  if (astrology.rising) lines.push(`- Rising: ${astrology.rising}`);
  if (astrology.unresolved.length) {
    lines.push(`- Unresolved astrology: ${astrology.unresolved.join(", ")}. Do not infer or interpret these placements.`);
  }
  return lines;
}

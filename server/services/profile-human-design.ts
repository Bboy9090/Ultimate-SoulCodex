import { resolveCivilTimeStrict } from "@soulcodex/core";
import { calculateHumanDesign } from "../../packages/astrology/human-design";
import { createVerifiedHumanDesignTrustRecord } from "./human-design-trust";

export class ProfileHumanDesignError extends Error {}

export function calculateProfileHumanDesign(input: {
  birthDate: string; birthTime?: string; timezone?: string;
  latitude?: string | number; longitude?: string | number;
}): Record<string, unknown> {
  if (!input.birthTime?.trim() || !input.timezone?.trim() || input.latitude == null || input.longitude == null || !String(input.latitude).trim() || !String(input.longitude).trim()) {
    return { status: "unresolved", reason: "Exact birth time, timezone, and resolved birth coordinates are required for verified Human Design." };
  }
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new ProfileHumanDesignError("Birth coordinates are invalid; Human Design was not assigned.");
  }
  const civil = resolveCivilTimeStrict(input.birthDate, input.birthTime, input.timezone);
  if (civil.status !== "valid" || !civil.utc) {
    throw new ProfileHumanDesignError(`Birth time is ${civil.status}; correct the date, time, and timezone before verification.`);
  }
  const inputTimestampUtc = civil.utc.toISOString();
  // Compute from the same exact instant used in the trust receipt. This also
  // prevents legacy timezone-abbreviation mappings changing daylight offsets.
  const design = calculateHumanDesign({
    name: "Private profile", birthLocation: "Resolved birthplace",
    birthDate: inputTimestampUtc.slice(0, 10), birthTime: inputTimestampUtc.slice(11, 16),
    timezone: "Etc/UTC", latitude: String(latitude), longitude: String(longitude),
  });
  if (design.status !== "resolved") throw new ProfileHumanDesignError(`Human Design calculation is unresolved (${design.reason}); no substitute design was assigned.`);
  const trust = createVerifiedHumanDesignTrustRecord({ birthTimeKnown: true, inputTimestampUtc, candidate: design });
  if (trust.status !== "verified") throw new ProfileHumanDesignError("Human Design did not meet the approved evidence contract.");
  return { ...design, ...trust, status: "verified" };
}

export function verifiedProfileHumanDesignSummary(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, any>;
  if (data.status !== "verified") return null;
  try {
    const expected = createVerifiedHumanDesignTrustRecord({
      birthTimeKnown: true, inputTimestampUtc: data.inputTimestampUtc,
      calculatedAt: data.calculatedAt, candidate: data,
    });
    if (expected.status !== "verified" || !data.source?.trim() ||
      ["engine", "verificationReceiptId", "independentSource", "verifiedAt"].some((key) => data[key] !== (expected as any)[key])) return null;
    return `${data.type}; strategy ${data.strategy}; authority ${data.authority}; profile ${data.profile}`;
  } catch { return null; }
}

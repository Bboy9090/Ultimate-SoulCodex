import { z } from "zod";
import type { Profile } from "@shared/schema";

export type PublicShareField =
  | "displayName"
  | "sunSign"
  | "moonSign"
  | "risingSign"
  | "lifePath"
  | "archetypeTitle";

export const publicShareSelectionSchema = z.object({
  fields: z.array(z.enum(["displayName", "sunSign", "moonSign", "risingSign", "lifePath", "archetypeTitle"])).min(1).max(6),
  displayName: z.string().trim().min(1).max(80).optional(),
}).superRefine((value, context) => {
  if (value.fields.includes("displayName") && !value.displayName) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["displayName"],
      message: "displayName is required when displayName is selected",
    });
  }
});

export type PublicShareSelection = z.infer<typeof publicShareSelectionSchema>;

export interface PublicProfileProjection {
  version: 1;
  fields: Partial<Record<PublicShareField, string | number>>;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function verifiedSign(container: unknown, key: "sun" | "moon" | "rising"): string | undefined {
  if (!container || typeof container !== "object") return undefined;
  const placement = (container as Record<string, unknown>)[key];
  if (!placement || typeof placement !== "object") return undefined;
  const record = placement as Record<string, unknown>;
  if (record.verificationStatus !== "verified") return undefined;

  const evidence = (record.provenance ?? record.evidence) as Record<string, unknown> | undefined;
  const source = cleanText(evidence?.source);
  const engine = cleanText(evidence?.engine);
  const calculatedAt = cleanText(evidence?.calculatedAt);
  if (!source || !engine || !calculatedAt || Number.isNaN(Date.parse(calculatedAt))) return undefined;

  return cleanText(record.sign);
}

function safeLifePath(profile: Profile): number | undefined {
  const numerology = profile.numerologyData as Record<string, unknown> | null;
  const value = numerology?.lifePath;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeArchetypeTitle(profile: Profile): string | undefined {
  const archetype = profile.archetypeData as Record<string, unknown> | null;
  return cleanText(archetype?.title);
}

export function buildPublicProfileProjection(
  profile: Profile,
  selection: PublicShareSelection,
): PublicProfileProjection {
  const requested = new Set(selection.fields);
  const fields: PublicProfileProjection["fields"] = {};

  if (requested.has("displayName")) {
    const displayName = cleanText(selection.displayName);
    if (displayName) fields.displayName = displayName;
  }

  const astrology = profile.astrologyData;
  if (requested.has("sunSign")) {
    const value = verifiedSign(astrology, "sun");
    if (value) fields.sunSign = value;
  }
  if (requested.has("moonSign")) {
    const value = verifiedSign(astrology, "moon");
    if (value) fields.moonSign = value;
  }
  if (requested.has("risingSign")) {
    const value = verifiedSign(astrology, "rising");
    if (value) fields.risingSign = value;
  }

  if (requested.has("lifePath")) {
    const value = safeLifePath(profile);
    if (value !== undefined) fields.lifePath = value;
  }

  if (requested.has("archetypeTitle")) {
    const value = safeArchetypeTitle(profile);
    if (value) fields.archetypeTitle = value;
  }

  return { version: 1, fields };
}

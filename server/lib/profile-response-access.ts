import { tierAllowsCapability, type SoulCodexTier } from "@shared/product-access";
import { synthesizeArchetype } from "../services/archetype";

type AnyRecord = Record<string, any>;

function cloneRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? { ...(value as AnyRecord) } : {};
}

function hdCoreView(value: unknown): AnyRecord {
  const hd = cloneRecord(value);
  const coreKeys = [
    "status",
    "type",
    "strategy",
    "authority",
    "profile",
    "engine",
    "source",
    "calculatedAt",
    "inputTimestampUtc",
    "verificationReceiptId",
    "independentSource",
    "verifiedAt",
    "reason",
  ];
  const projected: AnyRecord = {};
  for (const key of coreKeys) {
    if (hd[key] !== undefined) projected[key] = hd[key];
  }
  return projected;
}

function hdEvidenceOnly(value: unknown): AnyRecord {
  const hd = cloneRecord(value);
  const evidenceKeys = [
    "status",
    "engine",
    "source",
    "calculatedAt",
    "inputTimestampUtc",
    "verificationReceiptId",
    "independentSource",
    "verifiedAt",
    "reason",
  ];
  const projected: AnyRecord = {};
  for (const key of evidenceKeys) {
    if (hd[key] !== undefined) projected[key] = hd[key];
  }
  if (hd.status === "verified") projected.status = "verified_locked";
  return projected;
}

function numerologyFreeView(value: unknown): AnyRecord {
  const numerology = cloneRecord(value);
  const interpretations = numerology.interpretations && typeof numerology.interpretations === "object"
    ? numerology.interpretations
    : null;
  return {
    status: numerology.status,
    lifePath: numerology.lifePath,
    birthday: numerology.birthday,
    personalYear: numerology.personalYear,
    interpretations: interpretations
      ? {
          lifePath: interpretations.lifePath,
          birthday: interpretations.birthday,
          personalYear: interpretations.personalYear,
        }
      : undefined,
  };
}

export function projectProfileResponseForTier<T extends AnyRecord>(
  profile: T,
  tier: SoulCodexTier,
): T {
  const projected: AnyRecord = { ...profile };

  projected.numerologyData = tierAllowsCapability(tier, "full_name_numerology")
    ? cloneRecord(profile.numerologyData)
    : numerologyFreeView(profile.numerologyData);

  projected.humanDesignData = tierAllowsCapability(tier, "human_design_depth")
    ? cloneRecord(profile.humanDesignData)
    : tierAllowsCapability(tier, "human_design_core")
      ? hdCoreView(profile.humanDesignData)
      : hdEvidenceOnly(profile.humanDesignData);

  if (!tierAllowsCapability(tier, "interpretation_depth")) {
    const freeArchetype = synthesizeArchetype(
      profile.astrologyData,
      projected.numerologyData,
      profile.personalityData,
      projected.humanDesignData,
    );
    projected.archetypeData = {
      ...freeArchetype,
      shadows: [],
    };
    projected.biography = freeArchetype.description;
    projected.dailyGuidance = freeArchetype.guidance;
    projected.depthInterpretation = null;
    projected.synthesis = null;
  }

  return projected as T;
}

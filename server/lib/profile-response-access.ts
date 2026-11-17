import { tierAllowsCapability, type SoulCodexTier } from "@shared/product-access";
import { synthesizeArchetype } from "../services/archetype";
import { quarantineStoredProfileEvidence } from "./profile-birth-evidence-integrity";

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
  const trusted = quarantineStoredProfileEvidence(profile);
  const projected: AnyRecord = { ...trusted };

  projected.numerologyData = tierAllowsCapability(tier, "full_name_numerology")
    ? cloneRecord(trusted.numerologyData)
    : numerologyFreeView(trusted.numerologyData);

  projected.humanDesignData = tierAllowsCapability(tier, "human_design_depth")
    ? cloneRecord(trusted.humanDesignData)
    : tierAllowsCapability(tier, "human_design_core")
      ? hdCoreView(trusted.humanDesignData)
      : hdEvidenceOnly(trusted.humanDesignData);

  if (!tierAllowsCapability(tier, "interpretation_depth")) {
    const freeArchetype = synthesizeArchetype(
      trusted.astrologyData,
      projected.numerologyData,
      trusted.personalityData,
      projected.humanDesignData,
    );
    projected.archetypeData = {
      ...freeArchetype,
      shadows: [],
    };
    // Free gets a real, bounded narrative from the same evidence-limited archetype,
    // never cached Plus biography or an identity-label list.
    const freeStrength = freeArchetype.strengths.find((value) => typeof value === "string" && value.trim());
    projected.biography = [
      freeArchetype.description,
      freeStrength
        ? `A possible strength to test is ${freeStrength}. Notice one concrete situation where it helped, and one where the outcome differed from the symbolism.`
        : "The current evidence does not establish a personal strength; use a recent real event to begin the reflection.",
    ].join(" ");
    projected.dailyGuidance = freeArchetype.guidance;
    projected.depthInterpretation = null;
    projected.synthesis = null;
  }

  return projected as T;
}

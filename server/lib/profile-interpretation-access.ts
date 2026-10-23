import { tierAllowsCapability, type SoulCodexTier } from "@shared/product-access";

type AnyRecord = Record<string, any>;

function record(value: unknown): AnyRecord {
  return value && typeof value === "object" ? { ...(value as AnyRecord) } : {};
}

export type ProfileInterpretationInputs = {
  numerologyData: AnyRecord;
  humanDesignData: AnyRecord;
};

/**
 * Limits the symbolic inputs that may influence user-facing synthesis.
 * Storage keeps the complete verified calculation; this projection only controls
 * which layers are allowed to influence prose for the current entitled tier.
 */
export function projectInterpretationInputsForTier(
  tier: SoulCodexTier,
  numerologyValue: unknown,
  humanDesignValue: unknown,
): ProfileInterpretationInputs {
  const numerology = record(numerologyValue);
  const humanDesign = record(humanDesignValue);

  const numerologyData = tierAllowsCapability(tier, "full_name_numerology")
    ? numerology
    : {
        ...numerology,
        expression: null,
        soulUrge: null,
        personality: null,
        maturity: null,
        expressionNumber: null,
        soulUrgeNumber: null,
        interpretations: numerology.interpretations && typeof numerology.interpretations === "object"
          ? {
              lifePath: numerology.interpretations.lifePath,
              birthday: numerology.interpretations.birthday,
              personalYear: numerology.interpretations.personalYear,
            }
          : undefined,
      };

  const humanDesignData = tierAllowsCapability(tier, "human_design_depth")
    ? humanDesign
    : tierAllowsCapability(tier, "human_design_core")
      ? {
          status: humanDesign.status ?? "unresolved",
          type: humanDesign.type,
          strategy: humanDesign.strategy,
          authority: humanDesign.authority,
          profile: humanDesign.profile,
          engine: humanDesign.engine,
          source: humanDesign.source,
          calculatedAt: humanDesign.calculatedAt,
          inputTimestampUtc: humanDesign.inputTimestampUtc,
          verificationReceiptId: humanDesign.verificationReceiptId,
          independentSource: humanDesign.independentSource,
          verifiedAt: humanDesign.verifiedAt,
          reason: humanDesign.reason,
        }
      : {
          status: humanDesign.status === "verified" ? "verified_locked" : humanDesign.status ?? "unresolved",
          reason: humanDesign.reason,
        };

  return { numerologyData, humanDesignData };
}

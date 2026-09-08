import { z } from "zod";
import { toneModeSchema, type ToneMode } from "../schema.js";

/**
 * Internal engine types (Matrix v1).
 * These are NOT the external `SoulCodexOutputV1` contract — they power it.
 */

export const engineConfidenceSchema = z.enum(["high", "medium", "low"]);
export type EngineConfidence = z.infer<typeof engineConfidenceSchema>;

export const sourceSystemSchema = z.enum(["astrology", "human_design", "numerology"]);
export type SourceSystem = z.infer<typeof sourceSystemSchema>;

export const mirrorReactionSchema = z.enum(["fix", "analyze", "talk", "withdraw"]);
export type MirrorReaction = z.infer<typeof mirrorReactionSchema>;

export const mirrorBetrayalSchema = z.enum(["disrespect", "dishonesty", "stupidity", "emotional"]);
export type MirrorBetrayal = z.infer<typeof mirrorBetrayalSchema>;

export const mirrorDrainSchema = z.enum(["chaos", "repetition", "lies", "misunderstood"]);
export type MirrorDrain = z.infer<typeof mirrorDrainSchema>;

export const mirrorFreedomBuildSchema = z.enum(["system", "movement", "masterpiece", "sanctuary"]);
export type MirrorFreedomBuild = z.infer<typeof mirrorFreedomBuildSchema>;

export const mirrorAnswersSchema = z.object({
  reaction: z.array(mirrorReactionSchema).default([]),
  betrayal: z.array(mirrorBetrayalSchema).default([]),
  drain: z.array(mirrorDrainSchema).default([]),
  freedomBuild: z.array(mirrorFreedomBuildSchema).default([]),
});
export type MirrorAnswers = z.infer<typeof mirrorAnswersSchema>;

export type MirrorProfile = {
  driver: string;
  shadowTrigger: string;
  decisionStyle: string;
  energyStyle: string;
  conflictStyle: string;
  nuance?: string[];
};

export const traitSignalSchema = z.object({
  trait_key: z.string().min(1),
  value: z.number().min(-10).max(10),
  confidence: engineConfidenceSchema,
  sources: z.array(sourceSystemSchema).min(1),
  notes: z.string().optional(),
});
export type TraitSignal = z.infer<typeof traitSignalSchema>;

export const statementSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  tone: toneModeSchema.default("clean"),
  confidence: engineConfidenceSchema.default("medium"),
  text: z.string().min(1),
  source_support: z.array(sourceSystemSchema).default([]),
  tags: z.array(z.string()).default([]),
});
export type Statement = z.infer<typeof statementSchema>;

export const contradictionRuleSchema = z.object({
  if_all_present: z.array(z.string()).min(2),
  block: z.array(z.string()).min(1),
});
export type ContradictionRule = z.infer<typeof contradictionRuleSchema>;

export const contradictionRulesSchema = z.object({
  rules: z.array(contradictionRuleSchema).default([]),
});
export type ContradictionRules = z.infer<typeof contradictionRulesSchema>;

export const bannedLanguageSchema = z.object({
  phrases: z.array(z.string()).default([]),
});
export type BannedLanguage = z.infer<typeof bannedLanguageSchema>;

export const weightingRulesSchema = z.object({
  weights: z
    .object({
      astrology: z.number(),
      human_design: z.number(),
      numerology: z.number(),
    })
    .refine((w) => Math.abs(w.astrology + w.human_design + w.numerology - 1) < 1e-6, {
      message: "weights must sum to 1",
    }),
});
export type WeightingRules = z.infer<typeof weightingRulesSchema>;

export const traitMatrixEntrySchema = z.object({
  trait_key: z.string().min(1),
  source: sourceSystemSchema,
  signal_key: z.string().min(1),
  value: z.number().min(-10).max(10),
  confidence: engineConfidenceSchema.default("medium"),
});
export type TraitMatrixEntry = z.infer<typeof traitMatrixEntrySchema>;

export const traitMappingMatrixSchema = z.object({
  version: z.string().default("matrix_v1"),
  entries: z.array(traitMatrixEntrySchema).default([]),
});
export type TraitMappingMatrix = z.infer<typeof traitMappingMatrixSchema>;

export type EngineToneMode = ToneMode;

export type SoulCodexEngineOutput = {
  tone_mode: EngineToneMode;
  active_sources: SourceSystem[];
  trait_signals: TraitSignal[];
  statements_by_section: Record<string, Statement[]>;
  daily_guidance: {
    title: string;
    focus: string;
    do: string[];
    dont: string[];
    watch_outs: string[];
    decision_advice: string;
  };
};


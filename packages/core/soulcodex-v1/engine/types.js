import { z } from "zod";
import { toneModeSchema } from "../schema";
/**
 * Internal engine types (Matrix v1).
 * These are NOT the external `SoulCodexOutputV1` contract — they power it.
 */
export const engineConfidenceSchema = z.enum(["high", "medium", "low"]);
export const sourceSystemSchema = z.enum(["astrology", "human_design", "numerology"]);
export const traitSignalSchema = z.object({
    trait_key: z.string().min(1),
    value: z.number().min(-10).max(10),
    confidence: engineConfidenceSchema,
    sources: z.array(sourceSystemSchema).min(1),
    notes: z.string().optional(),
});
export const statementSchema = z.object({
    id: z.string().min(1),
    category: z.string().min(1),
    tone: toneModeSchema.default("clean"),
    confidence: engineConfidenceSchema.default("medium"),
    text: z.string().min(1),
    source_support: z.array(sourceSystemSchema).default([]),
    tags: z.array(z.string()).default([]),
});
export const contradictionRuleSchema = z.object({
    if_all_present: z.array(z.string()).min(2),
    block: z.array(z.string()).min(1),
});
export const contradictionRulesSchema = z.object({
    rules: z.array(contradictionRuleSchema).default([]),
});
export const bannedLanguageSchema = z.object({
    phrases: z.array(z.string()).default([]),
});
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
export const traitMatrixEntrySchema = z.object({
    trait_key: z.string().min(1),
    source: sourceSystemSchema,
    signal_key: z.string().min(1),
    value: z.number().min(-10).max(10),
    confidence: engineConfidenceSchema.default("medium"),
});
export const traitMappingMatrixSchema = z.object({
    version: z.string().default("matrix_v1"),
    entries: z.array(traitMatrixEntrySchema).default([]),
});

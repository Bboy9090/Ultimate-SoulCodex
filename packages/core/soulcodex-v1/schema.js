import { z } from "zod";
export const toneModeSchema = z.enum(["clean", "deep", "raw"]);
export const chartConfidenceBadgeSchema = z.enum(["verified", "partial", "unverified"]);
export const overallConfidenceSchema = z.enum(["high", "medium", "low"]);
export const confidenceMatrixSchema = z.object({
    astrology: chartConfidenceBadgeSchema,
    human_design: chartConfidenceBadgeSchema,
    numerology: chartConfidenceBadgeSchema,
    overall: overallConfidenceSchema,
});
export const inputSummarySchema = z.object({
    birth_date: z.string(),
    birth_time: z.string().optional(),
    birth_location: z.string().optional(),
});
export const coreSystemSchema = z.object({
    astrology: z.object({
        sun: z.string().optional(),
        moon: z.string().optional(),
        rising: z.string().optional(),
        dominant_elements: z.array(z.string()).default([]),
        dominant_modes: z.array(z.string()).default([]),
        major_signatures: z.array(z.string()).default([]),
    }),
    human_design: z.object({
        type: z.string().optional(),
        strategy: z.string().optional(),
        authority: z.string().optional(),
        profile: z.string().optional(),
        definition: z.string().optional(),
        signature: z.string().optional(),
        not_self_theme: z.string().optional(),
    }),
    numerology: z.object({
        life_path: z.number().int().optional(),
    }),
});
export const identitySummarySchema = z.object({
    codename: z.string(),
    one_line: z.string(),
    system_translation: z.string(),
});
export const sectionSchema = z.object({
    title: z.string(),
    summary: z.string(),
    bullets: z.array(z.string()).default([]),
});
export const sectionsSchema = z.object({
    how_you_work: sectionSchema,
    decision_code: sectionSchema,
    relational_pattern: sectionSchema,
    failure_conditions: sectionSchema,
    optimal_conditions: sectionSchema,
    distortion_mode: sectionSchema,
    power_mode: sectionSchema,
    mission_arc: sectionSchema,
});
export const dailyGuidanceSchema = z.object({
    title: z.string(),
    focus: z.string(),
    do: z.array(z.string()).default([]),
    dont: z.array(z.string()).default([]),
    watch_outs: z.array(z.string()).default([]),
    decision_advice: z.string(),
});
export const soulCodexOutputV1Schema = z.object({
    profile_id: z.string(),
    version: z.literal("soul_codex_v1"),
    generated_at: z.string(),
    confidence: confidenceMatrixSchema,
    input_summary: inputSummarySchema,
    core_system: coreSystemSchema,
    identity_summary: identitySummarySchema,
    sections: sectionsSchema,
    daily_guidance: dailyGuidanceSchema,
    tone_mode: toneModeSchema,
});

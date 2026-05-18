import { z } from "zod";
import { chartConfidenceBadgeSchema } from "../schema.js";

const nonEmptyString = z.string().trim().min(1);
const nonEmptyStringList = z.array(nonEmptyString).min(1);

export const explanationSystemSchema = z.enum(["astrology", "human_design", "numerology"]);
export type ExplanationSystem = z.infer<typeof explanationSystemSchema>;

export const explanationConfidenceSchema = z.object({
  badge: chartConfidenceBadgeSchema,
  note: nonEmptyString,
});
export type ExplanationConfidence = z.infer<typeof explanationConfidenceSchema>;

export const explanationEntrySchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  system: explanationSystemSchema,
  technicalMeaning: nonEmptyString,
  plainEnglishMeaning: nonEmptyString,
  whyItMatters: nonEmptyString,
  howItShowsUp: nonEmptyStringList,
  gift: nonEmptyStringList,
  shadow: nonEmptyStringList,
  growthMove: nonEmptyString,
  confidence: explanationConfidenceSchema,
});
export type ExplanationEntry = z.infer<typeof explanationEntrySchema>;

export const explanationLibrarySchema = z.array(explanationEntrySchema).min(1);
export type ExplanationLibrary = z.infer<typeof explanationLibrarySchema>;


import { z } from "zod";

// Zod schemas used at runtime in routes
export const birthDataSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string().min(1),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  timezone: z.string().optional(),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  // Optional: Parent signs for parental influence calculation
  fatherSign: z.string().optional(),
  motherSign: z.string().optional(),
  // Optional: Moral compass answers (1-3 simple questions)
  moralCompassAnswers: z.object({
    familyValues: z.enum(["traditional", "progressive", "mixed", "independent"]).optional(),
    neighborhoodType: z.enum(["close-knit", "diverse", "individualistic", "supportive"]).optional(),
    conflictResolution: z.enum(["direct", "diplomatic", "avoidant", "collaborative"]).optional(),
  }).optional(),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const enneagramAssessmentSchema = z.object({
  responses: z.array(z.number()).min(1),
});

export const mbtiAssessmentSchema = z.object({
  responses: z.array(z.number()).min(1),
});

// Type placeholders to satisfy type-only imports
export type User = any;
export type UpsertUser = any;
export type Profile = any;
export type InsertProfile = any;
export type Person = any;
export type InsertPerson = any;
export type Assessment = any;
export type InsertAssessment = any;
export type AccessCode = any;
export type AccessCodeRedemption = any;
export type InsertAccessCode = any;
export type DailyInsight = any;
export type InsertDailyInsight = any;
export type CompatibilityAnalysis = any;
export type InsertCompatibility = any;
export type LocalUser = any;
export type PushSubscription = any;
export type InsertPushSubscription = any;
export type FrequencyLog = any;
export type InsertFrequencyLog = any;
export type WebhookEvent = any;
export type InsertWebhookEvent = any;

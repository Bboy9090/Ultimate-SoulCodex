import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS - Production-Grade Security
// ═══════════════════════════════════════════════════════════════════════════

// Sanitize string input (remove dangerous characters)
const sanitizedString = (minLength = 1, maxLength = 500) => 
  z.string()
    .min(minLength)
    .max(maxLength)
    .transform(s => s.trim())
    .refine(s => !/[<>{}]/.test(s), "Invalid characters detected");

// Date string validation (YYYY-MM-DD format)
const dateString = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
  .refine(s => !isNaN(Date.parse(s)), "Invalid date");

// Time string validation (HH:MM or HH:MM:SS format)
const timeString = z.string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (expected HH:MM or HH:MM:SS)")
  .optional();

// Latitude/Longitude validation
const latitude = z.union([z.string(), z.number()])
  .transform(v => typeof v === "string" ? parseFloat(v) : v)
  .refine(v => v >= -90 && v <= 90, "Latitude must be between -90 and 90")
  .optional();

const longitude = z.union([z.string(), z.number()])
  .transform(v => typeof v === "string" ? parseFloat(v) : v)
  .refine(v => v >= -180 && v <= 180, "Longitude must be between -180 and 180")
  .optional();

// Birth data schema with comprehensive validation
export const birthDataSchema = z.object({
  name: sanitizedString(1, 100),
  birthDate: dateString,
  birthTime: timeString,
  birthLocation: sanitizedString(1, 200).optional(),
  timezone: z.string().max(50).optional(),
  latitude: latitude,
  longitude: longitude,
});

// Strong password requirements
const strongPassword = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .refine(
    s => /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s),
    "Password must contain lowercase, uppercase, and a number"
  );

// Email validation with normalization
const normalizedEmail = z.string()
  .email("Invalid email format")
  .max(254, "Email too long")
  .transform(s => s.toLowerCase().trim());

export const signupSchema = z.object({
  email: normalizedEmail,
  password: strongPassword,
  name: sanitizedString(1, 100).optional(),
});

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1, "Password required").max(128),
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

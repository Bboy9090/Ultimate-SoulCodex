import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Active application schema used by server/index.ts and the routed client pages.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  subscriptionPlan: text("subscription_plan"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const profiles = pgTable("soul_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  name: text("name").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  birthTime: text("birth_time"),
  birthLocation: text("birth_location"),
  timezone: text("timezone"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isPremium: boolean("is_premium").default(false),
  astrologyData: jsonb("astrology_data"),
  numerologyData: jsonb("numerology_data"),
  personalityData: jsonb("personality_data"),
  archetypeData: jsonb("archetype_data"),
  humanDesignData: jsonb("human_design_data"),
  vedicAstrologyData: jsonb("vedic_astrology_data"),
  geneKeysData: jsonb("gene_keys_data"),
  iChingData: jsonb("i_ching_data"),
  chineseAstrologyData: jsonb("chinese_astrology_data"),
  kabbalahData: jsonb("kabbalah_data"),
  mayanAstrologyData: jsonb("mayan_astrology_data"),
  chakraData: jsonb("chakra_data"),
  sacredGeometryData: jsonb("sacred_geometry_data"),
  runesData: jsonb("runes_data"),
  sabianSymbolsData: jsonb("sabian_symbols_data"),
  ayurvedaData: jsonb("ayurveda_data"),
  biorhythmsData: jsonb("biorhythms_data"),
  asteroidsData: jsonb("asteroids_data"),
  arabicPartsData: jsonb("arabic_parts_data"),
  fixedStarsData: jsonb("fixed_stars_data"),
  purposeStatement: text("purpose_statement"),
  biography: text("biography"),
  dailyGuidance: text("daily_guidance"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const assessmentResponses = pgTable("assessment_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  assessmentType: text("assessment_type").notNull(),
  responses: jsonb("responses").notNull(),
  calculatedType: text("calculated_type"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessmentResponses).omit({
  id: true,
  createdAt: true,
});

export const birthDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().min(1, "Birth time is required"),
  birthLocation: z.string().min(1, "Birth location is required"),
  timezone: z.string().min(1, "Timezone is required"),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  fatherSign: z.string().optional(),
  motherSign: z.string().optional(),
  moralCompassAnswers: z
    .object({
      familyValues: z.enum(["traditional", "progressive", "mixed", "independent"]).optional(),
      neighborhoodType: z.enum(["close-knit", "diverse", "individualistic", "supportive"]).optional(),
      conflictResolution: z.enum(["direct", "diplomatic", "avoidant", "collaborative"]).optional(),
    })
    .optional(),
  primary_pressure_pattern: z.string().optional(),
  secondary_pressure_pattern: z.string().optional(),
  escalation_pattern: z.string().optional(),
  decision_friction_primary: z.string().optional(),
  decision_friction_secondary: z.string().optional(),
  drain_pattern_primary: z.string().optional(),
  drain_pattern_secondary: z.string().optional(),
  stressElement: z.string().optional(),
  decisionStyle: z.string().optional(),
  pressureStyle: z.string().optional(),
  socialEnergy: z.string().optional(),
  nonNegotiables: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
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
  userId: z.string().optional().nullable(),
  sessionId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const enneagramAssessmentSchema = z.object({
  responses: z.array(z.number().min(1).max(5)).length(36),
});

export const mbtiAssessmentSchema = z.object({
  responses: z.array(z.string()).length(20),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessmentResponses.$inferSelect;
export type BirthData = z.infer<typeof birthDataSchema>;
export type EnneagramAssessment = z.infer<typeof enneagramAssessmentSchema>;
export type MBTIAssessment = z.infer<typeof mbtiAssessmentSchema>;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export interface PushSubscription extends InsertPushSubscription {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  sessionId: string | null;
  isActive: boolean;
}

// Transitional types retained for storage interfaces not yet modeled in this lane.
export type UpsertUser = Partial<User> & { id: string };
export type Person = any;
export type InsertPerson = any;
export type AccessCode = any;
export type AccessCodeRedemption = any;
export type InsertAccessCode = any;
export type DailyInsight = any;
export type InsertDailyInsight = any;
export type CompatibilityAnalysis = any;
export type InsertCompatibility = any;
export type LocalUser = any;
export type FrequencyLog = any;
export type InsertFrequencyLog = any;
export type WebhookEvent = any;
export type InsertWebhookEvent = any;

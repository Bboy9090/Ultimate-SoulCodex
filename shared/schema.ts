import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql as drizzleSql } from "drizzle-orm";

// ── Drizzle tables (persistence-critical only) ────────────────────────────────

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id),
  sessionId: text("session_id"),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  birthTime: text("birth_time"),
  birthLocation: text("birth_location"),
  timezone: text("timezone"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  astrologyData: jsonb("astrology_data").$type<any>(),
  numerologyData: jsonb("numerology_data").$type<any>(),
  humanDesignData: jsonb("human_design_data").$type<any>(),
  elementalProfile: jsonb("elemental_profile").$type<any>(),
  soulArchetype: jsonb("soul_archetype").$type<any>(),
  personalityData: jsonb("personality_data").$type<any>(),
  archetypeData: jsonb("archetype_data").$type<any>(),
  soulCodexData: jsonb("soul_codex_data").$type<any>(),
  isPublic: boolean("is_public").default(false),
  // Flexible bag for any other esoteric system data
  data: jsonb("data").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: index("profiles_user_idx").on(t.userId),
  sessionIdx: index("profiles_session_idx").on(t.sessionId),
}));

export const accessCodes = pgTable("access_codes", {
  id: varchar("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  code: text("code").notNull(),
  maxUses: integer("max_uses").notNull().default(1),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  codeIdx: uniqueIndex("access_codes_code_idx").on(t.code),
}));

export const accessCodeRedemptions = pgTable("access_code_redemptions", {
  id: varchar("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  accessCodeId: varchar("access_code_id").notNull(),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: index("redemptions_user_idx").on(t.userId),
  sessionIdx: index("redemptions_session_idx").on(t.sessionId),
  codeIdx: index("redemptions_code_idx").on(t.accessCodeId),
}));

export const users = pgTable("users", {
  id: text("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  appleId: text("apple_id").unique(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  subscriptionStatus: text("subscription_status").default("free"),
  personalityData: jsonb("personality_data").$type<any>(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  appleIdx: uniqueIndex("users_apple_idx").on(t.appleId),
  emailIdx: index("users_email_idx").on(t.email),
}));

export const localUsers = pgTable("local_users", {
  id: text("id").primaryKey().references(() => users.id), // Links to users.id
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordVersion: integer("password_version").notNull().default(1),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("local_users_email_idx").on(t.email),
}));

export const shareableLinks = pgTable("shareable_links", {
  id: text("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  profileId: text("profile_id").notNull().references(() => profiles.id),
  userId: text("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  url: text("url").notNull(),
  settings: jsonb("settings").$type<any>().notNull(),
  accessCount: integer("access_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  tokenIdx: uniqueIndex("shareable_links_token_idx").on(t.token),
  userIdx: index("shareable_links_user_idx").on(t.userId),
  profileIdx: index("shareable_links_profile_idx").on(t.profileId),
}));

export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  profileId: text("profile_id").references(() => profiles.id),
  content: text("content").notNull(),
  category: text("category"),
  mood: text("mood"),
  date: timestamp("date").notNull().defaultNow(),
  meta: jsonb("meta").$type<any>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: index("journal_user_idx").on(t.userId),
  profileIdx: index("journal_profile_idx").on(t.profileId),
}));

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (t) => ({
  expireIdx: index("sessions_expire_idx").on(t.expire),
}));

// ── Zod runtime schemas (used by routes) ──────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("soul_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  birthTime: text("birth_time").notNull(),
  birthLocation: text("birth_location").notNull(),
  timezone: text("timezone").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  isPremium: boolean("is_premium").default(false),
  
  // Astrology data
  astrologyData: jsonb("astrology_data"),
  
  // Numerology data
  numerologyData: jsonb("numerology_data"),
  
  // Personality data
  personalityData: jsonb("personality_data"),
  
  // Archetype synthesis
  archetypeData: jsonb("archetype_data"),
  
  // Generated content
  biography: text("biography"),
  dailyGuidance: text("daily_guidance"),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const assessmentResponses = pgTable("assessment_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  assessmentType: text("assessment_type").notNull(), // 'enneagram', 'mbti'
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessmentResponses.$inferSelect;

// Additional schemas for API requests
export const birthDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().min(1, "Birth time is required"),
  birthLocation: z.string().min(1, "Birth location is required"),
  timezone: z.string().min(1, "Timezone is required"),
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
  // Questionnaire signals
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
});

export const enneagramAssessmentSchema = z.object({
  responses: z.array(z.number().min(1).max(5)).length(36),
});

export const mbtiAssessmentSchema = z.object({
  responses: z.array(z.string()).length(20),
});

export type BirthData = z.infer<typeof birthDataSchema>;
export type EnneagramAssessment = z.infer<typeof enneagramAssessmentSchema>;
export type MBTIAssessment = z.infer<typeof mbtiAssessmentSchema>;
export type PushSubscription = any;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

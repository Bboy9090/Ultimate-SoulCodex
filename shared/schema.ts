import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

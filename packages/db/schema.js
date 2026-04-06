import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
    createdAt: timestamp("created_at").default(sql `now()`),
    updatedAt: timestamp("updated_at").default(sql `now()`),
});
export const profiles = pgTable("soul_profiles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
    // Astrology data
    astrologyData: jsonb("astrology_data"),
    // Numerology data
    numerologyData: jsonb("numerology_data"),
    // Personality data
    personalityData: jsonb("personality_data"),
    // Archetype synthesis
    archetypeData: jsonb("archetype_data"),
    // Additional synthesis data
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
    // Generated content
    biography: text("biography"),
    dailyGuidance: text("daily_guidance"),
    createdAt: timestamp("created_at").default(sql `now()`),
    updatedAt: timestamp("updated_at").default(sql `now()`),
});
export const assessmentResponses = pgTable("assessment_responses", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    profileId: varchar("profile_id").notNull(),
    assessmentType: text("assessment_type").notNull(), // 'enneagram', 'mbti'
    responses: jsonb("responses").notNull(),
    calculatedType: text("calculated_type"),
    createdAt: timestamp("created_at").default(sql `now()`),
});
export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertAssessmentSchema = createInsertSchema(assessmentResponses);
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

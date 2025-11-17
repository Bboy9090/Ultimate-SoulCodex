var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/zodiac-compatibility.ts
var zodiac_compatibility_exports = {};
__export(zodiac_compatibility_exports, {
  calculateZodiacCompatibility: () => calculateZodiacCompatibility
});
function getElement2(sign) {
  for (const [element, signs] of Object.entries(ELEMENTS2)) {
    if (signs.includes(sign)) return element;
  }
  return "";
}
function getModality(sign) {
  for (const [modality, signs] of Object.entries(MODALITIES)) {
    if (signs.includes(sign)) return modality;
  }
  return "";
}
function calculateZodiacCompatibility(sign1, sign2) {
  const element1 = getElement2(sign1);
  const element2 = getElement2(sign2);
  const modality1 = getModality(sign1);
  const modality2 = getModality(sign2);
  let score = 50;
  let explanation = "";
  const strengths = [];
  const challenges = [];
  if (sign1 === sign2) {
    score = 75;
    explanation = `Two ${sign1} individuals understand each other deeply but may mirror each other's flaws.`;
    strengths.push("Deep mutual understanding", "Shared values and approach to life", "Natural rhythm together");
    challenges.push("May enable each other's weaknesses", "Risk of stagnation", "Need outside perspectives");
    return { score, explanation, strengths, challenges };
  }
  if (OPPOSITES[sign1] === sign2) {
    score = 72;
    explanation = `${sign1} and ${sign2} are opposite signs, creating magnetic attraction and dynamic tension that promotes growth.`;
    strengths.push("Powerful attraction", "Learn from differences", "Balance each other's extremes");
    challenges.push("Can clash on fundamental approaches", "Requires compromise", "May feel too different at times");
    return { score, explanation, strengths, challenges };
  }
  if (element1 === element2) {
    score = 88;
    explanation = `Both ${element1} signs, ${sign1} and ${sign2} share a natural rhythm and understanding.`;
    if (element1 === "Fire") {
      strengths.push("Passionate connection", "Shared enthusiasm and energy", "Mutual encouragement");
      challenges.push("May burn too hot", "Competition for attention", "Impulsive decisions together");
    } else if (element1 === "Earth") {
      strengths.push("Stable foundation", "Shared practical goals", "Reliable partnership");
      challenges.push("May be too cautious", "Risk of routine", "Resistance to change");
    } else if (element1 === "Air") {
      strengths.push("Intellectual stimulation", "Great communication", "Freedom and space");
      challenges.push("Emotional distance possible", "Overthinking issues", "May avoid conflict");
    } else if (element1 === "Water") {
      strengths.push("Deep emotional bond", "Intuitive understanding", "Nurturing connection");
      challenges.push("Mood sensitivity", "May be too emotional", "Boundary issues");
    }
    return { score, explanation, strengths, challenges };
  }
  if (EXCELLENT_PAIRS[sign1]?.includes(sign2)) {
    score = 85;
    if (element1 === "Fire" && element2 === "Air" || element1 === "Air" && element2 === "Fire") {
      explanation = `${sign1} (${element1}) and ${sign2} (${element2}) create an exciting, dynamic partnership. Air feeds Fire, Fire inspires Air.`;
      strengths.push("Stimulating connection", "Shared love of adventure", "Growth-oriented");
      challenges.push("May lack emotional depth", "Can be inconsistent", "Need grounding");
    } else if (element1 === "Earth" && element2 === "Water" || element1 === "Water" && element2 === "Earth") {
      explanation = `${sign1} (${element1}) and ${sign2} (${element2}) form a nurturing, stable bond. Earth provides structure, Water brings emotional depth.`;
      strengths.push("Emotionally secure", "Build together effectively", "Mutual support");
      challenges.push("May resist change", "Can be too serious", "Need spontaneity");
    } else {
      explanation = `${sign1} and ${sign2} have natural compatibility with complementary strengths.`;
      strengths.push("Compatible energies", "Mutual respect", "Balanced dynamic");
      challenges.push("Occasional misunderstandings", "Different pacing", "Growth requires effort");
    }
    return { score, explanation, strengths, challenges };
  }
  if (CHALLENGING_PAIRS[sign1]?.includes(sign2)) {
    score = 55;
    explanation = `${sign1} and ${sign2} form a challenging square aspect, creating friction that can lead to growth if worked through.`;
    strengths.push("Growth through challenge", "Learn new perspectives", "Dynamic interaction");
    challenges.push("Different fundamental approaches", "Frequent misunderstandings", "Requires patience and compromise");
    return { score, explanation, strengths, challenges };
  }
  if (element1 === "Fire" && element2 === "Air" || element1 === "Air" && element2 === "Fire") {
    score = 78;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) have complementary energies - Air fuels Fire, Fire warms Air.`;
    strengths.push("Exciting partnership", "Intellectual and passionate", "Inspire each other");
    challenges.push("May lack depth", "Can be restless", "Need emotional grounding");
  } else if (element1 === "Earth" && element2 === "Water" || element1 === "Water" && element2 === "Earth") {
    score = 78;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) complement each other - Water nourishes Earth, Earth contains Water.`;
    strengths.push("Stable and nurturing", "Emotional security", "Build lasting foundations");
    challenges.push("May avoid risks", "Can be too cautious", "Need adventure");
  } else if (element1 === "Fire" && element2 === "Water" || element1 === "Water" && element2 === "Fire") {
    score = 58;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) have conflicting energies - Fire and Water can create steam or extinguish each other.`;
    strengths.push("Intense connection", "Learn balance", "Passionate but volatile");
    challenges.push("Emotional vs. action-oriented", "Different needs", "Requires understanding");
  } else if (element1 === "Earth" && element2 === "Air" || element1 === "Air" && element2 === "Earth") {
    score = 62;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) approach life differently - Earth seeks security, Air seeks freedom.`;
    strengths.push("Balance practical and intellectual", "Broaden perspectives", "Complementary skills");
    challenges.push("Different priorities", "Communication gaps", "Requires compromise");
  } else if (element1 === "Fire" && element2 === "Earth" || element1 === "Earth" && element2 === "Fire") {
    score = 55;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) have very different approaches - Fire is impulsive and passionate while Earth is steady and practical.`;
    strengths.push("Can balance each other out", "Learn different perspectives", "Create through action + planning");
    challenges.push("Different paces of life", "Fire may feel restricted, Earth may feel rushed", "Requires patience and understanding");
  }
  if (modality1 === modality2 && element1 !== element2) {
    if (score < 65) {
      score += 8;
      if (strengths.length > 0) {
        strengths.push("Shared pace and initiative");
      }
    }
  }
  if (!explanation) {
    score = 60;
    explanation = `${sign1} and ${sign2} have moderate compatibility, requiring effort and understanding to make the relationship work.`;
    strengths.push("Opportunity for growth", "Learn from differences", "Can build with effort");
    challenges.push("Different natural approaches", "Requires conscious effort", "May need to work harder on understanding");
  }
  return { score, explanation, strengths, challenges };
}
var ELEMENTS2, MODALITIES, EXCELLENT_PAIRS, CHALLENGING_PAIRS, OPPOSITES;
var init_zodiac_compatibility = __esm({
  "server/services/zodiac-compatibility.ts"() {
    "use strict";
    ELEMENTS2 = {
      Fire: ["Aries", "Leo", "Sagittarius"],
      Earth: ["Taurus", "Virgo", "Capricorn"],
      Air: ["Gemini", "Libra", "Aquarius"],
      Water: ["Cancer", "Scorpio", "Pisces"]
    };
    MODALITIES = {
      Cardinal: ["Aries", "Cancer", "Libra", "Capricorn"],
      Fixed: ["Taurus", "Leo", "Scorpio", "Aquarius"],
      Mutable: ["Gemini", "Virgo", "Sagittarius", "Pisces"]
    };
    EXCELLENT_PAIRS = {
      Aries: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
      Taurus: ["Virgo", "Capricorn", "Cancer", "Pisces"],
      Gemini: ["Libra", "Aquarius", "Aries", "Leo"],
      Cancer: ["Scorpio", "Pisces", "Taurus", "Virgo"],
      Leo: ["Aries", "Sagittarius", "Gemini", "Libra"],
      Virgo: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
      Libra: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
      Scorpio: ["Cancer", "Pisces", "Virgo", "Capricorn"],
      Sagittarius: ["Aries", "Leo", "Libra", "Aquarius"],
      Capricorn: ["Taurus", "Virgo", "Scorpio", "Pisces"],
      Aquarius: ["Gemini", "Libra", "Aries", "Sagittarius"],
      Pisces: ["Cancer", "Scorpio", "Taurus", "Capricorn"]
    };
    CHALLENGING_PAIRS = {
      Aries: ["Cancer", "Capricorn"],
      Taurus: ["Leo", "Aquarius"],
      Gemini: ["Virgo", "Pisces"],
      Cancer: ["Aries", "Libra"],
      Leo: ["Taurus", "Scorpio"],
      Virgo: ["Gemini", "Sagittarius"],
      Libra: ["Cancer", "Capricorn"],
      Scorpio: ["Leo", "Aquarius"],
      Sagittarius: ["Virgo", "Pisces"],
      Capricorn: ["Aries", "Libra"],
      Aquarius: ["Taurus", "Scorpio"],
      Pisces: ["Gemini", "Sagittarius"]
    };
    OPPOSITES = {
      Aries: "Libra",
      Taurus: "Scorpio",
      Gemini: "Sagittarius",
      Cancer: "Capricorn",
      Leo: "Aquarius",
      Virgo: "Pisces",
      Libra: "Aries",
      Scorpio: "Taurus",
      Sagittarius: "Gemini",
      Capricorn: "Cancer",
      Aquarius: "Leo",
      Pisces: "Virgo"
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accessCodes: () => accessCodes,
  assessmentResponses: () => assessmentResponses,
  birthDataSchema: () => birthDataSchema,
  compatibilityAnalyses: () => compatibilityAnalyses,
  dailyInsights: () => dailyInsights,
  enneagramAssessmentSchema: () => enneagramAssessmentSchema,
  frequencyLogs: () => frequencyLogs,
  insertAccessCodeSchema: () => insertAccessCodeSchema,
  insertAssessmentSchema: () => insertAssessmentSchema,
  insertCompatibilitySchema: () => insertCompatibilitySchema,
  insertDailyInsightSchema: () => insertDailyInsightSchema,
  insertFrequencyLogSchema: () => insertFrequencyLogSchema,
  insertPersonSchema: () => insertPersonSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertPushSubscriptionSchema: () => insertPushSubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  localUsers: () => localUsers,
  loginSchema: () => loginSchema,
  mbtiAssessmentSchema: () => mbtiAssessmentSchema,
  persons: () => persons,
  profiles: () => profiles,
  pushSubscriptions: () => pushSubscriptions,
  sessions: () => sessions,
  signupSchema: () => signupSchema,
  users: () => users,
  validateAccessCodeSchema: () => validateAccessCodeSchema
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var localUsers = pgTable("local_users", {
  id: varchar("id").primaryKey(),
  // References users.id
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordVersion: integer("password_version").notNull().default(1),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var profiles = pgTable("soul_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  birthTime: text("birth_time"),
  // Optional for inclusivity (adoptees, incomplete records)
  birthLocation: text("birth_location"),
  // Optional for inclusivity
  timezone: text("timezone"),
  // Optional for inclusivity
  latitude: text("latitude"),
  // Optional for inclusivity
  longitude: text("longitude"),
  // Optional for inclusivity
  isPremium: boolean("is_premium").default(false),
  // Astrology data
  astrologyData: jsonb("astrology_data"),
  // Numerology data
  numerologyData: jsonb("numerology_data"),
  // Personality data
  personalityData: jsonb("personality_data"),
  // Archetype synthesis
  archetypeData: jsonb("archetype_data"),
  // Human Design data
  humanDesignData: jsonb("human_design_data"),
  // New mystical systems (30+ total)
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
  // Generated content
  biography: text("biography"),
  dailyGuidance: text("daily_guidance"),
  // Phase 3: Congruence Score
  purposeStatement: text("purpose_statement"),
  // User's stated "Singular Will" - what they're aligned toward
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var assessmentResponses = pgTable("assessment_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  assessmentType: text("assessment_type").notNull(),
  responses: jsonb("responses").notNull(),
  calculatedType: text("calculated_type"),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var accessCodes = pgTable("access_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  maxUses: integer("max_uses").notNull().default(1),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var dailyInsights = pgTable("daily_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  date: text("date").notNull(),
  templateIds: jsonb("template_ids").notNull(),
  contentHash: text("content_hash").notNull(),
  insightsData: jsonb("insights_data").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var persons = pgTable("persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  // Optional - can be anonymous
  sessionId: varchar("session_id"),
  // For anonymous users, migrated to userId on login
  fullName: text("full_name"),
  dob: text("dob"),
  // ISO date string
  tob: text("tob"),
  // Time of birth (optional)
  birthLocation: text("birth_location"),
  // Optional
  birthLat: text("birth_lat"),
  // Geocoded latitude for synastry calculations
  birthLon: text("birth_lon"),
  // Geocoded longitude for synastry calculations
  psych: jsonb("psych"),
  // {attachment?, loveLanguages?}
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var compatibilityAnalyses = pgTable("compatibility_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profile1Id: varchar("profile_1_id"),
  profile2Id: varchar("profile_2_id"),
  person1Id: varchar("person_1_id"),
  person2Id: varchar("person_2_id"),
  overallScore: integer("overall_score").notNull(),
  compatibilityData: jsonb("compatibility_data").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  endpoint: text("endpoint").notNull().unique(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var frequencyLogs = pgTable("frequency_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  frequency: integer("frequency").notNull(),
  notes: text("notes"),
  notificationContext: text("notification_context"),
  activeTransits: jsonb("active_transits"),
  // Phase 2: Transit correlation data at log time
  loggedAt: timestamp("logged_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAssessmentSchema = createInsertSchema(assessmentResponses).omit({
  id: true,
  createdAt: true
});
var insertAccessCodeSchema = createInsertSchema(accessCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDailyInsightSchema = createInsertSchema(dailyInsights).omit({
  id: true,
  createdAt: true
});
var insertPersonSchema = createInsertSchema(persons).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCompatibilitySchema = createInsertSchema(compatibilityAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertFrequencyLogSchema = createInsertSchema(frequencyLogs).omit({
  id: true,
  createdAt: true
}).extend({
  frequency: z.number().int().min(1).max(10)
});
var validateAccessCodeSchema = z.object({
  code: z.string().min(1, "Access code is required")
});
var birthDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().optional(),
  // Optional for inclusivity (adoptees, incomplete records)
  birthLocation: z.string().optional(),
  // Optional for inclusivity
  timezone: z.string().optional(),
  // Optional when time/location unknown
  latitude: z.string().optional(),
  // Optional when location unknown
  longitude: z.string().optional()
  // Optional when location unknown
});
var enneagramAssessmentSchema = z.object({
  responses: z.array(z.number().min(1).max(5)).length(6)
});
var mbtiAssessmentSchema = z.object({
  responses: z.array(z.string()).length(4)
});
var signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  name: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, or, desc, gte, lte, sql as drizzleSql } from "drizzle-orm";
var DbStorage = class {
  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async upsertUser(userData) {
    const result = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: drizzleSql`now()`
      }
    }).returning();
    return result[0];
  }
  // Local authentication operations
  async getLocalUserByEmail(email) {
    const result = await db.select().from(localUsers).where(eq(localUsers.email, email));
    return result[0];
  }
  async createLocalUser(userId, email, passwordHash) {
    const result = await db.insert(localUsers).values({
      id: userId,
      email,
      passwordHash,
      passwordVersion: 1
    }).returning();
    return result[0];
  }
  async updateLocalUserLastLogin(id) {
    await db.update(localUsers).set({ lastLoginAt: drizzleSql`now()`, updatedAt: drizzleSql`now()` }).where(eq(localUsers.id, id));
  }
  // Profile operations
  async getProfile(id) {
    const result = await db.select().from(profiles).where(eq(profiles.id, id));
    return result[0];
  }
  async getProfileByUserId(userId) {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return result[0];
  }
  async getAllProfiles() {
    return await db.select().from(profiles);
  }
  async createProfile(profile) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const result = await db.insert(profiles).values({
      ...profile,
      id,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0];
  }
  async updateProfile(id, updates) {
    const result = await db.update(profiles).set({ ...updates, updatedAt: drizzleSql`now()` }).where(eq(profiles.id, id)).returning();
    if (!result[0]) throw new Error("Profile not found");
    return result[0];
  }
  // Assessment operations
  async getAssessment(profileId, type) {
    const result = await db.select().from(assessmentResponses).where(and(eq(assessmentResponses.profileId, profileId), eq(assessmentResponses.assessmentType, type)));
    return result[0];
  }
  async createAssessment(assessment) {
    const id = randomUUID();
    const result = await db.insert(assessmentResponses).values({
      ...assessment,
      id,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  // Access code operations
  async getAccessCode(code) {
    const result = await db.select().from(accessCodes).where(drizzleSql`LOWER(${accessCodes.code}) = LOWER(${code})`);
    return result[0];
  }
  async createAccessCode(insertAccessCode) {
    const maxUses = insertAccessCode.maxUses || 1;
    if (maxUses < 1) {
      throw new Error("maxUses must be at least 1");
    }
    if (insertAccessCode.expiresAt && insertAccessCode.expiresAt < /* @__PURE__ */ new Date()) {
      throw new Error("expiresAt must be in the future");
    }
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const result = await db.insert(accessCodes).values({
      ...insertAccessCode,
      id,
      maxUses,
      usesCount: 0,
      isActive: insertAccessCode.isActive ?? true,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0];
  }
  async updateAccessCode(id, updates) {
    if (updates.maxUses !== void 0 && updates.maxUses < 1) {
      throw new Error("maxUses must be at least 1");
    }
    if (updates.usesCount !== void 0 && updates.usesCount < 0) {
      throw new Error("usesCount cannot be negative");
    }
    if (updates.expiresAt && updates.expiresAt < /* @__PURE__ */ new Date()) {
      throw new Error("expiresAt must be in the future");
    }
    const result = await db.update(accessCodes).set({ ...updates, updatedAt: drizzleSql`now()` }).where(eq(accessCodes.id, id)).returning();
    if (!result[0]) throw new Error("Access code not found");
    if (result[0].usesCount > result[0].maxUses) {
      throw new Error("usesCount cannot exceed maxUses");
    }
    return result[0];
  }
  async getAllAccessCodes() {
    return await db.select().from(accessCodes);
  }
  async incrementAccessCodeUse(code) {
    const accessCode = await this.getAccessCode(code);
    if (!accessCode) {
      throw new Error("Access code not found");
    }
    if (!accessCode.isActive) {
      throw new Error("Access code is inactive");
    }
    if (accessCode.expiresAt && accessCode.expiresAt < /* @__PURE__ */ new Date()) {
      throw new Error("Access code has expired");
    }
    if (accessCode.usesCount >= accessCode.maxUses) {
      throw new Error("Access code has reached maximum uses");
    }
    return await this.updateAccessCode(accessCode.id, {
      usesCount: accessCode.usesCount + 1
    });
  }
  // Daily insight operations
  async getDailyInsight(profileId, date) {
    const result = await db.select().from(dailyInsights).where(and(eq(dailyInsights.profileId, profileId), eq(dailyInsights.date, date)));
    return result[0];
  }
  async createDailyInsight(insight) {
    const id = randomUUID();
    const result = await db.insert(dailyInsights).values({
      ...insight,
      id,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getRecentTemplateIds(profileId, days) {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0];
    const insights = await db.select().from(dailyInsights).where(and(eq(dailyInsights.profileId, profileId), gte(dailyInsights.date, cutoffDateStr)));
    const templateIds = [];
    for (const insight of insights) {
      if (Array.isArray(insight.templateIds)) {
        templateIds.push(...insight.templateIds);
      }
    }
    return templateIds;
  }
  // Person operations
  async getPerson(id) {
    const result = await db.select().from(persons).where(eq(persons.id, id));
    return result[0];
  }
  async getPersonsByUserId(userId) {
    return await db.select().from(persons).where(eq(persons.userId, userId)).orderBy(desc(persons.createdAt));
  }
  async getPersonsBySessionId(sessionId) {
    return await db.select().from(persons).where(eq(persons.sessionId, sessionId)).orderBy(desc(persons.createdAt));
  }
  async migratePersonsFromSessionToUser(sessionId, userId) {
    const result = await db.update(persons).set({ userId, sessionId: null }).where(and(eq(persons.sessionId, sessionId), drizzleSql`${persons.userId} IS NULL`)).returning();
    return result.length;
  }
  async createPerson(person) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const result = await db.insert(persons).values({
      ...person,
      id,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0];
  }
  async updatePerson(id, updates) {
    const result = await db.update(persons).set({ ...updates, updatedAt: drizzleSql`now()` }).where(eq(persons.id, id)).returning();
    if (!result[0]) throw new Error("Person not found");
    return result[0];
  }
  async deletePerson(id) {
    await db.delete(persons).where(eq(persons.id, id));
  }
  // Compatibility operations
  async getCompatibility(profile1Id, profile2Id) {
    const result = await db.select().from(compatibilityAnalyses).where(
      or(
        and(eq(compatibilityAnalyses.profile1Id, profile1Id), eq(compatibilityAnalyses.profile2Id, profile2Id)),
        and(eq(compatibilityAnalyses.profile1Id, profile2Id), eq(compatibilityAnalyses.profile2Id, profile1Id))
      )
    );
    return result[0];
  }
  async createCompatibility(compatibility) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const result = await db.insert(compatibilityAnalyses).values({
      ...compatibility,
      id,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0];
  }
  async getProfileCompatibilities(profileId) {
    return await db.select().from(compatibilityAnalyses).where(or(eq(compatibilityAnalyses.profile1Id, profileId), eq(compatibilityAnalyses.profile2Id, profileId)));
  }
  // Push subscription operations
  async getPushSubscription(endpoint) {
    const result = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return result[0];
  }
  async getPushSubscriptionsByUser(userId) {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }
  async getPushSubscriptionsBySession(sessionId) {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.sessionId, sessionId));
  }
  async createPushSubscription(subscription) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const result = await db.insert(pushSubscriptions).values({
      ...subscription,
      id,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0];
  }
  async updatePushSubscription(id, updates) {
    const result = await db.update(pushSubscriptions).set({ ...updates, updatedAt: drizzleSql`now()` }).where(eq(pushSubscriptions.id, id)).returning();
    if (!result[0]) throw new Error("Push subscription not found");
    return result[0];
  }
  async deletePushSubscription(endpoint) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }
  // Frequency log operations
  async createFrequencyLog(log2) {
    const id = randomUUID();
    const result = await db.insert(frequencyLogs).values({
      ...log2,
      id,
      loggedAt: log2.loggedAt || /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getFrequencyLogsByUser(userId) {
    return await db.select().from(frequencyLogs).where(eq(frequencyLogs.userId, userId)).orderBy(desc(frequencyLogs.loggedAt));
  }
  async getFrequencyLogsBySession(sessionId) {
    return await db.select().from(frequencyLogs).where(eq(frequencyLogs.sessionId, sessionId)).orderBy(desc(frequencyLogs.loggedAt));
  }
  async getFrequencyLogsInRange(userId, sessionId, startDate, endDate) {
    const userCondition = userId ? eq(frequencyLogs.userId, userId) : eq(frequencyLogs.sessionId, sessionId);
    return await db.select().from(frequencyLogs).where(and(userCondition, gte(frequencyLogs.loggedAt, startDate), lte(frequencyLogs.loggedAt, endDate))).orderBy(desc(frequencyLogs.loggedAt));
  }
};
var storage = new DbStorage();

// server/services/interpretations.ts
var HOUSE_MEANINGS = {
  1: {
    title: "House of Self",
    description: "Your identity, appearance, first impressions, and how you approach life",
    themes: ["identity", "appearance", "first impressions", "new beginnings"],
    spiritualFocus: "Your soul's primary expression in this incarnation"
  },
  2: {
    title: "House of Values & Resources",
    description: "Your relationship with money, possessions, self-worth, and material resources",
    themes: ["money", "possessions", "self-worth", "resources", "talents"],
    spiritualFocus: "Learning to value your divine gifts and manifest abundance"
  },
  3: {
    title: "House of Communication",
    description: "How you communicate, learn, think, and connect with your immediate environment",
    themes: ["communication", "learning", "siblings", "short trips", "everyday life"],
    spiritualFocus: "Sharing your truth and connecting with your community"
  },
  4: {
    title: "House of Home & Roots",
    description: "Your family, home, emotional foundation, and connection to your ancestral lineage",
    themes: ["family", "home", "emotions", "ancestry", "security"],
    spiritualFocus: "Healing your emotional foundation and family karma"
  },
  5: {
    title: "House of Creative Expression",
    description: "Your creativity, romance, children, joy, and self-expression",
    themes: ["creativity", "romance", "children", "pleasure", "self-expression"],
    spiritualFocus: "Expressing your divine creativity and experiencing joy"
  },
  6: {
    title: "House of Service & Health",
    description: "Your daily routines, work, health, service to others, and self-improvement",
    themes: ["work", "health", "service", "daily routines", "improvement"],
    spiritualFocus: "Serving others and maintaining your physical temple"
  },
  7: {
    title: "House of Partnerships",
    description: "Your relationships, marriage, partnerships, and how you relate to others",
    themes: ["relationships", "marriage", "partnerships", "cooperation", "balance"],
    spiritualFocus: "Learning through relationships and finding your divine complement"
  },
  8: {
    title: "House of Transformation",
    description: "Shared resources, transformation, death/rebirth, occult knowledge, sexuality",
    themes: ["transformation", "shared resources", "sexuality", "occult", "rebirth"],
    spiritualFocus: "Deep soul transformation and merging with the divine"
  },
  9: {
    title: "House of Higher Wisdom",
    description: "Philosophy, higher education, travel, spirituality, and quest for meaning",
    themes: ["philosophy", "higher learning", "travel", "spirituality", "meaning"],
    spiritualFocus: "Expanding your consciousness and seeking higher truth"
  },
  10: {
    title: "House of Career & Reputation",
    description: "Your career, public image, reputation, authority, and life direction",
    themes: ["career", "reputation", "authority", "achievement", "direction"],
    spiritualFocus: "Fulfilling your soul's mission in the world"
  },
  11: {
    title: "House of Community & Dreams",
    description: "Friends, groups, hopes, dreams, humanitarian causes, and collective consciousness",
    themes: ["friends", "groups", "hopes", "dreams", "community", "ideals"],
    spiritualFocus: "Contributing to collective evolution and manifesting your vision"
  },
  12: {
    title: "House of Spirituality & Release",
    description: "Spirituality, subconscious, karma, hidden things, and connection to the divine",
    themes: ["spirituality", "subconscious", "karma", "sacrifice", "transcendence"],
    spiritualFocus: "Surrendering to divine will and completing karmic cycles"
  }
};
var PLANET_SIGN_INTERPRETATIONS = {
  sun: {
    "Aries": {
      title: "The Pioneering Spirit",
      description: "You are a natural leader with fierce independence and pioneering spirit. Your soul purpose involves initiating new ventures and inspiring others to take action.",
      keywords: ["leadership", "independence", "courage", "initiative"],
      spiritualMeaning: "Your divine essence expresses through bold action and fearless self-assertion. You're here to lead others into new territories of consciousness."
    },
    "Taurus": {
      title: "The Sacred Builder",
      description: "You have a steady, grounded approach to life with deep appreciation for beauty and comfort. Your purpose involves creating lasting value and stability.",
      keywords: ["stability", "beauty", "persistence", "sensuality"],
      spiritualMeaning: "Your soul expresses through creating beauty and stability in the material world. You teach others the value of patience and appreciation."
    },
    "Gemini": {
      title: "The Divine Communicator",
      description: "You are curious, adaptable, and gifted with words. Your purpose involves connecting people through communication and sharing knowledge.",
      keywords: ["communication", "curiosity", "adaptability", "connection"],
      spiritualMeaning: "Your essence shines through intellectual exploration and connecting diverse ideas. You bridge different worlds through communication."
    },
    "Cancer": {
      title: "The Emotional Healer",
      description: "You are deeply intuitive and nurturing with strong emotional intelligence. Your purpose involves healing and caring for others.",
      keywords: ["nurturing", "intuition", "protection", "emotion"],
      spiritualMeaning: "Your soul expresses through emotional healing and creating safe spaces for others. You embody the divine feminine principle of nurturing."
    },
    "Leo": {
      title: "The Radiant Creator",
      description: "You are naturally dramatic, creative, and generous with a need to shine and express yourself. Your purpose involves inspiring joy and creativity.",
      keywords: ["creativity", "generosity", "drama", "leadership"],
      spiritualMeaning: "Your divine essence radiates joy and creative power. You're here to remind others of their own inner light and creative potential."
    },
    "Virgo": {
      title: "The Sacred Perfectionist",
      description: "You are detail-oriented, helpful, and dedicated to improvement. Your purpose involves healing and serving others through practical wisdom.",
      keywords: ["service", "perfection", "healing", "analysis"],
      spiritualMeaning: "Your soul expresses through dedicated service and healing. You refine and purify whatever you touch, bringing divine order to chaos."
    },
    "Libra": {
      title: "The Harmony Keeper",
      description: "You seek balance, beauty, and fairness in all things. Your purpose involves creating harmony and teaching others about cooperation.",
      keywords: ["balance", "beauty", "cooperation", "justice"],
      spiritualMeaning: "Your essence manifests through creating beauty and balance. You're a divine diplomat, teaching others the art of harmonious relationships."
    },
    "Scorpio": {
      title: "The Soul Alchemist",
      description: "You are intense, transformative, and drawn to life's mysteries. Your purpose involves deep psychological healing and transformation.",
      keywords: ["transformation", "intensity", "mystery", "regeneration"],
      spiritualMeaning: "Your soul expresses through profound transformation and rebirth. You guide others through their darkest moments into the light."
    },
    "Sagittarius": {
      title: "The Wisdom Seeker",
      description: "You are adventurous, philosophical, and always seeking truth. Your purpose involves expanding consciousness and sharing wisdom.",
      keywords: ["adventure", "wisdom", "truth", "expansion"],
      spiritualMeaning: "Your divine essence seeks ultimate truth and meaning. You're here to expand horizons and teach others about higher possibilities."
    },
    "Capricorn": {
      title: "The Spiritual Authority",
      description: "You are ambitious, responsible, and naturally authoritative. Your purpose involves building lasting structures and achieving mastery.",
      keywords: ["authority", "mastery", "responsibility", "achievement"],
      spiritualMeaning: "Your soul expresses through disciplined achievement and responsible leadership. You build bridges between earth and heaven."
    },
    "Aquarius": {
      title: "The Revolutionary Visionary",
      description: "You are innovative, humanitarian, and ahead of your time. Your purpose involves bringing revolutionary change for humanity's benefit.",
      keywords: ["innovation", "humanity", "revolution", "vision"],
      spiritualMeaning: "Your essence channels future possibilities and collective evolution. You're here to awaken humanity to new ways of being."
    },
    "Pisces": {
      title: "The Mystical Dreamer",
      description: "You are compassionate, intuitive, and deeply spiritual. Your purpose involves healing through love and connecting others to the divine.",
      keywords: ["compassion", "spirituality", "intuition", "healing"],
      spiritualMeaning: "Your soul expresses through boundless compassion and spiritual wisdom. You dissolve boundaries and remind others of universal love."
    }
  },
  moon: {
    "Aries": {
      title: "The Fiery Heart",
      description: "Your emotions are intense and immediate. You need freedom and independence to feel emotionally secure.",
      keywords: ["impulsive", "independent", "passionate", "direct"],
      spiritualMeaning: "Your emotional nature is pioneering and fearless. You process feelings through action and need emotional freedom to thrive."
    },
    "Taurus": {
      title: "The Grounded Heart",
      description: "You seek emotional stability and comfort. Security through material comfort and routine brings you peace.",
      keywords: ["stable", "comfort", "sensual", "patient"],
      spiritualMeaning: "Your emotional security comes from earthly pleasures and stability. You offer others a sense of calm and groundedness."
    },
    "Gemini": {
      title: "The Curious Heart",
      description: "Your emotions are changeable and you need mental stimulation. Communication helps you process feelings.",
      keywords: ["changeable", "curious", "communicative", "restless"],
      spiritualMeaning: "Your emotional nature seeks variety and intellectual connection. You process feelings through words and need mental stimulation."
    },
    "Cancer": {
      title: "The Intuitive Heart",
      description: "You are deeply emotional and intuitive. Home and family are essential for your emotional well-being.",
      keywords: ["nurturing", "intuitive", "protective", "sensitive"],
      spiritualMeaning: "Your emotional nature is deeply intuitive and caring. You feel the emotions of others and offer profound emotional healing."
    },
    "Leo": {
      title: "The Dramatic Heart",
      description: "You need appreciation and recognition to feel emotionally fulfilled. Your feelings are warm and generous.",
      keywords: ["generous", "dramatic", "warm", "proud"],
      spiritualMeaning: "Your emotional nature radiates warmth and seeks creative expression. You need to feel special and appreciated."
    },
    "Virgo": {
      title: "The Analytical Heart",
      description: "You process emotions through analysis and service. Order and usefulness bring emotional satisfaction.",
      keywords: ["analytical", "helpful", "practical", "perfectionist"],
      spiritualMeaning: "Your emotional security comes through serving others and creating order. You heal emotions through practical action."
    },
    "Libra": {
      title: "The Harmonious Heart",
      description: "You need beauty and harmony for emotional balance. Relationships are crucial to your emotional well-being.",
      keywords: ["harmonious", "cooperative", "aesthetic", "peaceful"],
      spiritualMeaning: "Your emotional nature seeks balance and beauty. You feel most secure in harmonious relationships and beautiful environments."
    },
    "Scorpio": {
      title: "The Intense Heart",
      description: "Your emotions run deep and you need emotional intimacy. You're drawn to emotional transformation and healing.",
      keywords: ["intense", "transformative", "secretive", "powerful"],
      spiritualMeaning: "Your emotional nature is profound and transformative. You feel deeply and have the power to heal emotional wounds."
    },
    "Sagittarius": {
      title: "The Adventurous Heart",
      description: "You need freedom and adventure for emotional satisfaction. Optimism and expansion feed your soul.",
      keywords: ["adventurous", "optimistic", "philosophical", "free"],
      spiritualMeaning: "Your emotional nature seeks meaning and adventure. You feel most secure when exploring new horizons and possibilities."
    },
    "Capricorn": {
      title: "The Responsible Heart",
      description: "You need structure and achievement for emotional security. Responsibility and tradition comfort you.",
      keywords: ["responsible", "ambitious", "traditional", "reserved"],
      spiritualMeaning: "Your emotional security comes through achievement and structure. You feel most comfortable with clear goals and traditions."
    },
    "Aquarius": {
      title: "The Rebellious Heart",
      description: "You need independence and intellectual stimulation. Group activities and humanitarian causes fulfill you emotionally.",
      keywords: ["independent", "humanitarian", "unconventional", "detached"],
      spiritualMeaning: "Your emotional nature is unique and humanitarian. You feel secure when contributing to collective progress and maintaining independence."
    },
    "Pisces": {
      title: "The Mystical Heart",
      description: "You are highly sensitive and intuitive. Spiritual connection and creative expression are emotionally essential.",
      keywords: ["sensitive", "intuitive", "creative", "compassionate"],
      spiritualMeaning: "Your emotional nature is deeply spiritual and compassionate. You feel others' emotions as your own and need spiritual connection."
    }
  },
  mercury: {
    "Aries": {
      title: "The Quick Thinker",
      description: "You think and speak quickly with direct, assertive communication. Your mind works at lightning speed.",
      keywords: ["quick", "direct", "assertive", "pioneering"],
      spiritualMeaning: "Your mental energy is pioneering and bold. You think independently and communicate with courage."
    },
    "Taurus": {
      title: "The Practical Mind",
      description: "You think methodically and speak with deliberation. Your mental focus is on practical, tangible results.",
      keywords: ["practical", "methodical", "deliberate", "persistent"],
      spiritualMeaning: "Your mind seeks practical wisdom and enduring truth. You think in terms of real-world application."
    },
    "Gemini": {
      title: "The Versatile Communicator",
      description: "You are naturally gifted with words and quick to learn. Your mind thrives on variety and connection.",
      keywords: ["versatile", "quick", "curious", "adaptable"],
      spiritualMeaning: "Your mental gifts involve connecting ideas and people. You're a natural bridge between different worlds."
    },
    "Cancer": {
      title: "The Intuitive Mind",
      description: "You think with your heart and communicate with sensitivity. Your memory for emotional details is exceptional.",
      keywords: ["intuitive", "sensitive", "caring", "protective"],
      spiritualMeaning: "Your mind processes through emotional intelligence. You think in terms of care and protection."
    },
    "Leo": {
      title: "The Creative Communicator",
      description: "You think dramatically and speak with flair. Your mind is naturally creative and expressive.",
      keywords: ["dramatic", "creative", "expressive", "confident"],
      spiritualMeaning: "Your mental energy is creative and generous. You think in terms of inspiration and self-expression."
    },
    "Virgo": {
      title: "The Analytical Mind",
      description: "You think precisely and communicate with attention to detail. Your mind seeks perfection and practical solutions.",
      keywords: ["analytical", "precise", "helpful", "perfectionist"],
      spiritualMeaning: "Your mental gifts involve healing and service. You think in terms of improvement and refinement."
    },
    "Libra": {
      title: "The Harmonious Mind",
      description: "You think in terms of balance and communicate diplomatically. Your mind seeks fairness and beauty.",
      keywords: ["balanced", "diplomatic", "fair", "aesthetic"],
      spiritualMeaning: "Your mental energy creates harmony and beauty. You think in terms of cooperation and balance."
    },
    "Scorpio": {
      title: "The Penetrating Mind",
      description: "You think deeply and communicate with intensity. Your mind penetrates to the core of any matter.",
      keywords: ["deep", "intense", "penetrating", "transformative"],
      spiritualMeaning: "Your mental energy is transformative and healing. You think in terms of depth and hidden truth."
    },
    "Sagittarius": {
      title: "The Philosophical Mind",
      description: "You think broadly and communicate with enthusiasm. Your mind seeks meaning and higher truth.",
      keywords: ["broad", "enthusiastic", "philosophical", "adventurous"],
      spiritualMeaning: "Your mental energy expands consciousness. You think in terms of meaning and possibility."
    },
    "Capricorn": {
      title: "The Strategic Mind",
      description: "You think strategically and communicate with authority. Your mind is naturally organized and goal-oriented.",
      keywords: ["strategic", "authoritative", "organized", "ambitious"],
      spiritualMeaning: "Your mental energy builds lasting structures. You think in terms of achievement and responsibility."
    },
    "Aquarius": {
      title: "The Innovative Mind",
      description: "You think originally and communicate unconventionally. Your mind is ahead of its time.",
      keywords: ["original", "unconventional", "innovative", "humanitarian"],
      spiritualMeaning: "Your mental energy brings revolutionary insights. You think in terms of collective progress."
    },
    "Pisces": {
      title: "The Mystical Mind",
      description: "You think intuitively and communicate with compassion. Your mind is naturally psychic and artistic.",
      keywords: ["intuitive", "compassionate", "psychic", "artistic"],
      spiritualMeaning: "Your mental energy is deeply spiritual. You think in terms of universal love and transcendence."
    }
  },
  venus: {
    "Aries": {
      title: "The Passionate Lover",
      description: "You love boldly and value independence. Your attractions are immediate and intense.",
      keywords: ["passionate", "bold", "independent", "direct"],
      spiritualMeaning: "You express love through courage and passion. Your heart seeks adventure and excitement."
    },
    "Taurus": {
      title: "The Sensual Lover",
      description: "You love deeply and value stability. Your attractions are based on sensuality and security.",
      keywords: ["sensual", "stable", "loyal", "beautiful"],
      spiritualMeaning: "You express love through physical presence and material comfort. Your heart seeks lasting beauty."
    },
    "Gemini": {
      title: "The Playful Lover",
      description: "You love through communication and value mental connection. Your attractions are based on wit and variety.",
      keywords: ["playful", "communicative", "versatile", "curious"],
      spiritualMeaning: "You express love through words and ideas. Your heart seeks intellectual stimulation and variety."
    },
    "Cancer": {
      title: "The Nurturing Lover",
      description: "You love protectively and value emotional security. Your attractions are based on care and comfort.",
      keywords: ["nurturing", "protective", "emotional", "caring"],
      spiritualMeaning: "You express love through emotional care and nurturing. Your heart seeks deep emotional connection."
    },
    "Leo": {
      title: "The Dramatic Lover",
      description: "You love generously and value appreciation. Your attractions are based on admiration and creativity.",
      keywords: ["generous", "dramatic", "creative", "loyal"],
      spiritualMeaning: "You express love through grand gestures and creativity. Your heart seeks appreciation and admiration."
    },
    "Virgo": {
      title: "The Devoted Lover",
      description: "You love through service and value practical devotion. Your attractions are based on reliability and care.",
      keywords: ["devoted", "practical", "helpful", "pure"],
      spiritualMeaning: "You express love through acts of service and practical care. Your heart seeks genuine devotion."
    },
    "Libra": {
      title: "The Harmonious Lover",
      description: "You love through partnership and value balance. Your attractions are based on beauty and compatibility.",
      keywords: ["harmonious", "balanced", "romantic", "cooperative"],
      spiritualMeaning: "You express love through creating harmony and beauty. Your heart seeks perfect partnership."
    },
    "Scorpio": {
      title: "The Intense Lover",
      description: "You love deeply and value transformation. Your attractions are based on soul connection and mystery.",
      keywords: ["intense", "passionate", "loyal", "transformative"],
      spiritualMeaning: "You express love through deep soul connection. Your heart seeks complete emotional fusion."
    },
    "Sagittarius": {
      title: "The Adventurous Lover",
      description: "You love freely and value growth. Your attractions are based on shared ideals and adventure.",
      keywords: ["adventurous", "free", "optimistic", "philosophical"],
      spiritualMeaning: "You express love through shared adventures and growth. Your heart seeks freedom and expansion."
    },
    "Capricorn": {
      title: "The Committed Lover",
      description: "You love seriously and value commitment. Your attractions are based on respect and shared goals.",
      keywords: ["committed", "serious", "responsible", "traditional"],
      spiritualMeaning: "You express love through commitment and building together. Your heart seeks lasting partnership."
    },
    "Aquarius": {
      title: "The Unique Lover",
      description: "You love unconventionally and value friendship. Your attractions are based on intellectual connection and shared ideals.",
      keywords: ["unique", "friendly", "independent", "humanitarian"],
      spiritualMeaning: "You express love through friendship and shared vision. Your heart seeks intellectual and spiritual connection."
    },
    "Pisces": {
      title: "The Compassionate Lover",
      description: "You love unconditionally and value spiritual connection. Your attractions are based on soul recognition.",
      keywords: ["compassionate", "spiritual", "romantic", "intuitive"],
      spiritualMeaning: "You express love through boundless compassion. Your heart seeks divine love and spiritual union."
    }
  },
  mars: {
    "Aries": {
      title: "The Fearless Warrior",
      description: "You act with courage and directness. Your energy is pioneering and you lead from the front.",
      keywords: ["courageous", "direct", "pioneering", "competitive"],
      spiritualMeaning: "Your warrior energy is pure and fearless. You act on divine impulse and inspire others to be brave."
    },
    "Taurus": {
      title: "The Steady Warrior",
      description: "You act with persistence and determination. Your energy is steady and you build through consistent effort.",
      keywords: ["persistent", "determined", "steady", "practical"],
      spiritualMeaning: "Your warrior energy is grounded and enduring. You fight for security and lasting value."
    },
    "Gemini": {
      title: "The Quick Warrior",
      description: "You act through communication and adaptability. Your energy is versatile and mentally agile.",
      keywords: ["adaptable", "quick", "communicative", "versatile"],
      spiritualMeaning: "Your warrior energy is mental and communicative. You fight with words and ideas."
    },
    "Cancer": {
      title: "The Protective Warrior",
      description: "You act to protect and nurture. Your energy is emotional and you fight for family and security.",
      keywords: ["protective", "emotional", "nurturing", "defensive"],
      spiritualMeaning: "Your warrior energy protects the vulnerable. You fight for emotional security and family."
    },
    "Leo": {
      title: "The Noble Warrior",
      description: "You act with pride and creativity. Your energy is dramatic and you fight for recognition and self-expression.",
      keywords: ["proud", "creative", "dramatic", "generous"],
      spiritualMeaning: "Your warrior energy is noble and creative. You fight for self-expression and inspire others."
    },
    "Virgo": {
      title: "The Precise Warrior",
      description: "You act with precision and dedication. Your energy is focused on improvement and service.",
      keywords: ["precise", "dedicated", "helpful", "analytical"],
      spiritualMeaning: "Your warrior energy serves and heals. You fight for perfection and practical improvement."
    },
    "Libra": {
      title: "The Diplomatic Warrior",
      description: "You act through cooperation and balance. Your energy seeks harmony and fights for justice.",
      keywords: ["diplomatic", "balanced", "cooperative", "just"],
      spiritualMeaning: "Your warrior energy creates harmony. You fight for justice and balanced relationships."
    },
    "Scorpio": {
      title: "The Transformative Warrior",
      description: "You act with intensity and depth. Your energy is transformative and you fight for profound change.",
      keywords: ["intense", "transformative", "powerful", "regenerative"],
      spiritualMeaning: "Your warrior energy transforms and regenerates. You fight for deep psychological healing."
    },
    "Sagittarius": {
      title: "The Adventurous Warrior",
      description: "You act with enthusiasm and vision. Your energy seeks expansion and you fight for truth and freedom.",
      keywords: ["enthusiastic", "adventurous", "philosophical", "free"],
      spiritualMeaning: "Your warrior energy expands consciousness. You fight for truth and spiritual freedom."
    },
    "Capricorn": {
      title: "The Disciplined Warrior",
      description: "You act with discipline and ambition. Your energy is strategic and you fight for achievement and authority.",
      keywords: ["disciplined", "ambitious", "strategic", "authoritative"],
      spiritualMeaning: "Your warrior energy builds lasting structures. You fight for achievement and responsible leadership."
    },
    "Aquarius": {
      title: "The Revolutionary Warrior",
      description: "You act for humanitarian causes. Your energy is innovative and you fight for collective progress.",
      keywords: ["innovative", "humanitarian", "rebellious", "visionary"],
      spiritualMeaning: "Your warrior energy serves humanity. You fight for collective evolution and freedom."
    },
    "Pisces": {
      title: "The Spiritual Warrior",
      description: "You act with compassion and intuition. Your energy is flowing and you fight for spiritual ideals.",
      keywords: ["compassionate", "intuitive", "spiritual", "sacrificial"],
      spiritualMeaning: "Your warrior energy is compassionate and spiritual. You fight for universal love and transcendence."
    }
  },
  jupiter: {
    "Aries": {
      title: "The Courageous Expander",
      description: "You grow through bold action and pioneering ventures. Your faith is expressed through courage and initiative, and you expand by taking risks.",
      keywords: ["adventurous", "bold", "pioneering", "optimistic"],
      spiritualMeaning: "Spiritual Lesson: Trust in divine timing for your bold visions. Your Gift: Inspiring others to take courageous leaps of faith and believe in themselves."
    },
    "Taurus": {
      title: "The Abundant Builder",
      description: "You grow through creating stability and appreciating beauty. Your wisdom comes through patience and building lasting value.",
      keywords: ["prosperous", "patient", "grounded", "appreciative"],
      spiritualMeaning: "Spiritual Lesson: Understanding that true abundance flows from gratitude and appreciation. Your Gift: Manifesting material and spiritual wealth through steady faith."
    },
    "Gemini": {
      title: "The Curious Philosopher",
      description: "You grow through learning, communication, and connecting ideas. Your wisdom expands through diverse knowledge and sharing insights.",
      keywords: ["curious", "communicative", "versatile", "intellectual"],
      spiritualMeaning: "Spiritual Lesson: Finding profound truth in everyday conversations and simple observations. Your Gift: Translating complex wisdom into accessible knowledge for all."
    },
    "Cancer": {
      title: "The Nurturing Sage",
      description: "You grow through emotional connection and creating safe spaces. Your faith is expressed through caring for others and honoring feelings.",
      keywords: ["nurturing", "protective", "intuitive", "generous"],
      spiritualMeaning: "Spiritual Lesson: Learning that emotional vulnerability is a pathway to spiritual expansion. Your Gift: Creating emotional abundance and healing through compassionate presence."
    },
    "Leo": {
      title: "The Generous Leader",
      description: "You grow through creative self-expression and inspiring others. Your wisdom shines when you share your gifts with warmth and confidence.",
      keywords: ["generous", "creative", "dramatic", "inspiring"],
      spiritualMeaning: "Spiritual Lesson: Understanding that true leadership comes from serving others' growth, not ego. Your Gift: Igniting creative fire and confidence in everyone you encounter."
    },
    "Virgo": {
      title: "The Healing Teacher",
      description: "You grow through service, refinement, and practical wisdom. Your faith is expressed through helping others improve their lives.",
      keywords: ["helpful", "analytical", "practical", "healing"],
      spiritualMeaning: "Spiritual Lesson: Finding the sacred in daily routines and humble service to others. Your Gift: Healing and teaching through practical, grounded spiritual wisdom."
    },
    "Libra": {
      title: "The Harmonious Philosopher",
      description: "You grow through relationships, balance, and understanding diverse perspectives. Your wisdom comes from seeking fairness and beauty.",
      keywords: ["diplomatic", "balanced", "fair", "aesthetic"],
      spiritualMeaning: "Spiritual Lesson: Learning that true wisdom emerges from honoring all perspectives equally. Your Gift: Creating bridges of understanding and expanding consciousness through harmony."
    },
    "Scorpio": {
      title: "The Transformative Mystic",
      description: "You grow through deep emotional experiences and spiritual transformation. Your faith is tested and strengthened through crisis and rebirth.",
      keywords: ["intense", "transformative", "passionate", "profound"],
      spiritualMeaning: "Spiritual Lesson: Trusting that death and rebirth cycles are portals to profound wisdom. Your Gift: Guiding others through their darkest nights into spiritual empowerment."
    },
    "Sagittarius": {
      title: "The Truth Seeker",
      description: "You grow through adventure, philosophy, and expanding horizons. Your wisdom is natural, flowing from your connection to universal truth.",
      keywords: ["adventurous", "philosophical", "optimistic", "expansive"],
      spiritualMeaning: "Spiritual Lesson: Understanding that the journey itself is the destination and teacher. Your Gift: Opening minds to infinite possibilities and inspiring spiritual adventure."
    },
    "Capricorn": {
      title: "The Wise Authority",
      description: "You grow through discipline, achievement, and taking responsibility. Your wisdom is earned through patient mastery and integrity.",
      keywords: ["disciplined", "ambitious", "responsible", "masterful"],
      spiritualMeaning: "Spiritual Lesson: Learning that true success is measured by the positive legacy you leave. Your Gift: Building enduring spiritual structures and teaching through example."
    },
    "Aquarius": {
      title: "The Revolutionary Visionary",
      description: "You grow through innovation, humanitarian work, and breaking old paradigms. Your wisdom serves the collective evolution.",
      keywords: ["innovative", "humanitarian", "progressive", "unique"],
      spiritualMeaning: "Spiritual Lesson: Trusting that your unique perspective serves humanity's awakening. Your Gift: Channeling future wisdom to liberate collective consciousness."
    },
    "Pisces": {
      title: "The Compassionate Mystic",
      description: "You grow through spiritual experiences, compassion, and dissolving boundaries. Your faith is boundless and your wisdom flows from universal love.",
      keywords: ["compassionate", "spiritual", "intuitive", "transcendent"],
      spiritualMeaning: "Spiritual Lesson: Understanding that surrendering to divine flow opens infinite wisdom. Your Gift: Channeling universal compassion and healing through spiritual grace."
    }
  },
  saturn: {
    "Aries": {
      title: "The Patient Warrior",
      description: "You're learning to temper impulsiveness with wisdom. Your karmic lesson involves balancing courage with patience and developing disciplined initiative.",
      keywords: ["disciplined", "patient", "strategic", "controlled"],
      spiritualMeaning: "Spiritual Lesson: Mastering the art of strategic action over reactive impulse. Your Gift: Teaching others how to channel raw courage into lasting achievement."
    },
    "Taurus": {
      title: "The Resourceful Master",
      description: "You're learning about true security and value. Your karmic work involves releasing material attachment while building genuine worth.",
      keywords: ["stable", "practical", "patient", "grounded"],
      spiritualMeaning: "Spiritual Lesson: Understanding that real security comes from inner stability, not possessions. Your Gift: Building sustainable abundance through patient, conscious effort."
    },
    "Gemini": {
      title: "The Focused Communicator",
      description: "You're learning to commit to depth over breadth. Your karmic lesson involves developing focused communication and following through on ideas.",
      keywords: ["focused", "committed", "serious", "articulate"],
      spiritualMeaning: "Spiritual Lesson: Finding profound wisdom by going deep into one subject rather than skimming many. Your Gift: Teaching clarity and substance in communication."
    },
    "Cancer": {
      title: "The Emotionally Mature Nurturer",
      description: "You're learning healthy emotional boundaries. Your karmic work involves balancing nurturing with self-care and protecting without smothering.",
      keywords: ["mature", "responsible", "protective", "structured"],
      spiritualMeaning: "Spiritual Lesson: Mastering emotional wisdom through creating healthy boundaries in caring. Your Gift: Teaching others how to nurture without losing themselves."
    },
    "Leo": {
      title: "The Humble Leader",
      description: "You're learning authentic leadership through earned respect. Your karmic lesson involves balancing pride with humility and leading through service.",
      keywords: ["responsible", "dignified", "humble", "authoritative"],
      spiritualMeaning: "Spiritual Lesson: True authority comes from serving others, not demanding recognition. Your Gift: Modeling leadership that empowers rather than dominates."
    },
    "Virgo": {
      title: "The Perfected Server",
      description: "You're learning to serve without self-criticism. Your karmic work involves perfecting your craft while accepting imperfection in the process.",
      keywords: ["meticulous", "dedicated", "efficient", "grounded"],
      spiritualMeaning: "Spiritual Lesson: Excellence is achieved through practice, not perfectionism. Your Gift: Teaching mastery through humble, dedicated service."
    },
    "Libra": {
      title: "The Fair Judge",
      description: "You're learning true balance and commitment in relationships. Your karmic lesson involves making difficult choices and standing by your decisions.",
      keywords: ["fair", "committed", "balanced", "responsible"],
      spiritualMeaning: "Spiritual Lesson: Real harmony sometimes requires difficult boundaries and honest choices. Your Gift: Creating lasting partnerships built on integrity and mutual respect."
    },
    "Scorpio": {
      title: "The Transformed Healer",
      description: "You're learning mastery over intense emotions and power. Your karmic work involves using depth and intensity for healing, not control.",
      keywords: ["powerful", "controlled", "transformative", "resilient"],
      spiritualMeaning: "Spiritual Lesson: True power comes from emotional mastery and selfless transformation. Your Gift: Guiding others through their shadow work with wisdom and strength."
    },
    "Sagittarius": {
      title: "The Grounded Philosopher",
      description: "You're learning to ground your visions in reality. Your karmic lesson involves committing to one truth and building practical spiritual structures.",
      keywords: ["grounded", "committed", "wise", "practical"],
      spiritualMeaning: "Spiritual Lesson: Wisdom must be lived and applied, not just believed. Your Gift: Teaching how to translate spiritual truth into tangible positive change."
    },
    "Capricorn": {
      title: "The Master Builder",
      description: "You're learning responsible leadership and patient achievement. Your karmic work involves building lasting legacies through integrity and dedication.",
      keywords: ["masterful", "responsible", "authoritative", "enduring"],
      spiritualMeaning: "Spiritual Lesson: True success is measured in decades, not days - patience builds empires. Your Gift: Creating structures that serve generations through disciplined wisdom."
    },
    "Aquarius": {
      title: "The Responsible Revolutionary",
      description: "You're learning to balance innovation with responsibility. Your karmic lesson involves committing to humanitarian work with discipline and structure.",
      keywords: ["innovative", "responsible", "committed", "structured"],
      spiritualMeaning: "Spiritual Lesson: Real revolution requires structure and sustained effort, not just ideals. Your Gift: Building new systems that actually serve humanity's evolution."
    },
    "Pisces": {
      title: "The Grounded Mystic",
      description: "You're learning to bring spiritual wisdom into practical reality. Your karmic work involves grounding compassion in tangible service.",
      keywords: ["practical", "compassionate", "disciplined", "spiritual"],
      spiritualMeaning: "Spiritual Lesson: Transcendence is found through earthly service, not escape. Your Gift: Teaching how to channel spiritual insight into real-world healing."
    }
  },
  uranus: {
    "Aries": {
      title: "The Revolutionary Pioneer",
      description: "You bring radical innovation to how we initiate and lead. Your unique gift involves pioneering completely new ways of being courageous and independent.",
      keywords: ["revolutionary", "innovative", "bold", "pioneering"],
      spiritualMeaning: "Spiritual Lesson: Your individuality serves collective liberation - be boldly, unapologetically you. Your Gift: Awakening others to their own revolutionary courage and authentic self-expression."
    },
    "Taurus": {
      title: "The Value Revolutionary",
      description: "You bring innovation to resources, values, and what we consider valuable. Your gift involves revolutionizing material and spiritual abundance.",
      keywords: ["innovative", "stable", "revolutionary", "resourceful"],
      spiritualMeaning: "Spiritual Lesson: True stability comes from flexibility, and real value from unconventional wisdom. Your Gift: Showing humanity new ways to create sustainable abundance."
    },
    "Gemini": {
      title: "The Genius Communicator",
      description: "You bring breakthrough insights to communication and thinking. Your unique gift involves connecting ideas in revolutionary, mind-expanding ways.",
      keywords: ["brilliant", "innovative", "communicative", "inventive"],
      spiritualMeaning: "Spiritual Lesson: Your unique perspective opens portals of understanding for all. Your Gift: Channeling future knowledge and awakening minds to new possibilities."
    },
    "Cancer": {
      title: "The Emotional Revolutionary",
      description: "You bring innovation to nurturing, home, and emotional expression. Your gift involves creating new paradigms for family and emotional connection.",
      keywords: ["innovative", "nurturing", "unconventional", "liberating"],
      spiritualMeaning: "Spiritual Lesson: True emotional security comes from freedom to feel authentically. Your Gift: Liberating humanity from outdated emotional patterns and family karma."
    },
    "Leo": {
      title: "The Creative Genius",
      description: "You bring radical self-expression and innovative creativity. Your unique gift involves revolutionizing how we celebrate individuality and creative power.",
      keywords: ["creative", "innovative", "dramatic", "original"],
      spiritualMeaning: "Spiritual Lesson: Your authentic uniqueness is your greatest gift to the world. Your Gift: Inspiring radical self-love and creative freedom in all beings."
    },
    "Virgo": {
      title: "The Innovative Healer",
      description: "You bring revolutionary approaches to health, service, and healing. Your gift involves discovering breakthrough methods for practical improvement.",
      keywords: ["innovative", "healing", "precise", "revolutionary"],
      spiritualMeaning: "Spiritual Lesson: True healing comes from breaking free of old systems and finding new solutions. Your Gift: Pioneering holistic methods that transform health and wellbeing."
    },
    "Libra": {
      title: "The Relationship Revolutionary",
      description: "You bring innovation to partnerships and social dynamics. Your unique gift involves creating new paradigms for balance, fairness, and connection.",
      keywords: ["innovative", "balanced", "progressive", "fair"],
      spiritualMeaning: "Spiritual Lesson: True harmony requires breaking old relationship patterns. Your Gift: Awakening humanity to revolutionary forms of partnership and social justice."
    },
    "Scorpio": {
      title: "The Transformation Catalyst",
      description: "You bring sudden, profound transformation and occult innovation. Your gift involves revolutionizing how we understand power, death, and rebirth.",
      keywords: ["transformative", "powerful", "innovative", "intense"],
      spiritualMeaning: "Spiritual Lesson: Liberation comes through embracing the shadow and transforming it. Your Gift: Catalyzing quantum leaps in consciousness through profound awakening."
    },
    "Sagittarius": {
      title: "The Visionary Explorer",
      description: "You bring revolutionary wisdom and innovative philosophy. Your unique gift involves expanding consciousness through unconventional spiritual truth.",
      keywords: ["visionary", "innovative", "philosophical", "free"],
      spiritualMeaning: "Spiritual Lesson: Ultimate truth transcends all dogma and conventional belief. Your Gift: Opening portals to future wisdom and liberating spiritual understanding."
    },
    "Capricorn": {
      title: "The System Revolutionary",
      description: "You bring innovation to structures, authority, and achievement. Your gift involves revolutionizing how we build, lead, and create lasting change.",
      keywords: ["innovative", "authoritative", "revolutionary", "structural"],
      spiritualMeaning: "Spiritual Lesson: True authority comes from serving evolution, not preserving the past. Your Gift: Dismantling outdated systems and building revolutionary new structures."
    },
    "Aquarius": {
      title: "The Pure Visionary",
      description: "You embody revolutionary consciousness and humanitarian innovation. Your unique gift involves channeling future wisdom for collective awakening.",
      keywords: ["visionary", "humanitarian", "revolutionary", "original"],
      spiritualMeaning: "Spiritual Lesson: You're a living portal to humanity's future potential. Your Gift: Embodying and transmitting the consciousness humanity is evolving toward."
    },
    "Pisces": {
      title: "The Spiritual Revolutionary",
      description: "You bring innovation to spirituality and transcendence. Your gift involves revolutionizing how we connect with divine consciousness.",
      keywords: ["spiritual", "innovative", "transcendent", "liberating"],
      spiritualMeaning: "Spiritual Lesson: True enlightenment breaks all spiritual rules and dogma. Your Gift: Channeling divine frequencies that liberate souls from all illusions."
    }
  },
  neptune: {
    "Aries": {
      title: "The Spiritual Warrior",
      description: "You dream of courageous action and spiritual warriorship. Your mystical gift involves channeling divine will into compassionate action.",
      keywords: ["idealistic", "inspired", "compassionate", "visionary"],
      spiritualMeaning: "Spiritual Lesson: True courage comes from surrendering to divine guidance. Your Gift: Inspiring others to fight for spiritual ideals with compassion and faith."
    },
    "Taurus": {
      title: "The Material Mystic",
      description: "You dream of earthly paradise and sacred abundance. Your gift involves bringing heaven to earth through beauty and sensory spirituality.",
      keywords: ["aesthetic", "grounded", "spiritual", "sensory"],
      spiritualMeaning: "Spiritual Lesson: The divine is found in physical beauty and earthly pleasure. Your Gift: Teaching that spirituality and sensuality are sacred partners."
    },
    "Gemini": {
      title: "The Divine Messenger",
      description: "You dream of spiritual communication and mystical knowledge. Your gift involves channeling divine wisdom through words and connections.",
      keywords: ["intuitive", "communicative", "inspired", "poetic"],
      spiritualMeaning: "Spiritual Lesson: Sacred truth flows through everyday conversations and simple words. Your Gift: Translating divine messages into language that awakens hearts."
    },
    "Cancer": {
      title: "The Compassionate Nurturer",
      description: "You dream of universal motherhood and emotional healing. Your mystical gift involves channeling divine love through emotional presence.",
      keywords: ["compassionate", "nurturing", "psychic", "healing"],
      spiritualMeaning: "Spiritual Lesson: Your empathy is a direct line to divine compassion. Your Gift: Healing ancestral and collective emotional wounds through unconditional love."
    },
    "Leo": {
      title: "The Divine Creator",
      description: "You dream of inspired creativity and spiritual radiance. Your gift involves channeling divine creative force through artistic expression.",
      keywords: ["creative", "inspired", "radiant", "artistic"],
      spiritualMeaning: "Spiritual Lesson: Your creative expression is divine worship and service. Your Gift: Bringing celestial beauty into form through inspired artistry."
    },
    "Virgo": {
      title: "The Sacred Server",
      description: "You dream of perfect service and divine healing. Your mystical gift involves channeling spiritual purity through humble work.",
      keywords: ["healing", "devoted", "spiritual", "purifying"],
      spiritualMeaning: "Spiritual Lesson: The sacred is found in small acts of service and daily devotion. Your Gift: Teaching that enlightenment comes through perfecting compassionate service."
    },
    "Libra": {
      title: "The Divine Harmonizer",
      description: "You dream of perfect love and spiritual partnership. Your gift involves channeling divine beauty through relationships and balance.",
      keywords: ["harmonious", "romantic", "spiritual", "aesthetic"],
      spiritualMeaning: "Spiritual Lesson: True love is a portal to divine union and cosmic harmony. Your Gift: Creating relationships that serve as temples of spiritual connection."
    },
    "Scorpio": {
      title: "The Mystical Transformer",
      description: "You dream of profound spiritual transformation and occult mysteries. Your gift involves channeling divine power through death and rebirth.",
      keywords: ["mystical", "powerful", "psychic", "transformative"],
      spiritualMeaning: "Spiritual Lesson: Surrendering to transformation opens portals to divine power. Your Gift: Guiding souls through spiritual death into transcendent rebirth."
    },
    "Sagittarius": {
      title: "The Spiritual Seeker",
      description: "You dream of ultimate truth and divine wisdom. Your mystical gift involves channeling universal philosophy and sacred knowledge.",
      keywords: ["philosophical", "inspired", "visionary", "faithful"],
      spiritualMeaning: "Spiritual Lesson: All spiritual paths lead to the same divine truth. Your Gift: Teaching universal wisdom that transcends all religious boundaries."
    },
    "Capricorn": {
      title: "The Practical Mystic",
      description: "You dream of manifesting spiritual ideals in material form. Your gift involves bringing divine structure into earthly reality.",
      keywords: ["grounded", "spiritual", "responsible", "visionary"],
      spiritualMeaning: "Spiritual Lesson: True spirituality must be lived and built, not just believed. Your Gift: Creating tangible spiritual structures that serve humanity's evolution."
    },
    "Aquarius": {
      title: "The Universal Visionary",
      description: "You dream of collective enlightenment and humanitarian awakening. Your gift involves channeling future spiritual consciousness.",
      keywords: ["visionary", "humanitarian", "spiritual", "progressive"],
      spiritualMeaning: "Spiritual Lesson: Your spiritual visions serve humanity's collective awakening. Your Gift: Channeling divine frequencies that elevate mass consciousness."
    },
    "Pisces": {
      title: "The Pure Channel",
      description: "You dream of complete dissolution into divine love. Your mystical gift involves being a pure vessel for universal compassion.",
      keywords: ["transcendent", "compassionate", "mystical", "universal"],
      spiritualMeaning: "Spiritual Lesson: You are a living portal between heaven and earth. Your Gift: Embodying unconditional love and teaching surrender to divine flow."
    }
  },
  pluto: {
    "Aries": {
      title: "The Power Pioneer",
      description: "You transform through confronting and reclaiming your personal power. Your soul's work involves revolutionizing identity and self-assertion.",
      keywords: ["powerful", "transformative", "pioneering", "intense"],
      spiritualMeaning: "Spiritual Lesson: True power emerges when you fearlessly become your authentic self. Your Gift: Empowering others to reclaim their sovereignty and warrior spirit."
    },
    "Taurus": {
      title: "The Value Transformer",
      description: "You transform through death and rebirth of values and resources. Your soul's work involves revolutionizing what humanity considers valuable.",
      keywords: ["transformative", "resourceful", "powerful", "persistent"],
      spiritualMeaning: "Spiritual Lesson: Security comes from releasing attachment, not accumulating. Your Gift: Teaching profound transformation of material and spiritual worth."
    },
    "Gemini": {
      title: "The Mind Transformer",
      description: "You transform through profound shifts in perception and communication. Your soul's work involves revolutionizing how we think and connect.",
      keywords: ["penetrating", "transformative", "insightful", "powerful"],
      spiritualMeaning: "Spiritual Lesson: True knowledge comes from diving into the depths, not skimming surfaces. Your Gift: Revealing hidden truths and transforming collective understanding."
    },
    "Cancer": {
      title: "The Emotional Alchemist",
      description: "You transform through deep emotional healing and family karma release. Your soul's work involves revolutionizing how we nurture and feel.",
      keywords: ["deep", "transformative", "healing", "powerful"],
      spiritualMeaning: "Spiritual Lesson: Emotional vulnerability is the gateway to profound power. Your Gift: Healing ancestral wounds and transforming collective emotional patterns."
    },
    "Leo": {
      title: "The Creative Transformer",
      description: "You transform through death and rebirth of ego and creative expression. Your soul's work involves revolutionizing authentic self-expression.",
      keywords: ["powerful", "transformative", "creative", "intense"],
      spiritualMeaning: "Spiritual Lesson: True creative power comes from ego death and soul expression. Your Gift: Teaching others to create from their deepest authentic power."
    },
    "Virgo": {
      title: "The Healing Transformer",
      description: "You transform through purification and service crisis. Your soul's work involves revolutionizing health, healing, and sacred work.",
      keywords: ["transformative", "healing", "powerful", "purifying"],
      spiritualMeaning: "Spiritual Lesson: Perfection comes through accepting and transforming imperfection. Your Gift: Catalyzing profound healing through crisis and dedicated service."
    },
    "Libra": {
      title: "The Relationship Transformer",
      description: "You transform through death and rebirth in partnerships. Your soul's work involves revolutionizing balance, fairness, and connection.",
      keywords: ["transformative", "intense", "balancing", "powerful"],
      spiritualMeaning: "Spiritual Lesson: True intimacy requires dying to the old self in relationship. Your Gift: Teaching profound transformation through sacred partnership."
    },
    "Scorpio": {
      title: "The Ultimate Transformer",
      description: "You transform through complete death and rebirth of the soul. Your soul's work involves mastering the mysteries of life, death, and power.",
      keywords: ["intense", "transformative", "powerful", "regenerative"],
      spiritualMeaning: "Spiritual Lesson: You are here to master transformation itself and guide others through it. Your Gift: Being a shamanic guide through the underworld of consciousness."
    },
    "Sagittarius": {
      title: "The Belief Transformer",
      description: "You transform through death and rebirth of beliefs and philosophy. Your soul's work involves revolutionizing truth, wisdom, and meaning.",
      keywords: ["transformative", "philosophical", "powerful", "deep"],
      spiritualMeaning: "Spiritual Lesson: Ultimate truth is found by destroying all false beliefs. Your Gift: Guiding others through spiritual transformation and paradigm shifts."
    },
    "Capricorn": {
      title: "The Structure Transformer",
      description: "You transform through dismantling and rebuilding authority. Your soul's work involves revolutionizing systems, power, and achievement.",
      keywords: ["powerful", "transformative", "authoritative", "intense"],
      spiritualMeaning: "Spiritual Lesson: True mastery comes from destroying and rebuilding yourself repeatedly. Your Gift: Transforming outdated power structures into enlightened leadership."
    },
    "Aquarius": {
      title: "The Collective Transformer",
      description: "You transform through revolutionary changes in consciousness. Your soul's work involves catalyzing humanity's evolution and awakening.",
      keywords: ["revolutionary", "transformative", "powerful", "visionary"],
      spiritualMeaning: "Spiritual Lesson: Your personal transformation serves collective liberation. Your Gift: Catalyzing quantum leaps in mass consciousness and social structures."
    },
    "Pisces": {
      title: "The Spiritual Transformer",
      description: "You transform through complete dissolution and spiritual rebirth. Your soul's work involves revolutionizing compassion, transcendence, and unity.",
      keywords: ["transcendent", "transformative", "mystical", "powerful"],
      spiritualMeaning: "Spiritual Lesson: True power comes from surrendering all power to the divine. Your Gift: Teaching transformation through spiritual surrender and universal love."
    }
  }
};
var KARMIC_INTERPRETATIONS = {
  northNode: {
    "Aries": {
      title: "Soul Mission: Pioneer Leadership",
      description: "Your soul is learning to develop independence, courage, and leadership. Move away from over-dependence on others' opinions.",
      spiritualGrowth: "Embrace your individuality and learn to take initiative without waiting for others' approval."
    },
    "Taurus": {
      title: "Soul Mission: Grounded Stability",
      description: "Your soul is learning to create stability, appreciate simple pleasures, and build lasting value. Move away from emotional drama.",
      spiritualGrowth: "Find peace in simplicity and learn to appreciate the beauty in everyday moments."
    },
    "Gemini": {
      title: "Soul Mission: Divine Communication",
      description: "Your soul is learning to communicate clearly, stay curious, and share knowledge. Move away from rigid thinking.",
      spiritualGrowth: "Embrace flexibility and learn to see multiple perspectives on any situation."
    },
    "Cancer": {
      title: "Soul Mission: Emotional Healing",
      description: "Your soul is learning to nurture, trust intuition, and create emotional security. Move away from cold ambition.",
      spiritualGrowth: "Open your heart and learn to trust your emotional wisdom and caring nature."
    },
    "Leo": {
      title: "Soul Mission: Creative Self-Expression",
      description: "Your soul is learning to express creativity, develop confidence, and share your unique gifts. Move away from hiding in groups.",
      spiritualGrowth: "Step into the spotlight and share your creative gifts with confidence and generosity."
    },
    "Virgo": {
      title: "Soul Mission: Sacred Service",
      description: "Your soul is learning to serve others, pay attention to details, and create practical solutions. Move away from scattered energy.",
      spiritualGrowth: "Focus on being helpful and bringing order to chaos through dedicated service."
    },
    "Libra": {
      title: "Soul Mission: Divine Harmony",
      description: "Your soul is learning to create balance, cooperate with others, and appreciate beauty. Move away from selfish behavior.",
      spiritualGrowth: "Learn the art of cooperation and creating harmony in all your relationships."
    },
    "Scorpio": {
      title: "Soul Mission: Soul Transformation",
      description: "Your soul is learning to embrace transformation, develop emotional depth, and heal through crisis. Move away from superficiality.",
      spiritualGrowth: "Dive deep into life's mysteries and transform yourself and others through emotional healing."
    },
    "Sagittarius": {
      title: "Soul Mission: Wisdom Teaching",
      description: "Your soul is learning to seek higher truth, expand consciousness, and teach others. Move away from petty details.",
      spiritualGrowth: "Expand your horizons and share wisdom gained from your spiritual adventures."
    },
    "Capricorn": {
      title: "Soul Mission: Spiritual Authority",
      description: "Your soul is learning to take responsibility, build lasting structures, and achieve mastery. Move away from emotional dependency.",
      spiritualGrowth: "Develop discipline and take responsibility for creating something meaningful in the world."
    },
    "Aquarius": {
      title: "Soul Mission: Humanitarian Evolution",
      description: "Your soul is learning to contribute to humanity, embrace innovation, and think collectively. Move away from ego-centered attention.",
      spiritualGrowth: "Channel your uniqueness toward benefiting humanity and collective evolution."
    },
    "Pisces": {
      title: "Soul Mission: Universal Love",
      description: "Your soul is learning to develop compassion, trust intuition, and serve something greater. Move away from critical analysis.",
      spiritualGrowth: "Trust your intuition and serve others through boundless compassion and spiritual wisdom."
    }
  },
  chiron: {
    "Aries": {
      title: "The Wounded Warrior",
      description: "Your deepest wound involves issues with identity, confidence, and assertiveness. Healing comes through developing healthy self-assertion.",
      healingPath: "Learn to express your authentic self without aggression or defensiveness."
    },
    "Taurus": {
      title: "The Wounded Builder",
      description: "Your deepest wound involves self-worth, material security, and appreciating your own value. Healing comes through recognizing your inherent worth.",
      healingPath: "Discover that your value isn't dependent on external possessions or achievements."
    },
    "Gemini": {
      title: "The Wounded Communicator",
      description: "Your deepest wound involves communication, learning, and being heard. Healing comes through finding your authentic voice.",
      healingPath: "Learn to communicate your truth clearly and trust that your ideas have value."
    },
    "Cancer": {
      title: "The Wounded Nurturer",
      description: "Your deepest wound involves emotional security, family, and feeling safe to be vulnerable. Healing comes through self-nurturing.",
      healingPath: "Learn to nurture yourself first, then extend that caring to others in healthy ways."
    },
    "Leo": {
      title: "The Wounded Creator",
      description: "Your deepest wound involves creativity, self-expression, and feeling worthy of attention. Healing comes through authentic self-expression.",
      healingPath: "Express your creativity without seeking external validation or approval."
    },
    "Virgo": {
      title: "The Wounded Healer",
      description: "Your deepest wound involves perfectionism, criticism, and feeling flawed. Healing comes through self-acceptance.",
      healingPath: "Embrace your imperfections and learn that being human means being beautifully flawed."
    },
    "Libra": {
      title: "The Wounded Peacemaker",
      description: "Your deepest wound involves relationships, balance, and fear of conflict. Healing comes through authentic relating.",
      healingPath: "Learn to maintain your identity while creating harmonious relationships with others."
    },
    "Scorpio": {
      title: "The Wounded Transformer",
      description: "Your deepest wound involves trust, intimacy, and fear of emotional destruction. Healing comes through emotional courage.",
      healingPath: "Face your deepest fears and learn that transformation leads to regeneration, not destruction."
    },
    "Sagittarius": {
      title: "The Wounded Teacher",
      description: "Your deepest wound involves meaning, truth, and feeling lost or purposeless. Healing comes through sharing your wisdom.",
      healingPath: "Find your truth and share it with others, knowing that your journey gives you wisdom to offer."
    },
    "Capricorn": {
      title: "The Wounded Authority",
      description: "Your deepest wound involves achievement, recognition, and feeling powerless. Healing comes through authentic leadership.",
      healingPath: "Learn to be an authority in your own life and use your power to serve something greater."
    },
    "Aquarius": {
      title: "The Wounded Revolutionary",
      description: "Your deepest wound involves belonging, uniqueness, and feeling like an outsider. Healing comes through embracing your differences.",
      healingPath: "Celebrate your uniqueness and use it to contribute something valuable to collective humanity."
    },
    "Pisces": {
      title: "The Wounded Mystic",
      description: "Your deepest wound involves spirituality, boundaries, and feeling overwhelmed by life. Healing comes through spiritual practice.",
      healingPath: "Develop healthy boundaries while maintaining your compassionate, spiritual nature."
    }
  }
};
function getPlanetSignInterpretation(planet, sign) {
  return PLANET_SIGN_INTERPRETATIONS[planet]?.[sign] || {
    title: `${planet} in ${sign}`,
    description: `Your ${planet} energy expresses through ${sign} qualities.`,
    keywords: [],
    spiritualMeaning: `This placement brings unique spiritual lessons and gifts.`
  };
}
function getHouseInterpretation(house) {
  return HOUSE_MEANINGS[house] || {
    title: `House ${house}`,
    description: "This house represents an important life area.",
    themes: [],
    spiritualFocus: "This area offers spiritual growth opportunities."
  };
}
function getKarmicInterpretation(point, sign) {
  const interpretation = KARMIC_INTERPRETATIONS[point];
  return interpretation?.[sign] || {
    title: `${point} in ${sign}`,
    description: `This placement offers important spiritual lessons.`,
    spiritualGrowth: "Focus on growth in this area.",
    healingPath: "Healing comes through conscious awareness."
  };
}

// server/services/astrology.ts
import * as Astronomy from "astronomy-engine";
import { fromZonedTime } from "date-fns-tz";
import * as geoTz from "geo-tz";
var ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];
function eclipticToZodiacSign(longitude) {
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  const signIndex = Math.floor(longitude / 30);
  return ZODIAC_SIGNS[signIndex];
}
function getDegreesInSign(longitude) {
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  return longitude % 30;
}
function createBirthTime(birthData) {
  try {
    const [year, month, day] = birthData.birthDate.split("-").map(Number);
    const [hours, minutes] = birthData.birthTime.split(":").map(Number);
    const localTimeString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
    const resolvedTimezone = resolveTimezone(
      birthData.timezone,
      parseFloat(birthData.latitude.toString()),
      parseFloat(birthData.longitude.toString())
    );
    return fromZonedTime(new Date(localTimeString), resolvedTimezone);
  } catch (error) {
    console.error("Error creating precise birth time:", error);
    throw error;
  }
}
function resolveTimezone(inputTimezone, latitude, longitude) {
  if (inputTimezone.includes("/")) {
    return inputTimezone;
  }
  try {
    const timezones = geoTz.find(latitude, longitude);
    if (timezones && timezones.length > 0) {
      return timezones[0];
    }
  } catch (error) {
    console.warn("Geo-tz lookup failed, falling back to coordinate calculation:", error);
  }
  const timezoneMap = {
    "EST": "America/New_York",
    "EDT": "America/New_York",
    "CST": "America/Chicago",
    "CDT": "America/Chicago",
    "MST": "America/Denver",
    "MDT": "America/Denver",
    "PST": "America/Los_Angeles",
    "PDT": "America/Los_Angeles",
    "GMT": "Europe/London",
    "BST": "Europe/London",
    "CET": "Europe/Paris",
    "CEST": "Europe/Paris"
  };
  const mapped = timezoneMap[inputTimezone.toUpperCase()];
  if (mapped) {
    return mapped;
  }
  return estimateTimezoneFromCoordinates(latitude, longitude);
}
function estimateTimezoneFromCoordinates(latitude, longitude) {
  if (longitude >= -180 && longitude < -30) {
    if (longitude >= -75) return "America/New_York";
    if (longitude >= -90) return "America/Chicago";
    if (longitude >= -105) return "America/Denver";
    if (longitude >= -125) return "America/Los_Angeles";
    return "America/Anchorage";
  }
  if (longitude >= -30 && longitude < 60) {
    if (latitude > 35) {
      if (longitude < 15) return "Europe/London";
      if (longitude < 30) return "Europe/Paris";
      return "Europe/Moscow";
    }
    return "Africa/Cairo";
  }
  if (longitude >= 60 && longitude <= 180) {
    if (longitude < 90) return "Asia/Kolkata";
    if (longitude < 120) return "Asia/Shanghai";
    if (longitude < 150) return "Asia/Tokyo";
    return "Pacific/Auckland";
  }
  return "UTC";
}
function calculateCelestialPosition(body, birthTime, observer) {
  const equator = Astronomy.Equator(body, birthTime, observer, true, true);
  const ecliptic = Astronomy.Ecliptic(equator.vec);
  const longitude = ecliptic.elon;
  return {
    longitude,
    sign: eclipticToZodiacSign(longitude),
    degree: getDegreesInSign(longitude)
  };
}
function calculateLocalSiderealTime(birthTime, longitude) {
  const gmst = Astronomy.SiderealTime(birthTime);
  const lst = gmst + longitude / 15;
  return (lst % 24 + 24) % 24;
}
function calculateAscendant(birthTime, latitude, longitude) {
  const lst = calculateLocalSiderealTime(birthTime, longitude);
  const lstDegrees = lst * 15;
  const latRad = latitude * Math.PI / 180;
  const obliquity = 23.4397;
  const oblRad = obliquity * Math.PI / 180;
  const lstRad = lstDegrees * Math.PI / 180;
  const numerator = Math.cos(lstRad);
  const denominator = -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));
  let ascendantLongitude = Math.atan2(numerator, denominator) * 180 / Math.PI;
  ascendantLongitude = (ascendantLongitude + 360) % 360;
  return {
    longitude: ascendantLongitude,
    sign: eclipticToZodiacSign(ascendantLongitude),
    degree: getDegreesInSign(ascendantLongitude)
  };
}
function calculateEqualHouseCusps(ascendantLongitude) {
  const cusps = new Array(12);
  for (let i = 0; i < 12; i++) {
    cusps[i] = (ascendantLongitude + i * 30) % 360;
  }
  return cusps;
}
function calculateHousePosition(planetLongitude, houseCusps) {
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];
    if (nextCusp > currentCusp) {
      if (planetLongitude >= currentCusp && planetLongitude < nextCusp) {
        return i + 1;
      }
    } else {
      if (planetLongitude >= currentCusp || planetLongitude < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1;
}
function calculateAspects(planetPositions) {
  const aspects = [];
  const aspectDefinitions = [
    { name: "conjunction", angle: 0, orb: 10 },
    { name: "sextile", angle: 60, orb: 6 },
    { name: "square", angle: 90, orb: 8 },
    { name: "trine", angle: 120, orb: 8 },
    { name: "opposition", angle: 180, orb: 10 }
  ];
  const planetNames = Object.keys(planetPositions);
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      let diff = Math.abs(planetPositions[planet1] - planetPositions[planet2]);
      if (diff > 180) {
        diff = 360 - diff;
      }
      for (const aspectDef of aspectDefinitions) {
        const orbDiff = Math.abs(diff - aspectDef.angle);
        if (orbDiff <= aspectDef.orb) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectDef.name,
            orb: parseFloat(orbDiff.toFixed(2))
          });
          break;
        }
      }
    }
  }
  return aspects;
}
function calculateChironPosition(birthTime) {
  const epochTime = (/* @__PURE__ */ new Date("2000-01-01T12:00:00Z")).getTime();
  const currentTime = birthTime.getTime();
  const yearsSinceEpoch = (currentTime - epochTime) / (1e3 * 60 * 60 * 24 * 365.25);
  const epochChironDegree = 270;
  const chironDegree = (epochChironDegree + yearsSinceEpoch * 7.2) % 360;
  const normalizedDegree = chironDegree < 0 ? chironDegree + 360 : chironDegree;
  return {
    longitude: normalizedDegree,
    sign: eclipticToZodiacSign(normalizedDegree),
    degree: getDegreesInSign(normalizedDegree)
  };
}
function calculateAstrology(birthData) {
  const birthTime = createBirthTime(birthData);
  const latitude = parseFloat(birthData.latitude.toString());
  const longitude = parseFloat(birthData.longitude.toString());
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const sunPos = calculateCelestialPosition(Astronomy.Body.Sun, birthTime, observer);
  const moonPos = calculateCelestialPosition(Astronomy.Body.Moon, birthTime, observer);
  const mercuryPos = calculateCelestialPosition(Astronomy.Body.Mercury, birthTime, observer);
  const venusPos = calculateCelestialPosition(Astronomy.Body.Venus, birthTime, observer);
  const marsPos = calculateCelestialPosition(Astronomy.Body.Mars, birthTime, observer);
  const jupiterPos = calculateCelestialPosition(Astronomy.Body.Jupiter, birthTime, observer);
  const saturnPos = calculateCelestialPosition(Astronomy.Body.Saturn, birthTime, observer);
  const uranusPos = calculateCelestialPosition(Astronomy.Body.Uranus, birthTime, observer);
  const neptunePos = calculateCelestialPosition(Astronomy.Body.Neptune, birthTime, observer);
  const plutoPos = calculateCelestialPosition(Astronomy.Body.Pluto, birthTime, observer);
  const ascendantData = calculateAscendant(birthTime, latitude, longitude);
  const houseCusps = calculateEqualHouseCusps(ascendantData.longitude);
  const sunSign = sunPos.sign;
  const moonSign = moonPos.sign;
  const risingSign = ascendantData.sign;
  function createPlanetData(planetName, pos) {
    const house = calculateHousePosition(pos.longitude, houseCusps);
    return {
      sign: pos.sign,
      house,
      degree: pos.degree,
      interpretation: getPlanetSignInterpretation(planetName, pos.sign),
      houseInterpretation: getHouseInterpretation(house)
    };
  }
  const planets = {
    sun: createPlanetData("sun", sunPos),
    moon: createPlanetData("moon", moonPos),
    mercury: createPlanetData("mercury", mercuryPos),
    venus: createPlanetData("venus", venusPos),
    mars: createPlanetData("mars", marsPos),
    jupiter: createPlanetData("jupiter", jupiterPos),
    saturn: createPlanetData("saturn", saturnPos),
    uranus: createPlanetData("uranus", uranusPos),
    neptune: createPlanetData("neptune", neptunePos),
    pluto: createPlanetData("pluto", plutoPos)
  };
  const houses = houseCusps.map((cuspLongitude, index2) => ({
    sign: eclipticToZodiacSign(cuspLongitude),
    degree: cuspLongitude,
    interpretation: getHouseInterpretation(index2 + 1)
  }));
  const planetPositions = {
    sun: sunPos.longitude,
    moon: moonPos.longitude,
    mercury: mercuryPos.longitude,
    venus: venusPos.longitude,
    mars: marsPos.longitude,
    jupiter: jupiterPos.longitude,
    saturn: saturnPos.longitude,
    uranus: uranusPos.longitude,
    neptune: neptunePos.longitude,
    pluto: plutoPos.longitude
  };
  const aspects = calculateAspects(planetPositions);
  const nodeEvent = Astronomy.SearchMoonNode(birthTime);
  const nodeTime = nodeEvent.time.date;
  const daysSinceNode = (birthTime.getTime() - nodeTime.getTime()) / (1e3 * 60 * 60 * 24);
  const nodeRetrogradeDegrees = daysSinceNode * 0.0529;
  const baseNodeLongitude = nodeEvent.kind === Astronomy.NodeEventKind.Ascending ? 0 : 180;
  const currentMoonEq = Astronomy.Equator(Astronomy.Body.Moon, nodeTime, observer, true, true);
  const currentMoonEcl = Astronomy.Ecliptic(currentMoonEq.vec);
  const nodeAtEventLongitude = currentMoonEcl.elon;
  let northNodeLongitude = (nodeAtEventLongitude - nodeRetrogradeDegrees + 360) % 360;
  if (nodeEvent.kind !== Astronomy.NodeEventKind.Ascending) {
    northNodeLongitude = (northNodeLongitude + 180) % 360;
  }
  const southNodeLongitude = (northNodeLongitude + 180) % 360;
  const northNodeSign = eclipticToZodiacSign(northNodeLongitude);
  const southNodeSign = eclipticToZodiacSign(southNodeLongitude);
  const northNode = {
    sign: northNodeSign,
    house: calculateHousePosition(northNodeLongitude, houseCusps),
    degree: getDegreesInSign(northNodeLongitude),
    interpretation: getKarmicInterpretation("northNode", northNodeSign)
  };
  const southNode = {
    sign: southNodeSign,
    house: calculateHousePosition(southNodeLongitude, houseCusps),
    degree: getDegreesInSign(southNodeLongitude),
    interpretation: {
      title: `Soul History: ${southNodeSign} Mastery`,
      description: `You've mastered ${southNodeSign} qualities in past lives. Now it's time to balance this with your North Node growth.`,
      spiritualGrowth: `Release over-attachment to ${southNodeSign} patterns and embrace your North Node path.`
    }
  };
  const chironPos = calculateChironPosition(birthTime);
  const chiron = {
    sign: chironPos.sign,
    house: calculateHousePosition(chironPos.longitude, houseCusps),
    degree: chironPos.degree,
    interpretation: getKarmicInterpretation("chiron", chironPos.sign)
  };
  const sunInterpretation = getPlanetSignInterpretation("sun", sunSign);
  const moonInterpretation = getPlanetSignInterpretation("moon", moonSign);
  const risingInterpretation = getPlanetSignInterpretation("sun", risingSign);
  return {
    sunSign,
    moonSign,
    risingSign,
    planets,
    houses,
    aspects,
    northNode,
    southNode,
    chiron,
    interpretations: {
      bigThree: {
        sun: `Your ${sunInterpretation.title} essence drives you to ${sunInterpretation.spiritualMeaning.toLowerCase()}`,
        moon: `Your ${moonInterpretation.title} emotional nature ${moonInterpretation.spiritualMeaning.toLowerCase()}`,
        rising: `You present to the world as ${risingSign}, projecting ${risingInterpretation.keywords.join(", ")} energy`
      },
      summary: `As a ${sunSign} Sun with ${moonSign} Moon and ${risingSign} Rising, you embody a unique blend of ${sunInterpretation.keywords[0]}, ${moonInterpretation.keywords[0]}, and ${risingInterpretation.keywords[0]} energies. Your soul's journey involves balancing these cosmic influences to express your highest potential.`
    }
  };
}
function getTarotBirthCards(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const sumAllDigits = (num) => {
    return num.toString().split("").reduce((acc, digit) => acc + parseInt(digit), 0);
  };
  let total = sumAllDigits(day) + sumAllDigits(month) + sumAllDigits(year);
  while (total > 22) {
    total = sumAllDigits(total);
  }
  if (total === 0) total = 22;
  const tarotCards = [
    { card1: "The Magician", card2: "The Magician", interpretation: "Raw power of manifestation and conscious will" },
    // 1
    { card1: "The High Priestess", card2: "Justice", interpretation: "Intuitive wisdom balanced with divine justice" },
    // 2 (reduces to 11)
    { card1: "The Empress", card2: "The Hanged Man", interpretation: "Creative abundance through surrender and new perspective" },
    // 3 (reduces to 12)
    { card1: "The Emperor", card2: "Death", interpretation: "Structured authority transformed through rebirth" },
    // 4 (reduces to 13)
    { card1: "The Hierophant", card2: "Temperance", interpretation: "Sacred wisdom flowing through divine alchemy" },
    // 5 (reduces to 14)
    { card1: "The Lovers", card2: "The Devil", interpretation: "Heart-centered choice illuminating shadow and attachment" },
    // 6 (reduces to 15)
    { card1: "The Chariot", card2: "The Tower", interpretation: "Directed willpower breaking through limitation" },
    // 7 (reduces to 16)
    { card1: "Strength", card2: "The Star", interpretation: "Inner courage birthing hope and divine inspiration" },
    // 8 (reduces to 17)
    { card1: "The Hermit", card2: "The Moon", interpretation: "Inner guidance navigating the subconscious depths" },
    // 9 (reduces to 18)
    { card1: "Wheel of Fortune", card2: "The Sun", interpretation: "Life's cycles illuminated by radiant consciousness" },
    // 10 (reduces to 19)
    { card1: "Justice", card2: "Justice", interpretation: "Divine balance and karmic truth" },
    // 11
    { card1: "The Hanged Man", card2: "The Hanged Man", interpretation: "Suspension and surrender to higher wisdom" },
    // 12
    { card1: "Death", card2: "Death", interpretation: "Transformation and profound rebirth" },
    // 13
    { card1: "Temperance", card2: "Temperance", interpretation: "Alchemical balance and divine moderation" },
    // 14
    { card1: "The Devil", card2: "The Devil", interpretation: "Confronting shadow, reclaiming power from bondage" },
    // 15
    { card1: "The Tower", card2: "The Tower", interpretation: "Liberation through destruction of false structures" },
    // 16
    { card1: "The Star", card2: "The Star", interpretation: "Hope, healing, and connection to cosmic guidance" },
    // 17
    { card1: "The Moon", card2: "The Moon", interpretation: "Navigating illusion to access deep intuition" },
    // 18
    { card1: "The Sun", card2: "The Sun", interpretation: "Radiant vitality, clarity, and authentic self-expression" },
    // 19
    { card1: "Judgement", card2: "Judgement", interpretation: "Awakening, rebirth, and answering your higher calling" },
    // 20
    { card1: "The World", card2: "The World", interpretation: "Completion, integration, and cosmic wholeness" },
    // 21
    { card1: "The Fool", card2: "The World", interpretation: "Infinite potential dancing with divine completion" }
    // 22/0
  ];
  return tarotCards[total - 1];
}

// server/services/numerology.ts
function reduceToSingleDigit(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split("").reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}
function calculateLifePath(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(year);
  const sum = reducedDay + reducedMonth + reducedYear;
  return reduceToSingleDigit(sum);
}
function getLetterValue(letter) {
  const values = {
    "A": 1,
    "B": 2,
    "C": 3,
    "D": 4,
    "E": 5,
    "F": 6,
    "G": 7,
    "H": 8,
    "I": 9,
    "J": 1,
    "K": 2,
    "L": 3,
    "M": 4,
    "N": 5,
    "O": 6,
    "P": 7,
    "Q": 8,
    "R": 9,
    "S": 1,
    "T": 2,
    "U": 3,
    "V": 4,
    "W": 5,
    "X": 6,
    "Y": 7,
    "Z": 8
  };
  return values[letter.toUpperCase()] || 0;
}
function calculateExpression(fullName) {
  const sum = fullName.replace(/[^A-Z]/gi, "").split("").reduce((total, letter) => {
    return total + getLetterValue(letter);
  }, 0);
  return reduceToSingleDigit(sum);
}
function calculateSoulUrge(fullName) {
  const vowels = "AEIOU";
  const sum = fullName.replace(/[^A-Z]/gi, "").split("").reduce((total, letter) => {
    return vowels.includes(letter.toUpperCase()) ? total + getLetterValue(letter) : total;
  }, 0);
  return reduceToSingleDigit(sum);
}
function calculatePersonality(fullName) {
  const vowels = "AEIOU";
  const sum = fullName.replace(/[^A-Z]/gi, "").split("").reduce((total, letter) => {
    return !vowels.includes(letter.toUpperCase()) ? total + getLetterValue(letter) : total;
  }, 0);
  return reduceToSingleDigit(sum);
}
function calculatePersonalYear(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(currentYear);
  const sum = reducedDay + reducedMonth + reducedYear;
  return reduceToSingleDigit(sum);
}
var interpretations = {
  lifePath: {
    1: {
      title: "The Pioneer \xB7 Path of First Light",
      description: "You arrived on this earth trailing stardust of primordial fire\u2014the ONE who dares to step where no footprint yet marks the soil. Yours is the sacred courage to birth new worlds, to carve trails through wilderness both outer and inner. The universe whispers through you: 'Begin.'",
      spiritualMeaning: "Your soul incarnated to embody divine will made manifest\u2014learning that true authority flows not from force, but from the unshakeable knowing of who you truly are. You are the spark that ignites revolution, the first note that births the symphony.",
      keywords: ["trailblazer's fire", "sovereign independence", "innovation's lightning strike", "courage carved from cosmic bone", "originality as prayer"],
      challenges: "Dancing the razor's edge between leadership and dominion, learning that the strongest warrior knows when to be gentle, discovering your reflection in those you inspire rather than those you command"
    },
    2: {
      title: "The Diplomat \xB7 Path of Sacred Union",
      description: "You walk as the bridge between separated shores, the gentle thread weaving discord into tapestry. In you flows the wisdom that division is illusion\u2014that all souls are notes in a single song, all hearts chambers of one vast love.",
      spiritualMeaning: "Your soul came to master the divine feminine art of receptivity\u2014understanding that sometimes the greatest power is the willingness to yield, the deepest strength the capacity to feel another's pain as your own.",
      keywords: ["harmony's healing touch", "partnership as spiritual practice", "diplomacy born of divine love", "sensitivity as superpower", "cooperation that births miracles"],
      challenges: "Learning that true peace begins within, discovering your own melody amidst the chorus, knowing when your gentleness enables rather than heals"
    },
    3: {
      title: "The Creator \xB7 Path of Joyful Expression",
      description: "The Muses chose you as their vessel\u2014words, colors, sounds, movements pour through you like light through crystal. You are divine play made human, joy incarnate, the reminder that creation itself is an act of love, that beauty heals what logic cannot touch.",
      spiritualMeaning: "Your spiritual assignment is to channel the divine creative force that births galaxies and dreams\u2014proving that art is not frivolous but fundamental, that inspiration can transform the mundane into miraculous.",
      keywords: ["creativity as divine channeling", "communication that carries starlight", "inspiration that sparks awakening", "joy as revolutionary act", "expression that heals souls"],
      challenges: "Gathering your scattered brilliance into focused rays, diving deep when instinct says to skim surfaces, honoring that your gifts deserve depth not just breadth"
    },
    4: {
      title: "The Architect \xB7 Path of Sacred Structure",
      description: "You are the mountain's patience, the cathedral's persistence, the tree that grows a single ring each year for centuries. Yours is the holy work of making dreams solid\u2014of building foundations so sturdy that future generations will rest upon your labor.",
      spiritualMeaning: "Your soul incarnated to learn that work itself is worship, that dedication is a form of devotion, that the sacred and practical are not opposites but lovers\u2014and that the greatest magic is transforming vision into stone and steel and lasting substance.",
      keywords: ["foundation stones of new worlds", "organization as spiritual practice", "dedication that moves mountains", "practicality robed in purpose", "systematic service to the whole"],
      challenges: "Softening the walls you build for protection, remembering that even mountains must weather, learning when your structures shelter and when they cage"
    },
    5: {
      title: "The Explorer \xB7 Path of Infinite Possibility",
      description: "Freedom sings in your veins like wind through canyon country. You came to taste every flavor life offers, to dance in a thousand forms, to prove that change is not the enemy of truth but its most honest expression. Adventure is your altar, experience your scripture.",
      spiritualMeaning: "Your spiritual journey teaches that the Divine is too vast to be contained in any single form\u2014that exploration is itself a sacred act, that variety reveals the many faces of God, that sometimes the greatest wisdom comes from saying 'yes' to the unknown.",
      keywords: ["freedom as birthright", "adventure that expands consciousness", "variety as divine expression", "progress through transformation", "experimentation as evolution"],
      challenges: "Learning that roots need not be chains, discovering commitment as chosen devotion rather than prison, finding depth in the passing moment rather than always seeking the next"
    },
    6: {
      title: "The Healer \xB7 Path of Loving Service",
      description: "You carry the medicine of the heart\u2014a love so vast it seeks to shelter all beings beneath its wings. Yours is the path of the tender warrior, creating sanctuaries of healing wherever your feet touch earth, knowing that the highest calling is to cherish and to serve.",
      spiritualMeaning: "Your soul purpose is to embody love made visible\u2014to prove that nurturing is not weakness but the mightiest force in existence, that caring for others is how the Divine cares for itself through human hands.",
      keywords: ["nurture as sacred calling", "healing through love's presence", "responsibility worn as crown", "compassion that transforms wounds", "service as soul's deepest truth"],
      challenges: "Filling your own cup before pouring for others, learning that healthy boundaries are acts of love, knowing when your care enables rather than empowers"
    },
    7: {
      title: "The Mystic \xB7 Path of Hidden Wisdom",
      description: "You walk between worlds\u2014one foot in earthly form, one in realms unseen. Yours is the path of the seeker who questions everything, the philosopher who finds temples in silence, the truth-hunter who knows that the deepest wisdom whispers rather than shouts.",
      spiritualMeaning: "Your soul came to bridge matter and spirit, to prove that the invisible is more real than the seen, to find the golden threads connecting science and mysticism, logic and magic, reason and revelation.",
      keywords: ["wisdom born in solitude", "spirituality as investigation", "analysis that unveils mystery", "intuition married to intellect", "secrets revealed to the patient"],
      challenges: "Emerging from hermit's cave to share your treasures, remembering that even seekers need companionship, trusting that others can hold the truths you've mined from the depths"
    },
    8: {
      title: "The Alchemist \xB7 Path of Material Mastery",
      description: "You came to prove that money and magic need not be enemies\u2014that abundance rightly used is divine will made manifest, that power in conscious hands becomes medicine for multitudes. Yours is the path of turning lead to gold, scarcity to plenty, resources into redemption.",
      spiritualMeaning: "Your soul's assignment is mastering the spiritual use of material force\u2014learning that wealth without wisdom wounds, that achievement without integrity hollows, but that success in service to love becomes a holy offering.",
      keywords: ["achievement aligned with spirit", "material mastery through integrity", "power as sacred responsibility", "success that serves the whole", "organization that manifests miracles"],
      challenges: "Remembering your worth beyond your wealth, using power to uplift rather than control, knowing when enough is enough in a world that worships 'more'"
    },
    9: {
      title: "The Sage \xB7 Path of Universal Love",
      description: "Old soul, you carry the accumulated wisdom of lifetimes\u2014a heart vast enough to hold humanity's joy and sorrow both. Yours is the path of completion, of circles closing, of teaching through being rather than speaking. You are what the world is becoming.",
      spiritualMeaning: "Your soul mission is to embody enlightened service\u2014to love without condition, to give without counting cost, to show by your existence that we are all one family, all children of the same cosmic womb.",
      keywords: ["humanitarian heart that bleeds for all", "universal love without borders", "wisdom earned through lifetimes", "completion of the sacred spiral", "teaching by pure being"],
      challenges: "Learning to receive as gracefully as you give, protecting your empathic nature from drowning in others' pain, understanding that you cannot save everyone\u2014but that trying is still holy"
    },
    11: {
      title: "The Illuminator \xB7 Master Path of Visionary Light",
      description: "You did not choose this path\u2014it chose you. Marked by the double ones, you are a lightning rod for divine inspiration, a vessel for frequencies most cannot perceive. Master Number, you carry the burden and blessing of heightened sensitivity, called to illuminate shadows with truth's electric fire.",
      spiritualMeaning: "Your soul is an old one, returned with advanced assignments\u2014to channel higher consciousness, to inspire spiritual awakening in the sleeping masses, to prove that intuition is not fantasy but the language heaven speaks to those who listen.",
      keywords: ["intuition as divine download", "inspiration that births revolutions", "spiritual teaching through presence", "sensitivity tuned to cosmic frequencies", "illumination of hidden truths"],
      challenges: "Earthing your lightning in practical ground, protecting your porous boundaries from psychic flooding, learning that even light-bringers need darkness and rest"
    },
    22: {
      title: "The Worldbuilder \xB7 Master Path of Manifested Vision",
      description: "Master Builder, you dream not in rooms but in cities, not in moments but in millennia. Yours is the rare capacity to translate heaven's blueprint into earth's foundation\u2014to build cathedrals, systems, structures that will outlive you by centuries.",
      spiritualMeaning: "Your soul incarnated with cosmic ambition matched by earthly capability\u2014to prove that spiritual ideals can take physical form, that grand visions need not remain ethereal dreams, that one life of dedicated building can shift the arc of human history.",
      keywords: ["master manifestation of the impossible", "spiritual ideals made stone and steel", "large-scale transformation", "visionary leadership grounded in reality", "systematic change that spans generations"],
      challenges: "Bearing the weight of visions too large for mortal frames, staying present to small steps while holding vast horizons, learning patience when every cell screams for immediate manifestation"
    },
    33: {
      title: "The Avatar \xB7 Master Path of Divine Love",
      description: "Rarest of the rare, you walk as love incarnate\u2014a master healer whose very presence becomes sanctuary. The number of Christ consciousness, you came not to teach love but to BE love, to show that flesh can carry frequencies of pure divine compassion.",
      spiritualMeaning: "Your soul's evolution is nearly complete\u2014returned not for your own learning but for humanity's healing, embodying the truth that there is nothing that love cannot transform, no wound that compassion cannot salve, no darkness that divine light cannot penetrate.",
      keywords: ["master healing through love's pure channel", "unconditional compassion without limit", "Christ consciousness in human form", "spiritual teaching through sacred being", "divine love that asks nothing in return"],
      challenges: "Maintaining human boundaries while channeling infinite love, remembering you have a body that needs care, knowing when your service serves and when it sacrifices"
    }
  },
  expression: {
    1: {
      title: "The Pioneer's Gift",
      description: "Your natural talents include leadership, innovation, and the ability to initiate new projects. You have the gift of inspiring others through your courage and originality.",
      spiritualMeaning: "You came into this life to express divine will through independent action and creative leadership.",
      keywords: ["leadership", "innovation", "courage", "independence", "initiative"]
    },
    2: {
      title: "The Diplomat's Gift",
      description: "Your talents include cooperation, mediation, and creating harmony in relationships. You excel at bringing people together and finding peaceful solutions.",
      spiritualMeaning: "You express divine love through your ability to see all sides and create unity from division.",
      keywords: ["cooperation", "diplomacy", "harmony", "sensitivity", "peacemaking"]
    },
    3: {
      title: "The Artist's Gift",
      description: "Your natural abilities include creative expression, communication, and bringing joy to others. You have the gift of transforming ideas into beautiful, inspiring forms.",
      spiritualMeaning: "You channel divine creativity to uplift others and bring beauty into the world.",
      keywords: ["creativity", "communication", "joy", "inspiration", "artistic expression"]
    },
    4: {
      title: "The Architect's Gift",
      description: "Your talents include organization, systematic thinking, and the ability to build lasting structures. You excel at turning dreams into practical reality.",
      spiritualMeaning: "You express divine order through your dedication to creating stable, beneficial systems.",
      keywords: ["organization", "practicality", "dedication", "systematic building", "reliability"]
    },
    5: {
      title: "The Explorer's Gift",
      description: "Your abilities include adaptability, communication, and the power to inspire change. You have the gift of helping others embrace freedom and new experiences.",
      spiritualMeaning: "You embody divine freedom and teach others to expand beyond their limitations.",
      keywords: ["freedom", "adaptability", "communication", "adventure", "progressive thinking"]
    },
    6: {
      title: "The Healer's Gift",
      description: "Your talents include nurturing, healing, and creating harmony in homes and communities. You have the gift of making others feel loved and supported.",
      spiritualMeaning: "You channel divine love through your natural ability to heal and nurture others.",
      keywords: ["nurturing", "healing", "responsibility", "compassion", "home harmony"]
    },
    7: {
      title: "The Mystic's Gift",
      description: "Your abilities include deep analysis, spiritual insight, and the power to uncover hidden truths. You have the gift of bridging the seen and unseen worlds.",
      spiritualMeaning: "You express divine wisdom through your ability to perceive spiritual realities and share mystical insights.",
      keywords: ["wisdom", "analysis", "spirituality", "intuition", "mystical insight"]
    },
    8: {
      title: "The Executive's Gift",
      description: "Your talents include business acumen, organizational ability, and the power to achieve material success. You have the gift of manifesting abundance and managing resources.",
      spiritualMeaning: "You channel divine abundance by learning to use material resources for spiritual purposes.",
      keywords: ["business success", "material mastery", "organization", "achievement", "resource management"]
    },
    9: {
      title: "The Teacher's Gift",
      description: "Your abilities include universal understanding, compassionate service, and the power to inspire others toward their highest potential. You have the gift of seeing the bigger picture.",
      spiritualMeaning: "You express divine compassion through your dedication to serving humanity's highest good.",
      keywords: ["universal service", "compassion", "wisdom", "teaching", "humanitarian leadership"]
    },
    11: {
      title: "The Intuitive Master's Gift",
      description: "Your natural talents include heightened intuition, spiritual inspiration, and the ability to uplift others through your sensitivity. You have the gift of channeling higher wisdom and illuminating truth.",
      spiritualMeaning: "You express divine intuition and carry advanced spiritual gifts to inspire humanity's consciousness expansion.",
      keywords: ["intuition", "spiritual inspiration", "illumination", "sensitivity", "higher wisdom"]
    },
    22: {
      title: "The Master Builder's Gift",
      description: "Your exceptional talents include the ability to manifest grand visions into reality, combining spiritual wisdom with practical skills. You have the gift of creating lasting positive change on a large scale.",
      spiritualMeaning: "You express divine manifestation power, building bridges between spiritual ideals and material reality.",
      keywords: ["master manifestation", "spiritual practicality", "large-scale building", "visionary leadership", "material mastery"]
    },
    33: {
      title: "The Master Healer's Gift",
      description: "Your extraordinary talents include the ability to heal through unconditional love, teach through compassion, and uplift others through pure divine service. You have the gift of embodying Christ consciousness.",
      spiritualMeaning: "You express divine love in its purest form, serving as a channel for healing and spiritual transformation.",
      keywords: ["master healing", "unconditional love", "divine service", "Christ consciousness", "spiritual teaching"]
    }
  },
  soulUrge: {
    1: {
      title: "Soul's Desire for Leadership",
      description: "Your heart yearns to lead, to be independent, and to pioneer new paths. Deep down, you desire recognition for your unique contributions and innovative ideas.",
      spiritualMeaning: "Your soul seeks to experience its divine authority and learn to lead from a place of service rather than ego.",
      keywords: ["leadership", "independence", "recognition", "innovation", "authority"]
    },
    2: {
      title: "Soul's Desire for Harmony",
      description: "Your heart yearns for peace, cooperation, and loving relationships. You deeply desire to be part of something greater than yourself and to create unity.",
      spiritualMeaning: "Your soul seeks to experience divine love through connection, partnership, and the healing of separation.",
      keywords: ["harmony", "partnership", "cooperation", "peace", "love"]
    },
    3: {
      title: "Soul's Desire for Expression",
      description: "Your heart yearns to create, communicate, and bring joy to others. You deeply desire to express your authentic self and inspire others through your creativity.",
      spiritualMeaning: "Your soul seeks to experience divine creativity as a channel for beauty, inspiration, and healing.",
      keywords: ["creative expression", "communication", "joy", "inspiration", "authenticity"]
    },
    4: {
      title: "Soul's Desire for Security",
      description: "Your heart yearns for stability, security, and the satisfaction of building something lasting. You deeply desire to create order and leave a practical legacy.",
      spiritualMeaning: "Your soul seeks to experience divine order and learn that true security comes from spiritual foundation.",
      keywords: ["security", "stability", "order", "building", "practical achievement"]
    },
    5: {
      title: "Soul's Desire for Freedom",
      description: "Your heart yearns for adventure, variety, and the freedom to explore life's possibilities. You deeply desire new experiences and the excitement of change.",
      spiritualMeaning: "Your soul seeks to experience divine freedom and learn that true liberation comes from spiritual understanding.",
      keywords: ["freedom", "adventure", "variety", "exploration", "change"]
    },
    6: {
      title: "Soul's Desire for Love",
      description: "Your heart yearns to love and be loved, to nurture others, and to create a harmonious home and family life. You deeply desire to serve and heal others.",
      spiritualMeaning: "Your soul seeks to experience divine love and learn to give and receive unconditional love.",
      keywords: ["love", "nurturing", "family", "service", "healing"]
    },
    7: {
      title: "Soul's Desire for Truth",
      description: "Your heart yearns for spiritual understanding, deeper truths, and mystical experiences. You deeply desire to understand the meaning of life and your place in the universe.",
      spiritualMeaning: "Your soul seeks to experience divine wisdom and unite with the source of all knowledge.",
      keywords: ["truth", "wisdom", "spirituality", "understanding", "mystical experience"]
    },
    8: {
      title: "Soul's Desire for Achievement",
      description: "Your heart yearns for material success, recognition, and the power to make a significant impact. You deeply desire to master the material world and achieve greatness.",
      spiritualMeaning: "Your soul seeks to experience divine power and learn to use material mastery for spiritual purposes.",
      keywords: ["achievement", "success", "power", "recognition", "material mastery"]
    },
    9: {
      title: "Soul's Desire for Service",
      description: "Your heart yearns to serve humanity, to make a difference in the world, and to contribute to the greater good. You deeply desire to live a life of meaning and purpose.",
      spiritualMeaning: "Your soul seeks to experience divine compassion and serve as an instrument of universal love.",
      keywords: ["service", "humanitarian ideals", "universal love", "meaningful contribution", "spiritual purpose"]
    },
    11: {
      title: "Soul's Desire for Illumination",
      description: "Your heart yearns for spiritual awakening, mystical experiences, and the ability to inspire others through your intuitive insights. You deeply desire to access higher realms of consciousness.",
      spiritualMeaning: "Your soul seeks to experience divine illumination and serve as a bridge between the earthly and spiritual dimensions.",
      keywords: ["spiritual awakening", "mystical experience", "intuitive insights", "illumination", "higher consciousness"]
    },
    22: {
      title: "Soul's Desire for Master Building",
      description: "Your heart yearns to create large-scale positive change, to build lasting institutions that benefit humanity, and to manifest spiritual ideals in the material world.",
      spiritualMeaning: "Your soul seeks to experience divine manifestation power and create lasting bridges between heaven and earth.",
      keywords: ["master building", "large-scale change", "spiritual manifestation", "institutional creation", "divine architecture"]
    },
    33: {
      title: "Soul's Desire for Universal Healing",
      description: "Your heart yearns to heal the world through unconditional love, to embody Christ consciousness, and to serve as a channel for divine healing energy.",
      spiritualMeaning: "Your soul seeks to experience pure divine love and become a vessel for healing humanity's deepest wounds.",
      keywords: ["universal healing", "Christ consciousness", "unconditional love", "divine channeling", "world healing"]
    }
  },
  personality: {
    1: {
      title: "The Dynamic Leader",
      description: "Others see you as confident, independent, and pioneering. You project an aura of strength and determination that inspires others to follow your lead.",
      spiritualMeaning: "Your outer personality reflects divine will and the courage to be authentically yourself.",
      keywords: ["confident", "independent", "pioneering", "strong", "determined"]
    },
    2: {
      title: "The Gentle Diplomat",
      description: "Others perceive you as kind, cooperative, and harmonious. You project an energy of peace and sensitivity that makes others feel comfortable and understood.",
      spiritualMeaning: "Your outer personality reflects divine love and the power of gentle strength.",
      keywords: ["kind", "cooperative", "harmonious", "peaceful", "sensitive"]
    },
    3: {
      title: "The Inspiring Communicator",
      description: "Others see you as creative, expressive, and joyful. You project an energy of optimism and artistic flair that uplifts and inspires those around you.",
      spiritualMeaning: "Your outer personality reflects divine creativity and the gift of bringing light to others.",
      keywords: ["creative", "expressive", "joyful", "optimistic", "inspiring"]
    },
    4: {
      title: "The Reliable Builder",
      description: "Others perceive you as practical, organized, and dependable. You project an energy of stability and competence that makes others trust your judgment and abilities.",
      spiritualMeaning: "Your outer personality reflects divine order and the strength found in dedication.",
      keywords: ["practical", "organized", "dependable", "stable", "competent"]
    },
    5: {
      title: "The Adventurous Spirit",
      description: "Others see you as dynamic, freedom-loving, and progressive. You project an energy of excitement and possibility that encourages others to embrace change.",
      spiritualMeaning: "Your outer personality reflects divine freedom and the courage to explore new territories.",
      keywords: ["dynamic", "freedom-loving", "progressive", "exciting", "adventurous"]
    },
    6: {
      title: "The Caring Nurturer",
      description: "Others perceive you as responsible, nurturing, and community-minded. You project an energy of love and protection that makes others feel safe and cared for.",
      spiritualMeaning: "Your outer personality reflects divine compassion and the healing power of unconditional love.",
      keywords: ["responsible", "nurturing", "caring", "protective", "community-minded"]
    },
    7: {
      title: "The Mysterious Seeker",
      description: "Others see you as wise, introspective, and spiritually inclined. You project an energy of depth and mystery that draws others to seek your insights.",
      spiritualMeaning: "Your outer personality reflects divine wisdom and the allure of mystical knowledge.",
      keywords: ["wise", "introspective", "mysterious", "spiritual", "insightful"]
    },
    8: {
      title: "The Successful Executive",
      description: "Others perceive you as ambitious, authoritative, and business-minded. You project an energy of success and material mastery that commands respect.",
      spiritualMeaning: "Your outer personality reflects divine power and the responsibility of material stewardship.",
      keywords: ["ambitious", "authoritative", "successful", "powerful", "business-minded"]
    },
    9: {
      title: "The Humanitarian Visionary",
      description: "Others see you as compassionate, wise, and globally minded. You project an energy of universal love and service that inspires others to think beyond themselves.",
      spiritualMeaning: "Your outer personality reflects divine compassion and the call to serve humanity.",
      keywords: ["compassionate", "wise", "humanitarian", "universal", "inspiring"]
    },
    11: {
      title: "The Illuminated Master",
      description: "Others perceive you as deeply intuitive, spiritually advanced, and mysteriously wise. You project an energy of enlightenment and higher consciousness that both inspires and awes others.",
      spiritualMeaning: "Your outer personality reflects divine illumination and the magnetic pull of advanced spiritual awareness.",
      keywords: ["intuitive", "enlightened", "mysterious", "spiritually advanced", "inspiring"]
    },
    22: {
      title: "The Visionary Builder",
      description: "Others see you as exceptionally capable, visionary, and able to manifest grand ideas into reality. You project an energy of master-level competence and transformative power.",
      spiritualMeaning: "Your outer personality reflects divine manifestation ability and the power to bridge spiritual ideals with material accomplishment.",
      keywords: ["visionary", "master builder", "transformative", "exceptionally capable", "inspiring"]
    },
    33: {
      title: "The Divine Healer",
      description: "Others perceive you as a source of unconditional love, healing, and spiritual guidance. You project an energy of pure compassion and Christ-like presence that deeply moves others.",
      spiritualMeaning: "Your outer personality reflects divine love in its purest form and the healing presence of universal compassion.",
      keywords: ["healing presence", "unconditional love", "Christ-like", "compassionate", "spiritually radiant"]
    }
  },
  personalYear: {
    1: {
      title: "Year of New Beginnings",
      description: "This is a year for planting seeds, starting new ventures, and taking initiative. The universe supports your independent action and original ideas.",
      spiritualMeaning: "Your soul is being called to step into a new phase of growth and express your authentic leadership.",
      keywords: ["new beginnings", "initiative", "independence", "originality", "leadership"],
      themes: ["Starting new projects", "Developing leadership skills", "Taking initiative", "Being original"]
    },
    2: {
      title: "Year of Cooperation",
      description: "This is a year for partnerships, diplomacy, and collaborative efforts. The universe supports your ability to work with others and create harmony.",
      spiritualMeaning: "Your soul is learning the power of cooperation and how relationships can be vehicles for spiritual growth.",
      keywords: ["cooperation", "partnerships", "diplomacy", "harmony", "sensitivity"],
      themes: ["Building relationships", "Collaborative projects", "Developing patience", "Creating harmony"]
    },
    3: {
      title: "Year of Creative Expression",
      description: "This is a year for artistic pursuits, communication, and joyful self-expression. The universe supports your creative endeavors and social connections.",
      spiritualMeaning: "Your soul is being called to express its divine creativity and bring more joy into the world.",
      keywords: ["creativity", "expression", "communication", "joy", "social connections"],
      themes: ["Creative projects", "Artistic development", "Social expansion", "Joyful expression"]
    },
    4: {
      title: "Year of Building Foundations",
      description: "This is a year for hard work, organization, and building solid foundations for the future. The universe supports your practical efforts and systematic approach.",
      spiritualMeaning: "Your soul is learning the sacred nature of work and how patience creates lasting positive change.",
      keywords: ["foundation building", "hard work", "organization", "practicality", "systems"],
      themes: ["Building for the future", "Organizing life", "Working systematically", "Creating stability"]
    },
    5: {
      title: "Year of Freedom and Change",
      description: "This is a year for adventure, variety, and embracing change. The universe supports your desire for freedom and new experiences.",
      spiritualMeaning: "Your soul is being called to expand beyond current limitations and explore new territories of growth.",
      keywords: ["freedom", "adventure", "change", "variety", "expansion"],
      themes: ["Embracing change", "Seeking adventure", "Expanding horizons", "Breaking free"]
    },
    6: {
      title: "Year of Love and Responsibility",
      description: "This is a year for family, home, and caring for others. The universe supports your nurturing nature and desire to create harmony in your personal life.",
      spiritualMeaning: "Your soul is learning the balance between service to others and self-care.",
      keywords: ["love", "family", "responsibility", "nurturing", "harmony"],
      themes: ["Family focus", "Home improvements", "Caring for others", "Creating harmony"]
    },
    7: {
      title: "Year of Spiritual Seeking",
      description: "This is a year for introspection, spiritual study, and inner development. The universe supports your quest for deeper understanding and truth.",
      spiritualMeaning: "Your soul is being called to go within and connect with your spiritual essence.",
      keywords: ["spirituality", "introspection", "study", "inner development", "truth"],
      themes: ["Spiritual growth", "Inner reflection", "Study and learning", "Seeking truth"]
    },
    8: {
      title: "Year of Material Achievement",
      description: "This is a year for business success, financial growth, and material accomplishment. The universe supports your ambitions and organizational abilities.",
      spiritualMeaning: "Your soul is learning to master the material realm while maintaining spiritual values.",
      keywords: ["achievement", "success", "material growth", "business", "ambition"],
      themes: ["Career advancement", "Financial growth", "Business success", "Material mastery"]
    },
    9: {
      title: "Year of Completion and Service",
      description: "This is a year for wrapping up old projects, releasing what no longer serves, and focusing on humanitarian service. The universe supports your desire to give back.",
      spiritualMeaning: "Your soul is completing a major cycle and preparing for a new phase of spiritual evolution.",
      keywords: ["completion", "service", "humanitarian work", "release", "transformation"],
      themes: ["Completing projects", "Humanitarian service", "Letting go", "Preparing for new cycle"]
    },
    11: {
      title: "Year of Illumination",
      description: "This is a year for spiritual awakening, heightened intuition, and inspiring others through your higher awareness. The universe supports your spiritual development and mystical experiences.",
      spiritualMeaning: "Your soul is being called to a higher octave of consciousness and spiritual service.",
      keywords: ["illumination", "spiritual awakening", "intuition", "inspiration", "higher consciousness"],
      themes: ["Spiritual development", "Intuitive awakening", "Inspiring others", "Mystical experiences"]
    },
    22: {
      title: "Year of Master Building",
      description: "This is a year for manifesting grand visions, building lasting institutions, and creating positive change on a large scale. The universe supports your ability to make dreams reality.",
      spiritualMeaning: "Your soul is being called to build bridges between the spiritual and material worlds.",
      keywords: ["master building", "manifestation", "large-scale change", "institution building", "vision realization"],
      themes: ["Building grand visions", "Creating institutions", "Large-scale manifestation", "Bridging worlds"]
    },
    33: {
      title: "Year of Universal Healing",
      description: "This is a year for embodying unconditional love, healing others through compassion, and serving as a channel for divine love. The universe supports your role as a spiritual healer.",
      spiritualMeaning: "Your soul is being called to embody Christ consciousness and heal through pure love.",
      keywords: ["universal healing", "unconditional love", "Christ consciousness", "divine service", "compassionate healing"],
      themes: ["Healing through love", "Embodying compassion", "Divine service", "Universal healing"]
    }
  }
};
function calculateNumerology(fullName, birthDate) {
  const lifePath2 = calculateLifePath(birthDate);
  const expression = calculateExpression(fullName);
  const soulUrge = calculateSoulUrge(fullName);
  const personality = calculatePersonality(fullName);
  const personalYear2 = calculatePersonalYear(birthDate);
  function getInterpretation(category, number) {
    return interpretations[category][number] || {
      title: `${category} ${number}`,
      description: "A unique spiritual path requiring individual exploration.",
      spiritualMeaning: "Your soul has chosen a special lesson for this lifetime.",
      keywords: ["unique", "spiritual", "individual"],
      challenges: "Discovering your unique purpose",
      themes: []
    };
  }
  return {
    lifePath: lifePath2,
    expression,
    soulUrge,
    personality,
    personalYear: personalYear2,
    interpretations: {
      lifePath: getInterpretation("lifePath", lifePath2),
      expression: getInterpretation("expression", expression),
      soulUrge: getInterpretation("soulUrge", soulUrge),
      personality: getInterpretation("personality", personality),
      personalYear: getInterpretation("personalYear", personalYear2)
    }
  };
}

// server/services/personality.ts
var enneagramTypes = {
  1: {
    description: "The Perfectionist - Principled, purposeful, self-controlled, and perfectionistic.",
    motivation: "To be good, right, perfect, and to improve everything",
    fear: "Being corrupt, defective, or wrong"
  },
  2: {
    description: "The Helper - Demonstrative, generous, people-pleasing, and possessive.",
    motivation: "To be loved and needed",
    fear: "Being unloved or unwanted for themselves"
  },
  3: {
    description: "The Achiever - Adaptive, excelling, driven, and image-conscious.",
    motivation: "To be valuable and worthwhile",
    fear: "Being worthless or without value apart from achievements"
  },
  4: {
    description: "The Individualist - Expressive, dramatic, self-absorbed, and temperamental.",
    motivation: "To find themselves and their significance",
    fear: "Having no identity or personal significance"
  },
  5: {
    description: "The Investigator - Perceptive, innovative, secretive, and isolated.",
    motivation: "To be capable and competent",
    fear: "Being useless, helpless, or incapable"
  },
  6: {
    description: "The Loyalist - Engaging, responsible, anxious, and suspicious.",
    motivation: "To have security and support",
    fear: "Being without support or guidance"
  },
  7: {
    description: "The Enthusiast - Spontaneous, versatile, acquisitive, and scattered.",
    motivation: "To maintain happiness and satisfaction",
    fear: "Being trapped in pain or deprivation"
  },
  8: {
    description: "The Challenger - Self-confident, decisive, willful, and confrontational.",
    motivation: "To be self-reliant and in control of their environment",
    fear: "Being controlled or vulnerable to others"
  },
  9: {
    description: "The Peacemaker - Receptive, reassuring, agreeable, and complacent.",
    motivation: "To maintain inner and outer peace",
    fear: "Loss of connection and fragmentation"
  }
};
var mbtiTypes = {
  "INTJ": {
    description: "The Architect - Imaginative and strategic thinkers, with a plan for everything.",
    functions: ["Ni", "Te", "Fi", "Se"]
  },
  "INTP": {
    description: "The Thinker - Innovative inventors with an unquenchable thirst for knowledge.",
    functions: ["Ti", "Ne", "Si", "Fe"]
  },
  "ENTJ": {
    description: "The Commander - Bold, imaginative and strong-willed leaders.",
    functions: ["Te", "Ni", "Se", "Fi"]
  },
  "ENTP": {
    description: "The Debater - Smart and curious thinkers who cannot resist an intellectual challenge.",
    functions: ["Ne", "Ti", "Fe", "Si"]
  },
  "INFJ": {
    description: "The Advocate - Quiet and mystical, yet very inspiring and tireless idealists.",
    functions: ["Ni", "Fe", "Ti", "Se"]
  },
  "INFP": {
    description: "The Mediator - Poetic, kind and altruistic people, always eager to help a good cause.",
    functions: ["Fi", "Ne", "Si", "Te"]
  },
  "ENFJ": {
    description: "The Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners.",
    functions: ["Fe", "Ni", "Se", "Ti"]
  },
  "ENFP": {
    description: "The Campaigner - Enthusiastic, creative and sociable free spirits.",
    functions: ["Ne", "Fi", "Te", "Si"]
  },
  "ISTJ": {
    description: "The Logistician - Practical and fact-minded, reliable and responsible.",
    functions: ["Si", "Te", "Fi", "Ne"]
  },
  "ISFJ": {
    description: "The Protector - Warm-hearted and dedicated, always ready to protect their loved ones.",
    functions: ["Si", "Fe", "Ti", "Ne"]
  },
  "ESTJ": {
    description: "The Executive - Excellent administrators, unsurpassed at managing things or people.",
    functions: ["Te", "Si", "Ne", "Fi"]
  },
  "ESFJ": {
    description: "The Consul - Extraordinarily caring, social and popular people, always eager to help.",
    functions: ["Fe", "Si", "Ne", "Ti"]
  },
  "ISTP": {
    description: "The Virtuoso - Bold and practical experimenters, masters of all kinds of tools.",
    functions: ["Ti", "Se", "Ni", "Fe"]
  },
  "ISFP": {
    description: "The Adventurer - Flexible and charming artists, always ready to explore new possibilities.",
    functions: ["Fi", "Se", "Ni", "Te"]
  },
  "ESTP": {
    description: "The Entrepreneur - Smart, energetic and perceptive people, truly enjoy living on the edge.",
    functions: ["Se", "Ti", "Fe", "Ni"]
  },
  "ESFP": {
    description: "The Entertainer - Spontaneous, energetic and enthusiastic people - life is never boring.",
    functions: ["Se", "Fi", "Te", "Ni"]
  }
};
function calculateEnneagram(responses) {
  const scores = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0
  };
  const questionTypeMap = [8, 1, 2, 3, 4, 5];
  responses.forEach((response, index2) => {
    if (index2 < questionTypeMap.length) {
      const typeNumber = questionTypeMap[index2];
      scores[typeNumber] = response;
    }
  });
  let primaryType = 1;
  let maxScore = scores[1];
  for (let type = 2; type <= 9; type++) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      primaryType = type;
    }
  }
  const wing = calculateEnneagramWing(primaryType, scores);
  return {
    type: primaryType,
    wing,
    description: enneagramTypes[primaryType].description,
    motivation: enneagramTypes[primaryType].motivation,
    fear: enneagramTypes[primaryType].fear
  };
}
function calculateEnneagramWing(primaryType, scores) {
  const leftWing = primaryType === 1 ? 9 : primaryType - 1;
  const rightWing = primaryType === 9 ? 1 : primaryType + 1;
  const leftScore = scores[leftWing] || 0;
  const rightScore = scores[rightWing] || 0;
  if (leftScore > rightScore) {
    return `${primaryType}w${leftWing}`;
  } else if (rightScore > leftScore) {
    return `${primaryType}w${rightWing}`;
  } else {
    return `${primaryType}w${Math.min(leftWing, rightWing)}`;
  }
}
function calculateMBTI(responses) {
  const scores = {
    E: 0,
    I: 0,
    // Extraversion vs Introversion
    S: 0,
    N: 0,
    // Sensing vs Intuition
    T: 0,
    F: 0,
    // Thinking vs Feeling
    J: 0,
    P: 0
    // Judging vs Perceiving
  };
  const responseWeights = {
    "strongly_disagree": -2,
    "disagree": -1,
    "neither": 0,
    "agree": 1,
    "strongly_agree": 2
  };
  if (responses[0]) {
    const weight = responseWeights[responses[0]] || 0;
    if (weight > 0) {
      scores.E += weight;
    } else if (weight < 0) {
      scores.I += Math.abs(weight);
    }
  }
  if (responses[1]) {
    const weight = responseWeights[responses[1]] || 0;
    if (weight > 0) {
      scores.S += weight;
    } else if (weight < 0) {
      scores.N += Math.abs(weight);
    }
  }
  if (responses[2]) {
    const weight = responseWeights[responses[2]] || 0;
    if (weight > 0) {
      scores.T += weight;
    } else if (weight < 0) {
      scores.F += Math.abs(weight);
    }
  }
  if (responses[3]) {
    const weight = responseWeights[responses[3]] || 0;
    if (weight > 0) {
      scores.J += weight;
    } else if (weight < 0) {
      scores.P += Math.abs(weight);
    }
  }
  const type = (scores.E > scores.I ? "E" : "I") + (scores.S > scores.N ? "S" : "N") + (scores.T > scores.F ? "T" : "F") + (scores.J > scores.P ? "J" : "P");
  return {
    type,
    description: mbtiTypes[type]?.description || "Unique personality type",
    functions: mbtiTypes[type]?.functions || []
  };
}

// server/services/archetype.ts
var archetypes = [
  {
    keywords: ["fire", "leo", "leader", "1", "8", "commander", "achiever"],
    title: "Solar Sovereign",
    description: "A crown of light rests upon your brow, woven from threads of creative fire and illuminated purpose. You embody the golden dawn of possibility, drawing souls into your luminous orbit like moths to sacred flame.",
    strengths: ["Celestial Leadership", "Alchemical Self-Expression", "Presence that Inspires Awakening", "Lion-Hearted Courage"],
    shadows: ["The Mirror of Ego", "Shadow of Dominion", "Hunger for Reflected Light"],
    themes: ["The Throne of Authentic Power", "Flames of Creation", "Voice that Commands the Stars", "Divine Authority Robed in Humility"],
    guidance: "Let your solar fire warm rather than burn\u2014for the truest sovereign rules through love's radiance, not power's glare. Illuminate paths for others while walking your own with grace."
  },
  {
    keywords: ["water", "scorpio", "cancer", "4", "5", "investigator", "individualist"],
    title: "Mirror Alchemist",
    description: "Within you dwells a sacred crucible where shadows transmute to starlight, wounds blossom into wisdom. You are the mystic who dances with darkness to birth the dawn\u2014a soul-deep transformer who knows that pearls form only in the oyster's pain.",
    strengths: ["Depths that Heal Wounds", "Phoenix-Fire Transformation", "Sight Beyond the Veil", "Sacred Alchemy of the Soul"],
    shadows: ["Ocean that Drowns the Self", "Fortress of Isolation", "Spiral of Obsession"],
    themes: ["Metamorphosis through Shadow", "Waters that Cleanse and Renew", "Emotional Mastery as Spiritual Art", "Depth as Devotional Practice"],
    guidance: "Trust the medicine brewing in your depths, yet remember: even the deepest divers must breathe. Surface to share your pearls of wisdom, lest they remain forever hidden in the sacred dark."
  },
  {
    keywords: ["air", "gemini", "aquarius", "3", "7", "enthusiast", "campaigner"],
    title: "Cosmic Messenger",
    description: "You are the silver-tongued weaver of words and worlds, the bridge between heaven's whispers and earth's ears. Divine sparks dance on your lips\u2014each utterance a prayer, each idea a seed of revolution cast upon winds of change.",
    strengths: ["Voice that Carries Stardust", "Mind Like Quicksilver Lightning", "Shape-Shifting Adaptation", "Vision that Births Tomorrow"],
    shadows: ["Butterfly Mind's Scattered Flight", "Drowning in the Data-Stream", "Surface Skimmer of Shallow Seas"],
    themes: ["Communication as Sacred Communion", "Innovation's Electric Kiss", "Threads that Weave Souls Together", "Wisdom Shared is Love Multiplied"],
    guidance: "Gather your brilliant fragments into focused beams of light. When your words serve the highest truth, you become the universe speaking through human form\u2014precious vessel, prophetic voice."
  },
  {
    keywords: ["earth", "taurus", "virgo", "capricorn", "6", "2", "helper", "protector"],
    title: "Sacred Guardian",
    description: "You are the mountain's steadfast embrace, the oak's patient shelter, the soil that nourishes all growing things. Yours is the quiet power of stones and seasons\u2014a love that builds cathedrals grain by grain, breath by devoted breath.",
    strengths: ["Roots that Anchor Souls", "Earth-Wisdom Made Tangible", "Love that Tends and Mends", "Loyalty Carved in Ancient Stone"],
    shadows: ["Atlas Who Carries Too Much Sky", "Walls that Protect Yet Imprison", "Martyrdom's Bitter Harvest"],
    themes: ["Service as Sacred Offering", "Fortress-Hearts that Shelter All", "Foundation Stones of Communities", "Nurture as Highest Calling"],
    guidance: "Your devotion is divine\u2014yet even guardians need guarding, even givers must receive. Fill your own well with the waters of self-love, that your rivers of service may flow eternal."
  },
  {
    keywords: ["mutable", "9", "peacemaker", "mediator", "libra"],
    title: "Harmony Weaver",
    description: "You walk the tightrope between warring worlds, a master of the sacred dance where all opposites embrace. Like moonlight that gentles the night, you bring balm to burning conflicts\u2014your very presence a prayer for peace made flesh.",
    strengths: ["Scales of Divine Justice", "Peacemaker's Healing Touch", "Beauty that Restores Balance", "Equilibrium Born of Grace"],
    shadows: ["Flight from Necessary Storms", "Paralysis of Perpetual Maybe", "Mirror that Reflects Only Others"],
    themes: ["Balance as Spiritual Practice", "Peace Woven from Chaos-Threads", "The Art of Sacred Compromise", "Diplomacy as Love's Language"],
    guidance: "Your gift for harmony is humanity's treasure\u2014yet true peace begins within. Dare to disturb false tranquility when justice calls. Sometimes the most loving act is speaking the difficult truth."
  }
];
function generateIntegrationAnalysis(astrologyData, numerologyData, personalityData, archetype) {
  const astroInfluence = generateAstrologyInfluence(astrologyData);
  const numeroInfluence = generateNumerologyInfluence(numerologyData);
  const personalityBridge = generatePersonalityBridge(personalityData);
  const soulSynthesis = generateSoulSynthesis(astrologyData, numerologyData, personalityData, archetype);
  const lifeThemes = extractLifeThemes(astrologyData, numerologyData, personalityData);
  return {
    astrologyInfluence: astroInfluence,
    numerologyInfluence: numeroInfluence,
    personalityBridge,
    soulSynthesis,
    lifeThemes
  };
}
function generatePersonalizedInsights(astrologyData, numerologyData, personalityData, archetype) {
  return {
    coreEssence: generateCoreEssence(astrologyData, numerologyData, archetype),
    spiritualPurpose: generateSpiritualPurpose(astrologyData, numerologyData, personalityData),
    evolutionPath: generateEvolutionPath(astrologyData, numerologyData, archetype),
    keyLessons: generateKeyLessons(astrologyData, numerologyData, personalityData)
  };
}
function generateAstrologyInfluence(astrologyData) {
  if (!astrologyData) return "Your astrological blueprint awaits discovery through detailed birth chart analysis.";
  const { sunSign, moonSign, risingSign } = astrologyData;
  return `Your ${sunSign} Sun provides your core identity and creative force, while your ${moonSign} Moon shapes your emotional nature and inner world. Your ${risingSign} Rising sign creates the persona you present to the world, influencing how others first perceive you. Together, these three form your astrological trinity, creating a unique cosmic signature that influences your personality, motivations, and life path.`;
}
function generateNumerologyInfluence(numerologyData) {
  if (!numerologyData) return "Your numerological patterns reveal themselves through the sacred mathematics of your name and birth date.";
  const { lifePath: lifePath2, expression, soulUrge, personality } = numerologyData;
  return `Your Life Path ${lifePath2} reveals your soul's intended journey and core lessons. Expression Number ${expression} shows your natural talents and abilities, while Soul Urge ${soulUrge} uncovers your heart's deepest desires. Your Personality Number ${personality} influences how others perceive you. These numbers work together to create a mathematical blueprint of your soul's purpose and potential.`;
}
function generatePersonalityBridge(personalityData) {
  if (!personalityData?.enneagram && !personalityData?.mbti) {
    return "Your personality patterns bridge your cosmic blueprint with earthly expression through conscious self-awareness.";
  }
  let bridge = "";
  if (personalityData?.enneagram) {
    bridge += `Your Enneagram Type ${personalityData.enneagram.type} reveals your core motivations and unconscious patterns. `;
  }
  if (personalityData?.mbti) {
    bridge += `Your ${personalityData.mbti.type} type shows how you process information and make decisions. `;
  }
  bridge += "These personality frameworks help bridge your cosmic design with practical daily living, showing how your soul's blueprint manifests in conscious behavior and choice.";
  return bridge;
}
function generateSoulSynthesis(astrologyData, numerologyData, personalityData, archetype) {
  const systems = [];
  if (astrologyData) systems.push("astrological influences");
  if (numerologyData) systems.push("numerological patterns");
  if (personalityData?.enneagram || personalityData?.mbti) systems.push("personality dynamics");
  if (systems.length === 0) {
    return `The ${archetype.title} archetype represents your soul's unique expression awaiting full discovery.`;
  }
  const systemsText = systems.join(", ");
  return `The ${archetype.title} archetype emerges from the synthesis of your ${systemsText}. This archetypal pattern represents how your soul chose to express itself in this incarnation, combining cosmic timing, sacred mathematics, and conscious personality into a unified spiritual identity. Your archetype serves as a guiding template for understanding your deepest nature and highest potential.`;
}
function generateCoreEssence(astrologyData, numerologyData, archetype) {
  let essence = `At your core, you embody the ${archetype.title} archetype - ${archetype.description.toLowerCase()}`;
  if (astrologyData?.sunSign && numerologyData?.lifePath) {
    essence += ` Your ${astrologyData.sunSign} Sun and Life Path ${numerologyData.lifePath} create a unique soul signature that expresses through ${archetype.themes.join(", ").toLowerCase()}.`;
  } else {
    essence += ` This archetypal essence expresses through themes of ${archetype.themes.join(", ").toLowerCase()}.`;
  }
  return essence;
}
function generateSpiritualPurpose(astrologyData, numerologyData, personalityData) {
  let purpose = "Your spiritual purpose involves integrating your cosmic gifts into earthly service.";
  if (astrologyData?.northNode) {
    purpose = `Your North Node in ${astrologyData.northNode.sign} reveals your soul's primary growth direction. `;
  }
  if (numerologyData?.lifePath) {
    const lifePath2 = numerologyData.lifePath;
    if (lifePath2 === 1) purpose += "As a Life Path 1, you're here to pioneer new ways of being and lead others toward authenticity.";
    else if (lifePath2 === 2) purpose += "As a Life Path 2, you're here to teach cooperation and bring harmony to divided situations.";
    else if (lifePath2 === 3) purpose += "As a Life Path 3, you're here to inspire others through creative expression and joyful communication.";
    else if (lifePath2 === 4) purpose += "As a Life Path 4, you're here to build stable foundations that support humanity's progress.";
    else if (lifePath2 === 5) purpose += "As a Life Path 5, you're here to expand consciousness through exploration and change.";
    else if (lifePath2 === 6) purpose += "As a Life Path 6, you're here to heal and nurture others through unconditional love.";
    else if (lifePath2 === 7) purpose += "As a Life Path 7, you're here to seek truth and bridge spiritual wisdom with practical application.";
    else if (lifePath2 === 8) purpose += "As a Life Path 8, you're here to master material realm while maintaining spiritual values.";
    else if (lifePath2 === 9) purpose += "As a Life Path 9, you're here to serve humanity's evolution through wisdom and compassion.";
    else if (lifePath2 === 11) purpose += "As a Master Number 11, you're here to inspire others through spiritual insight and intuitive guidance.";
    else if (lifePath2 === 22) purpose += "As a Master Number 22, you're here to build lasting structures that bridge heaven and earth.";
    else if (lifePath2 === 33) purpose += "As a Master Number 33, you're here to heal through pure love and embody Christ consciousness.";
    else purpose += `Your Life Path ${lifePath2} carries unique spiritual assignments for this incarnation.`;
  } else {
    purpose += " Your purpose unfolds through conscious integration of your spiritual gifts with practical service.";
  }
  return purpose;
}
function generateEvolutionPath(astrologyData, numerologyData, archetype) {
  let path3 = `Your evolutionary path follows the ${archetype.title} template, moving from `;
  if (archetype.shadows && archetype.shadows.length > 0) {
    path3 += `unconscious patterns like ${archetype.shadows[0].toLowerCase()} toward `;
  } else {
    path3 += "unconscious reactive patterns toward ";
  }
  if (archetype.strengths && archetype.strengths.length > 0) {
    path3 += `conscious mastery of ${archetype.strengths[0].toLowerCase()}. `;
  } else {
    path3 += "conscious mastery of your gifts. ";
  }
  if (astrologyData?.southNode && astrologyData?.northNode) {
    path3 += `Astrologically, you're evolving from ${astrologyData.southNode.sign} patterns toward ${astrologyData.northNode.sign} growth.`;
  } else {
    path3 += "This evolution involves integrating shadow aspects while developing your highest potential.";
  }
  return path3;
}
function generateKeyLessons(astrologyData, numerologyData, personalityData) {
  const lessons = [];
  if (numerologyData?.lifePath) {
    const lifePath2 = numerologyData.lifePath;
    if (lifePath2 === 1) lessons.push("Learning to lead without dominating others");
    else if (lifePath2 === 2) lessons.push("Balancing cooperation with healthy boundaries");
    else if (lifePath2 === 3) lessons.push("Focusing creative energy for maximum impact");
    else if (lifePath2 === 4) lessons.push("Building without becoming rigid or controlling");
    else if (lifePath2 === 5) lessons.push("Embracing freedom while honoring commitments");
    else if (lifePath2 === 6) lessons.push("Serving others without losing yourself");
    else if (lifePath2 === 7) lessons.push("Sharing wisdom without becoming isolated");
    else if (lifePath2 === 8) lessons.push("Using power for service rather than control");
    else if (lifePath2 === 9) lessons.push("Giving without depleting your own resources");
    else if ([11, 22, 33].includes(lifePath2)) lessons.push("Grounding spiritual gifts in practical service");
  }
  if (astrologyData?.northNode) {
    const northNode = astrologyData.northNode.sign;
    if (northNode === "Aries") lessons.push("Developing courage and independent action");
    else if (northNode === "Taurus") lessons.push("Cultivating patience and practical wisdom");
    else if (northNode === "Gemini") lessons.push("Learning effective communication and adaptability");
    else if (northNode === "Cancer") lessons.push("Developing emotional intelligence and nurturing");
    else if (northNode === "Leo") lessons.push("Expressing authentic creativity and leadership");
    else if (northNode === "Virgo") lessons.push("Mastering service and attention to detail");
    else if (northNode === "Libra") lessons.push("Creating balance and harmonious relationships");
    else if (northNode === "Scorpio") lessons.push("Transforming through emotional depth and healing");
    else if (northNode === "Sagittarius") lessons.push("Expanding consciousness through higher learning");
    else if (northNode === "Capricorn") lessons.push("Building lasting structures with integrity");
    else if (northNode === "Aquarius") lessons.push("Contributing to collective progress and innovation");
    else if (northNode === "Pisces") lessons.push("Developing compassion and spiritual surrender");
  }
  if (personalityData?.enneagram?.type) {
    const type = personalityData.enneagram.type;
    if (type === 1) lessons.push("Accepting imperfection while maintaining standards");
    else if (type === 2) lessons.push("Recognizing and meeting your own needs");
    else if (type === 3) lessons.push("Valuing authentic being over achievement");
    else if (type === 4) lessons.push("Finding beauty in ordinary experiences");
    else if (type === 5) lessons.push("Engaging with life instead of just observing");
    else if (type === 6) lessons.push("Trusting yourself and your inner authority");
    else if (type === 7) lessons.push("Going deep instead of constantly seeking novelty");
    else if (type === 8) lessons.push("Using strength to protect rather than control");
    else if (type === 9) lessons.push("Taking action on your own priorities");
  }
  if (lessons.length === 0) {
    lessons.push("Integrating your cosmic blueprint with earthly service");
    lessons.push("Balancing personal growth with contribution to others");
    lessons.push("Transforming unconscious patterns into conscious gifts");
  }
  return lessons;
}
function extractLifeThemes(astrologyData, numerologyData, personalityData) {
  const themes = /* @__PURE__ */ new Set();
  if (astrologyData) {
    const { sunSign, moonSign } = astrologyData;
    if (["aries", "leo", "sagittarius"].includes(sunSign?.toLowerCase())) {
      themes.add("Creative self-expression");
      themes.add("Leadership and inspiration");
    }
    if (["taurus", "virgo", "capricorn"].includes(sunSign?.toLowerCase())) {
      themes.add("Building and manifestation");
      themes.add("Practical service");
    }
    if (["gemini", "libra", "aquarius"].includes(sunSign?.toLowerCase())) {
      themes.add("Communication and connection");
      themes.add("Social innovation");
    }
    if (["cancer", "scorpio", "pisces"].includes(sunSign?.toLowerCase())) {
      themes.add("Emotional healing");
      themes.add("Spiritual transformation");
    }
  }
  if (numerologyData?.lifePath) {
    const lifePath2 = numerologyData.lifePath;
    if ([1, 8].includes(lifePath2)) themes.add("Leadership and achievement");
    if ([2, 6, 9].includes(lifePath2)) themes.add("Service and cooperation");
    if ([3, 5].includes(lifePath2)) themes.add("Creative expression and freedom");
    if ([4, 7].includes(lifePath2)) themes.add("Knowledge and systematic building");
    if ([11, 22, 33].includes(lifePath2)) themes.add("Spiritual mastery and teaching");
  }
  return Array.from(themes).slice(0, 6);
}
function generateUniqueArchetypeTitle(astrologyData, numerologyData, personalityData) {
  const profileSignature = JSON.stringify({
    sun: astrologyData?.sunSign,
    moon: astrologyData?.moonSign,
    rising: astrologyData?.risingSign,
    lifePath: numerologyData?.lifePath,
    expression: numerologyData?.expression,
    soulUrge: numerologyData?.soulUrge,
    personality: numerologyData?.personality,
    enneagram: personalityData?.enneagram?.type,
    mbti: personalityData?.mbti?.type,
    // Include raw astro data for uniqueness even with same signs
    planets: JSON.stringify(astrologyData?.planets || {}),
    houses: JSON.stringify(astrologyData?.houses || {})
  });
  const fullHash = hashString(profileSignature);
  const prefixPools = {
    fire: ["Solar", "Radiant", "Flame", "Phoenix", "Luminous", "Blazing", "Ember", "Stellar"],
    earth: ["Sacred", "Earthbound", "Grounded", "Mountain", "Crystalline", "Rooted", "Stone", "Verdant"],
    air: ["Cosmic", "Celestial", "Ethereal", "Windborn", "Astral", "Skyward", "Breeze", "Cloud"],
    water: ["Mystic", "Ocean", "Lunar", "Mirror", "Tidal", "Flowing", "Deep", "Reflective"]
  };
  const corePools = {
    1: ["Sovereign", "Pioneer", "Trailblazer", "Initiator", "Leader", "Pathfinder", "Vanguard"],
    2: ["Harmonizer", "Peaceweaver", "Bridge", "Diplomat", "Mediator", "Unifier", "Balancer"],
    3: ["Muse", "Creator", "Storyteller", "Bard", "Artist", "Wordsmith", "Performer"],
    4: ["Builder", "Architect", "Guardian", "Keeper", "Foundation", "Crafter", "Mason"],
    5: ["Wanderer", "Explorer", "Catalyst", "Transformer", "Voyager", "Seeker", "Adventurer"],
    6: ["Healer", "Nurturer", "Caretaker", "Shepherd", "Protector", "Guardian", "Tender"],
    7: ["Seeker", "Sage", "Mystic", "Oracle", "Philosopher", "Scholar", "Knower"],
    8: ["Alchemist", "Master", "Manifestor", "Empress", "Sovereign", "Wielder", "Commander"],
    9: ["Visionary", "Lightbringer", "Compassionate", "Elder", "Wise One", "Guide", "Seer"],
    11: ["Illuminator", "Beacon", "Conduit", "Channel", "Lightkeeper", "Revealer", "Awakener"],
    22: ["Worldbuilder", "Architect", "Dreamweaver", "Crystallizer", "Anchor", "Founder", "Creator"],
    33: ["Avatar", "Christed", "Ascended", "Bodhisattva", "Master", "Saint", "Divine"]
  };
  const modifierPools = {
    i: ["Introspective", "Inner", "Quiet", "Reflective", "Centered"],
    e: ["Expressive", "Outward", "Radiant", "Outgoing", "Open"],
    n: ["Intuitive", "Visionary", "Inspired", "Imaginative", "Prophetic"],
    s: ["Practical", "Grounded", "Sensible", "Tangible", "Earthly"]
  };
  const components = [];
  if (astrologyData?.sunSign) {
    const element = getElementForSign(astrologyData.sunSign);
    const pool2 = prefixPools[element] || ["Awakened"];
    const selected = pool2[Math.abs(fullHash % pool2.length)];
    components.push(selected);
  }
  if (numerologyData?.lifePath) {
    const pool2 = corePools[numerologyData.lifePath] || ["Soul"];
    const selected = pool2[Math.abs((fullHash >> 4) % pool2.length)];
    components.push(selected);
  }
  if (personalityData?.mbti?.type) {
    const mbti = personalityData.mbti.type.toLowerCase();
    const ieKey = mbti.startsWith("i") ? "i" : "e";
    const nsKey = mbti.includes("n") ? "n" : "s";
    if (Math.abs((fullHash >> 8) % 3) === 0) {
      const pool2 = modifierPools[ieKey];
      const selected = pool2[Math.abs((fullHash >> 12) % pool2.length)];
      components.unshift(selected);
    }
    if (Math.abs((fullHash >> 16) % 3) === 1) {
      const pool2 = modifierPools[nsKey];
      const selected = pool2[Math.abs((fullHash >> 20) % pool2.length)];
      components.unshift(selected);
    }
  }
  if (numerologyData?.expression || numerologyData?.soulUrge) {
    const suffixNum = (numerologyData?.expression || 0) + (numerologyData?.soulUrge || 0);
    const suffixes = ["Light", "Truth", "Wisdom", "Grace", "Power", "Love", "Beauty", "Justice", "Freedom", "Unity", "Harmony", "Strength"];
    const selected = suffixes[Math.abs((fullHash >> 24) % suffixes.length)];
    if (Math.abs((fullHash >> 28) % 2) === 0 && components.length >= 2) {
      components.push(`of ${selected}`);
    }
  }
  if (components.length === 0) {
    components.push("Awakened", "Soul");
  }
  const syllables = [
    "Ra",
    "El",
    "Ka",
    "Na",
    "Sa",
    "Ta",
    "Ma",
    "Da",
    "La",
    "Va",
    "Ri",
    "Ni",
    "Mi",
    "Ki",
    "Si",
    "Ti",
    "Li",
    "Zi",
    "Fi",
    "Hi",
    "Ro",
    "No",
    "Mo",
    "Ko",
    "So",
    "To",
    "Lo",
    "Zo",
    "Fo",
    "Ho",
    "Ru",
    "Nu",
    "Mu",
    "Ku",
    "Su",
    "Tu"
  ];
  const syl1 = syllables[Math.abs(fullHash % syllables.length)];
  const syl2 = syllables[Math.abs((fullHash >> 6) % syllables.length)];
  const uniqueSuffix = `${syl1}${syl2}`;
  components.push(`-${uniqueSuffix}`);
  return components.join(" ");
}
function getElementForSign(sign) {
  const s = sign.toLowerCase();
  if (["aries", "leo", "sagittarius"].includes(s)) return "fire";
  if (["taurus", "virgo", "capricorn"].includes(s)) return "earth";
  if (["gemini", "libra", "aquarius"].includes(s)) return "air";
  if (["cancer", "scorpio", "pisces"].includes(s)) return "water";
  return "fire";
}
function hashString(str) {
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    hash2 = (hash2 << 5) - hash2 + str.charCodeAt(i);
    hash2 = hash2 & hash2;
  }
  return hash2;
}
function synthesizeArchetype(astrologyData, numerologyData, personalityData) {
  const keywords = [];
  if (astrologyData) {
    if (astrologyData.sunSign) keywords.push(astrologyData.sunSign.toLowerCase());
    if (astrologyData.moonSign) keywords.push(astrologyData.moonSign.toLowerCase());
    if (astrologyData.risingSign) keywords.push(astrologyData.risingSign.toLowerCase());
    const sunSignLower = astrologyData.sunSign?.toLowerCase();
    if (["aries", "leo", "sagittarius"].includes(sunSignLower)) keywords.push("fire");
    if (["taurus", "virgo", "capricorn"].includes(sunSignLower)) keywords.push("earth");
    if (["gemini", "libra", "aquarius"].includes(sunSignLower)) keywords.push("air");
    if (["cancer", "scorpio", "pisces"].includes(sunSignLower)) keywords.push("water");
  }
  if (numerologyData?.lifePath) {
    keywords.push(numerologyData.lifePath.toString());
  }
  if (personalityData?.enneagram?.type) {
    keywords.push(personalityData.enneagram.type.toString());
  }
  if (personalityData?.mbti?.type) {
    keywords.push(personalityData.mbti.type.toLowerCase());
  }
  let bestMatch = archetypes[0];
  let maxMatches = 0;
  for (const archetype of archetypes) {
    const matches = archetype.keywords.filter(
      (keyword) => keywords.some((k) => k && (k.includes(keyword) || keyword.includes(k)))
    ).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = archetype;
    }
  }
  const uniqueTitle = generateUniqueArchetypeTitle(astrologyData, numerologyData, personalityData);
  const integration = generateIntegrationAnalysis(astrologyData, numerologyData, personalityData, bestMatch);
  const personalizedInsights = generatePersonalizedInsights(astrologyData, numerologyData, personalityData, bestMatch);
  const result = {
    title: uniqueTitle,
    description: bestMatch.description,
    strengths: bestMatch.strengths || [],
    shadows: bestMatch.shadows || [],
    themes: bestMatch.themes || [],
    guidance: bestMatch.guidance,
    integration,
    personalizedInsights
  };
  return result;
}

// server/services/openai.ts
import OpenAI from "openai";
var openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
function generateFallbackBiography(data) {
  const themes = data.archetype?.themes || ["transformation", "self-discovery", "spiritual growth"];
  const sunSign = data.astrologyData?.sunSign || data.vedicAstrologyData?.sunSign || "the cosmos";
  const moonSign = data.astrologyData?.moonSign || data.vedicAstrologyData?.moonSign || "my inner wisdom";
  const lifePath2 = data.numerologyData?.lifePath || "";
  const hdType = data.humanDesignData?.type || "";
  const chineseSign = data.chineseAstrologyData?.yearAnimal?.name || "";
  const iChingName = data.iChingData?.name || "";
  const mayanSign = data.mayanAstrologyData?.daySign?.name || "";
  const ayurvedaDosha = data.ayurvedaData?.primaryDosha?.name || "";
  const birthRune = data.runesData?.rune || "";
  const geneKeyGift = data.geneKeysData?.lifeWork?.gift || "";
  const tarotCard = data.tarotCards && data.tarotCards.length > 0 ? data.tarotCards[0].name : "";
  const primaryChakra = data.chakraData?.dominantChakras?.[0]?.name || "";
  const sacredShape = data.sacredGeometryData?.primaryShape || "";
  const keyAsteroid = data.asteroidsData?.asteroids?.[0]?.name || "";
  const fixedStar = data.fixedStarsData?.conjunctions?.[0]?.starName || "";
  const vedicMoon = data.vedicAstrologyData?.moonNakshatra || "";
  const templates = [
    // Template 1: Comprehensive multi-system synthesis
    `I am a ${data.archetypeTitle}, ${hdType ? `a ${hdType} in Human Design, ` : ""}born under ${sunSign} with ${moonSign} guiding my emotional depths${vedicMoon ? ` (${vedicMoon} nakshatra)` : ""}${lifePath2 ? `, carrying the vibration of Life Path ${lifePath2}` : ""}${tarotCard ? `. The ${tarotCard} illuminates my soul's journey` : ""}. ${chineseSign ? `The wisdom of the ${chineseSign} flows through my being, ` : ""}${iChingName ? `embodying the essence of ${iChingName}. ` : ""}${sacredShape ? `The ${sacredShape} reflects my sacred geometry, ` : ""}My path has been one of ${themes[0]} and deep inner wisdom${mayanSign ? `, aligned with ${mayanSign} day sign energy` : ""}${fixedStar ? `, amplified by ${fixedStar}'s celestial influence` : ""}. I transform challenges into stepping stones for growth, ${primaryChakra ? `channeling energy through my ${primaryChakra} center and ` : ""}using my ${ayurvedaDosha ? `${ayurvedaDosha} nature and ` : ""}intuitive gifts to navigate both seen and unseen worlds. ${geneKeyGift ? `My gift of ${geneKeyGift} ` : "I "}serve${geneKeyGift ? "s" : ""} as a bridge between mystical and practical${birthRune ? `, guided by ${birthRune}'s ancient wisdom` : ""}.`,
    // Template 2: Energy design and celestial influences
    `As a ${data.archetypeTitle}${hdType ? ` and ${hdType} being` : ""}, I walk between worlds with ${sunSign} illuminating my path${keyAsteroid ? ` and ${keyAsteroid} adding depth to my cosmic signature` : ""}. ${moonSign !== "my inner wisdom" ? `${moonSign} anchors my intuition` : "My intuition guides me"}${vedicMoon ? ` through the lens of ${vedicMoon}` : ""}${lifePath2 ? `, while Life Path ${lifePath2}` : ", and my path"} teaches me that ${themes[1] || "self-discovery"} unlocks my highest potential. ${chineseSign ? `The ${chineseSign}'s energy brings ` : "I carry "}${themes[2] || "spiritual growth"} into everything I touch${mayanSign ? `, dancing with ${mayanSign} cosmic timing` : ""}. ${tarotCard ? `The ${tarotCard} card reveals ` : "My journey reveals "}the depths of ${themes[0]}. ${ayurvedaDosha ? `My ${ayurvedaDosha} constitution guides my healing journey, ` : ""}${primaryChakra ? `balanced through my ${primaryChakra}, ` : ""}${iChingName ? `while ${iChingName} reminds me that ` : "knowing that "}every experience serves my soul's evolution. ${geneKeyGift ? `Through ${geneKeyGift}, ` : ""}I continue expanding into my fullest expression.`,
    // Template 3: Sacred patterns weaving cosmic dance
    `My essence as a ${data.archetypeTitle} reflects the cosmic dance of ${sunSign} energy${hdType ? ` channeled through ${hdType} design` : ""}${lifePath2 ? `, harmonizing with Life Path ${lifePath2} wisdom` : ""}. ${chineseSign ? `Born in the year of the ${chineseSign}, ` : ""}${birthRune ? `guided by ${birthRune}, ` : ""}${sacredShape ? `embodying ${sacredShape} sacred geometry, ` : ""}I am here to experience ${themes[0]} in all its forms${mayanSign ? `, aligned with ${mayanSign} sacred timing` : ""}${fixedStar ? ` and blessed by ${fixedStar}'s stellar guidance` : ""}. ${tarotCard ? `The ${tarotCard} illuminates my path, ` : ""}${iChingName ? `${iChingName} teaches me that ` : "I understand that "}each challenge is an invitation to alchemize pain into wisdom${ayurvedaDosha ? `, balanced through my ${ayurvedaDosha} nature` : ""}${primaryChakra ? ` and ${primaryChakra} energy` : ""}. ${keyAsteroid ? `${keyAsteroid}'s influence adds ` : "My cosmic signature adds "}unique depth to my journey. ${geneKeyGift ? `My gift of ${geneKeyGift} allows` : "My gifts allow"} me to serve as a bridge between mystical and practical worlds${moonSign !== "my inner wisdom" ? `, with ${moonSign}${vedicMoon ? ` (${vedicMoon})` : ""} guiding my emotional intelligence` : ""}. ${data.archetype?.guidance || "I help others recognize their own divine nature and cosmic purpose."}`
  ];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}
async function generateBiography(data) {
  if (!openai) {
    console.log("OpenAI API key not available, using fallback biography generation");
    return generateFallbackBiography(data);
  }
  try {
    const profileSummary = `You are an expert mystical biographer. Create a compelling 2-3 paragraph first-person biographical narrative for ${data.name}.

COMPLETE SOUL SYNTHESIS (30+ Mystical Systems):

Core Identity:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign || "Unknown"}
- Life Path: ${data.numerologyData?.lifePath} | Expression: ${data.numerologyData?.expression} | Soul Urge: ${data.numerologyData?.soulUrge || "Unknown"}
- Enneagram: ${data.personalityData?.enneagram?.type || "Unknown"} | MBTI: ${data.personalityData?.mbti?.type || "Unknown"}
${Array.isArray(data.tarotCards) && data.tarotCards.length > 0 ? `- Tarot Birth Cards: ${data.tarotCards.map((c) => c.name).join(" & ")}` : ""}

Energy Design:
${data.humanDesignData ? `- Human Design: ${data.humanDesignData.type} ${data.humanDesignData.profile || ""} | Authority: ${data.humanDesignData.authority}` : ""}
${data.vedicAstrologyData ? `- Vedic Sun: ${data.vedicAstrologyData.sunSign} | Moon Nakshatra: ${data.vedicAstrologyData.moonNakshatra}` : ""}
${data.chineseAstrologyData ? `- Chinese Zodiac: ${data.chineseAstrologyData.yearAnimal?.name || data.chineseAstrologyData.yearAnimal} (${data.chineseAstrologyData.yearElement} Element)` : ""}

Soul Path & Purpose:
${data.geneKeysData ? `- Gene Keys: Gift: ${data.geneKeysData.lifeWork?.gift}, Genius: ${data.geneKeysData.evolution?.genius}` : ""}
${data.iChingData ? `- I Ching: ${data.iChingData.number}. ${data.iChingData.name} - ${data.iChingData.keywords?.slice(0, 3).join(", ") || ""}` : ""}
${data.kabbalahData ? `- Kabbalistic Path: ${data.kabbalahData.primaryPath?.number}. ${data.kabbalahData.primaryPath?.name} - ${data.kabbalahData.primaryPath?.essence}` : ""}
${data.mayanAstrologyData ? `- Mayan Day Sign: ${data.mayanAstrologyData.daySign?.name || data.mayanAstrologyData.daySign} (Tone ${data.mayanAstrologyData.tone}) - ${data.mayanAstrologyData.keywords?.slice(0, 2).join(", ") || ""}` : ""}

Sacred Patterns & Symbols:
${data.sacredGeometryData ? `- Sacred Geometry: ${data.sacredGeometryData.primaryShape} - ${data.sacredGeometryData.meaning}` : ""}
${data.runesData ? `- Birth Rune: ${data.runesData.rune} - ${data.runesData.keywords?.slice(0, 3).join(", ") || ""}` : ""}
${data.chakraData ? `- Dominant Chakras: ${data.chakraData.dominantChakras?.map((c) => c.name).slice(0, 2).join(", ") || ""}` : ""}
${data.sabianSymbolsData ? `- Sabian Symbols: Sun ${data.sabianSymbolsData.sun?.symbol || ""}, Moon ${data.sabianSymbolsData.moon?.symbol || ""}` : ""}

Healing & Wellness:
${data.ayurvedaData ? `- Ayurvedic Dosha: ${data.ayurvedaData.primaryDosha?.name || data.ayurvedaData.primaryDosha} (${data.ayurvedaData.qualities?.slice(0, 3).join(", ") || ""})` : ""}
${data.biorhythmsData ? `- Life Rhythms: Physical Peak Day ${data.biorhythmsData.physicalPeakDays?.[0] || "varies"}, Emotional ${data.biorhythmsData.emotionalPeakDays?.[0] || "varies"}` : ""}

Advanced Celestial Influences:
${data.asteroidsData ? `- Key Asteroids: ${data.asteroidsData.asteroids?.slice(0, 3).map((a) => `${a.name} in ${a.sign}`).join(", ") || ""}` : ""}
${data.arabicPartsData ? `- Arabic Parts: Fortune in ${data.arabicPartsData.fortune?.sign || ""}, Spirit in ${data.arabicPartsData.spirit?.sign || ""}` : ""}
${data.fixedStarsData ? `- Fixed Star Influences: ${data.fixedStarsData.conjunctions?.slice(0, 2).map((s) => s.starName).join(", ") || ""}` : ""}

Core Themes:
${data.archetype?.themes?.join(", ") || "Transformation, self-discovery, spiritual growth"}

INSTRUCTIONS:
Write in first person as if ${data.name} is introducing themselves. Synthesize the MOST IMPORTANT patterns from across ALL these systems into a cohesive spiritual narrative. Focus on:
1. Their unique cosmic signature and how multiple systems reveal complementary truths
2. Core gifts and challenges that appear across systems
3. Their life purpose and how they transform challenges into wisdom
4. Keep it mystical yet authentic - this is their complete soul story

Return only the biographical text (2-3 paragraphs), no additional formatting.`;
    const prompt = profileSummary;
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });
    return response.choices[0].message.content || generateFallbackBiography(data);
  } catch (error) {
    console.error("Error generating biography with OpenAI, using fallback:", error);
    return generateFallbackBiography(data);
  }
}
function generateFallbackDailyGuidance(data) {
  const guidanceTemplates = [
    `Today, embrace your ${data.archetypeTitle} nature by focusing on ${data.archetype?.themes?.[0] || "transformation"}. Trust your ${data.astrologyData?.moonSign || "intuitive"} intuition to guide you through any challenges that arise.`,
    `Your ${data.astrologyData?.sunSign || "solar"} energy is particularly strong today. Channel this power into ${data.archetype?.themes?.[1] || "creative expression"} and remember that every experience serves your highest growth.`,
    `As a ${data.archetypeTitle}, today calls you to honor both your light and shadow. Your Life Path ${data.numerologyData?.lifePath || ""} wisdom reminds you that ${data.archetype?.guidance || "balance is key to your spiritual evolution"}.`
  ];
  const randomIndex = Math.floor(Math.random() * guidanceTemplates.length);
  return guidanceTemplates[randomIndex];
}
async function generateDailyGuidance(data) {
  if (!openai) {
    console.log("OpenAI API key not available, using fallback daily guidance generation");
    return generateFallbackDailyGuidance(data);
  }
  try {
    const prompt = `Create personalized daily guidance for ${data.name} based on their spiritual profile.

Profile:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign}
- Life Path: ${data.numerologyData?.lifePath}

Generate a brief, actionable daily insight (2-3 sentences) that aligns with their cosmic blueprint. Focus on practical spiritual guidance for today.

Return only the guidance text.`;
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    });
    return response.choices[0].message.content || generateFallbackDailyGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance with OpenAI, using fallback:", error);
    return generateFallbackDailyGuidance(data);
  }
}

// server/services/human-design.ts
import { fromZonedTime as fromZonedTime2, toZonedTime } from "date-fns-tz";
import * as geoTz2 from "geo-tz";
var HD_GATES = {
  1: { name: "The Creative", center: "G", keywords: ["Self-expression", "Creativity", "Leadership"] },
  2: { name: "The Receptive", center: "G", keywords: ["Direction", "Higher knowing", "Love of self"] },
  3: { name: "Ordering", center: "Sacral", keywords: ["Innovation", "Change", "New order"] },
  4: { name: "Youthful Folly", center: "Ajna", keywords: ["Answers", "Mental pressure", "Formulas"] },
  5: { name: "Waiting", center: "Sacral", keywords: ["Fixed rhythms", "Timing", "Patience"] },
  6: { name: "Conflict", center: "Solar Plexus", keywords: ["Friction", "Intimacy", "Emotions"] },
  7: { name: "The Army", center: "G", keywords: ["Leadership", "Role", "Interaction"] },
  8: { name: "Holding Together", center: "Throat", keywords: ["Contribution", "Style", "Uniqueness"] },
  9: { name: "The Taming Power of the Small", center: "Sacral", keywords: ["Focus", "Determination", "Details"] },
  10: { name: "Treading", center: "G", keywords: ["Behavior", "Love of self", "Higher principles"] },
  11: { name: "Peace", center: "Ajna", keywords: ["Ideas", "Peace", "Opinions"] },
  12: { name: "Standstill", center: "Throat", keywords: ["Caution", "Mood", "Articulation"] },
  13: { name: "Fellowship", center: "G", keywords: ["Listener", "Secrets", "Fellowship"] },
  14: { name: "Possession in Great Measure", center: "Sacral", keywords: ["Power skills", "Keys", "Prosperity"] },
  15: { name: "Modesty", center: "G", keywords: ["Extremes", "Rhythm", "Love of humanity"] },
  16: { name: "Enthusiasm", center: "Throat", keywords: ["Skills", "Enthusiasm", "Talent"] },
  17: { name: "Following", center: "Ajna", keywords: ["Opinions", "Following", "Service"] },
  18: { name: "Work on the Corrupted", center: "Spleen", keywords: ["Correction", "Challenge", "Patterns"] },
  19: { name: "Approach", center: "Root", keywords: ["Wanting", "Needs", "Approach"] },
  20: { name: "Contemplation", center: "Throat", keywords: ["The now", "Awareness", "Self-awareness"] },
  21: { name: "Biting Through", center: "Heart", keywords: ["Control", "Hunter", "Material"] },
  22: { name: "Grace", center: "Solar Plexus", keywords: ["Grace", "Openness", "Charm"] },
  23: { name: "Splitting Apart", center: "Throat", keywords: ["Assimilation", "Insight", "Knowing"] },
  24: { name: "Return", center: "Ajna", keywords: ["Rationalizing", "Return", "Blessing"] },
  25: { name: "Innocence", center: "G", keywords: ["Spirit", "Innocence", "Higher love"] },
  26: { name: "The Taming Power of the Great", center: "Heart", keywords: ["The egoist", "Great accumulator", "Pride"] },
  27: { name: "The Corners of the Mouth", center: "Sacral", keywords: ["Caring", "Nourishment", "Responsibility"] },
  28: { name: "The Great", center: "Spleen", keywords: ["The game player", "Struggle", "Purpose"] },
  29: { name: "The Abysmal", center: "Sacral", keywords: ["Saying yes", "Commitment", "Perseverance"] },
  30: { name: "The Clinging Fire", center: "Solar Plexus", keywords: ["Feelings", "Recognition", "Fatefulness"] },
  31: { name: "Influence", center: "Throat", keywords: ["Leading", "Influence", "Democracy"] },
  32: { name: "Duration", center: "Spleen", keywords: ["Continuity", "Endurance", "Transformation"] },
  33: { name: "Retreat", center: "Throat", keywords: ["Privacy", "Mindfulness", "Retreat"] },
  34: { name: "The Power of the Great", center: "Sacral", keywords: ["Power", "Strength", "Might"] },
  35: { name: "Progress", center: "Throat", keywords: ["Change", "Progress", "Experience"] },
  36: { name: "Darkening of the Light", center: "Solar Plexus", keywords: ["Crisis", "Exploration", "Adventure"] },
  37: { name: "The Family", center: "Solar Plexus", keywords: ["Friendship", "Community", "Equality"] },
  38: { name: "Opposition", center: "Root", keywords: ["The fighter", "Opposition", "Individuality"] },
  39: { name: "Obstruction", center: "Root", keywords: ["Provocation", "Challenge", "Spirit"] },
  40: { name: "Deliverance", center: "Heart", keywords: ["Aloneness", "Resolve", "Will"] },
  41: { name: "Decrease", center: "Root", keywords: ["Contraction", "Fantasy", "Imagination"] },
  42: { name: "Increase", center: "Sacral", keywords: ["Growth", "Finishing", "Completion"] },
  43: { name: "Breakthrough", center: "Ajna", keywords: ["Insight", "Breakthrough", "Individual knowing"] },
  44: { name: "Coming to Meet", center: "Spleen", keywords: ["Coming to meet", "Truth", "Intuition"] },
  45: { name: "Gathering Together", center: "Throat", keywords: ["The gatherer", "Education", "Materialism"] },
  46: { name: "Pushing Upward", center: "G", keywords: ["The determination of the self", "Serendipity", "Luck"] },
  47: { name: "Oppression", center: "Ajna", keywords: ["Realizing", "Oppression", "Abstract"] },
  48: { name: "The Well", center: "Spleen", keywords: ["The well", "Depth", "Wisdom"] },
  49: { name: "Revolution", center: "Solar Plexus", keywords: ["Revolution", "Principles", "Rejection"] },
  50: { name: "The Cauldron", center: "Spleen", keywords: ["Values", "Responsibility", "Law"] },
  51: { name: "The Arousing", center: "Heart", keywords: ["Shock", "Arousing", "Initiative"] },
  52: { name: "Keeping Still", center: "Root", keywords: ["Stillness", "Inaction", "Meditation"] },
  53: { name: "Development", center: "Root", keywords: ["Beginnings", "Development", "Maturity"] },
  54: { name: "The Marrying Maiden", center: "Root", keywords: ["Ambition", "Drive", "Transformation"] },
  55: { name: "Abundance", center: "Solar Plexus", keywords: ["Spirit", "Abundance", "Moodiness"] },
  56: { name: "The Wanderer", center: "Throat", keywords: ["Stimulation", "Wanderer", "Storytelling"] },
  57: { name: "The Gentle", center: "Spleen", keywords: ["Intuitive clarity", "Gentle penetrating", "Instinct"] },
  58: { name: "The Joyous", center: "Root", keywords: ["Joy", "Aliveness", "Vitality"] },
  59: { name: "Dispersion", center: "Sacral", keywords: ["Sexuality", "Dispersion", "Intimacy"] },
  60: { name: "Limitation", center: "Root", keywords: ["Acceptance", "Limitation", "Mutation"] },
  61: { name: "Inner Truth", center: "Head", keywords: ["Mystery", "Inner truth", "Wonder"] },
  62: { name: "Small Exceeding", center: "Throat", keywords: ["Details", "Organization", "Expression"] },
  63: { name: "After Completion", center: "Head", keywords: ["Doubt", "After completion", "Logic"] },
  64: { name: "Before Completion", center: "Head", keywords: ["Confusion", "Before completion", "Pressure"] }
};
var HD_CENTERS = {
  "Head": { color: "#FFE4B5", description: "Mental pressure and inspiration" },
  "Ajna": { color: "#90EE90", description: "Mental awareness and concepts" },
  "Throat": { color: "#DDA0DD", description: "Communication and manifestation" },
  "G": { color: "#FFD700", description: "Identity, direction, and love" },
  "Heart": { color: "#F0E68C", description: "Will, ego, and material world" },
  "Spleen": { color: "#DEB887", description: "Intuition, instinct, and timing" },
  "Solar Plexus": { color: "#FFA07A", description: "Emotions and feelings" },
  "Sacral": { color: "#FA8072", description: "Life force and response" },
  "Root": { color: "#D2691E", description: "Stress, pressure, and fuel" }
};
var GATE_ZODIAC_MAP = [
  { gate: 25, start: 358.25 },
  // 28°15' Pisces
  { gate: 17, start: 3.875 },
  // 03°52'30" Aries
  { gate: 21, start: 9.5 },
  // 09°30' Aries
  { gate: 51, start: 15.125 },
  // 15°07'30" Aries
  { gate: 42, start: 20.75 },
  // 20°45' Aries
  { gate: 3, start: 26.375 },
  // 26°22'30" Aries
  { gate: 27, start: 32 },
  // 02°00' Taurus
  { gate: 24, start: 37.625 },
  // 07°37'30" Taurus
  { gate: 2, start: 43.25 },
  // 13°15' Taurus
  { gate: 23, start: 48.875 },
  // 18°52'30" Taurus
  { gate: 8, start: 54.5 },
  // 24°30' Taurus
  { gate: 20, start: 60.125 },
  // 00°07'30" Gemini
  { gate: 16, start: 65.75 },
  // 05°45' Gemini
  { gate: 35, start: 71.375 },
  // 11°22'30" Gemini
  { gate: 45, start: 77 },
  // 17°00' Gemini
  { gate: 12, start: 82.625 },
  // 22°37'30" Gemini
  { gate: 15, start: 88.25 },
  // 28°15' Gemini
  { gate: 52, start: 93.875 },
  // 03°52'30" Cancer
  { gate: 39, start: 99.5 },
  // 09°30' Cancer
  { gate: 53, start: 105.125 },
  // 15°07'30" Cancer
  { gate: 62, start: 110.75 },
  // 20°45' Cancer
  { gate: 56, start: 116.375 },
  // 26°22'30" Cancer
  { gate: 31, start: 122 },
  // 02°00' Leo
  { gate: 33, start: 127.625 },
  // 07°37'30" Leo
  { gate: 7, start: 133.25 },
  // 13°15' Leo
  { gate: 4, start: 138.875 },
  // 18°52'30" Leo
  { gate: 29, start: 144.5 },
  // 24°30' Leo
  { gate: 59, start: 150.125 },
  // 00°07'30" Virgo
  { gate: 40, start: 155.75 },
  // 05°45' Virgo
  { gate: 64, start: 161.375 },
  // 11°22'30" Virgo
  { gate: 47, start: 167 },
  // 17°00' Virgo
  { gate: 6, start: 172.625 },
  // 22°37'30" Virgo
  { gate: 46, start: 178.25 },
  // 28°15' Virgo
  { gate: 18, start: 183.875 },
  // 03°52'30" Libra
  { gate: 48, start: 189.5 },
  // 09°30' Libra
  { gate: 57, start: 195.125 },
  // 15°07'30" Libra
  { gate: 32, start: 200.75 },
  // 20°45' Libra
  { gate: 50, start: 206.375 },
  // 26°22'30" Libra
  { gate: 28, start: 212 },
  // 02°00' Scorpio
  { gate: 44, start: 217.625 },
  // 07°37'30" Scorpio
  { gate: 1, start: 223.25 },
  // 13°15' Scorpio
  { gate: 43, start: 228.875 },
  // 18°52'30" Scorpio
  { gate: 14, start: 234.5 },
  // 24°30' Scorpio
  { gate: 34, start: 240.125 },
  // 00°07'30" Sagittarius
  { gate: 9, start: 245.75 },
  // 05°45' Sagittarius
  { gate: 5, start: 251.375 },
  // 11°22'30" Sagittarius
  { gate: 26, start: 257 },
  // 17°00' Sagittarius
  { gate: 11, start: 262.625 },
  // 22°37'30" Sagittarius
  { gate: 10, start: 268.25 },
  // 28°15' Sagittarius
  { gate: 58, start: 273.875 },
  // 03°52'30" Capricorn
  { gate: 38, start: 279.5 },
  // 09°30' Capricorn
  { gate: 54, start: 285.125 },
  // 15°07'30" Capricorn
  { gate: 61, start: 290.75 },
  // 20°45' Capricorn
  { gate: 60, start: 296.375 },
  // 26°22'30" Capricorn
  { gate: 41, start: 302 },
  // 02°00' Aquarius
  { gate: 19, start: 307.625 },
  // 07°37'30" Aquarius
  { gate: 13, start: 313.25 },
  // 13°15' Aquarius
  { gate: 49, start: 318.875 },
  // 18°52'30" Aquarius
  { gate: 30, start: 324.5 },
  // 24°30' Aquarius
  { gate: 55, start: 330.125 },
  // 00°07'30" Pisces
  { gate: 37, start: 335.75 },
  // 05°45' Pisces
  { gate: 63, start: 341.375 },
  // 11°22'30" Pisces
  { gate: 22, start: 347 },
  // 17°00' Pisces
  { gate: 36, start: 352.625 }
  // 22°37'30" Pisces
];
var HD_CHANNELS = [
  { gates: [1, 8], name: "Channel of Inspiration", description: "A design of creative inspiration", connects: ["G", "Throat"] },
  { gates: [2, 14], name: "Channel of the Beat", description: "A design of being a keeper of the keys", connects: ["G", "Sacral"] },
  { gates: [3, 60], name: "Channel of Mutation", description: "A design of energy for change", connects: ["Sacral", "Root"] },
  { gates: [4, 63], name: "Channel of Logic", description: "A design of mental ease mixed with doubt", connects: ["Ajna", "Head"] },
  { gates: [5, 15], name: "Channel of Rhythm", description: "A design of being in the flow", connects: ["Sacral", "G"] },
  { gates: [6, 59], name: "Channel of Mating", description: "A design focused on reproduction", connects: ["Solar Plexus", "Sacral"] },
  { gates: [7, 31], name: "Channel of the Alpha", description: "A design of leadership for the good of all", connects: ["G", "Throat"] },
  { gates: [9, 52], name: "Channel of Concentration", description: "A design of determination", connects: ["Sacral", "Root"] },
  { gates: [10, 20], name: "Channel of Awakening", description: "A design of commitment to higher principles", connects: ["G", "Throat"] },
  { gates: [10, 34], name: "Channel of Exploration", description: "A design of following one's convictions", connects: ["G", "Sacral"] },
  { gates: [10, 57], name: "Channel of Perfected Form", description: "A design of survival", connects: ["G", "Spleen"] },
  { gates: [11, 56], name: "Channel of Curiosity", description: "A design of a searcher", connects: ["Ajna", "Throat"] },
  { gates: [12, 22], name: "Channel of Openness", description: "A design of a social being", connects: ["Throat", "Solar Plexus"] },
  { gates: [13, 33], name: "Channel of the Prodigal", description: "A design of a witness", connects: ["G", "Throat"] },
  { gates: [16, 48], name: "Channel of Wavelength", description: "A design of the talent", connects: ["Throat", "Spleen"] },
  { gates: [17, 62], name: "Channel of Acceptance", description: "A design of an organizational being", connects: ["Ajna", "Throat"] },
  { gates: [18, 58], name: "Channel of Judgment", description: "A design of insatiability", connects: ["Spleen", "Root"] },
  { gates: [19, 49], name: "Channel of Synthesis", description: "A design of being sensitive to needs", connects: ["Root", "Solar Plexus"] },
  { gates: [20, 34], name: "Channel of Charisma", description: "A design of being present", connects: ["Throat", "Sacral"] },
  { gates: [21, 45], name: "Channel of Money", description: "A design of a material being", connects: ["Heart", "Throat"] },
  { gates: [23, 43], name: "Channel of Structuring", description: "A design of individual knowing", connects: ["Throat", "Ajna"] },
  { gates: [24, 61], name: "Channel of Awareness", description: "A design of a thinker", connects: ["Ajna", "Head"] },
  { gates: [25, 51], name: "Channel of Initiation", description: "A design of needing to be first", connects: ["G", "Heart"] },
  { gates: [26, 44], name: "Channel of Surrender", description: "A design of a transgressor", connects: ["Heart", "Spleen"] },
  { gates: [27, 50], name: "Channel of Preservation", description: "A design of custodianship", connects: ["Sacral", "Spleen"] },
  { gates: [28, 38], name: "Channel of Struggle", description: "A design of stubbornness", connects: ["Spleen", "Root"] },
  { gates: [29, 46], name: "Channel of Discovery", description: "A design of succeeding where others fail", connects: ["Sacral", "G"] },
  { gates: [30, 41], name: "Channel of Recognition", description: "A design of focused energy", connects: ["Solar Plexus", "Root"] },
  { gates: [32, 54], name: "Channel of Transformation", description: "A design of being driven", connects: ["Spleen", "Root"] },
  { gates: [35, 36], name: "Channel of Transitoriness", description: "A design of a 'jack of all trades'", connects: ["Throat", "Solar Plexus"] },
  { gates: [37, 40], name: "Channel of Community", description: "A design of part of the whole", connects: ["Solar Plexus", "Heart"] },
  { gates: [39, 55], name: "Channel of Emoting", description: "A design of moodiness", connects: ["Root", "Solar Plexus"] },
  { gates: [42, 53], name: "Channel of Maturation", description: "A design of balanced development", connects: ["Sacral", "Root"] },
  { gates: [47, 64], name: "Channel of Abstraction", description: "A design of mental activity mixed with clarity", connects: ["Ajna", "Head"] }
];
function signToOffset(sign) {
  const signs = {
    "Aries": 0,
    "Taurus": 30,
    "Gemini": 60,
    "Cancer": 90,
    "Leo": 120,
    "Virgo": 150,
    "Libra": 180,
    "Scorpio": 210,
    "Sagittarius": 240,
    "Capricorn": 270,
    "Aquarius": 300,
    "Pisces": 330
  };
  return signs[sign] || 0;
}
function calculateAbsoluteLongitude(sign, degreeInSign) {
  return signToOffset(sign) + degreeInSign;
}
function degreeToGateAndLine(degree) {
  degree = (degree % 360 + 360) % 360;
  let gateInfo = GATE_ZODIAC_MAP[0];
  for (let i = 0; i < GATE_ZODIAC_MAP.length; i++) {
    const current = GATE_ZODIAC_MAP[i];
    const next = GATE_ZODIAC_MAP[(i + 1) % GATE_ZODIAC_MAP.length];
    if (current.start > next.start) {
      if (degree >= current.start || degree < next.start) {
        gateInfo = current;
        break;
      }
    } else {
      if (degree >= current.start && degree < next.start) {
        gateInfo = current;
        break;
      }
    }
  }
  let positionInGate = degree - gateInfo.start;
  if (positionInGate < 0) positionInGate += 360;
  const line = Math.floor(positionInGate / 0.9375) + 1;
  return { gate: gateInfo.gate, line: Math.min(line, 6) };
}
function getEarthGateAndLine(sunDegree) {
  const earthDegree = (sunDegree + 180) % 360;
  return degreeToGateAndLine(earthDegree);
}
function isMotorCenter(centerName) {
  return ["Sacral", "Solar Plexus", "Heart", "Root"].includes(centerName);
}
function hasMotorToThroatConnection(channels, centers) {
  if (!centers.Throat.defined) return false;
  const definedChannels = channels.filter((ch) => ch.defined);
  for (const channel of definedChannels) {
    const connectsCenters = channel.connects;
    if (connectsCenters.includes("Throat") && connectsCenters.some((c) => isMotorCenter(c) && centers[c]?.defined)) {
      return true;
    }
  }
  return false;
}
function calculateType(centers, channels) {
  const sacralDefined = centers.Sacral.defined;
  const throatDefined = centers.Throat.defined;
  const definedCount = Object.values(centers).filter((center) => center.defined).length;
  if (definedCount === 0) {
    return "Reflector";
  }
  if (sacralDefined) {
    const hasSacralThroatConnection = channels.some(
      (ch) => ch.defined && ch.connects.includes("Sacral") && ch.connects.includes("Throat")
    );
    if (hasSacralThroatConnection) {
      return "Manifesting Generator";
    }
    return "Generator";
  }
  if (hasMotorToThroatConnection(channels, centers)) {
    return "Manifestor";
  }
  return "Projector";
}
function getStrategy(type) {
  switch (type) {
    case "Manifestor":
      return "To Inform";
    case "Generator":
      return "To Respond";
    case "Manifesting Generator":
      return "To Respond & Inform";
    case "Projector":
      return "To Wait for Invitation";
    case "Reflector":
      return "To Wait a Lunar Cycle";
    default:
      return "Unknown";
  }
}
function calculateAuthority(centers) {
  if (centers["Solar Plexus"].defined) {
    return "Emotional Authority";
  }
  if (centers.Sacral.defined) {
    return "Sacral Authority";
  }
  if (centers.Spleen.defined) {
    return "Splenic Authority";
  }
  if (centers.Heart.defined && centers.Heart.gates.length > 0) {
    return "Ego Authority";
  }
  if (centers.G.defined && centers.Throat.defined) {
    return "Self-Projected Authority";
  }
  if (centers.Ajna.defined) {
    return "Mental Authority";
  }
  return "Lunar Authority";
}
function calculateProfile(consciousSunLine, unconsciousSunLine) {
  return `${consciousSunLine}/${unconsciousSunLine}`;
}
function calculateDefinition(centers, channels) {
  const definedChannels = channels.filter((channel) => channel.defined);
  if (definedChannels.length === 0) {
    return "No Definition";
  }
  const centerConnections = {};
  for (const channel of definedChannels) {
    const [center1, center2] = channel.connects;
    if (!centerConnections[center1]) centerConnections[center1] = /* @__PURE__ */ new Set();
    if (!centerConnections[center2]) centerConnections[center2] = /* @__PURE__ */ new Set();
    centerConnections[center1].add(center2);
    centerConnections[center2].add(center1);
  }
  const visited = /* @__PURE__ */ new Set();
  const components = [];
  const dfs = (center, component) => {
    visited.add(center);
    component.push(center);
    if (centerConnections[center]) {
      for (const neighbor of Array.from(centerConnections[center])) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    }
  };
  for (const center of Object.keys(centerConnections)) {
    if (!visited.has(center)) {
      const component = [];
      dfs(center, component);
      components.push(component);
    }
  }
  if (components.length === 1) {
    return "Single Definition";
  } else if (components.length === 2) {
    return "Split Definition";
  } else if (components.length === 3) {
    return "Triple Split Definition";
  } else {
    return "Quadruple Split Definition";
  }
}
function resolveHDTimezone(inputTimezone, latitude, longitude) {
  if (inputTimezone.includes("/")) {
    return inputTimezone;
  }
  try {
    const timezones = geoTz2.find(latitude, longitude);
    if (timezones && timezones.length > 0) {
      return timezones[0];
    }
  } catch (error) {
    console.warn("Geo-tz lookup failed, falling back to mapping:", error);
  }
  const timezoneMap = {
    "EST": "America/New_York",
    "EDT": "America/New_York",
    "CST": "America/Chicago",
    "CDT": "America/Chicago",
    "MST": "America/Denver",
    "MDT": "America/Denver",
    "PST": "America/Los_Angeles",
    "PDT": "America/Los_Angeles",
    "GMT": "Europe/London",
    "BST": "Europe/London",
    "CET": "Europe/Paris",
    "CEST": "Europe/Paris"
  };
  const mapped = timezoneMap[inputTimezone.toUpperCase()];
  if (mapped) {
    return mapped;
  }
  return "UTC";
}
function calculateHumanDesign(birthData) {
  const astroData = calculateAstrology(birthData);
  const DESIGN_SOLAR_ARC = 87.975;
  const birthSunLongitude = calculateAbsoluteLongitude(astroData.planets.sun.sign, astroData.planets.sun.degree);
  let targetLongitude = birthSunLongitude - DESIGN_SOLAR_ARC;
  if (targetLongitude < 0) targetLongitude += 360;
  const resolvedTimezone = resolveHDTimezone(
    birthData.timezone,
    parseFloat(birthData.latitude),
    parseFloat(birthData.longitude)
  );
  const [year, month, day] = birthData.birthDate.split("-").map(Number);
  const [hours, minutes] = birthData.birthTime.split(":").map(Number);
  const localTimeString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  const birthTimeUTC = fromZonedTime2(new Date(localTimeString), resolvedTimezone);
  let minDays = 80;
  let maxDays = 95;
  let iteration = 0;
  const maxIterations = 20;
  let unconsciousTimeUTC = new Date(birthTimeUTC.getTime() - 88 * 24 * 60 * 60 * 1e3);
  while (iteration < maxIterations && maxDays - minDays > 0.01) {
    const midDays = (minDays + maxDays) / 2;
    const testTimeUTC = new Date(birthTimeUTC.getTime() - midDays * 24 * 60 * 60 * 1e3);
    const testTimeLocal = toZonedTime(testTimeUTC, resolvedTimezone);
    const testYear = testTimeLocal.getFullYear();
    const testMonth = String(testTimeLocal.getMonth() + 1).padStart(2, "0");
    const testDay = String(testTimeLocal.getDate()).padStart(2, "0");
    const testHours = String(testTimeLocal.getHours()).padStart(2, "0");
    const testMinutes = String(testTimeLocal.getMinutes()).padStart(2, "0");
    const testAstro = calculateAstrology({
      ...birthData,
      birthDate: `${testYear}-${testMonth}-${testDay}`,
      birthTime: `${testHours}:${testMinutes}`
    });
    const testSunLongitude = calculateAbsoluteLongitude(testAstro.planets.sun.sign, testAstro.planets.sun.degree);
    let diff = testSunLongitude - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (diff > 0) {
      minDays = midDays;
    } else {
      maxDays = midDays;
    }
    unconsciousTimeUTC = testTimeUTC;
    iteration++;
  }
  const unconsciousTimeLocal = toZonedTime(unconsciousTimeUTC, resolvedTimezone);
  const unconsciousYear = unconsciousTimeLocal.getFullYear();
  const unconsciousMonth = String(unconsciousTimeLocal.getMonth() + 1).padStart(2, "0");
  const unconsciousDay = String(unconsciousTimeLocal.getDate()).padStart(2, "0");
  const unconsciousHours = String(unconsciousTimeLocal.getHours()).padStart(2, "0");
  const unconsciousMinutes = String(unconsciousTimeLocal.getMinutes()).padStart(2, "0");
  const unconsciousAstroData = calculateAstrology({
    ...birthData,
    birthDate: `${unconsciousYear}-${unconsciousMonth}-${unconsciousDay}`,
    birthTime: `${unconsciousHours}:${unconsciousMinutes}`
  });
  const unconsciousSunLongitude = calculateAbsoluteLongitude(unconsciousAstroData.planets.sun.sign, unconsciousAstroData.planets.sun.degree);
  const actualArc = (birthSunLongitude - unconsciousSunLongitude + 360) % 360;
  const toGateAndLine = (sign, degree) => degreeToGateAndLine(calculateAbsoluteLongitude(sign, degree));
  const consciousSunLongitude = calculateAbsoluteLongitude(astroData.planets.sun.sign, astroData.planets.sun.degree);
  const activations = {
    conscious: {
      sun: degreeToGateAndLine(consciousSunLongitude),
      earth: getEarthGateAndLine(consciousSunLongitude),
      moon: toGateAndLine(astroData.planets.moon.sign, astroData.planets.moon.degree),
      northNode: toGateAndLine(astroData.northNode.sign, astroData.northNode.degree),
      southNode: toGateAndLine(astroData.southNode.sign, astroData.southNode.degree),
      mercury: toGateAndLine(astroData.planets.mercury.sign, astroData.planets.mercury.degree),
      venus: toGateAndLine(astroData.planets.venus.sign, astroData.planets.venus.degree),
      mars: toGateAndLine(astroData.planets.mars.sign, astroData.planets.mars.degree),
      jupiter: toGateAndLine(astroData.planets.jupiter.sign, astroData.planets.jupiter.degree),
      saturn: toGateAndLine(astroData.planets.saturn.sign, astroData.planets.saturn.degree),
      uranus: toGateAndLine(astroData.planets.uranus.sign, astroData.planets.uranus.degree),
      neptune: toGateAndLine(astroData.planets.neptune.sign, astroData.planets.neptune.degree),
      pluto: toGateAndLine(astroData.planets.pluto.sign, astroData.planets.pluto.degree)
    },
    unconscious: {
      sun: degreeToGateAndLine(unconsciousSunLongitude),
      earth: getEarthGateAndLine(unconsciousSunLongitude),
      moon: toGateAndLine(unconsciousAstroData.planets.moon.sign, unconsciousAstroData.planets.moon.degree),
      northNode: toGateAndLine(unconsciousAstroData.northNode.sign, unconsciousAstroData.northNode.degree),
      southNode: toGateAndLine(unconsciousAstroData.southNode.sign, unconsciousAstroData.southNode.degree),
      mercury: toGateAndLine(unconsciousAstroData.planets.mercury.sign, unconsciousAstroData.planets.mercury.degree),
      venus: toGateAndLine(unconsciousAstroData.planets.venus.sign, unconsciousAstroData.planets.venus.degree),
      mars: toGateAndLine(unconsciousAstroData.planets.mars.sign, unconsciousAstroData.planets.mars.degree),
      jupiter: toGateAndLine(unconsciousAstroData.planets.jupiter.sign, unconsciousAstroData.planets.jupiter.degree),
      saturn: toGateAndLine(unconsciousAstroData.planets.saturn.sign, unconsciousAstroData.planets.saturn.degree),
      uranus: toGateAndLine(unconsciousAstroData.planets.uranus.sign, unconsciousAstroData.planets.uranus.degree),
      neptune: toGateAndLine(unconsciousAstroData.planets.neptune.sign, unconsciousAstroData.planets.neptune.degree),
      pluto: toGateAndLine(unconsciousAstroData.planets.pluto.sign, unconsciousAstroData.planets.pluto.degree)
    }
  };
  const allGates = [
    activations.conscious.sun.gate,
    activations.conscious.earth.gate,
    activations.conscious.moon.gate,
    activations.conscious.northNode.gate,
    activations.conscious.southNode.gate,
    activations.conscious.mercury.gate,
    activations.conscious.venus.gate,
    activations.conscious.mars.gate,
    activations.conscious.jupiter.gate,
    activations.conscious.saturn.gate,
    activations.conscious.uranus.gate,
    activations.conscious.neptune.gate,
    activations.conscious.pluto.gate,
    activations.unconscious.sun.gate,
    activations.unconscious.earth.gate,
    activations.unconscious.moon.gate,
    activations.unconscious.northNode.gate,
    activations.unconscious.southNode.gate,
    activations.unconscious.mercury.gate,
    activations.unconscious.venus.gate,
    activations.unconscious.mars.gate,
    activations.unconscious.jupiter.gate,
    activations.unconscious.saturn.gate,
    activations.unconscious.uranus.gate,
    activations.unconscious.neptune.gate,
    activations.unconscious.pluto.gate
  ];
  const centers = {};
  Object.keys(HD_CENTERS).forEach((centerName) => {
    centers[centerName] = {
      defined: false,
      gates: [],
      description: HD_CENTERS[centerName].description
    };
  });
  Object.entries(HD_GATES).forEach(([gateNum, gateInfo]) => {
    const gate = parseInt(gateNum);
    const centerName = gateInfo.center;
    if (centers[centerName]) {
      centers[centerName].gates.push(gate);
    }
  });
  Object.keys(centers).forEach((centerName) => {
    centers[centerName].gates.sort((a, b) => a - b);
  });
  const channels = HD_CHANNELS.map((channel) => {
    const gate1Activated = allGates.includes(channel.gates[0]);
    const gate2Activated = allGates.includes(channel.gates[1]);
    const defined = gate1Activated && gate2Activated;
    if (defined) {
      channel.connects.forEach((centerName) => {
        if (centers[centerName]) {
          centers[centerName].defined = true;
        }
      });
    }
    return {
      ...channel,
      defined
    };
  });
  const type = calculateType(centers, channels);
  const strategy = getStrategy(type);
  const authority = calculateAuthority(centers);
  const profile = calculateProfile(activations.conscious.sun.line, activations.unconscious.sun.line);
  const definition = calculateDefinition(centers, channels);
  const incarnationCross = `Right Angle Cross of ${HD_GATES[activations.conscious.sun.gate].name}`;
  const variables = {
    cognition: activations.conscious.sun.line <= 3 ? "Focused" : "Peripheral",
    environment: activations.conscious.earth.line <= 3 ? "Markets" : "Caves",
    motivation: activations.unconscious.sun.line <= 3 ? "Fear" : "Hope",
    perspective: activations.unconscious.earth.line <= 3 ? "Personal" : "Transpersonal"
  };
  return {
    type,
    strategy,
    authority,
    profile,
    definition,
    centers,
    channels,
    activations,
    activatedGates: Array.from(new Set(allGates)),
    incarnationCross,
    variables
  };
}

// server/services/daily-context.ts
import * as Astronomy2 from "astronomy-engine";
function reduceToSingleDigit2(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split("").reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}
function calculatePersonalDayNumber(birthDate, currentDate = /* @__PURE__ */ new Date()) {
  const birth = new Date(birthDate);
  const day = birth.getDate();
  const month = birth.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const reducedBirthDay = reduceToSingleDigit2(day);
  const reducedBirthMonth = reduceToSingleDigit2(month);
  const reducedCurrentDay = reduceToSingleDigit2(currentDay);
  const reducedCurrentMonth = reduceToSingleDigit2(currentMonth);
  const reducedCurrentYear = reduceToSingleDigit2(currentYear);
  const sum = reducedBirthDay + reducedBirthMonth + reducedCurrentDay + reducedCurrentMonth + reducedCurrentYear;
  return reduceToSingleDigit2(sum);
}
function calculateUniversalDayNumber(currentDate = /* @__PURE__ */ new Date()) {
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const reducedDay = reduceToSingleDigit2(day);
  const reducedMonth = reduceToSingleDigit2(month);
  const reducedYear = reduceToSingleDigit2(year);
  const sum = reducedDay + reducedMonth + reducedYear;
  return reduceToSingleDigit2(sum);
}
function getMoonSign(date) {
  const moonPos = Astronomy2.EclipticGeoMoon(date);
  const eclipticLongitude = moonPos.lon;
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ];
  const signIndex = Math.floor(eclipticLongitude / 30);
  return signs[signIndex % 12];
}
function getMoonPhase(date) {
  const illumination = Astronomy2.Illumination(Astronomy2.Body.Moon, date);
  const phaseAngle = illumination.phase_angle;
  const percentage = Math.round(illumination.phase_fraction * 100);
  let phase;
  if (phaseAngle < 22.5 || phaseAngle >= 337.5) {
    phase = "New Moon";
  } else if (phaseAngle >= 22.5 && phaseAngle < 67.5) {
    phase = "Waxing Crescent";
  } else if (phaseAngle >= 67.5 && phaseAngle < 112.5) {
    phase = "First Quarter";
  } else if (phaseAngle >= 112.5 && phaseAngle < 157.5) {
    phase = "Waxing Gibbous";
  } else if (phaseAngle >= 157.5 && phaseAngle < 202.5) {
    phase = "Full Moon";
  } else if (phaseAngle >= 202.5 && phaseAngle < 247.5) {
    phase = "Waning Gibbous";
  } else if (phaseAngle >= 247.5 && phaseAngle < 292.5) {
    phase = "Last Quarter";
  } else {
    phase = "Waning Crescent";
  }
  return { phase, percentage };
}
function getCurrentHDGate(date) {
  const sunPos = Astronomy2.Ecliptic(Astronomy2.GeoVector(Astronomy2.Body.Sun, date, false));
  const eclipticLongitude = sunPos.elon;
  const normalizedLon = (eclipticLongitude % 360 + 360) % 360;
  const gateOrder = [
    41,
    19,
    13,
    49,
    30,
    55,
    37,
    63,
    22,
    36,
    25,
    17,
    21,
    51,
    42,
    3,
    27,
    24,
    2,
    23,
    8,
    20,
    16,
    35,
    45,
    12,
    15,
    52,
    39,
    53,
    62,
    56,
    31,
    33,
    7,
    4,
    29,
    59,
    40,
    64,
    47,
    6,
    46,
    18,
    48,
    57,
    32,
    50,
    28,
    44,
    1,
    43,
    14,
    34,
    9,
    5,
    26,
    11,
    10,
    58,
    38,
    54,
    61,
    60
  ];
  const degreesPerGate = 360 / 64;
  const startLon = 58;
  const adjustedLon = (normalizedLon - startLon + 360) % 360;
  const gateIndex = Math.floor(adjustedLon / degreesPerGate) % 64;
  const gate = gateOrder[gateIndex];
  const positionInGate = adjustedLon % degreesPerGate / degreesPerGate;
  const line = Math.floor(positionInGate * 6) + 1;
  return { gate, line };
}
function getPlanetaryHour(date) {
  const planets = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  const planetaryDayRulers = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn"
  ];
  const dayRuler = planetaryDayRulers[dayOfWeek];
  const dayRulerIndex = planets.indexOf(dayRuler);
  const hourIndex = (dayRulerIndex + hour) % 7;
  return planets[hourIndex];
}
function getDailyContext(birthDate, currentDate = /* @__PURE__ */ new Date()) {
  const moonPhaseData = getMoonPhase(currentDate);
  const hdGateData = getCurrentHDGate(currentDate);
  return {
    date: currentDate.toISOString().split("T")[0],
    personalDayNumber: calculatePersonalDayNumber(birthDate, currentDate),
    universalDayNumber: calculateUniversalDayNumber(currentDate),
    moonSign: getMoonSign(currentDate),
    moonPhase: moonPhaseData.phase,
    moonPhasePercentage: moonPhaseData.percentage,
    currentHDGate: hdGateData.gate,
    currentHDLine: hdGateData.line,
    planetaryHour: getPlanetaryHour(currentDate)
  };
}

// server/services/template-bank.ts
var numerologyTemplates = [
  {
    id: "num-personal-1",
    category: "numerology",
    template: (ctx) => `Your Personal Day ${ctx.personalDayNumber} brings ${getPersonalDayTheme(ctx.personalDayNumber)}. ${getPersonalDayAction(ctx.personalDayNumber)}`
  },
  {
    id: "num-personal-2",
    category: "numerology",
    template: (ctx) => `Today's Personal Day ${ctx.personalDayNumber} energy invites you to ${getPersonalDayAction(ctx.personalDayNumber).toLowerCase()} ${getPersonalDayTheme(ctx.personalDayNumber)}.`
  },
  {
    id: "num-personal-3",
    category: "numerology",
    template: (ctx) => `The vibration of Personal Day ${ctx.personalDayNumber} ${getPersonalDayVibe(ctx.personalDayNumber)}. ${getPersonalDayAction(ctx.personalDayNumber)}`
  },
  {
    id: "num-personal-4",
    category: "numerology",
    template: (ctx) => `Riding the wave of Personal Day ${ctx.personalDayNumber}, ${getPersonalDayTheme(ctx.personalDayNumber)} becomes your superpower today.`
  },
  {
    id: "num-personal-5",
    category: "numerology",
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} ${getPersonalDayVibe(ctx.personalDayNumber)}, making this the perfect time to ${getPersonalDayAction(ctx.personalDayNumber).toLowerCase()}`
  },
  {
    id: "num-personal-6",
    category: "numerology",
    template: (ctx) => `The cosmos gifts you Personal Day ${ctx.personalDayNumber} frequency\u2014embrace ${getPersonalDayTheme(ctx.personalDayNumber)} fully.`
  },
  {
    id: "num-personal-7",
    category: "numerology",
    template: (ctx) => `Today's Personal Day ${ctx.personalDayNumber} ${getPersonalDayVibe(ctx.personalDayNumber)}\u2014a powerful invitation for ${getPersonalDayTheme(ctx.personalDayNumber)}.`
  },
  {
    id: "num-universal-1",
    category: "numerology",
    template: (ctx) => `Universal Day ${ctx.universalDayNumber} amplifies ${getUniversalDayTheme(ctx.universalDayNumber)} for everyone. ${getUniversalDayGuidance(ctx.universalDayNumber)}`
  },
  {
    id: "num-universal-2",
    category: "numerology",
    template: (ctx) => `The collective energy of ${ctx.universalDayNumber} ${getUniversalDayVibe(ctx.universalDayNumber)}. ${getUniversalDayGuidance(ctx.universalDayNumber)}`
  },
  {
    id: "num-universal-3",
    category: "numerology",
    template: (ctx) => `Humanity vibrates at Universal Day ${ctx.universalDayNumber} today, ${getUniversalDayVibe(ctx.universalDayNumber)}.`
  },
  {
    id: "num-universal-4",
    category: "numerology",
    template: (ctx) => `Universal Day ${ctx.universalDayNumber} weaves ${getUniversalDayTheme(ctx.universalDayNumber)} through the collective consciousness. ${getUniversalDayGuidance(ctx.universalDayNumber)}`
  },
  {
    id: "num-combined",
    category: "numerology",
    template: (ctx) => `Your Personal ${ctx.personalDayNumber} meets Universal ${ctx.universalDayNumber} today, creating ${getCombinedDayEnergy(ctx.personalDayNumber, ctx.universalDayNumber)}.`
  },
  {
    id: "num-combined-2",
    category: "numerology",
    template: (ctx) => `The dance between your Personal ${ctx.personalDayNumber} and the world's ${ctx.universalDayNumber} ${getCombinedDayEnergy(ctx.personalDayNumber, ctx.universalDayNumber)}.`
  },
  {
    id: "num-combined-3",
    category: "numerology",
    template: (ctx) => `As your Personal ${ctx.personalDayNumber} intersects with Universal ${ctx.universalDayNumber}, ${getCombinedDayEnergy(ctx.personalDayNumber, ctx.universalDayNumber)} unfolds.`
  }
];
var astrologyTemplates = [
  {
    id: "astro-moon-1",
    category: "astrology",
    template: (ctx) => `Moon in ${ctx.moonSign} (${ctx.moonPhase}) ${getMoonSignEnergy(ctx.moonSign)}. ${getMoonPhaseGuidance(ctx.moonPhase)}`
  },
  {
    id: "astro-moon-2",
    category: "astrology",
    template: (ctx) => `The ${ctx.moonPhase} in ${ctx.moonSign} ${getMoonPhaseVibe(ctx.moonPhase)}. ${getMoonSignAction(ctx.moonSign)}`
  },
  {
    id: "astro-moon-3",
    category: "astrology",
    template: (ctx) => `With Luna traveling through ${ctx.moonSign} during ${ctx.moonPhase}, ${getMoonCombinedMessage(ctx.moonSign, ctx.moonPhase)}.`
  },
  {
    id: "astro-moon-4",
    category: "astrology",
    template: (ctx) => `${ctx.moonSign} Moon ${getMoonSignEnergy(ctx.moonSign)} during this ${ctx.moonPhase}. ${getMoonPhaseGuidance(ctx.moonPhase)}`
  },
  {
    id: "astro-moon-5",
    category: "astrology",
    template: (ctx) => `The emotional currents of ${ctx.moonSign} blend with the ${ctx.moonPhase}'s energy\u2014${getMoonCombinedMessage(ctx.moonSign, ctx.moonPhase)}.`
  },
  {
    id: "astro-moon-6",
    category: "astrology",
    template: (ctx) => `Luna's passage through ${ctx.moonSign} ${getMoonSignEnergy(ctx.moonSign)}. ${getMoonSignAction(ctx.moonSign)}`
  },
  {
    id: "astro-moon-7",
    category: "astrology",
    template: (ctx) => `${ctx.moonPhase} energy ${getMoonPhaseVibe(ctx.moonPhase)} while the Moon in ${ctx.moonSign} ${getMoonSignEnergy(ctx.moonSign)}.`
  },
  {
    id: "astro-planetary-1",
    category: "astrology",
    template: (ctx) => `${ctx.planetaryHour} governs this hour, ${getPlanetaryHourEnergy(ctx.planetaryHour)}. ${getPlanetaryHourAction(ctx.planetaryHour)}`
  },
  {
    id: "astro-planetary-2",
    category: "astrology",
    template: (ctx) => `Under ${ctx.planetaryHour}'s influence, ${getPlanetaryHourVibe(ctx.planetaryHour)}.`
  },
  {
    id: "astro-planetary-3",
    category: "astrology",
    template: (ctx) => `The hour of ${ctx.planetaryHour} ${getPlanetaryHourVibe(ctx.planetaryHour)}. ${getPlanetaryHourAction(ctx.planetaryHour)}`
  },
  {
    id: "astro-planetary-4",
    category: "astrology",
    template: (ctx) => `${ctx.planetaryHour} energy flows through this hour, ${getPlanetaryHourEnergy(ctx.planetaryHour)}.`
  },
  {
    id: "astro-lunar-wisdom-1",
    category: "astrology",
    template: (ctx) => `The Moon's ${Math.round(ctx.moonIllumination)}% illumination in ${ctx.moonSign} creates potent emotional alchemy. ${getMoonSignAction(ctx.moonSign)}`
  },
  {
    id: "astro-lunar-wisdom-2",
    category: "astrology",
    template: (ctx) => `${ctx.moonSign}'s lunar wisdom ${getMoonSignEnergy(ctx.moonSign)} at ${Math.round(ctx.moonIllumination)}% illumination.`
  }
];
var humanDesignTemplates = [
  {
    id: "hd-gate-1",
    category: "humandesign",
    template: (ctx) => `Gate ${ctx.currentHDGate} Line ${ctx.currentHDLine} is active today. ${getHDGateMessage(ctx.currentHDGate, ctx.currentHDLine)}`
  },
  {
    id: "hd-gate-2",
    category: "humandesign",
    template: (ctx) => `The Sun transits Gate ${ctx.currentHDGate}.${ctx.currentHDLine}, ${getHDGateEnergy(ctx.currentHDGate)} ${getHDLineTheme(ctx.currentHDLine)}.`
  },
  {
    id: "hd-gate-3",
    category: "humandesign",
    template: (ctx) => `Today's cosmic frequency: Gate ${ctx.currentHDGate} (${getHDGateName(ctx.currentHDGate)}), Line ${ctx.currentHDLine}. ${getHDGateGuidance(ctx.currentHDGate)}`
  },
  {
    id: "hd-gate-4",
    category: "humandesign",
    template: (ctx) => `Gate ${ctx.currentHDGate} activates today ${getHDLineTheme(ctx.currentHDLine)}\u2014${getHDGateGuidance(ctx.currentHDGate)}`
  },
  {
    id: "hd-gate-5",
    category: "humandesign",
    template: (ctx) => `The Sun illuminates Gate ${ctx.currentHDGate}.${ctx.currentHDLine} (${getHDGateName(ctx.currentHDGate)}), ${getHDGateEnergy(ctx.currentHDGate)}.`
  },
  {
    id: "hd-gate-6",
    category: "humandesign",
    template: (ctx) => `Today's Human Design transit ${getHDGateEnergy(ctx.currentHDGate)} through Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}.`
  },
  {
    id: "hd-gate-7",
    category: "humandesign",
    template: (ctx) => `Gate ${ctx.currentHDGate} (${getHDGateName(ctx.currentHDGate)}) Line ${ctx.currentHDLine} ${getHDGateMessage(ctx.currentHDGate, ctx.currentHDLine)}`
  },
  {
    id: "hd-gate-8",
    category: "humandesign",
    template: (ctx) => `Solar transit through Gate ${ctx.currentHDGate}.${ctx.currentHDLine}: ${getHDGateGuidance(ctx.currentHDGate)}`
  },
  {
    id: "hd-gate-9",
    category: "humandesign",
    template: (ctx) => `The cosmic transmission of Gate ${ctx.currentHDGate} ${getHDGateEnergy(ctx.currentHDGate)}, especially ${getHDLineTheme(ctx.currentHDLine)}.`
  },
  {
    id: "hd-gate-10",
    category: "humandesign",
    template: (ctx) => `Today's HD frequency: ${getHDGateName(ctx.currentHDGate)} (Gate ${ctx.currentHDGate}.${ctx.currentHDLine})\u2014${getHDGateGuidance(ctx.currentHDGate)}`
  },
  {
    id: "hd-gate-11",
    category: "humandesign",
    template: (ctx) => `Gate ${ctx.currentHDGate} activates ${getHDGateName(ctx.currentHDGate)}, ${getHDGateEnergy(ctx.currentHDGate)} with Line ${ctx.currentHDLine}'s influence.`
  }
];
var personalityTemplates = [
  {
    id: "personality-combo-1",
    category: "personality",
    template: (ctx) => `As a ${ctx.profile.hdType || "being"} with ${ctx.profile.sunSign} Sun, ${getPersonalityAlignment(ctx)}.`
  },
  {
    id: "personality-combo-2",
    category: "personality",
    template: (ctx) => `Your ${ctx.profile.enneagramType || "unique essence"} energy ${getPersonalityWithContext(ctx)}.`
  },
  {
    id: "personality-combo-3",
    category: "personality",
    template: (ctx) => `${ctx.profile.mbtiType || "Your nature"} ${getPersonalityDayGuidance(ctx)}.`
  },
  {
    id: "personality-combo-4",
    category: "personality",
    template: (ctx) => `Your ${ctx.profile.sunSign} Sun harmonizes with your ${ctx.profile.hdType || "unique"} design, ${getPersonalityAlignment(ctx)}.`
  },
  {
    id: "personality-combo-5",
    category: "personality",
    template: (ctx) => `${ctx.profile.mbtiType || "Your cognitive pattern"} finds powerful expression through today's ${getPersonalityWithContext(ctx)}.`
  },
  {
    id: "personality-combo-6",
    category: "personality",
    template: (ctx) => `As ${ctx.profile.enneagramType || "your core type"}, you're perfectly positioned to ${getPersonalityDayGuidance(ctx)}.`
  },
  {
    id: "personality-combo-7",
    category: "personality",
    template: (ctx) => `Your ${ctx.profile.hdType || "energetic"} blueprint ${getPersonalityAlignment(ctx)} with ${ctx.profile.sunSign} Sun leading the way.`
  },
  {
    id: "personality-combo-8",
    category: "personality",
    template: (ctx) => `The intersection of your ${ctx.profile.mbtiType || "personality"} and ${ctx.profile.enneagramType || "core essence"} ${getPersonalityWithContext(ctx)}.`
  },
  {
    id: "personality-combo-9",
    category: "personality",
    template: (ctx) => `${ctx.profile.sunSign} energy flows through your ${ctx.profile.hdType || "unique"} design\u2014${getPersonalityDayGuidance(ctx)}.`
  },
  {
    id: "personality-combo-10",
    category: "personality",
    template: (ctx) => `Your ${ctx.profile.enneagramType || "core motivation"} aligns powerfully with ${ctx.profile.mbtiType || "your cognitive style"} today.`
  },
  {
    id: "personality-combo-11",
    category: "personality",
    template: (ctx) => `As a ${ctx.profile.hdType || "being"} navigating with ${ctx.profile.mbtiType || "your mind"}, ${getPersonalityAlignment(ctx)}.`
  },
  {
    id: "personality-combo-12",
    category: "personality",
    template: (ctx) => `Your ${ctx.profile.sunSign}-${ctx.profile.moonSign || "Moon"} combo ${getPersonalityWithContext(ctx)} powerfully today.`
  }
];
var chineseTemplates = [
  {
    id: "chinese-1",
    category: "chinese",
    template: (ctx) => `Your ${ctx.profile.chineseYear || "Chinese zodiac"} energy ${getChineseYearWisdom(ctx.profile.chineseYear)} today${ctx.profile.chineseElement ? `, amplified by ${ctx.profile.chineseElement} element` : ""}.`
  },
  {
    id: "chinese-2",
    category: "chinese",
    template: (ctx) => `The ${ctx.profile.chineseYear || "animal sign"} within you ${getChineseYearAction(ctx.profile.chineseYear)} under today's cosmic currents.`
  },
  {
    id: "chinese-3",
    category: "chinese",
    template: (ctx) => `${ctx.profile.chineseElement || "Your elemental"} ${ctx.profile.chineseYear || "nature"} ${getChineseElementGuidance(ctx.profile.chineseElement)} this cycle.`
  }
];
var ayurvedaTemplates = [
  {
    id: "ayurveda-1",
    category: "ayurveda",
    template: (ctx) => `Your ${ctx.profile.primaryDosha || "Ayurvedic"} constitution ${getAyurvedaBalance(ctx.profile.primaryDosha)} today. ${getAyurvedaGuidance(ctx.profile.primaryDosha)}`
  },
  {
    id: "ayurveda-2",
    category: "ayurveda",
    template: (ctx) => `${ctx.profile.primaryDosha || "Your dominant dosha"} energy ${getAyurvedaVibe(ctx.profile.primaryDosha)} under today's influences.`
  },
  {
    id: "ayurveda-3",
    category: "ayurveda",
    template: (ctx) => `Balance your ${ctx.profile.primaryDosha || "dosha"} by ${getAyurvedaPractice(ctx.profile.primaryDosha)} throughout the day.`
  }
];
var vedicTemplates = [
  {
    id: "vedic-1",
    category: "vedic",
    template: (ctx) => `Your ${ctx.profile.moonNakshatra || "lunar nakshatra"} ${getVedicMoonEnergy(ctx.profile.moonNakshatra)} with today's planetary movements.`
  },
  {
    id: "vedic-2",
    category: "vedic",
    template: (ctx) => `The wisdom of ${ctx.profile.moonNakshatra || "your nakshatra"} ${getVedicMoonGuidance(ctx.profile.moonNakshatra)} this lunar cycle.`
  },
  {
    id: "vedic-3",
    category: "vedic",
    template: (ctx) => `${ctx.profile.vedicSun || "Your Vedic Sun"} harmonizes with ${ctx.profile.vedicMoon || "lunar energies"} ${getVedicAlignment()} today.`
  }
];
var geneKeysTemplates = [
  {
    id: "genekeys-1",
    category: "genekeys",
    template: (ctx) => `Your Life's Work gift of ${ctx.profile.lifeWorkGift || "divine purpose"} ${getGeneKeyExpression(ctx.profile.lifeWorkGift)} today.`
  },
  {
    id: "genekeys-2",
    category: "genekeys",
    template: (ctx) => `The genius of ${ctx.profile.evolutionGenius || "your evolution"} ${getGeneKeyEvolution(ctx.profile.evolutionGenius)} this cycle.`
  },
  {
    id: "genekeys-3",
    category: "genekeys",
    template: (ctx) => `Express your ${ctx.profile.lifeWorkGift || "unique gift"} through ${getGeneKeyPractice()} to unlock higher frequencies.`
  }
];
var iChingTemplates = [
  {
    id: "iching-1",
    category: "iching",
    template: (ctx) => `Hexagram ${ctx.profile.iChingNumber || ""} ${ctx.profile.iChingName ? `(${ctx.profile.iChingName})` : "guides you"} ${getIChingWisdom(ctx.profile.iChingName)} today.`
  },
  {
    id: "iching-2",
    category: "iching",
    template: (ctx) => `The essence of ${ctx.profile.iChingName || "your I Ching hexagram"} ${getIChingGuidance(ctx.profile.iChingName)} in this moment.`
  },
  {
    id: "iching-3",
    category: "iching",
    template: (ctx) => `${ctx.profile.iChingName || "Your hexagram"} teaches ${getIChingLesson(ctx.profile.iChingName)} through today's experiences.`
  }
];
var mayanTemplates = [
  {
    id: "mayan-1",
    category: "mayan",
    template: (ctx) => `Your ${ctx.profile.mayanDaySign || "Mayan day sign"} ${getMayanEnergy(ctx.profile.mayanDaySign)} with Tone ${ctx.profile.mayanTone || ""} vibration.`
  },
  {
    id: "mayan-2",
    category: "mayan",
    template: (ctx) => `The ${ctx.profile.mayanDaySign || "sacred sign"} within you ${getMayanPurpose(ctx.profile.mayanDaySign)} today's cosmic timing.`
  }
];
var chakraTemplates = [
  {
    id: "chakra-1",
    category: "chakras",
    template: (ctx) => `Your ${ctx.profile.dominantChakra || "primary chakra"} ${getChakraEnergy(ctx.profile.dominantChakra)} powerfully today.`
  },
  {
    id: "chakra-2",
    category: "chakras",
    template: (ctx) => `Channel energy through your ${ctx.profile.dominantChakra || "dominant energy center"} ${getChakraPractice(ctx.profile.dominantChakra)}.`
  }
];
var runesTemplates = [
  {
    id: "runes-1",
    category: "runes",
    template: (ctx) => `The ${ctx.profile.birthRune || "rune"} carries ${getRuneWisdom(ctx.profile.birthRune)} into your day.`
  },
  {
    id: "runes-2",
    category: "runes",
    template: (ctx) => `${ctx.profile.birthRune || "Your birth rune"} whispers ${getRuneMessage(ctx.profile.birthRune)} through today's unfolding.`
  }
];
var tarotTemplates = [
  {
    id: "tarot-1",
    category: "tarot",
    template: (ctx) => `The ${ctx.profile.tarotCard || "Tarot card"} of your soul ${getTarotWisdom(ctx.profile.tarotCard)} this cycle.`
  },
  {
    id: "tarot-2",
    category: "tarot",
    template: (ctx) => `${ctx.profile.tarotCard || "Your birth card"} reveals ${getTarotGuidance(ctx.profile.tarotCard)} in today's journey.`
  }
];
var kabbalahTemplates = [
  {
    id: "kabbalah-1",
    category: "kabbalah",
    template: (ctx) => `Your Kabbalistic path of ${ctx.profile.kabbalisticPath || "sacred wisdom"} ${getKabbalahWisdom(ctx.profile.kabbalisticPath)} today.`
  },
  {
    id: "kabbalah-2",
    category: "kabbalah",
    template: (ctx) => `The Tree of Life flows through ${ctx.profile.kabbalisticPath || "your path"}, ${getKabbalahGuidance(ctx.profile.kabbalisticPath)}.`
  }
];
var sacredGeomTemplates = [
  {
    id: "sacredgeom-1",
    category: "sacredgeom",
    template: (ctx) => `The ${ctx.profile.primaryShape || "sacred pattern"} ${getSacredGeomEnergy(ctx.profile.primaryShape)} in your energy field today.`
  },
  {
    id: "sacredgeom-2",
    category: "sacredgeom",
    template: (ctx) => `Your ${ctx.profile.primaryShape || "geometric blueprint"} ${getSacredGeomWisdom(ctx.profile.primaryShape)} divine order.`
  }
];
var sabianTemplates = [
  {
    id: "sabian-1",
    category: "sabian",
    template: (ctx) => `Your Sun's Sabian Symbol ${ctx.profile.sabianSun ? `"${ctx.profile.sabianSun}"` : ""} ${getSabianWisdom()} today.`
  },
  {
    id: "sabian-2",
    category: "sabian",
    template: (ctx) => `The Moon's Sabian Symbol ${ctx.profile.sabianMoon ? `"${ctx.profile.sabianMoon}"` : ""} ${getSabianGuidance()} through your emotions.`
  }
];
var biorhythmsTemplates = [
  {
    id: "biorhythms-1",
    category: "biorhythms",
    template: (ctx) => `Your biorhythms ${getBiorhythmsEnergy()} today${ctx.profile.physicalPeakDay ? `, with physical peak on day ${ctx.profile.physicalPeakDay}` : ""}.`
  },
  {
    id: "biorhythms-2",
    category: "biorhythms",
    template: (ctx) => `Life rhythms ${getBiorhythmsGuidance()} through your physical, emotional, and intellectual cycles.`
  }
];
var asteroidsTemplates = [
  {
    id: "asteroids-1",
    category: "asteroids",
    template: (ctx) => `${ctx.profile.keyAsteroid || "Key asteroid placements"} ${getAsteroidsEnergy(ctx.profile.keyAsteroid)} nuanced depth to your chart.`
  },
  {
    id: "asteroids-2",
    category: "asteroids",
    template: (ctx) => `The asteroid ${ctx.profile.keyAsteroid || "influences"} ${getAsteroidsWisdom()} through subtle cosmic currents.`
  }
];
var arabicPartsTemplates = [
  {
    id: "arabicparts-1",
    category: "arabicparts",
    template: (ctx) => `Part of Fortune${ctx.profile.fortuneSign ? ` in ${ctx.profile.fortuneSign}` : ""} ${getArabicPartsWisdom()} today's opportunities.`
  },
  {
    id: "arabicparts-2",
    category: "arabicparts",
    template: (ctx) => `Part of Spirit${ctx.profile.spiritSign ? ` in ${ctx.profile.spiritSign}` : ""} ${getArabicPartsGuidance()} your higher purpose.`
  }
];
var fixedStarsTemplates = [
  {
    id: "fixedstars-1",
    category: "fixedstars",
    template: (ctx) => `${ctx.profile.primaryStar || "Fixed star influences"} ${getFixedStarsEnergy(ctx.profile.primaryStar)} ancient stellar wisdom.`
  },
  {
    id: "fixedstars-2",
    category: "fixedstars",
    template: (ctx) => `The fixed star ${ctx.profile.primaryStar || "connections"} ${getFixedStarsWisdom()} timeless cosmic power.`
  }
];
function getPersonalDayTheme(num) {
  const themes = {
    1: "new beginnings and bold action",
    2: "cooperation and patience",
    3: "creativity and self-expression",
    4: "structure and foundation-building",
    5: "freedom and adventure",
    6: "responsibility and harmony",
    7: "introspection and spiritual insight",
    8: "power and material success",
    9: "completion and release",
    11: "spiritual illumination and intuition",
    22: "master building and practical magic",
    33: "compassionate service and healing"
  };
  return themes[num] || "unique opportunities";
}
function getPersonalDayAction(num) {
  const actions = {
    1: "Take initiative on something you've been postponing.",
    2: "Listen deeply and collaborate with others.",
    3: "Express yourself creatively without holding back.",
    4: "Focus on practical matters and long-term planning.",
    5: "Embrace change and try something new.",
    6: "Nurture relationships and create beauty.",
    7: "Spend time in solitude for spiritual connection.",
    8: "Pursue your ambitions with confidence.",
    9: "Let go of what no longer serves you.",
    11: "Trust your intuition and inspire others.",
    22: "Work on projects that benefit the greater good.",
    33: "Offer your gifts in service to others."
  };
  return actions[num] || "Follow your inner guidance.";
}
function getPersonalDayVibe(num) {
  const vibes = {
    1: "empowers you to lead and initiate",
    2: "asks for patience and diplomatic connection",
    3: "sparks your creative fire and joy",
    4: "grounds you in practical reality",
    5: "ignites your adventurous spirit",
    6: "centers you in love and service",
    7: "opens portals to inner wisdom",
    8: "aligns you with abundance and authority",
    9: "completes cycles and clears space",
    11: "illuminates your spiritual path",
    22: "activates your master builder frequency",
    33: "channels divine compassion through you"
  };
  return vibes[num] || "brings unique energy to your path";
}
function getUniversalDayTheme(num) {
  const themes = {
    1: "independence and new beginnings",
    2: "partnership and balance",
    3: "communication and joy",
    4: "hard work and stability",
    5: "change and freedom",
    6: "love and responsibility",
    7: "wisdom and reflection",
    8: "achievement and power",
    9: "compassion and endings",
    11: "inspiration and enlightenment",
    22: "manifestation and vision",
    33: "healing and divine service"
  };
  return themes[num] || "collective growth";
}
function getUniversalDayGuidance(num) {
  const guidance = {
    1: "The world favors pioneers and risk-takers today.",
    2: "Collective harmony grows through cooperation.",
    3: "Share your voice\u2014the world needs your message.",
    4: "Build foundations that will last generations.",
    5: "Liberation and progress move through humanity.",
    6: "Acts of love ripple across consciousness.",
    7: "Truth seekers find answers in stillness.",
    8: "Material and spiritual power unite.",
    9: "Humanity releases old patterns collectively.",
    11: "Intuitive downloads are heightened globally.",
    22: "Visionary projects gain momentum.",
    33: "Healing energy flows through all beings."
  };
  return guidance[num] || "The cosmos supports collective evolution.";
}
function getUniversalDayVibe(num) {
  const vibes = {
    1: "calls everyone to step into their power",
    2: "invites harmony and balance worldwide",
    3: "lifts the collective mood with creativity",
    4: "anchors stability across all realms",
    5: "breaks chains and opens doors globally",
    6: "centers the world in heart energy",
    7: "draws humanity inward for reflection",
    8: "magnifies success and manifestation",
    9: "brings closure to collective chapters",
    11: "elevates spiritual awareness everywhere",
    22: "empowers master builders and visionaries",
    33: "bathes the world in healing light"
  };
  return vibes[num] || "shapes the collective energy field";
}
function getCombinedDayEnergy(personal, universal) {
  const combinations = [
    "a powerful synergy for manifestation",
    "dynamic tension that sparks growth",
    "harmonious flow between inner and outer",
    "creative friction that births innovation",
    "balanced energy for aligned action",
    "amplified potential in both realms",
    "complementary forces dancing together",
    "unified purpose across dimensions",
    "sacred alignment of personal and collective",
    "potent alchemy for transformation"
  ];
  const index2 = (personal + universal) % combinations.length;
  return combinations[index2];
}
function getMoonSignEnergy(sign) {
  const energies = {
    "Aries": "ignites emotional courage and spontaneity",
    "Taurus": "grounds feelings in sensory pleasure",
    "Gemini": "quickens mental connections and curiosity",
    "Cancer": "deepens emotional sensitivity and nurturing",
    "Leo": "amplifies heart-centered expression",
    "Virgo": "refines emotional discernment",
    "Libra": "seeks harmony in all connections",
    "Scorpio": "intensifies emotional depth and transformation",
    "Sagittarius": "expands emotional horizons",
    "Capricorn": "structures feelings with wisdom",
    "Aquarius": "liberates emotions with objectivity",
    "Pisces": "dissolves boundaries with compassion"
  };
  return energies[sign] || "brings unique emotional frequency";
}
function getMoonPhaseGuidance(phase) {
  const guidance = {
    "New Moon": "Plant seeds for new intentions.",
    "Waxing Crescent": "Take small steps toward your goals.",
    "First Quarter": "Push through resistance with determination.",
    "Waxing Gibbous": "Refine and adjust your approach.",
    "Full Moon": "Celebrate manifestations and release what's complete.",
    "Waning Gibbous": "Share wisdom gained from recent experiences.",
    "Last Quarter": "Let go of what no longer aligns.",
    "Waning Crescent": "Rest and surrender to the void."
  };
  return guidance[phase] || "Honor this lunar transition.";
}
function getMoonPhaseVibe(phase) {
  const vibes = {
    "New Moon": "opens portals for fresh starts",
    "Waxing Crescent": "builds momentum with faith",
    "First Quarter": "challenges you to commit fully",
    "Waxing Gibbous": "perfects your manifestation",
    "Full Moon": "illuminates all that is hidden",
    "Waning Gibbous": "asks for gratitude and sharing",
    "Last Quarter": "clears space through release",
    "Waning Crescent": "whispers of rest and renewal"
  };
  return vibes[phase] || "marks this lunar moment";
}
function getMoonSignAction(sign) {
  const actions = {
    "Aries": "Act on your instincts boldly.",
    "Taurus": "Savor simple pleasures mindfully.",
    "Gemini": "Engage in stimulating conversations.",
    "Cancer": "Create emotional safety for yourself and others.",
    "Leo": "Step into the spotlight with confidence.",
    "Virgo": "Organize your space and thoughts.",
    "Libra": "Strengthen connections through beauty and balance.",
    "Scorpio": "Dive deep into emotional truth.",
    "Sagittarius": "Explore new philosophies or places.",
    "Capricorn": "Set boundaries with compassionate authority.",
    "Aquarius": "Connect with your community and ideals.",
    "Pisces": "Surrender to creative flow and spiritual connection."
  };
  return actions[sign] || "Align with this lunar energy.";
}
function getMoonCombinedMessage(sign, phase) {
  return `emotions flow through ${sign}'s lens during this ${phase}, creating unique opportunities for ${getMoonSignEnergy(sign).split(" ")[1] || "growth"}`;
}
function getPlanetaryHourEnergy(planet) {
  const energies = {
    "Sun": "radiating vitality, success, and recognition",
    "Moon": "nurturing intuition, emotions, and receptivity",
    "Mars": "activating courage, action, and assertion",
    "Mercury": "sharpening communication, learning, and commerce",
    "Jupiter": "expanding opportunities, wisdom, and abundance",
    "Venus": "attracting love, beauty, and harmony",
    "Saturn": "strengthening discipline, structure, and mastery"
  };
  return energies[planet] || "bringing planetary influence";
}
function getPlanetaryHourAction(planet) {
  const actions = {
    "Sun": "Shine your light on important projects.",
    "Moon": "Trust your feelings and nurture connections.",
    "Mars": "Take decisive action on pending matters.",
    "Mercury": "Communicate clearly and learn something new.",
    "Jupiter": "Seize opportunities for growth.",
    "Venus": "Beautify your surroundings or strengthen relationships.",
    "Saturn": "Commit to long-term goals with discipline."
  };
  return actions[planet] || "Work with this planetary frequency.";
}
function getPlanetaryHourVibe(planet) {
  const vibes = {
    "Sun": "success and recognition come more easily",
    "Moon": "emotional intelligence guides your way",
    "Mars": "warrior energy fuels your actions",
    "Mercury": "mental clarity sharpens your perception",
    "Jupiter": "luck and expansion favor your efforts",
    "Venus": "grace and beauty infuse your experiences",
    "Saturn": "wisdom and endurance strengthen your path"
  };
  return vibes[planet] || "this hour carries special power";
}
function getHDGateMessage(gate, line) {
  return `This energy ${getHDGateEnergy(gate)} ${getHDLineTheme(line)}.`;
}
function getHDGateEnergy(gate) {
  const gateThemes = {
    1: "calls you to express your unique creativity",
    2: "invites receptivity and direction from the universe",
    3: "marks the beginning of new orders",
    4: "seeks answers through mental clarity",
    5: "teaches patience through waiting",
    6: "navigates emotional intimacy",
    7: "empowers democratic leadership",
    8: "encourages authentic contribution"
  };
  return gateThemes[gate] || `brings Gate ${gate}'s unique frequency`;
}
function getHDGateName(gate) {
  const names = {
    1: "Self-Expression",
    2: "Direction of the Self",
    3: "Ordering",
    4: "Mental Solutions",
    5: "Fixed Patterns",
    6: "Friction",
    7: "The Role of the Self",
    8: "Contribution"
  };
  return names[gate] || `Gate ${gate}`;
}
function getHDGateGuidance(gate) {
  const guidance = {
    1: "Your creative impulse is the universe speaking through you.",
    2: "Wait for the right direction before moving forward.",
    3: "New beginnings emerge from apparent chaos.",
    4: "The answer you seek is already within you.",
    5: "Trust the timing of your life.",
    6: "Intimacy requires vulnerability and honesty.",
    7: "Lead by example, not by force.",
    8: "Your unique gifts are needed now."
  };
  return guidance[gate] || "Trust this cosmic transmission.";
}
function getHDLineTheme(line) {
  const themes = {
    1: "through introspection and investigation",
    2: "through natural talent and ease",
    3: "through experimentation and discovery",
    4: "through networking and friendship",
    5: "through practical solutions and heresy",
    6: "through wisdom and role-modeling"
  };
  return themes[line] || `with Line ${line} energy`;
}
function getPersonalityAlignment(ctx) {
  return `today's cosmic weather aligns powerfully with your natural design`;
}
function getPersonalityWithContext(ctx) {
  return `finds resonance with today's numerological and astrological currents`;
}
function getPersonalityDayGuidance(ctx) {
  return `can leverage today's energy by staying true to your authentic expression`;
}
function getChineseYearWisdom(animal) {
  const wisdom = {
    "Rat": "brings resourcefulness and quick adaptability",
    "Ox": "grounds you in steadfast determination",
    "Tiger": "ignites courageous action",
    "Rabbit": "invites gentle diplomacy",
    "Dragon": "empowers with bold vision",
    "Snake": "deepens intuitive wisdom",
    "Horse": "channels dynamic freedom",
    "Goat": "nurtures creative harmony",
    "Monkey": "sparks clever innovation",
    "Rooster": "sharpens confident expression",
    "Dog": "strengthens loyal integrity",
    "Pig": "enriches generous abundance"
  };
  return wisdom[animal] || "carries ancient wisdom";
}
function getChineseYearAction(animal) {
  return "aligns powerfully with your natural strengths";
}
function getChineseElementGuidance(element) {
  const guidance = {
    "Wood": "grows and expands",
    "Fire": "transforms and illuminates",
    "Earth": "stabilizes and nourishes",
    "Metal": "refines and strengthens",
    "Water": "flows and adapts"
  };
  return guidance[element] || "harmonizes";
}
function getAyurvedaBalance(dosha) {
  const balance = {
    "Vata": "seeks grounding and warmth",
    "Pitta": "needs cooling and moderation",
    "Kapha": "benefits from stimulation and movement"
  };
  return balance[dosha] || "seeks balance";
}
function getAyurvedaGuidance(dosha) {
  const guidance = {
    "Vata": "Embrace routine and nourishing warmth.",
    "Pitta": "Cool your fire with gentle practices.",
    "Kapha": "Energize with movement and variety."
  };
  return guidance[dosha] || "Honor your unique constitution.";
}
function getAyurvedaVibe(dosha) {
  return "finds harmony with mindful practices";
}
function getAyurvedaPractice(dosha) {
  const practices = {
    "Vata": "grounding meditation and warm foods",
    "Pitta": "cooling breathwork and gentle movement",
    "Kapha": "invigorating exercise and light meals"
  };
  return practices[dosha] || "honoring your natural rhythm";
}
function getVedicMoonEnergy(nakshatra) {
  return "illuminates your emotional landscape";
}
function getVedicMoonGuidance(nakshatra) {
  return "whispers ancient lunar wisdom";
}
function getVedicAlignment() {
  return "creating powerful synergy";
}
function getGeneKeyExpression(gift) {
  return "seeks authentic expression";
}
function getGeneKeyEvolution(genius) {
  return "unfolds through conscious awareness";
}
function getGeneKeyPractice() {
  return "contemplation and embodiment";
}
function getIChingWisdom(name) {
  return "with timeless wisdom";
}
function getIChingGuidance(name) {
  return "offers guidance for navigating change";
}
function getIChingLesson(name) {
  return "the art of flowing with natural rhythms";
}
function getMayanEnergy(sign) {
  return "activates sacred purpose";
}
function getMayanPurpose(sign) {
  return "dances with";
}
function getChakraEnergy(chakra) {
  const energies = {
    "Root": "grounds your foundation",
    "Sacral": "ignites creative flow",
    "Solar Plexus": "empowers your will",
    "Heart": "opens compassionate connection",
    "Throat": "liberates authentic voice",
    "Third Eye": "awakens intuitive sight",
    "Crown": "connects cosmic consciousness"
  };
  return energies[chakra] || "channels vital energy";
}
function getChakraPractice(chakra) {
  return "to amplify your energy field";
}
function getRuneWisdom(rune) {
  return "ancient Norse wisdom";
}
function getRuneMessage(rune) {
  return "guidance from ancestral knowing";
}
function getTarotWisdom(card) {
  return "reflects archetypal truths";
}
function getTarotGuidance(card) {
  return "deep symbolic meaning";
}
function getKabbalahWisdom(path3) {
  return "illuminates sacred mysteries";
}
function getKabbalahGuidance(path3) {
  return "revealing divine wisdom";
}
function getSacredGeomEnergy(shape) {
  const energies = {
    "Circle": "represents wholeness and unity",
    "Triangle": "channels manifestation power",
    "Square": "anchors stability and structure",
    "Pentagon": "harmonizes natural order",
    "Hexagon": "connects heaven and earth",
    "Spiral": "spirals evolutionary growth",
    "Flower of Life": "seeds infinite creation",
    "Metatron's Cube": "holds universal blueprints"
  };
  return energies[shape] || "resonates with divine proportion";
}
function getSacredGeomWisdom(shape) {
  return "reflects";
}
function getSabianWisdom() {
  return "carries symbolic guidance";
}
function getSabianGuidance() {
  return "speaks";
}
function getBiorhythmsEnergy() {
  return "flow through natural cycles";
}
function getBiorhythmsGuidance() {
  return "pulse";
}
function getAsteroidsEnergy(asteroid) {
  return "adds";
}
function getAsteroidsWisdom() {
  return "weaves";
}
function getArabicPartsWisdom() {
  return "illuminates";
}
function getArabicPartsGuidance() {
  return "guides";
}
function getFixedStarsEnergy(star) {
  return "carries";
}
function getFixedStarsWisdom() {
  return "channels";
}
function selectTemplates(dailyContext, profileData, lastUsedIds = []) {
  const allTemplates = [
    ...numerologyTemplates,
    ...astrologyTemplates,
    ...humanDesignTemplates,
    ...personalityTemplates,
    ...chineseTemplates,
    ...ayurvedaTemplates,
    ...vedicTemplates,
    ...geneKeysTemplates,
    ...iChingTemplates,
    ...mayanTemplates,
    ...chakraTemplates,
    ...runesTemplates,
    ...tarotTemplates,
    ...kabbalahTemplates,
    ...sacredGeomTemplates,
    ...sabianTemplates,
    ...biorhythmsTemplates,
    ...asteroidsTemplates,
    ...arabicPartsTemplates,
    ...fixedStarsTemplates
  ];
  const seed = parseInt(dailyContext.date.replace(/-/g, "")) + (profileData.id ? profileData.id.charCodeAt(0) : 0);
  const availableByCategory = {
    numerology: numerologyTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    astrology: astrologyTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    humandesign: humanDesignTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    personality: personalityTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    chinese: chineseTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    ayurveda: ayurvedaTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    vedic: vedicTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    genekeys: geneKeysTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    iching: iChingTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    mayan: mayanTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    chakras: chakraTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    runes: runesTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    tarot: tarotTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    kabbalah: kabbalahTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    sacredgeom: sacredGeomTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    sabian: sabianTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    biorhythms: biorhythmsTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    asteroids: asteroidsTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    arabicparts: arabicPartsTemplates.filter((t) => !lastUsedIds.includes(t.id)),
    fixedstars: fixedStarsTemplates.filter((t) => !lastUsedIds.includes(t.id))
  };
  Object.keys(availableByCategory).forEach((cat) => {
    if (availableByCategory[cat].length === 0) {
      availableByCategory[cat] = allTemplates.filter((t) => t.category === cat);
    }
  });
  const selected = [];
  const allCategories = ["numerology", "astrology", "humandesign", "personality", "chinese", "ayurveda", "vedic", "genekeys", "iching", "mayan", "chakras", "runes", "tarot", "kabbalah", "sacredgeom", "sabian", "biorhythms", "asteroids", "arabicparts", "fixedstars"];
  const shuffledCategories = allCategories.sort((a, b) => {
    const hashA = a.charCodeAt(0) * seed % 1e3;
    const hashB = b.charCodeAt(0) * seed % 1e3;
    return hashA - hashB;
  });
  for (let i = 0; i < 4 && i < shuffledCategories.length; i++) {
    const cat = shuffledCategories[i];
    const options = availableByCategory[cat];
    if (options && options.length > 0) {
      const seededIndex = (seed + i * 17) % options.length;
      selected.push(options[seededIndex]);
    }
  }
  return {
    selectedTemplates: selected,
    templateIds: selected.map((t) => t.id)
  };
}

// server/services/affirmations.ts
var AFFIRMATION_TEMPLATES = {
  // Life Path Number based
  lifePath: {
    1: [
      { text: "I am a natural leader, and I step confidently into my power today.", category: "power", focus: "Leadership" },
      { text: "New beginnings flow to me effortlessly as I trust my pioneering spirit.", category: "transformation", focus: "New Beginnings" },
      { text: "I attract opportunities that honor my independence and originality.", category: "abundance", focus: "Independence" }
    ],
    2: [
      { text: "I am a peacemaker, and harmony flows through all my relationships.", category: "peace", focus: "Harmony" },
      { text: "My sensitivity is my superpower, connecting me deeply to love and truth.", category: "love", focus: "Connection" },
      { text: "I attract balanced partnerships that honor my gentle strength.", category: "abundance", focus: "Partnership" }
    ],
    3: [
      { text: "I express my creative gifts freely, and the universe celebrates my joy.", category: "transformation", focus: "Creativity" },
      { text: "Love and laughter surround me as I share my authentic voice.", category: "love", focus: "Self-Expression" },
      { text: "Abundance flows to me through my natural charisma and joy.", category: "abundance", focus: "Joy" }
    ],
    4: [
      { text: "I build strong foundations, and my efforts create lasting abundance.", category: "abundance", focus: "Foundation" },
      { text: "I trust the process, knowing my dedication brings peaceful rewards.", category: "peace", focus: "Trust" },
      { text: "My practical wisdom transforms challenges into stepping stones.", category: "transformation", focus: "Wisdom" }
    ],
    5: [
      { text: "I embrace freedom and change, attracting adventures that align with my soul.", category: "transformation", focus: "Freedom" },
      { text: "My curiosity opens doors to abundant opportunities and experiences.", category: "abundance", focus: "Adventure" },
      { text: "I flow with life's changes, finding peace in every transformation.", category: "peace", focus: "Flow" }
    ],
    6: [
      { text: "I nurture myself and others with unconditional love and compassion.", category: "love", focus: "Nurturing" },
      { text: "My heart is open, attracting harmonious and loving relationships.", category: "love", focus: "Harmony" },
      { text: "I create beauty and peace in my home and in the world.", category: "peace", focus: "Beauty" }
    ],
    7: [
      { text: "I trust my inner wisdom, and spiritual abundance flows to me naturally.", category: "abundance", focus: "Wisdom" },
      { text: "I find peace in solitude, connecting deeply with my higher self.", category: "peace", focus: "Solitude" },
      { text: "My quest for truth transforms my life and inspires others.", category: "transformation", focus: "Truth" }
    ],
    8: [
      { text: "I am a powerful manifestor, and material abundance is my natural state.", category: "abundance", focus: "Manifestation" },
      { text: "I use my power wisely, creating prosperity that benefits all.", category: "power", focus: "Prosperity" },
      { text: "Success flows to me as I align my ambition with divine purpose.", category: "transformation", focus: "Success" }
    ],
    9: [
      { text: "I am a compassionate healer, and love radiates from my very being.", category: "love", focus: "Healing" },
      { text: "I release what no longer serves me, making space for abundant blessings.", category: "transformation", focus: "Release" },
      { text: "My humanitarian spirit attracts soul-aligned opportunities to serve.", category: "abundance", focus: "Service" }
    ],
    11: [
      { text: "I am a spiritual messenger, and my intuition guides me to divine abundance.", category: "power", focus: "Intuition" },
      { text: "I trust my visions, knowing they transform lives including my own.", category: "transformation", focus: "Vision" },
      { text: "My light inspires others, and love multiplies through my presence.", category: "love", focus: "Inspiration" }
    ],
    22: [
      { text: "I am a master builder, manifesting abundance on a grand scale.", category: "abundance", focus: "Mastery" },
      { text: "My practical vision transforms dreams into lasting reality.", category: "transformation", focus: "Vision" },
      { text: "I create peace and prosperity for myself and the collective.", category: "peace", focus: "Legacy" }
    ],
    33: [
      { text: "I am a master teacher, and unconditional love flows through everything I do.", category: "love", focus: "Teaching" },
      { text: "My compassion transforms pain into healing for all beings.", category: "transformation", focus: "Compassion" },
      { text: "I attract abundant opportunities to serve and uplift humanity.", category: "abundance", focus: "Service" }
    ]
  },
  // Sun Sign based
  sunSign: {
    Aries: [
      { text: "I courageously pursue my passions, and success flows naturally to me.", category: "power", focus: "Courage" },
      { text: "My bold energy attracts exciting opportunities and abundant experiences.", category: "abundance", focus: "Boldness" }
    ],
    Taurus: [
      { text: "I am grounded in abundance, attracting wealth and beauty effortlessly.", category: "abundance", focus: "Stability" },
      { text: "I create a peaceful sanctuary, and serenity surrounds me always.", category: "peace", focus: "Sanctuary" }
    ],
    Gemini: [
      { text: "My curious mind attracts abundant knowledge and connections.", category: "abundance", focus: "Curiosity" },
      { text: "I communicate with love, and my words create positive transformation.", category: "love", focus: "Communication" }
    ],
    Cancer: [
      { text: "I nurture myself with love, and emotional abundance flows to me.", category: "love", focus: "Self-Love" },
      { text: "I trust my intuition, finding peace in the wisdom of my emotions.", category: "peace", focus: "Intuition" }
    ],
    Leo: [
      { text: "I shine my light boldly, and the universe celebrates my magnificence.", category: "power", focus: "Radiance" },
      { text: "Love and admiration flow to me as I express my authentic self.", category: "love", focus: "Authenticity" }
    ],
    Virgo: [
      { text: "I serve with love, and abundant blessings return to me multiplied.", category: "abundance", focus: "Service" },
      { text: "I find peace in perfection unfolding naturally through my efforts.", category: "peace", focus: "Perfection" }
    ],
    Libra: [
      { text: "I create harmony in all areas, attracting balanced and abundant relationships.", category: "love", focus: "Balance" },
      { text: "Peace and beauty surround me as I align with grace and fairness.", category: "peace", focus: "Grace" }
    ],
    Scorpio: [
      { text: "I transform powerfully, shedding old layers to reveal my abundant truth.", category: "transformation", focus: "Transformation" },
      { text: "My depth attracts profound love and soul-level connections.", category: "love", focus: "Depth" }
    ],
    Sagittarius: [
      { text: "I expand fearlessly, and abundance meets me on every adventure.", category: "abundance", focus: "Expansion" },
      { text: "I trust life's journey, finding peace in the wisdom of experience.", category: "peace", focus: "Trust" }
    ],
    Capricorn: [
      { text: "I build my empire with patience, attracting lasting wealth and success.", category: "abundance", focus: "Achievement" },
      { text: "My discipline transforms dreams into tangible reality.", category: "transformation", focus: "Discipline" }
    ],
    Aquarius: [
      { text: "My unique vision attracts abundant opportunities to innovate and lead.", category: "power", focus: "Innovation" },
      { text: "I connect with my tribe, and collective love amplifies my purpose.", category: "love", focus: "Community" }
    ],
    Pisces: [
      { text: "I flow with divine guidance, and spiritual abundance fills my life.", category: "abundance", focus: "Flow" },
      { text: "Love is my natural state, and compassion transforms everything I touch.", category: "love", focus: "Compassion" }
    ]
  },
  // Human Design Type based
  hdType: {
    Generator: [
      { text: "I respond to life with joy, and my energy attracts abundant satisfaction.", category: "abundance", focus: "Response" },
      { text: "I trust my sacral wisdom, finding peace in work that lights me up.", category: "peace", focus: "Satisfaction" }
    ],
    "Manifesting Generator": [
      { text: "I move quickly toward my desires, manifesting abundance at lightning speed.", category: "abundance", focus: "Speed" },
      { text: "I honor my multi-passionate nature, transforming through diverse experiences.", category: "transformation", focus: "Versatility" }
    ],
    Manifestor: [
      { text: "I initiate powerfully, and the universe supports my bold moves.", category: "power", focus: "Initiation" },
      { text: "I inform with love, creating peace through clear communication.", category: "peace", focus: "Clarity" }
    ],
    Projector: [
      { text: "I am recognized for my gifts, attracting abundant invitations to guide.", category: "abundance", focus: "Recognition" },
      { text: "I rest deeply, finding peace in honoring my unique energy rhythm.", category: "peace", focus: "Rest" }
    ],
    Reflector: [
      { text: "I am a wise mirror, and my clarity attracts abundant opportunities to reflect truth.", category: "power", focus: "Wisdom" },
      { text: "I honor my lunar cycle, finding peace in patient decision-making.", category: "peace", focus: "Patience" }
    ]
  },
  // Enneagram Type based
  enneagram: {
    1: [
      { text: "I release perfectionism, finding peace in progress and growth.", category: "peace", focus: "Progress" },
      { text: "My integrity attracts abundant opportunities aligned with my values.", category: "abundance", focus: "Integrity" }
    ],
    2: [
      { text: "I receive love as generously as I give it, creating abundant reciprocity.", category: "love", focus: "Receiving" },
      { text: "My needs matter, and honoring them brings peace to my relationships.", category: "peace", focus: "Self-Care" }
    ],
    3: [
      { text: "I am worthy beyond my achievements, attracting love for who I am.", category: "love", focus: "Worthiness" },
      { text: "Success flows naturally when I align authenticity with ambition.", category: "abundance", focus: "Authenticity" }
    ],
    4: [
      { text: "I am whole and complete, and this truth transforms my experience.", category: "transformation", focus: "Wholeness" },
      { text: "My unique gifts attract abundant appreciation and recognition.", category: "abundance", focus: "Uniqueness" }
    ],
    5: [
      { text: "I trust that I have enough energy, time, and resources for abundance.", category: "abundance", focus: "Sufficiency" },
      { text: "I engage with life fully, finding peace in connection and presence.", category: "peace", focus: "Engagement" }
    ],
    6: [
      { text: "I trust myself and life, releasing fear to welcome abundant peace.", category: "peace", focus: "Trust" },
      { text: "My courage transforms anxiety into confident action and growth.", category: "transformation", focus: "Courage" }
    ],
    7: [
      { text: "I find joy in the present moment, where true abundance already exists.", category: "abundance", focus: "Presence" },
      { text: "I embrace all emotions, finding peace in the fullness of experience.", category: "peace", focus: "Wholeness" }
    ],
    8: [
      { text: "I use my power to protect and empower, attracting love and loyalty.", category: "love", focus: "Protection" },
      { text: "My vulnerability is strength, transforming relationships through openness.", category: "transformation", focus: "Vulnerability" }
    ],
    9: [
      { text: "My voice matters, and speaking my truth attracts abundant respect.", category: "power", focus: "Voice" },
      { text: "I honor my priorities, finding peace in asserting my needs.", category: "peace", focus: "Assertion" }
    ]
  }
};
var UNIVERSAL_AFFIRMATIONS = [
  { text: "I am worthy of infinite abundance, and prosperity flows to me from expected and unexpected sources.", category: "abundance", focus: "Worthiness" },
  { text: "Peace is my natural state, and I return to calm with every breath.", category: "peace", focus: "Calm" },
  { text: "I am love, I give love, I receive love - love is the essence of who I am.", category: "love", focus: "Essence" },
  { text: "I transform with grace, releasing what no longer serves my highest good.", category: "transformation", focus: "Grace" },
  { text: "I step into my power today, trusting in my ability to create my reality.", category: "power", focus: "Creation" },
  { text: "The universe conspires in my favor, aligning me with perfect opportunities.", category: "abundance", focus: "Alignment" },
  { text: "I choose peace over worry, knowing that everything unfolds in divine timing.", category: "peace", focus: "Timing" },
  { text: "My heart is open to give and receive love in all its beautiful forms.", category: "love", focus: "Openness" },
  { text: "I embrace change as a catalyst for positive transformation in my life.", category: "transformation", focus: "Change" },
  { text: "I am divinely guided, protected, and deeply loved by the universe.", category: "love", focus: "Divine Love" }
];
function seededShuffle(array, seed) {
  const shuffled = [...array];
  let currentSeed = seed;
  const seededRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function generateSeed(profileId, date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0]) {
  const str = `${profileId}-${date}`;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash2 = (hash2 << 5) - hash2 + char;
    hash2 = hash2 & hash2;
  }
  return Math.abs(hash2);
}
function generateDailyAffirmations(profile, count = 3, date) {
  const affirmations = [];
  const astroData = profile.astrologyData;
  const hdData = profile.humanDesignData;
  const personalityData = profile.personalityData;
  const numData = profile.numerologyData;
  const sources = [];
  if (numData?.lifePath && AFFIRMATION_TEMPLATES.lifePath[numData.lifePath]) {
    sources.push(AFFIRMATION_TEMPLATES.lifePath[numData.lifePath]);
  }
  if (astroData?.sunSign && AFFIRMATION_TEMPLATES.sunSign[astroData.sunSign]) {
    sources.push(AFFIRMATION_TEMPLATES.sunSign[astroData.sunSign]);
  }
  if (hdData?.type && AFFIRMATION_TEMPLATES.hdType[hdData.type]) {
    sources.push(AFFIRMATION_TEMPLATES.hdType[hdData.type]);
  }
  if (personalityData?.enneagram?.type && AFFIRMATION_TEMPLATES.enneagram[personalityData.enneagram.type]) {
    sources.push(AFFIRMATION_TEMPLATES.enneagram[personalityData.enneagram.type]);
  }
  const allAffirmations = sources.flat();
  const seed = generateSeed(profile.id, date);
  if (allAffirmations.length > 0) {
    const shuffled = seededShuffle(allAffirmations, seed);
    affirmations.push(...shuffled.slice(0, count));
  }
  while (affirmations.length < count) {
    const remaining = count - affirmations.length;
    const universal = seededShuffle(UNIVERSAL_AFFIRMATIONS, seed + affirmations.length);
    affirmations.push(...universal.slice(0, remaining));
  }
  return affirmations.slice(0, count);
}

// server/services/daily-insights.ts
import crypto from "crypto";
function extractProfileSummary(profile) {
  const astroData = profile.astrologyData;
  const hdData = profile.humanDesignData;
  const personalityData = profile.personalityData;
  const numData = profile.numerologyData;
  const vedicData = profile.vedicAstrologyData;
  const geneKeysData = profile.geneKeysData;
  const iChingData = profile.iChingData;
  const chineseData = profile.chineseAstrologyData;
  const kabbalahData = profile.kabbalahData;
  const mayanData = profile.mayanAstrologyData;
  const chakraData = profile.chakraData;
  const sacredGeomData = profile.sacredGeometryData;
  const runesData = profile.runesData;
  const sabianData = profile.sabianSymbolsData;
  const ayurvedaData = profile.ayurvedaData;
  const biorhythmsData = profile.biorhythmsData;
  const asteroidsData = profile.asteroidsData;
  const arabicPartsData = profile.arabicPartsData;
  const fixedStarsData = profile.fixedStarsData;
  const archetypeData = profile.archetypeData;
  return {
    id: profile.id,
    name: profile.name,
    // Original systems
    sunSign: astroData?.sunSign,
    moonSign: astroData?.moonSign,
    risingSign: astroData?.risingSign,
    hdType: hdData?.type,
    hdProfile: hdData?.profile,
    hdAuthority: hdData?.authority,
    enneagramType: personalityData?.enneagram?.type,
    mbtiType: personalityData?.mbti?.type,
    lifePath: numData?.lifePath,
    expression: numData?.expression,
    soulUrge: numData?.soulUrge,
    // Vedic Astrology
    vedicSun: vedicData?.sunSign,
    vedicMoon: vedicData?.moonSign,
    moonNakshatra: vedicData?.moonNakshatra,
    // Gene Keys
    lifeWorkGift: geneKeysData?.lifeWork?.gift,
    evolutionGenius: geneKeysData?.evolution?.genius,
    // I Ching
    iChingNumber: iChingData?.number,
    iChingName: iChingData?.name,
    // Chinese Astrology
    chineseYear: chineseData?.yearAnimal?.name || chineseData?.yearAnimal,
    chineseElement: chineseData?.yearElement,
    // Kabbalah
    kabbalisticPath: kabbalahData?.primaryPath?.name,
    // Mayan Astrology
    mayanDaySign: mayanData?.daySign?.name || mayanData?.daySign,
    mayanTone: mayanData?.tone,
    // Chakras
    dominantChakra: chakraData?.dominantChakras?.[0]?.name,
    // Sacred Geometry
    primaryShape: sacredGeomData?.primaryShape,
    // Runes
    birthRune: runesData?.rune,
    // Sabian Symbols
    sabianSun: sabianData?.sun?.symbol,
    sabianMoon: sabianData?.moon?.symbol,
    // Ayurveda
    primaryDosha: ayurvedaData?.primaryDosha?.name || ayurvedaData?.primaryDosha,
    // Biorhythms
    physicalPeakDay: biorhythmsData?.physicalPeakDays?.[0],
    emotionalPeakDay: biorhythmsData?.emotionalPeakDays?.[0],
    // Asteroids
    keyAsteroid: asteroidsData?.asteroids?.[0]?.name,
    // Arabic Parts
    fortuneSign: arabicPartsData?.fortune?.sign,
    spiritSign: arabicPartsData?.spirit?.sign,
    // Fixed Stars
    primaryStar: fixedStarsData?.conjunctions?.[0]?.starName,
    // Tarot
    tarotCard: archetypeData?.tarotCards?.[0]?.name
  };
}
function generateDailyInsights(profile, lastUsedTemplateIds = []) {
  const dailyContext = getDailyContext(profile.birthDate);
  const profileSummary = extractProfileSummary(profile);
  const { selectedTemplates, templateIds } = selectTemplates(
    dailyContext,
    profileSummary,
    lastUsedTemplateIds
  );
  const contextWithProfile = {
    ...dailyContext,
    profile: profileSummary
  };
  const insights = selectedTemplates.map((template) => template.template(contextWithProfile));
  const affirmations = generateDailyAffirmations(profile, 3, dailyContext.date);
  const insightData = {
    date: dailyContext.date,
    personalDayNumber: dailyContext.personalDayNumber,
    universalDayNumber: dailyContext.universalDayNumber,
    moonSign: dailyContext.moonSign,
    moonPhase: dailyContext.moonPhase,
    moonPhasePercentage: dailyContext.moonPhasePercentage,
    currentHDGate: dailyContext.currentHDGate,
    currentHDLine: dailyContext.currentHDLine,
    planetaryHour: dailyContext.planetaryHour,
    insights,
    affirmations,
    profile: profileSummary
  };
  const contentHash = crypto.createHash("md5").update(insights.join("|")).digest("hex");
  return {
    data: insightData,
    templateIds,
    contentHash
  };
}

// server/services/synastry.ts
function getAbsoluteLongitude(sign, degree) {
  const signOrder = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ];
  const signIndex = signOrder.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}
function calculateAspectAngle(long1, long2) {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}
function identifyAspect(angle) {
  const aspects = [
    { name: "conjunction", angle: 0, maxOrb: 10 },
    { name: "sextile", angle: 60, maxOrb: 6 },
    { name: "square", angle: 90, maxOrb: 8 },
    { name: "trine", angle: 120, maxOrb: 8 },
    { name: "opposition", angle: 180, maxOrb: 10 }
  ];
  for (const asp of aspects) {
    const orbDiff = Math.abs(angle - asp.angle);
    if (orbDiff <= asp.maxOrb) {
      return { aspect: asp.name, maxOrb: asp.maxOrb };
    }
  }
  return null;
}
function calculateOrbScore(baseScore, orb, maxOrb) {
  if (orb <= 4) {
    return Math.round(baseScore * (1 - orb * 0.0125));
  } else {
    const orbRatio = (orb - 4) / (maxOrb - 4);
    return Math.round(baseScore * (0.95 - orbRatio * 0.25));
  }
}
function classifyAspectTier(planet1, planet2, aspect, orb) {
  const maxOrbs = {
    conjunction: 10,
    sextile: 6,
    square: 8,
    trine: 8,
    opposition: 10
  };
  if (planet1 === "sun" && planet2 === "moon" || planet1 === "moon" && planet2 === "sun") {
    if (aspect === "conjunction") {
      return {
        tier: "golden",
        description: '\u2600\uFE0F\u{1F319} Sun-Moon Conjunction: The ultimate soul mate aspect. Your ego and emotions blend perfectly. This is the "coming home" feeling.' + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(100, orb, maxOrbs.conjunction)
      };
    }
    if (aspect === "trine" || aspect === "sextile") {
      return {
        tier: "golden",
        description: "\u2600\uFE0F\u{1F319} Sun-Moon Harmony: Natural flow between your core self and their emotional needs. Effortless understanding." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(90, orb, maxOrbs[aspect])
      };
    }
  }
  if (planet1 === "moon" && planet2 === "moon" && aspect === "conjunction") {
    return {
      tier: "golden",
      description: "\u{1F319}\u{1F319} Moon-Moon Conjunction: Telepathic emotional bond. You feel safe and understood at the deepest level." + (orb <= 4 ? " [EXACT]" : ""),
      impact: "harmony",
      score: calculateOrbScore(95, orb, maxOrbs.conjunction)
    };
  }
  if (planet1 === "venus" && planet2 === "ascendant" || planet1 === "ascendant" && planet2 === "venus") {
    if (aspect === "conjunction") {
      return {
        tier: "golden",
        description: "\u2640\uFE0F\u2191 Venus-Ascendant Conjunction: You embody their ideal of beauty and love. Instant, magnetic attraction." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(85, orb, maxOrbs.conjunction)
      };
    }
  }
  if (planet1 === "jupiter" || planet2 === "jupiter") {
    const otherPlanet = planet1 === "jupiter" ? planet2 : planet1;
    if (["sun", "moon", "venus"].includes(otherPlanet) && (aspect === "trine" || aspect === "conjunction")) {
      return {
        tier: "golden",
        description: `\u2643 Jupiter ${aspect} ${otherPlanet}: Brings joy, growth, and luck to the relationship. You make each other better.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(80, orb, maxOrbs[aspect])
      };
    }
  }
  if (planet1 === "neptune" || planet2 === "neptune") {
    const otherPlanet = planet1 === "neptune" ? planet2 : planet1;
    if (["sun", "moon", "venus"].includes(otherPlanet) && aspect === "trine") {
      return {
        tier: "golden",
        description: `\u2646 Neptune trine ${otherPlanet}: Divine, unconditional love. Rose-colored glasses aspect - feels magical and spiritual.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(75, orb, maxOrbs.trine)
      };
    }
  }
  if (planet1 === "saturn" || planet2 === "saturn") {
    const otherPlanet = planet1 === "saturn" ? planet2 : planet1;
    if (["sun", "moon"].includes(otherPlanet) && (aspect === "trine" || aspect === "sextile")) {
      return {
        tier: "diamond",
        description: `\u2644 Saturn ${aspect} ${otherPlanet}: The ultimate relationship glue. Provides stability, commitment, and long-term staying power.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(95, orb, maxOrbs[aspect])
      };
    }
    if (otherPlanet === "venus" && aspect === "conjunction") {
      return {
        tier: "diamond",
        description: '\u2644 Saturn conjunct Venus: "I want to commit to you." Serious about the relationship, though can feel heavy at times.' + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(85, orb, maxOrbs.conjunction)
      };
    }
    if (otherPlanet === "venus" && (aspect === "trine" || aspect === "sextile")) {
      return {
        tier: "diamond",
        description: `\u2644 Saturn ${aspect} Venus: Commitment and lasting love. Building something real together.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(82, orb, maxOrbs[aspect])
      };
    }
    if (["sun", "moon", "venus"].includes(otherPlanet) && aspect === "square") {
      return {
        tier: "diamond",
        description: `\u2644 Saturn square ${otherPlanet}: Creates friction but also lasting bonds. Requires effort but builds resilience.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "growth",
        score: calculateOrbScore(60, orb, maxOrbs.square)
      };
    }
    if (["sun", "moon"].includes(otherPlanet) && aspect === "conjunction") {
      return {
        tier: "diamond",
        description: `\u2644 Saturn conjunct ${otherPlanet}: Serious commitment energy. This person takes you and the relationship seriously.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(90, orb, maxOrbs.conjunction)
      };
    }
  }
  if (planet1 === "northNode" || planet2 === "northNode" || planet1 === "southNode" || planet2 === "southNode") {
    const otherPlanet = planet1.includes("Node") ? planet2 : planet1;
    const node = planet1.includes("Node") ? planet1 : planet2;
    if (["sun", "moon", "venus", "mars"].includes(otherPlanet) && aspect === "conjunction") {
      return {
        tier: "fated",
        description: `\u260A ${node} conjunct ${otherPlanet}: Karmic, destined connection. This meeting was meant to happen. Soul-level significance.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(90, orb, maxOrbs.conjunction)
      };
    }
    if (["sun", "moon", "venus", "mars", "jupiter", "saturn"].includes(otherPlanet) && (aspect === "trine" || aspect === "sextile")) {
      return {
        tier: "fated",
        description: `\u260A ${node} ${aspect} ${otherPlanet}: Karmic harmony. Your paths were meant to cross to support soul growth.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(75, orb, maxOrbs[aspect])
      };
    }
  }
  if (planet1 === "vertex" || planet2 === "vertex") {
    const otherPlanet = planet1 === "vertex" ? planet2 : planet1;
    if (["sun", "moon", "venus", "mars", "ascendant"].includes(otherPlanet) && aspect === "conjunction") {
      return {
        tier: "fated",
        description: `\u26A1 Vertex conjunct ${otherPlanet}: Electric gate of fated encounters. This meeting feels destined and life-changing.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(88, orb, maxOrbs.conjunction)
      };
    }
  }
  if (planet1 === "venus" && planet2 === "mars" || planet1 === "mars" && planet2 === "venus") {
    if (aspect === "conjunction") {
      return {
        tier: "golden",
        description: "\u2640\uFE0F\u2642\uFE0F Venus-Mars Conjunction: Explosive sexual chemistry. Raw magnetic attraction. The #1 passion indicator." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(100, orb, maxOrbs.conjunction)
      };
    }
    if (aspect === "trine" || aspect === "sextile") {
      return {
        tier: "golden",
        description: "\u2640\uFE0F\u2642\uFE0F Venus-Mars Harmony: Strong physical chemistry with emotional connection. Passionate and balanced." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(85, orb, maxOrbs[aspect])
      };
    }
    if (aspect === "square" || aspect === "opposition") {
      return {
        tier: "standard",
        description: `\u2640\uFE0F\u2642\uFE0F Venus-Mars Tension: Intense, explosive chemistry. "Can't keep hands off you" energy. Passionate but challenging.` + (orb <= 4 ? " [EXACT]" : ""),
        impact: "tension",
        score: calculateOrbScore(70, orb, maxOrbs[aspect])
      };
    }
  }
  if (planet1 === "moon" && planet2 === "moon") {
    if (aspect === "trine" || aspect === "sextile") {
      return {
        tier: "golden",
        description: "\u{1F319}\u{1F319} Moon Harmony: Emotional needs align beautifully. Deep empathy and understanding." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(88, orb, maxOrbs[aspect])
      };
    }
  }
  if (planet1 === "sun" && planet2 === "sun") {
    if (aspect === "trine") {
      return {
        tier: "golden",
        description: "\u2600\uFE0F\u2600\uFE0F Sun Trine: Life paths support each other naturally. You help each other shine." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(85, orb, maxOrbs.trine)
      };
    }
    if (aspect === "conjunction") {
      return {
        tier: "standard",
        description: "\u2600\uFE0F\u2600\uFE0F Sun Conjunction: Same sign, same core identity. Deep understanding or too similar." + (orb <= 4 ? " [EXACT]" : ""),
        impact: "harmony",
        score: calculateOrbScore(75, orb, maxOrbs.conjunction)
      };
    }
  }
  const impactMap = {
    conjunction: "harmony",
    trine: "harmony",
    sextile: "harmony",
    square: "tension",
    opposition: "tension"
  };
  const baseScoreMap = {
    conjunction: 70,
    trine: 75,
    sextile: 65,
    square: 45,
    opposition: 50
  };
  return {
    tier: "standard",
    description: `${planet1}-${planet2} ${aspect}: Creates ${impactMap[aspect]} between these energies.` + (orb <= 4 ? " [EXACT]" : ""),
    impact: impactMap[aspect],
    score: calculateOrbScore(baseScoreMap[aspect], orb, maxOrbs[aspect])
  };
}
function calculateHouseOverlays(person1Planets, person2HouseCusps, person2Name) {
  if (!person2HouseCusps || person2HouseCusps.length < 12) return [];
  const overlays = [];
  const planetEntries = Object.entries(person1Planets);
  for (const [planetName, planetData] of planetEntries) {
    if (!planetData) continue;
    const planetLongitude = getAbsoluteLongitude(planetData.sign, planetData.degree);
    const houseNumber = findHouseForLongitude(planetLongitude, person2HouseCusps);
    if (houseNumber >= 1 && houseNumber <= 12) {
      const overlay = analyzeHouseOverlay(planetName, houseNumber, person2Name);
      if (overlay) overlays.push(overlay);
    }
  }
  return overlays;
}
function findHouseForLongitude(longitude, houseCusps) {
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];
    if (nextCusp > currentCusp) {
      if (longitude >= currentCusp && longitude < nextCusp) {
        return i + 1;
      }
    } else {
      if (longitude >= currentCusp || longitude < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1;
}
function analyzeHouseOverlay(planet, house, personName) {
  const significantHouses = {
    1: {
      significance: `${planet} in ${personName}'s 1st House: They energize your sense of self. You feel more "you" with them.`,
      impact: "profound"
    },
    4: {
      significance: `${planet} in ${personName}'s 4th House: They feel like home and family. Desire to build a life together.`,
      impact: "profound"
    },
    5: {
      significance: `${planet} in ${personName}'s 5th House: Brings romance, fun, and creative energy. Playful and joyful.`,
      impact: "moderate"
    },
    7: {
      significance: `${planet} in ${personName}'s 7th House: You see them as an ideal partner. Marriage and commitment energy.`,
      impact: "profound"
    },
    8: {
      significance: `${planet} in ${personName}'s 8th House: Deep, intense, transformative bond. Strong intimacy and soul connection.`,
      impact: "profound"
    }
  };
  if (significantHouses[house]) {
    return {
      planet,
      house,
      ...significantHouses[house]
    };
  }
  return null;
}
function calculateDetailedSynastry(chart1, chart2) {
  const allAspects = [];
  const person1Points = {
    ...chart1.planets,
    ...chart1.northNode && { northNode: chart1.northNode },
    ...chart1.southNode && { southNode: chart1.southNode },
    ...chart1.vertex && { vertex: chart1.vertex },
    ...chart1.ascendant && { ascendant: chart1.ascendant }
  };
  const person2Points = {
    ...chart2.planets,
    ...chart2.northNode && { northNode: chart2.northNode },
    ...chart2.southNode && { southNode: chart2.southNode },
    ...chart2.vertex && { vertex: chart2.vertex },
    ...chart2.ascendant && { ascendant: chart2.ascendant }
  };
  for (const [p1Name, p1Data] of Object.entries(person1Points)) {
    if (!p1Data) continue;
    const long1 = getAbsoluteLongitude(p1Data.sign, p1Data.degree);
    for (const [p2Name, p2Data] of Object.entries(person2Points)) {
      if (!p2Data) continue;
      const long2 = getAbsoluteLongitude(p2Data.sign, p2Data.degree);
      const angle = calculateAspectAngle(long1, long2);
      const aspectInfo = identifyAspect(angle);
      if (aspectInfo) {
        const orb = Math.abs(angle - (aspectInfo.aspect === "conjunction" ? 0 : aspectInfo.aspect === "sextile" ? 60 : aspectInfo.aspect === "square" ? 90 : aspectInfo.aspect === "trine" ? 120 : 180));
        const classification = classifyAspectTier(p1Name, p2Name, aspectInfo.aspect, orb);
        allAspects.push({
          person1Planet: p1Name,
          person2Planet: p2Name,
          aspect: aspectInfo.aspect,
          orb: parseFloat(orb.toFixed(2)),
          ...classification
        });
      }
    }
  }
  const goldenAspects = allAspects.filter((a) => a.tier === "golden").sort((a, b) => b.score - a.score);
  const diamondAspects = allAspects.filter((a) => a.tier === "diamond").sort((a, b) => b.score - a.score);
  const fatedAspects = allAspects.filter((a) => a.tier === "fated").sort((a, b) => b.score - a.score);
  const otherAspects = allAspects.filter((a) => a.tier === "standard").sort((a, b) => b.score - a.score);
  const person1Overlays = calculateHouseOverlays(chart1.planets, chart2.houses || [], "Person 2");
  const person2Overlays = calculateHouseOverlays(chart2.planets, chart1.houses || [], "Person 1");
  const chemistryScore = Math.round(
    goldenAspects.reduce((sum, asp) => sum + asp.score, 0) / Math.max(goldenAspects.length, 1)
  );
  const commitmentScore = Math.round(
    diamondAspects.reduce((sum, asp) => sum + asp.score, 0) / Math.max(diamondAspects.length, 1) || 50
  );
  const growthScore = Math.round(
    allAspects.filter((a) => a.impact === "tension").reduce((sum, asp) => sum + asp.score, 0) / Math.max(allAspects.filter((a) => a.impact === "tension").length, 1) || 60
  );
  const overallScore = Math.round(
    chemistryScore * 0.35 + commitmentScore * 0.4 + growthScore * 0.25
  );
  const soulMateIndicators = [];
  if (goldenAspects.length >= 3) soulMateIndicators.push("Multiple Golden Tier aspects - strong soul connection");
  if (diamondAspects.length >= 2) soulMateIndicators.push("Saturn aspects present - long-term staying power");
  if (fatedAspects.length >= 1) soulMateIndicators.push("Karmic/fated connection indicators");
  if (person1Overlays.filter((o) => o.impact === "profound").length >= 2) {
    soulMateIndicators.push("Significant house overlays - deep life integration");
  }
  const strengths = [];
  if (goldenAspects.length > 0) strengths.push(`${goldenAspects.length} harmonious soul mate aspects`);
  if (diamondAspects.length > 0) strengths.push(`${diamondAspects.length} commitment-building Saturn aspects`);
  if (chemistryScore >= 80) strengths.push("Exceptional natural chemistry and attraction");
  const challenges = [];
  const tensionAspects = allAspects.filter((a) => a.impact === "tension");
  if (tensionAspects.length > 5) challenges.push("Multiple challenging aspects requiring conscious work");
  if (commitmentScore < 60) challenges.push("May lack long-term stability indicators");
  if (goldenAspects.length === 0) challenges.push("Limited natural harmony - will require more effort");
  const relationshipType = overallScore >= 85 ? "Soul Mate Connection" : overallScore >= 75 ? "Profound Partnership" : overallScore >= 65 ? "Strong Compatibility" : overallScore >= 50 ? "Growth-Oriented Connection" : "Challenging but Transformative";
  return {
    overallScore,
    goldenAspects,
    diamondAspects,
    fatedAspects,
    otherAspects,
    houseOverlays: {
      person1Planets: person1Overlays,
      person2Planets: person2Overlays
    },
    chemistry: {
      score: chemistryScore,
      description: chemistryScore >= 80 ? "Exceptional" : chemistryScore >= 65 ? "Strong" : chemistryScore >= 50 ? "Moderate" : "Requires cultivation"
    },
    commitment: {
      score: commitmentScore,
      description: commitmentScore >= 80 ? "Exceptional long-term potential" : commitmentScore >= 65 ? "Strong staying power" : commitmentScore >= 50 ? "Moderate commitment" : "May lack stability"
    },
    growth: {
      score: growthScore,
      description: growthScore >= 70 ? "Healthy tension for growth" : growthScore >= 50 ? "Balanced growth dynamics" : "Significant challenges requiring work"
    },
    summary: {
      strengths,
      challenges,
      soulMateIndicators,
      relationshipType
    }
  };
}

// server/services/compatibility.ts
function calculateAstrologyCompatibility(profile1, profile2) {
  const astro1 = profile1.astrologyData;
  const astro2 = profile2.astrologyData;
  if (!astro1 || !astro2) {
    return { score: 0, sunCompatibility: { score: 0, description: "Data unavailable" }, moonCompatibility: { score: 0, description: "Data unavailable" }, risingCompatibility: { score: 0, description: "Data unavailable" }, venusMarsChemistry: { score: 0, description: "Data unavailable" }, aspects: [], karmicConnection: { hasConnection: false, description: "Data unavailable" } };
  }
  let synastryResult;
  try {
    synastryResult = calculateDetailedSynastry(astro1, astro2);
  } catch (error) {
    console.error("Synastry calculation failed, falling back to basic compatibility:", error);
    synastryResult = null;
  }
  const sunScore = calculateSignCompatibility(astro1.sunSign, astro2.sunSign);
  const sunDescription = getSunCompatibilityDescription(astro1.sunSign, astro2.sunSign, sunScore);
  const moonScore = calculateSignCompatibility(astro1.moonSign, astro2.moonSign);
  const moonDescription = getMoonCompatibilityDescription(astro1.moonSign, astro2.moonSign, moonScore);
  const risingScore = calculateSignCompatibility(astro1.risingSign, astro2.risingSign);
  const risingDescription = getRisingCompatibilityDescription(astro1.risingSign, astro2.risingSign, risingScore);
  const venusSign1 = astro1.planets?.venus?.sign;
  const marsSign1 = astro1.planets?.mars?.sign;
  const venusSign2 = astro2.planets?.venus?.sign;
  const marsSign2 = astro2.planets?.mars?.sign;
  const venusMarsScore = calculateVenusMarsChemistry(venusSign1, marsSign1, venusSign2, marsSign2);
  const venusMarsDescription = getVenusMarsDescription(venusMarsScore);
  const karmicConnection = checkKarmicConnection(
    astro1.northNode?.sign,
    astro1.southNode?.sign,
    astro2.northNode?.sign,
    astro2.southNode?.sign
  );
  let astroScore = Math.round(
    sunScore * 0.25 + moonScore * 0.3 + risingScore * 0.15 + venusMarsScore * 0.2 + (karmicConnection.hasConnection ? 10 : 0)
  );
  const aspectsList = [];
  if (synastryResult) {
    astroScore = synastryResult.overallScore;
    for (const aspect of [...synastryResult.goldenAspects, ...synastryResult.diamondAspects, ...synastryResult.fatedAspects].slice(0, 10)) {
      aspectsList.push({
        aspect: `${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspect}`,
        description: aspect.description,
        impact: aspect.impact === "harmony" ? "positive" : aspect.impact === "tension" ? "challenging" : "neutral"
      });
    }
  }
  return {
    score: Math.min(100, astroScore),
    sunCompatibility: { score: sunScore, description: sunDescription },
    moonCompatibility: { score: moonScore, description: moonDescription },
    risingCompatibility: { score: risingScore, description: risingDescription },
    venusMarsChemistry: {
      score: synastryResult ? synastryResult.chemistry.score : venusMarsScore,
      description: synastryResult ? synastryResult.chemistry.description : venusMarsDescription
    },
    aspects: aspectsList,
    karmicConnection: synastryResult && synastryResult.fatedAspects.length > 0 ? { hasConnection: true, description: synastryResult.fatedAspects[0].description } : karmicConnection,
    synastry: synastryResult || void 0
  };
}
function calculateSignCompatibility(sign1, sign2) {
  const elements = {
    "Aries": "Fire",
    "Leo": "Fire",
    "Sagittarius": "Fire",
    "Taurus": "Earth",
    "Virgo": "Earth",
    "Capricorn": "Earth",
    "Gemini": "Air",
    "Libra": "Air",
    "Aquarius": "Air",
    "Cancer": "Water",
    "Scorpio": "Water",
    "Pisces": "Water"
  };
  const modalities = {
    "Aries": "Cardinal",
    "Cancer": "Cardinal",
    "Libra": "Cardinal",
    "Capricorn": "Cardinal",
    "Taurus": "Fixed",
    "Leo": "Fixed",
    "Scorpio": "Fixed",
    "Aquarius": "Fixed",
    "Gemini": "Mutable",
    "Virgo": "Mutable",
    "Sagittarius": "Mutable",
    "Pisces": "Mutable"
  };
  if (sign1 === sign2) return 100;
  const element1 = elements[sign1];
  const element2 = elements[sign2];
  const modality1 = modalities[sign1];
  const modality2 = modalities[sign2];
  if (element1 === element2) return 90;
  if (element1 === "Fire" && element2 === "Air" || element1 === "Air" && element2 === "Fire") return 85;
  if (element1 === "Earth" && element2 === "Water" || element1 === "Water" && element2 === "Earth") return 85;
  const opposites = {
    "Aries": "Libra",
    "Taurus": "Scorpio",
    "Gemini": "Sagittarius",
    "Cancer": "Capricorn",
    "Leo": "Aquarius",
    "Virgo": "Pisces"
  };
  if (opposites[sign1] === sign2 || opposites[sign2] === sign1) return 70;
  if (modality1 === modality2) return 55;
  return 60;
}
function getSunCompatibilityDescription(sign1, sign2, score) {
  if (score >= 90) return `${sign1} and ${sign2} share the same element, creating natural harmony in core values and life approach. You "get" each other instinctively.`;
  if (score >= 80) return `${sign1} and ${sign2} complement each other beautifully. Your different approaches to life actually enhance the relationship.`;
  if (score >= 70) return `${sign1} and ${sign2} create magnetic tension - opposite but deeply attracted. This pairing requires conscious effort but offers profound growth.`;
  if (score >= 55) return `${sign1} and ${sign2} have some friction in their core approaches, but this challenge can spark growth if both are willing to understand each other's perspective.`;
  return `${sign1} and ${sign2} have different life philosophies. Success requires embracing differences as opportunities to learn.`;
}
function getMoonCompatibilityDescription(sign1, sign2, score) {
  if (score >= 90) return `Emotional languages align perfectly. You intuitively understand each other's feelings and needs without words.`;
  if (score >= 80) return `Your emotional natures complement each other. One provides what the other needs for emotional security.`;
  if (score >= 70) return `Emotional connection requires conscious effort, but the magnetic pull is strong. Different needs can actually balance each other.`;
  if (score >= 55) return `You express emotions differently, which can lead to misunderstandings. Communication about feelings is key.`;
  return `Emotional needs may clash. Success requires learning each other's emotional language with patience.`;
}
function getRisingCompatibilityDescription(sign1, sign2, score) {
  if (score >= 90) return `You approach life in similar ways. First impressions were likely instant recognition and comfort.`;
  if (score >= 80) return `Your life approaches complement each other. You're attracted to how the other presents themselves to the world.`;
  if (score >= 70) return `Different styles create intrigue. You're fascinated by each other's unique approach to life.`;
  return `You move through the world differently. Appreciating these differences is important for harmony.`;
}
function calculateVenusMarsChemistry(venus1, mars1, venus2, mars2) {
  if (!venus1 || !mars1 || !venus2 || !mars2) return 50;
  let chemistry = 0;
  chemistry += calculateSignCompatibility(venus1, mars2) * 0.5;
  chemistry += calculateSignCompatibility(venus2, mars1) * 0.5;
  chemistry += calculateSignCompatibility(venus1, venus2) * 0.3;
  chemistry += calculateSignCompatibility(mars1, mars2) * 0.2;
  return Math.round(Math.min(100, chemistry));
}
function getVenusMarsDescription(score) {
  if (score >= 85) return `Intense magnetic attraction! The chemistry is palpable and the passion runs deep. This is a rare level of physical and romantic compatibility.`;
  if (score >= 70) return `Strong romantic chemistry with good balance between attraction and shared values in love.`;
  if (score >= 55) return `Moderate attraction with potential to grow. Initial spark may take time to develop into lasting passion.`;
  return `Chemistry requires conscious cultivation. Focus on emotional connection to build physical attraction over time.`;
}
function checkKarmicConnection(northNode1, southNode1, northNode2, southNode2) {
  if (!northNode1 || !southNode1 || !northNode2 || !southNode2) {
    return { hasConnection: false, description: "Karmic data incomplete" };
  }
  if (northNode1 === southNode2 || northNode2 === southNode1) {
    return {
      hasConnection: true,
      description: "Powerful karmic connection detected! This relationship has deep soul-level significance. One of you represents what the other is learning to embody in this lifetime."
    };
  }
  if (northNode1 === northNode2) {
    return {
      hasConnection: true,
      description: "You share a karmic destiny path. This relationship supports both of you in evolving toward your highest potential together."
    };
  }
  return {
    hasConnection: false,
    description: "No major karmic indicators detected, but all relationships serve our soul's growth."
  };
}
function calculateNumerologyCompatibility(profile1, profile2) {
  const num1 = profile1.numerologyData;
  const num2 = profile2.numerologyData;
  if (!num1 || !num2) {
    return { score: 0, lifePathCompatibility: { score: 0, description: "Data unavailable" }, expressionCompatibility: { score: 0, description: "Data unavailable" }, personalityNumbers: { score: 0, description: "Data unavailable" } };
  }
  const lifePathScore = calculateNumberCompatibility(num1.lifePath, num2.lifePath);
  const lifePathDesc = getLifePathCompatibilityDescription(num1.lifePath, num2.lifePath, lifePathScore);
  const expressionScore = calculateNumberCompatibility(num1.expression || 0, num2.expression || 0);
  const expressionDesc = getExpressionCompatibilityDescription(expressionScore);
  const personalityScore = calculateNumberCompatibility(num1.personality || 0, num2.personality || 0);
  const personalityDesc = getPersonalityCompatibilityDescription(personalityScore);
  const numerologyScore = Math.round(
    lifePathScore * 0.5 + expressionScore * 0.3 + personalityScore * 0.2
  );
  return {
    score: numerologyScore,
    lifePathCompatibility: { score: lifePathScore, description: lifePathDesc },
    expressionCompatibility: { score: expressionScore, description: expressionDesc },
    personalityNumbers: { score: personalityScore, description: personalityDesc }
  };
}
function calculateNumberCompatibility(num1, num2) {
  if (num1 === num2) return 100;
  const compatiblePairs = {
    "1": [1, 3, 5, 9],
    "2": [2, 4, 6, 8],
    "3": [1, 3, 5, 6, 9],
    "4": [2, 4, 6, 7, 8],
    "5": [1, 3, 5, 7, 9],
    "6": [2, 3, 4, 6, 8, 9],
    "7": [4, 5, 7, 9],
    "8": [2, 4, 6, 8],
    "9": [1, 3, 5, 6, 7, 9],
    "11": [2, 6, 11, 22],
    "22": [2, 4, 11, 22],
    "33": [3, 6, 9, 33]
  };
  if (compatiblePairs[num1.toString()]?.includes(num2)) return 85;
  if (compatiblePairs[num2.toString()]?.includes(num1)) return 85;
  return 60;
}
function getLifePathCompatibilityDescription(num1, num2, score) {
  if (score === 100) return `Same Life Path (${num1}) - You share the same soul mission and understand each other's journey intimately.`;
  if (score >= 85) return `Life Paths ${num1} and ${num2} are naturally harmonious. Your life purposes support and enhance each other.`;
  return `Life Paths ${num1} and ${num2} have different focuses, but can learn valuable lessons from each other's perspective.`;
}
function getExpressionCompatibilityDescription(score) {
  if (score >= 85) return `You express yourselves in complementary ways, making communication natural and flowing.`;
  return `Different communication styles require mindful effort to understand each other fully.`;
}
function getPersonalityCompatibilityDescription(score) {
  if (score >= 85) return `Your outer personalities mesh well, creating ease in social situations and first impressions.`;
  return `You present differently to the world, which can create interesting dynamics in how others perceive you as a pair.`;
}
function calculateHumanDesignCompatibility(profile1, profile2) {
  const hd1 = profile1.humanDesignData;
  const hd2 = profile2.humanDesignData;
  if (!hd1 || !hd2) {
    return { score: 0, typeInteraction: { score: 0, description: "Data unavailable" }, authorityAlignment: { score: 0, description: "Data unavailable" }, channelConnections: { count: 0, description: "Data unavailable" }, centerDynamics: { score: 0, description: "Data unavailable" } };
  }
  const typeScore = calculateTypeCompatibility(hd1.type, hd2.type);
  const typeDesc = getTypeInteractionDescription(hd1.type, hd2.type, typeScore);
  const authorityScore = calculateAuthorityCompatibility(hd1.authority, hd2.authority);
  const authorityDesc = getAuthorityDescription(hd1.authority, hd2.authority, authorityScore);
  const centerScore = calculateCenterDynamics(hd1.centers, hd2.centers);
  const centerDesc = getCenterDynamicsDescription(centerScore);
  const channelConnections = findChannelConnections(hd1.gates || [], hd2.gates || []);
  const hdScore = Math.round(
    typeScore * 0.3 + authorityScore * 0.25 + centerScore * 0.25 + (channelConnections.count > 0 ? 20 : 0)
  );
  return {
    score: Math.min(100, hdScore),
    typeInteraction: { score: typeScore, description: typeDesc },
    authorityAlignment: { score: authorityScore, description: authorityDesc },
    channelConnections: { count: channelConnections.count, description: channelConnections.description },
    centerDynamics: { score: centerScore, description: centerDesc }
  };
}
function calculateTypeCompatibility(type1, type2) {
  const compatibility = {
    "Generator": { "Generator": 85, "Manifestor": 70, "Projector": 90, "Reflector": 75, "Manifesting Generator": 90 },
    "Manifestor": { "Generator": 70, "Manifestor": 60, "Projector": 75, "Reflector": 70, "Manifesting Generator": 75 },
    "Projector": { "Generator": 90, "Manifestor": 75, "Projector": 70, "Reflector": 80, "Manifesting Generator": 85 },
    "Reflector": { "Generator": 75, "Manifestor": 70, "Projector": 80, "Reflector": 85, "Manifesting Generator": 75 },
    "Manifesting Generator": { "Generator": 90, "Manifestor": 75, "Projector": 85, "Reflector": 75, "Manifesting Generator": 85 }
  };
  return compatibility[type1]?.[type2] || 60;
}
function getTypeInteractionDescription(type1, type2, score) {
  if (type1 === "Generator" && type2 === "Projector") return `Powerful pairing! ${type2}s are here to guide ${type1}s' abundant energy, creating mutual fulfillment.`;
  if (type1 === "Projector" && type2 === "Generator") return `Powerful pairing! ${type1}s are here to guide ${type2}s' abundant energy, creating mutual fulfillment.`;
  if (score >= 85) return `${type1} and ${type2} create natural energetic harmony. Your interaction feels easeful and supportive.`;
  if (score >= 70) return `${type1} and ${type2} can work well together with mutual understanding of each other's strategy.`;
  return `${type1} and ${type2} have different energetic needs. Success comes from respecting each other's unique design.`;
}
function calculateAuthorityCompatibility(auth1, auth2) {
  if (auth1 === auth2) return 90;
  const emotionalAuthorities = ["Emotional", "Solar Plexus"];
  const sacralAuthorities = ["Sacral"];
  const mentalAuthorities = ["Splenic", "Mental", "Ego", "Self-Projected"];
  if (emotionalAuthorities.includes(auth1) && emotionalAuthorities.includes(auth2)) return 85;
  if (sacralAuthorities.includes(auth1) && sacralAuthorities.includes(auth2)) return 85;
  return 70;
}
function getAuthorityDescription(auth1, auth2, score) {
  if (score >= 85) return `Similar decision-making processes create understanding in how you both navigate choices.`;
  return `Different authorities mean you make decisions differently. Respecting each other's process is key.`;
}
function calculateCenterDynamics(centers1, centers2) {
  if (!centers1 || !centers2) return 60;
  let complementaryCount = 0;
  let totalCenters = 0;
  const centerNames = ["head", "ajna", "throat", "gCenter", "heart", "spleen", "sacral", "solarPlexus", "root"];
  for (const center of centerNames) {
    if (centers1[center] !== void 0 && centers2[center] !== void 0) {
      totalCenters++;
      if (centers1[center].defined !== centers2[center].defined) {
        complementaryCount++;
      }
    }
  }
  const complementaryRatio = totalCenters > 0 ? complementaryCount / totalCenters : 0;
  if (complementaryRatio >= 0.4 && complementaryRatio <= 0.6) return 90;
  if (complementaryRatio >= 0.3 && complementaryRatio <= 0.7) return 80;
  return 70;
}
function getCenterDynamicsDescription(score) {
  if (score >= 85) return `Excellent balance of defined and undefined centers. You complement each other's energetic strengths and wisdom.`;
  return `Your energetic centers create unique dynamics. Each brings different awareness to the relationship.`;
}
function findChannelConnections(gates1, gates2) {
  const gateMap = {
    1: 8,
    8: 1,
    2: 14,
    14: 2,
    3: 60,
    60: 3,
    4: 63,
    63: 4,
    5: 15,
    15: 5,
    6: 59,
    59: 6,
    7: 31,
    31: 7,
    9: 52,
    52: 9,
    10: 20,
    20: 10,
    11: 56,
    56: 11,
    12: 22,
    22: 12,
    13: 33,
    33: 13,
    16: 48,
    48: 16,
    17: 62,
    62: 17,
    18: 58,
    58: 18,
    19: 49,
    49: 19,
    21: 45,
    45: 21,
    23: 43,
    43: 23,
    24: 61,
    61: 24,
    25: 51,
    51: 25,
    26: 44,
    44: 26,
    27: 50,
    50: 27,
    28: 38,
    38: 28,
    29: 46,
    46: 29,
    30: 41,
    41: 30,
    32: 54,
    54: 32,
    34: 57,
    57: 34,
    35: 36,
    36: 35,
    37: 40,
    40: 37,
    39: 55,
    55: 39,
    42: 53,
    53: 42,
    47: 64,
    64: 47
  };
  let connectionCount = 0;
  for (const gate1 of gates1) {
    const pairedGate = gateMap[gate1.gate];
    if (pairedGate && gates2.some((g) => g.gate === pairedGate)) {
      connectionCount++;
    }
  }
  if (connectionCount === 0) {
    return { count: 0, description: "No electromagnetic connections. Your charts maintain energetic independence." };
  }
  if (connectionCount >= 3) {
    return {
      count: connectionCount,
      description: `${connectionCount} electromagnetic connections! This creates powerful energetic activation between you. The chemistry is intense and transformative.`
    };
  }
  return {
    count: connectionCount,
    description: `${connectionCount} electromagnetic connection${connectionCount > 1 ? "s" : ""}. This creates energetic resonance and mutual activation.`
  };
}
function calculatePersonalityCompatibility(profile1, profile2) {
  const pers1 = profile1.personalityData;
  const pers2 = profile2.personalityData;
  if (!pers1 || !pers2) {
    return { score: 0, enneagramCompatibility: { score: 0, description: "Data unavailable" }, mbtiCompatibility: { score: 0, description: "Data unavailable" }, cognitiveAlignment: { score: 0, description: "Data unavailable" } };
  }
  const enneagramScore = calculateEnneagramCompatibility(pers1.enneagram?.type, pers2.enneagram?.type);
  const enneagramDesc = getEnneagramDescription(pers1.enneagram?.type, pers2.enneagram?.type, enneagramScore);
  const mbtiScore = calculateMBTICompatibility(pers1.mbti?.type, pers2.mbti?.type);
  const mbtiDesc = getMBTIDescription(pers1.mbti?.type, pers2.mbti?.type, mbtiScore);
  const cognitiveScore = calculateCognitiveFunctionAlignment(pers1.mbti?.type, pers2.mbti?.type);
  const cognitiveDesc = getCognitiveDescription(cognitiveScore);
  const personalityScore = Math.round(
    enneagramScore * 0.4 + mbtiScore * 0.35 + cognitiveScore * 0.25
  );
  return {
    score: personalityScore,
    enneagramCompatibility: { score: enneagramScore, description: enneagramDesc },
    mbtiCompatibility: { score: mbtiScore, description: mbtiDesc },
    cognitiveAlignment: { score: cognitiveScore, description: cognitiveDesc }
  };
}
function calculateEnneagramCompatibility(type1, type2) {
  if (!type1 || !type2) return 60;
  if (type1 === type2) return 85;
  const compatibility = {
    1: [1, 2, 7, 9],
    2: [1, 2, 4, 8],
    3: [3, 6, 8, 9],
    4: [2, 4, 5, 9],
    5: [4, 5, 7, 9],
    6: [3, 6, 8, 9],
    7: [1, 5, 7, 9],
    8: [2, 3, 6, 8],
    9: [1, 3, 4, 5, 6, 7, 9]
  };
  if (compatibility[type1]?.includes(type2)) return 85;
  return 65;
}
function getEnneagramDescription(type1, type2, score) {
  if (!type1 || !type2) return "Enneagram data incomplete";
  if (score && score >= 85) return `Type ${type1} and Type ${type2} create natural harmony. Your core motivations align and support each other's growth.`;
  return `Type ${type1} and Type ${type2} have different core drives. Understanding each other's fears and desires builds connection.`;
}
function calculateMBTICompatibility(type1, type2) {
  if (!type1 || !type2) return 60;
  if (type1 === type2) return 90;
  const letters1 = type1.split("");
  const letters2 = type2.split("");
  let matchCount = 0;
  for (let i = 0; i < 4; i++) {
    if (letters1[i] === letters2[i]) matchCount++;
  }
  if (matchCount === 3) return 85;
  if (matchCount === 2) return 75;
  if (matchCount === 0) return 70;
  return 65;
}
function getMBTIDescription(type1, type2, score) {
  if (!type1 || !type2) return "MBTI data incomplete";
  if (score && score >= 85) return `${type1} and ${type2} share similar cognitive approaches. You understand how each other thinks and processes information.`;
  if (score && score >= 70) return `${type1} and ${type2} have complementary perspectives. Your differences create balance and mutual learning.`;
  return `${type1} and ${type2} think quite differently. This requires extra effort to understand each other's logic and decision-making.`;
}
function calculateCognitiveFunctionAlignment(type1, type2) {
  if (!type1 || !type2) return 60;
  const dominantFunction1 = type1[0] + type1[1];
  const dominantFunction2 = type2[0] + type2[1];
  if (dominantFunction1 === dominantFunction2) return 90;
  if (dominantFunction1.includes("N") && dominantFunction2.includes("S") || dominantFunction1.includes("S") && dominantFunction2.includes("N")) return 75;
  if (dominantFunction1.includes("T") && dominantFunction2.includes("F") || dominantFunction1.includes("F") && dominantFunction2.includes("T")) return 75;
  return 70;
}
function getCognitiveDescription(score) {
  if (score >= 85) return `Your cognitive functions align beautifully, making intellectual connection natural and stimulating.`;
  return `Different cognitive approaches mean you process information differently, which can enrich conversations when you're patient with each other.`;
}
function calculateVedicCompatibility(profile1, profile2) {
  const vedic1 = profile1.vedicAstrologyData;
  const vedic2 = profile2.vedicAstrologyData;
  if (!vedic1 || !vedic2) {
    return { score: 70, description: "Vedic data unavailable for full analysis." };
  }
  let score = 60;
  if (vedic1.moonNakshatra?.name === vedic2.moonNakshatra?.name) {
    score += 20;
  }
  if (vedic1.vedicSun === vedic2.vedicSun) score += 15;
  if (vedic1.vedicMoon === vedic2.vedicMoon) score += 15;
  return {
    score: Math.min(100, score),
    description: score >= 80 ? "Strong Vedic compatibility with harmonious lunar mansions and planetary alignments." : "Vedic chart shows opportunities for growth through different karmic patterns."
  };
}
function calculateChineseCompatibility(profile1, profile2) {
  const chinese1 = profile1.chineseAstrologyData;
  const chinese2 = profile2.chineseAstrologyData;
  if (!chinese1 || !chinese2) {
    return { score: 70, description: "Chinese astrology data unavailable." };
  }
  const compatiblePairs = [
    ["Rat", "Ox"],
    ["Rat", "Dragon"],
    ["Rat", "Monkey"],
    ["Ox", "Snake"],
    ["Ox", "Rooster"],
    ["Tiger", "Horse"],
    ["Tiger", "Dog"],
    ["Rabbit", "Goat"],
    ["Rabbit", "Pig"],
    ["Dragon", "Monkey"],
    ["Dragon", "Rooster"],
    ["Snake", "Rooster"],
    ["Horse", "Dog"],
    ["Horse", "Tiger"],
    ["Goat", "Pig"],
    ["Monkey", "Rat"],
    ["Rooster", "Ox"],
    ["Dog", "Tiger"],
    ["Pig", "Rabbit"]
  ];
  const year1 = chinese1.yearAnimal?.name;
  const year2 = chinese2.yearAnimal?.name;
  let score = 70;
  const isCompatible = compatiblePairs.some(
    (pair) => pair[0] === year1 && pair[1] === year2 || pair[1] === year1 && pair[0] === year2
  );
  if (year1 === year2) score = 85;
  else if (isCompatible) score = 90;
  if (chinese1.element === chinese2.element) score += 5;
  return {
    score: Math.min(100, score),
    description: score >= 85 ? `${year1} and ${year2} share natural harmony in Chinese astrology.` : `${year1} and ${year2} bring different energies that can balance each other.`
  };
}
function calculateAyurvedaCompatibility(profile1, profile2) {
  const ayurveda1 = profile1.ayurvedaData;
  const ayurveda2 = profile2.ayurvedaData;
  if (!ayurveda1 || !ayurveda2) {
    return { score: 70, description: "Ayurvedic constitution data unavailable." };
  }
  const dosha1 = ayurveda1.primaryDosha?.name;
  const dosha2 = ayurveda2.primaryDosha?.name;
  let score = 70;
  if (dosha1 === "Vata" && dosha2 === "Kapha") score = 85;
  else if (dosha1 === "Kapha" && dosha2 === "Vata") score = 85;
  else if (dosha1 === "Pitta" && dosha2 === "Kapha") score = 80;
  else if (dosha1 === "Kapha" && dosha2 === "Pitta") score = 80;
  else if (dosha1 === dosha2) score = 75;
  return {
    score,
    description: score >= 80 ? `${dosha1} and ${dosha2} doshas complement each other beautifully.` : `${dosha1} and ${dosha2} doshas require balance and understanding.`
  };
}
function calculateGeneKeysCompatibility(profile1, profile2) {
  const gk1 = profile1.geneKeysData;
  const gk2 = profile2.geneKeysData;
  if (!gk1 || !gk2) {
    return { score: 70, description: "Gene Keys data unavailable." };
  }
  let score = 70;
  if (gk1.lifeWork?.gift === gk2.lifeWork?.gift) score += 10;
  if (gk1.evolution?.gift === gk2.evolution?.gift) score += 10;
  return {
    score: Math.min(100, score),
    description: "Gene Keys reveal complementary paths of consciousness evolution."
  };
}
function calculateIChingCompatibility(profile1, profile2) {
  const iching1 = profile1.iChingData;
  const iching2 = profile2.iChingData;
  if (!iching1 || !iching2) {
    return { score: 70, description: "I Ching data unavailable." };
  }
  let score = 70;
  const hexNum1 = iching1.birthHexagram?.number || 0;
  const hexNum2 = iching2.birthHexagram?.number || 0;
  if (Math.abs(hexNum1 - hexNum2) === 1) score = 85;
  else if (hexNum1 === hexNum2) score = 90;
  return {
    score,
    description: `I Ching hexagrams reveal ${score >= 80 ? "harmonious" : "complementary"} life patterns.`
  };
}
function calculateMayanCompatibility(profile1, profile2) {
  const mayan1 = profile1.mayanAstrologyData;
  const mayan2 = profile2.mayanAstrologyData;
  if (!mayan1 || !mayan2) {
    return { score: 70, description: "Mayan astrology data unavailable." };
  }
  let score = 70;
  if (mayan1.daySign?.name === mayan2.daySign?.name) score = 85;
  const tone1 = mayan1.galacticTone || 0;
  const tone2 = mayan2.galacticTone || 0;
  if (tone1 === tone2) score += 10;
  return {
    score: Math.min(100, score),
    description: "Mayan calendar reveals complementary energetic signatures."
  };
}
function calculateChakraCompatibility(profile1, profile2) {
  const chakra1 = profile1.chakraData;
  const chakra2 = profile2.chakraData;
  if (!chakra1 || !chakra2) {
    return { score: 70, description: "Chakra data unavailable." };
  }
  let score = 75;
  const dominant1 = chakra1.dominantChakra;
  const dominant2 = chakra2.dominantChakra;
  if (dominant1 === dominant2) score = 80;
  else if (dominant1 === "Heart" && dominant2 === "Throat" || dominant1 === "Throat" && dominant2 === "Heart") score = 90;
  return {
    score,
    description: "Chakra energies create opportunities for energetic balance and activation."
  };
}
function calculateSacredGeometryCompatibility(profile1, profile2) {
  const sg1 = profile1.sacredGeometryData;
  const sg2 = profile2.sacredGeometryData;
  if (!sg1 || !sg2) {
    return { score: 70, description: "Sacred geometry data unavailable." };
  }
  let score = 75;
  if (sg1.primaryShape === sg2.primaryShape) score = 85;
  return {
    score,
    description: "Sacred geometric patterns reveal harmonious structural alignment."
  };
}
function calculateRunesCompatibility(profile1, profile2) {
  const runes1 = profile1.runesData;
  const runes2 = profile2.runesData;
  if (!runes1 || !runes2) {
    return { score: 70, description: "Runes data unavailable." };
  }
  let score = 75;
  if (runes1.birthRune === runes2.birthRune) score = 85;
  return {
    score,
    description: "Runic patterns suggest complementary ancestral wisdom paths."
  };
}
function calculateSabianCompatibility(profile1, profile2) {
  const sabian1 = profile1.sabianSymbolsData;
  const sabian2 = profile2.sabianSymbolsData;
  if (!sabian1 || !sabian2) {
    return { score: 70, description: "Sabian symbols data unavailable." };
  }
  return {
    score: 80,
    description: "Sabian symbols reveal complementary symbolic life themes."
  };
}
function calculateBiorhythmsCompatibility(profile1, profile2) {
  const bio1 = profile1.biorhythmsData;
  const bio2 = profile2.biorhythmsData;
  if (!bio1 || !bio2) {
    return { score: 70, description: "Biorhythms data unavailable." };
  }
  let score = 75;
  if (bio1.physicalPeakDay === bio2.physicalPeakDay) score += 10;
  return {
    score: Math.min(100, score),
    description: "Biorhythmic cycles show opportunities for synchronized energy."
  };
}
function calculateAsteroidsCompatibility(profile1, profile2) {
  const ast1 = profile1.asteroidsData;
  const ast2 = profile2.asteroidsData;
  if (!ast1 || !ast2) {
    return { score: 70, description: "Asteroid placements unavailable." };
  }
  return {
    score: 75,
    description: "Asteroid placements add nuanced depth to compatibility dynamics."
  };
}
function calculateArabicPartsCompatibility(profile1, profile2) {
  const ap1 = profile1.arabicPartsData;
  const ap2 = profile2.arabicPartsData;
  if (!ap1 || !ap2) {
    return { score: 70, description: "Arabic Parts data unavailable." };
  }
  let score = 75;
  if (ap1.fortuneSign === ap2.fortuneSign) score += 10;
  return {
    score: Math.min(100, score),
    description: "Arabic Parts reveal harmonious paths to fortune and purpose."
  };
}
function calculateFixedStarsCompatibility(profile1, profile2) {
  const fs1 = profile1.fixedStarsData;
  const fs2 = profile2.fixedStarsData;
  if (!fs1 || !fs2) {
    return { score: 70, description: "Fixed stars data unavailable." };
  }
  let score = 75;
  if (fs1.primaryStar === fs2.primaryStar) score = 90;
  return {
    score,
    description: "Fixed star connections reveal timeless cosmic resonance."
  };
}
function calculateKabbalahCompatibility(profile1, profile2) {
  const kab1 = profile1.kabbalisticData;
  const kab2 = profile2.kabbalisticData;
  if (!kab1 || !kab2) {
    return { score: 70, description: "Kabbalistic data unavailable." };
  }
  let score = 75;
  if (kab1.treePath === kab2.treePath) score = 85;
  return {
    score,
    description: "Kabbalistic paths reveal complementary spiritual evolution."
  };
}
function calculateTarotCompatibility(profile1, profile2) {
  const tarot1 = profile1.archetypeData?.tarotCards;
  const tarot2 = profile2.archetypeData?.tarotCards;
  if (!tarot1 || !tarot2) {
    return { score: 70, description: "Tarot birth cards unavailable." };
  }
  let score = 75;
  if (tarot1.personality?.number === tarot2.personality?.number) score = 90;
  else if (tarot1.soul?.number === tarot2.soul?.number) score = 85;
  return {
    score,
    description: score >= 85 ? "Tarot birth cards reveal deep archetypal resonance." : "Tarot cards show complementary soul lessons."
  };
}
function createCompatibilitySynthesis(astro, num, hd, pers) {
  const strengths = [];
  const challenges = [];
  const growthOpportunities = [];
  if (astro.moonCompatibility.score >= 85) strengths.push("Deep emotional understanding");
  if (astro.venusMarsChemistry.score >= 85) strengths.push("Strong romantic chemistry");
  if (astro.karmicConnection.hasConnection) strengths.push("Karmic soul connection");
  if (num.lifePathCompatibility.score >= 85) strengths.push("Aligned life purposes");
  if (hd.channelConnections.count > 0) strengths.push("Energetic activation and chemistry");
  if (pers.enneagramCompatibility.score >= 85) strengths.push("Compatible core motivations");
  if (astro.sunCompatibility.score < 70) challenges.push("Different core values require understanding");
  if (num.score < 70) challenges.push("Different life rhythms and expressions");
  if (hd.typeInteraction.score < 70) challenges.push("Different energetic strategies");
  if (pers.mbtiCompatibility.score < 70) challenges.push("Different communication and thinking styles");
  if (astro.score >= 75 && pers.score < 70) {
    growthOpportunities.push("Strong spiritual connection can bridge personality differences");
  }
  if (hd.channelConnections.count > 0) {
    growthOpportunities.push("Electromagnetic connections create powerful transformation potential");
  }
  if (num.lifePathCompatibility.score >= 80) {
    growthOpportunities.push("Shared life purpose creates foundation for long-term partnership");
  }
  const avgScore = (astro.score + num.score + hd.score + pers.score) / 4;
  let relationshipType = "";
  if (avgScore >= 85) relationshipType = "Soul Mate Connection";
  else if (avgScore >= 75) relationshipType = "Highly Compatible Partnership";
  else if (avgScore >= 65) relationshipType = "Growth-Oriented Relationship";
  else relationshipType = "Challenging but Transformative Connection";
  let longTermPotential = "";
  if (num.lifePathCompatibility.score >= 80 && astro.moonCompatibility.score >= 80) {
    longTermPotential = "Excellent long-term potential. Shared life purpose and emotional compatibility create strong foundation.";
  } else if (avgScore >= 75) {
    longTermPotential = "Strong long-term potential with conscious effort and mutual growth.";
  } else {
    longTermPotential = "Long-term success requires significant compromise and personal development from both partners.";
  }
  return {
    strengths: strengths.length > 0 ? strengths : ["Every relationship has unique gifts to discover"],
    challenges: challenges.length > 0 ? challenges : ["All relationships require conscious effort"],
    growthOpportunities: growthOpportunities.length > 0 ? growthOpportunities : ["Every connection teaches us about ourselves"],
    relationshipType,
    longTermPotential
  };
}
function calculateCompatibility(profile1, profile2) {
  const astrology = calculateAstrologyCompatibility(profile1, profile2);
  const numerology = calculateNumerologyCompatibility(profile1, profile2);
  const humanDesign = calculateHumanDesignCompatibility(profile1, profile2);
  const personality = calculatePersonalityCompatibility(profile1, profile2);
  const vedic = calculateVedicCompatibility(profile1, profile2);
  const chinese = calculateChineseCompatibility(profile1, profile2);
  const ayurveda = calculateAyurvedaCompatibility(profile1, profile2);
  const geneKeys = calculateGeneKeysCompatibility(profile1, profile2);
  const iChing = calculateIChingCompatibility(profile1, profile2);
  const mayan = calculateMayanCompatibility(profile1, profile2);
  const chakra = calculateChakraCompatibility(profile1, profile2);
  const sacredGeometry = calculateSacredGeometryCompatibility(profile1, profile2);
  const runes = calculateRunesCompatibility(profile1, profile2);
  const sabian = calculateSabianCompatibility(profile1, profile2);
  const biorhythms = calculateBiorhythmsCompatibility(profile1, profile2);
  const asteroids = calculateAsteroidsCompatibility(profile1, profile2);
  const arabicParts = calculateArabicPartsCompatibility(profile1, profile2);
  const fixedStars = calculateFixedStarsCompatibility(profile1, profile2);
  const kabbalah = calculateKabbalahCompatibility(profile1, profile2);
  const tarot = calculateTarotCompatibility(profile1, profile2);
  const spiritualScore = Math.round(
    (vedic.score + chinese.score + ayurveda.score + geneKeys.score + iChing.score + mayan.score + chakra.score + sacredGeometry.score + runes.score + sabian.score + biorhythms.score + asteroids.score + arabicParts.score + fixedStars.score + kabbalah.score + tarot.score) / 16
  );
  const synthesis = createCompatibilitySynthesis(astrology, numerology, humanDesign, personality);
  const overallScore = Math.round(
    astrology.score * 0.3 + numerology.score * 0.2 + humanDesign.score * 0.2 + personality.score * 0.2 + spiritualScore * 0.1
    // Now calculated from ALL 15 advanced systems!
  );
  const astro1 = profile1.astrologyData;
  const astro2 = profile2.astrologyData;
  const num1 = profile1.numerologyData;
  const num2 = profile2.numerologyData;
  const hd1 = profile1.humanDesignData;
  const hd2 = profile2.humanDesignData;
  const pers1 = profile1.personalityData;
  const pers2 = profile2.personalityData;
  const getElement3 = (sign) => {
    const elements = {
      "Aries": "Fire",
      "Leo": "Fire",
      "Sagittarius": "Fire",
      "Taurus": "Earth",
      "Virgo": "Earth",
      "Capricorn": "Earth",
      "Gemini": "Air",
      "Libra": "Air",
      "Aquarius": "Air",
      "Cancer": "Water",
      "Scorpio": "Water",
      "Pisces": "Water"
    };
    return elements[sign] || "Unknown";
  };
  const getModality2 = (sign) => {
    const modalities = {
      "Aries": "Cardinal",
      "Cancer": "Cardinal",
      "Libra": "Cardinal",
      "Capricorn": "Cardinal",
      "Taurus": "Fixed",
      "Leo": "Fixed",
      "Scorpio": "Fixed",
      "Aquarius": "Fixed",
      "Gemini": "Mutable",
      "Virgo": "Mutable",
      "Sagittarius": "Mutable",
      "Pisces": "Mutable"
    };
    return modalities[sign] || "Unknown";
  };
  const element1 = getElement3(astro1?.sunSign || "");
  const element2 = getElement3(astro2?.sunSign || "");
  const modality1 = getModality2(astro1?.sunSign || "");
  const modality2 = getModality2(astro2?.sunSign || "");
  return {
    overallScore,
    categories: {
      astrology: {
        score: astrology.score,
        weight: 30,
        details: {
          elementCompatibility: {
            person1Element: element1,
            person2Element: element2,
            score: astrology.sunCompatibility.score,
            description: element1 === element2 ? `Both ${element1} signs share the same elemental energy, creating natural understanding.` : `${element1} and ${element2} elements bring different energies that can complement each other.`
          },
          modalityCompatibility: {
            person1Modality: modality1,
            person2Modality: modality2,
            score: modality1 === modality2 ? 85 : 70,
            description: modality1 === modality2 ? `Shared ${modality1} modality means similar approaches to action and change.` : `Different modalities (${modality1} and ${modality2}) create diverse approaches to life's challenges.`
          },
          sunMoonHarmony: {
            score: Math.round((astrology.sunCompatibility.score + astrology.moonCompatibility.score) / 2),
            insights: [
              astrology.sunCompatibility.description,
              astrology.moonCompatibility.description
            ]
          },
          risingSignSynergy: {
            score: astrology.risingCompatibility.score,
            insights: [astrology.risingCompatibility.description]
          },
          aspects: {
            harmonious: astrology.venusMarsChemistry.score >= 70 ? 3 : 1,
            challenging: astrology.venusMarsChemistry.score < 70 ? 2 : 0,
            score: astrology.venusMarsChemistry.score,
            insights: [
              astrology.venusMarsChemistry.description,
              astrology.karmicConnection.description
            ]
          }
        },
        synastry: astrology.synastry
      },
      numerology: {
        score: numerology.score,
        weight: 20,
        details: {
          lifePathCompatibility: {
            person1LifePath: num1?.lifePath || 0,
            person2LifePath: num2?.lifePath || 0,
            score: numerology.lifePathCompatibility.score,
            description: numerology.lifePathCompatibility.description
          },
          expressionHarmony: {
            score: numerology.expressionCompatibility.score,
            description: numerology.expressionCompatibility.description
          },
          soulUrgeAlignment: {
            score: numerology.personalityNumbers.score,
            description: numerology.personalityNumbers.description
          }
        }
      },
      humanDesign: {
        score: humanDesign.score,
        weight: 20,
        details: {
          typeInteraction: {
            person1Type: hd1?.type || "Unknown",
            person2Type: hd2?.type || "Unknown",
            score: humanDesign.typeInteraction.score,
            description: humanDesign.typeInteraction.description
          },
          authorityAlignment: {
            score: humanDesign.authorityAlignment.score,
            description: humanDesign.authorityAlignment.description
          },
          channelConnections: {
            sharedChannels: humanDesign.channelConnections.count > 0 ? 1 : 0,
            complementaryChannels: humanDesign.channelConnections.count > 0 ? humanDesign.channelConnections.count - 1 : 0,
            score: humanDesign.channelConnections.count > 0 ? 85 : 60,
            insights: [humanDesign.channelConnections.description]
          },
          centerDynamics: {
            score: humanDesign.centerDynamics.score,
            insights: [humanDesign.centerDynamics.description]
          }
        }
      },
      personality: {
        score: personality.score,
        weight: 20,
        details: {
          enneagramDynamics: {
            person1Type: String(pers1?.enneagram?.type || ""),
            person2Type: String(pers2?.enneagram?.type || ""),
            score: personality.enneagramCompatibility.score,
            description: personality.enneagramCompatibility.description,
            growthPotential: `Both types can learn valuable lessons from each other's strengths and perspectives.`,
            challenges: `Understanding each other's core fears and motivations requires patience and empathy.`
          },
          mbtiCompatibility: {
            person1Type: pers1?.mbti?.type || "Unknown",
            person2Type: pers2?.mbti?.type || "Unknown",
            score: personality.mbtiCompatibility.score,
            description: personality.mbtiCompatibility.description,
            cognitiveAlignment: personality.cognitiveAlignment.description
          }
        }
      },
      spiritual: {
        score: spiritualScore,
        // NOW CALCULATED FROM ALL 15 ADVANCED SYSTEMS!
        weight: 10,
        details: {
          vedic: { score: vedic.score, insights: [vedic.description] },
          chinese: { score: chinese.score, insights: [chinese.description] },
          ayurveda: { score: ayurveda.score, insights: [ayurveda.description] },
          geneKeys: { score: geneKeys.score, insights: [geneKeys.description] },
          iChing: { score: iChing.score, insights: [iChing.description] },
          mayan: { score: mayan.score, insights: [mayan.description] },
          chakra: { score: chakra.score, insights: [chakra.description] },
          sacredGeometry: { score: sacredGeometry.score, insights: [sacredGeometry.description] },
          runes: { score: runes.score, insights: [runes.description] },
          sabian: { score: sabian.score, insights: [sabian.description] },
          biorhythms: { score: biorhythms.score, insights: [biorhythms.description] },
          asteroids: { score: asteroids.score, insights: [asteroids.description] },
          arabicParts: { score: arabicParts.score, insights: [arabicParts.description] },
          fixedStars: { score: fixedStars.score, insights: [fixedStars.description] },
          kabbalah: { score: kabbalah.score, insights: [kabbalah.description] },
          tarot: { score: tarot.score, insights: [tarot.description] }
        }
      }
    },
    strengths: synthesis.strengths,
    challenges: synthesis.challenges,
    growthOpportunities: synthesis.growthOpportunities,
    relationshipDynamics: `${synthesis.relationshipType}. ${synthesis.longTermPotential}`
  };
}

// server/services/vedic-astrology.ts
import * as Astronomy3 from "astronomy-engine";
import { fromZonedTime as fromZonedTime3 } from "date-fns-tz";
var AYANAMSA_2025 = 24.2;
var NAKSHATRAS = [
  { name: "Ashwini", deity: "Ashwini Kumaras", symbol: "Horse's head", element: "Earth", quality: "Light", ruler: "Ketu", keywords: ["Healing", "Speed", "Initiative"] },
  { name: "Bharani", deity: "Yama", symbol: "Yoni", element: "Earth", quality: "Fierce", ruler: "Venus", keywords: ["Transformation", "Restraint", "Nurturing"] },
  { name: "Krittika", deity: "Agni", symbol: "Razor", element: "Fire", quality: "Mixed", ruler: "Sun", keywords: ["Cutting through", "Purification", "Determination"] },
  { name: "Rohini", deity: "Brahma", symbol: "Ox cart", element: "Earth", quality: "Fixed", ruler: "Moon", keywords: ["Growth", "Fertility", "Beauty"] },
  { name: "Mrigashira", deity: "Soma", symbol: "Deer's head", element: "Earth", quality: "Soft", ruler: "Mars", keywords: ["Seeking", "Gentleness", "Curiosity"] },
  { name: "Ardra", deity: "Rudra", symbol: "Teardrop", element: "Water", quality: "Sharp", ruler: "Rahu", keywords: ["Storm", "Transformation", "Clarity"] },
  { name: "Punarvasu", deity: "Aditi", symbol: "Bow and quiver", element: "Water", quality: "Movable", ruler: "Jupiter", keywords: ["Renewal", "Return", "Abundance"] },
  { name: "Pushya", deity: "Brihaspati", symbol: "Udder of cow", element: "Water", quality: "Light", ruler: "Saturn", keywords: ["Nourishment", "Spirituality", "Protection"] },
  { name: "Ashlesha", deity: "Nagas", symbol: "Serpent", element: "Water", quality: "Sharp", ruler: "Mercury", keywords: ["Kundalini", "Wisdom", "Penetration"] },
  { name: "Magha", deity: "Pitris", symbol: "Throne", element: "Water", quality: "Fierce", ruler: "Ketu", keywords: ["Ancestry", "Authority", "Tradition"] },
  { name: "Purva Phalguni", deity: "Bhaga", symbol: "Front legs of bed", element: "Water", quality: "Fierce", ruler: "Venus", keywords: ["Pleasure", "Creativity", "Relaxation"] },
  { name: "Uttara Phalguni", deity: "Aryaman", symbol: "Back legs of bed", element: "Fire", quality: "Fixed", ruler: "Sun", keywords: ["Partnership", "Generosity", "Patronage"] },
  { name: "Hasta", deity: "Savitar", symbol: "Hand", element: "Fire", quality: "Light", ruler: "Moon", keywords: ["Skill", "Craft", "Manifestation"] },
  { name: "Chitra", deity: "Vishvakarma", symbol: "Bright jewel", element: "Fire", quality: "Soft", ruler: "Mars", keywords: ["Beauty", "Artistry", "Illusion"] },
  { name: "Swati", deity: "Vayu", symbol: "Young plant", element: "Fire", quality: "Movable", ruler: "Rahu", keywords: ["Independence", "Flexibility", "Commerce"] },
  { name: "Vishakha", deity: "Indra-Agni", symbol: "Triumphal arch", element: "Fire", quality: "Mixed", ruler: "Jupiter", keywords: ["Purpose", "Determination", "Achievement"] },
  { name: "Anuradha", deity: "Mitra", symbol: "Lotus", element: "Water", quality: "Soft", ruler: "Saturn", keywords: ["Friendship", "Devotion", "Success"] },
  { name: "Jyeshtha", deity: "Indra", symbol: "Earring", element: "Air", quality: "Sharp", ruler: "Mercury", keywords: ["Seniority", "Protection", "Power"] },
  { name: "Mula", deity: "Nirriti", symbol: "Roots", element: "Air", quality: "Sharp", ruler: "Ketu", keywords: ["Foundation", "Investigation", "Destruction"] },
  { name: "Purva Ashadha", deity: "Apas", symbol: "Elephant tusk", element: "Air", quality: "Fierce", ruler: "Venus", keywords: ["Invincibility", "Purification", "Victory"] },
  { name: "Uttara Ashadha", deity: "Vishvadevas", symbol: "Planks of bed", element: "Air", quality: "Fixed", ruler: "Sun", keywords: ["Permanence", "Leadership", "Righteousness"] },
  { name: "Shravana", deity: "Vishnu", symbol: "Ear", element: "Air", quality: "Movable", ruler: "Moon", keywords: ["Listening", "Learning", "Connection"] },
  { name: "Dhanishta", deity: "Vasus", symbol: "Drum", element: "Ether", quality: "Movable", ruler: "Mars", keywords: ["Abundance", "Music", "Adaptability"] },
  { name: "Shatabhisha", deity: "Varuna", symbol: "Empty circle", element: "Ether", quality: "Movable", ruler: "Rahu", keywords: ["Healing", "Mystery", "Independence"] },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", symbol: "Front of funeral cot", element: "Ether", quality: "Fierce", ruler: "Jupiter", keywords: ["Intensity", "Renunciation", "Transformation"] },
  { name: "Uttara Bhadrapada", deity: "Ahir Budhnya", symbol: "Back of funeral cot", element: "Ether", quality: "Fixed", ruler: "Saturn", keywords: ["Depth", "Wisdom", "Liberation"] },
  { name: "Revati", deity: "Pushan", symbol: "Drum for keeping time", element: "Ether", quality: "Soft", ruler: "Mercury", keywords: ["Nourishment", "Journey's end", "Prosperity"] }
];
var DASHA_PERIODS = [
  { planet: "Ketu", years: 7 },
  { planet: "Venus", years: 20 },
  { planet: "Sun", years: 6 },
  { planet: "Moon", years: 10 },
  { planet: "Mars", years: 7 },
  { planet: "Rahu", years: 18 },
  { planet: "Jupiter", years: 16 },
  { planet: "Saturn", years: 19 },
  { planet: "Mercury", years: 17 }
];
function tropicalToSidereal(tropicalLongitude) {
  let sidereal = tropicalLongitude - AYANAMSA_2025;
  if (sidereal < 0) sidereal += 360;
  return sidereal % 360;
}
function getVedicSign(siderealLongitude) {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ];
  const signIndex = Math.floor(siderealLongitude / 30);
  return signs[signIndex % 12];
}
function calculateNakshatra(siderealLongitude) {
  const nakshatraSize = 13.333333;
  const nakshatraIndex = Math.floor(siderealLongitude / nakshatraSize);
  const positionInNakshatra = siderealLongitude % nakshatraSize;
  const pada = Math.floor(positionInNakshatra / (nakshatraSize / 4)) + 1;
  return {
    index: nakshatraIndex,
    pada,
    data: NAKSHATRAS[nakshatraIndex]
  };
}
function calculateDashas(birthDate, moonSiderealLongitude) {
  const birth = new Date(birthDate);
  const moonNakshatra = calculateNakshatra(moonSiderealLongitude);
  const nakshatraRuler = moonNakshatra.data.ruler;
  const startDashaIndex = DASHA_PERIODS.findIndex((d) => d.planet === nakshatraRuler);
  const nakshatraSize = 13.333333;
  const positionInNakshatra = moonSiderealLongitude % nakshatraSize;
  const proportionCompleted = positionInNakshatra / nakshatraSize;
  const allDashas = [];
  let currentDate = new Date(birth);
  const firstDasha = DASHA_PERIODS[startDashaIndex];
  const remainingYears = firstDasha.years * (1 - proportionCompleted);
  const firstEndDate = new Date(birth);
  firstEndDate.setFullYear(firstEndDate.getFullYear() + remainingYears);
  allDashas.push({
    planet: firstDasha.planet,
    startDate: new Date(birth),
    endDate: firstEndDate,
    years: remainingYears
  });
  currentDate = firstEndDate;
  for (let i = 1; i < DASHA_PERIODS.length; i++) {
    const dashaIndex = (startDashaIndex + i) % DASHA_PERIODS.length;
    const dasha = DASHA_PERIODS[dashaIndex];
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + dasha.years);
    allDashas.push({
      planet: dasha.planet,
      startDate: new Date(currentDate),
      endDate,
      years: dasha.years
    });
    currentDate = endDate;
  }
  const now = /* @__PURE__ */ new Date();
  const currentDasha = allDashas.find((d) => d.startDate <= now && d.endDate >= now) || allDashas[0];
  return { current: currentDasha, all: allDashas.slice(0, 5) };
}
function getVedicPlanetInterpretation(planet, sign, nakshatra) {
  const interpretations2 = {
    sun: {
      title: `${sign} Sun in ${nakshatra.name}`,
      description: `Your soul's divine essence expresses through ${sign} energy, refined by the spiritual qualities of ${nakshatra.name}. This placement reveals your dharma (life purpose) and how you shine your light in the world.`,
      spiritualMeaning: `The Sun in ${nakshatra.name} nakshatra indicates a soul journey focused on ${nakshatra.keywords.join(", ")}. Your inner deity ${nakshatra.deity} guides your path.`,
      karmaLessons: [`Integrate ${sign} qualities with ${nakshatra.name} wisdom`, `Honor ${nakshatra.deity} through righteous action`, `Express ${nakshatra.keywords[0]} in your life purpose`]
    },
    moon: {
      title: `${sign} Moon in ${nakshatra.name}`,
      description: `Your emotional nature and mind are colored by ${nakshatra.name} nakshatra in ${sign}. This is your Janma Nakshatra (birth star), the most important placement in Vedic astrology.`,
      spiritualMeaning: `Born under ${nakshatra.name}, ruled by ${nakshatra.ruler}, your mind seeks ${nakshatra.keywords.join(" and ")}. The deity ${nakshatra.deity} blesses your emotional journey.`,
      karmaLessons: [`Cultivate ${nakshatra.keywords[0]} in daily life`, `Work with ${nakshatra.ruler} energy for mental peace`, `Honor the ${nakshatra.symbol} as your sacred symbol`]
    },
    mars: {
      title: `${sign} Mars in ${nakshatra.name}`,
      description: `Your courage, action, and warrior spirit manifest through ${sign} filtered through ${nakshatra.name}'s spiritual lens.`,
      spiritualMeaning: `Mars in ${nakshatra.name} shows how you take action aligned with ${nakshatra.keywords.join(", ")}.`,
      karmaLessons: [`Channel warrior energy through ${nakshatra.keywords[0]}`, `Balance action with ${nakshatra.deity}'s wisdom`, `Use ${sign} courage for dharmic purposes`]
    }
  };
  return interpretations2[planet] || {
    title: `${sign} ${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${nakshatra.name}`,
    description: `This placement brings ${nakshatra.keywords.join(", ")} energy to your ${planet} expression.`,
    spiritualMeaning: `${nakshatra.deity} guides your ${planet} journey through ${nakshatra.name}.`,
    karmaLessons: [`Integrate ${nakshatra.keywords[0]} into ${planet} expression`]
  };
}
function calculateVedicAstrology(params) {
  const { birthDate, birthTime, timezone, latitude, longitude } = params;
  const dateTimeParts = `${birthDate}T${birthTime}`;
  const zonedDate = fromZonedTime3(new Date(dateTimeParts), timezone);
  const sunEcl = Astronomy3.Ecliptic(Astronomy3.SunPosition(zonedDate));
  const moonEcl = Astronomy3.EclipticGeoMoon(zonedDate);
  const mercuryVec = Astronomy3.GeoVector(Astronomy3.Body.Mercury, zonedDate, false);
  const mercuryEcl = Astronomy3.Ecliptic(mercuryVec);
  const venusVec = Astronomy3.GeoVector(Astronomy3.Body.Venus, zonedDate, false);
  const venusEcl = Astronomy3.Ecliptic(venusVec);
  const marsVec = Astronomy3.GeoVector(Astronomy3.Body.Mars, zonedDate, false);
  const marsEcl = Astronomy3.Ecliptic(marsVec);
  const jupiterVec = Astronomy3.GeoVector(Astronomy3.Body.Jupiter, zonedDate, false);
  const jupiterEcl = Astronomy3.Ecliptic(jupiterVec);
  const saturnVec = Astronomy3.GeoVector(Astronomy3.Body.Saturn, zonedDate, false);
  const saturnEcl = Astronomy3.Ecliptic(saturnVec);
  const moonLongitude = moonEcl.lon;
  const rahuLongitude = (moonLongitude + 90) % 360;
  const ketuLongitude = (rahuLongitude + 180) % 360;
  const observer = { latitude, longitude, height: 0 };
  const siderealTime = Astronomy3.SiderealTime(zonedDate);
  const ascendantTropical = siderealTime * 15;
  const ascendantSidereal = tropicalToSidereal(ascendantTropical);
  const processPlanet = (name, tropicalLon) => {
    const siderealLon = tropicalToSidereal(tropicalLon);
    const sign = getVedicSign(siderealLon);
    const degree = siderealLon % 30;
    const nakshatra = calculateNakshatra(siderealLon);
    return {
      tropicalLongitude: tropicalLon,
      siderealLongitude: siderealLon,
      sign,
      degree,
      nakshatra: {
        name: nakshatra.data.name,
        pada: nakshatra.pada,
        deity: nakshatra.data.deity,
        symbol: nakshatra.data.symbol,
        ruler: nakshatra.data.ruler,
        keywords: nakshatra.data.keywords
      },
      interpretation: getVedicPlanetInterpretation(name, sign, nakshatra.data)
    };
  };
  const moonSidereal = tropicalToSidereal(moonEcl.lon);
  const moonNakshatra = calculateNakshatra(moonSidereal);
  const ascendantNakshatra = calculateNakshatra(ascendantSidereal);
  const dashas = calculateDashas(birthDate, moonSidereal);
  return {
    moonNakshatra: {
      name: moonNakshatra.data.name,
      pada: moonNakshatra.pada,
      deity: moonNakshatra.data.deity,
      symbol: moonNakshatra.data.symbol,
      ruler: moonNakshatra.data.ruler,
      interpretation: `Born under ${moonNakshatra.data.name} nakshatra, your mind and emotions are blessed by ${moonNakshatra.data.deity}. This lunar mansion brings ${moonNakshatra.data.keywords.join(", ")} to your spiritual journey.`
    },
    ascendantNakshatra: {
      name: ascendantNakshatra.data.name,
      pada: ascendantNakshatra.pada,
      deity: ascendantNakshatra.data.deity,
      symbol: ascendantNakshatra.data.symbol,
      ruler: ascendantNakshatra.data.ruler
    },
    planets: {
      sun: processPlanet("sun", sunEcl.lon),
      moon: processPlanet("moon", moonEcl.lon),
      mercury: processPlanet("mercury", mercuryEcl.lon),
      venus: processPlanet("venus", venusEcl.lon),
      mars: processPlanet("mars", marsEcl.lon),
      jupiter: processPlanet("jupiter", jupiterEcl.lon),
      saturn: processPlanet("saturn", saturnEcl.lon),
      rahu: processPlanet("rahu", rahuLongitude),
      ketu: processPlanet("ketu", ketuLongitude)
    },
    currentDasha: dashas.current,
    allDashas: dashas.all,
    rashiChart: {
      ascendant: getVedicSign(ascendantSidereal),
      houses: Array.from({ length: 12 }, (_, i) => getVedicSign((ascendantSidereal + i * 30) % 360))
    },
    interpretation: {
      summary: `In Vedic astrology, your ${moonNakshatra.data.name} Moon nakshatra reveals your deepest nature. Currently in ${dashas.current.planet} dasha, this planetary period shapes your life experiences.`,
      dharma: `Your life purpose (dharma) is illuminated by ${moonNakshatra.data.deity}, guiding you toward ${moonNakshatra.data.keywords[0]}.`,
      karma: `Karmic patterns from past lives manifest through ${moonNakshatra.data.name}, teaching lessons of ${moonNakshatra.data.keywords.join(" and ")}.`,
      artha: `Wealth and resources flow when you align with ${dashas.current.planet} dasha energies and honor ${moonNakshatra.data.ruler}.`,
      moksha: `Spiritual liberation comes through transcending ${moonNakshatra.data.name}'s lessons and embracing ${moonNakshatra.data.deity}'s grace.`
    }
  };
}

// server/services/gene-keys.ts
var GENE_KEYS = [
  {
    number: 1,
    name: "From Entropy to Syntropy",
    shadow: { name: "Entropy", description: "The fear that leads to decay and disorder", reactive: "Chaos and breakdown" },
    gift: { name: "Freshness", description: "Living moment to moment with creative renewal", active: "Creative innovation" },
    siddhi: { name: "Beauty", description: "Recognizing the perfection in all things", transcendent: "Divine aesthetics" },
    codon: "ATG",
    aminoAcid: "Methionine",
    programming: "Golden Path"
  },
  {
    number: 2,
    name: "Returning to the One",
    shadow: { name: "Dislocation", description: "Feeling separate and disconnected", reactive: "Loneliness and seeking" },
    gift: { name: "Orientation", description: "Knowing your direction in life", active: "Inner compass" },
    siddhi: { name: "Unity", description: "Experiencing oneness with all", transcendent: "Cosmic consciousness" },
    codon: "TAG",
    aminoAcid: "Stop",
    programming: "Golden Path"
  },
  {
    number: 3,
    name: "Through the Darkness Comes the Light",
    shadow: { name: "Chaos", description: "Confusion and mutation pressure", reactive: "Restless change" },
    gift: { name: "Innovation", description: "Breakthrough thinking and adaptation", active: "Revolutionary insights" },
    siddhi: { name: "Innocence", description: "Complete trust in the unknown", transcendent: "Divine play" },
    codon: "TCC",
    aminoAcid: "Serine",
    programming: "Venus Sequence"
  },
  {
    number: 4,
    name: "A Universal Panacea",
    shadow: { name: "Intolerance", description: "Mental rigidity and judgment", reactive: "Closed mind" },
    gift: { name: "Understanding", description: "Mental clarity and insight", active: "Comprehension" },
    siddhi: { name: "Forgiveness", description: "Unconditional acceptance", transcendent: "Divine mercy" },
    codon: "CAC",
    aminoAcid: "Histidine",
    programming: "Pearl Sequence"
  },
  {
    number: 5,
    name: "The Pulse of Life",
    shadow: { name: "Impatience", description: "Rushing and forcing timing", reactive: "Hurry and stress" },
    gift: { name: "Patience", description: "Surrendering to divine timing", active: "Natural rhythm" },
    siddhi: { name: "Timelessness", description: "Transcending linear time", transcendent: "Eternal now" },
    codon: "TCA",
    aminoAcid: "Serine",
    programming: "Golden Path"
  },
  {
    number: 6,
    name: "The Path of Peace",
    shadow: { name: "Conflict", description: "Inner and outer friction", reactive: "War and struggle" },
    gift: { name: "Diplomacy", description: "Harmonizing opposites", active: "Peace-making" },
    siddhi: { name: "Peace", description: "Absolute tranquility", transcendent: "Divine stillness" },
    codon: "AAC",
    aminoAcid: "Asparagine",
    programming: "Venus Sequence"
  },
  {
    number: 7,
    name: "Virtue is Its Own Reward",
    shadow: { name: "Division", description: "Separation and elitism", reactive: "Hierarchy" },
    gift: { name: "Guidance", description: "Leading by example", active: "Natural leadership" },
    siddhi: { name: "Virtue", description: "Living truth itself", transcendent: "Divine righteousness" },
    codon: "TGT",
    aminoAcid: "Cysteine",
    programming: "Golden Path"
  },
  {
    number: 8,
    name: "Diamond of the Self",
    shadow: { name: "Mediocrity", description: "Settling for less", reactive: "Bland conformity" },
    gift: { name: "Style", description: "Unique self-expression", active: "Authenticity" },
    siddhi: { name: "Exquisiteness", description: "Perfected presence", transcendent: "Divine refinement" },
    codon: "GAT",
    aminoAcid: "Aspartic acid",
    programming: "Venus Sequence"
  },
  {
    number: 9,
    name: "The Power of the Infinitesimal",
    shadow: { name: "Inertia", description: "Stuck in patterns", reactive: "Resistance to change" },
    gift: { name: "Determination", description: "Focused persistence", active: "Unwavering will" },
    siddhi: { name: "Invincibility", description: "Unstoppable life force", transcendent: "Divine power" },
    codon: "AGC",
    aminoAcid: "Serine",
    programming: "Pearl Sequence"
  },
  {
    number: 10,
    name: "Being at Ease",
    shadow: { name: "Self-Obsession", description: "Ego fixation", reactive: "Narcissism" },
    gift: { name: "Naturalness", description: "Authentic being", active: "Effortless presence" },
    siddhi: { name: "Being", description: "Pure existence", transcendent: "I Am" },
    codon: "GCC",
    aminoAcid: "Alanine",
    programming: "Golden Path"
  }
  // Note: Abbreviated to 10 keys for brevity - full implementation would include all 64
];
function getGeneKey(gateNumber) {
  if (gateNumber <= 10) {
    return GENE_KEYS[gateNumber - 1];
  }
  return {
    number: gateNumber,
    name: `Gene Key ${gateNumber}`,
    shadow: { name: "Shadow", description: "The reactive frequency", reactive: "Low consciousness" },
    gift: { name: "Gift", description: "The active frequency", active: "Creative consciousness" },
    siddhi: { name: "Siddhi", description: "The transcendent frequency", transcendent: "Divine consciousness" },
    codon: "XXX",
    aminoAcid: "Unknown",
    programming: "Golden Path"
  };
}
function assessGeneKeyLevel(enneagramType, mbti) {
  if (enneagramType && [4, 5, 9].includes(enneagramType)) {
    return "Gift";
  }
  if (mbti && (mbti.includes("N") && mbti.includes("F"))) {
    return "Gift";
  }
  return "Shadow";
}
function calculateGeneKeys(sunGate, earthGate, moonGate, personalityData) {
  const lifeWorkKey = getGeneKey(sunGate);
  const evolutionKey = getGeneKey(earthGate);
  const radianceKey = getGeneKey(moonGate);
  const purposeKey = getGeneKey((sunGate + earthGate) % 64 || 1);
  const currentLevel = assessGeneKeyLevel(
    personalityData?.enneagram?.type,
    personalityData?.mbti?.type
  );
  return {
    lifeWork: {
      key: lifeWorkKey,
      sequence: "Golden Path",
      currentLevel,
      guidance: `Your life's work emanates from Gene Key ${lifeWorkKey.number}: ${lifeWorkKey.name}. Transform the shadow of ${lifeWorkKey.shadow.name} into the gift of ${lifeWorkKey.gift.name}, ultimately reaching the siddhi of ${lifeWorkKey.siddhi.name}.`
    },
    evolution: {
      key: evolutionKey,
      sequence: "Venus Sequence",
      currentLevel,
      guidance: `Your evolution path is through Gene Key ${evolutionKey.number}. The shadow ${evolutionKey.shadow.name} is your teacher, the gift ${evolutionKey.gift.name} is your service, and ${evolutionKey.siddhi.name} is your destiny.`
    },
    radiance: {
      key: radianceKey,
      sequence: "Pearl Sequence",
      currentLevel,
      guidance: `Your radiance shines through Gene Key ${radianceKey.number}. When you transmute ${radianceKey.shadow.name} into ${radianceKey.gift.name}, you illuminate ${radianceKey.siddhi.name} for all.`
    },
    purpose: {
      key: purposeKey,
      sequence: "Golden Path",
      currentLevel,
      guidance: `Your higher purpose integrates Gene Key ${purposeKey.number}, weaving together your life's work and evolution into ${purposeKey.siddhi.name}.`
    },
    interpretation: {
      goldenPath: `The Golden Path reveals your life's work through the transformation from ${lifeWorkKey.shadow.name} to ${lifeWorkKey.siddhi.name}. This is your primary evolutionary journey.`,
      venusSequence: `The Venus Sequence illuminates your relationships and how you love. Through ${evolutionKey.name}, you learn to give and receive love at higher frequencies.`,
      pearlSequence: `The Pearl Sequence shows your prosperity consciousness. ${radianceKey.name} is the key to unlocking abundance through spiritual alignment.`,
      synthesis: `Your Gene Keys profile creates a holographic pattern: Life Work (GK${lifeWorkKey.number}), Evolution (GK${evolutionKey.number}), and Radiance (GK${radianceKey.number}) form a trinity of transformation. As you contemplate each shadow and activate each gift, you move toward the siddhis - enlightened states of consciousness.`
    }
  };
}

// server/services/i-ching.ts
var HEXAGRAMS = [
  {
    number: 1,
    chinese: "\u4E7E",
    name: "The Creative",
    judgment: "The Creative works supreme success, furthering through perseverance.",
    image: "The movement of heaven is full of power. Thus the superior person makes themselves strong and untiring.",
    interpretation: "Pure yang energy, creative force, initiation, leadership. This hexagram represents the primal power of the universe.",
    lines: {
      1: { text: "Hidden dragon. Do not act.", meaning: "Potential not yet ready to emerge" },
      2: { text: "Dragon appearing in the field.", meaning: "First manifestation of power" },
      3: { text: "All day long working creatively.", meaning: "Sustained creative effort" },
      4: { text: "Wavering flight over the depths.", meaning: "Testing new heights" },
      5: { text: "Flying dragon in the heavens.", meaning: "Full expression of power" },
      6: { text: "Arrogant dragon will have cause to repent.", meaning: "Excess leads to downfall" }
    },
    keywords: ["Creativity", "Heaven", "Initiative", "Yang", "Leadership"],
    element: "Metal",
    trigrams: { upper: "Heaven", lower: "Heaven" }
  },
  {
    number: 2,
    chinese: "\u5764",
    name: "The Receptive",
    judgment: "The Receptive brings supreme success through the perseverance of a mare.",
    image: "The earth's condition is receptive devotion. Thus the superior person with breadth of character carries the outer world.",
    interpretation: "Pure yin energy, receptivity, nourishment, support. Yielding strength that sustains all things.",
    lines: {
      1: { text: "When there is hoarfrost underfoot, solid ice is not far off.", meaning: "Early signs of change" },
      2: { text: "Straight, square, great. Without purpose, yet nothing remains unfurthered.", meaning: "Natural order prevails" },
      3: { text: "Hidden lines. One is able to remain persevering.", meaning: "Quiet strength endures" },
      4: { text: "A tied-up sack. No blame, no praise.", meaning: "Discretion and restraint" },
      5: { text: "A yellow lower garment brings supreme good fortune.", meaning: "Humble excellence" },
      6: { text: "Dragons fight in the meadow. Their blood is black and yellow.", meaning: "Conflict between extremes" }
    },
    keywords: ["Receptivity", "Earth", "Yielding", "Yin", "Support"],
    element: "Earth",
    trigrams: { upper: "Earth", lower: "Earth" }
  },
  {
    number: 3,
    chinese: "\u5C6F",
    name: "Difficulty at the Beginning",
    judgment: "Difficulty at the beginning works supreme success through perseverance.",
    image: "Clouds and thunder: the image of difficulty at the beginning. Thus the superior person brings order out of confusion.",
    interpretation: "New beginnings face obstacles. Like a blade of grass pushing through earth, growth requires perseverance.",
    lines: {
      1: { text: "Hesitation and hindrance.", meaning: "Initial resistance to movement" },
      2: { text: "Difficulties pile up.", meaning: "Challenges accumulate" },
      3: { text: "Whoever hunts deer without the forester only loses their way in the forest.", meaning: "Need for guidance" },
      4: { text: "Horse and wagon part.", meaning: "Temporary setback" },
      5: { text: "Difficulties in blessing.", meaning: "Hidden opportunity" },
      6: { text: "Horse and wagon part. Bloody tears flow.", meaning: "Deep struggle" }
    },
    keywords: ["Beginning", "Difficulty", "Growth", "Perseverance", "Chaos"],
    element: "Water",
    trigrams: { upper: "Water", lower: "Thunder" }
  }
  // Abbreviated to 3 hexagrams - full system would include all 64
];
function calculateBirthHexagram(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hexagramNumber = (day + month + year) % 64 || 1;
  const changingLines = [];
  if (day % 2 === 0) changingLines.push(1);
  if (month % 3 === 0) changingLines.push(3);
  if (year % 5 === 0) changingLines.push(5);
  return { hexagramNumber, changingLines };
}
function calculateDailyHexagram(currentDate = /* @__PURE__ */ new Date()) {
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  return (day + month + year) % 64 || 1;
}
function getHexagram(number) {
  if (number <= 3) {
    return HEXAGRAMS[number - 1];
  }
  return {
    number,
    chinese: "\u5F85\u5B9A",
    name: `Hexagram ${number}`,
    judgment: "The situation calls for contemplation.",
    image: "The wise person reflects on the patterns of change.",
    interpretation: "Each hexagram reveals a pattern in the eternal dance of yin and yang.",
    lines: {
      1: { text: "Beginning", meaning: "The situation begins" },
      2: { text: "Development", meaning: "The situation develops" },
      3: { text: "Midpoint", meaning: "The situation reaches its center" },
      4: { text: "Transition", meaning: "The situation transforms" },
      5: { text: "Culmination", meaning: "The situation peaks" },
      6: { text: "Completion", meaning: "The situation concludes" }
    },
    keywords: ["Change", "Transformation", "Wisdom"],
    element: "Unknown",
    trigrams: { upper: "Unknown", lower: "Unknown" }
  };
}
function calculateIChing(birthDate) {
  const birthCalc = calculateBirthHexagram(birthDate);
  const birthHexagram = getHexagram(birthCalc.hexagramNumber);
  let futureHexagram;
  if (birthCalc.changingLines.length > 0) {
    const futureNumber = (birthCalc.hexagramNumber + birthCalc.changingLines.length) % 64 || 1;
    futureHexagram = {
      hexagram: getHexagram(futureNumber),
      interpretation: `Your path transforms toward ${getHexagram(futureNumber).name}. The changing lines indicate evolution in your life pattern.`
    };
  }
  const dailyNumber = calculateDailyHexagram();
  const dailyHexagram = {
    hexagram: getHexagram(dailyNumber),
    guidance: `Today's hexagram ${dailyNumber} (${getHexagram(dailyNumber).name}) advises: ${getHexagram(dailyNumber).judgment}`
  };
  return {
    birthHexagram: {
      hexagram: birthHexagram,
      interpretation: birthHexagram.interpretation,
      personalGuidance: `Born under Hexagram ${birthHexagram.number} (${birthHexagram.chinese} ${birthHexagram.name}), your life embodies ${birthHexagram.keywords.join(", ")}. ${birthHexagram.judgment}`
    },
    changingLines: birthCalc.changingLines,
    futureHexagram,
    dailyHexagram,
    lifeLesson: `The I Ching teaches you the wisdom of ${birthHexagram.name}. ${birthHexagram.image}`
  };
}

// server/services/chinese-astrology.ts
var ANIMALS = [
  { name: "Rat", element: "Water", yin: true, traits: ["Clever", "Resourceful", "Adaptable"], years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020] },
  { name: "Ox", element: "Earth", yin: true, traits: ["Patient", "Reliable", "Strong"], years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021] },
  { name: "Tiger", element: "Wood", yang: true, traits: ["Brave", "Confident", "Competitive"], years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022] },
  { name: "Rabbit", element: "Wood", yin: true, traits: ["Gentle", "Elegant", "Diplomatic"], years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023] },
  { name: "Dragon", element: "Earth", yang: true, traits: ["Powerful", "Charismatic", "Ambitious"], years: [1928, 1940, 1952, 1964, 1976, 1988, 2e3, 2012, 2024] },
  { name: "Snake", element: "Fire", yin: true, traits: ["Wise", "Intuitive", "Mysterious"], years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025] },
  { name: "Horse", element: "Fire", yang: true, traits: ["Energetic", "Independent", "Free-spirited"], years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026] },
  { name: "Goat", element: "Earth", yin: true, traits: ["Creative", "Gentle", "Compassionate"], years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027] },
  { name: "Monkey", element: "Metal", yang: true, traits: ["Clever", "Playful", "Curious"], years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028] },
  { name: "Rooster", element: "Metal", yin: true, traits: ["Confident", "Hardworking", "Observant"], years: [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029] },
  { name: "Dog", element: "Earth", yang: true, traits: ["Loyal", "Honest", "Protective"], years: [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030] },
  { name: "Pig", element: "Water", yin: true, traits: ["Generous", "Compassionate", "Diligent"], years: [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031] }
];
var ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];
function getAnimalFromYear(year) {
  const baseYear = 1924;
  const index2 = (year - baseYear) % 12;
  return ANIMALS[index2];
}
function getAnimalFromMonth(month) {
  const monthIndex = (month + 1) % 12;
  return ANIMALS[monthIndex];
}
function getDayElement(day) {
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const elementIndex = (day - 1) % 5;
  const polarity = day % 2 === 0 ? "Yang" : "Yin";
  const stems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
  const stemIndex = (day - 1) % 10;
  return {
    element: elements[elementIndex],
    polarity,
    stem: stems[stemIndex]
  };
}
function getCompatibility(animal) {
  const compatibility = {
    "Rat": { best: ["Dragon", "Monkey", "Ox"], challenging: ["Horse", "Rooster"] },
    "Ox": { best: ["Rat", "Snake", "Rooster"], challenging: ["Goat", "Horse"] },
    "Tiger": { best: ["Horse", "Dog", "Pig"], challenging: ["Monkey", "Snake"] },
    "Rabbit": { best: ["Goat", "Pig", "Dog"], challenging: ["Rooster", "Rat"] },
    "Dragon": { best: ["Rat", "Monkey", "Rooster"], challenging: ["Dog", "Dragon"] },
    "Snake": { best: ["Ox", "Rooster", "Monkey"], challenging: ["Pig", "Tiger"] },
    "Horse": { best: ["Tiger", "Goat", "Dog"], challenging: ["Rat", "Ox"] },
    "Goat": { best: ["Rabbit", "Horse", "Pig"], challenging: ["Ox", "Dog"] },
    "Monkey": { best: ["Rat", "Dragon", "Snake"], challenging: ["Tiger", "Pig"] },
    "Rooster": { best: ["Ox", "Snake", "Dragon"], challenging: ["Rabbit", "Dog"] },
    "Dog": { best: ["Tiger", "Rabbit", "Horse"], challenging: ["Dragon", "Goat"] },
    "Pig": { best: ["Rabbit", "Goat", "Tiger"], challenging: ["Snake", "Monkey"] }
  };
  return compatibility[animal] || { best: [], challenging: [] };
}
function calculateChineseAstrology(birthDate) {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const yearAnimal = getAnimalFromYear(year);
  const monthAnimal = getAnimalFromMonth(month);
  const dayMaster = getDayElement(day);
  const compatibility = getCompatibility(yearAnimal.name);
  const elementCycle = {
    "Wood": "Fire",
    "Fire": "Earth",
    "Earth": "Metal",
    "Metal": "Water",
    "Water": "Wood"
  };
  const luckyElements = [
    dayMaster.element,
    elementCycle[dayMaster.element],
    ELEMENTS[(ELEMENTS.indexOf(dayMaster.element) + 2) % 5]
  ];
  const polarity = yearAnimal.yin ? "Yin" : "Yang";
  return {
    yearAnimal: {
      name: yearAnimal.name,
      element: yearAnimal.element,
      polarity,
      traits: yearAnimal.traits,
      interpretation: `Born in the Year of the ${yearAnimal.name}, you embody ${yearAnimal.traits.join(", ")} qualities. Your ${yearAnimal.element} nature brings grounding and manifestation power.`
    },
    monthAnimal: {
      name: monthAnimal.name,
      element: monthAnimal.element
    },
    dayMaster: {
      element: dayMaster.element,
      polarity: dayMaster.polarity,
      stem: dayMaster.stem
    },
    luckyElements,
    compatibility,
    lifeStage: year % 12 < 4 ? "Growth" : year % 12 < 8 ? "Maturity" : "Wisdom",
    interpretation: {
      summary: `Your Chinese astrology profile reveals a ${yearAnimal.name} (${polarity}) with ${dayMaster.element} Day Master (${dayMaster.stem}). This combination creates a unique energetic signature.`,
      strengths: yearAnimal.traits,
      challenges: [`Balancing ${yearAnimal.element} and ${dayMaster.element} energies`, `Managing ${polarity} tendencies`],
      lifePath: `As a ${yearAnimal.name}, your path involves ${yearAnimal.traits[0].toLowerCase()} and ${yearAnimal.traits[1].toLowerCase()}. Your ${dayMaster.element} Day Master guides how you express this in the world.`
    }
  };
}

// server/services/kabbalah.ts
var SEFIROT = [
  { name: "Keter", hebrew: "\u05DB\u05B6\u05BC\u05EA\u05B6\u05E8", meaning: "Crown", attribute: "Divine Will", number: 1, color: "White/Brilliant", archangel: "Metatron", spiritualLesson: "Unity with the Divine", keywords: ["Unity", "Source", "Pure Being"] },
  { name: "Chokmah", hebrew: "\u05D7\u05B8\u05DB\u05B0\u05DE\u05B8\u05D4", meaning: "Wisdom", attribute: "Divine Wisdom", number: 2, color: "Gray", archangel: "Raziel", spiritualLesson: "Intuitive Insight", keywords: ["Wisdom", "Inspiration", "Flash of Insight"] },
  { name: "Binah", hebrew: "\u05D1\u05B4\u05BC\u05D9\u05E0\u05B8\u05D4", meaning: "Understanding", attribute: "Divine Understanding", number: 3, color: "Black", archangel: "Tzaphkiel", spiritualLesson: "Comprehension", keywords: ["Understanding", "Form", "Structure"] },
  { name: "Chesed", hebrew: "\u05D7\u05B6\u05E1\u05B6\u05D3", meaning: "Mercy", attribute: "Divine Love", number: 4, color: "Blue", archangel: "Tzadkiel", spiritualLesson: "Unconditional Love", keywords: ["Mercy", "Kindness", "Expansion"] },
  { name: "Gevurah", hebrew: "\u05D2\u05B0\u05BC\u05D1\u05D5\u05BC\u05E8\u05B8\u05D4", meaning: "Severity", attribute: "Divine Strength", number: 5, color: "Red", archangel: "Kamael", spiritualLesson: "Discipline & Boundaries", keywords: ["Strength", "Justice", "Discernment"] },
  { name: "Tiferet", hebrew: "\u05EA\u05B4\u05BC\u05E4\u05B0\u05D0\u05B6\u05E8\u05B6\u05EA", meaning: "Beauty", attribute: "Divine Beauty", number: 6, color: "Yellow/Gold", archangel: "Michael", spiritualLesson: "Balance & Harmony", keywords: ["Beauty", "Balance", "Truth"] },
  { name: "Netzach", hebrew: "\u05E0\u05B6\u05E6\u05B7\u05D7", meaning: "Victory", attribute: "Divine Eternity", number: 7, color: "Green", archangel: "Haniel", spiritualLesson: "Perseverance", keywords: ["Victory", "Endurance", "Nature"] },
  { name: "Hod", hebrew: "\u05D4\u05D5\u05B9\u05D3", meaning: "Glory", attribute: "Divine Splendor", number: 8, color: "Orange", archangel: "Raphael", spiritualLesson: "Gratitude & Surrender", keywords: ["Glory", "Intellect", "Communication"] },
  { name: "Yesod", hebrew: "\u05D9\u05B0\u05E1\u05D5\u05B9\u05D3", meaning: "Foundation", attribute: "Divine Foundation", number: 9, color: "Purple", archangel: "Gabriel", spiritualLesson: "Connection to Reality", keywords: ["Foundation", "Subconscious", "Dreams"] },
  { name: "Malkuth", hebrew: "\u05DE\u05B7\u05DC\u05B0\u05DB\u05D5\u05BC\u05EA", meaning: "Kingdom", attribute: "Divine Kingdom", number: 10, color: "Earth tones", archangel: "Sandalphon", spiritualLesson: "Manifestation", keywords: ["Kingdom", "Physical World", "Action"] }
];
var HEBREW_LETTERS = [
  { letter: "\u05D0", name: "Aleph", number: 1, meaning: "Ox", spiritual: "Divine breath, unity" },
  { letter: "\u05D1", name: "Bet", number: 2, meaning: "House", spiritual: "Duality, shelter" },
  { letter: "\u05D2", name: "Gimel", number: 3, meaning: "Camel", spiritual: "Movement, giving" },
  { letter: "\u05D3", name: "Dalet", number: 4, meaning: "Door", spiritual: "Gateway, humility" },
  { letter: "\u05D4", name: "Hey", number: 5, meaning: "Window", spiritual: "Revelation, breath" },
  { letter: "\u05D5", name: "Vav", number: 6, meaning: "Hook", spiritual: "Connection, truth" },
  { letter: "\u05D6", name: "Zayin", number: 7, meaning: "Sword", spiritual: "Spirit, struggle" },
  { letter: "\u05D7", name: "Chet", number: 8, meaning: "Fence", spiritual: "Life force, transcendence" },
  { letter: "\u05D8", name: "Tet", number: 9, meaning: "Serpent", spiritual: "Involution, goodness" }
];
function calculateGematria(name) {
  const hebrewValues = {
    "A": 1,
    "B": 2,
    "C": 3,
    "D": 4,
    "E": 5,
    "F": 6,
    "G": 7,
    "H": 8,
    "I": 9,
    "J": 10,
    "K": 20,
    "L": 30,
    "M": 40,
    "N": 50,
    "O": 60,
    "P": 70,
    "Q": 80,
    "R": 90,
    "S": 100,
    "T": 200,
    "U": 300,
    "V": 400,
    "W": 500,
    "X": 600,
    "Y": 700,
    "Z": 800
  };
  const value = name.toUpperCase().replace(/[^A-Z]/g, "").split("").reduce((sum, letter) => {
    return sum + (hebrewValues[letter] || 0);
  }, 0);
  let reduced = value;
  while (reduced > 9 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    reduced = reduced.toString().split("").reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return { value, reduced };
}
function calculateKabbalah(name, birthDate, lifePath2) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const sefirahIndex = (day - 1) % 10;
  const birthSefirah = SEFIROT[sefirahIndex];
  const pathSefirot = [
    birthSefirah,
    SEFIROT[(lifePath2 - 1) % 10],
    SEFIROT[5]
    // Tiferet - center of the tree
  ];
  const hebrewLetter = HEBREW_LETTERS[(lifePath2 - 1) % 9];
  const gematria = calculateGematria(name);
  const gematriaSefirah = SEFIROT[(gematria.reduced - 1) % 10];
  return {
    birthSefirah,
    pathSefirot,
    hebrewLetter,
    gematria: {
      nameValue: gematria.value,
      reducedValue: gematria.reduced,
      interpretation: `Your name's gematria value of ${gematria.value} reduces to ${gematria.reduced}, connecting you to ${gematriaSefirah.name} - ${gematriaSefirah.meaning}. This reveals your soul's numerical signature.`
    },
    treeOfLifePath: {
      from: birthSefirah,
      to: SEFIROT[5],
      // Tiferet
      lesson: `Your spiritual journey moves from ${birthSefirah.name} (${birthSefirah.meaning}) to Tiferet (Beauty), learning to balance ${birthSefirah.keywords.join(" and ")}.`
    },
    interpretation: {
      summary: `Born on the ${day}${day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} day, you embody ${birthSefirah.name} - ${birthSefirah.meaning}. Your soul's essence vibrates with ${birthSefirah.attribute}.`,
      spiritualPath: `Your path on the Tree of Life ascends through ${pathSefirot.map((s) => s.name).join(" \u2192 ")}, integrating ${birthSefirah.keywords[0]}, ${pathSefirot[1].keywords[0]}, and divine harmony.`,
      divineAttribute: `The divine attribute of ${birthSefirah.attribute} flows through you. Archangel ${birthSefirah.archangel} guides your spiritual unfoldment.`,
      lifePurpose: `Your soul's purpose is to manifest ${birthSefirah.spiritualLesson} in the physical world, bringing ${birthSefirah.color} light to all you touch.`
    }
  };
}

// server/services/mayan-astrology.ts
var DAY_SIGNS = [
  { name: "Imix", glyph: "\u{1F40A}", meaning: "Dragon/Crocodile", element: "Water", power: "Nurtures", action: "Being", essence: "Birth", keywords: ["Primal", "Nurturing", "Trust"] },
  { name: "Ik", glyph: "\u{1F32C}\uFE0F", meaning: "Wind", element: "Air", power: "Communicates", action: "Spirit", essence: "Breath", keywords: ["Communication", "Spirit", "Inspiration"] },
  { name: "Akbal", glyph: "\u{1F319}", meaning: "Night", element: "Earth", power: "Dreams", action: "Intuition", essence: "Abundance", keywords: ["Dreaming", "Mystery", "Abundance"] },
  { name: "Kan", glyph: "\u{1F33E}", meaning: "Seed", element: "Fire", power: "Targets", action: "Awareness", essence: "Flowering", keywords: ["Growth", "Potential", "Awareness"] },
  { name: "Chicchan", glyph: "\u{1F40D}", meaning: "Serpent", element: "Earth", power: "Survives", action: "Instinct", essence: "Life Force", keywords: ["Kundalini", "Vitality", "Passion"] },
  { name: "Cimi", glyph: "\u{1F480}", meaning: "Transformer", element: "Water", power: "Releases", action: "Surrender", essence: "Death/Rebirth", keywords: ["Transformation", "Release", "Transcendence"] },
  { name: "Manik", glyph: "\u{1F98C}", meaning: "Deer", element: "Air", power: "Knows", action: "Accomplishment", essence: "Healing", keywords: ["Healing", "Tools", "Completion"] },
  { name: "Lamat", glyph: "\u2B50", meaning: "Star/Rabbit", element: "Fire", power: "Harmonizes", action: "Elegance", essence: "Art", keywords: ["Beauty", "Harmony", "Venus"] },
  { name: "Muluc", glyph: "\u{1F4A7}", meaning: "Moon/Water", element: "Water", power: "Purifies", action: "Universal Water", essence: "Offering", keywords: ["Purification", "Emotion", "Flow"] },
  { name: "Oc", glyph: "\u{1F415}", meaning: "Dog", element: "Earth", power: "Loves", action: "Loyalty", essence: "Heart", keywords: ["Love", "Loyalty", "Guidance"] },
  { name: "Chuen", glyph: "\u{1F412}", meaning: "Monkey", element: "Air", power: "Plays", action: "Illusion", essence: "Magic", keywords: ["Play", "Creativity", "Magic"] },
  { name: "Eb", glyph: "\u{1F6E4}\uFE0F", meaning: "Road", element: "Fire", power: "Organizes", action: "Space", essence: "Abundance", keywords: ["Path", "Destiny", "Human"] },
  { name: "Ben", glyph: "\u{1F331}", meaning: "Reed/Corn", element: "Earth", power: "Channels", action: "Navigation", essence: "Pillar", keywords: ["Authority", "Growth", "Pillar"] },
  { name: "Ix", glyph: "\u{1F406}", meaning: "Jaguar", element: "Water", power: "Intuits", action: "Heart Intelligence", essence: "Magic", keywords: ["Shamanc", "Mysticism", "Feminine Power"] },
  { name: "Men", glyph: "\u{1F985}", meaning: "Eagle", element: "Air", power: "Creates", action: "Vision", essence: "Mind", keywords: ["Vision", "Mind", "Creation"] },
  { name: "Cib", glyph: "\u{1F54A}\uFE0F", meaning: "Owl/Vulture", element: "Fire", power: "Questions", action: "Fearlessness", essence: "Wisdom", keywords: ["Wisdom", "Ancient Knowledge", "Forgiveness"] },
  { name: "Caban", glyph: "\u{1F30D}", meaning: "Earth", element: "Earth", power: "Evolves", action: "Synchronicity", essence: "Navigation", keywords: ["Earth", "Movement", "Synchronicity"] },
  { name: "Etznab", glyph: "\u{1F52E}", meaning: "Mirror/Flint", element: "Water", power: "Reflects", action: "Endlessness", essence: "Reflection", keywords: ["Mirror", "Truth", "Reflection"] },
  { name: "Cauac", glyph: "\u26A1", meaning: "Storm", element: "Air", power: "Catalyzes", action: "Self-Generation", essence: "Transformation", keywords: ["Storm", "Transformation", "Energy"] },
  { name: "Ahau", glyph: "\u2600\uFE0F", meaning: "Sun/Lord", element: "Fire", power: "Enlightens", action: "Universal Fire", essence: "Ascension", keywords: ["Enlightenment", "Mastery", "Sun"] }
];
var TONES = [
  { number: 1, name: "Magnetic", purpose: "Unify", action: "Attract", essence: "Purpose" },
  { number: 2, name: "Lunar", purpose: "Polarize", action: "Challenge", essence: "Duality" },
  { number: 3, name: "Electric", purpose: "Activate", action: "Bond", essence: "Service" },
  { number: 4, name: "Self-Existing", purpose: "Define", action: "Measure", essence: "Form" },
  { number: 5, name: "Overtone", purpose: "Empower", action: "Command", essence: "Radiance" },
  { number: 6, name: "Rhythmic", purpose: "Organize", action: "Balance", essence: "Equality" },
  { number: 7, name: "Resonant", purpose: "Channel", action: "Inspire", essence: "Attunement" },
  { number: 8, name: "Galactic", purpose: "Harmonize", action: "Model", essence: "Integrity" },
  { number: 9, name: "Solar", purpose: "Pulse", action: "Realize", essence: "Intention" },
  { number: 10, name: "Planetary", purpose: "Perfect", action: "Produce", essence: "Manifestation" },
  { number: 11, name: "Spectral", purpose: "Dissolve", action: "Release", essence: "Liberation" },
  { number: 12, name: "Crystal", purpose: "Dedicate", action: "Universalize", essence: "Cooperation" },
  { number: 13, name: "Cosmic", purpose: "Endure", action: "Transcend", essence: "Presence" }
];
function calculateKin(birthDate) {
  const startDate = /* @__PURE__ */ new Date("1987-07-26");
  const birth = new Date(birthDate);
  const daysDiff = Math.floor((birth.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24));
  return (daysDiff % 260 + 260) % 260 || 260;
}
function calculateMayanAstrology(birthDate) {
  const kin = calculateKin(birthDate);
  const toneNumber = (kin - 1) % 13 + 1;
  const daySignIndex = (kin - 1) % 20;
  const daySign = DAY_SIGNS[daySignIndex];
  const galacticTone = TONES[toneNumber - 1];
  const wavespellIndex = Math.floor((kin - 1) / 13) % 20;
  const wavespell = {
    sign: DAY_SIGNS[wavespellIndex],
    theme: `Journey of ${DAY_SIGNS[wavespellIndex].name}`
  };
  const guide = DAY_SIGNS[(daySignIndex + toneNumber - 1) % 20];
  const challenge = DAY_SIGNS[(daySignIndex + 10) % 20];
  const occult = DAY_SIGNS[(19 - daySignIndex) % 20];
  const analog = DAY_SIGNS[(daySignIndex + 10) % 20];
  return {
    kin,
    daySign,
    galacticTone,
    wavespell,
    oracle: {
      guide,
      challenge,
      occult,
      analog
    },
    interpretation: {
      galacticSignature: `${galacticTone.name} ${daySign.name} - Kin ${kin}. Your galactic signature combines ${galacticTone.purpose.toLowerCase()} (${galacticTone.name} tone) with ${daySign.power.toLowerCase()} (${daySign.name} energy).`,
      lifePurpose: `Your purpose is to ${galacticTone.purpose.toLowerCase()} through ${daySign.action.toLowerCase()}. This manifests as ${daySign.essence.toLowerCase()} energy in the world.`,
      spiritualGifts: daySign.keywords,
      destiny: `Born in the ${wavespell.sign.name} wavespell, you are learning ${wavespell.sign.keywords[0].toLowerCase()} and ${wavespell.sign.keywords[1].toLowerCase()}. Your ${daySign.element} nature guides you to ${daySign.power.toLowerCase()}.`
    }
  };
}

// server/services/chakra-system.ts
var CHAKRAS = [
  {
    name: "Root",
    sanskrit: "Muladhara",
    location: "Base of spine",
    color: "Red",
    element: "Earth",
    frequency: 396,
    themes: ["Survival", "Security", "Grounding", "Foundation"],
    crystals: ["Red Jasper", "Black Tourmaline", "Hematite"],
    affirmation: "I am safe, secure, and grounded in my physical body."
  },
  {
    name: "Sacral",
    sanskrit: "Svadhisthana",
    location: "Below navel",
    color: "Orange",
    element: "Water",
    frequency: 417,
    themes: ["Creativity", "Sexuality", "Emotions", "Pleasure"],
    crystals: ["Carnelian", "Orange Calcite", "Sunstone"],
    affirmation: "I embrace my creativity and honor my emotions."
  },
  {
    name: "Solar Plexus",
    sanskrit: "Manipura",
    location: "Above navel",
    color: "Yellow",
    element: "Fire",
    frequency: 528,
    themes: ["Power", "Will", "Confidence", "Identity"],
    crystals: ["Citrine", "Tiger's Eye", "Yellow Jasper"],
    affirmation: "I am powerful, confident, and worthy."
  },
  {
    name: "Heart",
    sanskrit: "Anahata",
    location: "Center of chest",
    color: "Green",
    element: "Air",
    frequency: 639,
    themes: ["Love", "Compassion", "Connection", "Healing"],
    crystals: ["Rose Quartz", "Green Aventurine", "Emerald"],
    affirmation: "I give and receive love freely and unconditionally."
  },
  {
    name: "Throat",
    sanskrit: "Vishuddha",
    location: "Throat",
    color: "Blue",
    element: "Sound",
    frequency: 741,
    themes: ["Communication", "Expression", "Truth", "Voice"],
    crystals: ["Blue Lace Agate", "Aquamarine", "Lapis Lazuli"],
    affirmation: "I speak my truth clearly and authentically."
  },
  {
    name: "Third Eye",
    sanskrit: "Ajna",
    location: "Between eyebrows",
    color: "Indigo",
    element: "Light",
    frequency: 852,
    themes: ["Intuition", "Wisdom", "Vision", "Insight"],
    crystals: ["Amethyst", "Labradorite", "Fluorite"],
    affirmation: "I trust my intuition and inner wisdom."
  },
  {
    name: "Crown",
    sanskrit: "Sahasrara",
    location: "Top of head",
    color: "Violet/White",
    element: "Consciousness",
    frequency: 963,
    themes: ["Spirituality", "Unity", "Enlightenment", "Divine Connection"],
    crystals: ["Clear Quartz", "Selenite", "Amethyst"],
    affirmation: "I am connected to divine consciousness and infinite wisdom."
  }
];
function calculateChakraActivation(chakraIndex, astrology, numerology) {
  let level = 50;
  const planets = [];
  const chakraRulers = {
    0: ["Mars", "Saturn"],
    // Root - survival, structure
    1: ["Moon", "Venus"],
    // Sacral - emotions, pleasure
    2: ["Sun", "Mars"],
    // Solar Plexus - will, power
    3: ["Venus", "Moon"],
    // Heart - love, nurturing
    4: ["Mercury"],
    // Throat - communication
    5: ["Neptune", "Moon"],
    // Third Eye - intuition
    6: ["Uranus", "Neptune"]
    // Crown - spirituality
  };
  if (astrology?.sunSign) {
    const fireSigns = ["Aries", "Leo", "Sagittarius"];
    const earthSigns = ["Taurus", "Virgo", "Capricorn"];
    const airSigns = ["Gemini", "Libra", "Aquarius"];
    const waterSigns = ["Cancer", "Scorpio", "Pisces"];
    if (chakraIndex === 0 && earthSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
    if (chakraIndex === 1 && waterSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
    if (chakraIndex === 2 && fireSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
    if (chakraIndex === 4 && airSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
  }
  if (numerology?.lifePath) {
    const lpMap = { 1: 2, 2: 3, 3: 4, 4: 0, 5: 1, 6: 3, 7: 5, 8: 2, 9: 6 };
    if (lpMap[numerology.lifePath] === chakraIndex) {
      level += 15;
    }
  }
  let status;
  if (level < 40) status = "Blocked";
  else if (level > 75) status = "Overactive";
  else status = "Balanced";
  return { level: Math.min(100, level), status, planets };
}
function calculateChakraSystem(astrologyData, numerologyData, personalityData) {
  const activations = CHAKRAS.map((chakra, index2) => {
    const activation = calculateChakraActivation(index2, astrologyData, numerologyData);
    const recommendations = [];
    if (activation.status === "Blocked") {
      recommendations.push(`Meditate with ${chakra.crystals[0]} to open ${chakra.name} chakra`);
      recommendations.push(`Practice affirmation: "${chakra.affirmation}"`);
      recommendations.push(`Focus on ${chakra.themes[0].toLowerCase()} and ${chakra.themes[1].toLowerCase()}`);
    } else if (activation.status === "Overactive") {
      recommendations.push(`Ground ${chakra.name} chakra energy through ${CHAKRAS[0].element} practices`);
      recommendations.push(`Balance with opposite chakra meditation`);
    }
    return {
      chakra,
      activationLevel: activation.level,
      status: activation.status,
      planetaryInfluence: activation.planets,
      recommendations
    };
  });
  const dominantChakra = activations.reduce(
    (max, curr) => curr.activationLevel > max.activationLevel ? curr : max
  );
  const blockedChakras = activations.filter((a) => a.status === "Blocked");
  return {
    activations,
    dominantChakra,
    blockedChakras,
    interpretation: {
      summary: `Your dominant chakra is ${dominantChakra.chakra.name} (${dominantChakra.chakra.sanskrit}), activated at ${dominantChakra.activationLevel}%. This reveals your primary energy focus on ${dominantChakra.chakra.themes.join(", ").toLowerCase()}.`,
      energyFlow: blockedChakras.length === 0 ? "Your chakras show balanced energy flow, allowing spiritual energy to move freely through all centers." : `${blockedChakras.length} chakra(s) need attention: ${blockedChakras.map((c) => c.chakra.name).join(", ")}. Focus on clearing these blockages for optimal energy flow.`,
      spiritualPath: `Your ${dominantChakra.chakra.name} chakra dominance suggests a spiritual path centered on ${dominantChakra.chakra.themes[0].toLowerCase()}. The ${dominantChakra.chakra.element} element guides your practices.`,
      healingGuidance: [
        `Work with ${dominantChakra.chakra.color} light visualization`,
        `Chant the frequency ${dominantChakra.chakra.frequency} Hz for resonance`,
        ...dominantChakra.recommendations
      ]
    }
  };
}

// server/services/sacred-geometry.ts
var PLATONIC_SOLIDS = [
  { name: "Tetrahedron", element: "Fire", faces: 4, vertices: 4, edges: 6, meaning: "Manifestation and will", spiritualQuality: "Divine spark", chakraConnection: "Solar Plexus" },
  { name: "Hexahedron (Cube)", element: "Earth", faces: 6, vertices: 8, edges: 12, meaning: "Grounding and stability", spiritualQuality: "Foundation", chakraConnection: "Root" },
  { name: "Octahedron", element: "Air", faces: 8, vertices: 6, edges: 12, meaning: "Integration and balance", spiritualQuality: "Breath of life", chakraConnection: "Heart" },
  { name: "Dodecahedron", element: "Ether/Universe", faces: 12, vertices: 20, edges: 30, meaning: "Ascension and cosmic consciousness", spiritualQuality: "Divine blueprint", chakraConnection: "Crown" },
  { name: "Icosahedron", element: "Water", faces: 20, vertices: 12, edges: 30, meaning: "Flow and transformation", spiritualQuality: "Emotional wisdom", chakraConnection: "Sacral" }
];
function calculateFibonacci(n) {
  const fib = [1, 1];
  for (let i = 2; i < n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  return fib;
}
function calculateGoldenRatio(lifePath2) {
  const phi = 1.618033988749;
  return parseFloat((lifePath2 * phi).toFixed(3));
}
function calculateSacredGeometry(birthDate, lifePath2, name) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const birthSolidIndex = (day - 1) % 5;
  const birthSolid = PLATONIC_SOLIDS[birthSolidIndex];
  const lifePathSolidIndex = (lifePath2 - 1) % 5;
  const lifePathSolid = PLATONIC_SOLIDS[lifePathSolidIndex];
  const personalPhi = calculateGoldenRatio(lifePath2);
  const fibonacci = calculateFibonacci(10);
  const seedPatterns = [
    "Single seed - Unity",
    "Vesica Piscis - Duality",
    "Trinity - Three circles",
    "Four-fold - Stability",
    "Five-fold - Life force",
    "Six-fold - Creation complete",
    "Seven-fold - Mystical",
    "Eight-fold - Infinity",
    "Nine-fold - Completion",
    "Ten-fold - Manifestation",
    "Eleven-fold - Master gateway",
    "Twelve-fold - Cosmic order"
  ];
  const seedPattern = seedPatterns[(month - 1) % 12];
  const nameValue = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const activeVertices = [
    nameValue % 13 + 1,
    nameValue * 2 % 13 + 1,
    nameValue * 3 % 13 + 1
  ];
  return {
    birthSolid,
    lifePathSolid,
    goldenRatio: {
      personalPhi,
      fibonacci,
      spiralGuidance: `Your personal golden ratio of ${personalPhi} reveals your unique spiral of growth. You expand in Fibonacci sequence: ${fibonacci.slice(0, 7).join(", ")}...`
    },
    flowerOfLife: {
      seedPattern,
      expansionCycles: month,
      manifestation: `Your Flower of Life blooms in ${seedPattern} configuration, completing ${month} expansion cycles before manifesting in physical reality.`
    },
    metatronsCube: {
      activeVertices,
      energyFlow: `Vertices ${activeVertices.join(", ")} are illuminated in your Metatron's Cube, creating a unique energy flow pattern through the sacred geometric matrix.`
    },
    interpretation: {
      summary: `Born under the ${birthSolid.name} (${birthSolid.element} element), your geometric essence expresses through ${birthSolid.faces} faces of manifestation. Your life path resonates with the ${lifePathSolid.name}.`,
      geometricEssence: `The ${birthSolid.name} connects you to ${birthSolid.chakraConnection} chakra, teaching ${birthSolid.meaning}. Its ${birthSolid.faces} faces, ${birthSolid.vertices} vertices, and ${birthSolid.edges} edges create your sacred template.`,
      creationPattern: `You create through ${lifePathSolid.spiritualQuality}, following the ${lifePathSolid.name}'s blueprint. The golden ratio of ${personalPhi} guides your expansion.`,
      spiritualArchitecture: `Your soul's geometry combines ${birthSolid.element} (birth) with ${lifePathSolid.element} (destiny), creating a unique vibrational structure that interfaces with universal patterns.`
    }
  };
}

// server/services/runes.ts
var RUNES = [
  { name: "Fehu", symbol: "\u16A0", meaning: "Cattle/Wealth", element: "Fire", aett: "Freya", keywords: ["Abundance", "Prosperity", "Fulfillment"], interpretation: "Mobile wealth, new beginnings, success" },
  { name: "Uruz", symbol: "\u16A2", meaning: "Aurochs/Strength", element: "Earth", aett: "Freya", keywords: ["Strength", "Vitality", "Endurance"], interpretation: "Raw power, health, primal force" },
  { name: "Thurisaz", symbol: "\u16A6", meaning: "Giant/Thorn", element: "Fire", aett: "Freya", keywords: ["Protection", "Defense", "Breakthrough"], interpretation: "Protective force, gateway, challenge" },
  { name: "Ansuz", symbol: "\u16A8", meaning: "Divine Breath", element: "Air", aett: "Freya", keywords: ["Communication", "Wisdom", "Inspiration"], interpretation: "Divine messages, insight, signals" },
  { name: "Raidho", symbol: "\u16B1", meaning: "Journey/Wheel", element: "Air", aett: "Freya", keywords: ["Journey", "Movement", "Rhythm"], interpretation: "Travel, life path, natural order" },
  { name: "Kenaz", symbol: "\u16B2", meaning: "Torch", element: "Fire", aett: "Freya", keywords: ["Knowledge", "Creativity", "Illumination"], interpretation: "Inner fire, transformation, revelation" },
  { name: "Gebo", symbol: "\u16B7", meaning: "Gift", element: "Air", aett: "Freya", keywords: ["Partnership", "Exchange", "Balance"], interpretation: "Sacred gift, relationship, union" },
  { name: "Wunjo", symbol: "\u16B9", meaning: "Joy", element: "Earth", aett: "Freya", keywords: ["Joy", "Harmony", "Success"], interpretation: "Happiness, wellbeing, fellowship" },
  { name: "Hagalaz", symbol: "\u16BA", meaning: "Hail", element: "Ice", aett: "Heimdall", keywords: ["Disruption", "Change", "Challenge"], interpretation: "Uncontrolled forces, transformation" },
  { name: "Nauthiz", symbol: "\u16BE", meaning: "Need", element: "Fire", aett: "Heimdall", keywords: ["Necessity", "Constraint", "Resistance"], interpretation: "Need fire, constraint teaches" },
  { name: "Isa", symbol: "\u16C1", meaning: "Ice", element: "Ice", aett: "Heimdall", keywords: ["Stillness", "Patience", "Standstill"], interpretation: "Frozen potential, pause, reflection" },
  { name: "Jera", symbol: "\u16C3", meaning: "Harvest/Year", element: "Earth", aett: "Heimdall", keywords: ["Cycles", "Harvest", "Reward"], interpretation: "Natural timing, fruition, cycles" },
  { name: "Eihwaz", symbol: "\u16C7", meaning: "Yew Tree", element: "All", aett: "Heimdall", keywords: ["Endurance", "Protection", "Mysteries"], interpretation: "Spiritual strength, initiation" },
  { name: "Perthro", symbol: "\u16C8", meaning: "Dice Cup", element: "Water", aett: "Heimdall", keywords: ["Mystery", "Fate", "Hidden"], interpretation: "Fate, the unknown, occult" },
  { name: "Algiz", symbol: "\u16C9", meaning: "Elk/Protection", element: "Air", aett: "Heimdall", keywords: ["Protection", "Shield", "Connection"], interpretation: "Divine protection, higher self" },
  { name: "Sowilo", symbol: "\u16CB", meaning: "Sun", element: "Fire", aett: "Heimdall", keywords: ["Success", "Vitality", "Wholeness"], interpretation: "Life force, victory, clarity" },
  { name: "Tiwaz", symbol: "\u16CF", meaning: "Tyr (God)", element: "Air", aett: "Tyr", keywords: ["Justice", "Warrior", "Sacrifice"], interpretation: "Honor, leadership, right action" },
  { name: "Berkano", symbol: "\u16D2", meaning: "Birch", element: "Earth", aett: "Tyr", keywords: ["Birth", "Growth", "Nurturing"], interpretation: "Fertility, new beginnings, rebirth" },
  { name: "Ehwaz", symbol: "\u16D6", meaning: "Horse", element: "Earth", aett: "Tyr", keywords: ["Movement", "Progress", "Partnership"], interpretation: "Gradual progress, teamwork, trust" },
  { name: "Mannaz", symbol: "\u16D7", meaning: "Human", element: "Air", aett: "Tyr", keywords: ["Self", "Humanity", "Intelligence"], interpretation: "Human experience, social order" },
  { name: "Laguz", symbol: "\u16DA", meaning: "Water/Lake", element: "Water", aett: "Tyr", keywords: ["Flow", "Intuition", "Emotion"], interpretation: "Life energy, intuition, psychic" },
  { name: "Ingwaz", symbol: "\u16DC", meaning: "Fertility God", element: "Earth", aett: "Tyr", keywords: ["Gestation", "Potential", "Internal"], interpretation: "Seed time, potential, completion" },
  { name: "Dagaz", symbol: "\u16DE", meaning: "Day", element: "Fire/Air", aett: "Tyr", keywords: ["Breakthrough", "Awakening", "Dawn"], interpretation: "Transformation, breakthrough, clarity" },
  { name: "Othala", symbol: "\u16DF", meaning: "Ancestral Property", element: "Earth", aett: "Tyr", keywords: ["Heritage", "Home", "Legacy"], interpretation: "Inheritance, homeland, tradition" }
];
function getRuneFromNumber(num) {
  return RUNES[num % 24];
}
function nameToRunes(name) {
  const runeMap = {
    "F": 0,
    "U": 1,
    "TH": 2,
    "A": 3,
    "R": 4,
    "K": 5,
    "G": 6,
    "W": 7,
    "H": 8,
    "N": 9,
    "I": 10,
    "J": 11,
    "E": 12,
    "P": 13,
    "Z": 14,
    "S": 15,
    "T": 16,
    "B": 17,
    "M": 19,
    "L": 20,
    "D": 22,
    "O": 23
  };
  const runes = [];
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, "");
  for (const letter of cleanName) {
    const runeIndex = runeMap[letter];
    if (runeIndex !== void 0) {
      runes.push(RUNES[runeIndex]);
    }
  }
  return runes.slice(0, 5);
}
function calculateRunes(name, birthDate, lifePath2) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const birthRune = getRuneFromNumber(day - 1);
  const nameRunes = nameToRunes(name);
  const destinyRune = getRuneFromNumber(lifePath2 - 1);
  const challengeRune = getRuneFromNumber(month + 11);
  return {
    birthRune,
    nameRunes,
    destinyRune,
    challengeRune,
    interpretation: {
      summary: `Born under ${birthRune.name} (${birthRune.symbol}), your runic signature carries ${birthRune.keywords.join(", ")} energy. This ancient Norse symbol reveals ${birthRune.interpretation}.`,
      spiritualPath: `Your destiny rune ${destinyRune.name} (${destinyRune.symbol}) guides you toward ${destinyRune.keywords[0].toLowerCase()} and ${destinyRune.keywords[1].toLowerCase()}. The ${destinyRune.aett} Aett teaches you these mysteries.`,
      strengths: birthRune.keywords,
      lifeLessons: [
        `Master the ${birthRune.element} element through ${birthRune.meaning.toLowerCase()}`,
        `Navigate ${challengeRune.name} challenges with ${challengeRune.keywords[0].toLowerCase()}`,
        `Fulfill your destiny through ${destinyRune.interpretation.toLowerCase()}`
      ],
      guidance: `Meditate on ${birthRune.symbol} to connect with your primal essence. The runes of your name (${nameRunes.map((r) => r.symbol).join(" ")}) spell your spiritual identity in the elder script.`
    }
  };
}

// server/services/sabian-symbols.ts
import OpenAI2 from "openai";
import memoize from "memoizee";
var openai2 = process.env.OPENAI_API_KEY ? new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
var SABIAN_SYMBOLS_SAMPLE = [
  { degree: 0, sign: "Aries", degreeInSign: 1, symbol: "A woman has risen out of the ocean, a seal is embracing her", interpretation: "Emergence of new consciousness from the unconscious", keywords: ["Emergence", "New beginnings", "Instinct"] },
  { degree: 30, sign: "Taurus", degreeInSign: 1, symbol: "A clear mountain stream", interpretation: "Purity and natural flow of emotions", keywords: ["Purity", "Flow", "Clarity"] },
  { degree: 60, sign: "Gemini", degreeInSign: 1, symbol: "A glass-bottomed boat reveals undersea wonders", interpretation: "Intellectual clarity revealing hidden depths", keywords: ["Discovery", "Mental clarity", "Hidden knowledge"] },
  { degree: 90, sign: "Cancer", degreeInSign: 1, symbol: "On a ship, sailors lower an old flag and raise a new one", interpretation: "Transition of loyalty and allegiance", keywords: ["Transition", "New beginning", "Transformation"] },
  { degree: 120, sign: "Leo", degreeInSign: 1, symbol: "Blood rushes to a man's head as his vital energies are mobilized under the spur of ambition", interpretation: "Vitality directed toward achievement", keywords: ["Ambition", "Energy", "Drive"] },
  { degree: 150, sign: "Virgo", degreeInSign: 1, symbol: "A man's head", interpretation: "Pure intellectual analysis and discernment", keywords: ["Analysis", "Mind", "Discernment"] },
  { degree: 180, sign: "Libra", degreeInSign: 1, symbol: "A butterfly made perfect by a dart through it", interpretation: "Beauty preserved through transformation", keywords: ["Perfection", "Beauty", "Sacrifice"] },
  { degree: 210, sign: "Scorpio", degreeInSign: 1, symbol: "A crowded sightseeing bus", interpretation: "Collective experience and shared journey", keywords: ["Collective", "Experience", "Journey"] },
  { degree: 240, sign: "Sagittarius", degreeInSign: 1, symbol: "Retired army veterans gather to reawaken old memories", interpretation: "Honoring past experiences and wisdom", keywords: ["Wisdom", "Memory", "Honor"] },
  { degree: 270, sign: "Capricorn", degreeInSign: 1, symbol: "An Indian chief claims recognition and power from the assembled tribe", interpretation: "Recognition of authority and leadership", keywords: ["Authority", "Recognition", "Power"] },
  { degree: 300, sign: "Aquarius", degreeInSign: 1, symbol: "An old adobe mission", interpretation: "Enduring spiritual structures and traditions", keywords: ["Tradition", "Spirituality", "Endurance"] },
  { degree: 330, sign: "Pisces", degreeInSign: 1, symbol: "A crowded public marketplace", interpretation: "Exchange of ideas and social commerce", keywords: ["Exchange", "Community", "Diversity"] }
];
async function generateSabianSymbolWithAI(sign, degreeInSign) {
  if (!openai2) {
    return {
      symbol: `The essence of ${degreeInSign}\xB0 ${sign}`,
      interpretation: `A unique degree combining the qualities of ${sign} with the specific vibration of the ${degreeInSign}th degree`,
      keywords: [sign, "Development", "Expression"]
    };
  }
  try {
    const completion = await openai2.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in Sabian Symbols, the 360 symbolic images that represent each degree of the zodiac. Generate authentic Sabian Symbol interpretations in the style of Marc Edmund Jones and Dane Rudhyar."
        },
        {
          role: "user",
          content: `Generate a Sabian Symbol for ${degreeInSign}\xB0 ${sign}. 

The Sabian Symbol should be:
1. A vivid, poetic image (usually a single sentence describing a scene or moment)
2. Capturing the essence of ${sign} energy at this specific degree
3. In the traditional style of Sabian Symbols (concrete images with metaphysical meaning)

Respond in JSON format:
{
  "symbol": "The symbolic image (one sentence)",
  "interpretation": "A one-sentence interpretation of what this symbol represents",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      symbol: result.symbol || `The essence of ${degreeInSign}\xB0 ${sign}`,
      interpretation: result.interpretation || `A unique expression of ${sign} energy`,
      keywords: result.keywords || [sign, "Growth", "Expression"]
    };
  } catch (error) {
    console.error("[SabianSymbol] AI generation error:", error);
    return {
      symbol: `The essence of ${degreeInSign}\xB0 ${sign}`,
      interpretation: `A unique degree combining the qualities of ${sign} with the specific vibration of the ${degreeInSign}th degree`,
      keywords: [sign, "Development", "Expression"]
    };
  }
}
var memoizedGenerateSabianSymbol = memoize(
  generateSabianSymbolWithAI,
  {
    primitive: true,
    maxAge: 1e3 * 60 * 60 * 24 * 7,
    // Cache for 7 days
    promise: true
  }
);
async function getSabianSymbol(longitude) {
  const degree = Math.floor(longitude);
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const signIndex = Math.floor(degree / 30);
  const degreeInSign = degree % 30 + 1;
  const sign = signs[signIndex];
  const exactMatch = SABIAN_SYMBOLS_SAMPLE.find((s) => s.degree === degree);
  if (exactMatch) {
    return {
      degree,
      sign,
      degreeInSign,
      symbol: exactMatch.symbol,
      interpretation: exactMatch.interpretation,
      keywords: exactMatch.keywords
    };
  }
  const generated = await memoizedGenerateSabianSymbol(sign, degreeInSign);
  return {
    degree,
    sign,
    degreeInSign,
    symbol: generated.symbol,
    interpretation: generated.interpretation,
    keywords: generated.keywords
  };
}
async function calculateSabianSymbols(sunLongitude, moonLongitude, ascendantLongitude) {
  const sun = await getSabianSymbol(sunLongitude);
  const moon = await getSabianSymbol(moonLongitude);
  const ascendant = await getSabianSymbol(ascendantLongitude);
  return {
    sun,
    moon,
    ascendant,
    interpretation: {
      solarSymbol: `Your Sun at ${sun.degreeInSign}\xB0 ${sun.sign} carries the Sabian symbol: "${sun.symbol}". This represents ${sun.interpretation.toLowerCase()}.`,
      lunarSymbol: `Your Moon at ${moon.degreeInSign}\xB0 ${moon.sign} holds the symbol: "${moon.symbol}". Your emotional nature ${moon.interpretation.toLowerCase()}.`,
      risingSymbol: `Your Ascendant at ${ascendant.degreeInSign}\xB0 ${ascendant.sign} projects: "${ascendant.symbol}". You present to the world through ${ascendant.interpretation.toLowerCase()}.`,
      synthesis: `The trinity of your Sabian symbols weaves a unique story: ${sun.keywords[0]} (Sun), ${moon.keywords[0]} (Moon), and ${ascendant.keywords[0]} (Rising) create your soul's signature.`
    }
  };
}

// server/services/ayurveda.ts
var DOSHAS = {
  Vata: {
    name: "Vata",
    elements: ["Air", "Ether"],
    qualities: ["Light", "Dry", "Cold", "Rough", "Mobile", "Subtle"],
    traits: {
      physical: ["Thin build", "Quick movements", "Variable appetite", "Light sleeper"],
      mental: ["Creative", "Quick thinking", "Enthusiastic", "Changeable"],
      emotional: ["Excitable", "Anxious when stressed", "Adaptable", "Imaginative"]
    },
    balance: {
      strengths: ["Creativity", "Flexibility", "Quick learning", "Spiritual insight"],
      imbalances: ["Anxiety", "Insomnia", "Dry skin", "Digestive issues", "Scattered mind"],
      recommendations: ["Warm, nourishing foods", "Regular routine", "Oil massage", "Grounding practices", "Meditation"]
    }
  },
  Pitta: {
    name: "Pitta",
    elements: ["Fire", "Water"],
    qualities: ["Hot", "Sharp", "Light", "Liquid", "Spreading"],
    traits: {
      physical: ["Medium build", "Strong appetite", "Good digestion", "Warm body temperature"],
      mental: ["Intelligent", "Focused", "Organized", "Ambitious"],
      emotional: ["Passionate", "Competitive", "Irritable when stressed", "Driven"]
    },
    balance: {
      strengths: ["Intelligence", "Leadership", "Courage", "Strong digestion"],
      imbalances: ["Anger", "Inflammation", "Acid reflux", "Skin rashes", "Burnout"],
      recommendations: ["Cooling foods", "Avoid excess heat", "Nature time", "Moderation", "Compassion practice"]
    }
  },
  Kapha: {
    name: "Kapha",
    elements: ["Earth", "Water"],
    qualities: ["Heavy", "Slow", "Steady", "Solid", "Cold", "Soft"],
    traits: {
      physical: ["Sturdy build", "Slow digestion", "Good endurance", "Deep sleep"],
      mental: ["Calm", "Steady", "Methodical", "Good memory"],
      emotional: ["Loving", "Patient", "Loyal", "Can be lethargic"]
    },
    balance: {
      strengths: ["Stability", "Endurance", "Patience", "Compassion"],
      imbalances: ["Weight gain", "Lethargy", "Depression", "Congestion", "Attachment"],
      recommendations: ["Light, spicy foods", "Regular exercise", "Variety", "Stimulation", "Dry heat"]
    }
  }
};
function calculateDoshaFromBirthData(birthDate, sunSign, moonSign, enneagramType) {
  let vata = 33;
  let pitta = 33;
  let kapha = 34;
  const date = new Date(birthDate);
  const month = date.getMonth();
  if ([0, 1, 10, 11].includes(month)) {
    vata += 10;
    kapha += 5;
  } else if ([2, 3, 4].includes(month)) {
    kapha += 10;
    vata += 5;
  } else if ([5, 6, 7, 8].includes(month)) {
    pitta += 10;
    vata += 5;
  }
  const vataSign = ["Gemini", "Libra", "Aquarius"];
  const pittaSigns = ["Aries", "Leo", "Sagittarius"];
  const kaphaSigns = ["Taurus", "Virgo", "Capricorn"];
  const mixedSigns = ["Cancer", "Scorpio", "Pisces"];
  if (sunSign) {
    if (vataSign.includes(sunSign)) vata += 15;
    else if (pittaSigns.includes(sunSign)) pitta += 15;
    else if (kaphaSigns.includes(sunSign)) kapha += 15;
    else if (mixedSigns.includes(sunSign)) {
      kapha += 8;
      pitta += 7;
    }
  }
  if (moonSign) {
    if (vataSign.includes(moonSign)) vata += 10;
    else if (pittaSigns.includes(moonSign)) pitta += 10;
    else if (kaphaSigns.includes(moonSign)) kapha += 10;
    else if (mixedSigns.includes(moonSign)) {
      kapha += 5;
      pitta += 5;
    }
  }
  if (enneagramType) {
    const enneagramDosha = {
      1: "pitta",
      2: "kapha",
      3: "pitta",
      4: "vata",
      5: "vata",
      6: "kapha",
      7: "vata",
      8: "pitta",
      9: "kapha"
    };
    const dominantDosha = enneagramDosha[enneagramType];
    if (dominantDosha === "vata") vata += 10;
    else if (dominantDosha === "pitta") pitta += 10;
    else if (dominantDosha === "kapha") kapha += 10;
  }
  const total = vata + pitta + kapha;
  return {
    vata: Math.round(vata / total * 100),
    pitta: Math.round(pitta / total * 100),
    kapha: Math.round(kapha / total * 100)
  };
}
function calculateAyurveda(birthDate, astrologyData, personalityData) {
  const scores = calculateDoshaFromBirthData(
    birthDate,
    astrologyData?.sunSign,
    astrologyData?.moonSign,
    personalityData?.enneagram?.type
  );
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][1] > 30 ? sorted[1][0] : void 0;
  let constitution;
  if (scores.vata > 40 && scores.pitta < 30 && scores.kapha < 30) constitution = "Vata";
  else if (scores.pitta > 40 && scores.vata < 30 && scores.kapha < 30) constitution = "Pitta";
  else if (scores.kapha > 40 && scores.vata < 30 && scores.pitta < 30) constitution = "Kapha";
  else if (scores.vata > 35 && scores.pitta > 35) constitution = "Vata-Pitta";
  else if (scores.pitta > 35 && scores.kapha > 35) constitution = "Pitta-Kapha";
  else if (scores.vata > 35 && scores.kapha > 35) constitution = "Vata-Kapha";
  else constitution = "Tridoshic";
  const primaryDosha = DOSHAS[primary.charAt(0).toUpperCase() + primary.slice(1)];
  const secondaryDosha = secondary ? DOSHAS[secondary.charAt(0).toUpperCase() + secondary.slice(1)] : void 0;
  return {
    primaryDosha,
    secondaryDosha,
    constitution,
    scores,
    recommendations: {
      diet: primaryDosha.balance.recommendations.filter((r) => r.includes("food")),
      lifestyle: primaryDosha.balance.recommendations.filter((r) => !r.includes("food")),
      yoga: primary === "vata" ? ["Gentle flow", "Restorative", "Grounding poses"] : primary === "pitta" ? ["Cooling practices", "Moon salutations", "Forward bends"] : ["Dynamic flow", "Backbends", "Vigorous practice"],
      seasonalGuidance: `As a ${constitution} type, pay extra attention during ${primary === "vata" ? "fall and early winter (Vata season)" : primary === "pitta" ? "summer (Pitta season)" : "late winter and spring (Kapha season)"} when your dosha naturally increases.`
    },
    interpretation: {
      summary: `Your Ayurvedic constitution is ${constitution}, with ${scores[primary]}% ${primary.charAt(0).toUpperCase() + primary.slice(1)}${secondary ? `, ${scores[secondary]}% ${secondary.charAt(0).toUpperCase() + secondary.slice(1)}` : ""}. The ${primaryDosha.elements.join(" and ")} elements govern your body-mind system.`,
      strengths: primaryDosha.balance.strengths,
      imbalanceWarnings: primaryDosha.balance.imbalances,
      spiritualPath: `Your ${primary} nature guides you toward ${primary === "vata" ? "spiritual creativity and subtle awareness" : primary === "pitta" ? "disciplined practice and transformative fire" : "devotional practices and steady grounding"}.`
    }
  };
}

// server/services/biorhythms.ts
function calculateCycle(daysSinceBirth, period) {
  const angle = 2 * Math.PI * daysSinceBirth / period;
  const value = Math.round(Math.sin(angle) * 100);
  let phase;
  if (Math.abs(value) < 5) phase = "Critical";
  else if (value > 0) phase = "High";
  else phase = "Low";
  const currentPhase = daysSinceBirth % period;
  const peakPhase = period / 4;
  let daysUntilPeak = peakPhase - currentPhase;
  if (daysUntilPeak < 0) daysUntilPeak += period;
  return { value, phase, daysUntilPeak: Math.round(daysUntilPeak) };
}
function calculateBiorhythms(birthDate, currentDate = /* @__PURE__ */ new Date()) {
  const birth = new Date(birthDate);
  const daysSinceBirth = Math.floor((currentDate.getTime() - birth.getTime()) / (1e3 * 60 * 60 * 24));
  const PHYSICAL_PERIOD = 23;
  const EMOTIONAL_PERIOD = 28;
  const INTELLECTUAL_PERIOD = 33;
  const physical = calculateCycle(daysSinceBirth, PHYSICAL_PERIOD);
  const emotional = calculateCycle(daysSinceBirth, EMOTIONAL_PERIOD);
  const intellectual = calculateCycle(daysSinceBirth, INTELLECTUAL_PERIOD);
  const bestDays = [];
  const criticalDays = [];
  for (let i = 0; i < 30; i++) {
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + i);
    const futureDays = daysSinceBirth + i;
    const p = calculateCycle(futureDays, PHYSICAL_PERIOD);
    const e = calculateCycle(futureDays, EMOTIONAL_PERIOD);
    const int = calculateCycle(futureDays, INTELLECTUAL_PERIOD);
    const avgValue = (p.value + e.value + int.value) / 3;
    if (avgValue > 70) bestDays.push(futureDate);
    if (p.phase === "Critical" || e.phase === "Critical" || int.phase === "Critical") {
      criticalDays.push(futureDate);
    }
  }
  const overallEnergy = Math.round((physical.value + emotional.value + intellectual.value) / 3);
  return {
    physical: {
      name: "Physical",
      period: PHYSICAL_PERIOD,
      currentValue: physical.value,
      phase: physical.phase,
      daysUntilPeak: physical.daysUntilPeak,
      interpretation: physical.phase === "High" ? "Your physical energy is high. Great time for exercise, sports, and physical challenges." : physical.phase === "Low" ? "Physical energy is low. Focus on rest, recovery, and gentle activities." : "Critical day for physical cycle. Be cautious with strenuous activities."
    },
    emotional: {
      name: "Emotional",
      period: EMOTIONAL_PERIOD,
      currentValue: emotional.value,
      phase: emotional.phase,
      daysUntilPeak: emotional.daysUntilPeak,
      interpretation: emotional.phase === "High" ? "Emotional wellbeing is elevated. Good time for relationships and creative expression." : emotional.phase === "Low" ? "Emotional sensitivity is heightened. Practice self-care and introspection." : "Critical emotional day. Be mindful of mood swings and emotional reactions."
    },
    intellectual: {
      name: "Intellectual",
      period: INTELLECTUAL_PERIOD,
      currentValue: intellectual.value,
      phase: intellectual.phase,
      daysUntilPeak: intellectual.daysUntilPeak,
      interpretation: intellectual.phase === "High" ? "Mental clarity is sharp. Excellent for learning, problem-solving, and decisions." : intellectual.phase === "Low" ? "Mental energy is quieter. Good for reflection and intuitive processes." : "Critical intellectual day. Double-check important decisions and communications."
    },
    overall: {
      energy: overallEnergy,
      bestDays: bestDays.slice(0, 5),
      criticalDays: criticalDays.slice(0, 5),
      interpretation: `Your overall biorhythm energy is at ${overallEnergy}%. ${overallEnergy > 50 ? "You're in a high-energy phase across multiple cycles." : overallEnergy < -50 ? "You're in a recovery phase. Honor your need for rest." : "Your cycles are balanced. Navigate mindfully."}`
    }
  };
}

// server/services/asteroids.ts
var ASTEROID_MEANINGS = {
  chiron: {
    meaning: "The Wounded Healer",
    keywords: ["Healing", "Wounds", "Teaching", "Wisdom through pain"],
    bySign: {
      Aries: "Wound around identity and self-assertion; healer through courage",
      Taurus: "Wound around security and self-worth; healer through grounding",
      Gemini: "Wound around communication; healer through sharing knowledge",
      Cancer: "Wound around nurturing and emotions; healer through empathy",
      Leo: "Wound around self-expression and recognition; healer through creativity",
      Virgo: "Wound around perfection and service; healer through practical wisdom",
      Libra: "Wound around relationships and fairness; healer through balance",
      Scorpio: "Wound around power and transformation; healer through depth",
      Sagittarius: "Wound around meaning and beliefs; healer through philosophy",
      Capricorn: "Wound around authority and achievement; healer through mastery",
      Aquarius: "Wound around belonging and uniqueness; healer through innovation",
      Pisces: "Wound around boundaries and spirituality; healer through compassion"
    }
  },
  ceres: {
    meaning: "The Great Mother",
    keywords: ["Nurturing", "Loss", "Cycles", "Unconditional love"],
    theme: "How you nurture and wish to be nurtured"
  },
  pallas: {
    meaning: "Warrior Wisdom",
    keywords: ["Strategy", "Creativity", "Healing", "Pattern recognition"],
    theme: "Your unique intelligence and creative wisdom"
  },
  juno: {
    meaning: "Soul Partnerships",
    keywords: ["Commitment", "Marriage", "Equality", "Betrayal/loyalty"],
    theme: "What you need in committed relationships"
  },
  vesta: {
    meaning: "Sacred Devotion",
    keywords: ["Focus", "Dedication", "Sexuality", "Sacred flame"],
    theme: "Where you maintain sacred focus and devotion"
  },
  lilith: {
    meaning: "Dark Feminine Power",
    keywords: ["Shadow", "Repressed power", "Raw sexuality", "Rebellion"],
    theme: "Your shadow power and what you've been taught to hide"
  }
};
function getSignFromLongitude(longitude) {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return signs[Math.floor(longitude / 30) % 12];
}
function calculateHouseFromLongitude(longitude, ascendantLongitude) {
  let houseLongitude = longitude - ascendantLongitude;
  if (houseLongitude < 0) houseLongitude += 360;
  return Math.floor(houseLongitude / 30) % 12 + 1;
}
function calculateAsteroids(birthDate, birthTime, timezone, ascendantLongitude) {
  const dateTimeParts = `${birthDate}T${birthTime}`;
  const date = new Date(dateTimeParts);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1e3 * 60 * 60 * 24));
  const chironLong = (dayOfYear + date.getFullYear() * 7.3) % 360;
  const ceresLong = (dayOfYear * 0.21 + date.getFullYear() * 78) % 360;
  const pallasLong = (dayOfYear * 0.23 + date.getFullYear() * 83) % 360;
  const junoLong = (dayOfYear * 0.22 + date.getFullYear() * 81) % 360;
  const vestaLong = (dayOfYear * 0.27 + date.getFullYear() * 97) % 360;
  const lilithLong = (dayOfYear * 0.11 + date.getFullYear() * 40) % 360;
  const processAsteroid = (name, longitude) => {
    const sign = getSignFromLongitude(longitude);
    const house = calculateHouseFromLongitude(longitude, ascendantLongitude);
    const degree = longitude % 30;
    const meanings = ASTEROID_MEANINGS[name];
    let interpretation = "";
    if (name === "chiron" && "bySign" in meanings) {
      interpretation = meanings.bySign[sign];
    } else {
      const theme = "theme" in meanings ? meanings.theme : meanings.meaning.toLowerCase();
      interpretation = `${meanings.meaning} in ${sign} brings ${theme} through ${sign} energy.`;
    }
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      longitude,
      sign,
      house,
      degree,
      meaning: meanings.meaning,
      keywords: meanings.keywords,
      interpretation
    };
  };
  const chiron = processAsteroid("chiron", chironLong);
  const ceres = processAsteroid("ceres", ceresLong);
  const pallas = processAsteroid("pallas", pallasLong);
  const juno = processAsteroid("juno", junoLong);
  const vesta = processAsteroid("vesta", vestaLong);
  const lilith = processAsteroid("lilith", lilithLong);
  return {
    chiron,
    ceres,
    pallas,
    juno,
    vesta,
    lilith,
    interpretation: {
      wounds: `Chiron in ${chiron.sign} reveals: ${chiron.interpretation} Your deepest wound becomes your greatest gift for healing others.`,
      nurturing: `Ceres in ${ceres.sign} shows how you nurture: through ${ceres.sign} qualities. You need ${ceres.keywords[0].toLowerCase()} in caregiving relationships.`,
      wisdom: `Pallas in ${pallas.sign} illuminates your ${pallas.keywords[1].toLowerCase()} and ${pallas.keywords[2].toLowerCase()} abilities. You solve problems through ${pallas.sign} energy.`,
      partnership: `Juno in ${juno.sign} indicates what you need in partnership: ${juno.keywords[2].toLowerCase()} and ${juno.keywords[0].toLowerCase()} expressed through ${juno.sign} qualities.`,
      devotion: `Vesta in ${vesta.sign} shows where you maintain sacred ${vesta.keywords[0].toLowerCase()}: through ${vesta.sign} dedication. This is your holy flame.`,
      shadow: `Lilith in ${lilith.sign} reveals your ${lilith.keywords[0].toLowerCase()} power and ${lilith.keywords[1].toLowerCase()} potential. What society tried to shame, you must reclaim through ${lilith.sign} expression.`,
      synthesis: `The asteroids reveal your soul's deeper dimensions: healing through Chiron, nurturing through Ceres, wisdom through Pallas, partnership through Juno, devotion through Vesta, and shadow power through Lilith.`
    }
  };
}

// server/services/arabic-parts.ts
function normalizeAngle(angle) {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}
function getSignFromLongitude2(longitude) {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return signs[Math.floor(longitude / 30) % 12];
}
function calculateHouse(longitude, ascendantLongitude) {
  let houseLongitude = longitude - ascendantLongitude;
  if (houseLongitude < 0) houseLongitude += 360;
  return Math.floor(houseLongitude / 30) % 12 + 1;
}
function calculateArabicParts(ascendantLongitude, sunLongitude, moonLongitude, venusLongitude, jupiterLongitude, saturnLongitude, isDayBirth) {
  const fortuneLongitude = isDayBirth ? normalizeAngle(ascendantLongitude + moonLongitude - sunLongitude) : normalizeAngle(ascendantLongitude + sunLongitude - moonLongitude);
  const spiritLongitude = isDayBirth ? normalizeAngle(ascendantLongitude + sunLongitude - moonLongitude) : normalizeAngle(ascendantLongitude + moonLongitude - sunLongitude);
  const loveLongitude = normalizeAngle(ascendantLongitude + venusLongitude - spiritLongitude);
  const seventhHouse = normalizeAngle(ascendantLongitude + 180);
  const marriageLongitude = normalizeAngle(ascendantLongitude + seventhHouse - venusLongitude);
  const fatherLongitude = normalizeAngle(ascendantLongitude + sunLongitude - saturnLongitude);
  const motherLongitude = normalizeAngle(ascendantLongitude + moonLongitude - venusLongitude);
  const createPart = (name, longitude, meaning) => ({
    name,
    longitude,
    sign: getSignFromLongitude2(longitude),
    house: calculateHouse(longitude, ascendantLongitude),
    degree: longitude % 30,
    meaning,
    interpretation: `Your ${name} at ${(longitude % 30).toFixed(1)}\xB0 ${getSignFromLongitude2(longitude)} (House ${calculateHouse(longitude, ascendantLongitude)}) reveals ${meaning.toLowerCase()} through ${getSignFromLongitude2(longitude)} energy.`
  });
  const partOfFortune = createPart(
    "Part of Fortune",
    fortuneLongitude,
    "Material well-being, worldly success, and where life flows easily"
  );
  const partOfSpirit = createPart(
    "Part of Spirit",
    spiritLongitude,
    "Spiritual purpose, inner fulfillment, and soul's calling"
  );
  const partOfLove = createPart(
    "Part of Love",
    loveLongitude,
    "Romantic attraction, love nature, and heart's desire"
  );
  const partOfMarriage = createPart(
    "Part of Marriage",
    marriageLongitude,
    "Partnership potential, marriage themes, and union"
  );
  const partOfFather = createPart(
    "Part of Father",
    fatherLongitude,
    "Paternal influence, authority, and masculine legacy"
  );
  const partOfMother = createPart(
    "Part of Mother",
    motherLongitude,
    "Maternal influence, nurturing, and feminine legacy"
  );
  return {
    partOfFortune,
    partOfSpirit,
    partOfLove,
    partOfMarriage,
    partOfFather,
    partOfMother,
    interpretation: {
      material: `Your Part of Fortune in ${partOfFortune.sign} House ${partOfFortune.house} shows where worldly success flows naturally. Cultivate ${partOfFortune.sign} qualities to attract abundance.`,
      spiritual: `Part of Spirit in ${partOfSpirit.sign} House ${partOfSpirit.house} reveals your soul's true calling. Your spiritual purpose manifests through ${partOfSpirit.sign} expression.`,
      romantic: `Part of Love in ${partOfLove.sign} House ${partOfLove.house} shows how you experience romantic love. Your heart opens through ${partOfLove.sign} qualities.`,
      union: `Part of Marriage in ${partOfMarriage.sign} House ${partOfMarriage.house} indicates partnership themes. Successful unions embody ${partOfMarriage.sign} principles.`,
      legacy: `Part of Father (${partOfFather.sign}) and Mother (${partOfMother.sign}) reveal your parental legacy and how you integrate masculine/feminine ancestral patterns.`,
      synthesis: `The Arabic Parts synthesize planetary energies into key life areas: Fortune (material), Spirit (purpose), Love (romance), Marriage (partnership), and parental legacies create your life's sacred geometry.`
    }
  };
}

// server/services/fixed-stars.ts
var MAJOR_FIXED_STARS = [
  { name: "Regulus", longitude: 29.9, magnitude: 1.4, constellation: "Leo", nature: "Mars-Jupiter", meaning: "Royal Star of Leadership", keywords: ["Power", "Success", "Honor", "Downfall through revenge"] },
  { name: "Aldebaran", longitude: 9.8, magnitude: 0.9, constellation: "Taurus", nature: "Mars", meaning: "The Bull's Eye - Integrity", keywords: ["Courage", "Integrity", "Success", "Blindness to consequences"] },
  { name: "Antares", longitude: 9.8, magnitude: 1, constellation: "Scorpio", nature: "Mars-Jupiter", meaning: "Heart of the Scorpion - Obsession", keywords: ["Passion", "Obsession", "Sudden events", "Recklessness"] },
  { name: "Fomalhaut", longitude: 3.9, constellation: "Pisces Australis", magnitude: 1.2, nature: "Venus-Mercury", meaning: "Royal Star of Idealism", keywords: ["Idealism", "Dreams", "Fame", "Fall from grace"] },
  { name: "Spica", longitude: 23.8, magnitude: 1, constellation: "Virgo", nature: "Venus-Mars", meaning: "The Wheat Shaft - Gifts", keywords: ["Gifts", "Protection", "Creativity", "Success"] },
  { name: "Sirius", longitude: 14.1, magnitude: -1.5, constellation: "Canis Major", nature: "Jupiter-Mars", meaning: "The Dog Star - Ambition", keywords: ["Ambition", "Fame", "Honor", "Passion"] },
  { name: "Algol", longitude: 26.3, magnitude: 2.1, constellation: "Perseus", nature: "Saturn-Jupiter", meaning: "The Demon Star", keywords: ["Intensity", "Transformation", "Violence", "Kundalini"] },
  { name: "Pleiades", longitude: 29.6, magnitude: 1.6, constellation: "Taurus", nature: "Moon-Mars", meaning: "The Seven Sisters - Ambition", keywords: ["Ambition", "Mourning", "Accidents", "Mysticism"] },
  { name: "Alcyone", longitude: 0.1, magnitude: 2.9, constellation: "Taurus", nature: "Moon-Jupiter", meaning: "Central Pleiades - Mystical", keywords: ["Mysticism", "Sorrow", "Prominence", "Blindness"] },
  { name: "Vega", longitude: 15.4, magnitude: 0, constellation: "Lyra", nature: "Venus-Mercury", meaning: "The Harp Star", keywords: ["Artistic", "Idealistic", "Grave", "Critical"] }
];
function calculateFixedStars(planets) {
  const conjunctions = [];
  const ORB_LIMIT = 2;
  Object.entries(planets).forEach(([planetName, planetLong]) => {
    MAJOR_FIXED_STARS.forEach((star) => {
      let orb = Math.abs(planetLong - star.longitude);
      if (orb > 180) orb = 360 - orb;
      if (orb <= ORB_LIMIT) {
        const interpretation = `${planetName} conjunct ${star.name}: ${star.meaning}. This amplifies ${star.keywords[0].toLowerCase()} and ${star.keywords[1].toLowerCase()} in your ${planetName} expression. ${star.nature} nature blends with ${planetName} energy.`;
        conjunctions.push({
          star,
          planet: planetName,
          orb,
          interpretation
        });
      }
    });
  });
  conjunctions.sort((a, b) => a.orb - b.orb);
  const majorInfluences = [];
  const warnings = [];
  const gifts = [];
  conjunctions.forEach((conj) => {
    if (conj.orb < 1) {
      majorInfluences.push(`${conj.star.name} strongly influences your ${conj.planet}`);
    }
    if (["Algol", "Antares"].includes(conj.star.name)) {
      warnings.push(`${conj.star.name}-${conj.planet}: Potential for ${conj.star.keywords[2].toLowerCase()}. Channel intensity wisely.`);
    }
    if (["Regulus", "Spica", "Fomalhaut"].includes(conj.star.name)) {
      gifts.push(`${conj.star.name}-${conj.planet}: ${conj.star.keywords[0]} and ${conj.star.keywords[1].toLowerCase()} are your gifts.`);
    }
  });
  return {
    conjunctions: conjunctions.slice(0, 5),
    // Top 5 closest
    interpretation: {
      summary: conjunctions.length > 0 ? `You have ${conjunctions.length} significant fixed star conjunction${conjunctions.length > 1 ? "s" : ""}. The stars ${conjunctions.map((c) => c.star.name).join(", ")} mark your chart with special significance.` : "No major fixed star conjunctions within tight orb. Your chart expresses primarily through planetary and zodiacal energies.",
      majorInfluences,
      warnings: warnings.length > 0 ? warnings : ["No challenging fixed star aspects. Navigate your path with awareness of planetary energies."],
      gifts: gifts.length > 0 ? gifts : ["Your gifts come primarily from planetary placements rather than fixed stars."]
    }
  };
}

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize2 from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize2(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify2 = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify2
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// server/auth/passwordUtils.ts
import * as argon2 from "argon2";
var ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  // 19 MiB
  timeCost: 2,
  parallelism: 1
};
async function hashPassword(password) {
  return argon2.hash(password, ARGON2_OPTIONS);
}
async function verifyPassword(hash2, password) {
  try {
    return await argon2.verify(hash2, password);
  } catch (error) {
    return false;
  }
}

// server/routes.ts
import { randomUUID as randomUUID2 } from "crypto";

// server/services/transits.ts
import * as Astronomy4 from "astronomy-engine";
var SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];
var MAJOR_ASPECTS = {
  conjunction: { degrees: 0, orb: 8, name: "Conjunction" },
  opposition: { degrees: 180, orb: 8, name: "Opposition" },
  square: { degrees: 90, orb: 7, name: "Square" },
  trine: { degrees: 120, orb: 7, name: "Trine" },
  sextile: { degrees: 60, orb: 6, name: "Sextile" }
};
var OUTER_PLANETS = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
var TRANSIT_THEMES = {
  "Pluto": { theme: "Transformation, Shadow Work, Death & Rebirth", intensity: "high" },
  "Neptune": { theme: "Dissolution, Spirituality, Surrender, Illusion", intensity: "high" },
  "Uranus": { theme: "Awakening, Revolution, Liberation, Chaos", intensity: "high" },
  "Saturn": { theme: "Discipline, Limitation, Mastery, Structure", intensity: "medium" },
  "Jupiter": { theme: "Expansion, Abundance, Growth, Optimism", intensity: "medium" }
};
var TRANSIT_INTERPRETATIONS = {
  "Pluto": {
    "Conjunction": "Deep transformation is occurring. This transit forces you to confront your deepest fears and hidden shadows. Death of old patterns, rebirth into authenticity.",
    "Opposition": "External forces mirror your internal shadow. Power struggles reveal what needs to be transformed. The universe is showing you what you refuse to see.",
    "Square": "Crisis of power and control. You're being forced to release what you're clinging to. The friction is intentional - it's breaking you open.",
    "Trine": "Natural transformation flowing with ease. Your shadow work is supported. Deep healing happens without force.",
    "Sextile": "Opportunities for transformation present themselves. The work is available if you choose it."
  },
  "Saturn": {
    "Conjunction": "The Great Teacher arrives. Discipline, responsibility, and mastery are required. This is your initiation into maturity in this area of life.",
    "Opposition": "The universe is testing your structure. What you've built is being challenged. Only what's real will remain.",
    "Square": "Limitation and pressure reveal what needs strengthening. The obstacle is the path. Build your discipline here.",
    "Trine": "Your efforts are rewarded. Mastery flows naturally. The structure you've built supports you.",
    "Sextile": "Opportunities to demonstrate mastery. Discipline creates opportunity."
  },
  "Uranus": {
    "Conjunction": "Lightning strikes. Sudden awakening and liberation. The old structure is breaking apart to reveal your authentic truth.",
    "Opposition": "Revolutionary energy confronts you externally. Freedom vs. security. The cage door is open - will you leave?",
    "Square": "Chaos and disruption force change. You cannot control this. Surrender to the awakening.",
    "Trine": "Natural innovation and liberation. Change flows with ease. Your authentic self emerges effortlessly.",
    "Sextile": "Opportunities for freedom present themselves. Small awakenings lead to larger shifts."
  },
  "Neptune": {
    "Conjunction": "Ego dissolution. Spiritual awakening. Boundaries dissolve. You're being asked to surrender completely.",
    "Opposition": "Confusion and illusion mirror back to you. What's real? What's fantasy? The veil is being lifted.",
    "Square": "Disillusionment and confusion create crisis. The dream is collapsing. Reality check in progress.",
    "Trine": "Spiritual connection flows naturally. Intuition is heightened. Grace and surrender come with ease.",
    "Sextile": "Gentle spiritual openings. Opportunities for transcendence and compassion."
  },
  "Jupiter": {
    "Conjunction": "Expansion and abundance arrive. Growth is accelerated. Optimism and faith are rewarded.",
    "Opposition": "Excess and overconfidence may create imbalance. Too much of a good thing. Find equilibrium.",
    "Square": "Growth comes through tension. You're being pushed beyond your comfort zone. Expansion requires friction.",
    "Trine": "Natural flow of abundance and opportunity. Your optimism manifests results. Growth is effortless.",
    "Sextile": "Small opportunities for growth. Say yes to expansion."
  }
};
function calculatePlanetaryPosition(planet, date) {
  const body = Astronomy4.Body[planet];
  const ecliptic = Astronomy4.EclipticGeoMoon(date);
  let longitude = 0;
  if (planet === "Moon") {
    longitude = ecliptic.lon;
  } else {
    const helioVector = Astronomy4.HelioVector(body, date);
    const geoVector = Astronomy4.GeoVector(body, date, false);
    const eclipticCoords = Astronomy4.Ecliptic(geoVector);
    longitude = eclipticCoords.elon;
  }
  while (longitude < 0) longitude += 360;
  while (longitude >= 360) longitude -= 360;
  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  return {
    longitude,
    sign: SIGNS[signIndex],
    degree
  };
}
function calculateAspect(pos1, pos2) {
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;
  for (const [aspectName, aspectData] of Object.entries(MAJOR_ASPECTS)) {
    const orbDiff = Math.abs(diff - aspectData.degrees);
    if (orbDiff <= aspectData.orb) {
      return {
        aspect: aspectData.name,
        orb: orbDiff
      };
    }
  }
  return { aspect: null, orb: 999 };
}
function calculateActiveTransits(natalPlanets, date = /* @__PURE__ */ new Date()) {
  const transits = [];
  for (const transitPlanet of OUTER_PLANETS) {
    try {
      const transitPosition = calculatePlanetaryPosition(transitPlanet, date);
      const natalPlanetsToCheck = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant", "Midheaven"];
      for (const natalPlanet of natalPlanetsToCheck) {
        if (!natalPlanets[natalPlanet]) continue;
        const natalPosition = natalPlanets[natalPlanet];
        const { aspect, orb } = calculateAspect(transitPosition.longitude, natalPosition.longitude);
        if (aspect) {
          const interpretation = TRANSIT_INTERPRETATIONS[transitPlanet]?.[aspect] || "Significant transit active.";
          const themeData = TRANSIT_THEMES[transitPlanet];
          transits.push({
            planet: transitPlanet,
            transitingDegree: Math.round(transitPosition.degree * 100) / 100,
            transitingSign: transitPosition.sign,
            natalPlanet,
            natalDegree: Math.round(natalPosition.longitude % 30 * 100) / 100,
            natalSign: natalPosition.sign,
            aspect,
            aspectDegrees: MAJOR_ASPECTS[aspect.toLowerCase()].degrees,
            orb: Math.round(orb * 100) / 100,
            interpretation,
            intensity: themeData.intensity,
            theme: themeData.theme
          });
        }
      }
    } catch (error) {
      console.error(`Error calculating ${transitPlanet} transit:`, error);
    }
  }
  transits.sort((a, b) => {
    const intensityOrder = { high: 3, medium: 2, low: 1 };
    const intensityDiff = intensityOrder[b.intensity] - intensityOrder[a.intensity];
    if (intensityDiff !== 0) return intensityDiff;
    return a.orb - b.orb;
  });
  const dominantTransit = transits.find((t) => t.intensity === "high") || transits[0];
  const dominantTheme = dominantTransit ? dominantTransit.theme : "Integration and Balance";
  const overallIntensity = transits.length > 0 ? Math.min(100, transits.reduce((sum, t) => {
    const intensityValue = { high: 30, medium: 15, low: 5 }[t.intensity];
    const exactnessBonus = (8 - t.orb) * 2;
    return sum + intensityValue + exactnessBonus;
  }, 0)) : 0;
  return {
    timestamp: date,
    transits,
    dominantTheme,
    overallIntensity: Math.round(overallIntensity)
  };
}
function extractNatalPositions(astrologyData) {
  const positions = {};
  if (astrologyData?.planets) {
    for (const [planet, data] of Object.entries(astrologyData.planets)) {
      if (typeof data === "object" && data !== null && "longitude" in data && "sign" in data) {
        positions[planet.charAt(0).toUpperCase() + planet.slice(1)] = {
          longitude: data.longitude,
          sign: data.sign
        };
      }
    }
  }
  if (astrologyData?.ascendant) {
    positions["Ascendant"] = {
      longitude: astrologyData.ascendant.longitude,
      sign: astrologyData.ascendant.sign
    };
  }
  if (astrologyData?.midheaven) {
    positions["Midheaven"] = {
      longitude: astrologyData.midheaven.longitude,
      sign: astrologyData.midheaven.sign
    };
  }
  return positions;
}

// server/services/transmutation.ts
var TRANSMUTATION_TECHNIQUES = {
  "Pluto": {
    planet: "Pluto",
    technique: "Shadow Work & Radical Forgiveness",
    description: "Pluto transits force confrontation with the shadow - the rejected, hidden parts of yourself. The only way through is radical honesty and forgiveness of self and others.",
    protocol: [
      "1. IDENTIFY THE SHADOW: Write down what you're avoiding, denying, or projecting onto others. Name the fear.",
      "2. FEEL THE DENSITY: Sit with the emotion without trying to fix it. Let it be as heavy as it needs to be. This is the death.",
      '3. FORGIVE THE PATTERN: Speak aloud: "I forgive myself for carrying this. I forgive [person/situation] for triggering this. I release this to be transformed."',
      "4. WITNESS THE REBIRTH: Notice what emerges after the heaviness passes. The phoenix always rises from the ashes.",
      '5. INTEGRATE THE LESSON: Ask yourself: "What power was hidden beneath this shadow?" Claim it.'
    ],
    duration: "20-30 minutes per session",
    frequency: "Daily during intense Pluto transits (conjunction, square, opposition)",
    warning: "This work is intense. Do not bypass the feeling stage. The shadow must be felt to be healed."
  },
  "Saturn": {
    planet: "Saturn",
    technique: "Discipline Protocol & Structure Building",
    description: "Saturn demands mastery through consistent effort. The Teacher shows you where your foundation is weak. Build it stronger through disciplined action.",
    protocol: [
      "1. IDENTIFY THE WEAK STRUCTURE: Where is Saturn showing limitation? What needs strengthening? (Health, career, relationship commitment, etc.)",
      "2. CREATE THE COMMITMENT: Write a specific, measurable discipline you will practice daily. Make it small enough to be sustainable.",
      "3. TRACK YOUR CONSISTENCY: Use a physical calendar. Mark each day you complete the discipline. This visual proof builds momentum.",
      "4. HONOR THE RESISTANCE: When you don't want to do it, do it anyway. This is the lesson. The feeling doesn't matter; the action does.",
      "5. REVIEW WEEKLY: Every 7 days, acknowledge what you've built. Saturn rewards those who show up consistently."
    ],
    duration: "Daily practice (15-60 minutes depending on the discipline)",
    frequency: "Continuous throughout Saturn transit (can last 2-3 years)",
    warning: "Do not quit when it gets hard. That's the exact moment Saturn is teaching you mastery."
  },
  "Uranus": {
    planet: "Uranus",
    technique: "Liberation Through Surrender & Authentic Expression",
    description: "Uranus breaks down false structures to reveal authentic truth. Resistance creates suffering. Surrender accelerates awakening.",
    protocol: [
      "1. IDENTIFY THE CAGE: What structure (job, relationship, belief, identity) feels restrictive? Where are you living inauthentically?",
      `2. SPEAK THE TRUTH: Out loud, say what you've been afraid to say. "I don't want this anymore." "This isn't me." Let the words break the spell.`,
      "3. TAKE ONE RADICAL ACTION: Do something your old self would never do. Cut your hair. Quit the thing. Say no. The action rewires your nervous system.",
      "4. EMBRACE THE CHAOS: Change feels unstable because it is. Breathe through the uncertainty. The ground will solidify again.",
      "5. CELEBRATE FREEDOM: Acknowledge each moment you choose authenticity over security. This is the awakening."
    ],
    duration: "Spontaneous actions + daily check-in (10 minutes)",
    frequency: "Throughout Uranus transit, with intensity during exact aspects",
    warning: "Uranus moves fast. Don't overthink it. The lightning has already struck - just move with it."
  },
  "Neptune": {
    planet: "Neptune",
    technique: "Spiritual Surrender & Ego Dissolution",
    description: "Neptune dissolves boundaries and demands surrender of control. The ego must die for the soul to emerge. Trust the process.",
    protocol: [
      `1. RELEASE CONTROL: Identify what you're trying to force. Career outcome, relationship, healing timeline. Speak it: "I surrender this to divine timing."`,
      "2. MEDITATE ON EMPTINESS: Sit in silence for 20 minutes daily. Don't try to achieve anything. Just be. Let the boundaries dissolve.",
      "3. SERVE WITHOUT EXPECTATION: Do something for another person anonymously. No credit, no recognition. This dissolves ego.",
      `4. DISCERN ILLUSION FROM TRUTH: Journal: "What story am I telling myself? What's actually true?" Neptune reveals where you've been lying to yourself.`,
      "5. PRACTICE COMPASSION: For yourself and others. Everyone is doing their best. Judgment dissolves in the Neptune fog."
    ],
    duration: "20-30 minutes meditation + ongoing surrender practice",
    frequency: "Daily during Neptune transit",
    warning: "Do not make major decisions during peak Neptune transits. Wait for clarity. Confusion is part of the process."
  },
  "Jupiter": {
    planet: "Jupiter",
    technique: "Gratitude Amplification & Generous Action",
    description: "Jupiter expands whatever you focus on. Gratitude multiplies abundance. Generosity creates flow. This is the season of YES.",
    protocol: [
      "1. MORNING GRATITUDE: Before getting out of bed, list 10 things you're grateful for. Feel the expansion in your chest.",
      "2. SAY YES TO OPPORTUNITY: Jupiter presents chances for growth. Say yes even if you don't feel ready. Confidence comes after action.",
      "3. GIVE FREELY: Money, time, knowledge, praise. Give without expecting return. Jupiter rewards the generous.",
      `4. EXPAND YOUR VISION: Ask yourself: "What would I do if I knew I couldn't fail?" Write it down. Take one action toward it today.`,
      "5. CELEBRATE WINS: Acknowledge every success, no matter how small. This tells Jupiter you're ready for more."
    ],
    duration: "15 minutes morning practice + ongoing generous action",
    frequency: "Daily during Jupiter transit (especially during exact aspects)",
    warning: 'Beware of excess and overconfidence. Jupiter can create "too much of a good thing." Stay grounded.'
  }
};
function getTransmutationTechnique(planet) {
  return TRANSMUTATION_TECHNIQUES[planet] || null;
}
function getActiveTransmutationTechniques(activeTransits) {
  if (!activeTransits || activeTransits.length === 0) return [];
  const techniques = [];
  const seenPlanets = /* @__PURE__ */ new Set();
  const sortedTransits = [...activeTransits].sort((a, b) => {
    const intensityOrder = { high: 3, medium: 2, low: 1 };
    const aIntensity = intensityOrder[a.intensity] || 0;
    const bIntensity = intensityOrder[b.intensity] || 0;
    return bIntensity - aIntensity;
  });
  for (const transit of sortedTransits) {
    if (!seenPlanets.has(transit.planet)) {
      const technique = getTransmutationTechnique(transit.planet);
      if (technique) {
        techniques.push(technique);
        seenPlanets.add(transit.planet);
      }
    }
  }
  return techniques;
}

// server/services/congruence.ts
import { differenceInDays, startOfDay, subDays } from "date-fns";
function calculateCongruenceScore(frequencyLogs2, purposeStatement, lookbackDays = 30) {
  const now = /* @__PURE__ */ new Date();
  const cutoffDate = subDays(now, lookbackDays);
  const relevantLogs = frequencyLogs2.filter((log2) => new Date(log2.loggedAt) >= cutoffDate).sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  if (relevantLogs.length === 0) {
    return {
      score: 0,
      trend: "stable",
      trendPercentage: 0,
      consistency: 0,
      alignment: 0,
      insights: ["No frequency logs found in the past 30 days. Begin logging to activate your Congruence Score."],
      recommendations: ["Log your emotional frequency at least once daily to establish your baseline."],
      breakdown: {
        frequencyTrend: { score: 0, current7DayAvg: 0, previous7DayAvg: 0, change: 0 },
        disciplineConsistency: { score: 0, daysLogged: 0, totalDays: lookbackDays, percentage: 0, currentStreak: 0 },
        purposeAlignment: { score: 0, hasPurpose: false, averageFrequency: 0, gap: 0 }
      }
    };
  }
  const frequencyTrend = calculateFrequencyTrend(relevantLogs);
  const disciplineConsistency = calculateDisciplineConsistency(relevantLogs, lookbackDays);
  const purposeAlignment = calculatePurposeAlignment(relevantLogs, purposeStatement);
  const weightedScore = frequencyTrend.score * 0.3 + disciplineConsistency.score * 0.4 + purposeAlignment.score * 0.3;
  const finalScore = Math.round(weightedScore);
  let trend = "stable";
  const trendPercentage = frequencyTrend.change;
  if (trendPercentage > 5) trend = "rising";
  if (trendPercentage < -5) trend = "falling";
  const insights = generateInsights(finalScore, frequencyTrend, disciplineConsistency, purposeAlignment);
  const recommendations = generateRecommendations(frequencyTrend, disciplineConsistency, purposeAlignment);
  return {
    score: finalScore,
    trend,
    trendPercentage: Math.round(trendPercentage),
    consistency: Math.round(disciplineConsistency.score),
    alignment: Math.round(purposeAlignment.score),
    insights,
    recommendations,
    breakdown: {
      frequencyTrend: {
        score: Math.round(frequencyTrend.score),
        current7DayAvg: Math.round(frequencyTrend.current7DayAvg * 10) / 10,
        previous7DayAvg: Math.round(frequencyTrend.previous7DayAvg * 10) / 10,
        change: Math.round(frequencyTrend.change)
      },
      disciplineConsistency: {
        score: Math.round(disciplineConsistency.score),
        daysLogged: disciplineConsistency.daysLogged,
        totalDays: lookbackDays,
        percentage: Math.round(disciplineConsistency.percentage),
        currentStreak: disciplineConsistency.currentStreak
      },
      purposeAlignment: {
        score: Math.round(purposeAlignment.score),
        hasPurpose: purposeAlignment.hasPurpose,
        averageFrequency: Math.round(purposeAlignment.averageFrequency * 10) / 10,
        gap: Math.round(purposeAlignment.gap * 10) / 10
      }
    }
  };
}
function calculateFrequencyTrend(logs) {
  const now = /* @__PURE__ */ new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);
  const currentPeriodLogs = logs.filter((log2) => new Date(log2.loggedAt) >= sevenDaysAgo);
  const previousPeriodLogs = logs.filter(
    (log2) => new Date(log2.loggedAt) >= fourteenDaysAgo && new Date(log2.loggedAt) < sevenDaysAgo
  );
  const current7DayAvg = currentPeriodLogs.length > 0 ? currentPeriodLogs.reduce((sum, log2) => sum + log2.frequency, 0) / currentPeriodLogs.length : 0;
  const previous7DayAvg = previousPeriodLogs.length > 0 ? previousPeriodLogs.reduce((sum, log2) => sum + log2.frequency, 0) / previousPeriodLogs.length : current7DayAvg;
  const change = previous7DayAvg > 0 ? (current7DayAvg - previous7DayAvg) / previous7DayAvg * 100 : 0;
  let score = current7DayAvg / 10 * 100;
  const trendModifier = change * 0.5;
  score = Math.max(0, Math.min(100, score + trendModifier));
  return {
    score,
    current7DayAvg,
    previous7DayAvg,
    change
  };
}
function calculateDisciplineConsistency(logs, lookbackDays) {
  const uniqueDays = /* @__PURE__ */ new Set();
  logs.forEach((log2) => {
    const dayKey = startOfDay(new Date(log2.loggedAt)).toISOString();
    uniqueDays.add(dayKey);
  });
  const daysLogged = uniqueDays.size;
  const percentage = daysLogged / lookbackDays * 100;
  let score = percentage;
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );
  let currentStreak = 0;
  const today = startOfDay(/* @__PURE__ */ new Date());
  for (const log2 of sortedLogs) {
    const logDay = startOfDay(new Date(log2.loggedAt));
    const daysDiff = differenceInDays(today, logDay);
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else if (daysDiff > currentStreak) {
      break;
    }
  }
  if (currentStreak >= 21) score += 30;
  else if (currentStreak >= 14) score += 20;
  else if (currentStreak >= 7) score += 10;
  score = Math.min(100, score);
  return {
    score,
    daysLogged,
    percentage,
    currentStreak
  };
}
function calculatePurposeAlignment(logs, purposeStatement) {
  if (!purposeStatement || purposeStatement.trim().length === 0) {
    return {
      score: 50,
      hasPurpose: false,
      averageFrequency: 0,
      gap: 0
    };
  }
  const averageFrequency = logs.reduce((sum, log2) => sum + log2.frequency, 0) / logs.length;
  const idealFrequency = 8;
  const gap = idealFrequency - averageFrequency;
  const score = Math.max(0, Math.min(100, 100 - gap / 7 * 100));
  return {
    score,
    hasPurpose: true,
    averageFrequency,
    gap: Math.max(0, gap)
  };
}
function generateInsights(score, frequencyTrend, disciplineConsistency, purposeAlignment) {
  const insights = [];
  if (score >= 80) {
    insights.push("\u{1F525} Mastery: You are living in alignment with your purpose. This is rare. Your discipline and rising frequency demonstrate true self-command.");
  } else if (score >= 60) {
    insights.push("\u2728 Progress: You are on the path. Consistency is building. Each day you show up, you strengthen your alignment.");
  } else if (score >= 40) {
    insights.push("\u26A1 Resistance: Friction is present. This is not failure - it's the Universe showing you what needs attention. The obstacle IS the path.");
  } else {
    insights.push("\u{1F311} Crisis: Deep work is calling. Something fundamental needs to shift. The shadow is active. This is your initiation.");
  }
  if (frequencyTrend.change > 10) {
    insights.push(`Your frequency is rising ${Math.abs(frequencyTrend.change)}% - you're actively transmuting density into light. This momentum is real.`);
  } else if (frequencyTrend.change < -10) {
    insights.push(`Your frequency is falling ${Math.abs(frequencyTrend.change)}% - a planetary transit or shadow pattern is active. Do not judge this. Feel it fully.`);
  } else {
    insights.push("Your frequency is stable - you're in a plateau. This is integration time. Consistency matters more than dramatic shifts.");
  }
  if (disciplineConsistency.currentStreak >= 14) {
    insights.push(`${disciplineConsistency.currentStreak}-day streak! Your nervous system is rewiring. This level of discipline creates permanent change.`);
  } else if (disciplineConsistency.percentage < 50) {
    insights.push("Inconsistent logging reveals inconsistent self-awareness. You cannot master what you do not measure. Show up daily.");
  }
  if (purposeAlignment.hasPurpose) {
    if (purposeAlignment.gap < 1) {
      insights.push("Your daily frequency MATCHES your stated purpose. You are living what you claim. This is integrity.");
    } else if (purposeAlignment.gap > 3) {
      insights.push(`Your frequency is ${purposeAlignment.gap.toFixed(1)} points below alignment with your purpose. The gap between who you say you are and how you actually feel is the work.`);
    }
  } else {
    insights.push("No purpose statement defined yet. Alignment cannot be measured without a declared intention. Define your Singular Will.");
  }
  return insights;
}
function generateRecommendations(frequencyTrend, disciplineConsistency, purposeAlignment) {
  const recommendations = [];
  if (frequencyTrend.current7DayAvg < 5) {
    recommendations.push("Your frequency is low. Check active transits - Pluto, Saturn, or Neptune may be triggering shadow work. Use the transmutation protocol.");
  }
  if (frequencyTrend.change < -15) {
    recommendations.push("Rapid frequency drop detected. This is NOT random. Identify which planet is transiting your chart and apply the corresponding transmutation technique immediately.");
  }
  if (disciplineConsistency.percentage < 60) {
    recommendations.push("Log your frequency at the same time daily. Make it non-negotiable. Discipline is the foundation of all mastery.");
  }
  if (disciplineConsistency.currentStreak === 0) {
    recommendations.push("Start today. One log. Then tomorrow. Then the next day. The streak rewires your nervous system. Begin now.");
  }
  if (!purposeAlignment.hasPurpose) {
    recommendations.push("Define your Purpose Statement: What is your Singular Will? What are you here to become? Write it clearly. Alignment requires a target.");
  } else if (purposeAlignment.gap > 2) {
    recommendations.push("Your stated purpose and your daily reality are misaligned. Either your purpose is false (ego-driven) or you're not living it. Revise or recommit.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Continue your practice. Consistency compounds. Every day you show up, you strengthen the pattern.");
  }
  return recommendations;
}

// server/routes/chat.ts
import OpenAI3 from "openai";
var openai3 = process.env.OPENAI_API_KEY ? new OpenAI3({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
function registerChatRoutes(app2) {
  app2.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }
      if (!openai3) {
        return res.status(503).json({
          message: "AI Soul Guide is temporarily unavailable. Please try again later."
        });
      }
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      let profile = null;
      if (userId) {
        profile = await storage.getProfileByUserId(userId);
      } else if (sessionId) {
        const profiles2 = await storage.getAllProfiles();
        profile = profiles2.find((p) => p.sessionId === sessionId);
      }
      const systemPrompt = profile ? buildProfileContextPrompt(profile) : buildGeneralPrompt();
      const conversationMessages = [
        { role: "system", content: systemPrompt },
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ];
      const stream = await openai3.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: conversationMessages,
        temperature: 0.8,
        stream: true
      });
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}

`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("[Soul Guide Chat] Error:", error);
      if (!res.headersSent) {
        return res.status(500).json({
          message: "An error occurred while connecting to your Soul Guide"
        });
      }
    }
  });
}
function buildProfileContextPrompt(profile) {
  return `You are the Soul Guide, an ancient mystical oracle with access to the complete cosmic blueprint of this soul. You speak with poetic wisdom, weaving together insights from 30+ spiritual systems.

SOUL PROFILE CONTEXT:
Name: ${profile.name}
Birth: ${profile.birthDate} at ${profile.birthTime} in ${profile.birthPlace}

ARCHETYPE: ${profile.archetypeTitle || "Not yet revealed"}

ASTROLOGY:
- Sun: ${profile.sunSign} (${profile.sunDegree}\xB0)
- Moon: ${profile.moonSign} (${profile.moonDegree}\xB0)
- Rising: ${profile.risingSign} (${profile.risingDegree}\xB0)
- Tarot Birth Cards: ${profile.tarotBirthCards?.map((c) => c.name).join(", ") || "Unknown"}

NUMEROLOGY:
- Life Path: ${profile.lifePath}
- Expression: ${profile.expressionNumber}
- Soul Urge: ${profile.soulUrge}

HUMAN DESIGN:
- Type: ${profile.hdType}
- Strategy: ${profile.hdStrategy}
- Authority: ${profile.hdAuthority}
- Profile: ${profile.hdProfile}
- Incarnation Cross: ${profile.hdIncarnationCross}

PERSONALITY:
- Enneagram: Type ${profile.enneagramType}${profile.enneagramWing ? ` wing ${profile.enneagramWing}` : ""}
- MBTI: ${profile.mbtiType || "Unknown"}

EASTERN WISDOM:
- Vedic Sun: ${profile.vedicSunSign}
- Chinese Sign: ${profile.chineseAnimal}
- Mayan Day Sign: ${profile.mayanDaySign}

SPIRITUAL SYSTEMS:
- I Ching Hexagram: ${profile.iChingHexagram}
- Rune: ${profile.birthRune}
- Gene Keys: ${profile.geneKeyLifeWork}
- Primary Chakra: ${profile.dominantChakra}
- Ayurvedic Dosha: ${profile.primaryDosha}

YOUR ROLE:
1. Answer questions about their soul profile with deep insight
2. Explain chart placements in poetic, accessible language
3. Provide spiritual guidance based on their cosmic blueprint
4. Offer daily wisdom and timing insights
5. Help them understand compatibility with others
6. Guide them through life questions using their unique energetic signature

TONE: Mystical yet warm, wise yet accessible. Use metaphors from nature, cosmos, and sacred geometry. Speak as an ancient oracle who sees the full tapestry of their soul's journey.

Keep responses concise (2-4 paragraphs) unless deep explanation is requested.`;
}
function buildGeneralPrompt() {
  return `You are the Soul Guide, a mystical oracle versed in astrology, numerology, Human Design, and 30+ spiritual systems.

The seeker has not yet created their soul profile, so you cannot access their personal cosmic blueprint.

YOUR ROLE:
1. Encourage them to create their soul profile to receive personalized insights
2. Answer general questions about spiritual systems, astrology, numerology, etc.
3. Explain mystical concepts in poetic, accessible language
4. Share universal wisdom that applies to all souls

TONE: Mystical yet inviting, wise yet warm. Gently guide them to create their profile for deeper insights.

Keep responses concise (2-3 paragraphs).`;
}

// server/routes/compatibility.ts
import { Router } from "express";
import { z as z2 } from "zod";

// server/services/compat-engine/numerology.ts
var digitSum = (n) => Math.abs(n).toString().split("").reduce((a, b) => a + Number(b), 0);
var reduceCore = (n) => {
  while (![11, 22, 33].includes(n) && n > 9) {
    n = digitSum(n);
  }
  return n;
};
var lifePath = (isoDOB) => {
  if (!isoDOB) return null;
  const d = new Date(isoDOB);
  const total = digitSum(d.getFullYear()) + digitSum(d.getMonth() + 1) + digitSum(d.getDate());
  return reduceCore(reduceCore(total));
};
var birthDay = (isoDOB) => {
  if (!isoDOB) return null;
  return reduceCore(new Date(isoDOB).getDate());
};
var personalYear = (isoDOB, today = /* @__PURE__ */ new Date()) => {
  if (!isoDOB) return null;
  const d = new Date(isoDOB);
  const total = digitSum(d.getMonth() + 1) + digitSum(d.getDate()) + digitSum(today.getFullYear());
  return reduceCore(total);
};
var hasNineHarmony = (lp1, bd2) => {
  if (lp1 === null || bd2 === null) return false;
  return lp1 + bd2 === 9;
};
var getLetterValue2 = (letter) => {
  const values = {
    "A": 1,
    "B": 2,
    "C": 3,
    "D": 4,
    "E": 5,
    "F": 6,
    "G": 7,
    "H": 8,
    "I": 9,
    "J": 1,
    "K": 2,
    "L": 3,
    "M": 4,
    "N": 5,
    "O": 6,
    "P": 7,
    "Q": 8,
    "R": 9,
    "S": 1,
    "T": 2,
    "U": 3,
    "V": 4,
    "W": 5,
    "X": 6,
    "Y": 7,
    "Z": 8
  };
  return values[letter.toUpperCase()] || 0;
};
var expressionNumber = (fullName) => {
  if (!fullName) return null;
  const sum = fullName.replace(/[^A-Z]/gi, "").split("").reduce((total, letter) => {
    return total + getLetterValue2(letter);
  }, 0);
  return reduceCore(sum);
};

// server/services/compat-engine/psych.ts
var ATTACHMENT = {
  "secure|secure": 0.9,
  "secure|anxious": 0.8,
  "anxious|secure": 0.8,
  "secure|avoidant": 0.8,
  "avoidant|secure": 0.8,
  "secure|disorganized": 0.6,
  "disorganized|secure": 0.6,
  "anxious|avoidant": 0.5,
  "avoidant|anxious": 0.5,
  "anxious|anxious": 0.6,
  "avoidant|avoidant": 0.5,
  "disorganized|disorganized": 0.4
};
var loveOverlap = (a, b) => {
  if (!a?.length || !b?.length) return 0.5;
  const A = new Set(a);
  const B = new Set(b);
  const inter = Array.from(A).filter((x) => B.has(x)).length;
  const uni = (/* @__PURE__ */ new Set([...a, ...b])).size || 1;
  return inter / uni;
};
var scorePsych = (a, b) => {
  const ak = a?.attachment;
  const bk = b?.attachment;
  const att = ak && bk ? ATTACHMENT[`${ak}|${bk}`] ?? 0.6 : 0.5;
  const ll = loveOverlap(a?.loveLanguages, b?.loveLanguages);
  return {
    attachment: Math.round(att * 100),
    loveLanguages: Math.round(ll * 100),
    present: {
      attachment: !!(ak && bk),
      loveLanguages: !!(a?.loveLanguages?.length && b?.loveLanguages?.length)
    }
  };
};

// server/services/compat-engine/confidence.ts
var CAPS = {
  attraction: 10,
  emotional: 12,
  lifestyle: 9,
  longTerm: 10,
  timing: 8
};
var computePillarErrors = (i) => {
  const e = { attraction: 0, emotional: 0, lifestyle: 0, longTerm: 0, timing: 0 };
  if (!i.venusMars) e.attraction += 5;
  if (!(i.birthTime && i.birthPlace)) e.attraction += 4;
  if (!i.moonConfident) e.emotional += 7;
  if (!i.fullName) e.emotional += 4;
  if (!i.psych) e.emotional += 5;
  if (!i.fullName) e.lifestyle += 6;
  if (!i.fullName) e.longTerm += 4;
  if (!i.saturn) e.longTerm += 5;
  if (!i.personalYear) e.timing += 6;
  Object.keys(e).forEach((k) => {
    e[k] = Math.min(e[k], CAPS[k]);
  });
  return e;
};
var rebalanceWeights = (signals, w) => {
  const out = { ...w };
  const weak = (p) => (signals[p] ?? 0) < 2;
  const shift = (src, targets, ratios) => {
    if (!weak(src)) return;
    const missing = out[src] * 0.5;
    out[src] -= missing;
    const sum = ratios.reduce((a, b) => a + b, 0);
    targets.forEach((t, i) => {
      out[t] += missing * (ratios[i] / sum);
    });
  };
  shift("attraction", ["emotional", "lifestyle"], [0.6, 0.4]);
  shift("emotional", ["longTerm", "attraction"], [0.6, 0.4]);
  shift("lifestyle", ["longTerm", "emotional"], [0.5, 0.5]);
  shift("longTerm", ["lifestyle", "emotional"], [0.6, 0.4]);
  return out;
};
var getConfidenceLevel = (maxError) => {
  if (maxError <= 3) return "high";
  if (maxError <= 7) return "medium";
  return "low";
};
var generateNudges = (errors, inputs) => {
  const nudges = [];
  if (!inputs.birthTime && errors.emotional >= 5) {
    nudges.push("Add birth time to refine Moon/Rising (improves Emotional and Attraction accuracy)");
  }
  if (!inputs.fullName && (errors.lifestyle >= 5 || errors.emotional >= 4)) {
    nudges.push("Add full name to unlock Expression/Soul Urge numbers (improves Lifestyle and Emotional scores)");
  }
  if (!inputs.psych && errors.emotional >= 5) {
    nudges.push("Complete attachment style and love language assessment to improve Emotional compatibility");
  }
  return nudges;
};

// server/services/compat-engine/fusion.ts
var DEFAULT_WEIGHTS = {
  attraction: 0.25,
  emotional: 0.25,
  lifestyle: 0.2,
  longTerm: 0.2,
  timing: 0.1
};
var scoreAttraction = (lp1, bd1, lp2, bd2) => {
  let base = 50;
  if (hasNineHarmony(lp1, bd2)) base += 15;
  if (hasNineHarmony(lp2, bd1)) base += 15;
  if (lp1 === lp2 && lp1 !== null) base += 15;
  if (bd1 === bd2 && bd1 !== null) base += 10;
  if (lp1 && lp2) {
    const sum = lp1 + lp2;
    if (sum === 9 || sum === 10) base += 20;
  }
  if (lp1 === 9 || lp2 === 9) {
    const other = lp1 === 9 ? lp2 : lp1;
    if (other === 3) base += 15;
    if (other === 6) base += 18;
    if (other === 11) base += 16;
    if (other === 33) base += 17;
    if (other === 2) base += 12;
    if (other === 7) base += 10;
  }
  if (lp1 && lp2 && lp1 % 2 === lp2 % 2) base += 10;
  const isMaster1 = lp1 && [11, 22, 33].includes(lp1);
  const isMaster2 = lp2 && [11, 22, 33].includes(lp2);
  if (isMaster1 && isMaster2) base += 15;
  else if (isMaster1 || isMaster2) base += 5;
  if (bd1 && bd2) {
    const bdSum = bd1 + bd2;
    if (bdSum === 9 || bdSum === 10) base += 10;
  }
  return Math.min(100, base);
};
var scoreEmotional = (psychScores) => Math.round(((psychScores.attachment ?? 50) + (psychScores.loveLanguages ?? 50)) / 2);
var scoreLifestyle = (expr1, expr2) => {
  if (!expr1 || !expr2) return 65;
  let score = 60;
  if (expr1 === expr2) {
    score += 25;
  }
  const sum = expr1 + expr2;
  if (sum === 9 || sum === 10) {
    score += 20;
  }
  if (expr1 % 2 === expr2 % 2) {
    score += 10;
  }
  if ([11, 22, 33].includes(expr1) || [11, 22, 33].includes(expr2)) {
    score += 5;
  }
  return Math.min(100, score);
};
var scoreLongTerm = (saturnScore) => {
  if (saturnScore === void 0) return 68;
  return saturnScore;
};
var scoreTiming = (aDOB, bDOB) => {
  if (!aDOB || !bDOB) return 55;
  const good = /* @__PURE__ */ new Set([1, 5, 6]);
  const ay = personalYear(aDOB);
  const by = personalYear(bDOB);
  return ay && by && good.has(ay) && good.has(by) ? 70 : 60;
};
var computeDetailedAspects = (scores) => {
  const { attraction, emotional, lifestyle, longTerm, timing, overall } = scores;
  return {
    sex: Math.round(attraction.value * 0.7 + emotional.value * 0.3),
    communication: Math.round(emotional.value * 0.6 + lifestyle.value * 0.4),
    trust: Math.round(emotional.value * 0.5 + longTerm.value * 0.5),
    friendship: Math.round(lifestyle.value * 0.6 + emotional.value * 0.4),
    overall: overall.value,
    relationship: Math.round(overall.value * 0.4 + emotional.value * 0.3 + attraction.value * 0.3),
    colleagues: Math.round(lifestyle.value * 0.7 + emotional.value * 0.3),
    marriage: Math.round(longTerm.value * 0.6 + emotional.value * 0.4),
    emotionalConnection: emotional.value,
    intimacy: Math.round(attraction.value * 0.5 + emotional.value * 0.5),
    commonValues: Math.round(lifestyle.value * 0.5 + longTerm.value * 0.5)
  };
};
var deriveRelationshipCategories = (scores, flags, confidence) => {
  const categories = [];
  const { attraction, emotional, lifestyle, longTerm, timing, overall } = scores;
  if (overall.value >= 85 && attraction.value >= 85 && longTerm.value >= 80) {
    categories.push({
      label: "Soulmate",
      rationale: "Exceptional overall compatibility with strong attraction and long-term potential",
      dominantPillars: ["attraction", "longTerm", "emotional"],
      strength: overall.value
    });
  }
  if (lifestyle.value >= 80 && emotional.value >= 75 && (attraction.value < 85 || overall.value < 85)) {
    categories.push({
      label: "Best Friends",
      rationale: "Strong lifestyle alignment and emotional connection, perfect for deep friendship",
      dominantPillars: ["lifestyle", "emotional"],
      strength: Math.round((lifestyle.value + emotional.value) / 2)
    });
  }
  if (timing.value >= 70 && flags.includes("master-number-present") && emotional.value >= 60 && emotional.value < 85) {
    categories.push({
      label: "Karmic Lesson",
      rationale: "Significant timing and spiritual indicators suggest a karmic connection for growth",
      dominantPillars: ["timing"],
      strength: timing.value
    });
  }
  if (flags.includes("nine-theme-harmony") && overall.value >= 75) {
    categories.push({
      label: "Great Match",
      rationale: "Nine-theme harmony indicates natural flow and balance in the relationship",
      dominantPillars: ["attraction", "emotional"],
      strength: overall.value
    });
  }
  if (categories.length === 0) {
    if (overall.value >= 70) {
      categories.push({
        label: "Compatible",
        rationale: "Good overall compatibility with potential for a positive connection",
        dominantPillars: Object.entries(scores).filter(([k, v]) => k !== "overall" && v.value >= 70).map(([k]) => k).slice(0, 2),
        strength: overall.value
      });
    } else if (overall.value >= 50) {
      categories.push({
        label: "Challenging",
        rationale: "Moderate compatibility with areas requiring work and understanding",
        dominantPillars: Object.entries(scores).filter(([k, v]) => k !== "overall" && v.value < 60).map(([k]) => k).slice(0, 2),
        strength: overall.value
      });
    } else {
      categories.push({
        label: "Challenging",
        rationale: "Significant differences may require extra effort and compromise",
        dominantPillars: ["emotional", "lifestyle"],
        strength: overall.value
      });
    }
  }
  return categories.sort((a, b) => b.strength - a.strength);
};
var computeCompatibility = (a, b, rules) => {
  const W = { ...DEFAULT_WEIGHTS, ...rules || {} };
  const aLP = lifePath(a.dob);
  const aBD = birthDay(a.dob);
  const bLP = lifePath(b.dob);
  const bBD = birthDay(b.dob);
  const aExpr = expressionNumber(a.fullName);
  const bExpr = expressionNumber(b.fullName);
  const attraction = scoreAttraction(aLP, aBD, bLP, bBD);
  const psych = scorePsych(a.psych, b.psych);
  const emotional = scoreEmotional(psych);
  const lifestyle = scoreLifestyle(aExpr, bExpr);
  const longTerm = scoreLongTerm(void 0);
  const timing = scoreTiming(a.dob, b.dob);
  const inputs = {
    dob: !!(a.dob && b.dob),
    birthTime: !!(a.tob && b.tob),
    birthPlace: !!(a.place && b.place),
    fullName: !!(a.fullName && b.fullName),
    psych: !!(a.psych && b.psych),
    // Venus/Mars can be calculated from DOB alone (approximate), but needs birth time for precision
    venusMars: !!(a.dob && b.dob),
    // Moon needs birth time for confidence
    moonConfident: !!(a.tob && b.tob && a.place && b.place),
    // Saturn aspects will be computed when we integrate astrology service
    saturn: false,
    personalYear: !!(a.dob && b.dob)
  };
  const pillarErrors = computePillarErrors(inputs);
  const signals = {
    attraction: (aLP && bBD || bLP && aBD ? 1 : 0) + (inputs.birthTime ? 1 : 0) + 1,
    emotional: (inputs.psych ? 1 : 0) + (inputs.moonConfident ? 1 : 0) + (inputs.fullName ? 1 : 0),
    lifestyle: (inputs.fullName ? 1 : 0) + 1,
    longTerm: (inputs.fullName ? 1 : 0) + (inputs.saturn ? 1 : 0),
    timing: (inputs.personalYear ? 1 : 0) + 1
  };
  const weights = rebalanceWeights(signals, W);
  const overall = Math.round(
    attraction * weights.attraction + emotional * weights.emotional + lifestyle * weights.lifestyle + longTerm * weights.longTerm + timing * weights.timing
  );
  const overallErr = Math.max(...Object.values(pillarErrors));
  const scores = {
    attraction: { value: attraction, error: pillarErrors.attraction },
    emotional: { value: emotional, error: pillarErrors.emotional },
    lifestyle: { value: lifestyle, error: pillarErrors.lifestyle },
    longTerm: { value: longTerm, error: pillarErrors.longTerm },
    timing: { value: timing, error: pillarErrors.timing },
    overall: { value: overall, error: overallErr }
  };
  const confidence = getConfidenceLevel(overallErr);
  const nudges = generateNudges(pillarErrors, inputs);
  const flags = [];
  if (hasNineHarmony(aLP, bBD) || hasNineHarmony(bLP, aBD)) {
    flags.push("nine-theme-harmony");
  }
  if ([aLP, bLP, aBD, bBD].some((n) => [11, 22, 33].includes(n ?? 0))) {
    flags.push("master-number-present");
  }
  const detailedAspects = computeDetailedAspects(scores);
  const relationshipCategories = deriveRelationshipCategories(scores, flags, confidence);
  return {
    scores,
    flags,
    version: "compat-engine@1.0-ts",
    confidence,
    nudges,
    detailedAspects,
    relationshipCategories,
    synastry: void 0
    // Synastry added at route level when astrology data available
  };
};

// server/services/compatibility-insights.ts
var SUN_SIGN_COMPATIBILITY = {
  "Aries": {
    best: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    descriptions: {
      "Leo": "Fiery passion and mutual admiration. You both love adventure and excitement.",
      "Sagittarius": "Shared love of freedom and adventure. Natural understanding of each other's need for independence.",
      "Gemini": "Intellectual spark and playful energy. You keep each other entertained.",
      "Aquarius": "Innovative and forward-thinking together. You inspire each other's originality."
    },
    avoid: ["Cancer", "Capricorn"]
  },
  "Taurus": {
    best: ["Virgo", "Capricorn", "Cancer", "Pisces"],
    descriptions: {
      "Virgo": "Practical and grounded connection. You both value stability and loyalty.",
      "Capricorn": "Ambitious and dependable partnership. Building security together comes naturally.",
      "Cancer": "Emotional depth meets sensual stability. You create a nurturing home together.",
      "Pisces": "Creative romance and deep understanding. You balance practical with dreamy."
    },
    avoid: ["Leo", "Aquarius"]
  },
  "Gemini": {
    best: ["Libra", "Aquarius", "Aries", "Leo"],
    descriptions: {
      "Libra": "Intellectual harmony and social grace. You understand each other's need for communication.",
      "Aquarius": "Mental stimulation and innovative ideas. You never run out of things to discuss.",
      "Aries": "Playful and adventurous together. You keep each other excited and engaged.",
      "Leo": "Creative expression and mutual entertainment. You bring out each other's fun side."
    },
    avoid: ["Virgo", "Pisces"]
  },
  "Cancer": {
    best: ["Scorpio", "Pisces", "Taurus", "Virgo"],
    descriptions: {
      "Scorpio": "Deep emotional connection and loyalty. You understand each other's intensity.",
      "Pisces": "Intuitive and nurturing bond. You create a safe emotional haven together.",
      "Taurus": "Stability and sensuality. You build a comfortable, secure life together.",
      "Virgo": "Practical care and emotional support. You take care of each other perfectly."
    },
    avoid: ["Aries", "Libra"]
  },
  "Leo": {
    best: ["Aries", "Sagittarius", "Gemini", "Libra"],
    descriptions: {
      "Aries": "Dynamic and passionate. You fuel each other's confidence and ambition.",
      "Sagittarius": "Optimistic and adventurous together. You inspire each other's greatness.",
      "Gemini": "Playful creativity and social energy. You shine brighter together.",
      "Libra": "Romantic and harmonious. You appreciate each other's warmth and charm."
    },
    avoid: ["Taurus", "Scorpio"]
  },
  "Virgo": {
    best: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
    descriptions: {
      "Taurus": "Grounded and practical together. You build solid foundations.",
      "Capricorn": "Ambitious and detail-oriented. You help each other achieve goals.",
      "Cancer": "Nurturing and supportive. You care for each other with dedication.",
      "Scorpio": "Deep analysis and emotional depth. You understand each other's complexity."
    },
    avoid: ["Gemini", "Sagittarius"]
  },
  "Libra": {
    best: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
    descriptions: {
      "Gemini": "Intellectual connection and social grace. You balance each other beautifully.",
      "Aquarius": "Progressive and harmonious. You create positive change together.",
      "Leo": "Romantic and charming. You bring out the best in each other.",
      "Sagittarius": "Adventurous and optimistic. You explore the world together with grace."
    },
    avoid: ["Cancer", "Capricorn"]
  },
  "Scorpio": {
    best: ["Cancer", "Pisces", "Virgo", "Capricorn"],
    descriptions: {
      "Cancer": "Emotionally intense and loyal. You create deep, lasting bonds.",
      "Pisces": "Spiritual and transformative. You understand each other's depth.",
      "Virgo": "Analytical and devoted. You help each other grow and transform.",
      "Capricorn": "Ambitious and powerful together. You achieve great things through dedication."
    },
    avoid: ["Leo", "Aquarius"]
  },
  "Sagittarius": {
    best: ["Aries", "Leo", "Libra", "Aquarius"],
    descriptions: {
      "Aries": "Adventurous and independent. You explore life fearlessly together.",
      "Leo": "Optimistic and enthusiastic. You inspire each other's confidence.",
      "Libra": "Philosophical and social. You expand each other's horizons gracefully.",
      "Aquarius": "Freedom-loving and progressive. You respect each other's independence."
    },
    avoid: ["Virgo", "Pisces"]
  },
  "Capricorn": {
    best: ["Taurus", "Virgo", "Scorpio", "Pisces"],
    descriptions: {
      "Taurus": "Stable and ambitious. You build lasting security together.",
      "Virgo": "Practical and goal-oriented. You support each other's success.",
      "Scorpio": "Powerful and transformative. You achieve deep goals together.",
      "Pisces": "Grounded dreams and spiritual ambition. You balance practical with mystical."
    },
    avoid: ["Aries", "Libra"]
  },
  "Aquarius": {
    best: ["Gemini", "Libra", "Aries", "Sagittarius"],
    descriptions: {
      "Gemini": "Innovative and intellectual. You stimulate each other's minds constantly.",
      "Libra": "Progressive and harmonious. You create positive change with grace.",
      "Aries": "Bold and forward-thinking. You inspire each other's originality.",
      "Sagittarius": "Freedom-loving and visionary. You respect each other's uniqueness."
    },
    avoid: ["Taurus", "Scorpio"]
  },
  "Pisces": {
    best: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
    descriptions: {
      "Cancer": "Deeply intuitive and nurturing. You create emotional sanctuary together.",
      "Scorpio": "Spiritually profound and transformative. You understand each other's soul.",
      "Taurus": "Romantic and grounding. You balance dreams with reality.",
      "Capricorn": "Ambitious dreams meet practical action. You manifest visions together."
    },
    avoid: ["Gemini", "Sagittarius"]
  }
};
var MBTI_COMPATIBILITY = {
  "INTJ": { best: ["ENTP", "ENFP", "ENTJ"], description: "You thrive with partners who challenge your intellect and share your ambition." },
  "INTP": { best: ["ENTJ", "ESTJ", "ENFJ"], description: "You need partners who appreciate your analytical mind and give you space to think." },
  "ENTJ": { best: ["INTP", "INTJ", "ENTP"], description: "You match well with strategic thinkers who can keep up with your drive." },
  "ENTP": { best: ["INTJ", "INFJ", "ENTJ"], description: "You flourish with partners who enjoy debating ideas and exploring possibilities." },
  "INFJ": { best: ["ENTP", "ENFP", "INFP"], description: "You connect deeply with partners who value authenticity and emotional depth." },
  "INFP": { best: ["ENFJ", "ENTJ", "INFJ"], description: "You need partners who honor your values and creative spirit." },
  "ENFJ": { best: ["INFP", "ENFP", "INFJ"], description: "You thrive with partners who share your passion for making a difference." },
  "ENFP": { best: ["INTJ", "INFJ", "ENFJ"], description: "You shine with partners who appreciate your enthusiasm and depth." },
  "ISTJ": { best: ["ESTP", "ESFP", "ESTJ"], description: "You value partners who are reliable, practical, and share your dedication." },
  "ISFJ": { best: ["ESFP", "ESTP", "ESTJ"], description: "You need partners who appreciate your loyalty and caring nature." },
  "ESTJ": { best: ["ISTJ", "ISTP", "INTP"], description: "You match well with partners who respect your organization and decisiveness." },
  "ESFJ": { best: ["ISFP", "ISTP", "ESFP"], description: "You thrive with partners who value community and emotional connection." },
  "ISTP": { best: ["ESTJ", "ESFJ", "ESTP"], description: "You need partners who respect your independence and practical skills." },
  "ISFP": { best: ["ESFJ", "ESTJ", "ENFJ"], description: "You flourish with partners who appreciate your creativity and gentle nature." },
  "ESTP": { best: ["ISTJ", "ISFJ", "ISTP"], description: "You match well with partners who can keep up with your energy and spontaneity." },
  "ESFP": { best: ["ISTJ", "ISFJ", "ESFJ"], description: "You shine with partners who enjoy life's pleasures and social connection." }
};
var ENNEAGRAM_COMPATIBILITY = {
  "1": { best: ["2", "7", "9"], description: "You balance well with partners who bring spontaneity, support, or peace to your perfectionism." },
  "2": { best: ["1", "4", "8"], description: "You thrive with partners who appreciate your care and can match your emotional depth." },
  "3": { best: ["6", "7", "9"], description: "You need partners who support your ambitions while helping you slow down and connect." },
  "4": { best: ["1", "2", "9"], description: "You flourish with partners who honor your authenticity and provide stability." },
  "5": { best: ["7", "8", "9"], description: "You match well with partners who draw you out while respecting your need for space." },
  "6": { best: ["3", "8", "9"], description: "You thrive with partners who provide reassurance, strength, or calming presence." },
  "7": { best: ["1", "5", "9"], description: "You need partners who ground your enthusiasm while joining your adventures." },
  "8": { best: ["2", "6", "9"], description: "You flourish with partners who can handle your intensity and soften your edges." },
  "9": { best: ["1", "3", "4", "6"], description: "You balance well with partners who energize you while appreciating your peace-making." }
};
var HUMAN_DESIGN_COMPATIBILITY = {
  "Manifestor": { best: ["Generator", "Manifesting Generator"], description: "You need partners who can match your initiative while providing sustainable energy." },
  "Generator": { best: ["Manifestor", "Manifesting Generator", "Projector"], description: "You thrive with partners who appreciate your responsive energy and let you lead with your gut." },
  "Manifesting Generator": { best: ["Generator", "Projector"], description: "You flourish with partners who can keep up with your multi-passionate energy." },
  "Projector": { best: ["Generator", "Manifesting Generator"], description: "You match well with partners whose energy you can guide and who recognize your wisdom." },
  "Reflector": { best: ["Generator", "Manifestor", "Projector"], description: "You need partners who respect your sensitivity and provide stable energy to reflect." }
};
var LIFE_PATH_COMPATIBILITY = {
  1: { best: [1, 3, 5, 7], description: "You match well with independent, creative, and intellectually stimulating partners." },
  2: { best: [2, 6, 8, 9], description: "You thrive with partners who value harmony, partnership, and emotional connection." },
  3: { best: [1, 3, 5, 6], description: "You need partners who appreciate creativity, communication, and joyful expression." },
  4: { best: [2, 4, 6, 8], description: "You flourish with stable, loyal partners who value building together." },
  5: { best: [1, 3, 5, 7], description: "You match well with adventurous, freedom-loving partners who keep things exciting." },
  6: { best: [2, 3, 6, 9], description: "You thrive with partners who value family, responsibility, and nurturing love." },
  7: { best: [1, 5, 7, 9], description: "You need partners who respect your spiritual depth and need for solitude." },
  8: { best: [2, 4, 6, 8], description: "You flourish with ambitious partners who can handle your power and drive." },
  9: { best: [2, 6, 7, 9], description: "You match well with compassionate, idealistic partners who share your humanitarian vision." },
  11: { best: [2, 6, 11, 22], description: "You thrive with spiritually aware partners who honor your intuitive gifts." },
  22: { best: [4, 11, 22], description: "You need partners who understand your grand vision and help you manifest it." },
  33: { best: [6, 9, 11, 33], description: "You flourish with compassionate partners who support your healing mission." }
};
function generateCompatibilityInsights(profile) {
  const insights = {
    summary: {
      topTraits: [],
      idealPartnerQualities: [],
      relationshipAdvice: []
    }
  };
  const astroData = profile.astrologyData;
  const sunSign = astroData?.sunSign;
  if (sunSign && SUN_SIGN_COMPATIBILITY[sunSign]) {
    const sunCompat = SUN_SIGN_COMPATIBILITY[sunSign];
    insights.sunSign = {
      category: "Sun Sign",
      yourType: sunSign,
      bestMatches: sunCompat.best.map((sign) => ({
        type: sign,
        score: 90,
        description: sunCompat.descriptions[sign],
        keywords: []
      })),
      avoidTypes: sunCompat.avoid?.map((sign) => ({
        type: sign,
        reason: "Requires extra effort and understanding to harmonize"
      })),
      generalGuidance: `As a ${sunSign}, you shine brightest with partners who complement your core energy. Look for the signs listed above for natural harmony.`
    };
  }
  const moonSign = astroData?.moonSign;
  if (moonSign && SUN_SIGN_COMPATIBILITY[moonSign]) {
    const moonCompat = SUN_SIGN_COMPATIBILITY[moonSign];
    insights.moonSign = {
      category: "Moon Sign (Emotional Needs)",
      yourType: moonSign,
      bestMatches: moonCompat.best.slice(0, 3).map((sign) => ({
        type: sign,
        score: 85,
        description: `Emotionally harmonious - your ${moonSign} Moon feels understood with ${sign} energy.`,
        keywords: []
      })),
      generalGuidance: `Your ${moonSign} Moon needs emotional compatibility. Look for partners whose Moon or Sun is in the signs listed above.`
    };
  }
  const personalityData = profile.personalityData;
  const mbti = personalityData?.mbti?.type;
  if (mbti && MBTI_COMPATIBILITY[mbti]) {
    const mbtiCompat = MBTI_COMPATIBILITY[mbti];
    insights.mbti = {
      category: "MBTI Type",
      yourType: mbti,
      bestMatches: mbtiCompat.best.map((type) => ({
        type,
        score: 88,
        description: `Strong cognitive function alignment with ${type}`,
        keywords: []
      })),
      generalGuidance: mbtiCompat.description
    };
  }
  const enneagram = personalityData?.enneagram?.type;
  if (enneagram && ENNEAGRAM_COMPATIBILITY[enneagram.toString()]) {
    const ennCompat = ENNEAGRAM_COMPATIBILITY[enneagram.toString()];
    insights.enneagram = {
      category: "Enneagram Type",
      yourType: `Type ${enneagram}`,
      bestMatches: ennCompat.best.map((type) => ({
        type: `Type ${type}`,
        score: 85,
        description: `Natural balance with Type ${type} dynamics`,
        keywords: []
      })),
      generalGuidance: ennCompat.description
    };
  }
  const hdData = profile.humanDesignData;
  const hdType = hdData?.type;
  if (hdType && HUMAN_DESIGN_COMPATIBILITY[hdType]) {
    const hdCompat = HUMAN_DESIGN_COMPATIBILITY[hdType];
    insights.humanDesign = {
      category: "Human Design Type",
      yourType: hdType,
      bestMatches: hdCompat.best.map((type) => ({
        type,
        score: 87,
        description: `Energetic harmony with ${type} types`,
        keywords: []
      })),
      generalGuidance: hdCompat.description
    };
  }
  const numData = profile.numerologyData;
  const lifePath2 = numData?.lifePath;
  if (lifePath2 && LIFE_PATH_COMPATIBILITY[lifePath2]) {
    const lpCompat = LIFE_PATH_COMPATIBILITY[lifePath2];
    insights.lifePath = {
      category: "Life Path Number",
      yourType: lifePath2.toString(),
      bestMatches: lpCompat.best.map((num) => ({
        type: num.toString(),
        score: 86,
        description: `Numerological harmony with Life Path ${num}`,
        keywords: []
      })),
      generalGuidance: lpCompat.description
    };
  }
  insights.summary = generateSummary(profile, insights);
  return insights;
}
function generateSummary(profile, insights) {
  const topTraits = [];
  const idealPartnerQualities = [];
  const relationshipAdvice = [];
  const astroData = profile.astrologyData;
  if (astroData?.sunSign) {
    const element = getElement(astroData.sunSign);
    topTraits.push(`${element} energy (${astroData.sunSign})`);
  }
  const personalityData = profile.personalityData;
  if (personalityData?.enneagram?.type) {
    topTraits.push(`Enneagram ${personalityData.enneagram.type} core motivations`);
  }
  const hdData = profile.humanDesignData;
  if (hdData?.type) {
    topTraits.push(`${hdData.type} energy type`);
  }
  if (insights.sunSign) {
    idealPartnerQualities.push(`Complement your ${insights.sunSign.yourType} nature`);
  }
  idealPartnerQualities.push("Share your values and life vision");
  idealPartnerQualities.push("Balance your strengths with their own gifts");
  idealPartnerQualities.push("Communicate openly and honestly");
  relationshipAdvice.push("Focus on emotional compatibility, not just attraction");
  relationshipAdvice.push("Look for partners who support your growth");
  relationshipAdvice.push("Trust your intuition - your profile is a guide, not a rulebook");
  relationshipAdvice.push("Every relationship requires effort, even with compatible types");
  return {
    topTraits,
    idealPartnerQualities,
    relationshipAdvice
  };
}
function getElement(sign) {
  const elements = {
    "Aries": "Fire",
    "Leo": "Fire",
    "Sagittarius": "Fire",
    "Taurus": "Earth",
    "Virgo": "Earth",
    "Capricorn": "Earth",
    "Gemini": "Air",
    "Libra": "Air",
    "Aquarius": "Air",
    "Cancer": "Water",
    "Scorpio": "Water",
    "Pisces": "Water"
  };
  return elements[sign] || "Unknown";
}

// server/utils/geocoding.ts
var LOCATION_DATABASE = {
  // United States - Major Cities
  "new york": { lat: "40.7128", lon: "-74.0060" },
  "new york city": { lat: "40.7128", lon: "-74.0060" },
  "nyc": { lat: "40.7128", lon: "-74.0060" },
  "manhattan": { lat: "40.7831", lon: "-73.9712" },
  "brooklyn": { lat: "40.6782", lon: "-73.9442" },
  "los angeles": { lat: "34.0522", lon: "-118.2437" },
  "la": { lat: "34.0522", lon: "-118.2437" },
  "chicago": { lat: "41.8781", lon: "-87.6298" },
  "houston": { lat: "29.7604", lon: "-95.3698" },
  "phoenix": { lat: "33.4484", lon: "-112.0740" },
  "philadelphia": { lat: "39.9526", lon: "-75.1652" },
  "san antonio": { lat: "29.4241", lon: "-98.4936" },
  "san diego": { lat: "32.7157", lon: "-117.1611" },
  "dallas": { lat: "32.7767", lon: "-96.7970" },
  "san jose": { lat: "37.3382", lon: "-121.8863" },
  "austin": { lat: "30.2672", lon: "-97.7431" },
  "san francisco": { lat: "37.7749", lon: "-122.4194" },
  "seattle": { lat: "47.6062", lon: "-122.3321" },
  "denver": { lat: "39.7392", lon: "-104.9903" },
  "boston": { lat: "42.3601", lon: "-71.0589" },
  "miami": { lat: "25.7617", lon: "-80.1918" },
  "atlanta": { lat: "33.7490", lon: "-84.3880" },
  "washington": { lat: "38.9072", lon: "-77.0369" },
  "washington dc": { lat: "38.9072", lon: "-77.0369" },
  // Canada
  "toronto": { lat: "43.6532", lon: "-79.3832" },
  "montreal": { lat: "45.5017", lon: "-73.5673" },
  "vancouver": { lat: "49.2827", lon: "-123.1207" },
  "calgary": { lat: "51.0447", lon: "-114.0719" },
  "ottawa": { lat: "45.4215", lon: "-75.6972" },
  // UK
  "london": { lat: "51.5074", lon: "-0.1278" },
  "manchester": { lat: "53.4808", lon: "-2.2426" },
  "birmingham": { lat: "52.4862", lon: "-1.8904" },
  "liverpool": { lat: "53.4084", lon: "-2.9916" },
  "edinburgh": { lat: "55.9533", lon: "-3.1883" },
  // Europe
  "paris": { lat: "48.8566", lon: "2.3522" },
  "berlin": { lat: "52.5200", lon: "13.4050" },
  "madrid": { lat: "40.4168", lon: "-3.7038" },
  "rome": { lat: "41.9028", lon: "12.4964" },
  "amsterdam": { lat: "52.3676", lon: "4.9041" },
  "vienna": { lat: "48.2082", lon: "16.3738" },
  "barcelona": { lat: "41.3851", lon: "2.1734" },
  "munich": { lat: "48.1351", lon: "11.5820" },
  "prague": { lat: "50.0755", lon: "14.4378" },
  "budapest": { lat: "47.4979", lon: "19.0402" },
  "warsaw": { lat: "52.2297", lon: "21.0122" },
  "stockholm": { lat: "59.3293", lon: "18.0686" },
  "copenhagen": { lat: "55.6761", lon: "12.5683" },
  "oslo": { lat: "59.9139", lon: "10.7522" },
  "helsinki": { lat: "60.1699", lon: "24.9384" },
  "athens": { lat: "37.9838", lon: "23.7275" },
  "lisbon": { lat: "38.7223", lon: "-9.1393" },
  "dublin": { lat: "53.3498", lon: "-6.2603" },
  // Asia
  "tokyo": { lat: "35.6762", lon: "139.6503" },
  "shanghai": { lat: "31.2304", lon: "121.4737" },
  "beijing": { lat: "39.9042", lon: "116.4074" },
  "hong kong": { lat: "22.3193", lon: "114.1694" },
  "singapore": { lat: "1.3521", lon: "103.8198" },
  "mumbai": { lat: "19.0760", lon: "72.8777" },
  "delhi": { lat: "28.7041", lon: "77.1025" },
  "bangalore": { lat: "12.9716", lon: "77.5946" },
  "seoul": { lat: "37.5665", lon: "126.9780" },
  "bangkok": { lat: "13.7563", lon: "100.5018" },
  "manila": { lat: "14.5995", lon: "120.9842" },
  "jakarta": { lat: "-6.2088", lon: "106.8456" },
  "kuala lumpur": { lat: "3.1390", lon: "101.6869" },
  "taipei": { lat: "25.0330", lon: "121.5654" },
  "dubai": { lat: "25.2048", lon: "55.2708" },
  "tel aviv": { lat: "32.0853", lon: "34.7818" },
  "jerusalem": { lat: "31.7683", lon: "35.2137" },
  // Australia & Oceania
  "sydney": { lat: "-33.8688", lon: "151.2093" },
  "melbourne": { lat: "-37.8136", lon: "144.9631" },
  "brisbane": { lat: "-27.4698", lon: "153.0251" },
  "perth": { lat: "-31.9505", lon: "115.8605" },
  "auckland": { lat: "-36.8485", lon: "174.7633" },
  "wellington": { lat: "-41.2865", lon: "174.7762" },
  // South America
  "sao paulo": { lat: "-23.5505", lon: "-46.6333" },
  "rio de janeiro": { lat: "-22.9068", lon: "-43.1729" },
  "buenos aires": { lat: "-34.6037", lon: "-58.3816" },
  "santiago": { lat: "-33.4489", lon: "-70.6693" },
  "lima": { lat: "-12.0464", lon: "-77.0428" },
  "bogota": { lat: "4.7110", lon: "-74.0721" },
  "mexico city": { lat: "19.4326", lon: "-99.1332" },
  // Africa
  "cairo": { lat: "30.0444", lon: "31.2357" },
  "lagos": { lat: "6.5244", lon: "3.3792" },
  "johannesburg": { lat: "-26.2041", lon: "28.0473" },
  "cape town": { lat: "-33.9249", lon: "18.4241" },
  "nairobi": { lat: "-1.2864", lon: "36.8172" },
  "casablanca": { lat: "33.5731", lon: "-7.5898" },
  // Ivory Coast / Côte d'Ivoire
  "abidjan": { lat: "5.3600", lon: "-4.0083" },
  "yamoussoukro": { lat: "6.8276", lon: "-5.2893" },
  "bouake": { lat: "7.6900", lon: "-5.0300" },
  // Additional International Cities
  "reykjavik": { lat: "64.1466", lon: "-21.9426" },
  "oslo": { lat: "59.9139", lon: "10.7522" },
  "bucharest": { lat: "44.4268", lon: "26.1025" },
  "sofia": { lat: "42.6977", lon: "23.3219" },
  "belgrade": { lat: "44.7866", lon: "20.4489" },
  "kyiv": { lat: "50.4501", lon: "30.5234" },
  "hanoi": { lat: "21.0285", lon: "105.8542" },
  "ho chi minh": { lat: "10.8231", lon: "106.6297" },
  "yangon": { lat: "16.8661", lon: "96.1951" },
  "islamabad": { lat: "33.6844", lon: "73.0479" },
  "karachi": { lat: "24.8607", lon: "67.0011" },
  "lahore": { lat: "31.5497", lon: "74.3436" },
  "dhaka": { lat: "23.8103", lon: "90.4125" },
  "colombo": { lat: "6.9271", lon: "79.8612" },
  "kathmandu": { lat: "27.7172", lon: "85.3240" },
  // More West Africa
  "dakar": { lat: "14.6928", lon: "-17.4467" },
  "bamako": { lat: "12.6392", lon: "-8.0029" },
  "conakry": { lat: "9.6412", lon: "-13.5784" },
  "accra": { lat: "5.6037", lon: "-0.1870" },
  "ouagadougou": { lat: "12.3714", lon: "-1.5197" },
  "lome": { lat: "6.1256", lon: "1.2225" },
  "cotonou": { lat: "6.3703", lon: "2.3912" },
  // More East/Central Africa
  "kampala": { lat: "0.3476", lon: "32.5825" },
  "dar es salaam": { lat: "-6.7924", lon: "39.2083" },
  "kigali": { lat: "-1.9536", lon: "30.0606" },
  "kinshasa": { lat: "-4.4419", lon: "15.2663" },
  "luanda": { lat: "-8.8383", lon: "13.2344" },
  "addis ababa": { lat: "9.1450", lon: "40.4897" }
};
function geocodeLocation(location) {
  if (!location || typeof location !== "string") {
    return null;
  }
  const normalized = location.toLowerCase().trim();
  if (LOCATION_DATABASE[normalized]) {
    const coords = LOCATION_DATABASE[normalized];
    return {
      lat: coords.lat,
      lon: coords.lon,
      location: location.trim()
    };
  }
  for (const [key, coords] of Object.entries(LOCATION_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        location: location.trim()
      };
    }
  }
  return null;
}

// server/routes/compatibility.ts
var router = Router();
router.post("/persons", async (req, res) => {
  try {
    const validated = insertPersonSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId && req.session) {
      req.session.anonymous = true;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve(void 0);
        });
      });
    }
    const sessionId = req.session?.id;
    const identifier = userId || sessionId;
    if (!identifier) {
      return res.status(400).json({ error: "Session required" });
    }
    let birthLat = null;
    let birthLon = null;
    if (validated.birthLocation) {
      const geocoded = geocodeLocation(validated.birthLocation);
      if (geocoded) {
        birthLat = geocoded.lat;
        birthLon = geocoded.lon;
        console.log(`[Geocoding] "${validated.birthLocation}" \u2192 ${birthLat}, ${birthLon}`);
      } else {
        console.warn(`[Geocoding] Could not geocode location: "${validated.birthLocation}"`);
      }
    }
    const person = await storage.createPerson({
      ...validated,
      birthLat,
      birthLon,
      userId: userId || null,
      sessionId: userId ? null : sessionId
    });
    res.json(person);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error creating person:", error);
      res.status(500).json({ error: "Failed to create person" });
    }
  }
});
router.get("/persons", async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.session?.id;
    if (!userId && !sessionId) {
      return res.json([]);
    }
    const persons2 = userId ? await storage.getPersonsByUserId(userId) : await storage.getPersonsBySessionId(sessionId);
    res.json(persons2);
  } catch (error) {
    console.error("Error fetching persons:", error);
    res.status(500).json({ error: "Failed to fetch persons" });
  }
});
router.get("/persons/:id", async (req, res) => {
  try {
    const person = await storage.getPerson(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }
    const userId = req.user?.id;
    const sessionId = req.session?.id;
    const hasAccess = userId ? person.userId === userId : person.sessionId === sessionId;
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(person);
  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Failed to fetch person" });
  }
});
router.patch("/persons/:id", async (req, res) => {
  try {
    const person = await storage.getPerson(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }
    const userId = req.user?.id;
    const sessionId = req.session?.id;
    const hasAccess = userId ? person.userId === userId : person.sessionId === sessionId;
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validated = insertPersonSchema.partial().parse(req.body);
    const updateData = { ...validated };
    if (validated.birthLocation) {
      const geocoded = geocodeLocation(validated.birthLocation);
      if (geocoded) {
        updateData.birthLat = geocoded.lat;
        updateData.birthLon = geocoded.lon;
        console.log(`[Geocoding] Updated "${validated.birthLocation}" \u2192 ${geocoded.lat}, ${geocoded.lon}`);
      } else {
        console.warn(`[Geocoding] Could not geocode location: "${validated.birthLocation}"`);
      }
    }
    const updated = await storage.updatePerson(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error updating person:", error);
      res.status(500).json({ error: "Failed to update person" });
    }
  }
});
router.delete("/persons/:id", async (req, res) => {
  try {
    const person = await storage.getPerson(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }
    const userId = req.user?.id;
    const sessionId = req.session?.id;
    const hasAccess = userId ? person.userId === userId : person.sessionId === sessionId;
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    await storage.deletePerson(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ error: "Failed to delete person" });
  }
});
router.post("/compatibility", async (req, res) => {
  try {
    const { person1Id, person2Id } = z2.object({
      person1Id: z2.string(),
      person2Id: z2.string()
    }).parse(req.body);
    const [person1, person2] = await Promise.all([
      storage.getPerson(person1Id),
      storage.getPerson(person2Id)
    ]);
    if (!person1 || !person2) {
      return res.status(404).json({ error: "One or both persons not found" });
    }
    const userId = req.user?.id;
    const sessionId = req.session?.id;
    const hasAccessToPerson1 = userId ? person1.userId === userId : person1.sessionId === sessionId;
    const hasAccessToPerson2 = userId ? person2.userId === userId : person2.sessionId === sessionId;
    if (!hasAccessToPerson1 || !hasAccessToPerson2) {
      return res.status(403).json({ error: "Access denied - you can only compare your own persons" });
    }
    const mapToPersonInput = (p) => ({
      fullName: p.fullName || void 0,
      dob: p.dob || void 0,
      tob: p.tob || void 0,
      place: p.birthLocation || void 0,
      psych: p.psych || void 0
    });
    const result = computeCompatibility(
      mapToPersonInput(person1),
      mapToPersonInput(person2)
    );
    await storage.createCompatibility({
      person1Id,
      person2Id,
      profile1Id: null,
      profile2Id: null,
      overallScore: result.scores.overall.value,
      compatibilityData: result
    });
    res.json(result);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error computing compatibility:", error);
      res.status(500).json({ error: "Failed to compute compatibility" });
    }
  }
});
router.get("/compatibility/insights/:profileId", async (req, res) => {
  try {
    const profileId = req.params.profileId;
    const profile = await storage.getProfile(profileId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const insights = generateCompatibilityInsights(profile);
    res.json(insights);
  } catch (error) {
    console.error("Error generating compatibility insights:", error);
    res.status(500).json({ error: "Failed to generate compatibility insights" });
  }
});
router.post("/compatibility/quick", async (req, res) => {
  try {
    const schema = z2.object({
      person1: z2.object({
        sunSign: z2.string().optional(),
        lifePath: z2.number().min(1).max(33).optional()
      }),
      person2: z2.object({
        sunSign: z2.string().optional(),
        lifePath: z2.number().min(1).max(33).optional()
      })
    });
    const { person1, person2 } = schema.parse(req.body);
    if (!person1.sunSign && !person1.lifePath) {
      return res.status(400).json({
        error: "Insufficient data",
        message: "Please provide either a sun sign or life path number for person 1"
      });
    }
    if (!person2.sunSign && !person2.lifePath) {
      return res.status(400).json({
        error: "Insufficient data",
        message: "Please provide either a sun sign or life path number for person 2"
      });
    }
    if (person1.sunSign && person2.sunSign) {
      const { calculateZodiacCompatibility: calculateZodiacCompatibility2 } = await Promise.resolve().then(() => (init_zodiac_compatibility(), zodiac_compatibility_exports));
      const zodiacResult = calculateZodiacCompatibility2(person1.sunSign, person2.sunSign);
      return res.json({
        scores: {
          overall: { value: zodiacResult.score, error: 5 }
        },
        categories: {
          astrology: zodiacResult.explanation,
          strengths: zodiacResult.strengths.join(". ") + ".",
          challenges: zodiacResult.challenges.join(". ") + "."
        },
        confidence: "HIGH",
        version: "zodiac-compat@1.0"
      });
    }
    if (person1.lifePath && person2.lifePath) {
      const person1Input = {
        dob: generateDobForLifePath(person1.lifePath)
      };
      const person2Input = {
        dob: generateDobForLifePath(person2.lifePath)
      };
      const result = computeCompatibility(person1Input, person2Input);
      return res.json({
        ...result,
        categories: {
          numerology: `Life Path ${person1.lifePath} and ${person2.lifePath}: ${result.scores.overall.value >= 70 ? "harmonious" : result.scores.overall.value >= 50 ? "moderate" : "challenging"} numerological compatibility.`
        }
      });
    }
    return res.status(400).json({
      error: "Incompatible data",
      message: "Both people must use the same system (either both zodiac signs or both life path numbers)"
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error computing quick compatibility:", error);
      res.status(500).json({ error: "Failed to compute quick compatibility" });
    }
  }
});
function generateDobForLifePath(lifePath2) {
  const lifePathDates = {
    1: "1990-01-08",
    // ✓
    2: "2000-08-19",
    // ✓
    3: "1990-01-01",
    // ✓
    4: "1990-02-19",
    // ✓
    5: "1990-01-03",
    // ✓
    6: "1990-01-04",
    // ✓
    7: "1990-01-05",
    // ✓
    8: "1990-01-06",
    // ✓
    9: "1990-01-07",
    // ✓
    11: "1990-01-09",
    // ✓ (master number preserved)
    22: "1990-01-02",
    // ✓ (master number preserved)
    33: "1990-04-19"
    // ✓ (master number preserved)
  };
  return lifePathDates[lifePath2] || "1990-01-15";
}
var compatibility_default = router;

// server/services/push-notifications.ts
import webpush from "web-push";
var VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
var VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
var VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@soulcodex.app";
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("CRITICAL: VAPID keys not configured!");
  console.error("Push notifications will not work. Generate keys with:");
  console.error("  npm install -g web-push");
  console.error("  web-push generate-vapid-keys");
  console.error("Then add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to environment variables.");
  const tempKeys = webpush.generateVAPIDKeys();
  webpush.setVapidDetails(VAPID_SUBJECT, tempKeys.publicKey, tempKeys.privateKey);
  console.error("WARNING: Using temporary VAPID keys - subscriptions will break on restart!");
} else {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log("[PushNotifications] VAPID keys configured successfully");
}
async function sendPushNotification(endpoint, p256dhKey, authKey, payload) {
  try {
    const subscription = {
      endpoint,
      keys: {
        p256dh: p256dhKey,
        auth: authKey
      }
    };
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      await storage.deletePushSubscription(endpoint);
    }
    console.error("Push notification error:", error);
    return false;
  }
}
async function sendToUser(userId, payload) {
  const subscriptions = await storage.getPushSubscriptionsByUser(userId);
  let successCount = 0;
  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      sub.endpoint,
      sub.p256dhKey,
      sub.authKey,
      payload
    );
    if (success) successCount++;
  }
  return successCount;
}
var currentPublicKey = VAPID_PUBLIC_KEY;
function getVapidPublicKey() {
  if (!currentPublicKey) {
    const tempKeys = webpush.generateVAPIDKeys();
    currentPublicKey = tempKeys.publicKey;
  }
  return currentPublicKey;
}

// server/routes.ts
function handleError(error, res, context) {
  console.error(`[${context}] Error:`, error);
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({
      message: "Validation failed",
      errors: validationError.details,
      details: error.errors
    });
  }
  if (error instanceof Error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message || "An unexpected error occurred",
      context
    });
  }
  return res.status(500).json({
    message: "An unexpected error occurred",
    context
  });
}
async function registerRoutes(app2) {
  await setupAuth(app2);
  registerChatRoutes(app2);
  app2.use("/api", compatibility_default);
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      const existingUser = await storage.getLocalUserByEmail(data.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      const passwordHash = await hashPassword(data.password);
      const userId = randomUUID2();
      const user = await storage.upsertUser({
        id: userId,
        email: data.email,
        firstName: data.name || null,
        lastName: null,
        profileImageUrl: null
      });
      await storage.createLocalUser(userId, data.email, passwordHash);
      const previousSessionId = req.session?.id;
      req.login({ id: userId, email: data.email, authProvider: "local" }, async (err) => {
        if (err) {
          console.error("Login error after signup:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        if (previousSessionId) {
          try {
            await storage.migratePersonsFromSessionToUser(previousSessionId, userId);
            console.log(`[Signup] Migrated anonymous data for new user ${userId}`);
          } catch (migrationError) {
            console.error("[Signup] Failed to migrate anonymous data:", migrationError);
          }
        }
        res.json({ user, message: "Account created successfully" });
      });
    } catch (error) {
      handleError(error, res, "Signup");
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const localUser = await storage.getLocalUserByEmail(data.email);
      if (!localUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValid = await verifyPassword(localUser.passwordHash, data.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      await storage.updateLocalUserLastLogin(localUser.id);
      const user = await storage.getUser(localUser.id);
      const previousSessionId = req.session?.id;
      req.login({ id: localUser.id, email: localUser.email, authProvider: "local" }, async (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        if (previousSessionId) {
          try {
            await storage.migratePersonsFromSessionToUser(previousSessionId, localUser.id);
            console.log(`[Login] Migrated anonymous data for user ${localUser.id}`);
          } catch (migrationError) {
            console.error("[Login] Failed to migrate anonymous data:", migrationError);
          }
        }
        res.json({ user, message: "Logged in successfully" });
      });
    } catch (error) {
      handleError(error, res, "Login");
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.claims) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      if (req.user.id) {
        const user = await storage.getUser(req.user.id);
        return res.json({ ...user, authProvider: req.user.authProvider });
      }
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/profiles", async (req, res) => {
    try {
      const birthData = birthDataSchema.parse(req.body);
      console.log(`[CreateProfile] Processing profile for: ${birthData.name}`);
      const hasCompleteData = !!(birthData.birthTime && birthData.birthLocation && birthData.timezone && birthData.latitude && birthData.longitude);
      console.log(`[CreateProfile] Complete birth data available: ${hasCompleteData}`);
      let astrologyData;
      if (hasCompleteData) {
        try {
          astrologyData = calculateAstrology({
            name: birthData.name,
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime,
            birthLocation: birthData.birthLocation,
            latitude: birthData.latitude,
            longitude: birthData.longitude,
            timezone: birthData.timezone
          });
        } catch (error) {
          console.error("[CreateProfile] Astrology calculation failed:", error);
          astrologyData = null;
        }
      } else {
        console.log("[CreateProfile] Skipping astrology calculation - birth time/location not provided");
        astrologyData = null;
      }
      let numerologyData;
      try {
        numerologyData = calculateNumerology(birthData.name, birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Numerology calculation failed:", error);
        throw new Error("Failed to calculate numerology data. Please verify name and birth date.");
      }
      let humanDesignData;
      if (hasCompleteData) {
        try {
          humanDesignData = calculateHumanDesign({
            name: birthData.name,
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime,
            birthLocation: birthData.birthLocation,
            latitude: birthData.latitude,
            longitude: birthData.longitude,
            timezone: birthData.timezone
          });
        } catch (error) {
          console.error("[CreateProfile] Human Design calculation failed:", error);
          humanDesignData = null;
        }
      } else {
        console.log("[CreateProfile] Skipping Human Design calculation - birth time/location not provided");
        humanDesignData = null;
      }
      let tarotCards;
      try {
        tarotCards = getTarotBirthCards(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Tarot calculation failed:", error);
        tarotCards = [];
      }
      let vedicAstrologyData, geneKeysData, iChingData, chineseAstrologyData;
      let kabbalahData, mayanAstrologyData, chakraData, sacredGeometryData;
      let runesData, sabianSymbolsData, ayurvedaData, biorhythmsData;
      let asteroidsData, arabicPartsData, fixedStarsData;
      if (hasCompleteData) {
        try {
          vedicAstrologyData = calculateVedicAstrology({
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime,
            latitude: parseFloat(birthData.latitude),
            longitude: parseFloat(birthData.longitude),
            timezone: birthData.timezone
          });
        } catch (error) {
          console.error("[CreateProfile] Vedic Astrology calculation failed:", error);
          vedicAstrologyData = null;
        }
      } else {
        vedicAstrologyData = null;
      }
      if (hasCompleteData && astrologyData && humanDesignData) {
        try {
          const sunGate = humanDesignData.activations.conscious.sun.gate;
          const earthGate = humanDesignData.activations.conscious.earth.gate;
          const moonGate = humanDesignData.activations.conscious.moon.gate;
          geneKeysData = calculateGeneKeys(sunGate, earthGate, moonGate);
        } catch (error) {
          console.error("[CreateProfile] Gene Keys calculation failed:", error);
          geneKeysData = null;
        }
      } else {
        geneKeysData = null;
      }
      try {
        iChingData = calculateIChing(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] I Ching calculation failed:", error);
        iChingData = null;
      }
      try {
        chineseAstrologyData = calculateChineseAstrology(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Chinese Astrology calculation failed:", error);
        chineseAstrologyData = null;
      }
      try {
        kabbalahData = calculateKabbalah(birthData.name, birthData.birthDate, numerologyData.lifePath);
      } catch (error) {
        console.error("[CreateProfile] Kabbalah calculation failed:", error);
        kabbalahData = null;
      }
      try {
        mayanAstrologyData = calculateMayanAstrology(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Mayan Astrology calculation failed:", error);
        mayanAstrologyData = null;
      }
      try {
        chakraData = calculateChakraSystem(birthData.birthDate, numerologyData.lifePath, astrologyData);
      } catch (error) {
        console.error("[CreateProfile] Chakra System calculation failed:", error);
        chakraData = null;
      }
      try {
        sacredGeometryData = calculateSacredGeometry(birthData.birthDate, numerologyData.lifePath, birthData.name);
      } catch (error) {
        console.error("[CreateProfile] Sacred Geometry calculation failed:", error);
        sacredGeometryData = null;
      }
      try {
        runesData = calculateRunes(birthData.name, birthData.birthDate, numerologyData.lifePath);
      } catch (error) {
        console.error("[CreateProfile] Runes calculation failed:", error);
        runesData = null;
      }
      if (hasCompleteData && astrologyData) {
        try {
          const sunLongitude = (astrologyData.planets.sun.house - 1) * 30 + astrologyData.planets.sun.degree;
          const moonLongitude = (astrologyData.planets.moon.house - 1) * 30 + astrologyData.planets.moon.degree;
          const ascendantLongitude = astrologyData.houses[0].degree;
          sabianSymbolsData = await calculateSabianSymbols(sunLongitude, moonLongitude, ascendantLongitude);
        } catch (error) {
          console.error("[CreateProfile] Sabian Symbols calculation failed:", error);
          sabianSymbolsData = null;
        }
      } else {
        sabianSymbolsData = null;
      }
      try {
        ayurvedaData = calculateAyurveda(birthData.birthDate, astrologyData, void 0);
      } catch (error) {
        console.error("[CreateProfile] Ayurveda calculation failed:", error);
        ayurvedaData = null;
      }
      try {
        biorhythmsData = calculateBiorhythms(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Biorhythms calculation failed:", error);
        biorhythmsData = null;
      }
      if (hasCompleteData && astrologyData) {
        try {
          const ascendantLongitude = astrologyData.houses[0].degree;
          asteroidsData = calculateAsteroids(
            birthData.birthDate,
            birthData.birthTime,
            birthData.timezone,
            ascendantLongitude
          );
        } catch (error) {
          console.error("[CreateProfile] Asteroids calculation failed:", error);
          asteroidsData = null;
        }
      } else {
        asteroidsData = null;
      }
      if (hasCompleteData && astrologyData) {
        try {
          const ascendantLongitude = astrologyData.houses[0].degree;
          arabicPartsData = calculateArabicParts(
            ascendantLongitude,
            astrologyData.planets.sun.degree,
            astrologyData.planets.moon.degree,
            astrologyData.planets.venus.degree,
            astrologyData.planets.jupiter.degree,
            astrologyData.planets.saturn.degree,
            true
            // isDayBirth - simplified
          );
        } catch (error) {
          console.error("[CreateProfile] Arabic Parts calculation failed:", error);
          arabicPartsData = null;
        }
      } else {
        arabicPartsData = null;
      }
      if (hasCompleteData && astrologyData) {
        try {
          const planetLongitudes = {
            sun: astrologyData.planets.sun.degree,
            moon: astrologyData.planets.moon.degree,
            mercury: astrologyData.planets.mercury.degree,
            venus: astrologyData.planets.venus.degree,
            mars: astrologyData.planets.mars.degree,
            jupiter: astrologyData.planets.jupiter.degree,
            saturn: astrologyData.planets.saturn.degree
          };
          fixedStarsData = calculateFixedStars(planetLongitudes);
        } catch (error) {
          console.error("[CreateProfile] Fixed Stars calculation failed:", error);
          fixedStarsData = null;
        }
      } else {
        fixedStarsData = null;
      }
      let baseArchetypeData;
      try {
        baseArchetypeData = synthesizeArchetype(astrologyData, numerologyData, {});
      } catch (error) {
        console.error("[CreateProfile] Archetype synthesis failed:", error);
        throw new Error("Failed to synthesize archetype. Please try again.");
      }
      let integrationAnalysis, personalizedInsights;
      try {
        integrationAnalysis = generateIntegrationAnalysis(astrologyData, numerologyData, {}, baseArchetypeData);
        personalizedInsights = generatePersonalizedInsights(astrologyData, numerologyData, {}, baseArchetypeData);
      } catch (error) {
        console.error("[CreateProfile] Integration analysis failed:", error);
        integrationAnalysis = "Your unique cosmic blueprint reveals deep insights into your soul's journey.";
        personalizedInsights = "Your path is one of growth and self-discovery.";
      }
      const archetypeData = {
        archetype: baseArchetypeData.title,
        title: baseArchetypeData.title,
        description: baseArchetypeData.description,
        keywords: baseArchetypeData.themes,
        strengths: baseArchetypeData.strengths || [],
        shadows: baseArchetypeData.shadows || [],
        guidance: baseArchetypeData.guidance,
        integration: integrationAnalysis,
        personalizedInsights,
        tarotCards
      };
      let biography = "Your cosmic journey awaits...";
      try {
        biography = await generateBiography({
          name: birthData.name,
          archetypeTitle: baseArchetypeData.title,
          astrologyData,
          numerologyData,
          personalityData: {},
          archetype: baseArchetypeData,
          // All 15 new advanced systems + tarot for COMPLETE synthesis (30+ systems total)
          humanDesignData,
          vedicAstrologyData,
          geneKeysData,
          iChingData,
          chineseAstrologyData,
          kabbalahData,
          mayanAstrologyData,
          chakraData,
          sacredGeometryData,
          runesData,
          sabianSymbolsData,
          ayurvedaData,
          biorhythmsData,
          asteroidsData,
          arabicPartsData,
          fixedStarsData,
          tarotCards
          // Tarot birth cards
        });
      } catch (error) {
        console.error("[CreateProfile] Biography generation failed:", error);
      }
      let dailyGuidance = "Trust your inner wisdom today.";
      try {
        dailyGuidance = await generateDailyGuidance({
          name: birthData.name,
          archetypeTitle: baseArchetypeData.title,
          astrologyData,
          numerologyData,
          personalityData: {},
          archetype: baseArchetypeData
        });
      } catch (error) {
        console.error("[CreateProfile] Daily guidance generation failed:", error);
      }
      const profile = await storage.createProfile({
        userId: null,
        // Guest profile for now
        name: birthData.name,
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime || "",
        birthLocation: birthData.birthLocation || "",
        timezone: birthData.timezone || "",
        latitude: birthData.latitude || "",
        longitude: birthData.longitude || "",
        isPremium: true,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetypeData,
        humanDesignData,
        vedicAstrologyData,
        geneKeysData,
        iChingData,
        chineseAstrologyData,
        kabbalahData,
        mayanAstrologyData,
        chakraData,
        sacredGeometryData,
        runesData,
        sabianSymbolsData,
        ayurvedaData,
        biorhythmsData,
        asteroidsData,
        arabicPartsData,
        fixedStarsData,
        biography,
        dailyGuidance
      });
      console.log(`[CreateProfile] Profile created successfully: ${profile.id}`);
      res.json(profile);
    } catch (error) {
      return handleError(error, res, "CreateProfile");
    }
  });
  app2.get("/api/profiles/:id", async (req, res) => {
    try {
      const profileId = req.params.id;
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      console.log(`[GetProfile] Fetching profile: ${profileId}`);
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        console.log(`[GetProfile] Profile not found: ${profileId}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      let needsUpdate = false;
      let updatedData = {};
      const profileHasCompleteData = !!(profile.birthTime && profile.birthLocation && profile.timezone && profile.latitude && profile.longitude);
      if (!profile.humanDesignData && profileHasCompleteData) {
        console.log("Auto-healing: Missing humanDesignData for profile", req.params.id);
        try {
          const humanDesignData = calculateHumanDesign({
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            birthLocation: profile.birthLocation,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone
          });
          updatedData.humanDesignData = humanDesignData;
          needsUpdate = true;
        } catch (error) {
          console.error("Auto-healing: Failed to calculate Human Design", error);
        }
      }
      const archetypeData = profile.archetypeData;
      if (!archetypeData || !archetypeData.strengths?.length || !archetypeData.shadows?.length || !archetypeData.integration || !archetypeData.personalizedInsights) {
        console.log("Auto-healing: Missing or incomplete archetypeData for profile", req.params.id);
        let astrologyData = profile.astrologyData;
        let numerologyData = profile.numerologyData;
        if (!astrologyData && profileHasCompleteData) {
          try {
            astrologyData = calculateAstrology({
              name: profile.name,
              birthDate: profile.birthDate,
              birthTime: profile.birthTime,
              birthLocation: profile.birthLocation,
              latitude: profile.latitude,
              longitude: profile.longitude,
              timezone: profile.timezone
            });
            updatedData.astrologyData = astrologyData;
            needsUpdate = true;
          } catch (error) {
            console.error("Auto-healing: Failed to calculate astrology", error);
          }
        }
        if (!numerologyData) {
          numerologyData = calculateNumerology(profile.name, profile.birthDate);
          updatedData.numerologyData = numerologyData;
          needsUpdate = true;
        }
        const baseArchetypeData = synthesizeArchetype(astrologyData, numerologyData, profile.personalityData);
        const integrationAnalysis = generateIntegrationAnalysis(astrologyData, numerologyData, profile.personalityData, baseArchetypeData);
        const personalizedInsights = generatePersonalizedInsights(astrologyData, numerologyData, profile.personalityData, baseArchetypeData);
        const tarotCards = getTarotBirthCards(profile.birthDate);
        const enhancedArchetypeData = {
          archetype: baseArchetypeData.title,
          title: baseArchetypeData.title,
          description: baseArchetypeData.description,
          keywords: baseArchetypeData.themes,
          strengths: baseArchetypeData.strengths || [],
          shadows: baseArchetypeData.shadows || [],
          guidance: baseArchetypeData.guidance,
          integration: integrationAnalysis,
          personalizedInsights,
          tarotCards
        };
        updatedData.archetypeData = enhancedArchetypeData;
        needsUpdate = true;
      }
      const astroData = profile.astrologyData;
      if ((!astroData || !astroData.interpretations || !astroData.northNode || !astroData.southNode || !astroData.chiron) && profileHasCompleteData) {
        console.log("Auto-healing: Missing enhanced astrologyData for profile", req.params.id);
        try {
          const enhancedAstrologyData = calculateAstrology({
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            birthLocation: profile.birthLocation,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone
          });
          updatedData.astrologyData = enhancedAstrologyData;
          needsUpdate = true;
        } catch (error) {
          console.error("Auto-healing: Failed to calculate enhanced astrology", error);
        }
      }
      const numeroData = profile.numerologyData;
      if (!numeroData || !numeroData.interpretations) {
        console.log("Auto-healing: Missing enhanced numerologyData for profile", req.params.id);
        const enhancedNumerologyData = calculateNumerology(profile.name, profile.birthDate);
        updatedData.numerologyData = enhancedNumerologyData;
        needsUpdate = true;
      }
      if (needsUpdate) {
        console.log(`[GetProfile] Auto-healing profile ${req.params.id} with missing data fields`);
        try {
          const healedProfile = await storage.updateProfile(req.params.id, updatedData);
          console.log(`[GetProfile] Profile healed successfully: ${req.params.id}`);
          res.json(healedProfile);
        } catch (updateError) {
          console.error(`[GetProfile] Failed to heal profile ${req.params.id}:`, updateError);
          res.json(profile);
        }
      } else {
        console.log(`[GetProfile] Profile retrieved successfully: ${req.params.id}`);
        res.json(profile);
      }
    } catch (error) {
      return handleError(error, res, "GetProfile");
    }
  });
  app2.post("/api/profiles/:id/enneagram", async (req, res) => {
    try {
      const profileId = req.params.id;
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      const assessment = enneagramAssessmentSchema.parse(req.body);
      console.log(`[EnneagramAssessment] Processing assessment for profile: ${profileId}`);
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const enneagramResult = calculateEnneagram(assessment.responses);
      await storage.createAssessment({
        profileId,
        assessmentType: "enneagram",
        responses: assessment.responses,
        calculatedType: enneagramResult?.type?.toString() || null
      });
      const updatedPersonalityData = {
        ...profile.personalityData,
        enneagram: enneagramResult
      };
      const baseArchetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData
      );
      const integrationAnalysis = generateIntegrationAnalysis(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      const personalizedInsights = generatePersonalizedInsights(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      const archetypeData = {
        archetype: baseArchetypeData.title,
        title: baseArchetypeData.title,
        description: baseArchetypeData.description,
        keywords: baseArchetypeData.themes,
        strengths: baseArchetypeData.strengths || [],
        shadows: baseArchetypeData.shadows || [],
        guidance: baseArchetypeData.guidance,
        integration: integrationAnalysis,
        personalizedInsights,
        tarotCards: profile.archetypeData?.tarotCards
      };
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData
      });
      console.log(`[EnneagramAssessment] Profile updated successfully: ${profileId}`);
      res.json(updatedProfile);
    } catch (error) {
      return handleError(error, res, "EnneagramAssessment");
    }
  });
  app2.post("/api/profiles/:id/mbti", async (req, res) => {
    try {
      const profileId = req.params.id;
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      const assessment = mbtiAssessmentSchema.parse(req.body);
      console.log(`[MBTIAssessment] Processing assessment for profile: ${profileId}`);
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const mbtiResult = calculateMBTI(assessment.responses);
      await storage.createAssessment({
        profileId,
        assessmentType: "mbti",
        responses: assessment.responses,
        calculatedType: mbtiResult?.type || null
      });
      const updatedPersonalityData = {
        ...profile.personalityData,
        mbti: mbtiResult
      };
      const baseArchetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData
      );
      const integrationAnalysis = generateIntegrationAnalysis(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      const personalizedInsights = generatePersonalizedInsights(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      const archetypeData = {
        archetype: baseArchetypeData.title,
        title: baseArchetypeData.title,
        description: baseArchetypeData.description,
        keywords: baseArchetypeData.themes,
        strengths: baseArchetypeData.strengths || [],
        shadows: baseArchetypeData.shadows || [],
        guidance: baseArchetypeData.guidance,
        integration: integrationAnalysis,
        personalizedInsights,
        tarotCards: profile.archetypeData?.tarotCards
      };
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData
      });
      console.log(`[MBTIAssessment] Profile updated successfully: ${profileId}`);
      res.json(updatedProfile);
    } catch (error) {
      return handleError(error, res, "MBTIAssessment");
    }
  });
  app2.post("/api/profiles/:id/upgrade", async (req, res) => {
    try {
      const profileId = req.params.id;
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      console.log(`[UpgradeProfile] Upgrading profile: ${profileId}`);
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (profile.isPremium) {
        return res.status(400).json({ message: "Profile is already premium" });
      }
      const updatedProfile = await storage.updateProfile(profileId, {
        isPremium: true
      });
      console.log(`[UpgradeProfile] Profile upgraded successfully: ${profileId}`);
      res.json(updatedProfile);
    } catch (error) {
      return handleError(error, res, "UpgradeProfile");
    }
  });
  app2.post("/api/access-codes/validate", async (req, res) => {
    try {
      const { code, profileId } = req.body;
      if (!code || typeof code !== "string" || code.trim().length === 0) {
        return res.status(400).json({ message: "Valid code is required" });
      }
      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({ message: "Valid profileId is required" });
      }
      console.log(`[ValidateAccessCode] Validating code for profile: ${profileId}`);
      const normalizedCode = code.trim().toLowerCase();
      const accessCode = await storage.getAccessCode(normalizedCode);
      if (!accessCode) {
        console.log(`[ValidateAccessCode] Code not found: ${normalizedCode}`);
        return res.status(404).json({ message: "Invalid access code" });
      }
      if (!accessCode.isActive) {
        return res.status(400).json({ message: "Access code is inactive" });
      }
      if (accessCode.expiresAt && /* @__PURE__ */ new Date() > accessCode.expiresAt) {
        return res.status(400).json({ message: "Access code has expired" });
      }
      if (accessCode.usesCount >= accessCode.maxUses) {
        return res.status(400).json({ message: "Access code has reached maximum uses" });
      }
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const updatedProfile = await storage.updateProfile(profileId, {
        isPremium: true
      });
      await storage.incrementAccessCodeUse(normalizedCode);
      console.log(`[ValidateAccessCode] Code validated and profile upgraded: ${profileId}`);
      res.json({
        success: true,
        message: "Premium access activated!",
        profile: updatedProfile
      });
    } catch (error) {
      return handleError(error, res, "ValidateAccessCode");
    }
  });
  app2.post("/api/admin/access-codes", async (req, res) => {
    try {
      const { code, maxUses, expiresAt, adminPassword } = req.body;
      console.log("[CreateAccessCode] Processing request");
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[CreateAccessCode] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[CreateAccessCode] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      if (!code || typeof code !== "string" || code.trim().length === 0) {
        return res.status(400).json({ message: "Valid code is required" });
      }
      if (maxUses !== void 0 && (typeof maxUses !== "number" || maxUses < 1)) {
        return res.status(400).json({ message: "maxUses must be a positive number" });
      }
      const normalizedCode = code.trim().toLowerCase();
      const existing = await storage.getAccessCode(normalizedCode);
      if (existing) {
        return res.status(409).json({ message: "Code already exists" });
      }
      const accessCode = await storage.createAccessCode({
        code: normalizedCode,
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      });
      console.log(`[CreateAccessCode] Access code created: ${accessCode.code}`);
      res.json(accessCode);
    } catch (error) {
      return handleError(error, res, "CreateAccessCode");
    }
  });
  app2.get("/api/admin/access-codes", async (req, res) => {
    try {
      const adminPassword = req.headers.authorization?.replace("Bearer ", "");
      console.log("[GetAccessCodes] Processing request");
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[GetAccessCodes] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[GetAccessCodes] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      const accessCodes2 = await storage.getAllAccessCodes();
      console.log(`[GetAccessCodes] Retrieved ${accessCodes2.length} access codes`);
      res.json(accessCodes2);
    } catch (error) {
      return handleError(error, res, "GetAccessCodes");
    }
  });
  app2.patch("/api/admin/access-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminPassword, ...updates } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Valid access code ID is required" });
      }
      console.log(`[UpdateAccessCode] Updating access code: ${id}`);
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[UpdateAccessCode] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[UpdateAccessCode] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      const updatedCode = await storage.updateAccessCode(id, updates);
      console.log(`[UpdateAccessCode] Access code updated: ${id}`);
      res.json(updatedCode);
    } catch (error) {
      return handleError(error, res, "UpdateAccessCode");
    }
  });
  app2.post("/api/admin/analytics", async (req, res) => {
    try {
      const { adminPassword } = req.body;
      console.log(`[GetAnalytics] Fetching analytics data`);
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[GetAnalytics] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[GetAnalytics] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      const allProfiles = await storage.getAllProfiles();
      const stats = {
        totalProfiles: allProfiles.length,
        humanDesignTypes: {},
        enneagramTypes: {},
        mbtiTypes: {},
        sunSigns: {},
        lifePaths: {},
        premiumCount: 0
      };
      allProfiles.forEach((profile) => {
        if (profile.isPremium) {
          stats.premiumCount++;
        }
        if (profile.humanDesignData && typeof profile.humanDesignData === "object") {
          const hdData = profile.humanDesignData;
          if (hdData.type) {
            stats.humanDesignTypes[hdData.type] = (stats.humanDesignTypes[hdData.type] || 0) + 1;
          }
        }
        if (profile.personalityData && typeof profile.personalityData === "object") {
          const persData = profile.personalityData;
          if (persData.enneagram?.type) {
            stats.enneagramTypes[persData.enneagram.type] = (stats.enneagramTypes[persData.enneagram.type] || 0) + 1;
          }
          if (persData.mbti?.type) {
            stats.mbtiTypes[persData.mbti.type] = (stats.mbtiTypes[persData.mbti.type] || 0) + 1;
          }
        }
        if (profile.astrologyData && typeof profile.astrologyData === "object") {
          const astroData = profile.astrologyData;
          if (astroData.sunSign) {
            stats.sunSigns[astroData.sunSign] = (stats.sunSigns[astroData.sunSign] || 0) + 1;
          }
        }
        if (profile.numerologyData && typeof profile.numerologyData === "object") {
          const numData = profile.numerologyData;
          if (numData.lifePath) {
            const lpKey = String(numData.lifePath);
            stats.lifePaths[lpKey] = (stats.lifePaths[lpKey] || 0) + 1;
          }
        }
      });
      console.log(`[GetAnalytics] Analytics calculated for ${allProfiles.length} profiles`);
      res.json(stats);
    } catch (error) {
      return handleError(error, res, "GetAnalytics");
    }
  });
  app2.get("/api/daily-insights/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      console.log(`[GetDailyInsights] Fetching insights for profile ${profileId} on ${today}`);
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      let dailyInsight = await storage.getDailyInsight(profileId, today);
      if (dailyInsight) {
        console.log(`[GetDailyInsights] Returning cached insights for ${today}`);
        return res.json(dailyInsight.insightsData);
      }
      console.log(`[GetDailyInsights] Generating new insights for ${today}`);
      const recentTemplateIds = await storage.getRecentTemplateIds(profileId, 7);
      const { data, templateIds, contentHash } = generateDailyInsights(profile, recentTemplateIds);
      dailyInsight = await storage.createDailyInsight({
        profileId,
        date: today,
        templateIds,
        contentHash,
        insightsData: data
      });
      console.log(`[GetDailyInsights] Generated and stored insights for ${today}`);
      res.json(data);
    } catch (error) {
      return handleError(error, res, "GetDailyInsights");
    }
  });
  app2.post("/api/compatibility", async (req, res) => {
    try {
      const { profile1Id, profile2Id } = req.body;
      if (!profile1Id || !profile2Id) {
        return res.status(400).json({ message: "Both profile1Id and profile2Id are required" });
      }
      if (profile1Id === profile2Id) {
        return res.status(400).json({ message: "Cannot calculate compatibility with the same profile" });
      }
      console.log(`[CalculateCompatibility] Calculating compatibility between ${profile1Id} and ${profile2Id}`);
      const existingCompatibility = await storage.getCompatibility(profile1Id, profile2Id);
      if (existingCompatibility) {
        console.log(`[CalculateCompatibility] Returning cached compatibility`);
        return res.json(existingCompatibility);
      }
      const [profile1, profile2] = await Promise.all([
        storage.getProfile(profile1Id),
        storage.getProfile(profile2Id)
      ]);
      if (!profile1) {
        return res.status(404).json({ message: `Profile ${profile1Id} not found` });
      }
      if (!profile2) {
        return res.status(404).json({ message: `Profile ${profile2Id} not found` });
      }
      console.log(`[CalculateCompatibility] Running compatibility analysis`);
      const compatibilityResult = calculateCompatibility(profile1, profile2);
      const savedCompatibility = await storage.createCompatibility({
        profile1Id,
        profile2Id,
        overallScore: compatibilityResult.overallScore,
        compatibilityData: compatibilityResult
      });
      const astro1 = profile1.astrologyData;
      const astro2 = profile2.astrologyData;
      const num1 = profile1.numerologyData;
      const num2 = profile2.numerologyData;
      const hd1 = profile1.humanDesignData;
      const hd2 = profile2.humanDesignData;
      const pers1 = profile1.personalityData;
      const pers2 = profile2.personalityData;
      const response = {
        ...savedCompatibility,
        profile1: {
          name: profile1.name,
          sunSign: astro1?.sunSign,
          moonSign: astro1?.moonSign,
          risingSign: astro1?.risingSign,
          lifePath: num1?.lifePath,
          hdType: hd1?.type,
          enneagramType: pers1?.enneagram?.type,
          mbtiType: pers1?.mbti?.type
        },
        profile2: {
          name: profile2.name,
          sunSign: astro2?.sunSign,
          moonSign: astro2?.moonSign,
          risingSign: astro2?.risingSign,
          lifePath: num2?.lifePath,
          hdType: hd2?.type,
          enneagramType: pers2?.enneagram?.type,
          mbtiType: pers2?.mbti?.type
        }
      };
      console.log(`[CalculateCompatibility] Compatibility calculated: ${compatibilityResult.overallScore}%`);
      res.json(response);
    } catch (error) {
      return handleError(error, res, "CalculateCompatibility");
    }
  });
  app2.get("/api/compatibility/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      console.log(`[GetCompatibilities] Fetching compatibilities for profile ${profileId}`);
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const compatibilities = await storage.getProfileCompatibilities(profileId);
      console.log(`[GetCompatibilities] Found ${compatibilities.length} compatibility analyses`);
      res.json(compatibilities);
    } catch (error) {
      return handleError(error, res, "GetCompatibilities");
    }
  });
  app2.get("/api/compatibility/:profile1Id/:profile2Id", async (req, res) => {
    try {
      const { profile1Id, profile2Id } = req.params;
      console.log(`[GetCompatibility] Fetching compatibility between ${profile1Id} and ${profile2Id}`);
      const compatibility = await storage.getCompatibility(profile1Id, profile2Id);
      if (!compatibility) {
        return res.status(404).json({ message: "Compatibility analysis not found. Please calculate it first." });
      }
      const [profile1, profile2] = await Promise.all([
        compatibility.profile1Id ? storage.getProfile(compatibility.profile1Id) : Promise.resolve(null),
        compatibility.profile2Id ? storage.getProfile(compatibility.profile2Id) : Promise.resolve(null)
      ]);
      if (!profile1 || !profile2) {
        return res.status(404).json({ message: "One or both profiles not found" });
      }
      const astro1 = profile1.astrologyData;
      const astro2 = profile2.astrologyData;
      const num1 = profile1.numerologyData;
      const num2 = profile2.numerologyData;
      const hd1 = profile1.humanDesignData;
      const hd2 = profile2.humanDesignData;
      const pers1 = profile1.personalityData;
      const pers2 = profile2.personalityData;
      const response = {
        ...compatibility,
        profile1: {
          name: profile1.name,
          sunSign: astro1?.sunSign,
          moonSign: astro1?.moonSign,
          risingSign: astro1?.risingSign,
          lifePath: num1?.lifePath,
          hdType: hd1?.type,
          enneagramType: pers1?.enneagram?.type,
          mbtiType: pers1?.mbti?.type
        },
        profile2: {
          name: profile2.name,
          sunSign: astro2?.sunSign,
          moonSign: astro2?.moonSign,
          risingSign: astro2?.risingSign,
          lifePath: num2?.lifePath,
          hdType: hd2?.type,
          enneagramType: pers2?.enneagram?.type,
          mbtiType: pers2?.mbti?.type
        }
      };
      res.json(response);
    } catch (error) {
      return handleError(error, res, "GetCompatibility");
    }
  });
  app2.get("/api/push/vapid-public-key", (req, res) => {
    try {
      const publicKey = getVapidPublicKey();
      res.json({ publicKey });
    } catch (error) {
      return handleError(error, res, "GetVapidKey");
    }
  });
  app2.post("/api/push/subscribe", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.session?.id;
      const { endpoint, keys } = req.body;
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }
      const existing = await storage.getPushSubscription(endpoint);
      if (existing) {
        return res.json({ message: "Subscription already exists", subscription: existing });
      }
      const subscription = await storage.createPushSubscription({
        userId: userId || null,
        sessionId: sessionId || null,
        endpoint,
        p256dhKey: keys.p256dh,
        authKey: keys.auth,
        isActive: true
      });
      console.log(`[PushSubscribe] New subscription created for ${userId ? `user ${userId}` : `session ${sessionId}`}`);
      res.json({ message: "Subscription successful", subscription });
    } catch (error) {
      return handleError(error, res, "PushSubscribe");
    }
  });
  app2.post("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint is required" });
      }
      await storage.deletePushSubscription(endpoint);
      console.log(`[PushUnsubscribe] Subscription deleted: ${endpoint}`);
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      return handleError(error, res, "PushUnsubscribe");
    }
  });
  app2.post("/api/frequency/log", async (req, res) => {
    try {
      const userId = req.user?.id || null;
      if (!userId) {
        req.session.initialized = true;
      }
      const sessionId = req.sessionID;
      const { frequency, notes, notificationContext } = req.body;
      if (typeof frequency !== "number" || frequency < 1 || frequency > 10) {
        return res.status(400).json({ message: "Frequency must be a number between 1 and 10" });
      }
      let activeTransits = null;
      if (userId) {
        try {
          const profile = await storage.getProfileByUserId(userId);
          if (profile && profile.astrologyData) {
            const natalPositions = extractNatalPositions(profile.astrologyData);
            activeTransits = calculateActiveTransits(natalPositions, /* @__PURE__ */ new Date());
            console.log(`[FrequencyLog] Calculated ${activeTransits.transits.length} active transits for user ${userId}`);
          }
        } catch (transitError) {
          console.error("[FrequencyLog] Failed to calculate transits:", transitError);
        }
      }
      const log2 = await storage.createFrequencyLog({
        userId: userId || null,
        sessionId: sessionId || null,
        frequency,
        notes: notes || null,
        notificationContext: notificationContext || null,
        activeTransits: activeTransits || null
      });
      console.log(`[FrequencyLog] Created log for ${userId ? `user ${userId}` : `session ${sessionId}`}: frequency ${frequency}`);
      res.json({ message: "Frequency logged successfully", log: log2 });
    } catch (error) {
      return handleError(error, res, "LogFrequency");
    }
  });
  app2.get("/api/frequency/logs", async (req, res) => {
    try {
      const userId = req.user?.id || null;
      const sessionId = req.sessionID;
      if (!userId && !sessionId) {
        return res.json({ logs: [] });
      }
      const logs = userId ? await storage.getFrequencyLogsByUser(userId) : await storage.getFrequencyLogsBySession(sessionId);
      let userProfile = null;
      if (userId) {
        try {
          const profile = await storage.getProfileByUserId(userId);
          userProfile = profile || null;
        } catch {
          userProfile = null;
        }
      }
      const enrichedLogs = logs.map((log2) => {
        const logDate = new Date(log2.loggedAt);
        const moonPhaseData = getMoonPhase(logDate);
        const moonSign = getMoonSign(logDate);
        const hdGateData = getCurrentHDGate(logDate);
        const universalDay = calculateUniversalDayNumber(logDate);
        const personalDay = userProfile?.birthDate ? calculatePersonalDayNumber(userProfile.birthDate, logDate) : null;
        return {
          ...log2,
          cosmicContext: {
            moonPhase: moonPhaseData.phase,
            moonSign,
            hdGate: hdGateData.gate,
            hdLine: hdGateData.line,
            universalDay,
            personalDay
          }
        };
      });
      res.json({ logs: enrichedLogs });
    } catch (error) {
      return handleError(error, res, "GetFrequencyLogs");
    }
  });
  app2.get("/api/frequency/logs/range", async (req, res) => {
    try {
      const userId = req.user?.id || null;
      const sessionId = req.session?.id || null;
      if (!userId && !sessionId) {
        return res.json({ logs: [] });
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      const logs = await storage.getFrequencyLogsInRange(userId, sessionId, start, end);
      res.json({ logs });
    } catch (error) {
      return handleError(error, res, "GetFrequencyLogsRange");
    }
  });
  app2.get("/api/transits/current", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const profile = await storage.getProfileByUserId(userId);
      if (!profile || !profile.astrologyData) {
        return res.status(422).json({
          message: "Create your soul profile with birth data to unlock transit intelligence"
        });
      }
      try {
        const natalPositions = extractNatalPositions(profile.astrologyData);
        const activeTransits = calculateActiveTransits(natalPositions, /* @__PURE__ */ new Date());
        if (!activeTransits || !activeTransits.transits || activeTransits.transits.length === 0) {
          return res.json({
            transits: [],
            dominantTheme: null,
            transmutationTechniques: []
          });
        }
        const techniques = getActiveTransmutationTechniques(activeTransits.transits);
        console.log(`[CurrentTransits] User ${userId} has ${activeTransits.transits.length} active transits`);
        res.json({
          ...activeTransits,
          transmutationTechniques: techniques
        });
      } catch (transitError) {
        console.error("[CurrentTransits] Transit calculation error:", transitError);
        return res.status(500).json({
          message: transitError instanceof Error ? transitError.message : "Failed to calculate transits"
        });
      }
    } catch (error) {
      return handleError(error, res, "GetCurrentTransits");
    }
  });
  app2.get("/api/congruence", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const profile = await storage.getProfileByUserId(userId);
      const purposeStatement = profile?.purposeStatement || null;
      const allLogs = await storage.getFrequencyLogsByUser(userId);
      const congruenceScore = calculateCongruenceScore(allLogs, purposeStatement);
      console.log(`[CongruenceScore] User ${userId} score: ${congruenceScore.score}`);
      res.json({
        ...congruenceScore,
        purposeStatement
      });
    } catch (error) {
      return handleError(error, res, "GetCongruenceScore");
    }
  });
  app2.patch("/api/profile/purpose", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { purposeStatement } = req.body;
      if (typeof purposeStatement !== "string") {
        return res.status(400).json({ message: "purposeStatement must be a string" });
      }
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found. Please create a profile first." });
      }
      const updatedProfile = await storage.updateProfile(profile.id, {
        purposeStatement: purposeStatement.trim() || null
      });
      console.log(`[UpdatePurpose] User ${userId} updated purpose statement`);
      res.json({
        message: "Purpose statement updated successfully",
        profile: updatedProfile
      });
    } catch (error) {
      return handleError(error, res, "UpdatePurposeStatement");
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/ema-scheduler.ts
var EMA_MESSAGES = {
  morning: [
    {
      title: "Good Morning, Seeker",
      body: "How is your frequency in this present moment?",
      tag: "ema-morning"
    },
    {
      title: "The Day Awakens",
      body: "Take a moment to sense your energetic state right now.",
      tag: "ema-morning"
    },
    {
      title: "Morning Light",
      body: "What emotional frequency are you experiencing as you begin this day?",
      tag: "ema-morning"
    }
  ],
  midday: [
    {
      title: "Present Moment Check",
      body: "Pause. How does your soul feel in this very moment?",
      tag: "ema-midday"
    },
    {
      title: "Midday Anchor",
      body: "Check in with yourself. What's your current emotional state?",
      tag: "ema-midday"
    },
    {
      title: "The Eternal Now",
      body: "Ground yourself. What frequency are you holding right now?",
      tag: "ema-midday"
    }
  ],
  evening: [
    {
      title: "Evening Reflection",
      body: "Before the day closes, how are you feeling in this moment?",
      tag: "ema-evening"
    },
    {
      title: "Twilight Check-In",
      body: "As day transforms to night, sense your current emotional state.",
      tag: "ema-evening"
    },
    {
      title: "The Day's Close",
      body: "Reflect on your present frequency. How is your soul right now?",
      tag: "ema-evening"
    }
  ],
  transition: [
    {
      title: "Moment of Transition",
      body: "You're shifting between states. Notice your emotional frequency.",
      tag: "ema-transition"
    },
    {
      title: "Energy Shift",
      body: "A transition moment. How does your frequency feel right now?",
      tag: "ema-transition"
    },
    {
      title: "Between States",
      body: "In this liminal space, what is your emotional truth?",
      tag: "ema-transition"
    }
  ]
};
function getRandomMessage(category) {
  const messages = EMA_MESSAGES[category];
  const selected = messages[Math.floor(Math.random() * messages.length)];
  return {
    ...selected,
    url: "/life-current",
    data: {
      type: "ema",
      category,
      timestamp: Date.now()
    }
  };
}
async function sendEMANotification(userId, category) {
  const payload = getRandomMessage(category);
  return await sendToUser(userId, payload);
}
var DEFAULT_SCHEDULE = {
  morning: "09:00",
  midday: "13:00",
  evening: "19:00",
  transition1: "11:30",
  transition2: "16:30"
};
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}
function scheduleNotification(timeStr, category, callback) {
  const now = /* @__PURE__ */ new Date();
  const { hours, minutes } = parseTime(timeStr);
  const scheduled = /* @__PURE__ */ new Date();
  scheduled.setHours(hours, minutes, 0, 0);
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  const delay = scheduled.getTime() - now.getTime();
  if (delay < 0) return null;
  return setTimeout(() => {
    callback();
    scheduleNotification(timeStr, category, callback);
  }, delay);
}
var activeSchedules = [];
function startEMAScheduler(config = {}) {
  stopEMAScheduler();
  const schedule = { ...DEFAULT_SCHEDULE, ...config };
  console.log("[EMAScheduler] Starting with schedule:", schedule);
  const sendToAllUsers = async (category) => {
    console.log(`[EMAScheduler] Sending ${category} notifications`);
    const allProfiles = await storage.getAllProfiles();
    for (const profile of allProfiles) {
      if (profile.userId) {
        try {
          await sendEMANotification(profile.userId, category);
        } catch (error) {
          console.error(`[EMAScheduler] Error sending to user ${profile.userId}:`, error);
        }
      }
    }
  };
  const timers = [
    scheduleNotification(schedule.morning, "morning", () => sendToAllUsers("morning")),
    scheduleNotification(schedule.midday, "midday", () => sendToAllUsers("midday")),
    scheduleNotification(schedule.evening, "evening", () => sendToAllUsers("evening")),
    scheduleNotification(schedule.transition1, "transition", () => sendToAllUsers("transition")),
    scheduleNotification(schedule.transition2, "transition", () => sendToAllUsers("transition"))
  ];
  activeSchedules = timers.filter((t) => t !== null);
  console.log(`[EMAScheduler] ${activeSchedules.length} notifications scheduled`);
}
function stopEMAScheduler() {
  console.log("[EMAScheduler] Stopping scheduler");
  activeSchedules.forEach((timer) => clearTimeout(timer));
  activeSchedules = [];
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    startEMAScheduler();
    log(`EMA notification scheduler started`);
  });
})();

import { randomUUID } from "crypto";
import { eq, inArray } from "drizzle-orm";
import {
  users,
  profiles,
  assessmentResponses,
  accessCodeRedemptions,
  localUsers,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Assessment,
  type InsertAssessment,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile>;
  getAssessment(profileId: string, type: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  deleteSessionData(sessionId: string): Promise<void>;
  deleteUserAccount(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private profiles = new Map<string, Profile>();
  private assessments = new Map<string, Assessment>();

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return [...this.users.values()].find((user) => user.username === username);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const user = {
      id: randomUUID(),
      username: insertUser.username,
      password: insertUser.password,
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      subscriptionPlan: null,
      subscriptionEndsAt: null,
      isPremium: false,
      createdAt: now,
      updatedAt: now,
    } satisfies User;
    this.users.set(user.id, user);
    return user;
  }
  async getProfile(id: string) { return this.profiles.get(id); }
  async getProfileByUserId(userId: string) {
    return [...this.profiles.values()].find((profile) => profile.userId === userId);
  }
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const now = new Date();
    const profile = {
      ...insertProfile,
      id: randomUUID(),
      userId: insertProfile.userId ?? null,
      sessionId: insertProfile.sessionId ?? null,
      birthTime: insertProfile.birthTime ?? null,
      birthLocation: insertProfile.birthLocation ?? null,
      timezone: insertProfile.timezone ?? null,
      latitude: insertProfile.latitude ?? null,
      longitude: insertProfile.longitude ?? null,
      isPremium: insertProfile.isPremium ?? false,
      astrologyData: insertProfile.astrologyData ?? null,
      numerologyData: insertProfile.numerologyData ?? null,
      personalityData: insertProfile.personalityData ?? null,
      archetypeData: insertProfile.archetypeData ?? null,
      humanDesignData: insertProfile.humanDesignData ?? null,
      vedicAstrologyData: insertProfile.vedicAstrologyData ?? null,
      geneKeysData: insertProfile.geneKeysData ?? null,
      iChingData: insertProfile.iChingData ?? null,
      chineseAstrologyData: insertProfile.chineseAstrologyData ?? null,
      kabbalahData: insertProfile.kabbalahData ?? null,
      mayanAstrologyData: insertProfile.mayanAstrologyData ?? null,
      chakraData: insertProfile.chakraData ?? null,
      sacredGeometryData: insertProfile.sacredGeometryData ?? null,
      runesData: insertProfile.runesData ?? null,
      sabianSymbolsData: insertProfile.sabianSymbolsData ?? null,
      ayurvedaData: insertProfile.ayurvedaData ?? null,
      biorhythmsData: insertProfile.biorhythmsData ?? null,
      asteroidsData: insertProfile.asteroidsData ?? null,
      arabicPartsData: insertProfile.arabicPartsData ?? null,
      fixedStarsData: insertProfile.fixedStarsData ?? null,
      purposeStatement: insertProfile.purposeStatement ?? null,
      biography: insertProfile.biography ?? null,
      dailyGuidance: insertProfile.dailyGuidance ?? null,
      createdAt: now,
      updatedAt: now,
    } satisfies Profile;
    this.profiles.set(profile.id, profile);
    return profile;
  }
  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const existing = this.profiles.get(id);
    if (!existing) throw new Error("Profile not found");
    const updated = { ...existing, ...updates, updatedAt: new Date() } satisfies Profile;
    this.profiles.set(id, updated);
    return updated;
  }
  async getAssessment(profileId: string, type: string) {
    return [...this.assessments.values()].find(
      (assessment) => assessment.profileId === profileId && assessment.assessmentType === type,
    );
  }
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const assessment = {
      ...insertAssessment,
      id: randomUUID(),
      createdAt: new Date(),
      calculatedType: insertAssessment.calculatedType ?? null,
    } satisfies Assessment;
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }
  async deleteSessionData(sessionId: string): Promise<void> {
    const profileIds = [...this.profiles.values()]
      .filter((profile) => profile.sessionId === sessionId)
      .map((profile) => profile.id);
    for (const [id, assessment] of this.assessments) {
      if (profileIds.includes(assessment.profileId)) this.assessments.delete(id);
    }
    for (const [id, profile] of this.profiles) {
      if (profile.sessionId === sessionId) this.profiles.delete(id);
    }
  }
  async deleteUserAccount(userId: string): Promise<void> {
    const profileIds = [...this.profiles.values()]
      .filter((profile) => profile.userId === userId)
      .map((profile) => profile.id);
    for (const [id, assessment] of this.assessments) {
      if (profileIds.includes(assessment.profileId)) this.assessments.delete(id);
    }
    for (const [id, profile] of this.profiles) {
      if (profile.userId === userId) this.profiles.delete(id);
    }
    this.users.delete(userId);
  }
}

class PostgresStorage implements IStorage {
  private async db() {
    return (await import("./db")).db;
  }

  async getUser(id: string) {
    const db = await this.db();
    return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
  }
  async getUserByUsername(username: string) {
    const db = await this.db();
    return (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.db();
    return (await db.insert(users).values(insertUser).returning())[0];
  }
  async getProfile(id: string) {
    const db = await this.db();
    return (await db.select().from(profiles).where(eq(profiles.id, id)).limit(1))[0];
  }
  async getProfileByUserId(userId: string) {
    const db = await this.db();
    return (await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1))[0];
  }
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const db = await this.db();
    return (await db.insert(profiles).values(insertProfile).returning())[0];
  }
  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const db = await this.db();
    const row = (await db.update(profiles).set({ ...updates, updatedAt: new Date() }).where(eq(profiles.id, id)).returning())[0];
    if (!row) throw new Error("Profile not found");
    return row;
  }
  async getAssessment(profileId: string, type: string) {
    const db = await this.db();
    return (await db.select().from(assessmentResponses)
      .where(eq(assessmentResponses.profileId, profileId)))[0];
  }
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const db = await this.db();
    return (await db.insert(assessmentResponses).values(insertAssessment).returning())[0];
  }
  async deleteSessionData(sessionId: string): Promise<void> {
    const db = await this.db();
    const ownedProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.sessionId, sessionId));
    const ids = ownedProfiles.map((row) => row.id);
    if (ids.length) await db.delete(assessmentResponses).where(inArray(assessmentResponses.profileId, ids));
    await db.delete(accessCodeRedemptions).where(eq(accessCodeRedemptions.sessionId, sessionId));
    await db.delete(profiles).where(eq(profiles.sessionId, sessionId));
  }
  async deleteUserAccount(userId: string): Promise<void> {
    const db = await this.db();
    const ownedProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId));
    const ids = ownedProfiles.map((row) => row.id);
    if (ids.length) await db.delete(assessmentResponses).where(inArray(assessmentResponses.profileId, ids));
    await db.delete(accessCodeRedemptions).where(eq(accessCodeRedemptions.userId, userId));
    await db.delete(profiles).where(eq(profiles.userId, userId));
    await db.delete(localUsers).where(eq(localUsers.id, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
}

const usePostgres = Boolean(process.env.DATABASE_URL) && process.env.DEMO_MODE !== "true";
export const storage: IStorage = usePostgres ? new PostgresStorage() : new MemStorage();
console.log(`[ServerStorage] Using ${usePostgres ? "PostgresStorage" : "MemStorage"}`);

import { type User, type UpsertUser, type Profile, type InsertProfile, type Person, type InsertPerson, type Assessment, type InsertAssessment, type AccessCode, type AccessCodeRedemption, type InsertAccessCode, type DailyInsight, type InsertDailyInsight, type CompatibilityAnalysis, type InsertCompatibility, type LocalUser, type PushSubscription, type InsertPushSubscription, type FrequencyLog, type InsertFrequencyLog, type WebhookEvent, type InsertWebhookEvent } from "./shared/schema";
import { randomUUID } from "crypto";

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE LAYER - Production-Ready Data Management
// ═══════════════════════════════════════════════════════════════════════════
//
// NOTE: For Render bootstrap we use in-memory storage by default.
// Avoid importing DB modules and table schemas to prevent build-time resolution.
// Removed drizzle imports to avoid schema resolution in bundle
//
// PRODUCTION CONSIDERATIONS:
// - Data is ephemeral in MemStorage (lost on restart)
// - For persistence, configure DATABASE_URL and use DbStorage
// - MemStorage is suitable for demos and testing
// ═══════════════════════════════════════════════════════════════════════════

// Storage metrics for monitoring
interface StorageMetrics {
  totalProfiles: number;
  totalUsers: number;
  totalSessions: number;
  lastAccess: Date;
}

let storageMetrics: StorageMetrics = {
  totalProfiles: 0,
  totalUsers: 0,
  totalSessions: 0,
  lastAccess: new Date()
};

// Export metrics for monitoring
export function getStorageMetrics(): StorageMetrics {
  return { ...storageMetrics };
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Local authentication operations
  getLocalUserByEmail(email: string): Promise<LocalUser | undefined>;
  createLocalUser(userId: string, email: string, passwordHash: string): Promise<LocalUser>;
  updateLocalUserLastLogin(id: string): Promise<void>;
  
  // Profile operations
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  getProfileBySessionId(sessionId: string): Promise<Profile | undefined>;
  getAllProfiles(): Promise<Profile[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile>;
  
  getAssessment(profileId: string, type: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  
  getAccessCode(code: string): Promise<AccessCode | undefined>;
  createAccessCode(accessCode: InsertAccessCode): Promise<AccessCode>;
  updateAccessCode(id: string, updates: Partial<AccessCode>): Promise<AccessCode>;
  getAllAccessCodes(): Promise<AccessCode[]>;
  incrementAccessCodeUse(code: string): Promise<AccessCode>;
  getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<AccessCodeRedemption[]>;
  createAccessCodeRedemptionWithIncrement(params: { accessCodeId: string; userId?: string; sessionId?: string }): Promise<AccessCodeRedemption>;
  getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<AccessCode[]>;
  migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void>;
  
  getDailyInsight(profileId: string, date: string): Promise<DailyInsight | undefined>;
  createDailyInsight(insight: InsertDailyInsight): Promise<DailyInsight>;
  getRecentTemplateIds(profileId: string, days: number): Promise<string[]>;
  
  // Person operations (for compatibility)
  getPerson(id: string): Promise<Person | undefined>;
  getPersonsByUserId(userId: string): Promise<Person[]>;
  getPersonsBySessionId(sessionId: string): Promise<Person[]>;
  migratePersonsFromSessionToUser(sessionId: string, userId: string): Promise<number>;
  migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, updates: Partial<Person>): Promise<Person>;
  deletePerson(id: string): Promise<void>;
  
  getCompatibility(profile1Id: string, profile2Id: string): Promise<CompatibilityAnalysis | undefined>;
  createCompatibility(compatibility: InsertCompatibility): Promise<CompatibilityAnalysis>;
  getProfileCompatibilities(profileId: string): Promise<CompatibilityAnalysis[]>;
  
  // Push subscription operations
  getPushSubscription(endpoint: string): Promise<PushSubscription | undefined>;
  getPushSubscriptionsByUser(userId: string): Promise<PushSubscription[]>;
  getPushSubscriptionsBySession(sessionId: string): Promise<PushSubscription[]>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  updatePushSubscription(id: string, updates: Partial<PushSubscription>): Promise<PushSubscription>;
  deletePushSubscription(endpoint: string): Promise<void>;
  
  // Frequency log operations (Life Current Tracker)
  createFrequencyLog(log: InsertFrequencyLog): Promise<FrequencyLog>;
  getFrequencyLogsByUser(userId: string): Promise<FrequencyLog[]>;
  getFrequencyLogsBySession(sessionId: string): Promise<FrequencyLog[]>;
  getFrequencyLogsInRange(userId: string | null, sessionId: string | null, startDate: Date, endDate: Date): Promise<FrequencyLog[]>;
  
  // Password reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{id: string, userId: string, expiresAt: Date, usedAt: Date | null} | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
  updateLocalUserPassword(userId: string, newPasswordHash: string): Promise<void>;
  
  // Webhook event operations (for idempotency)
  getWebhookEventByStripeId(stripeEventId: string): Promise<WebhookEvent | undefined>;
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
}

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

// Maximum limits to prevent memory issues
const MAX_PROFILES = 10000;
const MAX_DAILY_INSIGHTS = 50000;
const MAX_FREQUENCY_LOGS = 100000;

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private localUsers: Map<string, LocalUser>;
  private profiles: Map<string, Profile>;
  private persons: Map<string, Person>;
  private assessments: Map<string, Assessment>;
  private accessCodes: Map<string, AccessCode>;
  private dailyInsights: Map<string, DailyInsight>;
  private compatibilities: Map<string, CompatibilityAnalysis>;
  private pushSubscriptions: Map<string, PushSubscription>;
  private frequencyLogs: Map<string, FrequencyLog>;
  
  // Track storage statistics
  private createdAt: Date = new Date();
  private lastCleanup: Date = new Date();
  private webhookEvents: Map<string, WebhookEvent>;

  constructor() {
    this.users = new Map();
    this.localUsers = new Map();
    this.profiles = new Map();
    this.persons = new Map();
    this.assessments = new Map();
    this.accessCodes = new Map();
    this.dailyInsights = new Map();
    this.compatibilities = new Map();
    this.pushSubscriptions = new Map();
    this.frequencyLogs = new Map();
    this.webhookEvents = new Map();
    
    console.log("[MemStorage] Initialized in-memory storage");
    console.log("[MemStorage] ⚠️  Data will not persist across restarts");
    
    // Schedule periodic cleanup (every hour)
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }
  
  // Cleanup old data to prevent memory bloat
  private cleanup(): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    let cleaned = 0;
    
    // Clean old daily insights (keep 7 days)
    for (const [key, insight] of this.dailyInsights.entries()) {
      if (insight.createdAt && new Date(insight.createdAt).getTime() < oneWeekAgo) {
        this.dailyInsights.delete(key);
        cleaned++;
      }
    }
    
    // Clean old webhook events (keep 1 day for idempotency)
    for (const [key, event] of this.webhookEvents.entries()) {
      if (event.receivedAt && new Date(event.receivedAt).getTime() < oneDayAgo) {
        this.webhookEvents.delete(key);
        cleaned++;
      }
    }
    
    // Enforce max limits
    if (this.dailyInsights.size > MAX_DAILY_INSIGHTS) {
      const toDelete = this.dailyInsights.size - MAX_DAILY_INSIGHTS;
      const keys = Array.from(this.dailyInsights.keys()).slice(0, toDelete);
      keys.forEach(k => this.dailyInsights.delete(k));
      cleaned += toDelete;
    }
    
    if (cleaned > 0) {
      console.log(`[MemStorage] Cleaned ${cleaned} old entries`);
    }
    
    this.lastCleanup = new Date();
    
    // Update metrics
    storageMetrics = {
      totalProfiles: this.profiles.size,
      totalUsers: this.users.size,
      totalSessions: this.profiles.size,
      lastAccess: new Date()
    };
  }
  
  // Get storage statistics
  getStats(): { profiles: number; users: number; insights: number; uptime: number } {
    return {
      profiles: this.profiles.size,
      users: this.users.size,
      insights: this.dailyInsights.size,
      uptime: Date.now() - this.createdAt.getTime()
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.stripeCustomerId === stripeCustomerId) {
        return user;
      }
    }
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        id: userData.id!,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        stripeCustomerId: userData.stripeCustomerId || null,
        stripeSubscriptionId: userData.stripeSubscriptionId || null,
        subscriptionStatus: userData.subscriptionStatus || null,
        subscriptionPlan: userData.subscriptionPlan || null,
        subscriptionEndsAt: userData.subscriptionEndsAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  async getLocalUserByEmail(email: string): Promise<LocalUser | undefined> {
    return Array.from(this.localUsers.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createLocalUser(userId: string, email: string, passwordHash: string): Promise<LocalUser> {
    const now = new Date();
    const localUser: LocalUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      passwordVersion: 1,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.localUsers.set(userId, localUser);
    return localUser;
  }

  async updateLocalUserLastLogin(id: string): Promise<void> {
    const localUser = this.localUsers.get(id);
    if (localUser) {
      const updated: LocalUser = {
        ...localUser,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      };
      this.localUsers.set(id, updated);
    }
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async getProfileBySessionId(sessionId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.sessionId === sessionId,
    );
  }

  async getAllProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values());
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const now = new Date();
    const profile: Profile = { 
      ...insertProfile,
      // Optional birth fields (inclusivity for adoptees, incomplete records)
      birthTime: insertProfile.birthTime || null,
      birthLocation: insertProfile.birthLocation || null,
      timezone: insertProfile.timezone || null,
      latitude: insertProfile.latitude || null,
      longitude: insertProfile.longitude || null,
      // System data
      id, 
      createdAt: now,
      updatedAt: now,
      userId: insertProfile.userId || null,
      sessionId: insertProfile.sessionId || null,
      astrologyData: insertProfile.astrologyData || null,
      numerologyData: insertProfile.numerologyData || null,
      personalityData: insertProfile.personalityData || null,
      archetypeData: insertProfile.archetypeData || null,
      humanDesignData: insertProfile.humanDesignData || null,
      vedicAstrologyData: insertProfile.vedicAstrologyData || null,
      geneKeysData: insertProfile.geneKeysData || null,
      iChingData: insertProfile.iChingData || null,
      chineseAstrologyData: insertProfile.chineseAstrologyData || null,
      kabbalahData: insertProfile.kabbalahData || null,
      mayanAstrologyData: insertProfile.mayanAstrologyData || null,
      chakraData: insertProfile.chakraData || null,
      sacredGeometryData: insertProfile.sacredGeometryData || null,
      runesData: insertProfile.runesData || null,
      sabianSymbolsData: insertProfile.sabianSymbolsData || null,
      ayurvedaData: insertProfile.ayurvedaData || null,
      biorhythmsData: insertProfile.biorhythmsData || null,
      asteroidsData: insertProfile.asteroidsData || null,
      arabicPartsData: insertProfile.arabicPartsData || null,
      fixedStarsData: insertProfile.fixedStarsData || null,
      biography: insertProfile.biography || null,
      dailyGuidance: insertProfile.dailyGuidance || null,
      purposeStatement: insertProfile.purposeStatement || null,
      isPremium: insertProfile.isPremium ?? null
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const existing = this.profiles.get(id);
    if (!existing) {
      throw new Error("Profile not found");
    }
    const updated: Profile = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.profiles.set(id, updated);
    return updated;
  }

  async getAssessment(profileId: string, type: string): Promise<Assessment | undefined> {
    return Array.from(this.assessments.values()).find(
      (assessment) => assessment.profileId === profileId && assessment.assessmentType === type,
    );
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { 
      ...insertAssessment, 
      id, 
      createdAt: new Date(),
      calculatedType: insertAssessment.calculatedType || null
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAccessCode(code: string): Promise<AccessCode | undefined> {
    // Case-insensitive lookup
    const normalizedCode = code.toLowerCase();
    return Array.from(this.accessCodes.values()).find(
      (accessCode) => accessCode.code.toLowerCase() === normalizedCode,
    );
  }

  async createAccessCode(insertAccessCode: InsertAccessCode): Promise<AccessCode> {
    const maxUses = insertAccessCode.maxUses || 1;
    if (maxUses < 1) {
      throw new Error("maxUses must be at least 1");
    }
    
    if (insertAccessCode.expiresAt && insertAccessCode.expiresAt < new Date()) {
      throw new Error("expiresAt must be in the future");
    }
    
    const id = randomUUID();
    const now = new Date();
    const accessCode: AccessCode = { 
      ...insertAccessCode, 
      id, 
      createdAt: now,
      updatedAt: now,
      usesCount: 0,
      maxUses,
      isActive: insertAccessCode.isActive ?? true,
      expiresAt: insertAccessCode.expiresAt || null
    };
    this.accessCodes.set(id, accessCode);
    return accessCode;
  }

  async updateAccessCode(id: string, updates: Partial<AccessCode>): Promise<AccessCode> {
    const existing = this.accessCodes.get(id);
    if (!existing) {
      throw new Error("Access code not found");
    }
    
    if (updates.maxUses !== undefined && updates.maxUses < 1) {
      throw new Error("maxUses must be at least 1");
    }
    
    if (updates.usesCount !== undefined && updates.usesCount < 0) {
      throw new Error("usesCount cannot be negative");
    }
    
    if (updates.expiresAt && updates.expiresAt < new Date()) {
      throw new Error("expiresAt must be in the future");
    }
    
    const updated: AccessCode = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    if (updated.usesCount > updated.maxUses) {
      throw new Error("usesCount cannot exceed maxUses");
    }
    
    this.accessCodes.set(id, updated);
    return updated;
  }

  async getAllAccessCodes(): Promise<AccessCode[]> {
    return Array.from(this.accessCodes.values());
  }

  async incrementAccessCodeUse(code: string): Promise<AccessCode> {
    const accessCode = await this.getAccessCode(code);
    if (!accessCode) {
      throw new Error("Access code not found");
    }
    
    if (!accessCode.isActive) {
      throw new Error("Access code is inactive");
    }
    
    if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
      throw new Error("Access code has expired");
    }
    
    if (accessCode.usesCount >= accessCode.maxUses) {
      throw new Error("Access code has reached maximum uses");
    }
    
    const updated: AccessCode = {
      ...accessCode,
      usesCount: accessCode.usesCount + 1,
      updatedAt: new Date()
    };
    this.accessCodes.set(accessCode.id, updated);
    return updated;
  }

  async getAccessCodeRedemptions(_params: { userId?: string; sessionId?: string }): Promise<AccessCodeRedemption[]> {
    // MemStorage: Return empty array (no persistent redemption tracking)
    return [];
  }

  async createAccessCodeRedemptionWithIncrement(params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<AccessCodeRedemption> {
    // MemStorage: Create a simple redemption record and increment the code usage
    const accessCode = Array.from(this.accessCodes.values()).find(c => c.id === params.accessCodeId);
    if (accessCode) {
      accessCode.usesCount = (accessCode.usesCount || 0) + 1;
      accessCode.updatedAt = new Date();
    }
    // Return a minimal redemption record
    return {
      id: randomUUID(),
      accessCodeId: params.accessCodeId,
      userId: params.userId || null,
      sessionId: params.sessionId || null,
      redeemedAt: new Date()
    } as AccessCodeRedemption;
  }

  async getActiveAccessCodesForUser(_params: { userId?: string; sessionId?: string }): Promise<AccessCode[]> {
    // MemStorage: Return empty array (simplified - no tracking of user-specific codes)
    // In production with DbStorage, this would query redemptions table
    return [];
  }

  async migrateAccessCodeRedemptions(_sessionId: string, _userId: string): Promise<void> {
    // MemStorage: No-op (no persistent data to migrate)
  }
  
  async getDailyInsight(profileId: string, date: string): Promise<DailyInsight | undefined> {
    return Array.from(this.dailyInsights.values()).find(
      (insight) => insight.profileId === profileId && insight.date === date,
    );
  }
  
  async createDailyInsight(insertInsight: InsertDailyInsight): Promise<DailyInsight> {
    const id = randomUUID();
    const insight: DailyInsight = {
      ...insertInsight,
      id,
      createdAt: new Date(),
    };
    this.dailyInsights.set(id, insight);
    return insight;
  }
  
  async getRecentTemplateIds(profileId: string, days: number): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    const recentInsights = Array.from(this.dailyInsights.values())
      .filter(insight => insight.profileId === profileId && insight.date >= cutoffDateStr)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    const allTemplateIds: string[] = [];
    recentInsights.forEach(insight => {
      const ids = insight.templateIds as any;
      if (Array.isArray(ids)) {
        allTemplateIds.push(...ids);
      }
    });
    
    return Array.from(new Set(allTemplateIds));
  }
  
  async getCompatibility(profile1Id: string, profile2Id: string): Promise<CompatibilityAnalysis | undefined> {
    return Array.from(this.compatibilities.values()).find(
      (comp) => 
        (comp.profile1Id === profile1Id && comp.profile2Id === profile2Id) ||
        (comp.profile1Id === profile2Id && comp.profile2Id === profile1Id)
    );
  }
  
  async createCompatibility(insertCompatibility: InsertCompatibility): Promise<CompatibilityAnalysis> {
    const id = randomUUID();
    const now = new Date();
    const compatibility: CompatibilityAnalysis = {
      ...insertCompatibility,
      id,
      profile1Id: insertCompatibility.profile1Id || null,
      profile2Id: insertCompatibility.profile2Id || null,
      person1Id: insertCompatibility.person1Id || null,
      person2Id: insertCompatibility.person2Id || null,
      createdAt: now,
      updatedAt: now,
    };
    this.compatibilities.set(id, compatibility);
    return compatibility;
  }
  
  async getProfileCompatibilities(profileId: string): Promise<CompatibilityAnalysis[]> {
    return Array.from(this.compatibilities.values()).filter(
      (comp) => comp.profile1Id === profileId || comp.profile2Id === profileId
    );
  }
  
  async getPerson(id: string): Promise<Person | undefined> {
    return this.persons.get(id);
  }
  
  async getPersonsByUserId(userId: string): Promise<Person[]> {
    return Array.from(this.persons.values()).filter(
      (person) => person.userId === userId
    );
  }
  
  async getPersonsBySessionId(sessionId: string): Promise<Person[]> {
    return Array.from(this.persons.values()).filter(
      (person) => person.sessionId === sessionId && !person.userId
    );
  }
  
  async migratePersonsFromSessionToUser(sessionId: string, userId: string): Promise<number> {
    const sessionPersons = await this.getPersonsBySessionId(sessionId);
    let migrated = 0;
    
    for (const person of sessionPersons) {
      await this.updatePerson(person.id, {
        userId,
        sessionId: null,
      });
      migrated++;
    }
    
    console.log(`[Migration] Migrated ${migrated} persons from session ${sessionId} to user ${userId}`);
    return migrated;
  }

  async migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean> {
    const sessionProfile = await this.getProfileBySessionId(sessionId);
    
    if (!sessionProfile) {
      console.log(`[Profile Migration] No profile found for session ${sessionId}`);
      return false;
    }
    
    // Check if user already has a profile
    const existingUserProfile = await this.getProfileByUserId(userId);
    if (existingUserProfile) {
      console.log(`[Profile Migration] User ${userId} already has a profile, skipping migration`);
      return false;
    }
    
    // Migrate the profile
    await this.updateProfile(sessionProfile.id, {
      userId,
      sessionId: null,
    });
    
    console.log(`[Profile Migration] Migrated profile ${sessionProfile.id} from session ${sessionId} to user ${userId}`);
    return true;
  }
  
  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = randomUUID();
    const now = new Date();
    const person: Person = {
      ...insertPerson,
      id,
      userId: insertPerson.userId || null,
      sessionId: insertPerson.sessionId || null,
      fullName: insertPerson.fullName || null,
      dob: insertPerson.dob || null,
      tob: insertPerson.tob || null,
      birthLocation: insertPerson.birthLocation || null,
      birthLat: insertPerson.birthLat || null,
      birthLon: insertPerson.birthLon || null,
      psych: insertPerson.psych || null,
      createdAt: now,
      updatedAt: now,
    };
    this.persons.set(id, person);
    return person;
  }
  
  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const existing = this.persons.get(id);
    if (!existing) {
      throw new Error("Person not found");
    }
    const updated: Person = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.persons.set(id, updated);
    return updated;
  }
  
  async deletePerson(id: string): Promise<void> {
    this.persons.delete(id);
  }
  
  async getPushSubscription(endpoint: string): Promise<PushSubscription | undefined> {
    return Array.from(this.pushSubscriptions.values()).find(
      (sub) => sub.endpoint === endpoint
    );
  }
  
  async getPushSubscriptionsByUser(userId: string): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values()).filter(
      (sub) => sub.userId === userId && sub.isActive
    );
  }
  
  async getPushSubscriptionsBySession(sessionId: string): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values()).filter(
      (sub) => sub.sessionId === sessionId && sub.isActive
    );
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values());
  }
  
  async createPushSubscription(insertSubscription: InsertPushSubscription): Promise<PushSubscription> {
    const id = randomUUID();
    const now = new Date();
    const subscription: PushSubscription = {
      ...insertSubscription,
      id,
      userId: insertSubscription.userId || null,
      sessionId: insertSubscription.sessionId || null,
      isActive: insertSubscription.isActive !== undefined ? insertSubscription.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    this.pushSubscriptions.set(id, subscription);
    return subscription;
  }
  
  async updatePushSubscription(id: string, updates: Partial<PushSubscription>): Promise<PushSubscription> {
    const existing = this.pushSubscriptions.get(id);
    if (!existing) {
      throw new Error("Push subscription not found");
    }
    const updated: PushSubscription = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.pushSubscriptions.set(id, updated);
    return updated;
  }
  
  async deletePushSubscription(endpoint: string): Promise<void> {
    const subscription = await this.getPushSubscription(endpoint);
    if (subscription) {
      this.pushSubscriptions.delete(subscription.id);
    }
  }

  async createFrequencyLog(insertLog: InsertFrequencyLog): Promise<FrequencyLog> {
    const id = randomUUID();
    const now = new Date();
    const log: FrequencyLog = {
      id,
      userId: insertLog.userId || null,
      sessionId: insertLog.sessionId || null,
      frequency: insertLog.frequency,
      notes: insertLog.notes || null,
      notificationContext: insertLog.notificationContext || null,
      activeTransits: insertLog.activeTransits || null,
      loggedAt: insertLog.loggedAt || now,
      createdAt: now,
    };
    this.frequencyLogs.set(id, log);
    return log;
  }

  async getFrequencyLogsByUser(userId: string): Promise<FrequencyLog[]> {
    return Array.from(this.frequencyLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  async getFrequencyLogsBySession(sessionId: string): Promise<FrequencyLog[]> {
    return Array.from(this.frequencyLogs.values())
      .filter(log => log.sessionId === sessionId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  async getFrequencyLogsInRange(
    userId: string | null,
    sessionId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<FrequencyLog[]> {
    return Array.from(this.frequencyLogs.values())
      .filter(log => {
        const matchesUser = userId ? log.userId === userId : log.sessionId === sessionId;
        const inRange = log.loggedAt >= startDate && log.loggedAt <= endDate;
        return matchesUser && inRange;
      })
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  // Password reset operations (stub implementations for MemStorage)
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    // Stub - not implemented for in-memory storage
  }

  async getPasswordResetToken(token: string): Promise<{id: string, userId: string, expiresAt: Date, usedAt: Date | null} | undefined> {
    // Stub - not implemented for in-memory storage
    return undefined;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    // Stub - not implemented for in-memory storage
  }

  async updateLocalUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    const localUser = Array.from(this.localUsers.values()).find(u => u.id === userId);
    if (localUser) {
      localUser.passwordHash = newPasswordHash;
      localUser.updatedAt = new Date();
      this.localUsers.set(userId, localUser);
    }
  }

  // Webhook event operations (for idempotency)
  async getWebhookEventByStripeId(stripeEventId: string): Promise<WebhookEvent | undefined> {
    return Array.from(this.webhookEvents.values()).find(
      (event) => event.stripeEventId === stripeEventId
    );
  }

  async createWebhookEvent(eventData: InsertWebhookEvent): Promise<WebhookEvent> {
    const id = randomUUID();
    const event: WebhookEvent = {
      id,
      stripeEventId: eventData.stripeEventId,
      type: eventData.type,
      processedAt: new Date(),
      result: eventData.result || null,
      metadata: eventData.metadata || null,
    };
    this.webhookEvents.set(event.stripeEventId, event);
    return event;
  }
}

class DbStorage implements IStorage {
  // User operations
  // STUB - DbStorage is disabled for bootstrap; all methods are no-ops
  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  // Local authentication operations
  async getLocalUserByEmail(email: string): Promise<LocalUser | undefined> {
    return undefined;
  }

  async createLocalUser(userId: string, email: string, passwordHash: string): Promise<LocalUser> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updateLocalUserLastLogin(id: string): Promise<void> {
    // Stub
  }

  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    return undefined;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    return undefined;
  }

  async getProfileBySessionId(sessionId: string): Promise<Profile | undefined> {
    return undefined;
  }

  async getAllProfiles(): Promise<Profile[]> {
    return [];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  // Assessment operations
  async getAssessment(profileId: string, type: string): Promise<Assessment | undefined> {
    return undefined;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  // Access code operations
  async getAccessCode(code: string): Promise<AccessCode | undefined> {
    return undefined;
  }

  async createAccessCode(insertAccessCode: InsertAccessCode): Promise<AccessCode> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updateAccessCode(id: string, updates: Partial<AccessCode>): Promise<AccessCode> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getAllAccessCodes(): Promise<AccessCode[]> {
    return [];
  }

  async incrementAccessCodeUse(code: string): Promise<AccessCode> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<AccessCodeRedemption[]> {
    return [];
  }

  async createAccessCodeRedemptionWithIncrement(params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<AccessCodeRedemption> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<AccessCode[]> {
    return [];
  }

  async migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void> {
    // Stub
  }

  // Daily insight operations
  async getDailyInsight(profileId: string, date: string): Promise<DailyInsight | undefined> {
    return undefined;
  }

  async createDailyInsight(insight: InsertDailyInsight): Promise<DailyInsight> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getRecentTemplateIds(profileId: string, days: number): Promise<string[]> {
    return [];
  }

  // Person operations
  async getPerson(id: string): Promise<Person | undefined> {
    return undefined;
  }

  async getPersonsByUserId(userId: string): Promise<Person[]> {
    return [];
  }

  async getPersonsBySessionId(sessionId: string): Promise<Person[]> {
    return [];
  }

  async migratePersonsFromSessionToUser(sessionId: string, userId: string): Promise<number> {
    return 0;
  }

  async migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean> {
    return false;
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async deletePerson(id: string): Promise<void> {
    // Stub
  }

  // Compatibility operations
  async getCompatibility(profile1Id: string, profile2Id: string): Promise<CompatibilityAnalysis | undefined> {
    return undefined;
  }

  async createCompatibility(compatibility: InsertCompatibility): Promise<CompatibilityAnalysis> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getProfileCompatibilities(profileId: string): Promise<CompatibilityAnalysis[]> {
    return [];
  }

  // Push subscription operations
  async getPushSubscription(endpoint: string): Promise<PushSubscription | undefined> {
    return undefined;
  }

  async getPushSubscriptionsByUser(userId: string): Promise<PushSubscription[]> {
    return [];
  }

  async getPushSubscriptionsBySession(sessionId: string): Promise<PushSubscription[]> {
    return [];
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return [];
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updatePushSubscription(id: string, updates: Partial<PushSubscription>): Promise<PushSubscription> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    // Stub
  }

  // Frequency log operations
  async createFrequencyLog(log: InsertFrequencyLog): Promise<FrequencyLog> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getFrequencyLogsByUser(userId: string): Promise<FrequencyLog[]> {
    return [];
  }

  async getFrequencyLogsBySession(sessionId: string): Promise<FrequencyLog[]> {
    return [];
  }

  async getFrequencyLogsInRange(
    userId: string | null,
    sessionId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<FrequencyLog[]> {
    return [];
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    // Stub
  }

  async getPasswordResetToken(token: string): Promise<{id: string, userId: string, expiresAt: Date, usedAt: Date | null} | undefined> {
    return undefined;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    // Stub
  }

  async updateLocalUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    // Stub
  }

  // Webhook event operations (for idempotency)
  async getWebhookEventByStripeId(stripeEventId: string): Promise<WebhookEvent | undefined> {
    return undefined;
  }

  async createWebhookEvent(eventData: InsertWebhookEvent): Promise<WebhookEvent> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }
}


// Switch to DbStorage for production-ready persistence
// Switch to MemStorage for initial deployment; swap to DbStorage when schema is in place
// export const storage = new DbStorage();
export const storage = new MemStorage();

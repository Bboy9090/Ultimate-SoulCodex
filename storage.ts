import { type User, type UpsertUser, type Profile, type InsertProfile, type Person, type InsertPerson, type Assessment, type InsertAssessment, type AccessCode, type AccessCodeRedemption, type InsertAccessCode, type DailyInsight, type InsertDailyInsight, type CompatibilityAnalysis, type InsertCompatibility, type LocalUser, type PushSubscription, type InsertPushSubscription, type FrequencyLog, type InsertFrequencyLog, type WebhookEvent, type InsertWebhookEvent } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, localUsers, profiles, assessmentResponses, accessCodes, accessCodeRedemptions, dailyInsights, persons, compatibilityAnalyses, pushSubscriptions, frequencyLogs, webhookEvents } from "@shared/schema";
import { eq, and, or, desc, gte, lte, sql as drizzleSql } from "drizzle-orm";

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
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }

  async createAccessCodeRedemptionWithIncrement(_params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<AccessCodeRedemption> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }

  async getActiveAccessCodesForUser(_params: { userId?: string; sessionId?: string }): Promise<AccessCode[]> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }

  async migrateAccessCodeRedemptions(_sessionId: string, _userId: string): Promise<void> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
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

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          stripeCustomerId: userData.stripeCustomerId,
          stripeSubscriptionId: userData.stripeSubscriptionId,
          subscriptionStatus: userData.subscriptionStatus,
          subscriptionPlan: userData.subscriptionPlan,
          subscriptionEndsAt: userData.subscriptionEndsAt,
          updatedAt: drizzleSql`now()`,
        },
      })
      .returning();
    return result[0];
  }

  // Local authentication operations
  async getLocalUserByEmail(email: string): Promise<LocalUser | undefined> {
    const result = await db.select().from(localUsers).where(eq(localUsers.email, email));
    return result[0];
  }

  async createLocalUser(userId: string, email: string, passwordHash: string): Promise<LocalUser> {
    const result = await db
      .insert(localUsers)
      .values({
        id: userId,
        email,
        passwordHash,
        passwordVersion: 1,
      })
      .returning();
    return result[0];
  }

  async updateLocalUserLastLogin(id: string): Promise<void> {
    await db
      .update(localUsers)
      .set({ lastLoginAt: drizzleSql`now()`, updatedAt: drizzleSql`now()` })
      .where(eq(localUsers.id, id));
  }

  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id));
    return result[0];
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return result[0];
  }

  async getProfileBySessionId(sessionId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.sessionId, sessionId));
    return result[0];
  }

  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles);
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(profiles).values({
      ...profile,
      id,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const result = await db
      .update(profiles)
      .set({ ...updates, updatedAt: drizzleSql`now()` })
      .where(eq(profiles.id, id))
      .returning();
    if (!result[0]) throw new Error("Profile not found");
    return result[0];
  }

  // Assessment operations
  async getAssessment(profileId: string, type: string): Promise<Assessment | undefined> {
    const result = await db
      .select()
      .from(assessmentResponses)
      .where(and(eq(assessmentResponses.profileId, profileId), eq(assessmentResponses.assessmentType, type)));
    return result[0];
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const result = await db.insert(assessmentResponses).values({
      ...assessment,
      id,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  // Access code operations
  async getAccessCode(code: string): Promise<AccessCode | undefined> {
    // Case-insensitive lookup using SQL LOWER()
    const result = await db
      .select()
      .from(accessCodes)
      .where(drizzleSql`LOWER(${accessCodes.code}) = LOWER(${code})`);
    return result[0];
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
    const result = await db
      .insert(accessCodes)
      .values({
        ...insertAccessCode,
        id,
        maxUses,
        usesCount: 0,
        isActive: insertAccessCode.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  async updateAccessCode(id: string, updates: Partial<AccessCode>): Promise<AccessCode> {
    if (updates.maxUses !== undefined && updates.maxUses < 1) {
      throw new Error("maxUses must be at least 1");
    }
    if (updates.usesCount !== undefined && updates.usesCount < 0) {
      throw new Error("usesCount cannot be negative");
    }
    if (updates.expiresAt && updates.expiresAt < new Date()) {
      throw new Error("expiresAt must be in the future");
    }

    const result = await db
      .update(accessCodes)
      .set({ ...updates, updatedAt: drizzleSql`now()` })
      .where(eq(accessCodes.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Access code not found");
    
    if (result[0].usesCount > result[0].maxUses) {
      throw new Error("usesCount cannot exceed maxUses");
    }
    
    return result[0];
  }

  async getAllAccessCodes(): Promise<AccessCode[]> {
    return await db.select().from(accessCodes);
  }

  async incrementAccessCodeUse(code: string): Promise<AccessCode> {
    const accessCode = await this.getAccessCode(code);
    if (!accessCode) {
      throw new Error("Access code not found");
    }
    if (!accessCode.isActive) {
      throw new Error("Access code is inactive");
    }
    if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
      throw new Error("Access code has expired");
    }
    if (accessCode.usesCount >= accessCode.maxUses) {
      throw new Error("Access code has reached maximum uses");
    }

    return await this.updateAccessCode(accessCode.id, {
      usesCount: accessCode.usesCount + 1,
    });
  }

  async getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<AccessCodeRedemption[]> {
    if (!params.userId && !params.sessionId) {
      throw new Error("userId or sessionId required");
    }

    const whereClause = params.userId && params.sessionId
      ? or(
          eq(accessCodeRedemptions.userId, params.userId),
          eq(accessCodeRedemptions.sessionId, params.sessionId)
        )
      : params.userId
      ? eq(accessCodeRedemptions.userId, params.userId)
      : eq(accessCodeRedemptions.sessionId, params.sessionId!);

    return await db
      .select()
      .from(accessCodeRedemptions)
      .where(whereClause)
      .orderBy(desc(accessCodeRedemptions.redeemedAt));
  }

  async createAccessCodeRedemptionWithIncrement(params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<AccessCodeRedemption> {
    if ((!params.userId && !params.sessionId) || (params.userId && params.sessionId)) {
      throw new Error("Exactly one of userId or sessionId required");
    }

    return await db.transaction(async (tx) => {
      const code = await tx
        .select()
        .from(accessCodes)
        .where(eq(accessCodes.id, params.accessCodeId))
        .for("update")
        .limit(1);

      if (!code[0]) {
        throw new Error("Access code not found");
      }

      const accessCode = code[0];

      if (!accessCode.isActive) {
        throw new Error("Access code is inactive");
      }

      if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
        throw new Error("Access code has expired");
      }

      if (accessCode.usesCount >= accessCode.maxUses) {
        throw new Error("Access code has reached maximum uses");
      }

      let redemption;
      try {
        const result = await tx
          .insert(accessCodeRedemptions)
          .values({
            id: randomUUID(),
            accessCodeId: params.accessCodeId,
            userId: params.userId || null,
            sessionId: params.sessionId || null,
            redeemedAt: new Date(),
          })
          .returning();
        
        redemption = result[0];
      } catch (err: any) {
        if (err.code === '23505' || err.message?.includes('unique')) {
          throw new Error("Access code already redeemed by this user");
        }
        throw err;
      }

      await tx
        .update(accessCodes)
        .set({ 
          usesCount: drizzleSql`${accessCodes.usesCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(accessCodes.id, params.accessCodeId));

      return redemption;
    });
  }

  async getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<AccessCode[]> {
    if (!params.userId && !params.sessionId) {
      throw new Error("userId or sessionId required");
    }

    const redemptionFilter = params.userId && params.sessionId
      ? or(
          eq(accessCodeRedemptions.userId, params.userId),
          eq(accessCodeRedemptions.sessionId, params.sessionId)
        )
      : params.userId
      ? eq(accessCodeRedemptions.userId, params.userId)
      : eq(accessCodeRedemptions.sessionId, params.sessionId!);

    const results = await db
      .selectDistinctOn([accessCodes.id], {
        id: accessCodes.id,
        code: accessCodes.code,
        maxUses: accessCodes.maxUses,
        usesCount: accessCodes.usesCount,
        expiresAt: accessCodes.expiresAt,
        isActive: accessCodes.isActive,
        createdAt: accessCodes.createdAt,
        updatedAt: accessCodes.updatedAt,
      })
      .from(accessCodes)
      .innerJoin(accessCodeRedemptions, eq(accessCodes.id, accessCodeRedemptions.accessCodeId))
      .where(
        and(
          eq(accessCodes.isActive, true),
          or(
            drizzleSql`${accessCodes.expiresAt} IS NULL`,
            drizzleSql`${accessCodes.expiresAt} > NOW()`
          ),
          drizzleSql`${accessCodes.usesCount} < ${accessCodes.maxUses}`,
          redemptionFilter
        )
      );

    return results;
  }

  async migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const existingRedemptions = await tx
        .select({ accessCodeId: accessCodeRedemptions.accessCodeId })
        .from(accessCodeRedemptions)
        .where(eq(accessCodeRedemptions.userId, userId));

      const existingCodeIds = existingRedemptions.map(r => r.accessCodeId);

      if (existingCodeIds.length === 0) {
        const result = await tx
          .update(accessCodeRedemptions)
          .set({
            userId,
            sessionId: null,
          })
          .where(eq(accessCodeRedemptions.sessionId, sessionId))
          .returning();
        
        console.log(`[Storage] Migrated ${result.length} access code redemptions from session ${sessionId} to user ${userId}`);
        return;
      }

      const result = await tx
        .update(accessCodeRedemptions)
        .set({
          userId,
          sessionId: null,
        })
        .where(
          and(
            eq(accessCodeRedemptions.sessionId, sessionId),
            drizzleSql`${accessCodeRedemptions.accessCodeId} NOT IN (${drizzleSql.join(existingCodeIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`
          )
        )
        .returning();

      console.log(`[Storage] Migrated ${result.length} access code redemptions from session ${sessionId} to user ${userId}`);
    });
  }

  // Daily insight operations
  async getDailyInsight(profileId: string, date: string): Promise<DailyInsight | undefined> {
    const result = await db
      .select()
      .from(dailyInsights)
      .where(and(eq(dailyInsights.profileId, profileId), eq(dailyInsights.date, date)));
    return result[0];
  }

  async createDailyInsight(insight: InsertDailyInsight): Promise<DailyInsight> {
    const id = randomUUID();
    const result = await db.insert(dailyInsights).values({
      ...insight,
      id,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async getRecentTemplateIds(profileId: string, days: number): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

    const insights = await db
      .select()
      .from(dailyInsights)
      .where(and(eq(dailyInsights.profileId, profileId), gte(dailyInsights.date, cutoffDateStr)));

    const templateIds: string[] = [];
    for (const insight of insights) {
      if (Array.isArray(insight.templateIds)) {
        templateIds.push(...(insight.templateIds as string[]));
      }
    }
    return templateIds;
  }

  // Person operations
  async getPerson(id: string): Promise<Person | undefined> {
    const result = await db.select().from(persons).where(eq(persons.id, id));
    return result[0];
  }

  async getPersonsByUserId(userId: string): Promise<Person[]> {
    return await db.select().from(persons).where(eq(persons.userId, userId)).orderBy(desc(persons.createdAt));
  }

  async getPersonsBySessionId(sessionId: string): Promise<Person[]> {
    return await db.select().from(persons).where(eq(persons.sessionId, sessionId)).orderBy(desc(persons.createdAt));
  }

  async migratePersonsFromSessionToUser(sessionId: string, userId: string): Promise<number> {
    const result = await db
      .update(persons)
      .set({ userId, sessionId: null })
      .where(and(eq(persons.sessionId, sessionId), drizzleSql`${persons.userId} IS NULL`))
      .returning();
    return result.length;
  }

  async migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean> {
    console.log(`[Profile Migration] Starting migration - sessionId: ${sessionId}, userId: ${userId}`);
    
    // Check if user already has a profile
    const existingUserProfile = await this.getProfileByUserId(userId);
    if (existingUserProfile) {
      console.log(`[Profile Migration] User ${userId} already has a profile (${existingUserProfile.id}), skipping migration`);
      return false;
    }

    // Migrate the profile
    const result = await db
      .update(profiles)
      .set({ userId, sessionId: null, updatedAt: new Date() })
      .where(and(eq(profiles.sessionId, sessionId), drizzleSql`${profiles.userId} IS NULL`))
      .returning();
    
    if (result.length > 0) {
      console.log(`[Profile Migration] ✅ Successfully migrated profile ${result[0].id} from session ${sessionId} to user ${userId}`);
      console.log(`[Profile Migration] Profile name: ${result[0].name}, userId now: ${result[0].userId}`);
      
      // Verify the migration worked
      const verifyProfile = await this.getProfileByUserId(userId);
      console.log(`[Profile Migration] Verification: Profile found by userId? ${verifyProfile ? 'YES (id: ' + verifyProfile.id + ')' : 'NO'}`);
      
      return true;
    }
    
    console.log(`[Profile Migration] ❌ No profile found for session ${sessionId}`);
    return false;
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(persons).values({
      ...person,
      id,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const result = await db
      .update(persons)
      .set({ ...updates, updatedAt: drizzleSql`now()` })
      .where(eq(persons.id, id))
      .returning();
    if (!result[0]) throw new Error("Person not found");
    return result[0];
  }

  async deletePerson(id: string): Promise<void> {
    await db.delete(persons).where(eq(persons.id, id));
  }

  // Compatibility operations
  async getCompatibility(profile1Id: string, profile2Id: string): Promise<CompatibilityAnalysis | undefined> {
    const result = await db
      .select()
      .from(compatibilityAnalyses)
      .where(
        or(
          and(eq(compatibilityAnalyses.profile1Id, profile1Id), eq(compatibilityAnalyses.profile2Id, profile2Id)),
          and(eq(compatibilityAnalyses.profile1Id, profile2Id), eq(compatibilityAnalyses.profile2Id, profile1Id))
        )
      );
    return result[0];
  }

  async createCompatibility(compatibility: InsertCompatibility): Promise<CompatibilityAnalysis> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(compatibilityAnalyses).values({
      ...compatibility,
      id,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getProfileCompatibilities(profileId: string): Promise<CompatibilityAnalysis[]> {
    return await db
      .select()
      .from(compatibilityAnalyses)
      .where(or(eq(compatibilityAnalyses.profile1Id, profileId), eq(compatibilityAnalyses.profile2Id, profileId)));
  }

  // Push subscription operations
  async getPushSubscription(endpoint: string): Promise<PushSubscription | undefined> {
    const result = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return result[0];
  }

  async getPushSubscriptionsByUser(userId: string): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  async getPushSubscriptionsBySession(sessionId: string): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.sessionId, sessionId));
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions);
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(pushSubscriptions).values({
      ...subscription,
      id,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async updatePushSubscription(id: string, updates: Partial<PushSubscription>): Promise<PushSubscription> {
    const result = await db
      .update(pushSubscriptions)
      .set({ ...updates, updatedAt: drizzleSql`now()` })
      .where(eq(pushSubscriptions.id, id))
      .returning();
    if (!result[0]) throw new Error("Push subscription not found");
    return result[0];
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }

  // Frequency log operations
  async createFrequencyLog(log: InsertFrequencyLog): Promise<FrequencyLog> {
    const id = randomUUID();
    const result = await db.insert(frequencyLogs).values({
      ...log,
      id,
      loggedAt: log.loggedAt || new Date(),
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async getFrequencyLogsByUser(userId: string): Promise<FrequencyLog[]> {
    return await db
      .select()
      .from(frequencyLogs)
      .where(eq(frequencyLogs.userId, userId))
      .orderBy(desc(frequencyLogs.loggedAt));
  }

  async getFrequencyLogsBySession(sessionId: string): Promise<FrequencyLog[]> {
    return await db
      .select()
      .from(frequencyLogs)
      .where(eq(frequencyLogs.sessionId, sessionId))
      .orderBy(desc(frequencyLogs.loggedAt));
  }

  async getFrequencyLogsInRange(
    userId: string | null,
    sessionId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<FrequencyLog[]> {
    const userCondition = userId ? eq(frequencyLogs.userId, userId) : eq(frequencyLogs.sessionId, sessionId!);
    return await db
      .select()
      .from(frequencyLogs)
      .where(and(userCondition, gte(frequencyLogs.loggedAt, startDate), lte(frequencyLogs.loggedAt, endDate)))
      .orderBy(desc(frequencyLogs.loggedAt));
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const { passwordResetTokens } = await import("@shared/schema");
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });
  }

  async getPasswordResetToken(token: string): Promise<{id: string, userId: string, expiresAt: Date, usedAt: Date | null} | undefined> {
    const { passwordResetTokens } = await import("@shared/schema");
    const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result[0];
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    const { passwordResetTokens } = await import("@shared/schema");
    await db
      .update(passwordResetTokens)
      .set({ usedAt: drizzleSql`now()` })
      .where(eq(passwordResetTokens.token, token));
  }

  async updateLocalUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    await db
      .update(localUsers)
      .set({ passwordHash: newPasswordHash, updatedAt: drizzleSql`now()` })
      .where(eq(localUsers.id, userId));
  }

  // Webhook event operations (for idempotency)
  async getWebhookEventByStripeId(stripeEventId: string): Promise<WebhookEvent | undefined> {
    const result = await db.select().from(webhookEvents).where(eq(webhookEvents.stripeEventId, stripeEventId));
    return result[0];
  }

  async createWebhookEvent(eventData: InsertWebhookEvent): Promise<WebhookEvent> {
    const result = await db
      .insert(webhookEvents)
      .values(eventData)
      .returning();
    return result[0];
  }
}

// Switch to DbStorage for production-ready persistence
export const storage = new DbStorage();
// export const storage = new MemStorage();

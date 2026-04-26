import { type User, type UpsertUser, type Profile, type InsertProfile, type Person, type InsertPerson, type Assessment, type InsertAssessment, type AccessCode, type AccessCodeRedemption, type InsertAccessCode, type DailyInsight, type InsertDailyInsight, type CompatibilityAnalysis, type InsertCompatibility, type LocalUser, type PushSubscription, type InsertPushSubscription, type FrequencyLog, type InsertFrequencyLog, type WebhookEvent, type InsertWebhookEvent } from "./shared/schema";
import { randomUUID } from "crypto";
import * as schema from "./shared/schema";
import { accessCodeRedemptions, localUsers, profiles, users } from "./shared/schema";
import { db } from "./db";
import { and, eq, sql as drizzleSql } from "drizzle-orm";
// NOTE: For Render bootstrap we use in-memory storage by default.
// Avoid importing DB modules and table schemas to prevent build-time resolution.
// Removed drizzle imports to avoid schema resolution in bundle

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
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
  
  // Account deletion (App Store compliance)
  deleteUserAccount(userId: string): Promise<void>;
  deleteProfileById(profileId: string): Promise<void>;
  
  // Journal operations
  createJournalEntry(entry: any): Promise<any>;
  getJournalEntries(params: { userId: string; profileId?: string; startDate?: Date; endDate?: Date; category?: string }): Promise<any[]>;
  
  // Shareable links operations
  createShareableLink(link: any): Promise<any>;
  getShareableLink(id: string): Promise<any | undefined>;
  getShareableLinkByToken(token: string): Promise<any | undefined>;
  updateShareableLink(id: string, updates: Partial<any>): Promise<any>;
  getShareableLinksByUser(userId: string): Promise<any[]>;
  
  // Transit notification operations
  createTransitNotification(notification: any): Promise<any>;
  getTransitNotification(notificationId: string): Promise<any | undefined>;
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
  private passwordResetTokens: Map<string, {id: string, userId: string, expiresAt: Date, usedAt: Date | null}>;
  private journalEntries: Map<string, any>;
  private shareableLinks: Map<string, any>;
  private transitNotifications: Map<string, any>;

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
    this.passwordResetTokens = new Map();
    this.journalEntries = new Map();
    this.shareableLinks = new Map();
    this.transitNotifications = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.appleId === appleId) {
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
      birthTime: insertProfile.birthTime || null,
      birthLocation: insertProfile.birthLocation || null,
      timezone: insertProfile.timezone || null,
      latitude: insertProfile.latitude || null,
      longitude: insertProfile.longitude || null,
      id, 
      createdAt: now,
      updatedAt: now,
      userId: insertProfile.userId || null,
      sessionId: insertProfile.sessionId || null,
      data: insertProfile.data || {},
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

  private accessCodeRedemptions = new Map<string, AccessCodeRedemption>();

  async getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<AccessCodeRedemption[]> {
    return Array.from(this.accessCodeRedemptions.values()).filter(r =>
      (params.userId && r.userId === params.userId) ||
      (params.sessionId && r.sessionId === params.sessionId)
    );
  }

  async createAccessCodeRedemptionWithIncrement(params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<AccessCodeRedemption> {
    const accessCode = Array.from(this.accessCodes.values()).find(c => c.id === params.accessCodeId);
    if (!accessCode) throw new Error("Access code not found");
    const id = randomUUID();
    const redemption: AccessCodeRedemption = {
      id,
      accessCodeId: params.accessCodeId,
      userId: params.userId || null,
      sessionId: params.sessionId || null,
      redeemedAt: new Date(),
    } as AccessCodeRedemption;
    this.accessCodeRedemptions.set(id, redemption);
    await this.incrementAccessCodeUse(accessCode.code);
    return redemption;
  }

  async getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<AccessCode[]> {
    const redemptions = await this.getAccessCodeRedemptions(params);
    const codes: AccessCode[] = [];
    for (const r of redemptions) {
      const code = Array.from(this.accessCodes.values()).find(c => c.id === r.accessCodeId);
      if (code && code.isActive) {
        if (!code.expiresAt || new Date() <= code.expiresAt) {
          codes.push(code);
        }
      }
    }
    return codes;
  }

  async migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void> {
    for (const [id, r] of this.accessCodeRedemptions) {
      if (r.sessionId === sessionId && !r.userId) {
        this.accessCodeRedemptions.set(id, { ...r, userId });
      }
    }
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

  // Password reset operations (MemStorage implementation)
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    // In-memory storage for password reset tokens
    this.passwordResetTokens.set(token, {
      id: token,
      userId,
      expiresAt,
      usedAt: null
    });
  }

  async getPasswordResetToken(token: string): Promise<{id: string, userId: string, expiresAt: Date, usedAt: Date | null} | undefined> {
    const resetToken = this.passwordResetTokens.get(token);
    if (!resetToken) return undefined;
    
    // Check if expired
    if (new Date() > resetToken.expiresAt) {
      this.passwordResetTokens.delete(token);
      return undefined;
    }
    
    return resetToken;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    const resetToken = this.passwordResetTokens.get(token);
    if (resetToken) {
      resetToken.usedAt = new Date();
      this.passwordResetTokens.set(token, resetToken);
    }
  }

  async updateLocalUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    const localUser = Array.from(this.localUsers.values()).find(u => u.id === userId);
    if (localUser) {
      localUser.passwordHash = newPasswordHash;
      localUser.updatedAt = new Date();
      this.localUsers.set(userId, localUser);
    }
  }

  async deleteProfileById(profileId: string): Promise<void> {
    this.profiles.delete(profileId);
  }

  // ── Account deletion (App Store compliance) ─────────────────────────────
  async deleteUserAccount(userId: string): Promise<void> {
    // Remove user record
    this.users.delete(userId);
    // Remove local credentials (LocalUser map is keyed by userId; v.id === userId)
    this.localUsers.delete(userId);
    for (const [k, v] of this.localUsers) if (v.id === userId) this.localUsers.delete(k);
    // Remove profiles owned by user
    for (const [k, v] of this.profiles) if (v.userId === userId) this.profiles.delete(k);
    // Remove persons (compatibility contacts)
    for (const [k, v] of this.persons) if (v.userId === userId) this.persons.delete(k);
    // Remove frequency logs
    for (const [k, v] of this.frequencyLogs) if (v.userId === userId) this.frequencyLogs.delete(k);
    // Remove push subscriptions
    for (const [k, v] of this.pushSubscriptions) if (v.userId === userId) this.pushSubscriptions.delete(k);
    // Remove journal entries
    for (const [k, v] of this.journalEntries) if (v.userId === userId) this.journalEntries.delete(k);
    // Remove shareable links
    for (const [k, v] of this.shareableLinks) if (v.userId === userId) this.shareableLinks.delete(k);
    // Remove password reset tokens
    for (const [k, v] of this.passwordResetTokens) if (v.userId === userId) this.passwordResetTokens.delete(k);
  }

  // Journal operations
  async createJournalEntry(entryData: any): Promise<any> {
    const id = randomUUID();
    const entry = {
      id,
      ...entryData,
      date: entryData.date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getJournalEntries(params: { userId: string; profileId?: string; startDate?: Date; endDate?: Date; category?: string }): Promise<any[]> {
    let entries = Array.from(this.journalEntries.values()).filter(e => e.userId === params.userId);
    
    if (params.profileId) {
      entries = entries.filter(e => e.profileId === params.profileId);
    }
    
    if (params.startDate) {
      entries = entries.filter(e => new Date(e.date) >= params.startDate!);
    }
    
    if (params.endDate) {
      entries = entries.filter(e => new Date(e.date) <= params.endDate!);
    }
    
    // Note: category filtering would require fetching prompt data
    // For now, we'll skip category filtering at storage level
    
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Shareable links operations
  async createShareableLink(linkData: any): Promise<any> {
    const link = {
      ...linkData,
      createdAt: new Date(),
      accessCount: 0,
      isActive: true
    };
    this.shareableLinks.set(link.id, link);
    return link;
  }

  async getShareableLink(id: string): Promise<any | undefined> {
    return this.shareableLinks.get(id);
  }

  async getShareableLinkByToken(token: string): Promise<any | undefined> {
    return Array.from(this.shareableLinks.values()).find(link => link.token === token);
  }

  async updateShareableLink(id: string, updates: Partial<any>): Promise<any> {
    const link = this.shareableLinks.get(id);
    if (!link) {
      throw new Error('Shareable link not found');
    }
    const updated = { ...link, ...updates, updatedAt: new Date() };
    this.shareableLinks.set(id, updated);
    return updated;
  }

  async getShareableLinksByUser(userId: string): Promise<any[]> {
    return Array.from(this.shareableLinks.values())
      .filter(link => link.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Transit notification operations
  async createTransitNotification(notificationData: any): Promise<any> {
    const notification = {
      ...notificationData,
      createdAt: new Date()
    };
    this.transitNotifications.set(notification.notificationId, notification);
    return notification;
  }

  async getTransitNotification(notificationId: string): Promise<any | undefined> {
    return this.transitNotifications.get(notificationId);
  }
}

class DbStorage implements IStorage {
  // User operations
  // STUB - DbStorage is disabled for bootstrap; all methods are no-ops
  async getUser(id: string): Promise<User | undefined> {
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

  // Journal operations
  async createJournalEntry(entryData: any): Promise<any> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }
  async getJournalEntries(params: any): Promise<any[]> {
    return [];
  }

  // Shareable links operations
  async createShareableLink(linkData: any): Promise<any> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }
  async getShareableLink(id: string): Promise<any | undefined> {
    return undefined;
  }
  async getShareableLinkByToken(token: string): Promise<any | undefined> {
    return undefined;
  }
  async updateShareableLink(id: string, updates: Partial<any>): Promise<any> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }
  async getShareableLinksByUser(userId: string): Promise<any[]> {
    return [];
  }

  // Transit notification operations
  async createTransitNotification(notificationData: any): Promise<any> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }
  async getTransitNotification(notificationId: string): Promise<any | undefined> {
    return undefined;
  }
}


const profilesTable = schema.profiles;
const accessCodesTable = schema.accessCodes;
const redemptionsTable = schema.accessCodeRedemptions;
const usersTable = schema.users;
const localUsersTable = schema.localUsers;

const STRUCTURED_PROFILE_FIELDS = new Set([
  "id", "userId", "sessionId", "name",
  "birthDate", "birthTime", "birthLocation",
  "timezone", "latitude", "longitude",
  "createdAt", "updatedAt",
]);

function profileRowToObject(row: any): any {
  if (!row) return undefined;
  const { data, ...rest } = row;
  return { ...(data || {}), ...rest };
}

function splitProfileForStorage(input: any): { structured: any; data: Record<string, any> } {
  const structured: any = {};
  const data: Record<string, any> = {};
  for (const [k, v] of Object.entries(input || {})) {
    if (STRUCTURED_PROFILE_FIELDS.has(k)) {
      structured[k] = v;
    } else {
      data[k] = v;
    }
  }
  return { structured, data };
}

class HybridStorage extends MemStorage {
  // ── User operations ────────────────────────────────────────────────────
  async getUser(id: string): Promise<User | undefined> {
    try {
      const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      return rows[0];
    } catch (err) {
      console.warn("[HybridStorage] getUser DB failure:", err);
      return super.getUser(id);
    }
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    try {
      const rows = await db.select().from(usersTable).where(eq(usersTable.appleId, appleId)).limit(1);
      return rows[0];
    } catch (err) {
      console.warn("[HybridStorage] getUserByAppleId DB failure:", err);
      return super.getUserByAppleId(appleId);
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const existing = await this.getUser(userData.id);
      if (existing) {
        const [row] = await db.update(usersTable)
          .set({ ...userData, updatedAt: new Date() })
          .where(eq(usersTable.id, userData.id))
          .returning();
        return row;
      } else {
        const [row] = await db.insert(usersTable).values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();
        return row;
      }
    } catch (err) {
      console.error("[HybridStorage] upsertUser DB failure:", err);
      return super.upsertUser(userData);
    }
  }

  // ── Profile operations ─────────────────────────────────────────────────
  async getProfile(id: string): Promise<Profile | undefined> {
    try {
      const rows = await db.select().from(profilesTable).where(eq(profilesTable.id, id)).limit(1);
      return profileRowToObject(rows[0]);
    } catch (err) {
      console.warn("[HybridStorage] getProfile DB failure, falling back to mem:", err);
      return super.getProfile(id);
    }
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    try {
      const rows = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
      return profileRowToObject(rows[0]);
    } catch (err) {
      console.warn("[HybridStorage] getProfileByUserId DB failure:", err);
      return super.getProfileByUserId(userId);
    }
  }

  async getProfileBySessionId(sessionId: string): Promise<Profile | undefined> {
    try {
      const rows = await db.select().from(profilesTable).where(eq(profilesTable.sessionId, sessionId)).limit(1);
      return profileRowToObject(rows[0]);
    } catch (err) {
      console.warn("[HybridStorage] getProfileBySessionId DB failure:", err);
      return super.getProfileBySessionId(sessionId);
    }
  }

  async getAllProfiles(): Promise<Profile[]> {
    try {
      const rows = await db.select().from(profilesTable);
      return rows.map(profileRowToObject);
    } catch (err) {
      console.warn("[HybridStorage] getAllProfiles DB failure:", err);
      return super.getAllProfiles();
    }
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    try {
      const { structured, data } = splitProfileForStorage(insertProfile);
      const insertRow: any = {
        userId: structured.userId || null,
        sessionId: structured.sessionId || null,
        name: structured.name,
        birthDate: structured.birthDate,
        birthTime: structured.birthTime || null,
        birthLocation: structured.birthLocation || null,
        timezone: structured.timezone || null,
        latitude: structured.latitude != null ? String(structured.latitude) : null,
        longitude: structured.longitude != null ? String(structured.longitude) : null,
        data,
      };
      const [row] = await db.insert(profilesTable).values(insertRow).returning();
      return profileRowToObject(row);
    } catch (err) {
      console.error("[HybridStorage] createProfile DB failure, falling back to mem:", err);
      return super.createProfile(insertProfile);
    }
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const existingRows = await db.select().from(profilesTable).where(eq(profilesTable.id, id)).limit(1);
      if (existingRows.length === 0) throw new Error("Profile not found");
      const existing = existingRows[0];
      const { structured, data: newData } = splitProfileForStorage(updates);
      const mergedData = { ...((existing.data as any) || {}), ...newData };
      const updateRow: any = { data: mergedData, updatedAt: new Date() };
      for (const k of ["userId", "sessionId", "name", "birthDate", "birthTime", "birthLocation", "timezone"]) {
        if (k in structured) updateRow[k] = (structured as any)[k];
      }
      if ("latitude" in structured) updateRow.latitude = structured.latitude != null ? String(structured.latitude) : null;
      if ("longitude" in structured) updateRow.longitude = structured.longitude != null ? String(structured.longitude) : null;
      const [row] = await db.update(profilesTable).set(updateRow).where(eq(profilesTable.id, id)).returning();
      return profileRowToObject(row);
    } catch (err) {
      console.error("[HybridStorage] updateProfile DB failure:", err);
      return super.updateProfile(id, updates);
    }
  }

  async migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean> {
    try {
      const result = await db.update(profilesTable)
        .set({ userId, updatedAt: new Date() })
        .where(and(eq(profilesTable.sessionId, sessionId), drizzleSql`${profilesTable.userId} IS NULL`))
        .returning();
      return result.length > 0;
    } catch (err) {
      console.warn("[HybridStorage] migrateSoulProfile DB failure:", err);
      return super.migrateSoulProfileFromSessionToUser(sessionId, userId);
    }
  }

  // ── Access code operations ────────────────────────────────────────────
  async getAccessCode(code: string): Promise<AccessCode | undefined> {
    try {
      const rows = await db.select().from(accessCodesTable)
        .where(drizzleSql`LOWER(${accessCodesTable.code}) = LOWER(${code})`)
        .limit(1);
      return rows[0];
    } catch (err) {
      console.warn("[HybridStorage] getAccessCode DB failure:", err);
      return super.getAccessCode(code);
    }
  }

  async createAccessCode(insertAccessCode: InsertAccessCode): Promise<AccessCode> {
    try {
      const maxUses = insertAccessCode.maxUses ?? 1;
      if (maxUses < 1) throw new Error("maxUses must be at least 1");
      // Idempotent seeding: if code already exists, return it
      const existing = await this.getAccessCode(insertAccessCode.code);
      if (existing) return existing;
      const [row] = await db.insert(accessCodesTable).values({
        code: insertAccessCode.code,
        maxUses,
        usesCount: 0,
        isActive: insertAccessCode.isActive ?? true,
        expiresAt: insertAccessCode.expiresAt || null,
      }).returning();
      return row;
    } catch (err) {
      console.error("[HybridStorage] createAccessCode DB failure:", err);
      return super.createAccessCode(insertAccessCode);
    }
  }

  async updateAccessCode(id: string, updates: Partial<AccessCode>): Promise<AccessCode> {
    try {
      const [row] = await db.update(accessCodesTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(accessCodesTable.id, id))
        .returning();
      if (!row) throw new Error("Access code not found");
      return row;
    } catch (err) {
      console.error("[HybridStorage] updateAccessCode DB failure:", err);
      return super.updateAccessCode(id, updates);
    }
  }

  async getAllAccessCodes(): Promise<AccessCode[]> {
    try {
      return await db.select().from(accessCodesTable);
    } catch (err) {
      console.warn("[HybridStorage] getAllAccessCodes DB failure:", err);
      return super.getAllAccessCodes();
    }
  }

  async incrementAccessCodeUse(code: string): Promise<AccessCode> {
    try {
      const accessCode = await this.getAccessCode(code);
      if (!accessCode) throw new Error("Access code not found");
      if (!accessCode.isActive) throw new Error("Access code is inactive");
      if (accessCode.expiresAt && new Date() > new Date(accessCode.expiresAt)) {
        throw new Error("Access code has expired");
      }
      // Atomic conditional update: only increment if uses_count < max_uses AND active AND not expired
      const rows = await db.execute(drizzleSql`
        UPDATE access_codes
        SET uses_count = uses_count + 1, updated_at = NOW()
        WHERE id = ${accessCode.id}
          AND is_active = true
          AND uses_count < max_uses
          AND (expires_at IS NULL OR expires_at > NOW())
        RETURNING *
      `);
      const updated = (rows as any).rows?.[0] ?? (rows as any)[0];
      if (!updated) throw new Error("Access code has reached maximum uses");
      return {
        id: updated.id,
        code: updated.code,
        maxUses: updated.max_uses,
        usesCount: updated.uses_count,
        expiresAt: updated.expires_at,
        isActive: updated.is_active,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      } as AccessCode;
    } catch (err) {
      if (err instanceof Error && /(not found|inactive|expired|maximum uses)/.test(err.message)) {
        throw err;
      }
      console.error("[HybridStorage] incrementAccessCodeUse DB failure:", err);
      return super.incrementAccessCodeUse(code);
    }
  }

  async getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<AccessCodeRedemption[]> {
    try {
      if (!params.userId && !params.sessionId) return [];
      const conditions = [];
      if (params.userId) conditions.push(eq(redemptionsTable.userId, params.userId));
      if (params.sessionId) conditions.push(eq(redemptionsTable.sessionId, params.sessionId));
      const rows = await db.select().from(redemptionsTable)
        .where(conditions.length > 1 ? drizzleSql`${conditions[0]} OR ${conditions[1]}` : conditions[0]);
      return rows;
    } catch (err) {
      console.warn("[HybridStorage] getAccessCodeRedemptions DB failure:", err);
      return super.getAccessCodeRedemptions(params);
    }
  }

  async createAccessCodeRedemptionWithIncrement(params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<AccessCodeRedemption> {
    try {
      const codeRows = await db.select().from(accessCodesTable).where(eq(accessCodesTable.id, params.accessCodeId)).limit(1);
      if (codeRows.length === 0) throw new Error("Access code not found");
      const code = codeRows[0];
      // Atomic increment first (fails closed if exhausted/inactive/expired)
      await this.incrementAccessCodeUse(code.code);
      // Only insert redemption record after capacity is reserved
      const [redemption] = await db.insert(redemptionsTable).values({
        accessCodeId: params.accessCodeId,
        userId: params.userId || null,
        sessionId: params.sessionId || null,
      }).returning();
      return redemption;
    } catch (err) {
      if (err instanceof Error && /(not found|inactive|expired|maximum uses)/.test(err.message)) {
        throw err;
      }
      console.error("[HybridStorage] createAccessCodeRedemption DB failure:", err);
      return super.createAccessCodeRedemptionWithIncrement(params);
    }
  }

  async getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<AccessCode[]> {
    try {
      const redemptions = await this.getAccessCodeRedemptions(params);
      if (redemptions.length === 0) return [];
      const codeIds = Array.from(new Set(redemptions.map((r: any) => r.accessCodeId)));
      const codes: AccessCode[] = [];
      for (const codeId of codeIds) {
        const rows = await db.select().from(accessCodesTable).where(eq(accessCodesTable.id, codeId)).limit(1);
        const code = rows[0];
        if (code && code.isActive && (!code.expiresAt || new Date() <= new Date(code.expiresAt))) {
          codes.push(code);
        }
      }
      return codes;
    } catch (err) {
      console.warn("[HybridStorage] getActiveAccessCodesForUser DB failure:", err);
      return super.getActiveAccessCodesForUser(params);
    }
  }

  // ── Account deletion (App Store compliance) ─────────────────────────────
  async deleteProfileById(profileId: string): Promise<void> {
    try {
      await db.delete(profilesTable).where(eq(profilesTable.id, profileId));
    } catch (err) {
      console.error("[HybridStorage] deleteProfileById DB failure:", err);
    }
    await super.deleteProfileById(profileId);
  }

  async deleteUserAccount(userId: string): Promise<void> {
    // 1. Remove in-memory associated state if using hybrid mode
    await super.deleteUserAccount(userId);

    try {
      // 2. Cascade delete from persistent storage
      // Note: order is important if foreign keys are enforced at DB level
      await db.delete(accessCodeRedemptions).where(eq(accessCodeRedemptions.userId, userId));
      await db.delete(profiles).where(eq(profiles.userId, userId));
      await db.delete(localUsers).where(eq(localUsers.id, userId));
      await db.delete(users).where(eq(users.id, userId));
      
      console.log(`[Storage] Permanently purged all records for User: ${userId}`);
    } catch (err) {
      console.error("[HybridStorage] deleteUserAccount DB failure:", err);
      throw err;
    }
  }

  async migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void> {
    try {
      await db.update(redemptionsTable)
        .set({ userId })
        .where(and(eq(redemptionsTable.sessionId, sessionId), drizzleSql`${redemptionsTable.userId} IS NULL`));
    } catch (err) {
      console.warn("[HybridStorage] migrateAccessCodeRedemptions DB failure:", err);
      return super.migrateAccessCodeRedemptions(sessionId, userId);
    }
  }
}

// Use HybridStorage when DATABASE_URL is set (and not in DEMO_MODE)
// so profiles + access codes persist across restarts.
// Falls back to MemStorage for everything else.
export const storage: IStorage = (process.env.DATABASE_URL && process.env.DEMO_MODE !== "true")
  ? new HybridStorage()
  : new MemStorage();
console.log(`[Storage] Using ${storage instanceof HybridStorage ? "HybridStorage (DB-backed profiles + access codes)" : "MemStorage (in-memory only)"}`);

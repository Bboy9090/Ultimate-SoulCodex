import * as schema from "./schema";
import { randomUUID } from "crypto";
// NOTE: For Render bootstrap we use in-memory storage by default.
// Avoid importing DB modules and table schemas to prevent build-time resolution.
// Removed drizzle imports to avoid schema resolution in bundle

export interface IStorage {
  // schema.User operations (required for Replit Auth)
  getUser(id: string): Promise<schema.User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<schema.User | undefined>;
  upsertUser(user: schema.UpsertUser): Promise<schema.User>;
  
  // Local authentication operations
  getLocalUserByEmail(email: string): Promise<schema.LocalUser | undefined>;
  createLocalUser(userId: string, email: string, passwordHash: string): Promise<schema.LocalUser>;
  updateLocalUserLastLogin(id: string): Promise<void>;
  
  // schema.Profile operations
  getProfile(id: string): Promise<schema.Profile | undefined>;
  getProfileByUserId(userId: string): Promise<schema.Profile | undefined>;
  getProfileBySessionId(sessionId: string): Promise<schema.Profile | undefined>;
  getAllProfiles(): Promise<schema.Profile[]>;
  createProfile(profile: schema.InsertProfile): Promise<schema.Profile>;
  updateProfile(id: string, updates: Partial<schema.Profile>): Promise<schema.Profile>;
  
  getAssessment(profileId: string, type: string): Promise<schema.Assessment | undefined>;
  createAssessment(assessment: schema.InsertAssessment): Promise<schema.Assessment>;
  
  getAccessCode(code: string): Promise<schema.AccessCode | undefined>;
  createAccessCode(accessCode: schema.InsertAccessCode): Promise<schema.AccessCode>;
  updateAccessCode(id: string, updates: Partial<schema.AccessCode>): Promise<schema.AccessCode>;
  getAllAccessCodes(): Promise<schema.AccessCode[]>;
  incrementAccessCodeUse(code: string): Promise<schema.AccessCode>;
  getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<schema.AccessCodeRedemption[]>;
  createAccessCodeRedemptionWithIncrement(params: { accessCodeId: string; userId?: string; sessionId?: string }): Promise<schema.AccessCodeRedemption>;
  getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<schema.AccessCode[]>;
  migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void>;
  
  getDailyInsight(profileId: string, date: string): Promise<schema.DailyInsight | undefined>;
  createDailyInsight(insight: schema.InsertDailyInsight): Promise<schema.DailyInsight>;
  getRecentTemplateIds(profileId: string, days: number): Promise<string[]>;
  
  // schema.Person operations (for compatibility)
  getPerson(id: string): Promise<schema.Person | undefined>;
  getPersonsByUserId(userId: string): Promise<schema.Person[]>;
  getPersonsBySessionId(sessionId: string): Promise<schema.Person[]>;
  migratePersonsFromSessionToUser(sessionId: string, userId: string): Promise<number>;
  migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean>;
  createPerson(person: schema.InsertPerson): Promise<schema.Person>;
  updatePerson(id: string, updates: Partial<schema.Person>): Promise<schema.Person>;
  deletePerson(id: string): Promise<void>;
  
  getCompatibility(profile1Id: string, profile2Id: string): Promise<schema.CompatibilityAnalysis | undefined>;
  createCompatibility(compatibility: schema.InsertCompatibility): Promise<schema.CompatibilityAnalysis>;
  getProfileCompatibilities(profileId: string): Promise<schema.CompatibilityAnalysis[]>;
  
  // Push subscription operations
  getPushSubscription(endpoint: string): Promise<schema.PushSubscription | undefined>;
  getPushSubscriptionsByUser(userId: string): Promise<schema.PushSubscription[]>;
  getPushSubscriptionsBySession(sessionId: string): Promise<schema.PushSubscription[]>;
  getAllPushSubscriptions(): Promise<schema.PushSubscription[]>;
  createPushSubscription(subscription: schema.InsertPushSubscription): Promise<schema.PushSubscription>;
  updatePushSubscription(id: string, updates: Partial<schema.PushSubscription>): Promise<schema.PushSubscription>;
  deletePushSubscription(endpoint: string): Promise<void>;
  
  // Frequency log operations (Life Current Tracker)
  createFrequencyLog(log: schema.InsertFrequencyLog): Promise<schema.FrequencyLog>;
  getFrequencyLogsByUser(userId: string): Promise<schema.FrequencyLog[]>;
  getFrequencyLogsBySession(sessionId: string): Promise<schema.FrequencyLog[]>;
  getFrequencyLogsInRange(userId: string | null, sessionId: string | null, startDate: Date, endDate: Date): Promise<schema.FrequencyLog[]>;
  
  // Password reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{id: string, userId: string, expiresAt: Date, usedAt: Date | null} | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
  updateLocalUserPassword(userId: string, newPasswordHash: string): Promise<void>;
  
  // Webhook event operations (for idempotency)
  getWebhookEventByStripeId(stripeEventId: string): Promise<schema.WebhookEvent | undefined>;
  createWebhookEvent(event: schema.InsertWebhookEvent): Promise<schema.WebhookEvent>;
  
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
  private users: Map<string, schema.User>;
  private localUsers: Map<string, schema.LocalUser>;
  private profiles: Map<string, schema.Profile>;
  private persons: Map<string, schema.Person>;
  private assessments: Map<string, schema.Assessment>;
  private accessCodes: Map<string, schema.AccessCode>;
  private dailyInsights: Map<string, schema.DailyInsight>;
  private compatibilities: Map<string, schema.CompatibilityAnalysis>;
  private pushSubscriptions: Map<string, schema.PushSubscription>;
  private frequencyLogs: Map<string, schema.FrequencyLog>;
  private webhookEvents: Map<string, schema.WebhookEvent>;
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
    this.webhookEvents = new Map();
    this.passwordResetTokens = new Map();
    this.journalEntries = new Map();
    this.shareableLinks = new Map();
    this.transitNotifications = new Map();
  }

  async getUser(id: string): Promise<schema.User | undefined> {
    return this.users.get(id);
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<schema.User | undefined> {
    for (const user of this.users.values()) {
      if (user.stripeCustomerId === stripeCustomerId) {
        return user;
      }
    }
    return undefined;
  }

  async upsertUser(userData: schema.UpsertUser): Promise<schema.User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser: schema.User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      const newUser: schema.User = {
        id: userData.id!,
        username: userData.username || `user_${Date.now()}`,
        password: userData.password || '',
        isPremium: userData.isPremium ?? false,
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

  async getLocalUserByEmail(email: string): Promise<schema.LocalUser | undefined> {
    return Array.from(this.localUsers.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createLocalUser(userId: string, email: string, passwordHash: string): Promise<schema.LocalUser> {
    const now = new Date();
    const localUser: schema.LocalUser = {
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
      const updated: schema.LocalUser = {
        ...localUser,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      };
      this.localUsers.set(id, updated);
    }
  }

  async getProfile(id: string): Promise<schema.Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: string): Promise<schema.Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async getProfileBySessionId(sessionId: string): Promise<schema.Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.sessionId === sessionId,
    );
  }

  async getAllProfiles(): Promise<schema.Profile[]> {
    return Array.from(this.profiles.values());
  }

  async createProfile(insertProfile: schema.InsertProfile): Promise<schema.Profile> {
    const id = randomUUID();
    const now = new Date();
    const profile: schema.Profile = { 
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

  async updateProfile(id: string, updates: Partial<schema.Profile>): Promise<schema.Profile> {
    const existing = this.profiles.get(id);
    if (!existing) {
      throw new Error("schema.Profile not found");
    }
    const updated: schema.Profile = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.profiles.set(id, updated);
    return updated;
  }

  async getAssessment(profileId: string, type: string): Promise<schema.Assessment | undefined> {
    return Array.from(this.assessments.values()).find(
      (assessment) => assessment.profileId === profileId && assessment.assessmentType === type,
    );
  }

  async createAssessment(insertAssessment: schema.InsertAssessment): Promise<schema.Assessment> {
    const id = randomUUID();
    const assessment: schema.Assessment = { 
      ...insertAssessment, 
      id, 
      createdAt: new Date(),
      calculatedType: insertAssessment.calculatedType || null
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAccessCode(code: string): Promise<schema.AccessCode | undefined> {
    // Case-insensitive lookup
    const normalizedCode = code.toLowerCase();
    return Array.from(this.accessCodes.values()).find(
      (accessCode) => accessCode.code.toLowerCase() === normalizedCode,
    );
  }

  async createAccessCode(insertAccessCode: schema.InsertAccessCode): Promise<schema.AccessCode> {
    const maxUses = insertAccessCode.maxUses || 1;
    if (maxUses < 1) {
      throw new Error("maxUses must be at least 1");
    }
    
    if (insertAccessCode.expiresAt && insertAccessCode.expiresAt < new Date()) {
      throw new Error("expiresAt must be in the future");
    }
    
    const id = randomUUID();
    const now = new Date();
    const accessCode: schema.AccessCode = { 
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

  async updateAccessCode(id: string, updates: Partial<schema.AccessCode>): Promise<schema.AccessCode> {
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
    
    const updated: schema.AccessCode = { 
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

  async getAllAccessCodes(): Promise<schema.AccessCode[]> {
    return Array.from(this.accessCodes.values());
  }

  async incrementAccessCodeUse(code: string): Promise<schema.AccessCode> {
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
    
    const updated: schema.AccessCode = {
      ...accessCode,
      usesCount: accessCode.usesCount + 1,
      updatedAt: new Date()
    };
    this.accessCodes.set(accessCode.id, updated);
    return updated;
  }

  async getAccessCodeRedemptions(_params: { userId?: string; sessionId?: string }): Promise<schema.AccessCodeRedemption[]> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }

  async createAccessCodeRedemptionWithIncrement(_params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<schema.AccessCodeRedemption> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }

  async getActiveAccessCodesForUser(_params: { userId?: string; sessionId?: string }): Promise<schema.AccessCode[]> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }

  async migrateAccessCodeRedemptions(_sessionId: string, _userId: string): Promise<void> {
    throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
  }
  
  async getDailyInsight(profileId: string, date: string): Promise<schema.DailyInsight | undefined> {
    return Array.from(this.dailyInsights.values()).find(
      (insight) => insight.profileId === profileId && insight.date === date,
    );
  }
  
  async createDailyInsight(insertInsight: schema.InsertDailyInsight): Promise<schema.DailyInsight> {
    const id = randomUUID();
    const insight: schema.DailyInsight = {
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
  
  async getCompatibility(profile1Id: string, profile2Id: string): Promise<schema.CompatibilityAnalysis | undefined> {
    return Array.from(this.compatibilities.values()).find(
      (comp) => 
        (comp.profile1Id === profile1Id && comp.profile2Id === profile2Id) ||
        (comp.profile1Id === profile2Id && comp.profile2Id === profile1Id)
    );
  }
  
  async createCompatibility(insertCompatibility: schema.InsertCompatibility): Promise<schema.CompatibilityAnalysis> {
    const id = randomUUID();
    const now = new Date();
    const compatibility: schema.CompatibilityAnalysis = {
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
  
  async getProfileCompatibilities(profileId: string): Promise<schema.CompatibilityAnalysis[]> {
    return Array.from(this.compatibilities.values()).filter(
      (comp) => comp.profile1Id === profileId || comp.profile2Id === profileId
    );
  }
  
  async getPerson(id: string): Promise<schema.Person | undefined> {
    return this.persons.get(id);
  }
  
  async getPersonsByUserId(userId: string): Promise<schema.Person[]> {
    return Array.from(this.persons.values()).filter(
      (person) => person.userId === userId
    );
  }
  
  async getPersonsBySessionId(sessionId: string): Promise<schema.Person[]> {
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
      console.log(`[schema.Profile Migration] No profile found for session ${sessionId}`);
      return false;
    }
    
    // Check if user already has a profile
    const existingUserProfile = await this.getProfileByUserId(userId);
    if (existingUserProfile) {
      console.log(`[schema.Profile Migration] schema.User ${userId} already has a profile, skipping migration`);
      return false;
    }
    
    // Migrate the profile
    await this.updateProfile(sessionProfile.id, {
      userId,
      sessionId: null,
    });
    
    console.log(`[schema.Profile Migration] Migrated profile ${sessionProfile.id} from session ${sessionId} to user ${userId}`);
    return true;
  }
  
  async createPerson(insertPerson: schema.InsertPerson): Promise<schema.Person> {
    const id = randomUUID();
    const now = new Date();
    const person: schema.Person = {
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
  
  async updatePerson(id: string, updates: Partial<schema.Person>): Promise<schema.Person> {
    const existing = this.persons.get(id);
    if (!existing) {
      throw new Error("schema.Person not found");
    }
    const updated: schema.Person = {
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
  
  async getPushSubscription(endpoint: string): Promise<schema.PushSubscription | undefined> {
    return Array.from(this.pushSubscriptions.values()).find(
      (sub) => sub.endpoint === endpoint
    );
  }
  
  async getPushSubscriptionsByUser(userId: string): Promise<schema.PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values()).filter(
      (sub) => sub.userId === userId && sub.isActive
    );
  }
  
  async getPushSubscriptionsBySession(sessionId: string): Promise<schema.PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values()).filter(
      (sub) => sub.sessionId === sessionId && sub.isActive
    );
  }

  async getAllPushSubscriptions(): Promise<schema.PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values());
  }
  
  async createPushSubscription(insertSubscription: schema.InsertPushSubscription): Promise<schema.PushSubscription> {
    const id = randomUUID();
    const now = new Date();
    const subscription: schema.PushSubscription = {
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
  
  async updatePushSubscription(id: string, updates: Partial<schema.PushSubscription>): Promise<schema.PushSubscription> {
    const existing = this.pushSubscriptions.get(id);
    if (!existing) {
      throw new Error("Push subscription not found");
    }
    const updated: schema.PushSubscription = {
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

  async createFrequencyLog(insertLog: schema.InsertFrequencyLog): Promise<schema.FrequencyLog> {
    const id = randomUUID();
    const now = new Date();
    const log: schema.FrequencyLog = {
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

  async getFrequencyLogsByUser(userId: string): Promise<schema.FrequencyLog[]> {
    return Array.from(this.frequencyLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  async getFrequencyLogsBySession(sessionId: string): Promise<schema.FrequencyLog[]> {
    return Array.from(this.frequencyLogs.values())
      .filter(log => log.sessionId === sessionId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  async getFrequencyLogsInRange(
    userId: string | null,
    sessionId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<schema.FrequencyLog[]> {
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

  // Webhook event operations (for idempotency)
  async getWebhookEventByStripeId(stripeEventId: string): Promise<schema.WebhookEvent | undefined> {
    return Array.from(this.webhookEvents.values()).find(
      (event) => event.stripeEventId === stripeEventId
    );
  }

  async createWebhookEvent(eventData: schema.InsertWebhookEvent): Promise<schema.WebhookEvent> {
    const id = randomUUID();
    const event: schema.WebhookEvent = {
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
  // schema.User operations
  // STUB - DbStorage is disabled for bootstrap; all methods are no-ops
  async getUser(id: string): Promise<schema.User | undefined> {
    return undefined;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<schema.User | undefined> {
    return undefined;
  }

  async upsertUser(userData: schema.UpsertUser): Promise<schema.User> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  // Local authentication operations
  async getLocalUserByEmail(email: string): Promise<schema.LocalUser | undefined> {
    return undefined;
  }

  async createLocalUser(userId: string, email: string, passwordHash: string): Promise<schema.LocalUser> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updateLocalUserLastLogin(id: string): Promise<void> {
    // Stub
  }

  // schema.Profile operations
  async getProfile(id: string): Promise<schema.Profile | undefined> {
    return undefined;
  }

  async getProfileByUserId(userId: string): Promise<schema.Profile | undefined> {
    return undefined;
  }

  async getProfileBySessionId(sessionId: string): Promise<schema.Profile | undefined> {
    return undefined;
  }

  async getAllProfiles(): Promise<schema.Profile[]> {
    return [];
  }

  async createProfile(profile: schema.InsertProfile): Promise<schema.Profile> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updateProfile(id: string, updates: Partial<schema.Profile>): Promise<schema.Profile> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  // schema.Assessment operations
  async getAssessment(profileId: string, type: string): Promise<schema.Assessment | undefined> {
    return undefined;
  }

  async createAssessment(assessment: schema.InsertAssessment): Promise<schema.Assessment> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  // Access code operations
  async getAccessCode(code: string): Promise<schema.AccessCode | undefined> {
    return undefined;
  }

  async createAccessCode(insertAccessCode: schema.InsertAccessCode): Promise<schema.AccessCode> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updateAccessCode(id: string, updates: Partial<schema.AccessCode>): Promise<schema.AccessCode> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getAllAccessCodes(): Promise<schema.AccessCode[]> {
    return [];
  }

  async incrementAccessCodeUse(code: string): Promise<schema.AccessCode> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getAccessCodeRedemptions(params: { userId?: string; sessionId?: string }): Promise<schema.AccessCodeRedemption[]> {
    return [];
  }

  async createAccessCodeRedemptionWithIncrement(params: {
    accessCodeId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<schema.AccessCodeRedemption> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getActiveAccessCodesForUser(params: { userId?: string; sessionId?: string }): Promise<schema.AccessCode[]> {
    return [];
  }

  async migrateAccessCodeRedemptions(sessionId: string, userId: string): Promise<void> {
    // Stub
  }

  // Daily insight operations
  async getDailyInsight(profileId: string, date: string): Promise<schema.DailyInsight | undefined> {
    return undefined;
  }

  async createDailyInsight(insight: schema.InsertDailyInsight): Promise<schema.DailyInsight> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getRecentTemplateIds(profileId: string, days: number): Promise<string[]> {
    return [];
  }

  // schema.Person operations
  async getPerson(id: string): Promise<schema.Person | undefined> {
    return undefined;
  }

  async getPersonsByUserId(userId: string): Promise<schema.Person[]> {
    return [];
  }

  async getPersonsBySessionId(sessionId: string): Promise<schema.Person[]> {
    return [];
  }

  async migratePersonsFromSessionToUser(sessionId: string, userId: string): Promise<number> {
    return 0;
  }

  async migrateSoulProfileFromSessionToUser(sessionId: string, userId: string): Promise<boolean> {
    return false;
  }

  async createPerson(person: schema.InsertPerson): Promise<schema.Person> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updatePerson(id: string, updates: Partial<schema.Person>): Promise<schema.Person> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async deletePerson(id: string): Promise<void> {
    // Stub
  }

  // Compatibility operations
  async getCompatibility(profile1Id: string, profile2Id: string): Promise<schema.CompatibilityAnalysis | undefined> {
    return undefined;
  }

  async createCompatibility(compatibility: schema.InsertCompatibility): Promise<schema.CompatibilityAnalysis> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getProfileCompatibilities(profileId: string): Promise<schema.CompatibilityAnalysis[]> {
    return [];
  }

  // Push subscription operations
  async getPushSubscription(endpoint: string): Promise<schema.PushSubscription | undefined> {
    return undefined;
  }

  async getPushSubscriptionsByUser(userId: string): Promise<schema.PushSubscription[]> {
    return [];
  }

  async getPushSubscriptionsBySession(sessionId: string): Promise<schema.PushSubscription[]> {
    return [];
  }

  async getAllPushSubscriptions(): Promise<schema.PushSubscription[]> {
    return [];
  }

  async createPushSubscription(subscription: schema.InsertPushSubscription): Promise<schema.PushSubscription> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async updatePushSubscription(id: string, updates: Partial<schema.PushSubscription>): Promise<schema.PushSubscription> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    // Stub
  }

  // Frequency log operations
  async createFrequencyLog(log: schema.InsertFrequencyLog): Promise<schema.FrequencyLog> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
  }

  async getFrequencyLogsByUser(userId: string): Promise<schema.FrequencyLog[]> {
    return [];
  }

  async getFrequencyLogsBySession(sessionId: string): Promise<schema.FrequencyLog[]> {
    return [];
  }

  async getFrequencyLogsInRange(
    userId: string | null,
    sessionId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<schema.FrequencyLog[]> {
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
  async getWebhookEventByStripeId(stripeEventId: string): Promise<schema.WebhookEvent | undefined> {
    return undefined;
  }
  async createWebhookEvent(eventData: schema.InsertWebhookEvent): Promise<schema.WebhookEvent> {
    throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
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


// Switch to DbStorage for production-ready persistence
// Switch to MemStorage for initial deployment; swap to DbStorage when schema is in place
// export const storage = new DbStorage();
export const storage = new MemStorage();

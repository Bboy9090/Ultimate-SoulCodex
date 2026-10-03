import { randomUUID } from "crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  users,
  profiles,
  assessmentResponses,
  accessCodeRedemptions,
  localUsers,
  publicProfileShares,
  billingSubjects,
  billingTransactionEvents,
  entitlementGrants,
  billingVerificationReceipts,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Assessment,
  type InsertAssessment,
  type PublicProfileShare,
  type BillingSubject,
  type BillingTransactionEvent,
  type EntitlementGrant,
  type BillingVerificationReceipt,
  type InsertBillingTransactionEvent,
  type InsertEntitlementGrant,
  type InsertBillingVerificationReceipt,
} from "@shared/schema";

function appleUsername(subject: string) {
  return `apple:${subject}`;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOrCreateAppleUser(subject: string, email?: string | null, firstName?: string | null, lastName?: string | null): Promise<User>;
  migrateSessionOwnershipToUser(sessionId: string, userId: string): Promise<void>;
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile>;
  getAssessment(profileId: string, type: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  createPublicProfileShare(profileId: string, token: string, snapshot: unknown): Promise<PublicProfileShare>;
  getPublicProfileShareByToken(token: string): Promise<PublicProfileShare | undefined>;
  listPublicProfileShares(profileId: string, limit?: number): Promise<PublicProfileShare[]>;
  revokePublicProfileShare(token: string): Promise<PublicProfileShare | undefined>;
  getBillingSubjectByUserId(userId: string): Promise<BillingSubject | undefined>;
  getOrCreateBillingSubject(userId: string): Promise<BillingSubject>;
  getBillingTransactionEventById(id: string): Promise<BillingTransactionEvent | undefined>;
  getBillingTransactionEventByProviderEvent(provider: string, providerEventId: string): Promise<BillingTransactionEvent | undefined>;
  createBillingTransactionEvent(event: InsertBillingTransactionEvent): Promise<BillingTransactionEvent>;
  createBillingVerificationReceipt(receipt: InsertBillingVerificationReceipt): Promise<BillingVerificationReceipt>;
  createEntitlementGrant(grant: InsertEntitlementGrant): Promise<EntitlementGrant>;
  getLatestEntitlementGrant(userId: string, capability: string): Promise<EntitlementGrant | undefined>;
  deleteSessionData(sessionId: string): Promise<void>;
  deleteUserAccount(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private profiles = new Map<string, Profile>();
  private assessments = new Map<string, Assessment>();
  private publicShares = new Map<string, PublicProfileShare>();
  private billingSubjects = new Map<string, BillingSubject>();
  private billingEvents = new Map<string, BillingTransactionEvent>();
  private entitlementRecords = new Map<string, EntitlementGrant>();
  private billingReceipts = new Map<string, BillingVerificationReceipt>();

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
  async getOrCreateAppleUser(subject: string, email?: string | null, firstName?: string | null, lastName?: string | null): Promise<User> {
    const username = appleUsername(subject);
    const existing = await this.getUserByUsername(username);
    if (existing) return existing;
    const now = new Date();
    const user = {
      id: randomUUID(),
      username,
      password: `apple-disabled:${randomUUID()}:${randomUUID()}`,
      email: email ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      profileImageUrl: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "free",
      subscriptionPlan: null,
      subscriptionEndsAt: null,
      isPremium: false,
      createdAt: now,
      updatedAt: now,
    } satisfies User;
    this.users.set(user.id, user);
    return user;
  }
  async migrateSessionOwnershipToUser(sessionId: string, userId: string): Promise<void> {
    for (const [id, profile] of this.profiles) {
      if (profile.sessionId === sessionId && !profile.userId) {
        this.profiles.set(id, { ...profile, userId, sessionId: null, updatedAt: new Date() });
      }
    }
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
      fullBirthName: insertProfile.fullBirthName ?? null,
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
  async createPublicProfileShare(profileId: string, token: string, snapshot: unknown): Promise<PublicProfileShare> {
    const share = {
      id: randomUUID(),
      token,
      profileId,
      snapshot,
      createdAt: new Date(),
      revokedAt: null,
    } satisfies PublicProfileShare;
    this.publicShares.set(token, share);
    return share;
  }
  async getPublicProfileShareByToken(token: string) {
    return this.publicShares.get(token);
  }
  async listPublicProfileShares(profileId: string, limit = 50) {
    return [...this.publicShares.values()]
      .filter((share) => share.profileId === profileId)
      .sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0))
      .slice(0, Math.max(1, Math.min(limit, 100)));
  }
  async revokePublicProfileShare(token: string) {
    const existing = this.publicShares.get(token);
    if (!existing) return undefined;
    const revoked = { ...existing, revokedAt: new Date() } satisfies PublicProfileShare;
    this.publicShares.set(token, revoked);
    return revoked;
  }
  async getBillingSubjectByUserId(userId: string) {
    return [...this.billingSubjects.values()].find((subject) => subject.userId === userId);
  }
  async getOrCreateBillingSubject(userId: string): Promise<BillingSubject> {
    const existing = await this.getBillingSubjectByUserId(userId);
    if (existing) return existing;
    const now = new Date();
    const subject: BillingSubject = {
      id: randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    };
    this.billingSubjects.set(subject.id, subject);
    return subject;
  }
  async getBillingTransactionEventById(id: string) {
    return this.billingEvents.get(id);
  }
  async getBillingTransactionEventByProviderEvent(provider: string, providerEventId: string) {
    return [...this.billingEvents.values()].find(
      (event) => event.provider === provider && event.providerEventId === providerEventId,
    );
  }
  async createBillingTransactionEvent(event: InsertBillingTransactionEvent): Promise<BillingTransactionEvent> {
    const existing = await this.getBillingTransactionEventByProviderEvent(event.provider, event.providerEventId);
    if (existing) return existing;
    const record: BillingTransactionEvent = {
      ...event,
      id: event.id ?? randomUUID(),
      providerTransactionId: event.providerTransactionId ?? null,
      purchasedAt: event.purchasedAt ?? null,
      expiresAt: event.expiresAt ?? null,
      createdAt: event.createdAt ?? new Date(),
    };
    this.billingEvents.set(record.id, record);
    return record;
  }
  async createBillingVerificationReceipt(receipt: InsertBillingVerificationReceipt): Promise<BillingVerificationReceipt> {
    const existing = [...this.billingReceipts.values()].find(
      (record) => record.transactionEventId === receipt.transactionEventId,
    );
    if (existing) return existing;
    const record: BillingVerificationReceipt = {
      ...receipt,
      id: receipt.id ?? randomUUID(),
      createdAt: receipt.createdAt ?? new Date(),
    };
    this.billingReceipts.set(record.id, record);
    return record;
  }
  async createEntitlementGrant(grant: InsertEntitlementGrant): Promise<EntitlementGrant> {
    const existing = [...this.entitlementRecords.values()].find(
      (record) => record.sourceTransactionEventId === grant.sourceTransactionEventId && record.capability === grant.capability,
    );
    if (existing) return existing;
    const now = new Date();
    const record: EntitlementGrant = {
      ...grant,
      id: grant.id ?? randomUUID(),
      expiresAt: grant.expiresAt ?? null,
      revokedAt: grant.revokedAt ?? null,
      createdAt: grant.createdAt ?? now,
      updatedAt: grant.updatedAt ?? now,
    };
    this.entitlementRecords.set(record.id, record);
    return record;
  }
  async getLatestEntitlementGrant(userId: string, capability: string) {
    const subject = [...this.billingSubjects.values()].find((item) => item.userId === userId);
    if (!subject) return undefined;
    return [...this.entitlementRecords.values()]
      .filter((grant) => grant.billingSubjectId === subject.id && grant.capability === capability)
      .sort((a, b) => {
        const occurrenceDelta = b.effectiveAt.getTime() - a.effectiveAt.getTime();
        return occurrenceDelta || b.lastVerifiedAt.getTime() - a.lastVerifiedAt.getTime();
      })[0];
  }
  async deleteSessionData(sessionId: string): Promise<void> {
    const profileIds = [...this.profiles.values()]
      .filter((profile) => profile.sessionId === sessionId)
      .map((profile) => profile.id);
    for (const [id, assessment] of this.assessments) {
      if (profileIds.includes(assessment.profileId)) this.assessments.delete(id);
    }
    for (const [token, share] of this.publicShares) {
      if (profileIds.includes(share.profileId)) this.publicShares.delete(token);
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
    for (const [token, share] of this.publicShares) {
      if (profileIds.includes(share.profileId)) this.publicShares.delete(token);
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
  async getOrCreateAppleUser(subject: string, email?: string | null, firstName?: string | null, lastName?: string | null): Promise<User> {
    const db = await this.db();
    const username = appleUsername(subject);
    const inserted = await db.insert(users).values({
      username,
      password: `apple-disabled:${randomUUID()}:${randomUUID()}`,
      email: email ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      subscriptionStatus: "free",
      isPremium: false,
    }).onConflictDoNothing({ target: users.username }).returning();
    if (inserted[0]) return inserted[0];
    const existing = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
    if (!existing) throw new Error("Apple user could not be resolved after concurrent creation");
    return existing;
  }
  async migrateSessionOwnershipToUser(sessionId: string, userId: string): Promise<void> {
    const db = await this.db();
    await db.update(profiles)
      .set({ userId, sessionId: null, updatedAt: new Date() })
      .where(and(eq(profiles.sessionId, sessionId), isNull(profiles.userId)));
    await db.update(accessCodeRedemptions)
      .set({ userId, sessionId: null })
      .where(and(eq(accessCodeRedemptions.sessionId, sessionId), isNull(accessCodeRedemptions.userId)));
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
  async createPublicProfileShare(profileId: string, token: string, snapshot: unknown): Promise<PublicProfileShare> {
    const db = await this.db();
    return (await db.insert(publicProfileShares).values({ profileId, token, snapshot }).returning())[0];
  }
  async getPublicProfileShareByToken(token: string) {
    const db = await this.db();
    return (await db.select().from(publicProfileShares).where(eq(publicProfileShares.token, token)).limit(1))[0];
  }
  async listPublicProfileShares(profileId: string, limit = 50) {
    const db = await this.db();
    const boundedLimit = Math.max(1, Math.min(limit, 100));
    return await db.select()
      .from(publicProfileShares)
      .where(eq(publicProfileShares.profileId, profileId))
      .orderBy(desc(publicProfileShares.createdAt))
      .limit(boundedLimit);
  }
  async revokePublicProfileShare(token: string) {
    const db = await this.db();
    return (await db.update(publicProfileShares)
      .set({ revokedAt: new Date() })
      .where(eq(publicProfileShares.token, token))
      .returning())[0];
  }
  async getBillingSubjectByUserId(userId: string) {
    const db = await this.db();
    return (await db.select().from(billingSubjects).where(eq(billingSubjects.userId, userId)).limit(1))[0];
  }
  async getOrCreateBillingSubject(userId: string): Promise<BillingSubject> {
    const db = await this.db();
    const inserted = await db.insert(billingSubjects)
      .values({ userId })
      .onConflictDoNothing({ target: billingSubjects.userId })
      .returning();
    if (inserted[0]) return inserted[0];
    const existing = (await db.select().from(billingSubjects).where(eq(billingSubjects.userId, userId)).limit(1))[0];
    if (!existing) throw new Error("Billing subject could not be resolved after concurrent creation");
    return existing;
  }
  async getBillingTransactionEventById(id: string) {
    const db = await this.db();
    return (await db.select().from(billingTransactionEvents).where(eq(billingTransactionEvents.id, id)).limit(1))[0];
  }
  async getBillingTransactionEventByProviderEvent(provider: string, providerEventId: string) {
    const db = await this.db();
    return (await db.select().from(billingTransactionEvents)
      .where(and(
        eq(billingTransactionEvents.provider, provider),
        eq(billingTransactionEvents.providerEventId, providerEventId),
      ))
      .limit(1))[0];
  }
  async createBillingTransactionEvent(event: InsertBillingTransactionEvent): Promise<BillingTransactionEvent> {
    const db = await this.db();
    const inserted = await db.insert(billingTransactionEvents)
      .values(event)
      .onConflictDoNothing()
      .returning();
    if (inserted[0]) return inserted[0];
    const existing = await this.getBillingTransactionEventByProviderEvent(event.provider, event.providerEventId);
    if (!existing) throw new Error("Billing event could not be resolved after replay");
    return existing;
  }
  async createBillingVerificationReceipt(receipt: InsertBillingVerificationReceipt): Promise<BillingVerificationReceipt> {
    const db = await this.db();
    const inserted = await db.insert(billingVerificationReceipts)
      .values(receipt)
      .onConflictDoNothing()
      .returning();
    if (inserted[0]) return inserted[0];
    const existing = (await db.select().from(billingVerificationReceipts)
      .where(eq(billingVerificationReceipts.transactionEventId, receipt.transactionEventId))
      .limit(1))[0];
    if (!existing) throw new Error("Billing verification receipt could not be resolved after replay");
    return existing;
  }
  async createEntitlementGrant(grant: InsertEntitlementGrant): Promise<EntitlementGrant> {
    const db = await this.db();
    const inserted = await db.insert(entitlementGrants)
      .values(grant)
      .onConflictDoNothing()
      .returning();
    if (inserted[0]) return inserted[0];
    const existing = (await db.select().from(entitlementGrants)
      .where(and(
        eq(entitlementGrants.sourceTransactionEventId, grant.sourceTransactionEventId),
        eq(entitlementGrants.capability, grant.capability),
      ))
      .limit(1))[0];
    if (!existing) throw new Error("Entitlement grant could not be resolved after replay");
    return existing;
  }
  async getLatestEntitlementGrant(userId: string, capability: string) {
    const db = await this.db();
    const subject = (await db.select().from(billingSubjects).where(eq(billingSubjects.userId, userId)).limit(1))[0];
    if (!subject) return undefined;
    return (await db.select().from(entitlementGrants)
      .where(and(
        eq(entitlementGrants.billingSubjectId, subject.id),
        eq(entitlementGrants.capability, capability),
      ))
      .orderBy(desc(entitlementGrants.effectiveAt), desc(entitlementGrants.lastVerifiedAt))
      .limit(1))[0];
  }
  async deleteSessionData(sessionId: string): Promise<void> {
    const db = await this.db();
    const ownedProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.sessionId, sessionId));
    const ids = ownedProfiles.map((row) => row.id);
    if (ids.length) {
      await db.delete(assessmentResponses).where(inArray(assessmentResponses.profileId, ids));
      await db.delete(publicProfileShares).where(inArray(publicProfileShares.profileId, ids));
    }
    await db.delete(accessCodeRedemptions).where(eq(accessCodeRedemptions.sessionId, sessionId));
    await db.delete(profiles).where(eq(profiles.sessionId, sessionId));
  }
  async deleteUserAccount(userId: string): Promise<void> {
    const db = await this.db();
    const ownedProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId));
    const ids = ownedProfiles.map((row) => row.id);
    if (ids.length) {
      await db.delete(assessmentResponses).where(inArray(assessmentResponses.profileId, ids));
      await db.delete(publicProfileShares).where(inArray(publicProfileShares.profileId, ids));
    }
    await db.delete(accessCodeRedemptions).where(eq(accessCodeRedemptions.userId, userId));
    await db.delete(profiles).where(eq(profiles.userId, userId));
    await db.delete(localUsers).where(eq(localUsers.id, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
}

const usePostgres = Boolean(process.env.DATABASE_URL) && process.env.DEMO_MODE !== "true";
export const storage: IStorage = usePostgres ? new PostgresStorage() : new MemStorage();
console.log(`[ServerStorage] Using ${usePostgres ? "PostgresStorage" : "MemStorage"}`);

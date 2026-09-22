import { randomUUID } from "crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  users,
  profiles,
  assessmentResponses,
  accessCodeRedemptions,
  localUsers,
  billingSubjects,
  storeTransactionEvents,
  entitlementGrants,
  billingVerificationReceipts,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Assessment,
  type InsertAssessment,
  type BillingSubject,
  type EntitlementGrant,
} from "@shared/schema";

export interface VerifiedEntitlementInput {
  userId: string;
  provider: "apple_app_store" | "google_play" | "stripe_checkout";
  environment: "sandbox" | "production";
  externalTransactionId: string;
  originalTransactionId?: string | null;
  productId: string;
  providerEventId: string;
  eventType: string;
  capability: string;
  purchasedAt: Date;
  expiresAt?: Date | null;
  payloadDigest: string;
  verifier: string;
}

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
  recordVerifiedEntitlement(input: VerifiedEntitlementInput): Promise<EntitlementGrant>;
  getEntitlementForUser(userId: string, capability: string): Promise<EntitlementGrant | undefined>;
  deleteSessionData(sessionId: string): Promise<void>;
  deleteUserAccount(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private profiles = new Map<string, Profile>();
  private assessments = new Map<string, Assessment>();
  private billingSubjects = new Map<string, BillingSubject>();
  private storeEvents = new Map<string, {
    id: string;
    billingSubjectId: string;
    productId: string;
    payloadDigest: string;
  }>();
  private entitlements = new Map<string, EntitlementGrant>();
  private providerEventIds = new Map<string, string>();

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
  async recordVerifiedEntitlement(input: VerifiedEntitlementInput): Promise<EntitlementGrant> {
    let subject = this.billingSubjects.get(input.userId);
    if (!subject) {
      const now = new Date();
      subject = {
        id: randomUUID(),
        userId: input.userId,
        status: "active",
        anonymizedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      this.billingSubjects.set(input.userId, subject);
    }

    const transactionKey = `${input.provider}:${input.environment}:${input.externalTransactionId}`;
    const priorProviderEvent = this.providerEventIds.get(input.providerEventId);
    if (priorProviderEvent && priorProviderEvent !== transactionKey) {
      throw new Error("provider_event_replay_mismatch");
    }

    const existingEvent = this.storeEvents.get(transactionKey);
    if (existingEvent && (
      existingEvent.billingSubjectId !== subject.id ||
      existingEvent.productId !== input.productId ||
      existingEvent.payloadDigest !== input.payloadDigest
    )) {
      throw new Error("store_transaction_replay_mismatch");
    }

    const event = existingEvent ?? {
      id: randomUUID(),
      billingSubjectId: subject.id,
      productId: input.productId,
      payloadDigest: input.payloadDigest,
    };
    this.storeEvents.set(transactionKey, event);
    this.providerEventIds.set(input.providerEventId, transactionKey);

    const now = new Date();
    const entitlementKey = `${subject.id}:${input.capability}`;
    const previous = this.entitlements.get(entitlementKey);
    const entitlement: EntitlementGrant = {
      id: previous?.id ?? randomUUID(),
      billingSubjectId: subject.id,
      capability: input.capability,
      sourceEventId: event.id,
      status: "active",
      startsAt: input.purchasedAt,
      endsAt: input.expiresAt ?? null,
      revokedAt: null,
      lastVerifiedAt: now,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.entitlements.set(entitlementKey, entitlement);
    return entitlement;
  }
  async getEntitlementForUser(userId: string, capability: string): Promise<EntitlementGrant | undefined> {
    const subject = this.billingSubjects.get(userId);
    return subject ? this.entitlements.get(`${subject.id}:${capability}`) : undefined;
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
    const billingSubject = this.billingSubjects.get(userId);
    if (billingSubject) {
      this.billingSubjects.delete(userId);
      this.billingSubjects.set(`anonymized:${billingSubject.id}`, {
        ...billingSubject,
        userId: null,
        status: "anonymized",
        anonymizedAt: new Date(),
        updatedAt: new Date(),
      });
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
  async recordVerifiedEntitlement(input: VerifiedEntitlementInput): Promise<EntitlementGrant> {
    const db = await this.db();
    return db.transaction(async (tx) => {
      const now = new Date();
      const insertedSubject = await tx.insert(billingSubjects).values({
        userId: input.userId,
        status: "active",
      }).onConflictDoNothing({ target: billingSubjects.userId }).returning();
      const subject = insertedSubject[0] ?? (await tx.select().from(billingSubjects)
        .where(eq(billingSubjects.userId, input.userId)).limit(1))[0];
      if (!subject || subject.status !== "active") {
        throw new Error("billing_subject_unavailable");
      }

      const insertedEvent = await tx.insert(storeTransactionEvents).values({
        billingSubjectId: subject.id,
        provider: input.provider,
        environment: input.environment,
        externalTransactionId: input.externalTransactionId,
        originalTransactionId: input.originalTransactionId ?? null,
        productId: input.productId,
        eventType: input.eventType,
        purchaseStatus: "verified_paid",
        purchasedAt: input.purchasedAt,
        expiresAt: input.expiresAt ?? null,
        revokedAt: null,
        payloadDigest: input.payloadDigest,
      }).onConflictDoNothing({
        target: [
          storeTransactionEvents.provider,
          storeTransactionEvents.environment,
          storeTransactionEvents.externalTransactionId,
        ],
      }).returning();
      const event = insertedEvent[0] ?? (await tx.select().from(storeTransactionEvents).where(and(
        eq(storeTransactionEvents.provider, input.provider),
        eq(storeTransactionEvents.environment, input.environment),
        eq(storeTransactionEvents.externalTransactionId, input.externalTransactionId),
      )).limit(1))[0];
      if (!event ||
        event.billingSubjectId !== subject.id ||
        event.productId !== input.productId ||
        event.payloadDigest !== input.payloadDigest
      ) {
        throw new Error("store_transaction_replay_mismatch");
      }

      const priorReceipt = (await tx.select().from(billingVerificationReceipts)
        .where(eq(billingVerificationReceipts.providerEventId, input.providerEventId)).limit(1))[0];
      if (priorReceipt && (
        priorReceipt.storeEventId !== event.id ||
        priorReceipt.payloadDigest !== input.payloadDigest
      )) {
        throw new Error("provider_event_replay_mismatch");
      }
      if (!priorReceipt) {
        await tx.insert(billingVerificationReceipts).values({
          storeEventId: event.id,
          providerEventId: input.providerEventId,
          verifier: input.verifier,
          outcome: "verified",
          reasonCode: "signature_verified_paid_event",
          payloadDigest: input.payloadDigest,
        });
      }

      return (await tx.insert(entitlementGrants).values({
        billingSubjectId: subject.id,
        capability: input.capability,
        sourceEventId: event.id,
        status: "active",
        startsAt: input.purchasedAt,
        endsAt: input.expiresAt ?? null,
        revokedAt: null,
        lastVerifiedAt: now,
      }).onConflictDoUpdate({
        target: [entitlementGrants.billingSubjectId, entitlementGrants.capability],
        set: {
          sourceEventId: event.id,
          status: "active",
          startsAt: input.purchasedAt,
          endsAt: input.expiresAt ?? null,
          revokedAt: null,
          lastVerifiedAt: now,
          updatedAt: now,
        },
      }).returning())[0];
    });
  }
  async getEntitlementForUser(userId: string, capability: string): Promise<EntitlementGrant | undefined> {
    const db = await this.db();
    return (await db.select({ grant: entitlementGrants }).from(entitlementGrants)
      .innerJoin(billingSubjects, eq(entitlementGrants.billingSubjectId, billingSubjects.id))
      .where(and(
        eq(billingSubjects.userId, userId),
        eq(billingSubjects.status, "active"),
        eq(entitlementGrants.capability, capability),
      )).limit(1))[0]?.grant;
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
    await db.update(billingSubjects).set({
      userId: null,
      status: "anonymized",
      anonymizedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(billingSubjects.userId, userId));
    await db.delete(localUsers).where(eq(localUsers.id, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
}

const usePostgres = Boolean(process.env.DATABASE_URL) && process.env.DEMO_MODE !== "true";
export const storage: IStorage = usePostgres ? new PostgresStorage() : new MemStorage();
console.log(`[ServerStorage] Using ${usePostgres ? "PostgresStorage" : "MemStorage"}`);

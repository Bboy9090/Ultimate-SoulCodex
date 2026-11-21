import { randomUUID } from "crypto";
import { and, desc, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import {
  users,
  profiles,
  assessmentResponses,
  accessCodeRedemptions,
  localUsers,
  publicProfileShares,
  soulCircleInvites,
  soulCircleLinks,
  soulCircleShares,
  soulCircleEvents,
  galacticCodeRecords,
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
  type SoulCircleInvite,
  type SoulCircleLink,
  type SoulCircleShare,
  type SoulCircleEvent,
  type GalacticCodeRecord,
  type InsertGalacticCodeRecord,
  type BillingSubject,
  type BillingTransactionEvent,
  type EntitlementGrant,
  type BillingVerificationReceipt,
  type InsertBillingTransactionEvent,
  type InsertEntitlementGrant,
  type InsertBillingVerificationReceipt,
} from "@shared/schema";


export type SoulCircleAcceptResult =
  | { status: "linked"; link: SoulCircleLink; inviterUserId: string }
  | { status: "not_found" | "expired" | "used" | "revoked" | "self" | "blocked" };

export const SOUL_CIRCLE_MAX_EVENTS_PER_USER = 100;

/** A friend pair has exactly one canonical row, ordered by user id. */
export function soulCirclePair(a: string, b: string): { userLowId: string; userHighId: string } {
  return a < b ? { userLowId: a, userHighId: b } : { userLowId: b, userHighId: a };
}

export function soulCircleOtherUser(link: Pick<SoulCircleLink, "userLowId" | "userHighId">, userId: string): string | null {
  if (link.userLowId === userId) return link.userHighId;
  if (link.userHighId === userId) return link.userLowId;
  return null;
}

function appleUsername(subject: string) {
  return `apple:${subject}`;
}

function googleUsername(subject: string) {
  return `google:${subject}`;
}

function emailUsername(email: string) {
  return `email:${email.trim().toLowerCase()}`;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOrCreateAppleUser(subject: string, email?: string | null, firstName?: string | null, lastName?: string | null): Promise<User>;
  getOrCreateGoogleUser(subject: string, email?: string | null, displayName?: string | null): Promise<User>;
  createEmailUser(email: string, passwordHash: string, firstName?: string | null): Promise<User>;
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
  getGalacticCodeRecord(profileId: string): Promise<GalacticCodeRecord | undefined>;
  upsertGalacticCodeRecord(record: InsertGalacticCodeRecord): Promise<GalacticCodeRecord>;
  deleteGalacticCodeRecordsForProfiles(profileIds: string[]): Promise<void>;
  getBillingSubjectByUserId(userId: string): Promise<BillingSubject | undefined>;
  getOrCreateBillingSubject(userId: string): Promise<BillingSubject>;
  getBillingTransactionEventById(id: string): Promise<BillingTransactionEvent | undefined>;
  getBillingTransactionEventByProviderEvent(provider: string, providerEventId: string): Promise<BillingTransactionEvent | undefined>;
  createBillingTransactionEvent(event: InsertBillingTransactionEvent): Promise<BillingTransactionEvent>;
  createBillingVerificationReceipt(receipt: InsertBillingVerificationReceipt): Promise<BillingVerificationReceipt>;
  createEntitlementGrant(grant: InsertEntitlementGrant): Promise<EntitlementGrant>;
  getLatestEntitlementGrant(userId: string, capability: string, environment?: "production" | "sandbox"): Promise<EntitlementGrant | undefined>;
  createSoulCircleInvite(inviterUserId: string, tokenHash: string, expiresAt: Date, inviterDisplayName?: string | null): Promise<SoulCircleInvite>;
  listSoulCircleInvites(inviterUserId: string): Promise<SoulCircleInvite[]>;
  revokeSoulCircleInvite(inviterUserId: string, inviteId: string, now: Date): Promise<SoulCircleInvite | undefined>;
  getSoulCircleInviteByTokenHash(tokenHash: string): Promise<SoulCircleInvite | undefined>;
  acceptSoulCircleInvite(tokenHash: string, accepterUserId: string, now: Date): Promise<SoulCircleAcceptResult>;
  getSoulCircleLinkById(linkId: string): Promise<SoulCircleLink | undefined>;
  listSoulCircleLinksForUser(userId: string): Promise<SoulCircleLink[]>;
  listSoulCircleBlockedByUser(userId: string): Promise<SoulCircleLink[]>;
  removeSoulCircleLink(linkId: string): Promise<void>;
  blockSoulCircleLink(linkId: string, blockedByUserId: string): Promise<SoulCircleLink | undefined>;
  /** Writes consent only if the link is still active and the owner belongs to it, atomically with removal/blocking. */
  upsertSoulCircleShareForLink(linkId: string, ownerUserId: string, selection: unknown, expiresAt: Date): Promise<SoulCircleShare | undefined>;
  getSoulCircleShare(ownerUserId: string, friendUserId: string): Promise<SoulCircleShare | undefined>;
  listSoulCircleSharesTo(friendUserId: string): Promise<SoulCircleShare[]>;
  listSoulCircleSharesFrom(ownerUserId: string): Promise<SoulCircleShare[]>;
  revokeSoulCircleShare(ownerUserId: string, friendUserId: string, now: Date): Promise<SoulCircleShare | undefined>;
  createSoulCircleEvent(userId: string, kind: string, linkId: string, now: Date): Promise<SoulCircleEvent | undefined>;
  listSoulCircleEvents(userId: string, limit: number): Promise<SoulCircleEvent[]>;
  markSoulCircleEventsRead(userId: string, ids: string[] | "all", now: Date): Promise<number>;
  deleteSoulCircleDataForUser(userId: string): Promise<void>;
  deleteSessionData(sessionId: string): Promise<void>;
  deleteUserAccount(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private profiles = new Map<string, Profile>();
  private assessments = new Map<string, Assessment>();
  private publicShares = new Map<string, PublicProfileShare>();
  private soulCircleInvites = new Map<string, SoulCircleInvite>();
  private soulCircleLinks = new Map<string, SoulCircleLink>();
  private soulCircleShares = new Map<string, SoulCircleShare>();
  private soulCircleEvents = new Map<string, SoulCircleEvent>();
  private galacticRecords = new Map<string, GalacticCodeRecord>();
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
  async createEmailUser(email: string, passwordHash: string, firstName?: string | null): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const username = emailUsername(normalizedEmail);
    if (await this.getUserByUsername(username)) throw new Error("email_already_in_use");
    const now = new Date();
    const user = {
      id: randomUUID(),
      username,
      password: passwordHash,
      email: normalizedEmail,
      firstName: firstName ?? null,
      lastName: null,
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
  async getOrCreateGoogleUser(subject: string, email?: string | null, displayName?: string | null): Promise<User> {
    const username = googleUsername(subject);
    const existing = await this.getUserByUsername(username);
    if (existing) return existing;
    const now = new Date();
    const user = {
      id: randomUUID(),
      username,
      password: `google-disabled:${randomUUID()}:${randomUUID()}`,
      email: email ?? null,
      firstName: displayName ?? null,
      lastName: null,
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
    for (const [profileId, record] of this.galacticRecords) {
      if (record.sessionId === sessionId && !record.userId) {
        this.galacticRecords.set(profileId, { ...record, userId, sessionId: null, updatedAt: new Date() });
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
  async getGalacticCodeRecord(profileId: string) {
    return this.galacticRecords.get(profileId);
  }
  async upsertGalacticCodeRecord(input: InsertGalacticCodeRecord): Promise<GalacticCodeRecord> {
    const now = new Date();
    const existing = this.galacticRecords.get(input.profileId);
    const record: GalacticCodeRecord = {
      id: existing?.id ?? input.id ?? randomUUID(),
      profileId: input.profileId,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      revision: input.revision,
      version: input.version,
      result: input.result,
      generatedAt: input.generatedAt,
      createdAt: existing?.createdAt ?? input.createdAt ?? now,
      updatedAt: now,
    };
    this.galacticRecords.set(record.profileId, record);
    return record;
  }
  async deleteGalacticCodeRecordsForProfiles(profileIds: string[]): Promise<void> {
    for (const profileId of profileIds) this.galacticRecords.delete(profileId);
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
  async getLatestEntitlementGrant(userId: string, capability: string, environment: "production" | "sandbox" = "production") {
    const subject = [...this.billingSubjects.values()].find((item) => item.userId === userId);
    if (!subject) return undefined;
    return [...this.entitlementRecords.values()]
      .filter((grant) => {
        const source = [...this.billingEvents.values()].find((event) => event.id === grant.sourceTransactionEventId);
        return grant.billingSubjectId === subject.id &&
          grant.capability === capability &&
          source?.environment === environment;
      })
      .sort((a, b) => {
        const occurrenceDelta = b.effectiveAt.getTime() - a.effectiveAt.getTime();
        return occurrenceDelta || b.lastVerifiedAt.getTime() - a.lastVerifiedAt.getTime();
      })[0];
  }
  async createSoulCircleInvite(inviterUserId: string, tokenHash: string, expiresAt: Date, inviterDisplayName: string | null = null): Promise<SoulCircleInvite> {
    const invite: SoulCircleInvite = {
      id: randomUUID(), tokenHash, inviterUserId, inviterDisplayName, createdAt: new Date(), expiresAt,
      acceptedByUserId: null, acceptedAt: null, revokedAt: null,
    };
    this.soulCircleInvites.set(invite.id, invite);
    return invite;
  }
  async listSoulCircleInvites(inviterUserId: string) {
    return [...this.soulCircleInvites.values()]
      .filter((invite) => invite.inviterUserId === inviterUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async revokeSoulCircleInvite(inviterUserId: string, inviteId: string, now: Date) {
    const invite = this.soulCircleInvites.get(inviteId);
    if (!invite || invite.inviterUserId !== inviterUserId) return undefined;
    if (invite.revokedAt) return invite;
    const revoked = { ...invite, revokedAt: now };
    this.soulCircleInvites.set(inviteId, revoked);
    return revoked;
  }
  async getSoulCircleInviteByTokenHash(tokenHash: string) {
    return [...this.soulCircleInvites.values()].find((invite) => invite.tokenHash === tokenHash);
  }
  async acceptSoulCircleInvite(tokenHash: string, accepterUserId: string, now: Date): Promise<SoulCircleAcceptResult> {
    // No await between the checks and the writes below: this must stay atomic so two
    // concurrent accepts cannot both consume the same single-use invite.
    const invite = [...this.soulCircleInvites.values()].find((candidate) => candidate.tokenHash === tokenHash);
    if (!invite) return { status: "not_found" };
    if (invite.revokedAt) return { status: "revoked" };
    if (invite.acceptedAt) return { status: "used" };
    if (invite.expiresAt.getTime() <= now.getTime()) return { status: "expired" };
    if (invite.inviterUserId === accepterUserId) return { status: "self" };
    const pair = soulCirclePair(invite.inviterUserId, accepterUserId);
    const existing = [...this.soulCircleLinks.values()].find((link) => link.userLowId === pair.userLowId && link.userHighId === pair.userHighId);
    if (existing?.status === "blocked") return { status: "blocked" };
    const link: SoulCircleLink = existing ?? {
      id: randomUUID(), ...pair, status: "active", blockedByUserId: null, createdAt: now, updatedAt: now,
    };
    // A new friendship never inherits consent from an earlier one.
    if (!existing) this.dropSoulCircleSharesBetween(pair.userLowId, pair.userHighId);
    this.soulCircleLinks.set(link.id, link);
    this.soulCircleInvites.set(invite.id, { ...invite, acceptedByUserId: accepterUserId, acceptedAt: now });
    // The inviter is told a friend joined. The event carries no name or data.
    if (!existing) this.insertSoulCircleEvent(invite.inviterUserId, "friend_joined", link.id, now);
    return { status: "linked", link, inviterUserId: invite.inviterUserId };
  }
  async getSoulCircleLinkById(linkId: string) {
    return this.soulCircleLinks.get(linkId);
  }
  async listSoulCircleLinksForUser(userId: string) {
    return [...this.soulCircleLinks.values()]
      .filter((link) => link.status === "active" && (link.userLowId === userId || link.userHighId === userId))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async listSoulCircleBlockedByUser(userId: string) {
    return [...this.soulCircleLinks.values()].filter((link) => link.status === "blocked" && link.blockedByUserId === userId);
  }
  private dropSoulCircleSharesBetween(a: string, b: string) {
    for (const [id, share] of this.soulCircleShares) {
      if ((share.ownerUserId === a && share.friendUserId === b) || (share.ownerUserId === b && share.friendUserId === a)) {
        this.soulCircleShares.delete(id);
      }
    }
  }
  async removeSoulCircleLink(linkId: string) {
    const link = this.soulCircleLinks.get(linkId);
    if (!link) return;
    this.dropSoulCircleSharesBetween(link.userLowId, link.userHighId);
    this.dropSoulCircleEventsForLink(linkId);
    this.soulCircleLinks.delete(linkId);
  }
  async blockSoulCircleLink(linkId: string, blockedByUserId: string) {
    const link = this.soulCircleLinks.get(linkId);
    if (!link) return undefined;
    this.dropSoulCircleSharesBetween(link.userLowId, link.userHighId);
    this.dropSoulCircleEventsForLink(linkId);
    const blocked: SoulCircleLink = { ...link, status: "blocked", blockedByUserId, updatedAt: new Date() };
    this.soulCircleLinks.set(linkId, blocked);
    return blocked;
  }
  async upsertSoulCircleShareForLink(linkId: string, ownerUserId: string, selection: unknown, expiresAt: Date): Promise<SoulCircleShare | undefined> {
    // No await between the link check and the write: removal and blocking are also
    // synchronous, so a share can never be recreated for a link that was just deleted.
    const link = this.soulCircleLinks.get(linkId);
    if (!link || link.status !== "active") return undefined;
    const friendUserId = soulCircleOtherUser(link, ownerUserId);
    if (!friendUserId) return undefined;
    const existing = [...this.soulCircleShares.values()].find((share) => share.ownerUserId === ownerUserId && share.friendUserId === friendUserId);
    const now = new Date();
    const share: SoulCircleShare = existing
      ? { ...existing, selection, expiresAt, updatedAt: now, revokedAt: null }
      : { id: randomUUID(), ownerUserId, friendUserId, selection, createdAt: now, updatedAt: now, expiresAt, revokedAt: null };
    this.soulCircleShares.set(share.id, share);
    return share;
  }
  async getSoulCircleShare(ownerUserId: string, friendUserId: string) {
    return [...this.soulCircleShares.values()].find((share) => share.ownerUserId === ownerUserId && share.friendUserId === friendUserId);
  }
  async listSoulCircleSharesTo(friendUserId: string) {
    return [...this.soulCircleShares.values()].filter((share) => share.friendUserId === friendUserId);
  }
  async listSoulCircleSharesFrom(ownerUserId: string) {
    return [...this.soulCircleShares.values()].filter((share) => share.ownerUserId === ownerUserId);
  }
  async revokeSoulCircleShare(ownerUserId: string, friendUserId: string, now: Date) {
    const existing = await this.getSoulCircleShare(ownerUserId, friendUserId);
    if (!existing) return undefined;
    const revoked = { ...existing, revokedAt: existing.revokedAt ?? now, updatedAt: now };
    this.soulCircleShares.set(existing.id, revoked);
    return revoked;
  }
  private insertSoulCircleEvent(userId: string, kind: string, linkId: string, now: Date): SoulCircleEvent | undefined {
    // One unread event per kind and friendship: repeated actions do not stack up.
    const duplicate = [...this.soulCircleEvents.values()].some((event) =>
      event.userId === userId && event.kind === kind && event.linkId === linkId && !event.readAt);
    if (duplicate) return undefined;
    const event: SoulCircleEvent = { id: randomUUID(), userId, kind, linkId, createdAt: now, readAt: null };
    this.soulCircleEvents.set(event.id, event);
    const mine = [...this.soulCircleEvents.values()].filter((row) => row.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    for (const stale of mine.slice(SOUL_CIRCLE_MAX_EVENTS_PER_USER)) this.soulCircleEvents.delete(stale.id);
    return event;
  }
  private dropSoulCircleEventsForLink(linkId: string) {
    for (const [id, event] of this.soulCircleEvents) {
      if (event.linkId === linkId) this.soulCircleEvents.delete(id);
    }
  }
  async createSoulCircleEvent(userId: string, kind: string, linkId: string, now: Date) {
    return this.insertSoulCircleEvent(userId, kind, linkId, now);
  }
  async listSoulCircleEvents(userId: string, limit: number) {
    return [...this.soulCircleEvents.values()].filter((event) => event.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }
  async markSoulCircleEventsRead(userId: string, ids: string[] | "all", now: Date) {
    let changed = 0;
    for (const [id, event] of this.soulCircleEvents) {
      if (event.userId !== userId || event.readAt) continue;
      if (ids !== "all" && !ids.includes(id)) continue;
      this.soulCircleEvents.set(id, { ...event, readAt: now });
      changed += 1;
    }
    return changed;
  }
  async deleteSoulCircleDataForUser(userId: string) {
    for (const [id, invite] of this.soulCircleInvites) {
      if (invite.inviterUserId === userId || invite.acceptedByUserId === userId) this.soulCircleInvites.delete(id);
    }
    for (const [id, link] of this.soulCircleLinks) {
      if (link.userLowId === userId || link.userHighId === userId) {
        this.dropSoulCircleEventsForLink(id);
        this.soulCircleLinks.delete(id);
      }
    }
    for (const [id, event] of this.soulCircleEvents) {
      if (event.userId === userId) this.soulCircleEvents.delete(id);
    }
    for (const [id, share] of this.soulCircleShares) {
      if (share.ownerUserId === userId || share.friendUserId === userId) this.soulCircleShares.delete(id);
    }
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
    await this.deleteGalacticCodeRecordsForProfiles(profileIds);
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
    await this.deleteGalacticCodeRecordsForProfiles(profileIds);
    await this.deleteSoulCircleDataForUser(userId);
    for (const [id, profile] of this.profiles) {
      if (profile.userId === userId) this.profiles.delete(id);
    }
    this.users.delete(userId);
  }
}

export class PostgresStorage implements IStorage {
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
  async createEmailUser(email: string, passwordHash: string, firstName?: string | null): Promise<User> {
    const db = await this.db();
    const normalizedEmail = email.trim().toLowerCase();
    const username = emailUsername(normalizedEmail);
    try {
      return (await db.insert(users).values({
        username,
        password: passwordHash,
        email: normalizedEmail,
        firstName: firstName ?? null,
        subscriptionStatus: "free",
        isPremium: false,
      }).returning())[0];
    } catch (error: any) {
      if (String(error?.code ?? "") === "23505") throw new Error("email_already_in_use");
      throw error;
    }
  }
  async getOrCreateGoogleUser(subject: string, email?: string | null, displayName?: string | null): Promise<User> {
    const db = await this.db();
    const username = googleUsername(subject);
    const inserted = await db.insert(users).values({
      username,
      password: `google-disabled:${randomUUID()}:${randomUUID()}`,
      email: email ?? null,
      firstName: displayName ?? null,
      subscriptionStatus: "free",
      isPremium: false,
    }).onConflictDoNothing({ target: users.username }).returning();
    if (inserted[0]) return inserted[0];
    const existing = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
    if (!existing) throw new Error("Google user could not be resolved after concurrent creation");
    return existing;
  }
  async migrateSessionOwnershipToUser(sessionId: string, userId: string): Promise<void> {
    const db = await this.db();
    await db.update(profiles)
      .set({ userId, sessionId: null, updatedAt: new Date() })
      .where(and(eq(profiles.sessionId, sessionId), isNull(profiles.userId)));
    await db.update(galacticCodeRecords)
      .set({ userId, sessionId: null, updatedAt: new Date() })
      .where(and(eq(galacticCodeRecords.sessionId, sessionId), isNull(galacticCodeRecords.userId)));
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
  async getGalacticCodeRecord(profileId: string) {
    const db = await this.db();
    return (await db.select().from(galacticCodeRecords)
      .where(eq(galacticCodeRecords.profileId, profileId)).limit(1))[0];
  }
  async upsertGalacticCodeRecord(record: InsertGalacticCodeRecord): Promise<GalacticCodeRecord> {
    const db = await this.db();
    return (await db.insert(galacticCodeRecords)
      .values(record)
      .onConflictDoUpdate({
        target: galacticCodeRecords.profileId,
        set: {
          userId: record.userId ?? null,
          sessionId: record.sessionId ?? null,
          revision: record.revision,
          version: record.version,
          result: record.result,
          generatedAt: record.generatedAt,
          updatedAt: new Date(),
        },
      })
      .returning())[0];
  }
  async deleteGalacticCodeRecordsForProfiles(profileIds: string[]): Promise<void> {
    if (!profileIds.length) return;
    const db = await this.db();
    await db.delete(galacticCodeRecords).where(inArray(galacticCodeRecords.profileId, profileIds));
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
  async getLatestEntitlementGrant(userId: string, capability: string, environment: "production" | "sandbox" = "production") {
    const db = await this.db();
    const subject = (await db.select().from(billingSubjects).where(eq(billingSubjects.userId, userId)).limit(1))[0];
    if (!subject) return undefined;
    const rows = await db.select({ grant: entitlementGrants }).from(entitlementGrants)
      .innerJoin(billingTransactionEvents, eq(entitlementGrants.sourceTransactionEventId, billingTransactionEvents.id))
      .where(and(
        eq(entitlementGrants.billingSubjectId, subject.id),
        eq(entitlementGrants.capability, capability),
        eq(billingTransactionEvents.environment, environment),
      ))
      .orderBy(desc(entitlementGrants.effectiveAt), desc(entitlementGrants.lastVerifiedAt))
      .limit(1);
    return rows[0]?.grant;
  }
  async createSoulCircleInvite(inviterUserId: string, tokenHash: string, expiresAt: Date, inviterDisplayName: string | null = null): Promise<SoulCircleInvite> {
    const db = await this.db();
    return (await db.insert(soulCircleInvites).values({ inviterUserId, tokenHash, expiresAt, inviterDisplayName }).returning())[0];
  }
  async listSoulCircleInvites(inviterUserId: string) {
    const db = await this.db();
    return db.select().from(soulCircleInvites)
      .where(eq(soulCircleInvites.inviterUserId, inviterUserId))
      .orderBy(desc(soulCircleInvites.createdAt));
  }
  async revokeSoulCircleInvite(inviterUserId: string, inviteId: string, now: Date) {
    const db = await this.db();
    const existing = (await db.select().from(soulCircleInvites)
      .where(and(eq(soulCircleInvites.id, inviteId), eq(soulCircleInvites.inviterUserId, inviterUserId))).limit(1))[0];
    if (!existing) return undefined;
    if (existing.revokedAt) return existing;
    return (await db.update(soulCircleInvites).set({ revokedAt: now })
      .where(and(eq(soulCircleInvites.id, inviteId), eq(soulCircleInvites.inviterUserId, inviterUserId))).returning())[0];
  }
  async getSoulCircleInviteByTokenHash(tokenHash: string) {
    const db = await this.db();
    return (await db.select().from(soulCircleInvites).where(eq(soulCircleInvites.tokenHash, tokenHash)).limit(1))[0];
  }
  async acceptSoulCircleInvite(tokenHash: string, accepterUserId: string, now: Date): Promise<SoulCircleAcceptResult> {
    const db = await this.db();
    return db.transaction(async (tx) => {
      // Row lock: two people racing to use the same single-use invite are serialized.
      const invite = (await tx.select().from(soulCircleInvites)
        .where(eq(soulCircleInvites.tokenHash, tokenHash)).limit(1).for("update"))[0];
      if (!invite) return { status: "not_found" } as const;
      if (invite.revokedAt) return { status: "revoked" } as const;
      if (invite.acceptedAt) return { status: "used" } as const;
      if (invite.expiresAt.getTime() <= now.getTime()) return { status: "expired" } as const;
      if (invite.inviterUserId === accepterUserId) return { status: "self" } as const;

      const pair = soulCirclePair(invite.inviterUserId, accepterUserId);
      const existing = (await tx.select().from(soulCircleLinks)
        .where(and(eq(soulCircleLinks.userLowId, pair.userLowId), eq(soulCircleLinks.userHighId, pair.userHighId))).limit(1))[0];
      if (existing?.status === "blocked") return { status: "blocked" } as const;

      // A new friendship never inherits consent from an earlier one.
      if (!existing) await this.dropSoulCircleSharesBetween(tx, pair.userLowId, pair.userHighId);
      const link = existing ?? (await tx.insert(soulCircleLinks).values({ ...pair, status: "active" })
        .onConflictDoNothing().returning())[0]
        ?? (await tx.select().from(soulCircleLinks)
          .where(and(eq(soulCircleLinks.userLowId, pair.userLowId), eq(soulCircleLinks.userHighId, pair.userHighId))).limit(1))[0];
      if (link.status === "blocked") return { status: "blocked" } as const;

      await tx.update(soulCircleInvites).set({ acceptedByUserId: accepterUserId, acceptedAt: now })
        .where(eq(soulCircleInvites.id, invite.id));
      // The inviter is told a friend joined. The event carries no name or data.
      if (!existing) await this.insertSoulCircleEvent(tx, invite.inviterUserId, "friend_joined", link.id, now);
      return { status: "linked", link, inviterUserId: invite.inviterUserId } as const;
    });
  }
  async getSoulCircleLinkById(linkId: string) {
    const db = await this.db();
    return (await db.select().from(soulCircleLinks).where(eq(soulCircleLinks.id, linkId)).limit(1))[0];
  }
  async listSoulCircleLinksForUser(userId: string) {
    const db = await this.db();
    return db.select().from(soulCircleLinks)
      .where(and(
        eq(soulCircleLinks.status, "active"),
        or(eq(soulCircleLinks.userLowId, userId), eq(soulCircleLinks.userHighId, userId)),
      ))
      .orderBy(soulCircleLinks.createdAt);
  }
  async listSoulCircleBlockedByUser(userId: string) {
    const db = await this.db();
    return db.select().from(soulCircleLinks)
      .where(and(eq(soulCircleLinks.status, "blocked"), eq(soulCircleLinks.blockedByUserId, userId)));
  }
  private async dropSoulCircleSharesBetween(tx: any, a: string, b: string) {
    await tx.delete(soulCircleShares).where(or(
      and(eq(soulCircleShares.ownerUserId, a), eq(soulCircleShares.friendUserId, b)),
      and(eq(soulCircleShares.ownerUserId, b), eq(soulCircleShares.friendUserId, a)),
    ));
  }
  async removeSoulCircleLink(linkId: string) {
    const db = await this.db();
    await db.transaction(async (tx) => {
      // Lock the link row so an in-flight consent write must wait and then see it gone.
      const link = (await tx.select().from(soulCircleLinks).where(eq(soulCircleLinks.id, linkId)).limit(1).for("update"))[0];
      if (!link) return;
      await this.dropSoulCircleSharesBetween(tx, link.userLowId, link.userHighId);
      await tx.delete(soulCircleEvents).where(eq(soulCircleEvents.linkId, linkId));
      await tx.delete(soulCircleLinks).where(eq(soulCircleLinks.id, linkId));
    });
  }
  async blockSoulCircleLink(linkId: string, blockedByUserId: string) {
    const db = await this.db();
    return db.transaction(async (tx) => {
      const link = (await tx.select().from(soulCircleLinks).where(eq(soulCircleLinks.id, linkId)).limit(1).for("update"))[0];
      if (!link) return undefined;
      await this.dropSoulCircleSharesBetween(tx, link.userLowId, link.userHighId);
      await tx.delete(soulCircleEvents).where(eq(soulCircleEvents.linkId, linkId));
      return (await tx.update(soulCircleLinks)
        .set({ status: "blocked", blockedByUserId, updatedAt: new Date() })
        .where(eq(soulCircleLinks.id, linkId)).returning())[0];
    });
  }
  async upsertSoulCircleShareForLink(linkId: string, ownerUserId: string, selection: unknown, expiresAt: Date): Promise<SoulCircleShare | undefined> {
    const db = await this.db();
    return db.transaction(async (tx) => {
      // Same row lock as removal/blocking: whichever commits first wins, and a share can
      // never be written for a link that was removed after the caller was authorized.
      const link = (await tx.select().from(soulCircleLinks).where(eq(soulCircleLinks.id, linkId)).limit(1).for("update"))[0];
      if (!link || link.status !== "active") return undefined;
      const friendUserId = soulCircleOtherUser(link, ownerUserId);
      if (!friendUserId) return undefined;
      const now = new Date();
      return (await tx.insert(soulCircleShares)
        .values({ ownerUserId, friendUserId, selection, expiresAt, updatedAt: now })
        .onConflictDoUpdate({
          target: [soulCircleShares.ownerUserId, soulCircleShares.friendUserId],
          set: { selection, expiresAt, updatedAt: now, revokedAt: null },
        }).returning())[0];
    });
  }
  async getSoulCircleShare(ownerUserId: string, friendUserId: string) {
    const db = await this.db();
    return (await db.select().from(soulCircleShares)
      .where(and(eq(soulCircleShares.ownerUserId, ownerUserId), eq(soulCircleShares.friendUserId, friendUserId))).limit(1))[0];
  }
  async listSoulCircleSharesTo(friendUserId: string) {
    const db = await this.db();
    return db.select().from(soulCircleShares).where(eq(soulCircleShares.friendUserId, friendUserId));
  }
  async listSoulCircleSharesFrom(ownerUserId: string) {
    const db = await this.db();
    return db.select().from(soulCircleShares).where(eq(soulCircleShares.ownerUserId, ownerUserId));
  }
  async revokeSoulCircleShare(ownerUserId: string, friendUserId: string, now: Date) {
    const db = await this.db();
    const existing = await this.getSoulCircleShare(ownerUserId, friendUserId);
    if (!existing) return undefined;
    if (existing.revokedAt) return existing;
    return (await db.update(soulCircleShares).set({ revokedAt: now, updatedAt: now })
      .where(eq(soulCircleShares.id, existing.id)).returning())[0];
  }
  private async insertSoulCircleEvent(tx: any, userId: string, kind: string, linkId: string, now: Date): Promise<SoulCircleEvent | undefined> {
    // One unread event per kind and friendship: repeated actions do not stack up.
    const duplicate = (await tx.select({ id: soulCircleEvents.id }).from(soulCircleEvents)
      .where(and(eq(soulCircleEvents.userId, userId), eq(soulCircleEvents.kind, kind), eq(soulCircleEvents.linkId, linkId), isNull(soulCircleEvents.readAt))).limit(1))[0];
    if (duplicate) return undefined;
    const created = (await tx.insert(soulCircleEvents).values({ userId, kind, linkId, createdAt: now }).returning())[0] as SoulCircleEvent;
    const keep = await tx.select({ id: soulCircleEvents.id }).from(soulCircleEvents)
      .where(eq(soulCircleEvents.userId, userId)).orderBy(desc(soulCircleEvents.createdAt)).limit(SOUL_CIRCLE_MAX_EVENTS_PER_USER);
    if (keep.length >= SOUL_CIRCLE_MAX_EVENTS_PER_USER) {
      await tx.delete(soulCircleEvents).where(and(
        eq(soulCircleEvents.userId, userId),
        notInArray(soulCircleEvents.id, keep.map((row: { id: string }) => row.id)),
      ));
    }
    return created;
  }
  async createSoulCircleEvent(userId: string, kind: string, linkId: string, now: Date) {
    const db = await this.db();
    return db.transaction((tx) => this.insertSoulCircleEvent(tx, userId, kind, linkId, now));
  }
  async listSoulCircleEvents(userId: string, limit: number) {
    const db = await this.db();
    return db.select().from(soulCircleEvents).where(eq(soulCircleEvents.userId, userId))
      .orderBy(desc(soulCircleEvents.createdAt)).limit(limit);
  }
  async markSoulCircleEventsRead(userId: string, ids: string[] | "all", now: Date) {
    const db = await this.db();
    if (ids !== "all" && ids.length === 0) return 0;
    const rows = await db.update(soulCircleEvents).set({ readAt: now })
      .where(and(
        eq(soulCircleEvents.userId, userId),
        isNull(soulCircleEvents.readAt),
        ids === "all" ? undefined : inArray(soulCircleEvents.id, ids),
      )).returning({ id: soulCircleEvents.id });
    return rows.length;
  }
  async deleteSoulCircleDataForUser(userId: string) {
    const db = await this.db();
    await db.transaction(async (tx) => {
      const linkRows = await tx.select({ id: soulCircleLinks.id }).from(soulCircleLinks)
        .where(or(eq(soulCircleLinks.userLowId, userId), eq(soulCircleLinks.userHighId, userId)));
      const linkIds = linkRows.map((row) => row.id);
      await tx.delete(soulCircleEvents).where(linkIds.length
        ? or(eq(soulCircleEvents.userId, userId), inArray(soulCircleEvents.linkId, linkIds))
        : eq(soulCircleEvents.userId, userId));
      await tx.delete(soulCircleShares).where(or(eq(soulCircleShares.ownerUserId, userId), eq(soulCircleShares.friendUserId, userId)));
      await tx.delete(soulCircleLinks).where(or(eq(soulCircleLinks.userLowId, userId), eq(soulCircleLinks.userHighId, userId)));
      await tx.delete(soulCircleInvites).where(or(eq(soulCircleInvites.inviterUserId, userId), eq(soulCircleInvites.acceptedByUserId, userId)));
    });
  }
  async deleteSessionData(sessionId: string): Promise<void> {
    const db = await this.db();
    const ownedProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.sessionId, sessionId));
    const ids = ownedProfiles.map((row) => row.id);
    if (ids.length) {
      await db.delete(assessmentResponses).where(inArray(assessmentResponses.profileId, ids));
      await db.delete(publicProfileShares).where(inArray(publicProfileShares.profileId, ids));
      await db.delete(galacticCodeRecords).where(inArray(galacticCodeRecords.profileId, ids));
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
      await db.delete(galacticCodeRecords).where(inArray(galacticCodeRecords.profileId, ids));
    }
    await this.deleteSoulCircleDataForUser(userId);
    await db.delete(accessCodeRedemptions).where(eq(accessCodeRedemptions.userId, userId));
    await db.delete(profiles).where(eq(profiles.userId, userId));
    await db.delete(localUsers).where(eq(localUsers.id, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
}

const usePostgres = Boolean(process.env.DATABASE_URL) && process.env.DEMO_MODE !== "true";
export const storage: IStorage = usePostgres ? new PostgresStorage() : new MemStorage();
console.log(`[ServerStorage] Using ${usePostgres ? "PostgresStorage" : "MemStorage"}`);

import { type User, type InsertUser, type Profile, type InsertProfile, type Assessment, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private assessments: Map<string, Assessment>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.assessments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
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
    };
    this.users.set(user.id, user);
    return user;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const now = new Date();
    const profile: Profile = {
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
    };
    this.profiles.set(profile.id, profile);
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
      updatedAt: new Date(),
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
    const assessment: Assessment = {
      ...insertAssessment,
      id: randomUUID(),
      createdAt: new Date(),
      calculatedType: insertAssessment.calculatedType ?? null,
    };
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }
}

export const storage = new MemStorage();

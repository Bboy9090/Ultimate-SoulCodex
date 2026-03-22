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
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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
    const id = randomUUID();
    const now = new Date();
    const profile: Profile = { 
      ...insertProfile, 
      id, 
      createdAt: now,
      updatedAt: now,
      userId: insertProfile.userId || null,
      astrologyData: insertProfile.astrologyData || null,
      numerologyData: insertProfile.numerologyData || null,
      personalityData: insertProfile.personalityData || null,
      archetypeData: insertProfile.archetypeData || null,
      biography: insertProfile.biography || null,
      dailyGuidance: insertProfile.dailyGuidance || null
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
}

export const storage = new MemStorage();

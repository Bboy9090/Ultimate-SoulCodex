/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - SHAREABLE PROFILE LINKS
 * Create secure, privacy-controlled shareable links for profiles
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { randomUUID } from 'crypto';
import type { IStorage } from '../storage';
import type { Profile } from '../shared/schema';

export interface ShareableLink {
  id: string;
  profileId: string;
  userId: string;
  token: string;
  url: string;
  settings: ShareSettings;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessedAt?: Date;
  isActive: boolean;
}

export interface ShareSettings {
  includeFullProfile: boolean;
  includeSections: string[]; // Which sections to include
  includePersonalInfo: boolean; // Name, birth date, etc.
  includeCompatibility: boolean;
  includeTransits: boolean;
  includeJournal: boolean;
  passwordProtected: boolean;
  passwordHash?: string;
  allowComments: boolean;
  viewCountLimit?: number;
  expiresInDays?: number;
}

export interface ShareableProfileView {
  profile: Partial<Profile>;
  sharedBy: string; // User name or "Anonymous"
  shareDate: Date;
  settings: ShareSettings;
}

/**
 * Create a shareable link for a profile
 */
export async function createShareableLink(
  storage: IStorage,
  profileId: string,
  userId: string,
  settings: Partial<ShareSettings> = {}
): Promise<ShareableLink> {
  const token = generateSecureToken();
  const linkId = randomUUID();
  
  const defaultSettings: ShareSettings = {
    includeFullProfile: true,
    includeSections: ['astrology', 'numerology', 'archetype'],
    includePersonalInfo: true,
    includeCompatibility: false,
    includeTransits: false,
    includeJournal: false,
    passwordProtected: false,
    allowComments: false
  };

  const finalSettings: ShareSettings = {
    ...defaultSettings,
    ...settings
  };

  // Set expiration if specified
  let expiresAt: Date | undefined;
  if (finalSettings.expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + finalSettings.expiresInDays);
  }

  const shareableLink: ShareableLink = {
    id: linkId,
    profileId,
    userId,
    token,
    url: `${process.env.APP_URL || 'https://soulcodex.app'}/share/${token}`,
    settings: finalSettings,
    createdAt: new Date(),
    expiresAt,
    accessCount: 0,
    isActive: true
  };

  // Save to storage (you'll need to add this method to storage)
  await storage.createShareableLink(shareableLink);

  return shareableLink;
}

/**
 * Get profile data for a shareable link
 */
export async function getShareableProfile(
  storage: IStorage,
  token: string,
  password?: string
): Promise<ShareableProfileView | null> {
  const link = await storage.getShareableLinkByToken(token);
  
  if (!link || !link.isActive) {
    return null;
  }

  // Check expiration
  if (link.expiresAt && new Date() > link.expiresAt) {
    return null;
  }

  // Check view count limit
  if (link.settings.viewCountLimit && link.accessCount >= link.settings.viewCountLimit) {
    return null;
  }

  // Check password
  if (link.settings.passwordProtected) {
    if (!password) {
      throw new Error('Password required');
    }
    // In production, use proper password hashing
    if (link.settings.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid password');
    }
  }

  // Get profile
  const profile = await storage.getProfile(link.profileId);
  if (!profile) {
    return null;
  }

  // Get user info
  const user = await storage.getUser(link.userId);
  const sharedBy = user?.name || profile.name || 'Anonymous';

  // Filter profile data based on settings
  const filteredProfile = filterProfileForSharing(profile, link.settings);

  // Update access count
  link.accessCount++;
  link.lastAccessedAt = new Date();
  await storage.updateShareableLink(link.id, {
    accessCount: link.accessCount,
    lastAccessedAt: link.lastAccessedAt
  });

  return {
    profile: filteredProfile,
    sharedBy,
    shareDate: link.createdAt,
    settings: link.settings
  };
}

/**
 * Filter profile data based on share settings
 */
function filterProfileForSharing(profile: Profile, settings: ShareSettings): Partial<Profile> {
  const filtered: Partial<Profile> = {};

  // Include personal info only if allowed
  if (settings.includePersonalInfo) {
    filtered.name = profile.name;
    filtered.birthDate = profile.birthDate;
    filtered.birthLocation = settings.includeFullProfile ? profile.birthLocation : undefined;
  } else {
    filtered.name = 'Shared Profile';
  }

  // Include sections based on settings
  if (settings.includeSections.includes('astrology')) {
    filtered.astrologyData = profile.astrologyData;
  }

  if (settings.includeSections.includes('numerology')) {
    filtered.numerologyData = profile.numerologyData;
  }

  if (settings.includeSections.includes('archetype')) {
    filtered.archetypeData = profile.archetypeData;
  }

  if (settings.includeSections.includes('elemental')) {
    (filtered as any).elementalMedicineData = (profile as any).elementalMedicineData;
  }

  if (settings.includeSections.includes('moral-compass')) {
    (filtered as any).moralCompassData = (profile as any).moralCompassData;
  }

  if (settings.includeSections.includes('parental')) {
    (filtered as any).parentalInfluenceData = (profile as any).parentalInfluenceData;
  }

  if (settings.includeFullProfile) {
    filtered.humanDesignData = profile.humanDesignData;
    filtered.biography = profile.biography;
    filtered.dailyGuidance = profile.dailyGuidance;
  }

  // Never include sensitive data
  delete (filtered as any).userId;
  delete (filtered as any).sessionId;
  delete (filtered as any).latitude;
  delete (filtered as any).longitude;
  delete (filtered as any).timezone;
  delete (filtered as any).birthTime; // Unless explicitly allowed

  return filtered;
}

/**
 * Generate secure token
 */
function generateSecureToken(): string {
  // Generate a secure random token
  return randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '').substring(0, 16);
}

/**
 * Hash password (simplified - use proper hashing in production)
 */
function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  // This is a placeholder
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Update shareable link settings
 */
export async function updateShareableLink(
  storage: IStorage,
  linkId: string,
  settings: Partial<ShareSettings>
): Promise<ShareableLink> {
  const link = await storage.getShareableLink(linkId);
  if (!link) {
    throw new Error('Shareable link not found');
  }

  const updatedSettings: ShareSettings = {
    ...link.settings,
    ...settings
  };

  // Recalculate expiration if needed
  let expiresAt = link.expiresAt;
  if (settings.expiresInDays !== undefined) {
    if (settings.expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + settings.expiresInDays);
    } else {
      expiresAt = undefined;
    }
  }

  const updated: Partial<ShareableLink> = {
    settings: updatedSettings,
    expiresAt
  };

  await storage.updateShareableLink(linkId, updated);

  return {
    ...link,
    ...updated,
    settings: updatedSettings,
    expiresAt
  } as ShareableLink;
}

/**
 * Deactivate a shareable link
 */
export async function deactivateShareableLink(
  storage: IStorage,
  linkId: string
): Promise<void> {
  await storage.updateShareableLink(linkId, { isActive: false });
}

/**
 * Get all shareable links for a user
 */
export async function getUserShareableLinks(
  storage: IStorage,
  userId: string
): Promise<ShareableLink[]> {
  return await storage.getShareableLinksByUser(userId);
}

export default {
  createShareableLink,
  getShareableProfile,
  updateShareableLink,
  deactivateShareableLink,
  getUserShareableLinks
};

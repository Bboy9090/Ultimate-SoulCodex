/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - SHAREABLE PROFILE LINKS
 * Create secure, privacy-controlled shareable links for profiles
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
/**
 * Create a shareable link for a profile
 */
export async function createShareableLink(storage, profileId, userId, settings = {}) {
    const token = generateSecureToken();
    const linkId = randomUUID();
    const defaultSettings = {
        includeFullProfile: true,
        includeSections: ['astrology', 'numerology', 'archetype'],
        includePersonalInfo: true,
        includeCompatibility: false,
        includeTransits: false,
        includeJournal: false,
        passwordProtected: false,
        allowComments: false
    };
    const finalSettings = {
        ...defaultSettings,
        ...settings
    };
    // Set expiration if specified
    let expiresAt;
    if (finalSettings.expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + finalSettings.expiresInDays);
    }
    const shareableLink = {
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
export async function getShareableProfile(storage, token, password) {
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
        // Use argon2 for proper password hashing
        if (!await argon2.verify(link.settings.passwordHash, password)) {
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
function filterProfileForSharing(profile, settings) {
    const filtered = {};
    // Include personal info only if allowed
    if (settings.includePersonalInfo) {
        filtered.name = profile.name;
        filtered.birthDate = profile.birthDate;
        filtered.birthLocation = settings.includeFullProfile ? profile.birthLocation : undefined;
    }
    else {
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
        filtered.elementalMedicineData = profile.elementalMedicineData;
    }
    if (settings.includeSections.includes('moral-compass')) {
        filtered.moralCompassData = profile.moralCompassData;
    }
    if (settings.includeSections.includes('parental')) {
        filtered.parentalInfluenceData = profile.parentalInfluenceData;
    }
    if (settings.includeFullProfile) {
        filtered.humanDesignData = profile.humanDesignData;
        filtered.biography = profile.biography;
        filtered.dailyGuidance = profile.dailyGuidance;
    }
    // Never include sensitive data
    delete filtered.userId;
    delete filtered.sessionId;
    delete filtered.latitude;
    delete filtered.longitude;
    delete filtered.timezone;
    delete filtered.birthTime; // Unless explicitly allowed
    return filtered;
}
/**
 * Generate secure token
 */
function generateSecureToken() {
    // Generate a secure random token
    return randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '').substring(0, 16);
}
/**
 * Hash password (to be used when creating a shareable link with a password)
 */
export async function hashPassword(password) {
    return await argon2.hash(password);
}
/**
 * Update shareable link settings
 */
export async function updateShareableLink(storage, linkId, settings) {
    const link = await storage.getShareableLink(linkId);
    if (!link) {
        throw new Error('Shareable link not found');
    }
    const updatedSettings = {
        ...link.settings,
        ...settings
    };
    // Recalculate expiration if needed
    let expiresAt = link.expiresAt;
    if (settings.expiresInDays !== undefined) {
        if (settings.expiresInDays > 0) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + settings.expiresInDays);
        }
        else {
            expiresAt = undefined;
        }
    }
    const updated = {
        settings: updatedSettings,
        expiresAt
    };
    await storage.updateShareableLink(linkId, updated);
    return {
        ...link,
        ...updated,
        settings: updatedSettings,
        expiresAt
    };
}
/**
 * Deactivate a shareable link
 */
export async function deactivateShareableLink(storage, linkId) {
    await storage.updateShareableLink(linkId, { isActive: false });
}
/**
 * Get all shareable links for a user
 */
export async function getUserShareableLinks(storage, userId) {
    return await storage.getShareableLinksByUser(userId);
}
export default {
    createShareableLink,
    getShareableProfile,
    updateShareableLink,
    deactivateShareableLink,
    getUserShareableLinks
};

import { randomUUID } from "crypto";
export class MemStorage {
    users;
    localUsers;
    profiles;
    persons;
    assessments;
    accessCodes;
    dailyInsights;
    compatibilities;
    pushSubscriptions;
    frequencyLogs;
    webhookEvents;
    passwordResetTokens;
    journalEntries;
    shareableLinks;
    transitNotifications;
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
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByStripeCustomerId(stripeCustomerId) {
        for (const user of this.users.values()) {
            if (user.stripeCustomerId === stripeCustomerId) {
                return user;
            }
        }
        return undefined;
    }
    async upsertUser(userData) {
        const existingUser = this.users.get(userData.id);
        if (existingUser) {
            const updatedUser = {
                ...existingUser,
                ...userData,
                updatedAt: new Date(),
            };
            this.users.set(userData.id, updatedUser);
            return updatedUser;
        }
        else {
            const newUser = {
                id: userData.id,
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
    async getLocalUserByEmail(email) {
        return Array.from(this.localUsers.values()).find((user) => user.email.toLowerCase() === email.toLowerCase());
    }
    async createLocalUser(userId, email, passwordHash) {
        const now = new Date();
        const localUser = {
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
    async updateLocalUserLastLogin(id) {
        const localUser = this.localUsers.get(id);
        if (localUser) {
            const updated = {
                ...localUser,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
            };
            this.localUsers.set(id, updated);
        }
    }
    async getProfile(id) {
        return this.profiles.get(id);
    }
    async getProfileByUserId(userId) {
        return Array.from(this.profiles.values()).find((profile) => profile.userId === userId);
    }
    async getProfileBySessionId(sessionId) {
        return Array.from(this.profiles.values()).find((profile) => profile.sessionId === sessionId);
    }
    async getAllProfiles() {
        return Array.from(this.profiles.values());
    }
    async createProfile(insertProfile) {
        const id = randomUUID();
        const now = new Date();
        const profile = {
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
    async updateProfile(id, updates) {
        const existing = this.profiles.get(id);
        if (!existing) {
            throw new Error("schema.Profile not found");
        }
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };
        this.profiles.set(id, updated);
        return updated;
    }
    async getAssessment(profileId, type) {
        return Array.from(this.assessments.values()).find((assessment) => assessment.profileId === profileId && assessment.assessmentType === type);
    }
    async createAssessment(insertAssessment) {
        const id = randomUUID();
        const assessment = {
            ...insertAssessment,
            id,
            createdAt: new Date(),
            calculatedType: insertAssessment.calculatedType || null
        };
        this.assessments.set(id, assessment);
        return assessment;
    }
    async getAccessCode(code) {
        // Case-insensitive lookup
        const normalizedCode = code.toLowerCase();
        return Array.from(this.accessCodes.values()).find((accessCode) => accessCode.code.toLowerCase() === normalizedCode);
    }
    async createAccessCode(insertAccessCode) {
        const maxUses = insertAccessCode.maxUses || 1;
        if (maxUses < 1) {
            throw new Error("maxUses must be at least 1");
        }
        if (insertAccessCode.expiresAt && insertAccessCode.expiresAt < new Date()) {
            throw new Error("expiresAt must be in the future");
        }
        const id = randomUUID();
        const now = new Date();
        const accessCode = {
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
    async updateAccessCode(id, updates) {
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
        const updated = {
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
    async getAllAccessCodes() {
        return Array.from(this.accessCodes.values());
    }
    async incrementAccessCodeUse(code) {
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
        const updated = {
            ...accessCode,
            usesCount: accessCode.usesCount + 1,
            updatedAt: new Date()
        };
        this.accessCodes.set(accessCode.id, updated);
        return updated;
    }
    async getAccessCodeRedemptions(_params) {
        throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
    }
    async createAccessCodeRedemptionWithIncrement(_params) {
        throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
    }
    async getActiveAccessCodesForUser(_params) {
        throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
    }
    async migrateAccessCodeRedemptions(_sessionId, _userId) {
        throw new Error("MemStorage deprecated - use DbStorage for access code redemptions");
    }
    async getDailyInsight(profileId, date) {
        return Array.from(this.dailyInsights.values()).find((insight) => insight.profileId === profileId && insight.date === date);
    }
    async createDailyInsight(insertInsight) {
        const id = randomUUID();
        const insight = {
            ...insertInsight,
            id,
            createdAt: new Date(),
        };
        this.dailyInsights.set(id, insight);
        return insight;
    }
    async getRecentTemplateIds(profileId, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        const recentInsights = Array.from(this.dailyInsights.values())
            .filter(insight => insight.profileId === profileId && insight.date >= cutoffDateStr)
            .sort((a, b) => b.date.localeCompare(a.date));
        const allTemplateIds = [];
        recentInsights.forEach(insight => {
            const ids = insight.templateIds;
            if (Array.isArray(ids)) {
                allTemplateIds.push(...ids);
            }
        });
        return Array.from(new Set(allTemplateIds));
    }
    async getCompatibility(profile1Id, profile2Id) {
        return Array.from(this.compatibilities.values()).find((comp) => (comp.profile1Id === profile1Id && comp.profile2Id === profile2Id) ||
            (comp.profile1Id === profile2Id && comp.profile2Id === profile1Id));
    }
    async createCompatibility(insertCompatibility) {
        const id = randomUUID();
        const now = new Date();
        const compatibility = {
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
    async getProfileCompatibilities(profileId) {
        return Array.from(this.compatibilities.values()).filter((comp) => comp.profile1Id === profileId || comp.profile2Id === profileId);
    }
    async getPerson(id) {
        return this.persons.get(id);
    }
    async getPersonsByUserId(userId) {
        return Array.from(this.persons.values()).filter((person) => person.userId === userId);
    }
    async getPersonsBySessionId(sessionId) {
        return Array.from(this.persons.values()).filter((person) => person.sessionId === sessionId && !person.userId);
    }
    async migratePersonsFromSessionToUser(sessionId, userId) {
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
    async migrateSoulProfileFromSessionToUser(sessionId, userId) {
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
    async createPerson(insertPerson) {
        const id = randomUUID();
        const now = new Date();
        const person = {
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
    async updatePerson(id, updates) {
        const existing = this.persons.get(id);
        if (!existing) {
            throw new Error("schema.Person not found");
        }
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };
        this.persons.set(id, updated);
        return updated;
    }
    async deletePerson(id) {
        this.persons.delete(id);
    }
    async getPushSubscription(endpoint) {
        return Array.from(this.pushSubscriptions.values()).find((sub) => sub.endpoint === endpoint);
    }
    async getPushSubscriptionsByUser(userId) {
        return Array.from(this.pushSubscriptions.values()).filter((sub) => sub.userId === userId && sub.isActive);
    }
    async getPushSubscriptionsBySession(sessionId) {
        return Array.from(this.pushSubscriptions.values()).filter((sub) => sub.sessionId === sessionId && sub.isActive);
    }
    async getAllPushSubscriptions() {
        return Array.from(this.pushSubscriptions.values());
    }
    async createPushSubscription(insertSubscription) {
        const id = randomUUID();
        const now = new Date();
        const subscription = {
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
    async updatePushSubscription(id, updates) {
        const existing = this.pushSubscriptions.get(id);
        if (!existing) {
            throw new Error("Push subscription not found");
        }
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };
        this.pushSubscriptions.set(id, updated);
        return updated;
    }
    async deletePushSubscription(endpoint) {
        const subscription = await this.getPushSubscription(endpoint);
        if (subscription) {
            this.pushSubscriptions.delete(subscription.id);
        }
    }
    async createFrequencyLog(insertLog) {
        const id = randomUUID();
        const now = new Date();
        const log = {
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
    async getFrequencyLogsByUser(userId) {
        return Array.from(this.frequencyLogs.values())
            .filter(log => log.userId === userId)
            .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
    }
    async getFrequencyLogsBySession(sessionId) {
        return Array.from(this.frequencyLogs.values())
            .filter(log => log.sessionId === sessionId)
            .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
    }
    async getFrequencyLogsInRange(userId, sessionId, startDate, endDate) {
        return Array.from(this.frequencyLogs.values())
            .filter(log => {
            const matchesUser = userId ? log.userId === userId : log.sessionId === sessionId;
            const inRange = log.loggedAt >= startDate && log.loggedAt <= endDate;
            return matchesUser && inRange;
        })
            .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
    }
    // Password reset operations (MemStorage implementation)
    async createPasswordResetToken(userId, token, expiresAt) {
        // In-memory storage for password reset tokens
        this.passwordResetTokens.set(token, {
            id: token,
            userId,
            expiresAt,
            usedAt: null
        });
    }
    async getPasswordResetToken(token) {
        const resetToken = this.passwordResetTokens.get(token);
        if (!resetToken)
            return undefined;
        // Check if expired
        if (new Date() > resetToken.expiresAt) {
            this.passwordResetTokens.delete(token);
            return undefined;
        }
        return resetToken;
    }
    async markPasswordResetTokenUsed(token) {
        const resetToken = this.passwordResetTokens.get(token);
        if (resetToken) {
            resetToken.usedAt = new Date();
            this.passwordResetTokens.set(token, resetToken);
        }
    }
    async updateLocalUserPassword(userId, newPasswordHash) {
        const localUser = Array.from(this.localUsers.values()).find(u => u.id === userId);
        if (localUser) {
            localUser.passwordHash = newPasswordHash;
            localUser.updatedAt = new Date();
            this.localUsers.set(userId, localUser);
        }
    }
    // Webhook event operations (for idempotency)
    async getWebhookEventByStripeId(stripeEventId) {
        return Array.from(this.webhookEvents.values()).find((event) => event.stripeEventId === stripeEventId);
    }
    async createWebhookEvent(eventData) {
        const id = randomUUID();
        const event = {
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
    async createJournalEntry(entryData) {
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
    async getJournalEntries(params) {
        let entries = Array.from(this.journalEntries.values()).filter(e => e.userId === params.userId);
        if (params.profileId) {
            entries = entries.filter(e => e.profileId === params.profileId);
        }
        if (params.startDate) {
            entries = entries.filter(e => new Date(e.date) >= params.startDate);
        }
        if (params.endDate) {
            entries = entries.filter(e => new Date(e.date) <= params.endDate);
        }
        // Note: category filtering would require fetching prompt data
        // For now, we'll skip category filtering at storage level
        return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    // Shareable links operations
    async createShareableLink(linkData) {
        const link = {
            ...linkData,
            createdAt: new Date(),
            accessCount: 0,
            isActive: true
        };
        this.shareableLinks.set(link.id, link);
        return link;
    }
    async getShareableLink(id) {
        return this.shareableLinks.get(id);
    }
    async getShareableLinkByToken(token) {
        return Array.from(this.shareableLinks.values()).find(link => link.token === token);
    }
    async updateShareableLink(id, updates) {
        const link = this.shareableLinks.get(id);
        if (!link) {
            throw new Error('Shareable link not found');
        }
        const updated = { ...link, ...updates, updatedAt: new Date() };
        this.shareableLinks.set(id, updated);
        return updated;
    }
    async getShareableLinksByUser(userId) {
        return Array.from(this.shareableLinks.values())
            .filter(link => link.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Transit notification operations
    async createTransitNotification(notificationData) {
        const notification = {
            ...notificationData,
            createdAt: new Date()
        };
        this.transitNotifications.set(notification.notificationId, notification);
        return notification;
    }
    async getTransitNotification(notificationId) {
        return this.transitNotifications.get(notificationId);
    }
}
class DbStorage {
    // schema.User operations
    // STUB - DbStorage is disabled for bootstrap; all methods are no-ops
    async getUser(id) {
        return undefined;
    }
    async getUserByStripeCustomerId(stripeCustomerId) {
        return undefined;
    }
    async upsertUser(userData) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    // Local authentication operations
    async getLocalUserByEmail(email) {
        return undefined;
    }
    async createLocalUser(userId, email, passwordHash) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async updateLocalUserLastLogin(id) {
        // Stub
    }
    // schema.Profile operations
    async getProfile(id) {
        return undefined;
    }
    async getProfileByUserId(userId) {
        return undefined;
    }
    async getProfileBySessionId(sessionId) {
        return undefined;
    }
    async getAllProfiles() {
        return [];
    }
    async createProfile(profile) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async updateProfile(id, updates) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    // schema.Assessment operations
    async getAssessment(profileId, type) {
        return undefined;
    }
    async createAssessment(assessment) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    // Access code operations
    async getAccessCode(code) {
        return undefined;
    }
    async createAccessCode(insertAccessCode) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async updateAccessCode(id, updates) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getAllAccessCodes() {
        return [];
    }
    async incrementAccessCodeUse(code) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getAccessCodeRedemptions(params) {
        return [];
    }
    async createAccessCodeRedemptionWithIncrement(params) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getActiveAccessCodesForUser(params) {
        return [];
    }
    async migrateAccessCodeRedemptions(sessionId, userId) {
        // Stub
    }
    // Daily insight operations
    async getDailyInsight(profileId, date) {
        return undefined;
    }
    async createDailyInsight(insight) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getRecentTemplateIds(profileId, days) {
        return [];
    }
    // schema.Person operations
    async getPerson(id) {
        return undefined;
    }
    async getPersonsByUserId(userId) {
        return [];
    }
    async getPersonsBySessionId(sessionId) {
        return [];
    }
    async migratePersonsFromSessionToUser(sessionId, userId) {
        return 0;
    }
    async migrateSoulProfileFromSessionToUser(sessionId, userId) {
        return false;
    }
    async createPerson(person) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async updatePerson(id, updates) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async deletePerson(id) {
        // Stub
    }
    // Compatibility operations
    async getCompatibility(profile1Id, profile2Id) {
        return undefined;
    }
    async createCompatibility(compatibility) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getProfileCompatibilities(profileId) {
        return [];
    }
    // Push subscription operations
    async getPushSubscription(endpoint) {
        return undefined;
    }
    async getPushSubscriptionsByUser(userId) {
        return [];
    }
    async getPushSubscriptionsBySession(sessionId) {
        return [];
    }
    async getAllPushSubscriptions() {
        return [];
    }
    async createPushSubscription(subscription) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async updatePushSubscription(id, updates) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async deletePushSubscription(endpoint) {
        // Stub
    }
    // Frequency log operations
    async createFrequencyLog(log) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getFrequencyLogsByUser(userId) {
        return [];
    }
    async getFrequencyLogsBySession(sessionId) {
        return [];
    }
    async getFrequencyLogsInRange(userId, sessionId, startDate, endDate) {
        return [];
    }
    // Password reset operations
    async createPasswordResetToken(userId, token, expiresAt) {
        // Stub
    }
    async getPasswordResetToken(token) {
        return undefined;
    }
    async markPasswordResetTokenUsed(token) {
        // Stub
    }
    async updateLocalUserPassword(userId, newPasswordHash) {
        // Stub
    }
    // Webhook event operations (for idempotency)
    async getWebhookEventByStripeId(stripeEventId) {
        return undefined;
    }
    async createWebhookEvent(eventData) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    // Journal operations
    async createJournalEntry(entryData) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getJournalEntries(params) {
        return [];
    }
    // Shareable links operations
    async createShareableLink(linkData) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getShareableLink(id) {
        return undefined;
    }
    async getShareableLinkByToken(token) {
        return undefined;
    }
    async updateShareableLink(id, updates) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getShareableLinksByUser(userId) {
        return [];
    }
    // Transit notification operations
    async createTransitNotification(notificationData) {
        throw new Error("DbStorage is disabled for bootstrap. Use MemStorage.");
    }
    async getTransitNotification(notificationId) {
        return undefined;
    }
}
// Switch to DbStorage for production-ready persistence
// Switch to MemStorage for initial deployment; swap to DbStorage when schema is in place
// export const storage = new DbStorage();
export const storage = new MemStorage();

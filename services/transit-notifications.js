/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - TRANSIT PUSH NOTIFICATIONS
 * Notify users of significant transits
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { calculateActiveTransits, extractNatalPositions } from '../transits';
import { sendToUser } from '../push-notifications';
import { storage } from '../storage';
/**
 * Check for significant transits and send notifications
 */
export async function checkAndNotifySignificantTransits(profile, userId) {
    const astrologyData = profile.astrologyData;
    const natalPlanets = extractNatalPositions(astrologyData);
    const today = new Date();
    const activeTransits = calculateActiveTransits(natalPlanets, today);
    // Filter for high-intensity transits
    const significantTransits = activeTransits.transits.filter(t => t.intensity === 'high' && shouldNotifyForTransit(t));
    if (significantTransits.length === 0) {
        return 0;
    }
    let notificationCount = 0;
    for (const transit of significantTransits) {
        // Check if we've already notified for this transit today
        const alreadyNotified = await checkIfAlreadyNotified(profile.id, userId, transit, today);
        if (alreadyNotified) {
            continue;
        }
        // Create notification payload
        const payload = createTransitNotificationPayload(transit, activeTransits.dominantTheme);
        // Send notification
        const sent = await sendToUser(userId, payload);
        if (sent > 0) {
            notificationCount += sent;
            // Record notification
            await recordTransitNotification({
                transit,
                profileId: profile.id,
                userId,
                notifiedAt: today,
                notificationId: `${profile.id}-${transit.planet}-${transit.natalPlanet}-${today.toISOString().split('T')[0]}`
            });
        }
    }
    return notificationCount;
}
/**
 * Check if we should notify for a specific transit
 */
function shouldNotifyForTransit(transit) {
    // Only notify for major aspects with tight orbs
    const majorAspects = ['Conjunction', 'Opposition', 'Square'];
    if (!majorAspects.includes(transit.aspect)) {
        return false;
    }
    // Only notify for tight orbs (within 2 degrees)
    if (transit.orb > 2) {
        return false;
    }
    // Prioritize outer planets
    const outerPlanets = ['Pluto', 'Neptune', 'Uranus', 'Saturn'];
    if (!outerPlanets.includes(transit.planet)) {
        return false;
    }
    return true;
}
/**
 * Create notification payload for a transit
 */
function createTransitNotificationPayload(transit, dominantTheme) {
    const title = getTransitNotificationTitle(transit);
    const body = getTransitNotificationBody(transit, dominantTheme);
    return {
        title,
        body,
        tag: `transit-${transit.planet}-${transit.natalPlanet}`,
        url: `/profile/transits`,
        data: {
            type: 'transit',
            planet: transit.planet,
            natalPlanet: transit.natalPlanet,
            aspect: transit.aspect,
            intensity: transit.intensity,
            theme: transit.theme
        }
    };
}
/**
 * Get notification title
 */
function getTransitNotificationTitle(transit) {
    const planetNames = {
        Pluto: '🔄 Transformation Transit',
        Neptune: '🌊 Spiritual Awakening',
        Uranus: '⚡ Revolutionary Energy',
        Saturn: '🏛️ Mastery Challenge',
        Jupiter: '✨ Expansion Opportunity'
    };
    return planetNames[transit.planet] || `${transit.planet} Transit`;
}
/**
 * Get notification body
 */
function getTransitNotificationBody(transit, dominantTheme) {
    const aspectNames = {
        Conjunction: 'aligning with',
        Opposition: 'opposing',
        Square: 'challenging',
        Trine: 'harmonizing with',
        Sextile: 'supporting'
    };
    const aspectText = aspectNames[transit.aspect] || 'aspecting';
    return `${transit.planet} is ${aspectText} your ${transit.natalPlanet}. ${transit.theme}`;
}
/**
 * Check if we've already notified for this transit today
 */
async function checkIfAlreadyNotified(profileId, userId, transit, date) {
    const notificationId = `${profileId}-${transit.planet}-${transit.natalPlanet}-${date.toISOString().split('T')[0]}`;
    // Check storage for existing notification
    // You'll need to add this method to storage
    try {
        const existing = await storage.getTransitNotification(notificationId);
        return !!existing;
    }
    catch {
        return false;
    }
}
/**
 * Record that we've sent a notification
 */
async function recordTransitNotification(notification) {
    // Save to storage
    // You'll need to add this method to storage
    try {
        await storage.createTransitNotification(notification);
    }
    catch (error) {
        console.error('Failed to record transit notification:', error);
    }
}
/**
 * Schedule daily transit checks for all premium users
 */
export async function scheduleDailyTransitChecks() {
    // Get all premium users with profiles
    const allProfiles = await storage.getAllProfiles();
    const premiumProfiles = allProfiles.filter(p => p.isPremium);
    let totalNotifications = 0;
    for (const profile of premiumProfiles) {
        if (!profile.userId)
            continue;
        try {
            const count = await checkAndNotifySignificantTransits(profile, profile.userId);
            totalNotifications += count;
        }
        catch (error) {
            console.error(`Failed to check transits for profile ${profile.id}:`, error);
        }
    }
    console.log(`[TransitNotifications] Sent ${totalNotifications} transit notifications to ${premiumProfiles.length} users`);
}
/**
 * Get upcoming transit notifications (next 7 days)
 */
export async function getUpcomingTransitNotifications(profile, days = 7) {
    const astrologyData = profile.astrologyData;
    const natalPlanets = extractNatalPositions(astrologyData);
    const today = new Date();
    const upcoming = [];
    for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + i);
        const activeTransits = calculateActiveTransits(natalPlanets, checkDate);
        const significant = activeTransits.transits.filter(t => t.intensity === 'high' && shouldNotifyForTransit(t));
        for (const transit of significant) {
            upcoming.push({
                date: checkDate,
                transit,
                notification: createTransitNotificationPayload(transit, activeTransits.dominantTheme)
            });
        }
    }
    return upcoming;
}
export default {
    checkAndNotifySignificantTransits,
    scheduleDailyTransitChecks,
    getUpcomingTransitNotifications
};

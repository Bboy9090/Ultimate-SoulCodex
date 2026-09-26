/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - TRANSIT PUSH NOTIFICATIONS
 * Notify users of significant transits
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { calculateActiveTransits, extractNatalPositions, type Transit } from '../transits';
import type { Profile } from '../shared/schema';
import { sendToUser, type PushNotificationPayload } from '../push-notifications';
import { storage } from '../storage';
import { formatInTimeZone } from 'date-fns-tz';
import { parseDateOnly, resolveCivilTimeStrict } from '@soulcodex/core';

export interface TransitNotification {
  transit: Transit;
  profileId: string;
  userId: string;
  notifiedAt: Date;
  notificationId: string;
}

const MAX_UPCOMING_NOTIFICATION_DAYS = 366;

function notificationTimezone(profile: Profile): string {
  const timezone =
    typeof (profile as any).timezone === 'string' && (profile as any).timezone.trim()
      ? (profile as any).timezone.trim()
      : 'UTC';

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date(0));
  } catch {
    throw new RangeError(`Invalid transit notification timezone: ${timezone}`);
  }
  return timezone;
}

function notificationDateKey(profile: Profile, date: Date): string {
  return formatInTimeZone(date, notificationTimezone(profile), 'yyyy-MM-dd');
}

function dateOnlyOrdinal(dateISO: string): number {
  const { year, month, day } = parseDateOnly(dateISO);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function dateOnlyFromOrdinal(ordinal: number): string {
  return new Date(ordinal * 86_400_000).toISOString().slice(0, 10);
}

function localNoonForNotification(dateISO: string, timezone: string): Date {
  const resolution = resolveCivilTimeStrict(dateISO, '12:00', timezone);
  if (resolution.status !== 'valid' || !resolution.utc) {
    throw new RangeError(
      `Transit notification local noon is ${resolution.status}: ${resolution.reason ?? 'unresolved'}`,
    );
  }
  return resolution.utc;
}

function transitNotificationId(
  profile: Profile,
  transit: Transit,
  date: Date,
): string {
  const dateKey = notificationDateKey(profile, date);
  return `${profile.id}-${transit.planet}-${transit.natalPlanet}-${transit.aspect}-${dateKey}`;
}

/**
 * Check for significant transits and send notifications
 */
export async function checkAndNotifySignificantTransits(
  profile: Profile,
  userId: string
): Promise<number> {
  const astrologyData = profile.astrologyData as any;
  const natalPlanets = extractNatalPositions(astrologyData);
  const today = new Date();
  const activeTransits = calculateActiveTransits(natalPlanets, today);

  // Filter for high-intensity transits
  const significantTransits = activeTransits.transits.filter(
    t => t.intensity === 'high' && shouldNotifyForTransit(t)
  );

  if (significantTransits.length === 0) {
    return 0;
  }

  let notificationCount = 0;

  for (const transit of significantTransits) {
    // Check if we've already notified for this transit today
    const alreadyNotified = await checkIfAlreadyNotified(profile, userId, transit, today);
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
        notificationId: transitNotificationId(profile, transit, today)
      });
    }
  }

  return notificationCount;
}

/**
 * Check if we should notify for a specific transit
 */
function shouldNotifyForTransit(transit: Transit): boolean {
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
function createTransitNotificationPayload(
  transit: Transit,
  dominantTheme: string
): PushNotificationPayload {
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
function getTransitNotificationTitle(transit: Transit): string {
  return `Transit Reflection — ${transit.planet}`;
}

/**
 * Get notification body
 */
function getTransitNotificationBody(transit: Transit, dominantTheme: string): string {
  void dominantTheme;
  return `${transit.planet} forms a ${transit.aspect.toLowerCase()} to your verified natal ${transit.natalPlanet}. ${transit.theme} Use this as a reflection prompt, not a prediction.`;
}

/**
 * Check if we've already notified for this transit today
 */
async function checkIfAlreadyNotified(
  profile: Profile,
  userId: string,
  transit: Transit,
  date: Date
): Promise<boolean> {
  void userId;
  const notificationId = transitNotificationId(profile, transit, date);
  
  try {
    const existing = await storage.getTransitNotification(notificationId);
    return !!existing;
  } catch {
    return false;
  }
}

/**
 * Record that we've sent a notification
 */
async function recordTransitNotification(notification: TransitNotification): Promise<void> {
  // Save to storage
  // You'll need to add this method to storage
  try {
    await storage.createTransitNotification(notification);
  } catch (error) {
    console.error('Failed to record transit notification:', error);
  }
}

/**
 * Schedule daily transit checks for all premium users
 */
export async function scheduleDailyTransitChecks(): Promise<void> {
  // Get all premium users with profiles
  const allProfiles = await storage.getAllProfiles();
  const premiumProfiles = allProfiles.filter(p => p.isPremium);

  let totalNotifications = 0;

  for (const profile of premiumProfiles) {
    if (!profile.userId) continue;

    try {
      const count = await checkAndNotifySignificantTransits(profile, profile.userId);
      totalNotifications += count;
    } catch (error) {
      console.error(`Failed to check transits for profile ${profile.id}:`, error);
    }
  }

  console.log(`[TransitNotifications] Sent ${totalNotifications} transit notifications to ${premiumProfiles.length} users`);
}

/**
 * Get upcoming transit notifications (next 7 days)
 */
export async function getUpcomingTransitNotifications(
  profile: Profile,
  days: number = 7
): Promise<Array<{ date: Date; transit: Transit; notification: PushNotificationPayload }>> {
  if (!Number.isInteger(days) || days < 1 || days > MAX_UPCOMING_NOTIFICATION_DAYS) {
    throw new RangeError(`Transit notification days must be 1-${MAX_UPCOMING_NOTIFICATION_DAYS}`);
  }

  const astrologyData = profile.astrologyData as any;
  const natalPlanets = extractNatalPositions(astrologyData);
  const timezone = notificationTimezone(profile);
  const todayISO = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
  const startOrdinal = dateOnlyOrdinal(todayISO);
  const upcoming: Array<{ date: Date; transit: Transit; notification: PushNotificationPayload }> = [];

  for (let i = 0; i < days; i += 1) {
    const dateISO = dateOnlyFromOrdinal(startOrdinal + i);
    const checkDate = localNoonForNotification(dateISO, timezone);
    
    const activeTransits = calculateActiveTransits(natalPlanets, checkDate);
    const significant = activeTransits.transits.filter(t => 
      t.intensity === 'high' && shouldNotifyForTransit(t)
    );

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

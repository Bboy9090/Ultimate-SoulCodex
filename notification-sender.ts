import webpush from 'web-push';
import type { PushSubscription } from '../push-notifications';
import { getNotificationTemplate, type NotificationType, type NotificationContext } from './notification-templates';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('[NotificationSender] VAPID keys not configured');
}

webpush.setVapidDetails(
  'mailto:support@soulcodex.app',
  VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY || ''
);

export interface SendNotificationOptions {
  type: NotificationType;
  context?: NotificationContext;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  ttl?: number;
}

export interface SendNotificationResult {
  success: boolean;
  expired: boolean;
}

export async function sendNotification(
  subscription: PushSubscription,
  options: SendNotificationOptions
): Promise<SendNotificationResult> {
  try {
    const template = getNotificationTemplate(options.type, options.context);
    
    const payload = JSON.stringify({
      title: template.title,
      body: template.body,
      icon: template.icon,
      badge: template.badge,
      tag: template.tag,
      requireInteraction: template.requireInteraction,
      actions: template.actions,
      data: template.data
    });

    await webpush.sendNotification(
      subscription,
      payload,
      {
        urgency: options.urgency || 'normal',
        TTL: options.ttl || 86400
      }
    );

    console.log(`[NotificationSender] Sent ${options.type} notification`);
    return { success: true, expired: false };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as any).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        console.log('[NotificationSender] Subscription expired or invalid');
        return { success: false, expired: true };
      }
    }
    console.error('[NotificationSender] Failed to send notification:', error);
    return { success: false, expired: false };
  }
}

export async function sendBulkNotifications(
  subscriptions: PushSubscription[],
  options: SendNotificationOptions,
  onExpired?: (subscription: PushSubscription) => Promise<void>
): Promise<{ sent: number; failed: number; expired: PushSubscription[] }> {
  const results = {
    sent: 0,
    failed: 0,
    expired: [] as PushSubscription[]
  };

  for (const subscription of subscriptions) {
    const result = await sendNotification(subscription, options);
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      if (result.expired) {
        results.expired.push(subscription);
        if (onExpired) {
          await onExpired(subscription);
        }
      }
    }
  }

  console.log(`[NotificationSender] Bulk send complete: ${results.sent} sent, ${results.failed} failed, ${results.expired.length} expired`);
  return results;
}

export async function sendDailyGuidanceNotification(
  subscriptions: PushSubscription[]
): Promise<void> {
  const cosmicGreetings = [
    'The universe has spoken',
    'Your cosmic guidance is ready',
    'The stars have aligned',
    'Divine wisdom awaits',
    'Your spiritual forecast is here'
  ];
  
  const randomGreeting = cosmicGreetings[Math.floor(Math.random() * cosmicGreetings.length)];
  
  await sendBulkNotifications(subscriptions, {
    type: 'daily_guidance',
    context: {
      eventDescription: randomGreeting
    },
    urgency: 'normal'
  });
}

export async function sendAppInstallPrompt(
  subscription: PushSubscription,
  isMobile: boolean = false
): Promise<SendNotificationResult> {
  return await sendNotification(subscription, {
    type: isMobile ? 'app_install_mobile' : 'app_install_web',
    urgency: 'high',
    ttl: 604800
  });
}

export async function sendCompatibilityUpdate(
  subscription: PushSubscription,
  personName: string
): Promise<SendNotificationResult> {
  return await sendNotification(subscription, {
    type: 'compatibility_update',
    context: { personName },
    urgency: 'normal'
  });
}

export async function sendAstrologicalEvent(
  subscriptions: PushSubscription[],
  eventName: string,
  eventDescription: string,
  onExpired?: (subscription: PushSubscription) => Promise<void>
): Promise<{ sent: number; failed: number; expired: PushSubscription[] }> {
  return await sendBulkNotifications(subscriptions, {
    type: 'astrological_event',
    context: { eventName, eventDescription },
    urgency: 'high'
  }, onExpired);
}

export async function sendPremiumUpsell(
  subscription: PushSubscription
): Promise<SendNotificationResult> {
  return await sendNotification(subscription, {
    type: 'premium_upsell',
    urgency: 'low',
    ttl: 604800
  });
}

export async function sendReEngagement(
  subscription: PushSubscription
): Promise<SendNotificationResult> {
  return await sendNotification(subscription, {
    type: 're_engagement',
    urgency: 'low',
    ttl: 259200
  });
}

export async function sendBirthdayNotification(
  subscription: PushSubscription
): Promise<SendNotificationResult> {
  return await sendNotification(subscription, {
    type: 'milestone_birthday',
    urgency: 'high',
    ttl: 86400
  });
}

export async function sendNewFeature(
  subscriptions: PushSubscription[],
  featureName: string,
  onExpired?: (subscription: PushSubscription) => Promise<void>
): Promise<{ sent: number; failed: number; expired: PushSubscription[] }> {
  return await sendBulkNotifications(subscriptions, {
    type: 'new_feature',
    context: { featureName },
    urgency: 'normal'
  }, onExpired);
}

export async function sendProfileCompletion(
  subscription: PushSubscription
): Promise<SendNotificationResult> {
  return await sendNotification(subscription, {
    type: 'profile_completion',
    urgency: 'low',
    ttl: 604800
  });
}

import webpush from 'web-push';
import { storage } from './storage';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@soulcodex.app';

/** Placeholder/invalid values that should trigger fallback to temp keys */
const isPlaceholder = (s: string | undefined) =>
  !s ||
  s.length < 50 ||
  /your_|_here|placeholder|changeme|example|sk-xxx|whsec_xxx/i.test(s);

const useTempKeys = isPlaceholder(VAPID_PUBLIC_KEY) || isPlaceholder(VAPID_PRIVATE_KEY);

if (useTempKeys) {
  console.warn('[PushNotifications] VAPID keys missing or invalid - using temporary keys (subscriptions break on restart)');
  const tempKeys = webpush.generateVAPIDKeys();
  webpush.setVapidDetails(VAPID_SUBJECT, tempKeys.publicKey, tempKeys.privateKey);
} else {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
  console.log('[PushNotifications] VAPID keys configured successfully');
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(
  endpoint: string,
  p256dhKey: string,
  authKey: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const subscription = {
      endpoint,
      keys: {
        p256dh: p256dhKey,
        auth: authKey,
      },
    };

    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    
    return true;
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      await storage.deletePushSubscription(endpoint);
    }
    console.error('Push notification error:', error);
    return false;
  }
}

export async function sendToUser(userId: string, payload: PushNotificationPayload): Promise<number> {
  const subscriptions = await storage.getPushSubscriptionsByUser(userId);
  let successCount = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      sub.endpoint,
      sub.p256dhKey,
      sub.authKey,
      payload
    );
    if (success) successCount++;
  }

  return successCount;
}

export async function sendToSession(sessionId: string, payload: PushNotificationPayload): Promise<number> {
  const subscriptions = await storage.getPushSubscriptionsBySession(sessionId);
  let successCount = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      sub.endpoint,
      sub.p256dhKey,
      sub.authKey,
      payload
    );
    if (success) successCount++;
  }

  return successCount;
}

let currentPublicKey = VAPID_PUBLIC_KEY;

export function getVapidPublicKey(): string {
  if (!currentPublicKey) {
    const tempKeys = webpush.generateVAPIDKeys();
    currentPublicKey = tempKeys.publicKey;
  }
  return currentPublicKey;
}

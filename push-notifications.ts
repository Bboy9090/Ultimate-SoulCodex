import webpush from 'web-push';
import { storage } from '../storage.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@soulcodex.app';

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('CRITICAL: VAPID keys not configured!');
  console.error('Push notifications will not work. Generate keys with:');
  console.error('  npm install -g web-push');
  console.error('  web-push generate-vapid-keys');
  console.error('Then add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to environment variables.');
  
  const tempKeys = webpush.generateVAPIDKeys();
  webpush.setVapidDetails(VAPID_SUBJECT, tempKeys.publicKey, tempKeys.privateKey);
  
  console.error('WARNING: Using temporary VAPID keys - subscriptions will break on restart!');
} else {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
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

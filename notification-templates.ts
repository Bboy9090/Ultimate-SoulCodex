export type NotificationType = 
  | 'daily_guidance'
  | 'app_install_web'
  | 'app_install_mobile'
  | 'compatibility_update'
  | 'astrological_event'
  | 'premium_upsell'
  | 're_engagement'
  | 'milestone_birthday'
  | 'new_feature'
  | 'profile_completion';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, any>;
}

export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  daily_guidance: {
    type: 'daily_guidance',
    title: '✨ Your Cosmic Guidance Awaits',
    body: 'Discover what the stars have aligned for you today',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'daily-guidance',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View Guidance' },
      { action: 'dismiss', title: 'Later' }
    ],
    data: { url: '/profile' }
  },

  app_install_web: {
    type: 'app_install_web',
    title: '🌟 Install Soul Codex',
    body: 'Get instant access to your cosmic guidance. Install now for a seamless experience!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'app-install',
    requireInteraction: true,
    actions: [
      { action: 'install', title: 'Install App' },
      { action: 'dismiss', title: 'Not Now' }
    ],
    data: { url: '/', action: 'install_pwa' }
  },

  app_install_mobile: {
    type: 'app_install_mobile',
    title: '📱 Get the Soul Codex App',
    body: 'Download our mobile app for the ultimate mystical experience with offline access!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'app-install-mobile',
    requireInteraction: true,
    actions: [
      { action: 'download', title: 'Download' },
      { action: 'dismiss', title: 'Maybe Later' }
    ],
    data: { url: '/', action: 'show_app_stores' }
  },

  compatibility_update: {
    type: 'compatibility_update',
    title: '💕 New Compatibility Insights',
    body: 'Discover deeper cosmic connections with {personName}',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'compatibility',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'Explore Now' },
      { action: 'dismiss', title: 'Later' }
    ],
    data: { url: '/people' }
  },

  astrological_event: {
    type: 'astrological_event',
    title: '🌙 {eventName} Alert',
    body: '{eventDescription} - Check your personalized guidance',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'astro-event',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View Impact' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { url: '/profile' }
  },

  premium_upsell: {
    type: 'premium_upsell',
    title: '👑 Unlock Your Full Cosmic Potential',
    body: 'Premium access includes deep soul analysis, daily rituals, and exclusive insights',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'premium-offer',
    requireInteraction: true,
    actions: [
      { action: 'upgrade', title: 'Go Premium' },
      { action: 'dismiss', title: 'Not Now' }
    ],
    data: { url: '/profile', action: 'show_premium' }
  },

  re_engagement: {
    type: 're_engagement',
    title: '🔮 We Miss Your Energy!',
    body: 'The cosmos has been busy. Come see what\'s changed in your spiritual landscape',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 're-engagement',
    requireInteraction: false,
    actions: [
      { action: 'return', title: 'Return to Journey' },
      { action: 'dismiss', title: 'Later' }
    ],
    data: { url: '/profile' }
  },

  milestone_birthday: {
    type: 'milestone_birthday',
    title: '🎂 Happy Solar Return!',
    body: 'It\'s your birthday! View your personalized Solar Return insights and cosmic forecast',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'birthday',
    requireInteraction: true,
    actions: [
      { action: 'celebrate', title: 'View Insights' },
      { action: 'dismiss', title: 'Later' }
    ],
    data: { url: '/profile', special: 'birthday' }
  },

  new_feature: {
    type: 'new_feature',
    title: '✨ New Mystical System Unlocked',
    body: '{featureName} is now available! Explore this powerful new dimension of your soul',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'new-feature',
    requireInteraction: false,
    actions: [
      { action: 'explore', title: 'Explore Now' },
      { action: 'dismiss', title: 'Later' }
    ],
    data: { url: '/profile' }
  },

  profile_completion: {
    type: 'profile_completion',
    title: '🌟 Complete Your Soul Profile',
    body: 'Add your birth time and location for deeper, more accurate cosmic insights',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'profile-complete',
    requireInteraction: false,
    actions: [
      { action: 'complete', title: 'Add Details' },
      { action: 'dismiss', title: 'Skip' }
    ],
    data: { url: '/input-form' }
  }
};

export interface NotificationContext {
  personName?: string;
  eventName?: string;
  eventDescription?: string;
  featureName?: string;
}

export function getNotificationTemplate(
  type: NotificationType,
  context?: NotificationContext
): NotificationTemplate {
  const template = { ...notificationTemplates[type] };
  
  // Replace template variables
  if (context) {
    if (context.personName) {
      template.body = template.body.replace('{personName}', context.personName);
    }
    if (context.eventName) {
      template.title = template.title.replace('{eventName}', context.eventName);
    }
    if (context.eventDescription) {
      template.body = template.body.replace('{eventDescription}', context.eventDescription);
    }
    if (context.featureName) {
      template.body = template.body.replace('{featureName}', context.featureName);
    }
  }
  
  return template;
}

export interface NotificationSchedule {
  type: NotificationType;
  frequency: 'daily' | 'weekly' | 'once' | 'on_event';
  time?: string;
  daysOfWeek?: number[];
  enabled: boolean;
}

export const defaultNotificationSchedules: NotificationSchedule[] = [
  {
    type: 'daily_guidance',
    frequency: 'daily',
    time: '09:00',
    enabled: true
  },
  {
    type: 'app_install_web',
    frequency: 'once',
    enabled: true
  },
  {
    type: 'profile_completion',
    frequency: 'once',
    enabled: true
  },
  {
    type: 'premium_upsell',
    frequency: 'weekly',
    daysOfWeek: [3],
    time: '19:00',
    enabled: true
  },
  {
    type: 're_engagement',
    frequency: 'on_event',
    enabled: true
  }
];

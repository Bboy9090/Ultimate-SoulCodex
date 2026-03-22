/**
 * Push notification templates for Soul Codex.
 * Each template defines the title, body, icon, and metadata for a specific notification type.
 */

export type NotificationType =
  | "daily_guidance"
  | "astrological_event"
  | "compatibility_update"
  | "app_install_mobile"
  | "app_install_web"
  | "premium_upsell"
  | "re_engagement"
  | "milestone_birthday"
  | "new_feature"
  | "profile_completion"
  | "transit_alert"
  | "weekly_digest";

export interface NotificationContext {
  eventName?: string;
  eventDescription?: string;
  personName?: string;
  featureName?: string;
  phase?: string;
  archetype?: string;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
  data?: Record<string, unknown>;
}

const ICON = "/favicon.png";
const BADGE = "/favicon.png";

export function getNotificationTemplate(
  type: NotificationType,
  context?: NotificationContext
): NotificationTemplate {
  switch (type) {
    case "daily_guidance":
      return {
        title: "✦ Your Daily Soul Guidance",
        body: context?.eventDescription
          ? `${context.eventDescription} — tap to read your cosmic forecast.`
          : "Your personalized cosmic guidance for today is ready.",
        icon: ICON,
        badge: BADGE,
        tag: "daily-guidance",
        requireInteraction: false,
        actions: [{ action: "open", title: "Read Now" }],
        data: { url: "/", type },
      };

    case "astrological_event":
      return {
        title: `🪐 ${context?.eventName ?? "Cosmic Event"}`,
        body: context?.eventDescription
          ? `${context.eventDescription} — see what it means for you.`
          : "A significant astrological event is affecting your chart.",
        icon: ICON,
        badge: BADGE,
        tag: "astrological-event",
        requireInteraction: false,
        actions: [{ action: "open", title: "See My Chart" }],
        data: { url: "/", type },
      };

    case "compatibility_update":
      return {
        title: "💫 Compatibility Update",
        body: context?.personName
          ? `New insights about your connection with ${context.personName}.`
          : "New compatibility insights are available for you.",
        icon: ICON,
        badge: BADGE,
        tag: "compatibility-update",
        requireInteraction: false,
        actions: [{ action: "open", title: "View Insights" }],
        data: { url: "/relationships", type },
      };

    case "app_install_mobile":
      return {
        title: "📱 Add Soul Codex to Your Home Screen",
        body: "Install the app for faster access to your cosmic profile and daily guidance.",
        icon: ICON,
        badge: BADGE,
        tag: "app-install",
        requireInteraction: true,
        actions: [
          { action: "install", title: "Install" },
          { action: "dismiss", title: "Not Now" },
        ],
        data: { url: "/", type },
      };

    case "app_install_web":
      return {
        title: "✨ Install Soul Codex",
        body: "Pin Soul Codex to your browser for instant access to your profile.",
        icon: ICON,
        badge: BADGE,
        tag: "app-install",
        requireInteraction: true,
        actions: [
          { action: "install", title: "Install" },
          { action: "dismiss", title: "Maybe Later" },
        ],
        data: { url: "/", type },
      };

    case "premium_upsell":
      return {
        title: "⭐ Unlock Your Full Soul Codex",
        body: "Access unlimited AI readings, your full chart wheel, and poster generation.",
        icon: ICON,
        badge: BADGE,
        tag: "premium-upsell",
        requireInteraction: false,
        actions: [{ action: "upgrade", title: "Upgrade Now" }],
        data: { url: "/upgrade", type },
      };

    case "re_engagement":
      return {
        title: "🌙 Your Soul Codex Awaits",
        body: "The stars have moved since your last visit. See what's changed in your cosmic profile.",
        icon: ICON,
        badge: BADGE,
        tag: "re-engagement",
        requireInteraction: false,
        actions: [{ action: "open", title: "Return" }],
        data: { url: "/", type },
      };

    case "milestone_birthday":
      return {
        title: "🎂 Happy Birthday from the Universe",
        body: "Your solar return is here — a new cosmic cycle begins today. See your birthday reading.",
        icon: ICON,
        badge: BADGE,
        tag: "birthday",
        requireInteraction: false,
        actions: [{ action: "open", title: "Read My Year" }],
        data: { url: "/reading", type },
      };

    case "new_feature":
      return {
        title: `✦ New: ${context?.featureName ?? "Feature"}`,
        body: context?.featureName
          ? `${context.featureName} is now available in your Soul Codex.`
          : "A new feature has been added to your Soul Codex experience.",
        icon: ICON,
        badge: BADGE,
        tag: "new-feature",
        requireInteraction: false,
        actions: [{ action: "open", title: "Explore" }],
        data: { url: "/", type },
      };

    case "profile_completion":
      return {
        title: "✦ Complete Your Soul Profile",
        body: "Add your birth details to unlock your full cosmic reading — it only takes a minute.",
        icon: ICON,
        badge: BADGE,
        tag: "profile-completion",
        requireInteraction: false,
        actions: [{ action: "open", title: "Complete Profile" }],
        data: { url: "/onboarding", type },
      };

    case "transit_alert":
      return {
        title: `⚡ ${context?.eventName ?? "Transit Alert"}`,
        body: context?.eventDescription
          ? context.eventDescription
          : "A significant transit is affecting your personal chart right now.",
        icon: ICON,
        badge: BADGE,
        tag: "transit-alert",
        requireInteraction: false,
        actions: [{ action: "open", title: "View Transit" }],
        data: { url: "/", type },
      };

    case "weekly_digest":
      return {
        title: "📅 Your Weekly Soul Digest",
        body: "Your cosmic overview for the week ahead is ready — transits, themes, and guidance.",
        icon: ICON,
        badge: BADGE,
        tag: "weekly-digest",
        requireInteraction: false,
        actions: [{ action: "open", title: "Read Digest" }],
        data: { url: "/", type },
      };

    default:
      return {
        title: "✦ Soul Codex",
        body: "You have a new update from Soul Codex.",
        icon: ICON,
        badge: BADGE,
        tag: "general",
        requireInteraction: false,
        data: { url: "/", type },
      };
  }
}

import { z } from "zod";

export const NotificationTypeEnum = z.enum([
  "daily_guidance",
  "astrological_event",
  "compatibility_update",
  "app_install_mobile",
  "app_install_web",
  "premium_upsell",
  "re_engagement",
  "milestone_birthday",
  "new_feature",
  "profile_completion",
  "transit_alert",
  "weekly_digest"
]);

export const sendTestNotificationSchema = z.object({
  type: NotificationTypeEnum.default("daily_guidance"),
  context: z.record(z.any()).optional(),
});

export const broadcastNotificationSchema = z.object({
  type: NotificationTypeEnum.default("astrological_event"),
  context: z.record(z.any()).optional(),
  targetUsers: z.array(z.string()).optional(),
});

import { z } from "zod";

export const sendTestNotificationSchema = z.object({
  type: z.string().default("test"),
  context: z.record(z.any()).optional(),
});

export const broadcastNotificationSchema = z.object({
  type: z.string().default("broadcast"),
  context: z.record(z.any()).optional(),
  targetUsers: z.array(z.string()).optional(),
});

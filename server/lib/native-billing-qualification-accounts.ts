import { z } from "zod";

/**
 * An explicit, production-side account allowlist is required for native
 * sandbox purchase qualification. The qualification request marker is not
 * authentication and cannot authorize access to the sandbox path by itself.
 *
 * Keep test-account UUIDs in protected runtime configuration, never in source.
 */
const qualificationAccountsSchema = z.array(z.string().uuid())
  .min(1)
  .max(20)
  .refine((ids) => new Set(ids).size === ids.length);

export function nativeBillingQualificationAccountAllowed(
  userId: unknown,
  raw = process.env.SOUL_CODEX_BILLING_QUALIFICATION_USER_IDS,
): boolean {
  if (typeof userId !== "string" || !z.string().uuid().safeParse(userId).success) {
    return false;
  }
  if (!raw || raw.length > 4096) return false;
  try {
    const parsed = qualificationAccountsSchema.safeParse(JSON.parse(raw));
    return parsed.success && parsed.data.includes(userId);
  } catch {
    return false;
  }
}

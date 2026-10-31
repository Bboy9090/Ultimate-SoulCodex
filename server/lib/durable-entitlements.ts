import { z } from "zod";
import type { IStorage } from "../storage";
import type { EntitlementGrant } from "@shared/schema";
import type { SoulCodexTier } from "@shared/product-access";

export const SOUL_CODEX_PLUS_CAPABILITY = "soul_codex_plus";

export const billingProviderSchema = z.enum(["stripe", "apple", "google_play"]);
export const billingPlanSchema = z.enum(["monthly", "annual"]);
export const billingEnvironmentSchema = z.enum(["sandbox", "production"]);
export const entitlementStatusSchema = z.enum([
  "active",
  "trialing",
  "grace_period",
  "canceled_pending_expiry",
  "expired",
  "revoked",
  "refunded",
  "account_hold",
]);

const safeDiagnosticValueSchema = z.union([
  z.string().max(256),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const diagnosticMetadataSchema = z.record(z.string(), safeDiagnosticValueSchema).superRefine((value, context) => {
  const forbidden = /(receipt|signed.?payload|jws|jwt|token|card|cvc|cvv|pan|secret|password)/i;
  for (const key of Object.keys(value)) {
    if (forbidden.test(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Diagnostic metadata key "${key}" is not allowed; store only redacted audit metadata.`,
      });
    }
  }
});

export const verifiedBillingEventSchema = z.object({
  userId: z.string().trim().min(1).max(256),
  provider: billingProviderSchema,
  providerEventId: z.string().trim().min(1).max(512),
  providerTransactionId: z.string().trim().min(1).max(512).nullable().optional(),
  productId: z.string().trim().min(1).max(512),
  plan: billingPlanSchema,
  environment: billingEnvironmentSchema,
  eventType: z.string().trim().min(1).max(128),
  occurredAt: z.coerce.date(),
  verificationState: z.literal("verified"),
  accessStatus: entitlementStatusSchema,
  purchasedAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  verifiedAt: z.coerce.date(),
  evidenceDigest: z.string().regex(/^[a-f0-9]{64}$/i, "evidenceDigest must be a SHA-256 hex digest"),
  diagnosticMetadata: diagnosticMetadataSchema.default({}),
}).superRefine((value, context) => {
  const grantsAccess = ["active", "trialing", "grace_period", "canceled_pending_expiry"].includes(value.accessStatus);
  if (grantsAccess && !value.expiresAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiresAt"],
      message: "Subscription access requires a verified expiration date.",
    });
  }
  if (
    grantsAccess &&
    value.expiresAt &&
    value.expiresAt.getTime() <= value.verifiedAt.getTime()
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiresAt"],
      message: "An access-granting event cannot already be expired when verified.",
    });
  }
});

export type VerifiedBillingEvent = z.infer<typeof verifiedBillingEventSchema>;

export type ProductEntitlementSource =
  | "free"
  | "owner"
  | "complimentary"
  | "stripe"
  | "apple"
  | "google_play";

export type ProductEntitlement = {
  tier: SoulCodexTier;
  source: ProductEntitlementSource;
  verified: boolean;
  plan: "monthly" | "annual" | null;
  status: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string | null;
};

function sameEventEvidence(
  existing: {
    billingSubjectId: string;
    productId: string;
    plan: string;
    environment: string;
    verificationState: string;
    evidenceDigest: string;
  },
  expected: {
    billingSubjectId: string;
    productId: string;
    plan: string;
    environment: string;
    verificationState: string;
    evidenceDigest: string;
  },
): boolean {
  return existing.billingSubjectId === expected.billingSubjectId &&
    existing.productId === expected.productId &&
    existing.plan === expected.plan &&
    existing.environment === expected.environment &&
    existing.verificationState === expected.verificationState &&
    existing.evidenceDigest.toLowerCase() === expected.evidenceDigest.toLowerCase();
}

export async function recordVerifiedBillingEvent(
  storage: IStorage,
  input: VerifiedBillingEvent,
) {
  const event = verifiedBillingEventSchema.parse(input);
  const retainedSubject = await storage.getBillingSubjectByUserId(event.userId);
  const user = await storage.getUser(event.userId);
  if (!retainedSubject && !user) throw new Error("billing_subject_user_not_found");
  const subject = retainedSubject ?? await storage.getOrCreateBillingSubject(event.userId);
  const existing = await storage.getBillingTransactionEventByProviderEvent(
    event.provider,
    event.providerEventId,
  );

  if (existing && !sameEventEvidence(existing, {
    billingSubjectId: subject.id,
    productId: event.productId,
    plan: event.plan,
    environment: event.environment,
    verificationState: event.verificationState,
    evidenceDigest: event.evidenceDigest,
  })) {
    throw new Error("billing_event_replay_mismatch");
  }

  const transaction = existing ?? await storage.createBillingTransactionEvent({
    billingSubjectId: subject.id,
    provider: event.provider,
    providerEventId: event.providerEventId,
    providerTransactionId: event.providerTransactionId ?? null,
    productId: event.productId,
    plan: event.plan,
    environment: event.environment,
    eventType: event.eventType,
    providerOccurredAt: event.occurredAt,
    verificationState: event.verificationState,
    purchasedAt: event.purchasedAt ?? null,
    expiresAt: event.expiresAt ?? null,
    verifiedAt: event.verifiedAt,
    evidenceDigest: event.evidenceDigest.toLowerCase(),
  });

  const receipt = await storage.createBillingVerificationReceipt({
    transactionEventId: transaction.id,
    provider: event.provider,
    verificationState: "verified",
    evidenceDigest: event.evidenceDigest.toLowerCase(),
    diagnosticMetadata: event.diagnosticMetadata,
    verifiedAt: event.verifiedAt,
  });

  const revokedAt = ["revoked", "refunded"].includes(event.accessStatus)
    ? event.verifiedAt
    : null;

  const grant = await storage.createEntitlementGrant({
    billingSubjectId: subject.id,
    capability: SOUL_CODEX_PLUS_CAPABILITY,
    plan: event.plan,
    sourceProvider: event.provider,
    sourceTransactionEventId: transaction.id,
    status: event.accessStatus,
    effectiveAt: event.occurredAt,
    expiresAt: event.expiresAt ?? null,
    revokedAt,
    lastVerifiedAt: event.verifiedAt,
  });

  return { subject, transaction, receipt, grant };
}

export function grantAllowsPlus(
  grant: EntitlementGrant | null | undefined,
  now = new Date(),
): boolean {
  if (!grant) return false;
  if (grant.capability !== SOUL_CODEX_PLUS_CAPABILITY) return false;
  // Every Soul Codex+ plan is a subscription. Legacy grants without paid-through evidence cannot confer access.
  if (!grant.expiresAt) return false;
  if (grant.revokedAt && grant.revokedAt.getTime() <= now.getTime()) return false;
  if (grant.effectiveAt.getTime() > now.getTime()) return false;
  if (grant.expiresAt && grant.expiresAt.getTime() <= now.getTime()) return false;
  return ["active", "trialing", "grace_period", "canceled_pending_expiry"].includes(grant.status);
}

export function entitlementFromGrant(
  grant: EntitlementGrant | null | undefined,
  now = new Date(),
): ProductEntitlement {
  if (!grantAllowsPlus(grant, now)) {
    return {
      tier: "free",
      source: "free",
      verified: true,
      plan: null,
      status: grant?.status ?? null,
      expiresAt: grant?.expiresAt?.toISOString() ?? null,
      lastVerifiedAt: grant?.lastVerifiedAt?.toISOString() ?? null,
    };
  }

  const source: ProductEntitlementSource =
    grant!.sourceProvider === "apple"
      ? "apple"
      : grant!.sourceProvider === "google_play"
        ? "google_play"
        : "stripe";

  return {
    tier: "plus",
    source,
    verified: true,
    plan: grant!.plan === "annual" ? "annual" : "monthly",
    status: grant!.status,
    expiresAt: grant!.expiresAt?.toISOString() ?? null,
    lastVerifiedAt: grant!.lastVerifiedAt.toISOString(),
  };
}

export async function resolveProductEntitlementForUser(
  storage: Pick<IStorage, "getUser" | "getLatestEntitlementGrant">,
  userId: string | null | undefined,
  now = new Date(),
): Promise<ProductEntitlement> {
  if (!userId) return entitlementFromGrant(null, now);
  const user = await storage.getUser(userId);
  if (!user) return entitlementFromGrant(null, now);
  // Explicit owner-authorized, server-only exception; never fabricate a paid event.
  // Account UUIDs survive Apple private relay/email changes and cannot be supplied
  // by a client access flag. An absent/deleted account was already rejected above.
  let ownerIds: string[] = [];
  try {
    const parsed = z.array(z.string().uuid()).max(10).safeParse(JSON.parse(process.env.SOUL_CODEX_OWNER_USER_IDS || "[]"));
    if (parsed.success) ownerIds = parsed.data;
  } catch { /* malformed configuration fails closed */ }
  if (ownerIds.includes(user.id)) {
    return { tier: "plus", source: "owner", verified: true, plan: null,
      status: "complimentary_lifetime", expiresAt: null, lastVerifiedAt: now.toISOString() };
  }
  // Complimentary content access is an explicit, expiring server grant.
  // It is not an owner/admin role or a purchase and never creates billing events.
  try {
    const config = z.array(z.object({
      userId: z.string().uuid(),
      startsAt: z.string().datetime(),
      expiresAt: z.string().datetime(),
    }).strict().refine((item) => {
      const duration = Date.parse(item.expiresAt) - Date.parse(item.startsAt);
      return duration > 0 && duration <= 90 * 24 * 60 * 60 * 1000;
    })).max(20).refine((items) => new Set(items.map((item) => item.userId)).size === items.length)
      .safeParse(JSON.parse(process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS || "[]"));
    const complimentary = config.success
      ? config.data.find((item) => item.userId === user.id &&
          Date.parse(item.startsAt) <= now.getTime() && now.getTime() < Date.parse(item.expiresAt))
      : undefined;
    if (complimentary) {
      return { tier: "plus", source: "complimentary", verified: true, plan: null,
        status: "complimentary_time_limited", expiresAt: complimentary.expiresAt,
        lastVerifiedAt: now.toISOString() };
    }
  } catch { /* malformed configuration fails closed; paid access is resolved normally */ }
  const grant = await storage.getLatestEntitlementGrant(
    userId,
    SOUL_CODEX_PLUS_CAPABILITY,
  );
  return entitlementFromGrant(grant, now);
}

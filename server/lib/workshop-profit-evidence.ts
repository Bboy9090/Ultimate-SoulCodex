/** Reconciliation-only bridge. No payment, entitlement or wallet authority.
 * The input comes from the existing durable billing service, not a client.
 * A verified lifecycle event does not establish settled cash.
 */
import type { BillingTransactionEvent, BillingVerificationReceipt, EntitlementGrant } from "@shared/schema";

export function projectWorkshopBillingEvidence(
  transaction: BillingTransactionEvent,
  receipt: BillingVerificationReceipt,
  grant: EntitlementGrant,
) {
  const linked = transaction.id === receipt.transactionEventId &&
    transaction.id === grant.sourceTransactionEventId &&
    transaction.billingSubjectId === grant.billingSubjectId &&
    transaction.provider === receipt.provider &&
    transaction.provider === grant.sourceProvider &&
    transaction.plan === grant.plan &&
    transaction.verificationState === "verified" &&
    receipt.verificationState === "verified" &&
    /^[a-f0-9]{64}$/i.test(transaction.evidenceDigest) &&
    transaction.evidenceDigest.toLowerCase() === receipt.evidenceDigest.toLowerCase() &&
    grant.capability === "soul_codex_plus" &&
    ["stripe", "apple", "google_play"].includes(transaction.provider) &&
    ["production", "sandbox"].includes(transaction.environment) &&
    ["monthly", "annual"].includes(transaction.plan);
  // Never copy diagnostic metadata, user identifiers, signed tokens or card data.
  // Only a linked, persisted event can be queued for independent settlement review.
  const status = !linked ? "INVALID_LINKAGE"
    : transaction.environment === "sandbox" ? "SANDBOX_ONLY"
    : "SETTLEMENT_REQUIRED";
  return {
    schema: "workshop.billing-reconciliation.v1",
    product: "soul-codex",
    status,
    transactionRef: linked ? transaction.id : null,
    provider: linked ? transaction.provider : null,
    environment: linked ? transaction.environment : null,
    plan: linked ? transaction.plan : null,
    accessStatus: linked ? grant.status : null,
    settledRevenueCents: null,
    paymentFeeCents: null,
    refundCents: null,
    currency: null,
    walletFundingAuthorized: false,
    spendingAuthorized: false,
    checkoutEnabledByBridge: false,
  } as const;
}

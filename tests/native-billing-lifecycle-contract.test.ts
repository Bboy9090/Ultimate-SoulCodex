import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../server/lib/native-billing-verification.ts", import.meta.url), "utf8");

test("Apple lifecycle endpoint accepts only verified V2 JWS notifications", () => {
  assert.match(billing, /\/api\/billing\/apple\/notifications/);
  assert.match(billing, /verifyAppleServerNotification\(signedPayload\)/);
  assert.match(verifier, /notification\.version !== "2\.0"/);
  assert.match(verifier, /verifyAppleJws<AppleServerNotificationPayload>/);
  assert.match(verifier, /verifyAppleSignedTransaction\(data\.signedTransactionInfo/);
  assert.match(verifier, /providerEventId: `apple_notification:\$\{notification\.notificationUUID\}`/);
  assert.match(verifier, /occurredAt: signedDate/);
  assert.match(verifier, /notificationType === "TEST"/);
});

test("Apple lifecycle state maps revocation, refund, expiry, grace, and cancellation explicitly", () => {
  assert.match(verifier, /notificationType === "REFUND"/);
  assert.match(verifier, /notificationType === "REVOKE"/);
  assert.match(verifier, /notificationType === "EXPIRED"/);
  assert.match(verifier, /GRACE_PERIOD_EXPIRED/);
  assert.match(verifier, /DID_FAIL_TO_RENEW/);
  assert.match(verifier, /GRACE_PERIOD/);
  assert.match(verifier, /DID_CHANGE_RENEWAL_STATUS/);
  assert.match(verifier, /AUTO_RENEW_DISABLED/);
});

test("Google RTDN is authenticated separately and never grants directly from PubSub data", () => {
  assert.match(billing, /\/api\/billing\/google\/rtdn/);
  assert.match(billing, /GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN/);
  assert.match(billing, /timingSafeEqual/);
  assert.match(billing, /verifyGoogleRtdnNotification\(req\.body\)/);
  assert.match(verifier, /purchases\/subscriptionsv2\/tokens/);
  assert.match(verifier, /externalAccountIdentifiers\?\.obfuscatedExternalAccountId/);
  assert.match(verifier, /googleAllowedLineItem/);
  assert.match(verifier, /providerEventId: `google_rtdn:\$\{messageId\}`/);
  assert.doesNotMatch(billing, /subscriptionNotification[^\n]*tier[^\n]*plus/s);
});

test("provider lifecycle processing remains active independently of purchase initiation flag", () => {
  const rawRoutes = billing.slice(
    billing.indexOf("export function registerBillingRawRoutes"),
    billing.indexOf("const checkoutLimiter"),
  );
  assert.doesNotMatch(rawRoutes, /nativeBillingFlagEnabled\(\)/);
  assert.match(rawRoutes, /persistentStorageConfigured\(\)/);
  assert.match(rawRoutes, /appleNativeVerifierConfigured\(\)/);
  assert.match(rawRoutes, /googleNativeVerifierConfigured\(\)/);
});

test("Google lifecycle re-verification can acknowledge a verified active pending purchase", () => {
  assert.match(verifier, /ACKNOWLEDGEMENT_STATE_PENDING/);
  assert.match(verifier, /google_play_acknowledgement_failed/);
  assert.match(verifier, /:acknowledge/);
});

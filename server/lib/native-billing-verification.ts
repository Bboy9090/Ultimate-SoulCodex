import { createHash, createPublicKey, verify as verifySignature, X509Certificate } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { VerifiedBillingEvent } from "./product-entitlement";

export type NativeBillingPlan = "monthly" | "annual";

const appleEvidenceSchema = z.object({
  platform: z.literal("ios"),
  productId: z.string().trim().min(1).max(512),
  transactionId: z.string().trim().min(1).max(512),
  signedTransaction: z.string().trim().min(20).max(200_000),
  purchaseToken: z.undefined().optional(),
}).strict();

const googleEvidenceSchema = z.object({
  platform: z.literal("android"),
  productId: z.string().trim().min(1).max(512),
  transactionId: z.string().trim().min(1).max(1024),
  purchaseToken: z.string().trim().min(20).max(4096),
  signedTransaction: z.undefined().optional(),
}).strict();

export const nativeBillingEvidenceSchema = z.discriminatedUnion("platform", [
  appleEvidenceSchema,
  googleEvidenceSchema,
]);

export type NativeBillingEvidence = z.infer<typeof nativeBillingEvidenceSchema>;

function appleMonthlyProductId(): string | null {
  return process.env.APPLE_PLUS_MONTHLY_PRODUCT_ID?.trim() || null;
}

function appleAnnualProductId(): string | null {
  return process.env.APPLE_PLUS_ANNUAL_PRODUCT_ID?.trim() || null;
}

function googleMonthlyProductId(): string | null {
  return process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID?.trim() || null;
}

function googleAnnualProductId(): string | null {
  return process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID?.trim() || null;
}

function planForAppleProduct(productId: string): NativeBillingPlan | null {
  if (productId === appleMonthlyProductId()) return "monthly";
  if (productId === appleAnnualProductId()) return "annual";
  return null;
}

function planForGoogleProduct(productId: string): NativeBillingPlan | null {
  if (productId === googleMonthlyProductId()) return "monthly";
  if (productId === googleAnnualProductId()) return "annual";
  return null;
}

function sha256Hex(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function base64UrlBuffer(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function parseAppleRootCertificates(): X509Certificate[] {
  const configured = process.env.APPLE_IAP_ROOT_CERTS_BASE64?.trim();
  if (!configured) throw new Error("apple_verifier_not_configured");
  const roots = configured
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => new X509Certificate(Buffer.from(entry, "base64")));
  if (!roots.length) throw new Error("apple_verifier_not_configured");
  return roots;
}

function verifyCertificateChain(
  certificates: X509Certificate[],
  trustedRoots: X509Certificate[],
  now = new Date(),
) {
  if (!certificates.length) throw new Error("apple_certificate_chain_missing");

  const nowMs = now.getTime();
  for (const cert of certificates) {
    const validFrom = Date.parse(cert.validFrom);
    const validTo = Date.parse(cert.validTo);
    if (!Number.isFinite(validFrom) || !Number.isFinite(validTo) || nowMs < validFrom || nowMs > validTo) {
      throw new Error("apple_certificate_expired");
    }
  }

  for (let index = 0; index < certificates.length - 1; index += 1) {
    if (!certificates[index].verify(certificates[index + 1].publicKey)) {
      throw new Error("apple_certificate_chain_invalid");
    }
  }

  const chainRoot = certificates[certificates.length - 1];
  const trusted = trustedRoots.some((root) => {
    const sameFingerprint =
      root.fingerprint256 &&
      chainRoot.fingerprint256 &&
      root.fingerprint256 === chainRoot.fingerprint256;
    return sameFingerprint || chainRoot.verify(root.publicKey);
  });

  if (!trusted) throw new Error("apple_certificate_root_untrusted");
}

type AppleJwsHeader = {
  alg?: string;
  x5c?: string[];
};

type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  bundleId?: string;
  productId?: string;
  purchaseDate?: number;
  originalPurchaseDate?: number;
  expiresDate?: number;
  revocationDate?: number;
  environment?: string;
  appAccountToken?: string;
};

function verifyAppleSignedTransaction(
  signedTransaction: string,
  now = new Date(),
): AppleTransactionPayload {
  const parts = signedTransaction.split(".");
  if (parts.length !== 3) throw new Error("apple_jws_malformed");

  let header: AppleJwsHeader;
  let payload: AppleTransactionPayload;
  try {
    header = JSON.parse(base64UrlBuffer(parts[0]).toString("utf8"));
    payload = JSON.parse(base64UrlBuffer(parts[1]).toString("utf8"));
  } catch {
    throw new Error("apple_jws_malformed");
  }

  if (header.alg !== "ES256" || !Array.isArray(header.x5c) || header.x5c.length < 2) {
    throw new Error("apple_jws_header_invalid");
  }

  const chain = header.x5c.map((cert) => new X509Certificate(Buffer.from(cert, "base64")));
  verifyCertificateChain(chain, parseAppleRootCertificates(), now);

  const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`, "utf8");
  const signature = base64UrlBuffer(parts[2]);
  const valid = verifySignature(
    "sha256",
    signedContent,
    {
      key: createPublicKey(chain[0].publicKey),
      dsaEncoding: "ieee-p1363",
    },
    signature,
  );
  if (!valid) throw new Error("apple_jws_signature_invalid");

  return payload;
}

function dateFromMilliseconds(value: unknown): Date | null {
  const milliseconds = typeof value === "number" ? value : Number(value);
  return Number.isFinite(milliseconds) && milliseconds > 0
    ? new Date(milliseconds)
    : null;
}

function environmentFromApple(value: unknown): "sandbox" | "production" {
  return String(value).toLowerCase() === "sandbox" ? "sandbox" : "production";
}

export async function verifyAppleBillingEvidence(
  userId: string,
  evidenceInput: NativeBillingEvidence,
  now = new Date(),
): Promise<VerifiedBillingEvent> {
  const evidence = appleEvidenceSchema.parse(evidenceInput);
  const payload = verifyAppleSignedTransaction(evidence.signedTransaction, now);
  const bundleId = process.env.APPLE_CLIENT_ID?.trim();

  if (!bundleId) throw new Error("apple_verifier_not_configured");
  if (payload.bundleId !== bundleId) throw new Error("apple_bundle_mismatch");
  if (!payload.productId || payload.productId !== evidence.productId) {
    throw new Error("apple_product_mismatch");
  }
  if (!payload.transactionId || payload.transactionId !== evidence.transactionId) {
    throw new Error("apple_transaction_mismatch");
  }

  const plan = planForAppleProduct(payload.productId);
  if (!plan) throw new Error("apple_product_not_allowed");

  const purchaseDate = dateFromMilliseconds(payload.purchaseDate);
  const expiresAt = dateFromMilliseconds(payload.expiresDate);
  const revokedAt = dateFromMilliseconds(payload.revocationDate);

  const accessStatus: VerifiedBillingEvent["accessStatus"] =
    revokedAt
      ? "revoked"
      : expiresAt && expiresAt.getTime() <= now.getTime()
        ? "expired"
        : "active";

  return {
    userId,
    provider: "apple",
    providerEventId: `apple:${payload.transactionId}:${payload.revocationDate ?? payload.expiresDate ?? payload.purchaseDate ?? 0}`,
    providerTransactionId: payload.transactionId,
    productId: payload.productId,
    plan,
    environment: environmentFromApple(payload.environment),
    eventType: revokedAt ? "transaction_revoked" : "transaction_verified",
    occurredAt: revokedAt ?? expiresAt ?? purchaseDate ?? now,
    verificationState: "verified",
    accessStatus,
    purchasedAt: purchaseDate,
    expiresAt,
    verifiedAt: now,
    evidenceDigest: sha256Hex(evidence.signedTransaction),
    diagnosticMetadata: {
      source: "storekit2",
      environment: environmentFromApple(payload.environment),
      hasAppAccountToken: Boolean(payload.appAccountToken),
      originalTransactionBound: Boolean(payload.originalTransactionId),
    },
  };
}

type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function googleServiceAccount(): GoogleServiceAccount {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) throw new Error("google_play_verifier_not_configured");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("google_play_service_account_invalid");
  }
  const schema = z.object({
    client_email: z.string().email(),
    private_key: z.string().min(40),
    token_uri: z.string().url().optional(),
  });
  return schema.parse(parsed);
}

async function googleAccessToken(fetchImpl: typeof fetch): Promise<string> {
  const serviceAccount = googleServiceAccount();
  const tokenUri = serviceAccount.token_uri || "https://oauth2.googleapis.com/token";
  const issuedAt = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: tokenUri,
      iat: issuedAt,
      exp: issuedAt + 3600,
    },
    serviceAccount.private_key,
    { algorithm: "RS256" },
  );

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetchImpl(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error("google_play_oauth_failed");
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("google_play_oauth_failed");
  return payload.access_token;
}

type GoogleSubscriptionV2 = {
  kind?: string;
  startTime?: string;
  subscriptionState?: string;
  acknowledgementState?: string;
  latestOrderId?: string;
  lineItems?: Array<{
    productId?: string;
    expiryTime?: string;
  }>;
};

function googleAccessStatus(
  state: string | undefined,
  expiresAt: Date | null,
  now: Date,
): VerifiedBillingEvent["accessStatus"] {
  if (expiresAt && expiresAt.getTime() <= now.getTime()) return "expired";
  switch (state) {
    case "SUBSCRIPTION_STATE_ACTIVE":
      return "active";
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      return "grace_period";
    case "SUBSCRIPTION_STATE_CANCELED":
      return "canceled_pending_expiry";
    case "SUBSCRIPTION_STATE_EXPIRED":
      return "expired";
    case "SUBSCRIPTION_STATE_ON_HOLD":
    case "SUBSCRIPTION_STATE_PAUSED":
      return "account_hold";
    default:
      return "account_hold";
  }
}

export async function verifyGoogleBillingEvidence(
  userId: string,
  evidenceInput: NativeBillingEvidence,
  now = new Date(),
  fetchImpl: typeof fetch = fetch,
): Promise<VerifiedBillingEvent> {
  const evidence = googleEvidenceSchema.parse(evidenceInput);
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) throw new Error("google_play_verifier_not_configured");

  const plan = planForGoogleProduct(evidence.productId);
  if (!plan) throw new Error("google_play_product_not_allowed");

  const accessToken = await googleAccessToken(fetchImpl);
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(evidence.purchaseToken)}`;
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("google_play_verification_failed");
  const purchase = await response.json() as GoogleSubscriptionV2;

  const matchingItem = purchase.lineItems?.find((item) => item.productId === evidence.productId);
  if (!matchingItem) throw new Error("google_play_product_mismatch");

  const purchasedAt = purchase.startTime ? new Date(purchase.startTime) : null;
  const expiresAt = matchingItem.expiryTime ? new Date(matchingItem.expiryTime) : null;
  if (purchasedAt && Number.isNaN(purchasedAt.getTime())) throw new Error("google_play_purchase_time_invalid");
  if (expiresAt && Number.isNaN(expiresAt.getTime())) throw new Error("google_play_expiry_time_invalid");

  const accessStatus = googleAccessStatus(purchase.subscriptionState, expiresAt, now);
  const providerTransactionId = purchase.latestOrderId || evidence.transactionId;

  return {
    userId,
    provider: "google_play",
    providerEventId: `google_play:${sha256Hex(evidence.purchaseToken)}:${purchase.subscriptionState ?? "unknown"}:${matchingItem.expiryTime ?? "none"}`,
    providerTransactionId,
    productId: evidence.productId,
    plan,
    environment: "production",
    eventType: "subscription_verified",
    occurredAt: expiresAt ?? purchasedAt ?? now,
    verificationState: "verified",
    accessStatus,
    purchasedAt,
    expiresAt,
    verifiedAt: now,
    evidenceDigest: sha256Hex(evidence.purchaseToken),
    diagnosticMetadata: {
      source: "google_play_developer_api",
      state: purchase.subscriptionState ?? "unknown",
      acknowledged: purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
      hasOrderId: Boolean(purchase.latestOrderId),
    },
  };
}

import {
  X509Certificate,
  createHash,
  createHmac,
  createSign,
  createVerify,
  createPrivateKey,
} from "node:crypto";
import type { VerifiedBillingEvent } from "./product-entitlement";

type NativePlan = "monthly" | "annual";

type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  bundleId?: string;
  productId?: string;
  purchaseDate?: number;
  expiresDate?: number;
  revocationDate?: number;
  signedDate?: number;
  environment?: string;
  appAccountToken?: string;
};

type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type GoogleSubscriptionPurchaseV2 = {
  startTime?: string;
  subscriptionState?: string;
  acknowledgementState?: string;
  etag?: string;
  testPurchase?: Record<string, never>;
  externalAccountIdentifiers?: {
    obfuscatedExternalAccountId?: string;
  };
  lineItems?: Array<{
    productId?: string;
    expiryTime?: string;
    latestSuccessfulOrderId?: string;
  }>;
};

type GoogleOAuthCache = {
  accessToken: string;
  expiresAtMs: number;
};

let googleOAuthCache: GoogleOAuthCache | null = null;

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64");
}

function base64UrlEncode(value: Buffer | string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function safeJson<T>(buffer: Buffer): T {
  return JSON.parse(buffer.toString("utf8")) as T;
}

function parseAppleRoots(): X509Certificate[] {
  const raw = process.env.APPLE_IAP_ROOT_CERTS_BASE64?.trim();
  if (!raw) throw new Error("apple_verifier_not_configured");
  const roots = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => new X509Certificate(Buffer.from(item, "base64")));
  if (!roots.length) throw new Error("apple_verifier_not_configured");
  return roots;
}

function certificateValidAt(certificate: X509Certificate, now: Date): boolean {
  const from = Date.parse(certificate.validFrom);
  const to = Date.parse(certificate.validTo);
  return Number.isFinite(from) && Number.isFinite(to) && from <= now.getTime() && now.getTime() <= to;
}

function verifyAppleCertificateChain(chain: X509Certificate[], roots: X509Certificate[], now: Date) {
  if (!chain.length) throw new Error("apple_jws_certificate_chain_missing");
  for (const cert of chain) {
    if (!certificateValidAt(cert, now)) throw new Error("apple_jws_certificate_expired");
  }

  for (let index = 0; index < chain.length - 1; index += 1) {
    if (!chain[index].verify(chain[index + 1].publicKey)) {
      throw new Error("apple_jws_certificate_chain_invalid");
    }
  }

  const tail = chain[chain.length - 1];
  const trusted = roots.some((root) => {
    if (!certificateValidAt(root, now)) return false;
    if (tail.raw.equals(root.raw)) return true;
    try {
      return tail.verify(root.publicKey);
    } catch {
      return false;
    }
  });

  if (!trusted) throw new Error("apple_jws_untrusted_root");
}

function planForAppleProduct(productId: string): NativePlan | null {
  const monthly = process.env.APPLE_PLUS_MONTHLY_PRODUCT_ID?.trim();
  const annual = process.env.APPLE_PLUS_ANNUAL_PRODUCT_ID?.trim();
  if (productId === monthly) return "monthly";
  if (productId === annual) return "annual";
  return null;
}

function planForGoogleProduct(productId: string): NativePlan | null {
  const monthly = process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID?.trim();
  const annual = process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID?.trim();
  if (productId === monthly) return "monthly";
  if (productId === annual) return "annual";
  return null;
}

function environmentFromApple(value: string | undefined): "sandbox" | "production" {
  if (value === "Sandbox") return "sandbox";
  if (value === "Production") return "production";
  throw new Error("apple_environment_invalid");
}

function dateFromMillis(value: number | undefined): Date | null {
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value)
    : null;
}

export function verifyAppleSignedTransaction(
  signedTransaction: string,
  expectedUserId: string,
  now = new Date(),
): VerifiedBillingEvent {
  const segments = signedTransaction.split(".");
  if (segments.length !== 3) throw new Error("apple_jws_malformed");

  const header = safeJson<{ alg?: string; x5c?: string[] }>(base64UrlDecode(segments[0]));
  if (header.alg !== "ES256" || !Array.isArray(header.x5c) || !header.x5c.length) {
    throw new Error("apple_jws_header_invalid");
  }

  const payload = safeJson<AppleTransactionPayload>(base64UrlDecode(segments[1]));
  const signedAt = dateFromMillis(payload.signedDate);
  if (!signedAt) throw new Error("apple_signed_date_missing");

  const chain = header.x5c.map((certificate) =>
    new X509Certificate(Buffer.from(certificate, "base64")),
  );
  // Apple documents signedDate as the time to use for validating the
  // certificate that signed the transaction. The payload is still untrusted
  // here; any signedDate tampering is rejected by the JWS signature check
  // immediately below.
  verifyAppleCertificateChain(chain, parseAppleRoots(), signedAt);

  const verifier = createVerify("SHA256");
  verifier.update(`${segments[0]}.${segments[1]}`);
  verifier.end();
  const signatureValid = verifier.verify(
    { key: chain[0].publicKey, dsaEncoding: "ieee-p1363" },
    base64UrlDecode(segments[2]),
  );
  if (!signatureValid) throw new Error("apple_jws_signature_invalid");

  const bundleId = process.env.APPLE_CLIENT_ID?.trim();
  if (!bundleId || payload.bundleId !== bundleId) throw new Error("apple_bundle_id_mismatch");

  const environment = environmentFromApple(payload.environment);
  const productId = payload.productId?.trim();
  if (!productId) throw new Error("apple_product_missing");
  const plan = planForAppleProduct(productId);
  if (!plan) throw new Error("apple_product_not_allowed");

  if (!payload.appAccountToken || payload.appAccountToken.toLowerCase() !== expectedUserId.toLowerCase()) {
    throw new Error("apple_account_binding_mismatch");
  }

  const transactionId = payload.transactionId?.trim();
  if (!transactionId) throw new Error("apple_transaction_id_missing");

  const purchasedAt = dateFromMillis(payload.purchaseDate);
  const expiresAt = dateFromMillis(payload.expiresDate);
  const revocationAt = dateFromMillis(payload.revocationDate);
  const verifiedSignedAt = signedAt;

  let accessStatus: VerifiedBillingEvent["accessStatus"];
  if (revocationAt) {
    accessStatus = "revoked";
  } else if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    accessStatus = "expired";
  } else {
    accessStatus = "active";
  }

  const providerEventId = createHash("sha256")
    .update(
      [
        transactionId,
        payload.expiresDate ?? "",
        payload.revocationDate ?? "",
        payload.signedDate ?? "",
      ].join(":"),
    )
    .digest("hex");

  return {
    userId: expectedUserId,
    provider: "apple",
    providerEventId,
    providerTransactionId: payload.originalTransactionId ?? transactionId,
    productId,
    plan,
    environment,
    eventType: revocationAt ? "transaction_revoked" : "transaction_verified",
    occurredAt: revocationAt ?? purchasedAt ?? verifiedSignedAt,
    verificationState: "verified",
    accessStatus,
    purchasedAt,
    expiresAt,
    verifiedAt: now,
    evidenceDigest: createHash("sha256").update(signedTransaction).digest("hex"),
    diagnosticMetadata: {
      environment,
      bundleId,
      revoked: Boolean(revocationAt),
      hasExpiry: Boolean(expiresAt),
    },
  };
}

function parseGoogleServiceAccount(): GoogleServiceAccount {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) throw new Error("google_verifier_not_configured");
  let account: GoogleServiceAccount;
  try {
    account = JSON.parse(raw) as GoogleServiceAccount;
  } catch {
    throw new Error("google_service_account_invalid");
  }

  if (!account.client_email || !account.private_key) {
    throw new Error("google_service_account_invalid");
  }
  return account;
}

function googleBindingSecret(): string {
  const value = process.env.SOUL_CODEX_BILLING_BINDING_SECRET?.trim();
  if (!value) throw new Error("google_billing_binding_not_configured");
  return value;
}

export function googleObfuscatedAccountId(userId: string): string {
  return createHmac("sha256", googleBindingSecret())
    .update(userId)
    .digest("hex");
}

async function googleAccessToken(now = new Date()): Promise<string> {
  if (googleOAuthCache && googleOAuthCache.expiresAtMs - 60_000 > now.getTime()) {
    return googleOAuthCache.accessToken;
  }

  const account = parseGoogleServiceAccount();
  const tokenUri = account.token_uri || "https://oauth2.googleapis.com/token";
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64UrlEncode(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: tokenUri,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    }),
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  signer.end();
  const signature = signer.sign(createPrivateKey(account.private_key));
  const assertion = `${header}.${claims}.${base64UrlEncode(signature)}`;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) throw new Error("google_oauth_failed");
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!payload.access_token) throw new Error("google_oauth_failed");

  googleOAuthCache = {
    accessToken: payload.access_token,
    expiresAtMs: now.getTime() + Math.max(60, payload.expires_in ?? 3600) * 1000,
  };
  return payload.access_token;
}

function googleStatus(
  state: string | undefined,
  expiresAt: Date | null,
  now: Date,
): VerifiedBillingEvent["accessStatus"] {
  switch (state) {
    case "SUBSCRIPTION_STATE_ACTIVE":
      return "active";
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      return "grace_period";
    case "SUBSCRIPTION_STATE_CANCELED":
      return expiresAt && expiresAt.getTime() > now.getTime()
        ? "canceled_pending_expiry"
        : "expired";
    case "SUBSCRIPTION_STATE_EXPIRED":
      return "expired";
    case "SUBSCRIPTION_STATE_ON_HOLD":
    case "SUBSCRIPTION_STATE_PAUSED":
    case "SUBSCRIPTION_STATE_PENDING":
      return "account_hold";
    default:
      return "account_hold";
  }
}

async function acknowledgeGoogleSubscription(
  accessToken: string,
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<void> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!response.ok) throw new Error("google_acknowledgement_failed");
}

export async function verifyGooglePlaySubscription(
  purchaseToken: string,
  expectedProductId: string,
  expectedUserId: string,
  now = new Date(),
): Promise<VerifiedBillingEvent> {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) throw new Error("google_verifier_not_configured");

  const plan = planForGoogleProduct(expectedProductId);
  if (!plan) throw new Error("google_product_not_allowed");

  const accessToken = await googleAccessToken(now);
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("google_purchase_verification_failed");

  const payload = (await response.json()) as GoogleSubscriptionPurchaseV2;
  const expectedBinding = googleObfuscatedAccountId(expectedUserId);
  if (
    payload.externalAccountIdentifiers?.obfuscatedExternalAccountId !== expectedBinding
  ) {
    throw new Error("google_account_binding_mismatch");
  }

  const matchingLine = payload.lineItems?.find(
    (item) => item.productId === expectedProductId,
  );
  if (!matchingLine) throw new Error("google_product_mismatch");

  const expiresAt = matchingLine.expiryTime
    ? new Date(matchingLine.expiryTime)
    : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new Error("google_expiry_invalid");
  }

  const purchasedAt = payload.startTime ? new Date(payload.startTime) : null;
  if (purchasedAt && Number.isNaN(purchasedAt.getTime())) {
    throw new Error("google_start_time_invalid");
  }

  const accessStatus = googleStatus(payload.subscriptionState, expiresAt, now);
  if (payload.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING") {
    await acknowledgeGoogleSubscription(
      accessToken,
      packageName,
      expectedProductId,
      purchaseToken,
    );
  }

  const purchaseTokenDigest = createHash("sha256").update(purchaseToken).digest("hex");
  const evidenceDigest = createHash("sha256")
    .update(
      JSON.stringify({
        token: purchaseTokenDigest,
        state: payload.subscriptionState ?? null,
        acknowledgementState: payload.acknowledgementState ?? null,
        etag: payload.etag ?? null,
        lineItems: payload.lineItems ?? [],
        accountBinding: expectedBinding,
      }),
    )
    .digest("hex");

  const providerEventId = createHash("sha256")
    .update(
      [
        purchaseTokenDigest,
        payload.etag ?? "",
        payload.subscriptionState ?? "",
        matchingLine.expiryTime ?? "",
        matchingLine.latestSuccessfulOrderId ?? "",
      ].join(":"),
    )
    .digest("hex");

  return {
    userId: expectedUserId,
    provider: "google_play",
    providerEventId,
    providerTransactionId:
      matchingLine.latestSuccessfulOrderId ?? purchaseTokenDigest,
    productId: expectedProductId,
    plan,
    environment: payload.testPurchase ? "sandbox" : "production",
    eventType: "subscription_verified",
    occurredAt: now,
    verificationState: "verified",
    accessStatus,
    purchasedAt,
    expiresAt,
    verifiedAt: now,
    evidenceDigest,
    diagnosticMetadata: {
      state: payload.subscriptionState ?? "unknown",
      acknowledged: payload.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
      testPurchase: Boolean(payload.testPurchase),
      hasExpiry: Boolean(expiresAt),
    },
  };
}

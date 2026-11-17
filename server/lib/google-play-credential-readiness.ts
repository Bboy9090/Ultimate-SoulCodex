import { createPrivateKey } from "node:crypto";

/**
 * Catalog readiness is deliberately narrower than account authorization.
 * A present but unusable credential must never make Play subscriptions purchasable.
 * Successful parsing does NOT prove IAM access or a verified Play transaction.
 */
export function googlePlayCredentialReady(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const raw = env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON?.trim();
  const expectedEmail = env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL?.trim();
  if (!raw || !expectedEmail) return false;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    const account = parsed as Record<string, unknown>;
    if (typeof account.client_email !== "string" ||
        account.client_email.toLowerCase() !== expectedEmail.toLowerCase()) return false;
    if (typeof account.private_key !== "string") return false;
    if (account.token_uri !== undefined &&
        account.token_uri !== "https://oauth2.googleapis.com/token") return false;

    // The OAuth JWT assertion is signed with RS256. Reject malformed and
    // non-RSA keys before offering a purchase that cannot be verified.
    return createPrivateKey(account.private_key).asymmetricKeyType === "rsa";
  } catch {
    return false;
  }
}

import appleSignin from "apple-signin-auth";

export type AppleIdentity = {
  subject: string;
  email: string | null;
};

export class AppleAuthConfigurationError extends Error {}
export class AppleAuthVerificationError extends Error {}

type AppleTokenClaims = {
  sub?: unknown;
  email?: unknown;
};

type VerifyAppleToken = (
  token: string,
  options: { audience: string; ignoreExpiration: boolean },
) => Promise<AppleTokenClaims>;

const defaultAppleVerifier: VerifyAppleToken = (token, options) =>
  appleSignin.verifyIdToken(token, options);

export async function verifyAppleIdentityToken(
  identityToken: string,
  verifier: VerifyAppleToken = defaultAppleVerifier,
): Promise<AppleIdentity> {
  const audiences = [
    process.env.APPLE_CLIENT_ID?.trim(),
    process.env.APPLE_WEB_CLIENT_ID?.trim(),
  ].filter((value): value is string => Boolean(value));
  if (audiences.length === 0) {
    throw new AppleAuthConfigurationError("Apple Sign-In client IDs are not configured");
  }
  if (!identityToken?.trim()) {
    throw new AppleAuthVerificationError("identityToken is required");
  }

  let claims: AppleTokenClaims | null = null;
  for (const audience of audiences) {
    try {
      claims = await verifier(identityToken, { audience, ignoreExpiration: false });
      break;
    } catch {
      // Try the next explicitly configured Apple audience.
    }
  }
  if (!claims) {
    throw new AppleAuthVerificationError("Apple identity token verification failed");
  }

  const subject = typeof claims.sub === "string" ? claims.sub.trim() : "";
  if (!subject) {
    throw new AppleAuthVerificationError("Apple identity token is missing subject");
  }

  return {
    subject,
    email: typeof claims.email === "string" && claims.email.trim() ? claims.email.trim() : null,
  };
}

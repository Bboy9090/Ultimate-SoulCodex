import appleSignin from "apple-signin-auth";

export type AppleIdentity = {
  subject: string;
  email: string | null;
};

export class AppleAuthConfigurationError extends Error {}
export class AppleAuthVerificationError extends Error {}

type VerifyAppleToken = (
  token: string,
  options: { audience: string; ignoreExpiration: boolean },
) => Promise<Record<string, unknown>>;

export async function verifyAppleIdentityToken(
  identityToken: string,
  verifier: VerifyAppleToken = appleSignin.verifyIdToken as VerifyAppleToken,
): Promise<AppleIdentity> {
  const audience = process.env.APPLE_CLIENT_ID?.trim();
  if (!audience) {
    throw new AppleAuthConfigurationError("APPLE_CLIENT_ID is not configured");
  }
  if (!identityToken?.trim()) {
    throw new AppleAuthVerificationError("identityToken is required");
  }

  let claims: Record<string, unknown>;
  try {
    claims = await verifier(identityToken, { audience, ignoreExpiration: false });
  } catch {
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

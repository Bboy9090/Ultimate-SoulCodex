import jwt, { type JwtHeader, type SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export type GoogleIdentity = {
  subject: string;
  email: string | null;
  name: string | null;
};

export class GoogleAuthConfigurationError extends Error {}
export class GoogleAuthVerificationError extends Error {}

type GoogleClaims = {
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
  iss?: unknown;
};

const googleJwks = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 60 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function signingKey(header: JwtHeader, callback: SigningKeyCallback) {
  if (!header.kid) {
    callback(new GoogleAuthVerificationError("Google identity token is missing key id"));
    return;
  }
  googleJwks.getSigningKey(header.kid)
    .then((key) => callback(null, key.getPublicKey()))
    .catch((error) => callback(error));
}

export async function verifyGoogleIdentityToken(
  idToken: string,
  verifier: typeof jwt.verify = jwt.verify,
): Promise<GoogleIdentity> {
  const clientId = process.env.GOOGLE_OAUTH_WEB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new GoogleAuthConfigurationError("Google OAuth web client ID is not configured");
  }
  if (!idToken?.trim()) {
    throw new GoogleAuthVerificationError("idToken is required");
  }

  let decoded: GoogleClaims;
  try {
    decoded = await new Promise<GoogleClaims>((resolve, reject) => {
      verifier(
        idToken,
        signingKey,
        {
          algorithms: ["RS256"],
          audience: clientId,
          issuer: ["https://accounts.google.com", "accounts.google.com"],
        },
        (error, payload) => {
          if (error || !payload || typeof payload === "string") {
            reject(error ?? new GoogleAuthVerificationError("Google identity token payload is invalid"));
            return;
          }
          resolve(payload as GoogleClaims);
        },
      );
    });
  } catch {
    throw new GoogleAuthVerificationError("Google identity token verification failed");
  }

  const subject = typeof decoded.sub === "string" ? decoded.sub.trim() : "";
  if (!subject) {
    throw new GoogleAuthVerificationError("Google identity token is missing subject");
  }

  const email =
    decoded.email_verified === true &&
    typeof decoded.email === "string" &&
    decoded.email.trim()
      ? decoded.email.trim().toLowerCase()
      : null;

  return {
    subject,
    email,
    name: typeof decoded.name === "string" && decoded.name.trim() ? decoded.name.trim() : null,
  };
}

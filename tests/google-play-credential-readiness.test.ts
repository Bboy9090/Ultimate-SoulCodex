import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { googlePlayCredentialReady } from "../server/lib/google-play-credential-readiness";

const email = "soulcodex-play-verifier@example.iam.gserviceaccount.com";
const rsaPrivateKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({
  format: "pem",
  type: "pkcs8",
}).toString();
const ecPrivateKey = generateKeyPairSync("ec", { namedCurve: "prime256v1" }).privateKey.export({
  format: "pem",
  type: "pkcs8",
}).toString();

function env(account: Record<string, unknown> | string | null, expectedEmail = email) {
  return {
    GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON:
      account === null ? undefined : typeof account === "string" ? account : JSON.stringify(account),
    GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL: expectedEmail,
  };
}

const valid = {
  client_email: email,
  private_key: rsaPrivateKey,
  token_uri: "https://oauth2.googleapis.com/token",
};

test("Play catalog fails closed when verifier configuration is absent or malformed", () => {
  assert.equal(googlePlayCredentialReady({}), false);
  assert.equal(googlePlayCredentialReady(env(null)), false);
  assert.equal(googlePlayCredentialReady(env("{invalid")), false);
  assert.equal(googlePlayCredentialReady(env([] as unknown as Record<string, unknown>)), false);
  assert.equal(googlePlayCredentialReady(env({ ...valid, private_key: "not-a-pem-key" })), false);
});

test("Play catalog requires the dedicated identity, pinned token endpoint, and an RSA key", () => {
  assert.equal(googlePlayCredentialReady(env(valid, "other-verifier@example.iam.gserviceaccount.com")), false);
  assert.equal(googlePlayCredentialReady(env({ ...valid, token_uri: "https://example.com/token" })), false);
  assert.equal(googlePlayCredentialReady(env({ ...valid, private_key: ecPrivateKey })), false);
  assert.equal(googlePlayCredentialReady(env(valid)), true);
  assert.equal(googlePlayCredentialReady(env({ client_email: email.toUpperCase(), private_key: rsaPrivateKey })), true);
});

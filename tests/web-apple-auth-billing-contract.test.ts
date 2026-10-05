import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  AppleAuthVerificationError,
  verifyAppleIdentityToken,
} from "../server/auth/apple";

const authRoute = readFileSync(new URL("../server/routes/consumer-auth.ts", import.meta.url), "utf8");
const appleButton = readFileSync(new URL("../client/src/components/AppleSignInButton.tsx", import.meta.url), "utf8");
const preflight = readFileSync(new URL("../scripts/validate-billing-production-readiness.mjs", import.meta.url), "utf8");
const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

test("Apple identity verification accepts only explicitly configured native or web audiences", async () => {
  const previousNative = process.env.APPLE_CLIENT_ID;
  const previousWeb = process.env.APPLE_WEB_CLIENT_ID;
  process.env.APPLE_CLIENT_ID = "app.soulcodex.ios";
  process.env.APPLE_WEB_CLIENT_ID = "app.soulcodex.web";

  const seen: string[] = [];
  const verifier = async (_token: string, options: { audience: string; ignoreExpiration: boolean }) => {
    seen.push(options.audience);
    if (options.audience !== "app.soulcodex.web") throw new Error("audience mismatch");
    return { sub: "apple-user", email: "relay@example.com" };
  };

  try {
    const identity = await verifyAppleIdentityToken("signed-token", verifier);
    assert.equal(identity.subject, "apple-user");
    assert.deepEqual(seen, ["app.soulcodex.ios", "app.soulcodex.web"]);
  } finally {
    if (previousNative === undefined) delete process.env.APPLE_CLIENT_ID;
    else process.env.APPLE_CLIENT_ID = previousNative;
    if (previousWeb === undefined) delete process.env.APPLE_WEB_CLIENT_ID;
    else process.env.APPLE_WEB_CLIENT_ID = previousWeb;
  }
});

test("Apple identity verification rejects tokens outside every configured audience", async () => {
  const previousNative = process.env.APPLE_CLIENT_ID;
  const previousWeb = process.env.APPLE_WEB_CLIENT_ID;
  process.env.APPLE_CLIENT_ID = "app.soulcodex.ios";
  process.env.APPLE_WEB_CLIENT_ID = "app.soulcodex.web";

  try {
    await assert.rejects(
      () => verifyAppleIdentityToken("wrong-token", async () => { throw new Error("audience mismatch"); }),
      AppleAuthVerificationError,
    );
  } finally {
    if (previousNative === undefined) delete process.env.APPLE_CLIENT_ID;
    else process.env.APPLE_CLIENT_ID = previousNative;
    if (previousWeb === undefined) delete process.env.APPLE_WEB_CLIENT_ID;
    else process.env.APPLE_WEB_CLIENT_ID = previousWeb;
  }
});

test("web Apple auth is server-owned and disabled until a Services ID exists", () => {
  assert.match(authRoute, /\/api\/auth\/apple\/config/);
  assert.match(authRoute, /APPLE_WEB_CLIENT_ID/);
  assert.match(authRoute, /\/auth\/apple\/callback/);
  assert.match(authRoute, /Cache-Control/);
  assert.match(appleButton, /appleid\.cdn-apple\.com\/appleauth/);
  assert.match(appleButton, /usePopup:\s*true/);
  assert.match(appleButton, /authorization\?\.state !== state/);
  assert.match(appleButton, /authorization\?\.id_token/);
  assert.match(appleButton, /web_apple_signin_not_configured|Web Sign in with Apple is not configured yet/);
});

test("billing preflight requires browser auth before web checkout can qualify", () => {
  assert.match(preflight, /APPLE_WEB_CLIENT_ID/);
  assert.match(preflight, /webAuth/);
  assert.match(preflight, /stripe\.configured && webAuth\.configured/);
  assert.match(envExample, /APPLE_WEB_CLIENT_ID/);
  assert.match(envExample, /https:\/\/your-production-domain\.com\/auth\/apple\/callback/);
});

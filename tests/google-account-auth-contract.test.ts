import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import session from "express-session";
import { readFileSync } from "node:fs";
import { MemStorage } from "../server/storage";
import { registerConsumerAuthRoutes } from "../server/routes/consumer-auth";
import {
  GoogleAuthConfigurationError,
  verifyGoogleIdentityToken,
} from "../server/auth/google";

async function withServer(app: express.Express, run: (baseUrl: string) => Promise<void>) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("test server did not bind");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function cookieFrom(response: Response) {
  return (response.headers.get("set-cookie") || "").split(";")[0];
}

test("Google verifier fails closed without an explicit OAuth audience", async () => {
  const previous = process.env.GOOGLE_OAUTH_WEB_CLIENT_ID;
  delete process.env.GOOGLE_OAUTH_WEB_CLIENT_ID;
  try {
    await assert.rejects(
      () => verifyGoogleIdentityToken("token"),
      GoogleAuthConfigurationError,
    );
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_OAUTH_WEB_CLIENT_ID;
    else process.env.GOOGLE_OAUTH_WEB_CLIENT_ID = previous;
  }
});

test("Google auth rotates session, migrates anonymous profile and exposes provider state", async () => {
  const storage = new MemStorage();
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: "google-auth-contract-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, sameSite: "lax" },
  }));

  app.post("/__test/session", (req: any, res) => {
    req.session.started = true;
    res.json({ sessionId: req.sessionID });
  });

  registerConsumerAuthRoutes(app, {
    storage,
    verifyApple: async () => ({ subject: "unused-apple", email: null }),
    verifyGoogle: async (token) => {
      assert.equal(token, "verified-google-token");
      return {
        subject: "google-subject-42",
        email: "google.user@example.com",
        name: "Google User",
      };
    },
  });

  await withServer(app, async (baseUrl) => {
    const configWithoutEnv = await fetch(`${baseUrl}/api/auth/google/config`);
    assert.equal(configWithoutEnv.status, 200);
    assert.equal((await configWithoutEnv.json() as any).enabled, false);

    const bootstrap = await fetch(`${baseUrl}/__test/session`, { method: "POST" });
    assert.equal(bootstrap.status, 200);
    const guestCookie = cookieFrom(bootstrap);
    const { sessionId } = await bootstrap.json() as { sessionId: string };

    const anonymousProfile = await storage.createProfile({
      sessionId,
      userId: null,
      name: "Google Migration Profile",
      birthDate: new Date("1990-09-17T00:00:00.000Z"),
    });

    const login = await fetch(`${baseUrl}/api/auth/google`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: guestCookie },
      body: JSON.stringify({ idToken: "verified-google-token" }),
    });
    const loginText = await login.text();
    assert.equal(login.status, 200, loginText);
    const loginBody = JSON.parse(loginText) as any;
    assert.equal(loginBody.user.username, "google:google-subject-42");
    assert.equal(loginBody.user.email, "google.user@example.com");
    assert.equal("password" in loginBody.user, false);

    const googleCookie = cookieFrom(login);
    assert.match(googleCookie, /^connect\.sid=/);
    assert.notEqual(googleCookie, guestCookie);

    const migrated = await storage.getProfile(anonymousProfile.id);
    assert.equal(migrated?.userId, loginBody.user.id);
    assert.equal(migrated?.sessionId, null);

    const current = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { Cookie: googleCookie },
    });
    const currentBody = await current.json() as any;
    assert.equal(currentBody.authProvider, "google");
    assert.equal(currentBody.email, "google.user@example.com");
  });
});

test("Android Google sign-in uses Credential Manager rather than deprecated GoogleSignIn API", () => {
  const gradle = readFileSync(new URL("../android/app/build.gradle", import.meta.url), "utf8");
  const plugin = readFileSync(
    new URL("../android/app/src/main/java/app/soulcodex/main/SoulCodexGoogleAuthPlugin.java", import.meta.url),
    "utf8",
  );
  const activity = readFileSync(
    new URL("../android/app/src/main/java/app/soulcodex/main/MainActivity.java", import.meta.url),
    "utf8",
  );
  const settings = readFileSync(new URL("../client/src/pages/SettingsPage.tsx", import.meta.url), "utf8");
  const privacy = readFileSync(new URL("../client/src/pages/PrivacyPage.tsx", import.meta.url), "utf8");

  assert.match(gradle, /androidx\.credentials:credentials:1\.6\.0/);
  assert.match(gradle, /credentials-play-services-auth:1\.6\.0/);
  assert.match(gradle, /googleid:googleid:1\.2\.1/);
  assert.doesNotMatch(gradle, /com\.google\.android\.gms:play-services-auth:/);

  assert.match(plugin, /GetSignInWithGoogleOption/);
  assert.match(plugin, /CredentialManager\.create/);
  assert.match(plugin, /GoogleIdTokenCredential\.createFrom/);
  assert.match(plugin, /getIdToken\(\)/);
  assert.match(plugin, /getEmail\(\)/);
  assert.match(activity, /registerPlugin\(SoulCodexGoogleAuthPlugin\.class\)/);

  assert.match(settings, /GoogleSignInButton/);
  assert.match(settings, /authProvider === "google"/);
  assert.match(privacy, /Identity providers:/);
});

test("Google OAuth configuration stays server-owned", () => {
  const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const client = readFileSync(new URL("../client/src/lib/googleAuth.ts", import.meta.url), "utf8");
  const server = readFileSync(new URL("../server/routes/consumer-auth.ts", import.meta.url), "utf8");

  assert.match(envExample, /GOOGLE_OAUTH_WEB_CLIENT_ID=/);
  assert.match(server, /process\.env\.GOOGLE_OAUTH_WEB_CLIENT_ID/);
  assert.doesNotMatch(client, /apps\.googleusercontent\.com/);
});

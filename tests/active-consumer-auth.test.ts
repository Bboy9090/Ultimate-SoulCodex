import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import session from "express-session";
import { MemStorage } from "../server/storage";
import { registerConsumerAuthRoutes } from "../server/routes/consumer-auth";
import {
  AppleAuthConfigurationError,
  AppleAuthVerificationError,
  verifyAppleIdentityToken,
} from "../server/auth/apple";

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
  const raw = response.headers.get("set-cookie") || "";
  return raw.split(";")[0];
}

test("Apple verifier is fail-closed when server audience is missing", async () => {
  const previous = process.env.APPLE_CLIENT_ID;
  delete process.env.APPLE_CLIENT_ID;
  try {
    await assert.rejects(
      () => verifyAppleIdentityToken("token", async () => ({ sub: "apple-subject" })),
      AppleAuthConfigurationError,
    );
  } finally {
    if (previous === undefined) delete process.env.APPLE_CLIENT_ID;
    else process.env.APPLE_CLIENT_ID = previous;
  }
});

test("Apple verifier normalizes verified subject and email", async () => {
  const previous = process.env.APPLE_CLIENT_ID;
  process.env.APPLE_CLIENT_ID = "com.soulcodex.app";
  try {
    const identity = await verifyAppleIdentityToken("token", async (_token, options) => {
      assert.equal(options.audience, "com.soulcodex.app");
      assert.equal(options.ignoreExpiration, false);
      return { sub: "apple-subject-1", email: "person@example.com" };
    });
    assert.deepEqual(identity, { subject: "apple-subject-1", email: "person@example.com" });
  } finally {
    if (previous === undefined) delete process.env.APPLE_CLIENT_ID;
    else process.env.APPLE_CLIENT_ID = previous;
  }
});

test("Apple verifier rejects claims without a stable subject", async () => {
  const previous = process.env.APPLE_CLIENT_ID;
  process.env.APPLE_CLIENT_ID = "com.soulcodex.app";
  try {
    await assert.rejects(
      () => verifyAppleIdentityToken("token", async () => ({ email: "person@example.com" })),
      AppleAuthVerificationError,
    );
  } finally {
    if (previous === undefined) delete process.env.APPLE_CLIENT_ID;
    else process.env.APPLE_CLIENT_ID = previous;
  }
});

test("active Apple auth rotates session, migrates anonymous profile, exposes safe current user, and logs out", async () => {
  const storage = new MemStorage();
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: "active-auth-contract-secret",
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
    verifyApple: async (token) => {
      assert.equal(token, "verified-apple-token");
      return { subject: "apple-subject-42", email: "verified@example.com" };
    },
  });

  await withServer(app, async (baseUrl) => {
    const bootstrap = await fetch(`${baseUrl}/__test/session`, { method: "POST" });
    assert.equal(bootstrap.status, 200);
    const firstCookie = cookieFrom(bootstrap);
    assert.match(firstCookie, /^connect\.sid=/);
    const { sessionId } = await bootstrap.json() as { sessionId: string };

    const anonymousProfile = await storage.createProfile({
      sessionId,
      userId: null,
      name: "Persistent Soul",
      birthDate: new Date("1990-09-17T00:00:00.000Z"),
    });

    const login = await fetch(`${baseUrl}/api/auth/apple`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: firstCookie },
      body: JSON.stringify({ identityToken: "verified-apple-token" }),
    });
    const loginText = await login.text();
    assert.equal(login.status, 200, loginText);
    const loginBody = JSON.parse(loginText) as any;
    assert.equal(loginBody.user.email, "verified@example.com");
    assert.equal("password" in loginBody.user, false);
    assert.equal(loginBody.user.username, "apple:apple-subject-42");

    const authenticatedCookie = cookieFrom(login);
    assert.match(authenticatedCookie, /^connect\.sid=/);
    assert.notEqual(authenticatedCookie, firstCookie, "session id must rotate after authentication");

    const migrated = await storage.getProfile(anonymousProfile.id);
    assert.equal(migrated?.userId, loginBody.user.id);
    assert.equal(migrated?.sessionId, null);

    const current = await fetch(`${baseUrl}/api/auth/user`, { headers: { Cookie: authenticatedCookie } });
    assert.equal(current.status, 200);
    const currentBody = await current.json() as any;
    assert.equal(currentBody.id, loginBody.user.id);
    assert.equal(currentBody.authProvider, "apple");
    assert.equal("password" in currentBody, false);

    const alias = await fetch(`${baseUrl}/api/user`, { headers: { Cookie: authenticatedCookie } });
    assert.equal((await alias.json() as any).id, loginBody.user.id);

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: authenticatedCookie },
    });
    assert.equal(logout.status, 200);

    const afterLogout = await fetch(`${baseUrl}/api/auth/user`, { headers: { Cookie: authenticatedCookie } });
    assert.equal(afterLogout.status, 200);
    assert.equal(await afterLogout.json(), null);
  });
});

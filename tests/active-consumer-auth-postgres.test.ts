import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { setupSession } from "../server/session";
import { registerConsumerAuthRoutes } from "../server/routes/consumer-auth";
import { storage } from "../server/storage";

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

test("PostgreSQL active auth migrates session profile into canonical Apple user", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required");
  assert.ok(process.env.SESSION_SECRET, "SESSION_SECRET is required");

  const app = express();
  app.use(express.json());
  setupSession(app);
  app.post("/__auth/session", (req: any, res) => {
    req.session.started = true;
    res.json({ sessionId: req.sessionID });
  });
  registerConsumerAuthRoutes(app, {
    storage,
    verifyApple: async () => ({ subject: `postgres-subject-${Date.now()}`, email: "postgres-auth@example.com" }),
  });

  await withServer(app, async (baseUrl) => {
    const bootstrap = await fetch(`${baseUrl}/__auth/session`, { method: "POST" });
    assert.equal(bootstrap.status, 200);
    const bootstrapCookie = cookieFrom(bootstrap);
    const { sessionId } = await bootstrap.json() as { sessionId: string };

    const profile = await storage.createProfile({
      sessionId,
      userId: null,
      name: "Postgres Auth Profile",
      birthDate: new Date("1990-09-17T00:00:00.000Z"),
    });

    const login = await fetch(`${baseUrl}/api/auth/apple`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: bootstrapCookie },
      body: JSON.stringify({ identityToken: "ci-injected-verified-token" }),
    });
    assert.equal(login.status, 200, await login.text());
    const loginBody = await login.json() as any;
    const authCookie = cookieFrom(login);

    const migrated = await storage.getProfile(profile.id);
    assert.equal(migrated?.userId, loginBody.user.id);
    assert.equal(migrated?.sessionId, null);

    const current = await fetch(`${baseUrl}/api/auth/user`, { headers: { Cookie: authCookie } });
    assert.equal(current.status, 200);
    const currentBody = await current.json() as any;
    assert.equal(currentBody.id, loginBody.user.id);
    assert.equal(currentBody.authProvider, "apple");
    assert.equal("password" in currentBody, false);

    await storage.deleteUserAccount(loginBody.user.id);
  });
});

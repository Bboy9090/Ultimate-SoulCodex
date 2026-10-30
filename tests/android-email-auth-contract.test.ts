import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import session from "express-session";
import { readFileSync } from "node:fs";
import { MemStorage } from "../server/storage";
import { registerConsumerAuthRoutes } from "../server/routes/consumer-auth";

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

test("canonical email signup and login rotate sessions and expose a safe local auth user", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousDemoMode = process.env.DEMO_MODE;
  delete process.env.DATABASE_URL;
  process.env.DEMO_MODE = "true";
  try {
    const storage = new MemStorage();
    const app = express();
    app.use(express.json());
    app.use(session({
      secret: "android-email-auth-contract",
      resave: false,
      saveUninitialized: true,
      cookie: { httpOnly: true, sameSite: "lax" },
    }));

    registerConsumerAuthRoutes(app, {
      storage,
      verifyApple: async () => ({ subject: "unused" }),
    });

    await withServer(app, async (baseUrl) => {
      const signup = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "Android.User@Example.com", password: "correct-horse", name: "Android User" }),
      });
      const signupText = await signup.text();
      assert.equal(signup.status, 200, signupText);
      const signupBody = JSON.parse(signupText) as any;
      assert.equal(signupBody.user.email, "android.user@example.com");
      assert.equal(signupBody.user.username, "email:android.user@example.com");
      assert.equal("password" in signupBody.user, false);

      const signupCookie = cookieFrom(signup);
      const current = await fetch(`${baseUrl}/api/auth/user`, { headers: { Cookie: signupCookie } });
      const currentBody = await current.json() as any;
      assert.equal(currentBody.authProvider, "local");
      assert.equal(currentBody.email, "android.user@example.com");

      const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST", headers: { Cookie: signupCookie } });
      assert.equal(logout.status, 200);

      const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "android.user@example.com", password: "wrong-password" }),
      });
      assert.equal(badLogin.status, 401);

      const login = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "android.user@example.com", password: "correct-horse" }),
      });
      assert.equal(login.status, 200, await login.clone().text());
      assert.match(cookieFrom(login), /^connect\.sid=/);
    });
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousDemoMode === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = previousDemoMode;
  }
});

test("Settings treats Android as Android rather than Apple-capable native", () => {
  const source = readFileSync(new URL("../client/src/pages/SettingsPage.tsx", import.meta.url), "utf8");
  assert.match(source, /const nativeApple = platform === "ios"/);
  assert.match(source, /const showAppleSignIn = platform !== "android"/);
  assert.match(source, /<EmailAccountAuth \/>/);
  assert.doesNotMatch(source, /const nativeApple = Capacitor\.isNativePlatform\(\)/);
});

test("signup storage lookup failure returns a bounded error and leaves the server healthy", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousDemoMode = process.env.DEMO_MODE;
  delete process.env.DATABASE_URL;
  process.env.DEMO_MODE = "true";
  try {
    class FailingLookupStorage extends MemStorage {
      override async getUserByUsername(_username: string): Promise<never> {
        throw new Error("test_storage_lookup_unavailable");
      }
    }
    const app = express();
    app.use(express.json());
    app.use(session({ secret: "review-auth-error-contract", resave: false, saveUninitialized: true }));
    registerConsumerAuthRoutes(app, { storage: new FailingLookupStorage(), verifyApple: async () => ({ subject: "unused" }) });
    app.get("/health-proof", (_req, res) => res.json({ healthy: true }));
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "review@example.com", password: "strong-test-only-password" }),
        signal: AbortSignal.timeout(5000),
      });
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { message: "Could not create account" });
      assert.equal((await fetch(`${baseUrl}/health-proof`)).status, 200);
    });
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousDemoMode === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = previousDemoMode;
  }
});

test("six and seven character server-accepted passwords can sign in and the form has the same minimum", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousDemoMode = process.env.DEMO_MODE;
  delete process.env.DATABASE_URL;
  process.env.DEMO_MODE = "true";
  try {
    const app = express();
    app.use(express.json());
    app.use(session({ secret: "review-auth-password-contract", resave: false, saveUninitialized: true }));
    registerConsumerAuthRoutes(app, { storage: new MemStorage(), verifyApple: async () => ({ subject: "unused" }) });
    await withServer(app, async (baseUrl) => {
      for (const password of ["abc123", "abc1234"]) {
        const body = JSON.stringify({ email: `length${password.length}@example.com`, password });
        for (const endpoint of ["signup", "login"]) {
          const response = await fetch(`${baseUrl}/api/auth/${endpoint}`, {
            method: "POST", headers: { "content-type": "application/json" }, body,
          });
          assert.equal(response.status, 200, await response.clone().text());
          assert.equal("password" in (await response.json() as any).user, false);
        }
      }
    });
    const source = readFileSync(new URL("../client/src/components/EmailAccountAuth.tsx", import.meta.url), "utf8");
    assert.match(source, /minLength=\{6\}/);
    assert.doesNotMatch(source, /minLength=\{8\}/);
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousDemoMode === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = previousDemoMode;
  }
});

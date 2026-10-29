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

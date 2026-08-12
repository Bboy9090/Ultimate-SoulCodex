import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { eq } from "drizzle-orm";

process.env.SESSION_SECRET ||= "gate4-production-deletion-secret";
process.env.NODE_ENV = "test";
delete process.env.DEMO_MODE;

async function countRows(db: any, table: any, column: any, value: string) {
  const rows = await db.select().from(table).where(eq(column, value));
  return rows.length;
}

async function withServer(app: express.Express, run: (baseUrl: string) => Promise<void>) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("test server did not bind a TCP port");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("Gate 4: real DELETE /api/auth/account purges PostgreSQL session-owned profile and redemption", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for persistent Gate 4 proof");

  const [{ registerRoutes }, { db }, schema] = await Promise.all([
    import("../routes"),
    import("../db"),
    import("../shared/schema"),
  ]);

  const sessionId = `gate4-session-${Date.now()}`;
  const profileId = `gate4-profile-${Date.now()}`;
  const redemptionId = `gate4-redemption-${Date.now()}`;

  await db.insert(schema.profiles).values({
    id: profileId,
    sessionId,
    name: "Gate 4 Persistent Delete",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
  });
  await db.insert(schema.accessCodeRedemptions).values({
    id: redemptionId,
    accessCodeId: "gate4-delete-proof",
    sessionId,
  });

  assert.equal(await countRows(db, schema.profiles, schema.profiles.sessionId, sessionId), 1);
  assert.equal(await countRows(db, schema.accessCodeRedemptions, schema.accessCodeRedemptions.sessionId, sessionId), 1);

  const app = express();
  app.use(express.json());
  await registerRoutes(app);

  // Inject the known session id immediately before the production deletion handler.
  // This preserves the real route and HybridStorage implementation while avoiding
  // dependence on a pre-seeded connect-pg-simple session row.
  app._router.stack.splice(
    app._router.stack.findIndex((layer: any) => layer.route?.path === "/api/auth/account"),
    0,
    {
      route: undefined,
      name: "gate4SessionFixture",
      handle(req: any, _res: any, next: any) {
        Object.defineProperty(req, "sessionID", { value: sessionId, configurable: true });
        next();
      },
      regexp: /^\/api\/auth\/account\/?$/i,
      keys: [],
      params: undefined,
      path: undefined,
      match(path: string) { return /^\/api\/auth\/account\/?$/i.test(path); },
    } as any,
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/account`, { method: "DELETE" });
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
  });

  assert.equal(await countRows(db, schema.profiles, schema.profiles.sessionId, sessionId), 0);
  assert.equal(await countRows(db, schema.accessCodeRedemptions, schema.accessCodeRedemptions.sessionId, sessionId), 0);
});

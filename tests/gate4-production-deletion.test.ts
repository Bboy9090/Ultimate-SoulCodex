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

function reportDriverCause(error: unknown) {
  const candidate = error as any;
  const cause = candidate?.cause;
  if (cause) {
    console.error("[Gate4DBCause]", {
      name: cause.name,
      message: cause.message,
      code: cause.code,
      detail: cause.detail,
      constraint: cause.constraint,
    });
  }
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

test("Gate 4: active DELETE /api/auth/account purges session-owned PostgreSQL data", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for persistent Gate 4 proof");

  const [{ registerRoutes }, { db }, schema] = await Promise.all([
    import("../server/routes"),
    import("../server/db"),
    import("../shared/schema"),
  ]);

  const app = express();
  app.use(express.json());
  await registerRoutes(app);

  // Test-only session bootstrap registered after production routes. It uses the
  // exact active express-session middleware and returns the server-owned id.
  app.post("/__gate4/session", (req: any, res) => {
    req.session.gate4Proof = true;
    res.json({ sessionId: req.sessionID });
  });

  await withServer(app, async (baseUrl) => {
    const sessionResponse = await fetch(`${baseUrl}/__gate4/session`, { method: "POST" });
    assert.equal(sessionResponse.status, 200);
    const { sessionId } = await sessionResponse.json() as { sessionId: string };
    assert.ok(sessionId);

    const setCookie = sessionResponse.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0];
    assert.match(cookie, /^connect\.sid=/);

    const profileId = `gate4-profile-${Date.now()}`;
    const redemptionId = `gate4-redemption-${Date.now()}`;

    try {
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
    } catch (error) {
      reportDriverCause(error);
      throw error;
    }

    assert.equal(await countRows(db, schema.profiles, schema.profiles.sessionId, sessionId), 1);
    assert.equal(await countRows(db, schema.accessCodeRedemptions, schema.accessCodeRedemptions.sessionId, sessionId), 1);

    const response = await fetch(`${baseUrl}/api/auth/account`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));

    assert.equal(await countRows(db, schema.profiles, schema.profiles.sessionId, sessionId), 0);
    assert.equal(await countRows(db, schema.accessCodeRedemptions, schema.accessCodeRedemptions.sessionId, sessionId), 0);
  });
});

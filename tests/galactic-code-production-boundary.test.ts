import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import express from "express";
import { registerGalacticCodeRoutes } from "../server/routes/galactic-code.ts";

const productionRoutes = readFileSync("server/routes.ts", "utf8");

async function withServer(run: (base: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  registerGalacticCodeRoutes(app);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("Galactic Code remains unregistered in production until trusted evidence is integrated", () => {
  assert.doesNotMatch(productionRoutes, /registerGalacticCodeRoutes\(app\)/);
});

test("client-asserted verified inputs never generate a Galactic Code", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/galactic-code/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: "other-user-profile",
        birthDate: "1990-09-17",
        astrology: { evidenceState: "verified", coverage: "complete", sun: "Virgo", rising: "Scorpio" },
        humanDesign: { evidenceState: "verified", coverage: "complete", type: "Reflector", authority: "Lunar", strategy: "To wait a lunar cycle", profile: "2/5" },
        numerology: { evidenceState: "deterministic", coverage: "complete", lifePath: 9 },
        behavior: { evidenceState: "assessed", traits: ["verified-by-client"] },
      }),
    });
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error, "trusted_evidence_required");
    assert.equal(response.headers.get("set-cookie"), null);
  });
});

test("Galactic Code GET does not expose nonexistent or cross-user stored results", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/galactic-code/other-user-profile`);
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.fingerprint, undefined);
    assert.equal(body.shortCode, undefined);
  });
});

test("incomplete or malformed caller inputs cannot bypass the blocked generation route", async () => {
  await withServer(async (base) => {
    for (const input of [{}, { profileId: "p" }, { profileId: "p", astrology: {}, humanDesign: {}, numerology: {}, behavior: {} }]) {
      const response = await fetch(`${base}/api/galactic-code/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      assert.ok([400, 409].includes(response.status));
      assert.notEqual(response.status, 200);
    }
  });
});

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import express from "express";
import type { Server } from "node:http";
import compatibilityRouter from "../server/routes/compatibility";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-16T00:00:00Z",
};

let server: Server;
let base = "";

describe("Compatibility HTTP contract", () => {
  before(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", compatibilityRouter);
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("test server did not expose a TCP port");
    base = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("exposes the versioned Compatibility ping", async () => {
    const response = await fetch(`${base}/api/compatibility/ping`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, contract: "foundation-compatibility-v1" });
  });

  it("returns all 12 symbolic matches over the actual Express route", async () => {
    const response = await fetch(`${base}/api/compatibility/archetype-matches`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        profile: {
          astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } },
          lifePathNumber: 11,
        },
        mode: "love",
      }),
    });
    assert.equal(response.status, 200);
    const body: any = await response.json();
    assert.equal(body.available, true);
    assert.equal(body.all.length, 12);
    assert.equal(body.formula.id, "foundation-compatibility-v1");
    assert.equal(body.formula.inputs.lifePathNumber, 11);
    assert.equal(Object.prototype.hasOwnProperty.call(body, "overallScore"), false);
  });

  it("returns the four direct-person dimensions over HTTP", async () => {
    const response = await fetch(`${base}/api/compatibility/person`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        profile: { astrologyData: { sunSign: "Virgo" }, lifePathNumber: 22 },
        otherPerson: { name: "Audit Partner", sunSign: "Pisces" },
      }),
    });
    assert.equal(response.status, 200);
    const body: any = await response.json();
    assert.equal(body.available, true);
    assert.equal(body.formula.inputs.lifePathNumber, 22);
    for (const key of ["romantic", "chemistry", "mentalFriendship", "growth"]) {
      assert.equal(typeof body.dimensions[key], "number", `missing numeric ${key}`);
    }
  });
});

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import express from "express";
import type { Server } from "node:http";
import compatibilityRouter, {
  COMPATIBILITY_FORMULA_VERSION,
} from "../server/routes/compatibility";

let server: Server;
let baseUrl = "";

before(async () => {
  const app = express();
  app.use(express.json({ limit: "64kb", strict: true }));
  app.use("/api", compatibilityRouter);
  app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to resolve integration-test server address"));
        return;
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.once("error", reject);
  });
});

after(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

describe("Compatibility HTTP integration", () => {
  it("mounts the production ping contract", async () => {
    const response = await fetch(`${baseUrl}/api/compatibility/ping`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.apiContract, "foundation-v4");
    assert.equal(body.formulaVersion, COMPATIBILITY_FORMULA_VERSION);
  });

  it("serves Explorer Compatibility through the actual Express router", async () => {
    const response = await fetch(`${baseUrl}/api/compatibility/archetype-matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          astrologyData: { sunSign: "Virgo" },
          numerologyData: { lifePath: 11 },
        },
        mode: "love",
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.available, true);
    assert.equal(body.formula.version, COMPATIBILITY_FORMULA_VERSION);
    assert.equal(body.formula.inputs.sunSign, "Virgo");
    assert.equal(body.formula.inputs.lifePathNumber, 11);
    assert.equal(body.all.length, 12);
    assert.equal(Object.prototype.hasOwnProperty.call(body, "overallScore"), false);
  });

  it("serves person comparison dimensions through the actual Express router", async () => {
    const response = await fetch(`${baseUrl}/api/compatibility/person`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          astrologyData: { sunSign: "Virgo" },
          numerologyData: { lifePath: 22 },
        },
        otherPerson: {
          name: "Integration Partner",
          sunSign: "Pisces",
        },
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.available, true);
    assert.equal(body.formula.inputs.lifePathNumber, 22);
    for (const key of ["romantic", "chemistry", "mentalFriendship", "growth"]) {
      assert.equal(typeof body.dimensions[key], "number");
    }
    assert.equal(Object.prototype.hasOwnProperty.call(body, "overallScore"), false);
  });

  it("fails closed on missing profile rather than accepting naked sign strings", async () => {
    const response = await fetch(`${baseUrl}/api/compatibility/archetype-matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sunSign: "Virgo", mode: "love" }),
    });
    assert.equal(response.status, 400);
  });
});

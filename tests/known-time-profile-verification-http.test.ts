import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { registerProfileVerificationRoutes } from "../server/routes/profile-verification.ts";
import { calculateAstrology } from "../server/services/astrology.ts";
import { generateFoundationOfflineCodexProfile } from "../client/src/lib/foundationOfflineCodex.ts";
import { hasVerifiedHumanDesignTrust, reconcileOfflineProfile } from "../client/src/lib/profileVerificationReconciliation.ts";
import { calculateKnownTimeHumanDesign } from "../server/routes/profile-verification.ts";
import { resolveCivilTimeStrict } from "../packages/core/compute/civil-time.ts";

const input = {
  birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York",
  latitude: 40.8448, longitude: -73.8648,
};

test("first verification POST calculates real HD and feeds the saved full synthesis", async () => {
  const realFetch = globalThis.fetch;
  const candidate = calculateAstrology(input);
  const commandBodies: Record<string, string> = {
    "10": "sun", "301": "moon", "199": "mercury", "299": "venus", "499": "mars",
    "599": "jupiter", "699": "saturn", "799": "uranus", "899": "neptune", "999": "pluto",
  };
  // Only the external astronomy reference is simulated. Real HTTP routing,
  // deterministic HD calculation, trust qualification, and reconciliation run.
  globalThis.fetch = async (resource, options) => {
    const url = new URL(String(resource));
    if (url.hostname !== "ssd.jpl.nasa.gov") return realFetch(resource, options);
    const command = (url.searchParams.get("COMMAND") ?? "").replaceAll("'", "");
    const longitude = command.startsWith("DES=") ? 115.3498
      : (candidate.planets as any)[commandBodies[command]].internalCandidate.longitude;
    return new Response(JSON.stringify({
      signature: { source: "NASA/JPL Horizons API test fixture", version: "1.3" },
      result: `Date__(UT)__HR:MN:SC.fff, ObsEcLon, ObsEcLat,\n$$SOE\n1990-Sep-17 15:11:00.000, ${longitude}, 0,\n$$EOE`,
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const app = express();
  app.use(express.json());
  registerProfileVerificationRoutes(app);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const endpoint = `http://127.0.0.1:${address.port}/api/verification/profile`;
  try {
    const response = await realFetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    });
    assert.equal(response.status, 200);
    const snapshot = await response.json();
    assert.equal(hasVerifiedHumanDesignTrust(snapshot.humanDesignData), true);
    assert.equal(snapshot.humanDesignData.type, "Reflector");
    assert.equal(snapshot.humanDesignData.authority, "Lunar Authority");
    assert.equal(snapshot.humanDesignData.profile, "2/5");
    assert.ok(snapshot.humanDesignData.activatedGates.length > 0);
    const saved = generateFoundationOfflineCodexProfile({
      ...input, name: "HTTP Profile", birthLocation: "Bronx, New York",
      latitude: String(input.latitude), longitude: String(input.longitude),
    });
    const reconciled = reconcileOfflineProfile(saved, snapshot);
    assert.ok(reconciled.depthInterpretation.evidence.some((entry) => entry.id === "verified.human-design.core"));
    assert.match(reconciled.biography, /Reflector/);
    assert.match(reconciled.biography, /Lunar Authority/);
    assert.match(reconciled.biography, /2\/5/);
    assert.deepEqual(reconciled.humanDesignData?.activatedGates, snapshot.humanDesignData.activatedGates);
    assert.equal(snapshot.processing.persistedProfile, false);

    // Rejected civil input is explicit through HTTP; it cannot masquerade as
    // a successfully calculated profile with a null Human Design.
    const failed = await realFetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, birthDate: "2024-03-10", birthTime: "02:30" }),
    });
    assert.equal(failed.status, 400);
    const failure = await failed.json();
    assert.equal(failure.message, "Verification request is invalid");
    assert.match(JSON.stringify(failure.issues), /nonexistent/);
    assert.equal(Object.hasOwn(failure, "humanDesignData"), false);
  } finally {
    globalThis.fetch = realFetch;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("UTC-equivalent database aliases preserve the same HD instant and activations", () => {
  const utcInput = { ...input, birthTime: "15:11", latitude: 0, longitude: 0 };
  const reference = calculateKnownTimeHumanDesign({ ...utcInput, timezone: "Etc/UTC" });
  for (const timezone of ["UTC", "UCT", "Etc/UCT", "Universal", "Zulu", "Greenwich", "GMT", "Etc/GMT"]) {
    const actual = calculateKnownTimeHumanDesign({ ...utcInput, timezone });
    assert.equal(actual.type, reference.type, timezone);
    assert.equal(actual.authority, reference.authority, timezone);
    assert.equal(actual.profile, reference.profile, timezone);
    assert.deepEqual(actual.activations, reference.activations, timezone);
    assert.deepEqual(actual.centers, reference.centers, timezone);
    assert.deepEqual(actual.channels, reference.channels, timezone);
  }
});

test("summer EST preserves the exact civil instant rather than adopting New York daylight time", () => {
  const summer = { ...input, birthDate: "1990-06-17", birthTime: "11:11" };
  const estCivil = resolveCivilTimeStrict(summer.birthDate, summer.birthTime, "EST");
  const fixedCivil = resolveCivilTimeStrict(summer.birthDate, summer.birthTime, "Etc/GMT+5");
  assert.equal(estCivil.status, "valid");
  assert.equal(estCivil.utc?.toISOString(), "1990-06-17T16:11:00.000Z");
  assert.equal(estCivil.utc?.toISOString(), fixedCivil.utc?.toISOString());
  const est = calculateKnownTimeHumanDesign({ ...summer, timezone: "EST" });
  const fixed = calculateKnownTimeHumanDesign({ ...summer, timezone: "Etc/GMT+5" });
  const utc = calculateKnownTimeHumanDesign({ ...summer, birthTime: "16:11", timezone: "UTC" });
  assert.deepEqual(est.activations, fixed.activations);
  assert.deepEqual(est.activations, utc.activations);
  assert.equal(est.type, fixed.type);
  assert.equal(est.authority, fixed.authority);
  assert.equal(est.profile, fixed.profile);
});

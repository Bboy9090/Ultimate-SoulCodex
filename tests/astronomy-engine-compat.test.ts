import assert from "node:assert/strict";
import test from "node:test";
import { Body, Ecliptic, GeoVector, SiderealTime } from "../server/services/astronomy-engine-compat";
import { calculateAstrology, calculateVerifiedAstrology } from "../server/services/astrology-production";

test("astronomy-engine compatibility adapter exports all required functions", () => {
  assert.ok(typeof Body === "object", "Body enum must exist");
  assert.ok(Body.Sun !== undefined, "Body.Sun must exist");
  assert.ok(typeof Ecliptic === "function", "Ecliptic must be a function");
  assert.ok(typeof GeoVector === "function", "GeoVector must be a function");
  assert.ok(typeof SiderealTime === "function", "SiderealTime must be a function");
});

test("GeoVector and Ecliptic execute successfully", () => {
  const timestamp = new Date("1990-09-17T15:11:00.000Z");
  const vector = GeoVector(Body.Sun as any, timestamp, true);
  assert.ok(vector, "GeoVector must return a vector");
  assert.ok(vector.x !== undefined, "vector.x must exist");
  assert.ok(vector.y !== undefined, "vector.y must exist");
  assert.ok(vector.z !== undefined, "vector.z must exist");

  const ecliptic = Ecliptic(vector);
  assert.ok(ecliptic, "Ecliptic must return coordinates");
  assert.ok(typeof ecliptic.elon === "number", "elon must be a number");
  assert.ok(typeof ecliptic.elat === "number", "elat must be a number");
});

test("calculateAstrology executes through the adapter", () => {
  const result = calculateAstrology({
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: 40.8448,
    longitude: -73.8648,
  });

  assert.ok(result.sun, "Sun placement must exist");
  assert.ok(result.sun.internalCandidate, "Sun must have internal candidate");
  assert.equal(result.sun.internalCandidate.sign, "Virgo", "Sun sign must be Virgo");
  assert.ok(result.moon, "Moon placement must exist");
  assert.ok(result.moon.internalCandidate, "Moon must have internal candidate");
  assert.equal(result.moon.internalCandidate.sign, "Virgo", "Moon sign must be Virgo");
});

test("calculateVerifiedAstrology executes through the adapter", async () => {
  const result = await calculateVerifiedAstrology(
    {
      birthDate: "1990-09-17",
      birthTime: "11:11",
      timezone: "America/New_York",
      latitude: 40.8448,
      longitude: -73.8648,
    },
    {
      referenceFetcher: async (body, inputTimestamp) => ({
        body,
        sign: body === "Sun" ? "Virgo" : "Virgo",
        longitude: 174.27,
        source: "Mock reference",
        engine: "mock-engine@1.0.0",
        calculatedAt: new Date().toISOString(),
        inputTimestamp,
      }),
    },
  );

  assert.ok(result.sun, "Sun placement must exist");
  assert.ok(result.moon, "Moon placement must exist");
  assert.ok(result.verification, "Verification metadata must exist");
});

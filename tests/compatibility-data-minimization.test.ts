import assert from "node:assert/strict";
import test from "node:test";
import { buildCompatibilityProfilePayload } from "../client/src/lib/compatibilityProfilePayload.ts";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-14T00:00:00Z",
};

test("compatibility payload keeps only supported symbolic Sun while dropping unrelated personal data", () => {
  const payload = buildCompatibilityProfilePayload({
    id: "local-secret-id",
    name: "Private Name",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    birthLocation: "Bronx, New York",
    biography: "Private biography",
    astrologyData: {
      sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      sunSign: "Virgo",
      moon: { sign: "Virgo" },
      rising: { sign: "Scorpio" },
    },
    numerologyData: { lifePath: 9, expression: 1, soulUrge: 7 },
    humanDesignType: "Reflector",
  });

  assert.deepEqual(payload, {
    astrologyData: {
      sunSign: "Virgo",
    },
  });

  const serialized = JSON.stringify(payload);
  for (const forbidden of [
    "Private Name",
    "1990-09-17",
    "11:11",
    "Bronx, New York",
    "Private biography",
    "moon",
    "rising",
    "humanDesign",
    "expression",
    "soulUrge",
    "numerologyData",
    "lifePathNumber",
    "verificationStatus",
    "independent ephemeris comparison",
    "engine-a+engine-b",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `${forbidden} leaked into compatibility payload`);
  }
});

test("symbolic-only profiles are reduced to symbolic Sun only", () => {
  assert.deepEqual(
    buildCompatibilityProfilePayload({
      sunSign: "Pisces",
      lifePathNumber: 3,
      name: "Do not send me",
    }),
    {
      astrologyData: { sunSign: "Pisces" },
    },
  );
});

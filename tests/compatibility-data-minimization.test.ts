import assert from "node:assert/strict";
import test from "node:test";
import { buildCompatibilityProfilePayload } from "../client/src/lib/compatibilityProfilePayload.ts";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-14T00:00:00Z",
};

test("compatibility payload keeps supported Sun evidence and Life Path while dropping unrelated personal data", () => {
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
      sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      sunSign: "Virgo",
    },
    lifePathNumber: 9,
    numerologyData: { lifePath: 9 },
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
  ]) {
    assert.equal(serialized.includes(forbidden), false, `${forbidden} leaked into compatibility payload`);
  }
});

test("symbolic-only profiles are reduced to symbolic Sun and optional Life Path", () => {
  assert.deepEqual(
    buildCompatibilityProfilePayload({
      sunSign: "Pisces",
      lifePathNumber: 3,
      name: "Do not send me",
    }),
    {
      astrologyData: { sunSign: "Pisces" },
      lifePathNumber: 3,
      numerologyData: { lifePath: 3 },
    },
  );
});

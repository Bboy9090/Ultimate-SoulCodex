import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { calculatePersonalTransitsFromProfile } from "../packages/astrology/horoscope";

test("daily horoscope personal transits require verified natal geometry", () => {
  const rawLegacyProfile = {
    astrologyData: {
      sunSign: "Virgo",
      moonSign: "Scorpio",
      planets: {
        sun: { sign: "Virgo", longitude: 174 },
      },
    },
  };

  assert.deepEqual(
    calculatePersonalTransitsFromProfile(rawLegacyProfile, new Date("2026-09-25T12:00:00Z")),
    [],
  );
});

test("daily horoscope may calculate personal transits from verified natal placements", () => {
  const profile = {
    astrologyData: {
      planets: {
        sun: {
          sign: "Virgo",
          longitude: 174,
          verificationStatus: "verified",
          evidence: {
            source: "independent reference",
            engine: "verified-test-engine",
            calculatedAt: "2026-09-25T12:00:00.000Z",
          },
        },
      },
    },
  };

  const transits = calculatePersonalTransitsFromProfile(
    profile,
    new Date("2026-09-25T12:00:00Z"),
  );
  assert.ok(Array.isArray(transits));
});


test("daily horoscope AI prompt cannot consume natal Sun/Moon through a weaker local verifier", () => {
  const source = readFileSync("packages/astrology/horoscope.ts", "utf8");

  assert.doesNotMatch(source, /function verifiedNatalSign/);
  assert.doesNotMatch(source, /Verified natal Sun:/);
  assert.doesNotMatch(source, /Verified natal Moon:/);
  assert.match(source, /Natal Sun\/Moon are not supplied here; do not infer them/);
  assert.match(source, /Verified-natal personal transits:/);
});

import assert from "node:assert/strict";
import test from "node:test";
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

import assert from "node:assert/strict";
import test from "node:test";
import { calcPersonalDay } from "@soulcodex/core";
import { calculatePersonalDayNumber } from "../services/daily-context";
import {
  extractVerifiedNatalPositions,
  calculatePersonalTransitsFromProfile,
} from "../services/horoscope";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

test("daily horoscope evidence and numerology contract", async (suite) => {
  await suite.test("live service Personal Day delegates to canonical date-only math", () => {
    const birthDate = "1990-09-17";
    const target = new Date("2026-09-26T12:00:00.000Z");

    assert.equal(
      calculatePersonalDayNumber(birthDate, target),
      calcPersonalDay(birthDate, target),
    );
  });

  await suite.test("unverified natal aliases and candidates cannot become transit anchors", () => {
    const profile = {
      astrologyData: {
        sunSign: "Virgo",
        moonSign: "Pisces",
        planets: {
          sun: {
            sign: "Virgo",
            longitude: 174.2,
            verificationStatus: "pending_independent_verification",
          },
          moon: {
            sign: "Pisces",
            longitude: 350.1,
            verificationStatus: "calculated",
          },
        },
        rising: {
          sign: "Scorpio",
          longitude: 220,
          verificationStatus: "verified",
        },
      },
    };

    assert.deepEqual(extractVerifiedNatalPositions(profile), {});
    assert.deepEqual(
      calculatePersonalTransitsFromProfile(profile, new Date("2026-09-26T12:00:00.000Z")),
      [],
    );
  });

  await suite.test("verified placements require provenance and retain their actual longitude", () => {
    const profile = {
      astrologyData: {
        planets: {
          sun: {
            sign: "Virgo",
            verificationStatus: "verified",
            evidence,
            internalCandidate: { longitude: 174.2 },
          },
          mercury: {
            sign: "Libra",
            verificationStatus: "verified",
            evidence,
            internalCandidate: { longitude: 185.5 },
          },
        },
        moon: {
          sign: "Cancer",
          verificationStatus: "verified",
          evidence,
          internalCandidate: { longitude: 95.25 },
        },
        rising: {
          sign: "Scorpio",
          verificationStatus: "verified",
          evidence,
          internalCandidate: { longitude: 220 },
        },
        midheaven: {
          sign: "Leo",
          verificationStatus: "verified",
          evidence,
          longitude: 130,
        },
      },
    };

    assert.deepEqual(extractVerifiedNatalPositions(profile), {
      Sun: { longitude: 174.2, sign: "Virgo" },
      Mercury: { longitude: 185.5, sign: "Libra" },
      Moon: { longitude: 95.25, sign: "Cancer" },
      Ascendant: { longitude: 220, sign: "Scorpio" },
      Midheaven: { longitude: 130, sign: "Leo" },
    });
  });

  await suite.test("verified label without evidence remains excluded", () => {
    const profile = {
      astrologyData: {
        planets: {
          venus: {
            sign: "Leo",
            verificationStatus: "verified",
            internalCandidate: { longitude: 145 },
          },
        },
      },
    };

    assert.deepEqual(extractVerifiedNatalPositions(profile), {});
  });
});

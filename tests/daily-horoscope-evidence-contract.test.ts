import assert from "node:assert/strict";
import test from "node:test";
import { calcPersonalDay } from "@soulcodex/core";
import { calculatePersonalDayNumber } from "../services/daily-context";
import { calculatePersonalTransitsFromProfile } from "../services/horoscope";
import { extractNatalPositions } from "../transits";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

test("daily horoscope evidence and numerology contract", async (suite) => {
  await suite.test("service Personal Day delegates to canonical date-only math", () => {
    const birthDate = "1990-09-17";
    const target = new Date("2026-09-26T12:00:00.000Z");
    assert.equal(calculatePersonalDayNumber(birthDate, target), calcPersonalDay(birthDate, target));
  });

  await suite.test("status-only natal candidates cannot become transit anchors", () => {
    const astrologyData = {
      planets: {
        sun: { sign: "Virgo", longitude: 174.2, verificationStatus: "verified" },
        moon: { sign: "Pisces", longitude: 350.1, verificationStatus: "calculated" },
      },
      rising: { sign: "Scorpio", longitude: 220, verificationStatus: "verified" },
    };
    assert.deepEqual(extractNatalPositions(astrologyData), {});
    assert.deepEqual(
      calculatePersonalTransitsFromProfile({ astrologyData }, new Date("2026-09-26T12:00:00.000Z")),
      [],
    );
  });

  await suite.test("complete placement provenance retains verified natal geometry", () => {
    const astrologyData = {
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
        moon: {
          sign: "Cancer",
          verificationStatus: "verified",
          evidence,
          internalCandidate: { longitude: 95.25 },
        },
      },
      rising: {
        sign: "Scorpio",
        verificationStatus: "verified",
        evidence,
        internalCandidate: { longitude: 220 },
      },
      midheaven: {
        sign: "Leo",
        longitude: 130,
        verificationStatus: "verified",
        policyId: "ASTRO-EQUAL-HOUSE-v1",
        evidenceArtifactId: "equal-house-fixture",
      },
    };

    const positions = extractNatalPositions(astrologyData);
    const expected = {
      Sun: { longitude: 174.2, sign: "Virgo" },
      Mercury: { longitude: 185.5, sign: "Libra" },
      Moon: { longitude: 95.25, sign: "Cancer" },
      Ascendant: { longitude: 220, sign: "Scorpio" },
      Midheaven: { longitude: 130, sign: "Leo" },
    } as const;

    assert.deepEqual(Object.keys(positions).sort(), Object.keys(expected).sort());
    for (const [name, target] of Object.entries(expected)) {
      const actual = positions[name];
      assert.ok(actual, name);
      assert.equal(actual.sign, target.sign, name);
      assert.ok(
        Math.abs(actual.longitude - target.longitude) <= 1e-10,
        `${name} longitude drifted: ${actual.longitude} vs ${target.longitude}`,
      );
    }
  });

  await suite.test("wrong governed derived policy is excluded", () => {
    assert.deepEqual(extractNatalPositions({
      midheaven: {
        sign: "Leo",
        longitude: 130,
        verificationStatus: "verified",
        policyId: "ASTRO-UNKNOWN-v1",
        evidenceArtifactId: "fixture",
      },
    }), {});
  });
});

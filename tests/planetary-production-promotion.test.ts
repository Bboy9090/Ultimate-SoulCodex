import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  calculatePlanetaryCandidate,
  calculateVerifiedPlanetaryPlacements,
  PLANETARY_BODIES,
  PLANETARY_KEY_BY_BODY,
} from "../server/services/planetary-verification";
import { APPROVED_PLANETARY_POLICY } from "../server/services/planetary-tolerance-policy";
import { buildNatalReportInput } from "../server/lib/natal-report-contract";

const BIRTH = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
};

test("all eight major planets promote when independent evidence agrees", async () => {
  const placements = await calculateVerifiedPlanetaryPlacements(BIRTH, {
    policyForBody: () => APPROVED_PLANETARY_POLICY,
    evidenceReceiptId: "test-planetary-receipt",
    evidenceArtifactId: "test-planetary-artifact",
    referenceFetcher: async (body, inputTimestamp) => {
      const candidate = calculatePlanetaryCandidate(body, BIRTH);
      return {
        body,
        sign: candidate.sign,
        longitude: candidate.longitude + 0.0005,
        source: "independent-test-reference",
        engine: "independent-test-engine",
        calculatedAt: "2026-08-22T02:10:00.000Z",
        inputTimestamp,
      };
    },
  });

  for (const body of PLANETARY_BODIES) {
    const placement = placements[PLANETARY_KEY_BY_BODY[body]];
    assert.equal(placement.verificationStatus, "verified", body);
    assert.ok(placement.sign, body);
    assert.equal(placement.evidence?.policyId, "ASTRO-PLANETARY-LONGITUDE-v1");
    assert.equal(placement.evidence?.evidenceReceiptId, "test-planetary-receipt");
    assert.equal(placement.evidence?.evidenceArtifactId, "test-planetary-artifact");
  }
});

test("sign disagreement keeps a major planet candidate unpromoted", async () => {
  const placements = await calculateVerifiedPlanetaryPlacements(BIRTH, {
    policyForBody: () => APPROVED_PLANETARY_POLICY,
    referenceFetcher: async (body, inputTimestamp) => {
      const candidate = calculatePlanetaryCandidate(body, BIRTH);
      return {
        body,
        sign: body === "Mercury" ? "DefinitelyNotMercurySign" : candidate.sign,
        longitude: candidate.longitude,
        source: "independent-test-reference",
        engine: "independent-test-engine",
        calculatedAt: "2026-08-22T02:10:00.000Z",
        inputTimestamp,
      };
    },
  });

  assert.notEqual(placements.mercury.verificationStatus, "verified");
  assert.equal(placements.mercury.sign, null);
  assert.ok(placements.mercury.internalCandidate?.sign);
  assert.match(placements.mercury.verificationFailure?.reason ?? "", /sign_disagreement/);

  for (const key of ["venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const) {
    assert.equal(placements[key].verificationStatus, "verified", key);
  }
});

test("natal report includes verified major planets and rejects candidate-only planets", () => {
  const basePlacement = (sign: string, longitude: number, verified: boolean) => ({
    sign: verified ? sign : null,
    verificationStatus: verified ? "verified" : "pending_independent_verification",
    internalCandidate: {
      sign,
      longitude,
      source: "candidate-source",
      engine: "candidate-engine",
      calculatedAt: "2026-08-22T02:10:00.000Z",
      inputTimestamp: "1990-09-17T15:11:00.000Z",
    },
  });

  const report = buildNatalReportInput({
    name: "Chart Test",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    birthTime: "11:11",
    birthLocation: "Bronx, New York",
    astrologyData: {
      sun: basePlacement("Virgo", 174, true),
      moon: basePlacement("Virgo", 170, true),
      rising: basePlacement("Scorpio", 220, true),
      planets: {
        mercury: basePlacement("Virgo", 166, true),
        venus: basePlacement("Leo", 142, false),
        mars: basePlacement("Gemini", 80, true),
        jupiter: basePlacement("Leo", 125, true),
        saturn: basePlacement("Capricorn", 285, true),
        uranus: basePlacement("Capricorn", 276, true),
        neptune: basePlacement("Capricorn", 282, true),
        pluto: basePlacement("Scorpio", 225, true),
      },
      verification: { verifiedBodies: ["Sun", "Moon", "Ascendant", "Mercury"] },
    },
    numerologyData: { lifePath: 9 },
  });

  const planets = (report.astrology as any).planets;
  assert.equal(planets.mercury.sign, "Virgo");
  assert.equal(planets.venus, undefined);
  assert.equal(planets.pluto.sign, "Scorpio");
  assert.match(report.aiText.elementEmphasis, /7\/8 major planets/i);
  assert.match(report.aiText.houseEmphasis, /intentionally not claimed/i);
});

test("opt-in profile verification route calls the governed full-chart verifier", () => {
  const source = readFileSync(
    new URL("../server/routes/profile-verification.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /calculateVerifiedFullChartAstrology/);
  assert.match(source, /persistedProfile:\s*false/);
  assert.match(source, /aiGeneration:\s*false/);
});

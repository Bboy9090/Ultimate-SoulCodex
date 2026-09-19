import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAstrology,
  calculateVerifiedAstrology,
  type BirthData,
} from "../server/services/astrology-production";
import type {
  IndependentEphemerisReference,
  VerifiableBody,
} from "../server/services/astrology-verification";
import type { IndependentReferenceFetcher } from "../server/services/astrology";

const BIRTH: BirthData = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: 40.8448,
  longitude: -73.8648,
};

const BODY_KEYS: Array<[VerifiableBody, "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"]> = [
  ["Sun", "sun"],
  ["Moon", "moon"],
  ["Mercury", "mercury"],
  ["Venus", "venus"],
  ["Mars", "mars"],
  ["Jupiter", "jupiter"],
  ["Saturn", "saturn"],
  ["Uranus", "uranus"],
  ["Neptune", "neptune"],
  ["Pluto", "pluto"],
];

function referenceFetcher(rejectBody?: VerifiableBody): IndependentReferenceFetcher {
  const candidates = calculateAstrology(BIRTH);
  assert.ok(candidates.planets);

  return async (body, inputTimestamp): Promise<IndependentEphemerisReference> => {
    const key = BODY_KEYS.find(([candidateBody]) => candidateBody === body)?.[1];
    assert.ok(key);
    const placement = candidates.planets![key];
    assert.ok(placement.internalCandidate);

    const delta = body === "Sun" || body === "Moon" ? 0.0005 : 0.003;
    const rejected = body === rejectBody;

    return {
      body,
      sign: rejected
        ? placement.internalCandidate.sign === "Aries" ? "Taurus" : "Aries"
        : placement.internalCandidate.sign,
      longitude: (placement.internalCandidate.longitude + delta) % 360,
      source: "Independent full-chart fixture",
      engine: "independent-full-chart-fixture@1",
      calculatedAt: "2026-09-19T15:05:00.000Z",
      inputTimestamp,
    };
  };
}

test("verified production chart wires ten planets, Rising, MC, Equal House cusps, houses and major aspects", async () => {
  const result = await calculateVerifiedAstrology(BIRTH, {
    referenceFetcher: referenceFetcher(),
  });

  assert.equal(result.verification.complete, true);
  assert.equal(result.rising.verificationStatus, "verified");
  assert.equal(result.rising.sign, "Scorpio");

  assert.equal(result.houseSystem, "equal");
  assert.equal(result.houses?.length, 12);
  assert.equal(result.houses?.[0].house, 1);
  assert.equal(result.houses?.[0].sign, "Scorpio");
  assert.equal(result.houses?.[0].verificationStatus, "verified");

  assert.equal(result.midheaven?.verificationStatus, "verified");
  assert.equal(result.midheaven?.sign, "Leo");
  assert.equal(result.midheaven?.policyId, "ASTRO-EQUAL-HOUSE-v1");

  assert.deepEqual(
    new Set(Object.keys(result.planetaryHouses ?? {})),
    new Set(BODY_KEYS.map(([, key]) => key)),
  );
  for (const house of Object.values(result.planetaryHouses ?? {})) {
    assert.ok(typeof house === "number" && house >= 1 && house <= 12);
  }

  assert.ok((result.aspects?.length ?? 0) > 0);
  for (const aspect of result.aspects ?? []) {
    assert.equal(aspect.policyId, "ASTRO-ASPECT-MAJOR-v1");
    assert.ok(typeof aspect.orb === "number");
    assert.ok(typeof aspect.separationDegrees === "number");
    assert.ok(typeof aspect.targetAngleDegrees === "number");
  }

  assert.match(result.verification.policyId ?? "", /ASTRO-EQUAL-HOUSE-v1/);
  assert.match(result.verification.policyId ?? "", /ASTRO-ASPECT-MAJOR-v1/);
  assert.match(result.verification.evidenceReceiptId ?? "", /35449945640/);

  assert.equal(result.northNode?.verificationStatus, "verified");
  assert.equal(result.northNode?.mode, "mean");
  assert.equal(result.northNode?.sign, "Aquarius");
  assert.equal(result.northNode?.house, 3);
  assert.equal(result.northNode?.policyId, "ASTRO-MEAN-NODE-v1");
  assert.equal(result.southNode?.verificationStatus, "verified");
  assert.equal(result.southNode?.mode, "mean");
  assert.equal(result.southNode?.sign, "Leo");
  assert.equal(result.southNode?.house, 9);
  assert.match(result.verification.policyId ?? "", /ASTRO-MEAN-NODE-v1/);
  assert.match(result.verification.evidenceReceiptId ?? "", /35463886745/);
  assert.equal(result.chiron, undefined);
});

test("an unverified planet is excluded from derived house assignments and aspects", async () => {
  const result = await calculateVerifiedAstrology(BIRTH, {
    referenceFetcher: referenceFetcher("Mars"),
  });

  assert.equal(result.planets?.mars.verificationStatus, "pending_independent_verification");
  assert.equal(result.planets?.mars.sign, null);
  assert.equal(result.houseSystem, "equal");
  assert.equal(result.houses?.length, 12);
  assert.equal(result.midheaven?.verificationStatus, "verified");
  assert.equal(result.northNode?.verificationStatus, "verified");
  assert.equal(result.southNode?.verificationStatus, "verified");

  assert.equal(result.planetaryHouses?.mars, undefined);
  assert.ok(Object.keys(result.planetaryHouses ?? {}).length === 9);
  assert.ok(
    (result.aspects ?? []).every(
      (aspect) => aspect.planet1 !== "mars" && aspect.planet2 !== "mars",
    ),
  );

  assert.equal(result.verification.complete, false);
  assert.ok(result.verification.unresolvedBodies.includes("Mars"));
  assert.ok(result.verification.unresolvedBodies.includes("PlanetaryHouseAssignments"));
  assert.ok(result.verification.unresolvedBodies.includes("Aspects"));
});

test("missing coordinates withhold Rising, MC, houses and planetary house assignments", async () => {
  const noLocation: BirthData = {
    birthDate: BIRTH.birthDate,
    birthTime: BIRTH.birthTime,
    timezone: BIRTH.timezone,
  };
  const result = await calculateVerifiedAstrology(noLocation, {
    referenceFetcher: referenceFetcher(),
  });

  assert.notEqual(result.rising.verificationStatus, "verified");
  assert.equal(result.houseSystem, undefined);
  assert.equal(result.houses, undefined);
  assert.equal(result.midheaven, undefined);
  assert.equal(result.planetaryHouses, undefined);
  assert.equal(result.aspects, undefined);
  assert.equal(result.northNode, undefined);
  assert.equal(result.southNode, undefined);
});

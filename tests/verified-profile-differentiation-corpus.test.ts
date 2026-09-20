import assert from "node:assert/strict";
import test from "node:test";
import {
  generateFoundationOfflineCodexProfile,
  synthesizeVerifiedFoundationProfile,
} from "../client/src/lib/foundationOfflineCodex";
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
import type { VerifiedAstrologyForSynthesis } from "../client/src/lib/foundationOfflineCodex";

const names = [
  "Avery Cole", "Bianca Stone", "Caleb Hart", "Dalia Reed", "Elias North",
  "Farah Lane", "Gavin Frost", "Hana Vale", "Isaac Moon", "Jade Rivers",
  "Kai Mercer", "Lena Brooks", "Miles Rowan", "Nia Cross", "Owen Blake",
];

const locations = [
  { birthLocation: "Bronx, New York", timezone: "America/New_York", latitude: 40.8448, longitude: -73.8648 },
  { birthLocation: "Los Angeles, California", timezone: "America/Los_Angeles", latitude: 34.0522, longitude: -118.2437 },
  { birthLocation: "Chicago, Illinois", timezone: "America/Chicago", latitude: 41.8781, longitude: -87.6298 },
  { birthLocation: "London, United Kingdom", timezone: "Europe/London", latitude: 51.5074, longitude: -0.1278 },
  { birthLocation: "Tokyo, Japan", timezone: "Asia/Tokyo", latitude: 35.6762, longitude: 139.6503 },
];

const dates = [
  "1986-01-14", "1987-02-22", "1988-03-30", "1989-04-18", "1990-05-27",
  "1991-06-09", "1992-07-24", "1993-08-11", "1994-09-29", "1995-10-16",
  "1996-11-07", "1997-12-25", "1998-01-31", "1999-02-12", "2000-03-05",
];

const times = ["00:17", "03:41", "06:28", "09:53", "12:11", "15:36", "18:22", "21:47"];

const BODY_KEYS: Array<[
  VerifiableBody,
  "sun" | "moon" | "mercury" | "venus" | "mars" |
  "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"
]> = [
  ["Sun", "sun"], ["Moon", "moon"], ["Mercury", "mercury"], ["Venus", "venus"],
  ["Mars", "mars"], ["Jupiter", "jupiter"], ["Saturn", "saturn"],
  ["Uranus", "uranus"], ["Neptune", "neptune"], ["Pluto", "pluto"],
];

const genericTerms = [
  "discernment",
  "over-expression",
  "overexpression",
  "balance",
  "boundaries",
  "sensitivity",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(" ")
      .filter((token) => token.length > 3),
  );
}

function jaccard(a: string, b: string): number {
  const left = tokens(a);
  const right = tokens(b);
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function referenceFetcherFor(birth: BirthData): IndependentReferenceFetcher {
  const candidates = calculateAstrology(birth);
  assert.ok(candidates.planets);

  return async (
    body,
    inputTimestamp,
  ): Promise<IndependentEphemerisReference> => {
    const key = BODY_KEYS.find(([candidateBody]) => candidateBody === body)?.[1];
    assert.ok(key);
    const placement = candidates.planets![key];
    assert.ok(placement.internalCandidate);

    const delta = body === "Sun" || body === "Moon" ? 0.0005 : 0.003;
    return {
      body,
      sign: placement.internalCandidate.sign,
      longitude: (placement.internalCandidate.longitude + delta) % 360,
      source: "Independent differentiation corpus fixture",
      engine: "independent-differentiation-fixture@1",
      calculatedAt: "2026-09-20T00:15:00.000Z",
      inputTimestamp,
    };
  };
}

async function fullVerifiedReading(index: number) {
  const location = locations[index % locations.length];
  const birth: BirthData = {
    name: names[index % names.length],
    birthDate: dates[index % dates.length],
    birthTime: times[index % times.length],
    timezone: location.timezone,
    latitude: location.latitude,
    longitude: location.longitude,
    birthLocation: location.birthLocation,
  } as BirthData;

  const local = generateFoundationOfflineCodexProfile(
    birth as any,
    {
      id: `verified-diff-${index}`,
      generatedAt: "2026-09-20T00:15:00.000Z",
      currentYear: 2026,
    },
  );

  const astrology = await calculateVerifiedAstrology(birth, {
    referenceFetcher: referenceFetcherFor(birth),
    chironReferenceFetcher: async (inputTimestamp) => ({
      body: "Chiron" as const,
      longitude: 115.3498,
      sign: "Cancer",
      source: "NASA/JPL Horizons controlled differentiation fixture",
      engine: "nasa-jpl-horizons-api@1.3-test",
      calculatedAt: "2026-09-20T00:15:00.000Z",
      inputTimestamp,
    }),
  });

  assert.equal(astrology.verification.complete, true, `fixture ${index} failed verification`);

  const narrative = synthesizeVerifiedFoundationProfile(
    local,
    astrology as VerifiedAstrologyForSynthesis,
    "2026-09-20T00:15:00.000Z",
  );

  return { birth, local, astrology, narrative };
}

function fingerprint(
  reading: Awaited<ReturnType<typeof fullVerifiedReading>>,
): string {
  const depth = reading.narrative.depthInterpretation;
  const redactedBiography = reading.narrative.biography
    .split(reading.birth.name)
    .join("<name>");
  return [
    redactedBiography,
    reading.narrative.archetypeData.title,
    reading.narrative.archetypeData.description,
    reading.narrative.archetypeData.strengths.join(" "),
    reading.narrative.archetypeData.shadows.join(" "),
    reading.narrative.archetypeData.guidance,
    reading.narrative.dailyGuidance,
    depth.claritySummary.summary,
    depth.visiblePattern.summary,
    depth.innerExperience.summary,
    depth.hiddenNeed.summary,
    depth.protectiveFunction.summary,
    depth.coreContradiction.summary,
    depth.gift.summary,
    depth.shadow.summary,
    depth.commonMisreading.summary,
    depth.relationshipImpact.summary,
    depth.decisionImpact.summary,
    depth.boundaryOrRepair.summary,
    depth.action.summary,
  ].join(" ");
}

test("verified profile differentiation corpus", { timeout: 120_000 }, async (suite) => {
  const readings = [];
  for (let index = 0; index < 60; index += 1) {
    readings.push(await fullVerifiedReading(index));
  }

  await suite.test("all 60 readings use complete verified chart evidence", () => {
    assert.equal(readings.length, 60);
    for (const [index, reading] of readings.entries()) {
      assert.equal(reading.astrology.verification.complete, true, `fixture ${index}`);
      assert.equal(reading.astrology.houseSystem, "equal");
      assert.equal(reading.astrology.houses?.length, 12);
      assert.equal(reading.astrology.chiron?.verificationStatus, "verified");
    }
  });

  await suite.test("repeated name/date pairs differentiate only after verified time/location geometry", () => {
    for (let index = 0; index < 15; index += 1) {
      const first = readings[index];
      const second = readings[index + 15];

      assert.equal(first.local.biography, second.local.biography);
      assert.equal(
        normalize(fingerprint(first)) === normalize(fingerprint(second)),
        false,
        `verified fixtures ${index} and ${index + 15} stayed identical`,
      );
    }
  });

  await suite.test("at least 45 of 60 verified readings are materially unique", () => {
    const unique = new Set(readings.map((reading) => normalize(fingerprint(reading))));
    assert.ok(
      unique.size >= 45,
      `expected at least 45 unique verified readings, got ${unique.size}`,
    );
  });

  await suite.test("generic umbrella language does not dominate the verified population", () => {
    const texts = readings.map((reading) => normalize(fingerprint(reading)));
    for (const term of genericTerms) {
      const hits = texts.filter((text) => text.includes(term)).length;
      const ratio = hits / texts.length;
      assert.ok(
        ratio <= 0.45,
        `${term} appears in ${(ratio * 100).toFixed(1)}% of verified profiles`,
      );
    }
  });

  await suite.test("verified readings do not become near-duplicates", () => {
    let worst = { score: 0, left: -1, right: -1 };
    for (let left = 0; left < readings.length; left += 1) {
      for (let right = left + 1; right < readings.length; right += 1) {
        const score = jaccard(fingerprint(readings[left]), fingerprint(readings[right]));
        if (score > worst.score) worst = { score, left, right };
      }
    }

    assert.ok(
      worst.score <= 0.78,
      `verified profiles ${worst.left} and ${worst.right} are ${(worst.score * 100).toFixed(1)}% token-similar`,
    );
  });
});

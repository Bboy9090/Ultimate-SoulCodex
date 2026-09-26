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
  "alignment",
  "purpose",
  "intuitive",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ngrams(text: string, width: number): Set<string> {
  const values = normalize(text).split(" ").filter(Boolean);
  const grams = new Set<string>();
  for (let index = 0; index <= values.length - width; index += 1) {
    grams.add(values.slice(index, index + width).join(" "));
  }
  return grams;
}

function ngramJaccard(a: string, b: string, width: number): number {
  const left = ngrams(a, width);
  const right = ngrams(b, width);
  const intersection = [...left].filter((gram) => right.has(gram)).length;
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
  const identityIndex = index % names.length;
  const variantIndex = Math.floor(index / names.length);
  const location = locations[variantIndex % locations.length];
  const birth: BirthData = {
    name: names[identityIndex],
    birthDate: dates[identityIndex],
    birthTime: times[variantIndex % times.length],
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

function supportedSignature(
  reading: Awaited<ReturnType<typeof fullVerifiedReading>>,
): string[] {
  const astrology = reading.astrology;
  const placement = (key: (typeof BODY_KEYS)[number][1]) =>
    astrology.planets?.[key]?.verificationStatus === "verified"
      ? astrology.planets[key]?.sign ?? "unresolved"
      : "unresolved";

  return [
    ...BODY_KEYS.map(([, key]) => `${key}:${placement(key)}`),
    `rising:${astrology.rising?.verificationStatus === "verified" ? astrology.rising.sign : "unresolved"}`,
  ];
}

function supportedSignatureDistance(
  left: Awaited<ReturnType<typeof fullVerifiedReading>>,
  right: Awaited<ReturnType<typeof fullVerifiedReading>>,
): number {
  const a = supportedSignature(left);
  const b = supportedSignature(right);
  return a.reduce(
    (distance, value, index) => distance + (value === b[index] ? 0 : 1),
    0,
  );
}

test("verified profile differentiation corpus", { timeout: 120_000 }, async (suite) => {
  const readings = [];
  for (let index = 0; index < 300; index += 1) {
    readings.push(await fullVerifiedReading(index));
  }

  await suite.test("all 300 readings use complete verified chart evidence", () => {
    assert.equal(readings.length, 300);
    for (const [index, reading] of readings.entries()) {
      assert.equal(reading.astrology.verification.complete, true, `fixture ${index}`);
      assert.equal(reading.astrology.houseSystem, "equal");
      assert.equal(reading.astrology.houses?.length, 12);
      assert.equal(reading.astrology.chiron?.verificationStatus, "verified");
    }
  });

  await suite.test("repeated name/date pairs differentiate when supported verified placements differ", () => {
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

  await suite.test("same name/date repeated across twenty time/location variants stays evidence-differentiated", () => {
    for (let base = 0; base < 15; base += 1) {
      const group = Array.from({ length: 20 }, (_, repeat) => readings[base + repeat * 15]);
      const localBiographies = new Set(group.map((reading) => reading.local.biography));
      assert.equal(localBiographies.size, 1, `base fixture ${base} should share the same local name/date biography`);

      const timeVariants = new Set(group.map((reading) => reading.birth.birthTime));
      const locationVariants = new Set(group.map((reading) => reading.birth.birthLocation));
      assert.equal(timeVariants.size, times.length, `base fixture ${base} should exercise all birth times`);
      assert.equal(locationVariants.size, locations.length, `base fixture ${base} should exercise all locations`);

      const verifiedNarratives = new Set(
        group.map((reading) => normalize(fingerprint(reading))),
      );
      assert.equal(
        verifiedNarratives.size,
        group.length,
        `same name/date group ${base} collapsed after verified chart synthesis`,
      );

      const signatures = new Set(
        group.map((reading) => supportedSignature(reading).join("|")),
      );
      assert.ok(
        signatures.size >= 4,
        `same name/date group ${base} did not produce enough supported chart diversity`,
      );
    }
  });

  await suite.test("all 300 verified readings are unique", () => {
    const unique = new Set(readings.map((reading) => normalize(fingerprint(reading))));
    assert.equal(
      unique.size,
      readings.length,
      `expected all 300 verified readings to be unique, got ${unique.size}`,
    );
  });

  await suite.test("generic umbrella language does not dominate the verified population", () => {
    const texts = readings.map((reading) => normalize(fingerprint(reading)));
    for (const term of genericTerms) {
      const hits = texts.filter((text) => text.includes(term)).length;
      const ratio = hits / texts.length;
      assert.ok(
        ratio <= 0.35,
        `${term} appears in ${(ratio * 100).toFixed(1)}% of verified profiles; Diamond Way budget is 35%`,
      );
    }
  });

  await suite.test("verified readings do not become structural near-duplicates", () => {
    let worstBigram = { score: 0, left: -1, right: -1, distance: 0 };
    let worstTrigram = { score: 0, left: -1, right: -1, distance: 0 };
    let materiallyDifferentPairs = 0;

    for (let left = 0; left < readings.length; left += 1) {
      for (let right = left + 1; right < readings.length; right += 1) {
        // House geometry, Midheaven, Nodes, and Chiron are deliberately excluded
        // from primary synthesis. Compare narrative similarity only when the
        // active, verified placement evidence differs materially. Aspect-only
        // differences are still rendered, but do not imply a wholly different
        // natal vocabulary when the verified sign pattern is otherwise shared.
        const distance = supportedSignatureDistance(readings[left], readings[right]);
        if (distance < 3) continue;
        materiallyDifferentPairs += 1;
        const bigram = ngramJaccard(
          fingerprint(readings[left]),
          fingerprint(readings[right]),
          2,
        );
        const trigram = ngramJaccard(
          fingerprint(readings[left]),
          fingerprint(readings[right]),
          3,
        );
        if (bigram > worstBigram.score) worstBigram = { score: bigram, left, right, distance };
        if (trigram > worstTrigram.score) worstTrigram = { score: trigram, left, right, distance };
      }
    }

    assert.ok(
      materiallyDifferentPairs >= 5000,
      `expected a meaningful comparison population, got ${materiallyDifferentPairs} pairs`,
    );

    assert.ok(
      worstBigram.score < 0.9,
      `verified profiles ${worstBigram.left} and ${worstBigram.right} (supported distance ${worstBigram.distance}) are ${(worstBigram.score * 100).toFixed(1)}% bigram-similar`,
    );
    assert.ok(
      worstTrigram.score < 0.85,
      `verified profiles ${worstTrigram.left} and ${worstTrigram.right} (supported distance ${worstTrigram.distance}) are ${(worstTrigram.score * 100).toFixed(1)}% trigram-similar`,
    );
  });
});

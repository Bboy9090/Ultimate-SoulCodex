import {
  generateFoundationOfflineCodexProfile,
  synthesizeVerifiedFoundationProfile,
  type VerifiedAstrologyForSynthesis,
} from "../../client/src/lib/foundationOfflineCodex";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const placementEvidence = {
  source: "Independent differentiation fixture",
  engine: "test-independent-engine",
  calculatedAt: "2026-09-26T00:00:00.000Z",
};

export interface DifferentiationReading {
  id: string;
  signature: string;
  biography: string;
  dailyGuidance: string;
  narrative: string;
  verifiedEvidenceCount: number;
  totalEvidenceCount: number;
  layerSummaries: string[];
}

function sign(index: number): string {
  return SIGNS[((index % SIGNS.length) + SIGNS.length) % SIGNS.length];
}

function makeChart(index: number): VerifiedAstrologyForSynthesis {
  const moon = sign(index + 1);
  const rising = sign(index + 4);
  const sun = "Virgo";
  const planet = (offset: number) => ({
    verificationStatus: "verified",
    sign: sign(index * 2 + offset),
    evidence: placementEvidence,
  });
  const planetaryHouses = {
    sun: ((index + 9) % 12) + 1,
    moon: ((index * 2 + 3) % 12) + 1,
    mercury: ((index * 3 + 1) % 12) + 1,
    venus: ((index * 5 + 2) % 12) + 1,
    mars: ((index * 7 + 4) % 12) + 1,
    jupiter: ((index * 11 + 6) % 12) + 1,
    saturn: ((index * 4 + 8) % 12) + 1,
    uranus: ((index * 6 + 5) % 12) + 1,
    neptune: ((index * 8 + 7) % 12) + 1,
    pluto: ((index * 9 + 10) % 12) + 1,
  };

  return {
    sun: { verificationStatus: "verified", sign: sun, evidence: placementEvidence },
    moon: { verificationStatus: "verified", sign: moon, evidence: placementEvidence },
    rising: { verificationStatus: "verified", sign: rising, evidence: placementEvidence },
    planets: {
      sun: { verificationStatus: "verified", sign: sun, evidence: placementEvidence },
      moon: { verificationStatus: "verified", sign: moon, evidence: placementEvidence },
      mercury: planet(2),
      venus: planet(3),
      mars: planet(5),
      jupiter: planet(6),
      saturn: planet(8),
      uranus: planet(9),
      neptune: planet(10),
      pluto: planet(11),
    },
    planetaryHouses,
    midheaven: {
      verificationStatus: "verified",
      sign: sign(index + 7),
    },
    northNode: {
      verificationStatus: "verified",
      sign: sign(index + 9),
      house: ((index * 5 + 1) % 12) + 1,
      mode: "mean",
    },
    southNode: {
      verificationStatus: "verified",
      sign: sign(index + 3),
      house: ((index * 5 + 7) % 12) + 1,
      mode: "mean",
    },
    chiron: {
      verificationStatus: "verified",
      sign: sign(index * 3 + 4),
      house: ((index * 7 + 2) % 12) + 1,
      qualificationMethod: "live-jpl-qualified-against-swiss",
    },
    aspects: [
      {
        planet1: "sun",
        planet2: "moon",
        aspect: ["conjunction", "sextile", "square", "trine", "opposition"][index % 5],
        orb: Number((0.4 + (index % 7) * 0.37).toFixed(2)),
      },
      {
        planet1: "venus",
        planet2: "mars",
        aspect: ["trine", "square", "sextile"][index % 3],
        orb: Number((0.7 + (index % 5) * 0.41).toFixed(2)),
      },
      {
        planet1: "mercury",
        planet2: "saturn",
        aspect: ["square", "trine", "opposition", "sextile"][index % 4],
        orb: Number((0.3 + (index % 6) * 0.29).toFixed(2)),
      },
    ],
  };
}

function normalizedNarrative(parts: string[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildVerifiedDifferentiationCorpus(count = 48): DifferentiationReading[] {
  const local = generateFoundationOfflineCodexProfile(
    {
      name: "Differentiation Control",
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthLocation: "Bronx, New York",
      timezone: "America/New_York",
      latitude: "40.8448",
      longitude: "-73.8648",
    },
    {
      id: "differentiation-control",
      generatedAt: "2026-09-19T23:30:00.000Z",
      currentYear: 2026,
    },
  );

  return Array.from({ length: count }, (_, index) => {
    const chart = makeChart(index);
    const synthesis = synthesizeVerifiedFoundationProfile(
      local,
      chart,
      "2026-09-19T23:30:00.000Z",
    );
    const layers = [
      synthesis.depthInterpretation.claritySummary,
      synthesis.depthInterpretation.visiblePattern,
      synthesis.depthInterpretation.innerExperience,
      synthesis.depthInterpretation.hiddenNeed,
      synthesis.depthInterpretation.protectiveFunction,
      synthesis.depthInterpretation.coreContradiction,
      synthesis.depthInterpretation.gift,
      synthesis.depthInterpretation.shadow,
      synthesis.depthInterpretation.commonMisreading,
      synthesis.depthInterpretation.relationshipImpact,
      synthesis.depthInterpretation.decisionImpact,
      synthesis.depthInterpretation.boundaryOrRepair,
      synthesis.depthInterpretation.action,
    ];
    const narrative = normalizedNarrative([
      synthesis.biography,
      synthesis.dailyGuidance,
      synthesis.archetypeData.description,
      ...layers.flatMap((layer) => [layer.summary, layer.explanation]),
    ]);
    const verifiedEvidenceCount = synthesis.depthInterpretation.evidence.filter(
      (item) => item.provenanceStatus === "externally-verified",
    ).length;

    return {
      id: `verified-${String(index + 1).padStart(2, "0")}`,
      signature: JSON.stringify({
        moon: chart.moon?.sign,
        rising: chart.rising?.sign,
        planets: chart.planets,
        aspects: chart.aspects,
      }),
      biography: synthesis.biography,
      dailyGuidance: synthesis.dailyGuidance,
      narrative,
      verifiedEvidenceCount,
      totalEvidenceCount: synthesis.depthInterpretation.evidence.length,
      layerSummaries: layers.map((layer) => normalizedNarrative([layer.summary])),
    };
  });
}

export function tokenJaccard(left: string, right: string): number {
  const a = new Set(left.split(" ").filter(Boolean));
  const b = new Set(right.split(" ").filter(Boolean));
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

function ngramSet(value: string, width: number): Set<string> {
  const tokens = value.split(" ").filter(Boolean);
  const grams = new Set<string>();
  for (let index = 0; index <= tokens.length - width; index += 1) {
    grams.add(tokens.slice(index, index + width).join(" "));
  }
  return grams;
}

export function ngramJaccard(left: string, right: string, width: number): number {
  const a = ngramSet(left, width);
  const b = ngramSet(right, width);
  const intersection = [...a].filter((gram) => b.has(gram)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

function signatureDistance(leftSignature: string, rightSignature: string): number {
  const left = JSON.parse(leftSignature) as any;
  const right = JSON.parse(rightSignature) as any;
  let distance = 0;

  if (left.moon !== right.moon) distance += 2;
  if (left.rising !== right.rising) distance += 2;

  for (const key of [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
  ]) {
    if (left.planets?.[key]?.sign !== right.planets?.[key]?.sign) distance += 1;
  }

  const leftAspects = left.aspects ?? [];
  const rightAspects = right.aspects ?? [];
  const length = Math.max(leftAspects.length, rightAspects.length);
  for (let index = 0; index < length; index += 1) {
    const a = leftAspects[index];
    const b = rightAspects[index];
    if (!a || !b) {
      distance += 2;
      continue;
    }
    if (a.aspect !== b.aspect) distance += 2;
    if (a.planet1 !== b.planet1 || a.planet2 !== b.planet2) distance += 1;
    if (
      typeof a.orb === "number" &&
      typeof b.orb === "number" &&
      Math.abs(a.orb - b.orb) >= 1
    ) {
      distance += 1;
    }
  }

  return distance;
}

const MATERIAL_CHART_DISTANCE = 8;

export function differentiationMetrics(readings: DifferentiationReading[]) {
  const narratives = readings.map((reading) => reading.narrative);
  const uniqueNarratives = new Set(narratives).size;
  const exactDuplicateCount = narratives.length - uniqueNarratives;
  let maximumPairwiseTokenJaccard = 0;
  let maximumPairwiseBigramJaccard = 0;
  let maximumPairwiseTrigramJaccard = 0;
  let maximumIdenticalLayerSummaries = 0;
  let maximumMaterialBigramJaccard = 0;
  let maximumMaterialTrigramJaccard = 0;
  let maximumMaterialIdenticalLayerSummaries = 0;
  let materialPairCount = 0;
  let mostSimilarPair: [string, string] | null = null;
  let mostSimilarBigramPair: [string, string] | null = null;
  let mostSimilarTrigramPair: [string, string] | null = null;
  let mostLayerDuplicatePair: [string, string] | null = null;
  let mostSimilarMaterialBigramPair: [string, string] | null = null;
  let mostSimilarMaterialTrigramPair: [string, string] | null = null;
  let mostMaterialLayerDuplicatePair: [string, string] | null = null;

  for (let left = 0; left < readings.length; left += 1) {
    for (let right = left + 1; right < readings.length; right += 1) {
      const tokenSimilarity = tokenJaccard(
        readings[left].narrative,
        readings[right].narrative,
      );
      const bigramSimilarity = ngramJaccard(
        readings[left].narrative,
        readings[right].narrative,
        2,
      );
      const trigramSimilarity = ngramJaccard(
        readings[left].narrative,
        readings[right].narrative,
        3,
      );
      const identicalLayerSummaries = readings[left].layerSummaries.reduce(
        (count, summary, index) =>
          count + Number(Boolean(summary) && summary === readings[right].layerSummaries[index]),
        0,
      );
      const chartDistance = signatureDistance(
        readings[left].signature,
        readings[right].signature,
      );

      if (tokenSimilarity > maximumPairwiseTokenJaccard) {
        maximumPairwiseTokenJaccard = tokenSimilarity;
        mostSimilarPair = [readings[left].id, readings[right].id];
      }
      if (bigramSimilarity > maximumPairwiseBigramJaccard) {
        maximumPairwiseBigramJaccard = bigramSimilarity;
        mostSimilarBigramPair = [readings[left].id, readings[right].id];
      }
      if (trigramSimilarity > maximumPairwiseTrigramJaccard) {
        maximumPairwiseTrigramJaccard = trigramSimilarity;
        mostSimilarTrigramPair = [readings[left].id, readings[right].id];
      }
      if (identicalLayerSummaries > maximumIdenticalLayerSummaries) {
        maximumIdenticalLayerSummaries = identicalLayerSummaries;
        mostLayerDuplicatePair = [readings[left].id, readings[right].id];
      }

      if (chartDistance >= MATERIAL_CHART_DISTANCE) {
        materialPairCount += 1;
        if (bigramSimilarity > maximumMaterialBigramJaccard) {
          maximumMaterialBigramJaccard = bigramSimilarity;
          mostSimilarMaterialBigramPair = [readings[left].id, readings[right].id];
        }
        if (trigramSimilarity > maximumMaterialTrigramJaccard) {
          maximumMaterialTrigramJaccard = trigramSimilarity;
          mostSimilarMaterialTrigramPair = [readings[left].id, readings[right].id];
        }
        if (identicalLayerSummaries > maximumMaterialIdenticalLayerSummaries) {
          maximumMaterialIdenticalLayerSummaries = identicalLayerSummaries;
          mostMaterialLayerDuplicatePair = [readings[left].id, readings[right].id];
        }
      }
    }
  }

  return {
    profileCount: readings.length,
    uniqueNarratives,
    exactDuplicateCount,
    maximumPairwiseTokenJaccard,
    maximumPairwiseBigramJaccard,
    maximumPairwiseTrigramJaccard,
    maximumIdenticalLayerSummaries,
    materialChartDistanceThreshold: MATERIAL_CHART_DISTANCE,
    materialPairCount,
    maximumMaterialBigramJaccard,
    maximumMaterialTrigramJaccard,
    maximumMaterialIdenticalLayerSummaries,
    layerCount: readings[0]?.layerSummaries.length ?? 0,
    mostSimilarPair,
    mostSimilarBigramPair,
    mostSimilarTrigramPair,
    mostLayerDuplicatePair,
    mostSimilarMaterialBigramPair,
    mostSimilarMaterialTrigramPair,
    mostMaterialLayerDuplicatePair,
    minimumVerifiedEvidenceCount: Math.min(
      ...readings.map((reading) => reading.verifiedEvidenceCount),
    ),
    minimumTotalEvidenceCount: Math.min(
      ...readings.map((reading) => reading.totalEvidenceCount),
    ),
  };
}

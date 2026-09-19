import { writeFile } from "node:fs/promises";
import {
  calculateEqualHouseEvidence,
  circularDegreesDelta,
  normalizeDegrees,
} from "../server/services/house-verification";
import {
  SWISS_EQUAL_HOUSE_FIXTURES,
  SWISS_EQUAL_HOUSE_REFERENCE,
} from "../tests/fixtures/swiss-equal-house-fixtures";

const rows = SWISS_EQUAL_HOUSE_FIXTURES.map((fixture) => {
  const evidence = calculateEqualHouseEvidence({
    inputTimestamp: fixture.inputTimestamp,
    latitude: fixture.latitude,
    longitude: fixture.longitude,
  });

  return {
    id: fixture.id,
    inputTimestamp: fixture.inputTimestamp,
    latitude: fixture.latitude,
    longitude: fixture.longitude,
    expectedAscendantLongitude: fixture.expectedAscendantLongitude,
    calculatedAscendantLongitude: evidence.ascendantLongitudeDegrees,
    ascendantDeltaDegrees: circularDegreesDelta(
      evidence.ascendantLongitudeDegrees,
      fixture.expectedAscendantLongitude,
    ),
    expectedMidheavenLongitude: fixture.expectedMidheavenLongitude,
    candidateMidheavenLongitude: evidence.midheavenCandidate.longitudeDegrees,
    referenceMidheavenLongitude: evidence.midheavenReference.longitudeDegrees,
    candidateMidheavenDeltaDegrees: circularDegreesDelta(
      evidence.midheavenCandidate.longitudeDegrees,
      fixture.expectedMidheavenLongitude,
    ),
    referenceMidheavenDeltaDegrees: circularDegreesDelta(
      evidence.midheavenReference.longitudeDegrees,
      fixture.expectedMidheavenLongitude,
    ),
    maximumCuspDeltaDegrees: Math.max(
      ...evidence.cusps.map((cusp, index) =>
        circularDegreesDelta(
          cusp.longitudeDegrees,
          normalizeDegrees(fixture.expectedAscendantLongitude + index * 30),
        ),
      ),
    ),
  };
});

const maximum = (key: keyof typeof rows[number]) =>
  Math.max(...rows.map((row) => Number(row[key])));

const receipt = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  policyStatus: "evidence_only_no_house_policy_approved",
  houseSystem: "equal",
  reference: SWISS_EQUAL_HOUSE_REFERENCE,
  rows,
  summary: {
    fixtureCount: rows.length,
    maximumAscendantDeltaDegrees: maximum("ascendantDeltaDegrees"),
    maximumCandidateMidheavenDeltaDegrees: maximum("candidateMidheavenDeltaDegrees"),
    maximumReferenceMidheavenDeltaDegrees: maximum("referenceMidheavenDeltaDegrees"),
    maximumCuspDeltaDegrees: maximum("maximumCuspDeltaDegrees"),
  },
};

const outputPath = process.argv[2] ?? "equal-house-evidence-receipt.json";
await writeFile(outputPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ outputPath, ...receipt.summary }, null, 2));

if (
  receipt.summary.maximumAscendantDeltaDegrees > 0.01 ||
  receipt.summary.maximumCandidateMidheavenDeltaDegrees > 0.01 ||
  receipt.summary.maximumReferenceMidheavenDeltaDegrees > 0.01 ||
  receipt.summary.maximumCuspDeltaDegrees > 0.01
) {
  process.exitCode = 2;
}

import { writeFile } from "node:fs/promises";
import {
  buildVerifiedDifferentiationCorpus,
  differentiationMetrics,
} from "../tests/fixtures/verified-differentiation-corpus";

const readings = buildVerifiedDifferentiationCorpus(192);
const metrics = differentiationMetrics(readings);
const receipt = {
  schemaVersion: "2.0.0",
  generatedAt: new Date().toISOString(),
  policyStatus: "release-gate",
  corpus: {
    profileCount: 192,
    controlledLocalBaseline: true,
    variedVerifiedNatalEvidence: true,
  },
  metrics,
  readings: readings.map((reading) => ({
    id: reading.id,
    signature: reading.signature,
    biography: reading.biography,
    verifiedEvidenceCount: reading.verifiedEvidenceCount,
    totalEvidenceCount: reading.totalEvidenceCount,
  })),
};

const outputPath = process.argv[2] ?? "verified-profile-differentiation-receipt.json";
await writeFile(outputPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ outputPath, ...metrics }, null, 2));

if (
  metrics.exactDuplicateCount !== 0 ||
  metrics.uniqueNarratives !== metrics.profileCount ||
  metrics.materialPairCount <= 4000 ||
  metrics.maximumMaterialBigramJaccard >= 0.9 ||
  metrics.maximumMaterialTrigramJaccard >= 0.85 ||
  metrics.maximumMaterialIdenticalLayerSummaries > 5 ||
  metrics.minimumVerifiedEvidenceCount < 10
) {
  process.exitCode = 2;
}

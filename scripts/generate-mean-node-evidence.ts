import { writeFile } from "node:fs/promises";
import {
  calculateMeanNorthNodeCandidate,
  circularNodeDeltaDegrees,
} from "../server/services/lunar-node-evidence";
import {
  SWISS_MEAN_NODE_FIXTURES,
  SWISS_MEAN_NODE_REFERENCE,
} from "../tests/fixtures/swiss-mean-node-fixtures";

const rows = SWISS_MEAN_NODE_FIXTURES.map((fixture) => {
  const candidate = calculateMeanNorthNodeCandidate({
    inputTimestamp: fixture.inputTimestamp,
  });
  return {
    id: fixture.id,
    inputTimestamp: fixture.inputTimestamp,
    mode: candidate.mode,
    candidateLongitudeDegrees: candidate.longitudeDegrees,
    candidateSign: candidate.sign,
    referenceLongitudeDegrees: fixture.expectedNorthNodeLongitude,
    longitudeDeltaDegrees: circularNodeDeltaDegrees(
      candidate.longitudeDegrees,
      fixture.expectedNorthNodeLongitude,
    ),
  };
});

const maximumLongitudeDeltaDegrees = Math.max(
  ...rows.map((row) => row.longitudeDeltaDegrees),
);

const receipt = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  policyStatus: "evidence_only_no_node_policy_approved",
  nodeMode: "mean",
  reference: SWISS_MEAN_NODE_REFERENCE,
  rows,
  summary: {
    fixtureCount: rows.length,
    maximumLongitudeDeltaDegrees,
  },
};

const outputPath = process.argv[2] ?? "mean-node-evidence-receipt.json";
await writeFile(outputPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ outputPath, ...receipt.summary }, null, 2));

if (maximumLongitudeDeltaDegrees > 0.01) process.exitCode = 2;

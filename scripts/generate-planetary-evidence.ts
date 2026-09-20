import { writeFile } from "node:fs/promises";
import {
  runLivePlanetaryEvidenceMatrix,
} from "../server/services/astrology-planetary-evidence-matrix";

const outputPath = process.argv[2] ?? "planetary-evidence-receipt.json";
const receipt = await runLivePlanetaryEvidenceMatrix();

await writeFile(outputPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  outputPath,
  fixtureCount: receipt.fixtureCount,
  bodyCount: receipt.bodyCount,
  totalRows: receipt.summary.totalRows,
  signDisagreements: receipt.summary.signDisagreements,
  maximumLongitudeDeltaDegrees: receipt.summary.maximumLongitudeDeltaDegrees,
  bodyMaximumDeltaDegrees: receipt.summary.bodyMaximumDeltaDegrees,
}, null, 2));

if (receipt.summary.signDisagreements !== 0) {
  process.exitCode = 2;
}

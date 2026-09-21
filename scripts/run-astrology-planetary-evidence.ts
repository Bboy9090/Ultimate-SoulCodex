import { mkdir, writeFile } from "node:fs/promises";
import { runLiveEphemerisEvidenceMatrix } from "../server/services/astrology-evidence-matrix";

const outputPath = process.argv[2] ?? "artifacts/astrology-planetary-evidence-v1.json";
const receipt = await runLiveEphemerisEvidenceMatrix();

await mkdir(outputPath.slice(0, outputPath.lastIndexOf("/")), { recursive: true });
await writeFile(outputPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  outputPath,
  generatedAt: receipt.generatedAt,
  totalRows: receipt.summary.totalRows,
  signDisagreements: receipt.summary.signDisagreements,
  maximumLongitudeDeltaDegrees: receipt.summary.maximumLongitudeDeltaDegrees,
  bodyMaximumDeltaDegrees: receipt.summary.bodyMaximumDeltaDegrees,
}, null, 2));

if (receipt.summary.signDisagreements !== 0) {
  process.exitCode = 2;
}

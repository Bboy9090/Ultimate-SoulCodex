import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { runLiveEphemerisEvidenceMatrix } from "../server/services/astrology-evidence-matrix";

const outputPath = resolve(
  process.argv[2] ?? "artifacts/astrology/ephemeris-evidence-receipt.json",
);

async function main(): Promise<void> {
  const receipt = await runLiveEphemerisEvidenceMatrix();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

  console.log(`Ephemeris evidence receipt written to ${outputPath}`);
  console.log(JSON.stringify(receipt.summary, null, 2));

  if (receipt.summary.signDisagreements > 0) {
    process.exitCode = 2;
    console.error("Sign disagreement detected. No tolerance policy may be approved from this receipt.");
  }
}

main().catch((error: unknown) => {
  process.exitCode = 1;
  console.error("Live ephemeris evidence run failed closed.");
  console.error(error instanceof Error ? error.message : String(error));
});

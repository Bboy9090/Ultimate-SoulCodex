import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { runPlanetaryEvidenceMatrix } from "../server/services/planetary-evidence-matrix";

const outputPath = resolve(
  process.argv[2] ?? "artifacts/astrology/planetary-ephemeris-evidence-receipt.json",
);

async function writeReceipt(receipt: unknown): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  try {
    const receipt = await runPlanetaryEvidenceMatrix();
    await writeReceipt(receipt);

    console.log(`Planetary ephemeris evidence receipt written to ${outputPath}`);
    console.log(JSON.stringify(receipt.summary, null, 2));

    if (receipt.summary.totalRows !== 80) {
      process.exitCode = 2;
      console.error(`Expected 80 evidence rows, received ${receipt.summary.totalRows}.`);
    }
    if (receipt.summary.rowsPerBody !== 10) {
      process.exitCode = 2;
      console.error(`Expected 10 evidence rows per body, received ${receipt.summary.rowsPerBody}.`);
    }
    if (receipt.summary.signDisagreements > 0) {
      process.exitCode = 2;
      console.error("Planetary sign disagreement detected. No production policy may be approved from this receipt.");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const failureReceipt = {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      policyStatus: "evidence_unavailable_fail_closed",
      status: "planetary_evidence_generation_failed",
      source: "NASA/JPL Horizons API",
      failure: {
        code: message,
        retryPolicy: {
          maxAttemptsPerRequest: 4,
          transientHttpStatuses: [429, 500, 502, 503, 504],
          baseDelayMilliseconds: 650,
        },
      },
    };

    await writeReceipt(failureReceipt);
    process.exitCode = 1;
    console.error("Live planetary evidence run failed closed.");
    console.error(message);
    console.error(`Failure receipt written to ${outputPath}`);
  }
}

void main();

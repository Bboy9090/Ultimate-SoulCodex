import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { runLiveEphemerisEvidenceMatrix } from "../server/services/astrology-evidence-matrix";

const outputPath = resolve(
  process.argv[2] ?? "artifacts/astrology/ephemeris-evidence-receipt.json",
);

async function writeReceipt(receipt: unknown): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  try {
    const receipt = await runLiveEphemerisEvidenceMatrix();
    await writeReceipt(receipt);

    console.log(`Ephemeris evidence receipt written to ${outputPath}`);
    console.log(JSON.stringify(receipt.summary, null, 2));

    if (receipt.summary.signDisagreements > 0) {
      process.exitCode = 2;
      console.error("Sign disagreement detected. No tolerance policy may be approved from this receipt.");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const availabilityFailure = /^horizons_http_(429|500|502|503|504)$/.test(message);
    const failureReceipt = {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      policyStatus: "evidence_unavailable_fail_closed",
      status: availabilityFailure ? "reference_service_unavailable" : "evidence_generation_failed",
      source: "NASA/JPL Horizons API",
      failure: {
        code: message,
        retryPolicy: {
          maxAttemptsPerRequest: 4,
          transientHttpStatuses: [429, 500, 502, 503, 504],
          baseDelayMilliseconds: 500,
        },
      },
    };

    await writeReceipt(failureReceipt);
    process.exitCode = 1;
    console.error("Live ephemeris evidence run failed closed.");
    console.error(message);
    console.error(`Failure receipt written to ${outputPath}`);
  }
}

void main();

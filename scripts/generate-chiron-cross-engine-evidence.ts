import { readFile, writeFile } from "node:fs/promises";
import { fetchChironHorizonsReference } from "../server/services/chiron-horizons-reference";

interface SwissRow {
  id: string;
  inputTimestamp: string;
  referenceLongitudeDegrees: number;
  engine: string;
  ephemerisFlags: number;
}

interface SwissPayload {
  schemaVersion: string;
  body: "Chiron";
  reference: string;
  rows: SwissRow[];
}

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

const inputPath = process.argv[2] ?? "chiron-swiss-reference.json";
const outputPath = process.argv[3] ?? "chiron-cross-engine-receipt.json";
const swiss = JSON.parse(await readFile(inputPath, "utf8")) as SwissPayload;
const rows = [];

for (const fixture of swiss.rows) {
  const jpl = await fetchChironHorizonsReference(fixture.inputTimestamp, {
    timeoutMs: 15_000,
  });
  const delta = circularDelta(jpl.longitude, fixture.referenceLongitudeDegrees);
  rows.push({
    id: fixture.id,
    inputTimestamp: fixture.inputTimestamp,
    swissEngine: fixture.engine,
    swissLongitudeDegrees: fixture.referenceLongitudeDegrees,
    jplEngine: jpl.engine,
    jplLongitudeDegrees: jpl.longitude,
    jplSign: jpl.sign,
    longitudeDeltaDegrees: delta,
  });
}

const maximumLongitudeDeltaDegrees = Math.max(
  ...rows.map((row) => row.longitudeDeltaDegrees),
);

const receipt = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  policyStatus: "evidence_only_no_chiron_policy_approved",
  body: "Chiron",
  swissReference: swiss.reference,
  jplReference:
    "NASA/JPL Horizons 2060 Chiron geocentric apparent ecliptic-of-date longitude",
  fixtureCount: rows.length,
  rows,
  summary: {
    maximumLongitudeDeltaDegrees,
  },
};

await writeFile(outputPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ outputPath, fixtureCount: rows.length, maximumLongitudeDeltaDegrees }, null, 2));

if (!Number.isFinite(maximumLongitudeDeltaDegrees) || maximumLongitudeDeltaDegrees > 0.1) {
  process.exitCode = 2;
}

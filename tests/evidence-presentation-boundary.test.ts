import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const viewer = readFileSync("client/src/components/EvidenceViewer.tsx", "utf8");
const formatter = readFileSync("packages/core/evidence-ledger/format.ts", "utf8");

test("EvidenceViewer presents provenance support rather than truth percentages", () => {
  assert.doesNotMatch(viewer, /formatConfidenceAsPercent/);
  assert.doesNotMatch(
    viewer,
    /verified \(100%\)|high \(85%\)|moderate \(70%\)|partial \(55%\)|low \(35%\)|unverified \(15%\)/i,
  );
  assert.match(viewer, /Source-support tiers describe provenance/);
  assert.match(viewer, /not probabilities that a symbolic interpretation is true/i);
});

test("shared evidence formatters keep numeric weights internal", () => {
  assert.match(
    formatter,
    /Numeric confidence weights are useful for engine ranking and threshold logic/,
  );
  assert.match(
    formatter,
    /User-facing surfaces should prefer formatConfidenceAsSupportLabel/,
  );
  assert.match(formatter, /formatConfidenceAsSupportLabel/);
  assert.doesNotMatch(
    formatter.match(/export function formatEvidenceEntry[\s\S]*?\n\}/)?.[0] ?? "",
    /formatConfidenceAsPercent/,
  );
  assert.doesNotMatch(
    formatter.match(/export function formatSummaryAsText[\s\S]*?return lines\.join/)?.[0] ?? "",
    /Average Confidence|formatConfidenceAsPercent/,
  );
});

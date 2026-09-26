import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync(
  "client/src/components/soul-codex/VerifiedSystemsPanel.tsx",
  "utf8",
);

test("verified foundations panel exposes user-facing method transparency", () => {
  assert.match(panel, /Why this system is included/);
  assert.match(panel, /buildVerifiedSystemMethodSummaries/);
  assert.match(panel, /data-verified-system-method/);
  assert.match(panel, /Verified Ephemeris/);
});

test("verified foundations panel preserves reduced-motion accessibility", () => {
  assert.match(panel, /prefers-reduced-motion:\s*reduce/);
  assert.match(panel, /animation:\s*none/);
  assert.match(panel, /transition:\s*none/);
});

test("verified foundations panel does not render raw verification secrets", () => {
  assert.doesNotMatch(
    panel,
    /verificationReceiptId\s*\}|independentSource\s*\}|verifiedAt\s*\}/,
  );
  assert.doesNotMatch(panel, /receipt id|raw receipt|verification timestamp/i);
});

test("verified foundations framing rejects certainty inflation", () => {
  assert.match(panel, /symbolic resonance — not extra certainty/);
  assert.doesNotMatch(
    panel,
    /proves who you are|scientifically proves|guaranteed identity|destined personality/i,
  );
});

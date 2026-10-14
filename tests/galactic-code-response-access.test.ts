import assert from "node:assert/strict";
import test from "node:test";
import { projectGalacticCodeForTier } from "../server/lib/galactic-code-response-access";

const result = {
  profileId: "secret-profile", version: "galactic-code-v1",
  fingerprint: "secret-fingerprint", shortCode: "secret-short-code",
  uniquenessKey: "secret-uniqueness", coverage: "partial",
  sourceCoverage: { astrology: "partial" }, codename: "The Architect",
  designation: "The Architect", tagline: "Build with intention",
  primaryFunction: "Synthesis", secondaryFunction: "secret-secondary",
  legacyFunction: "secret-legacy", frequency: "secret-frequency",
  axes: [{ axis: "secret" }], elementMatrix: { fire: 1 },
  behavioralSequence: ["secret-sequence"],
  interpretation: { identity: "secret-interpretation" },
  evidence: ["secret-evidence"], generatedAt: "2026-10-14T00:00:00Z",
} as any;

test("Free Galactic Code omits fingerprint, short code, private identity, and deep interpretation", () => {
  const brief = projectGalacticCodeForTier(result, "free");
  const serialized = JSON.stringify(brief);
  for (const secret of ["secret-profile", "secret-fingerprint", "secret-short-code", "secret-uniqueness", "secret-interpretation", "secret-evidence", "secret-secondary"]) {
    assert.equal(serialized.includes(secret), false, secret);
  }
  assert.equal((brief as any).codename, "The Architect");
  assert.equal((brief as any).coverage, "partial");
});

test("Plus projection preserves the complete result without mutation", () => {
  assert.equal(projectGalacticCodeForTier(result, "plus"), result);
  assert.equal(result.fingerprint, "secret-fingerprint");
});

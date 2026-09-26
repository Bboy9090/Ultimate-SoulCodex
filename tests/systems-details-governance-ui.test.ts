import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  registryDisplayManifest,
  registryEntry,
} from "../shared/system-registry";

const systemsDetails = readFileSync(
  "client/src/pages/SystemsDetailsPage.tsx",
  "utf8",
);
const verifiedPanel = readFileSync(
  "client/src/components/soul-codex/VerifiedSystemsPanel.tsx",
  "utf8",
);

test("advanced systems inspector uses the canonical registry manifest", () => {
  assert.match(systemsDetails, /registryDisplayManifest/);
  assert.match(systemsDetails, /System governance atlas/);
  assert.match(
    systemsDetails,
    /not a claim that every system is active for this profile/i,
  );
});

test("quarantined systems remain explicitly unavailable", () => {
  const manifest = registryDisplayManifest();
  for (const id of [
    "gene-keys",
    "vedic-astrology",
    "chakras",
    "runes",
    "sacred-geometry",
    "fixed-stars",
    "astrocartography",
    "palmistry",
  ]) {
    const entry = manifest.find((candidate) => candidate.id === id);
    assert.ok(entry, id);
    assert.equal(entry?.state, "Unavailable", id);
    assert.equal(entry?.stableIdentityEligible, false, id);
  }
});

test("time-varying numerology stays governed but outside stable identity", () => {
  const cycles = registryEntry("numerology-cycles");
  assert.ok(cycles);
  assert.equal(cycles?.state, "governed");
  assert.equal(cycles?.mayInfluenceUltimateCodex, false);
  assert.match(
    systemsDetails,
    /Personal Year is a changing cycle and is kept out of the permanent Codex fingerprint/,
  );
});

test("full registry atlas stays out of the main verified foundations panel", () => {
  assert.doesNotMatch(verifiedPanel, /registryDisplayManifest/);
  assert.doesNotMatch(verifiedPanel, /System governance atlas/);
  assert.match(verifiedPanel, /Your Verified Foundations/);
});

test("advanced inspector distinguishes profile verification from system governance", () => {
  assert.match(
    systemsDetails,
    /Per-profile verification is separate and still has to pass at runtime/,
  );
  assert.match(
    systemsDetails,
    /Calculated candidate · not promoted/,
  );
  assert.match(
    systemsDetails,
    /Verified chart fact/,
  );
});

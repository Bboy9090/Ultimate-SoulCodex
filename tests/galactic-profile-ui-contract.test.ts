import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SOUL_CODEX_CAPABILITIES, tierAllowsCapability } from "../shared/product-access";

const panel = readFileSync(new URL("../client/src/components/GalacticCodePanel.tsx", import.meta.url), "utf8");
const map = readFileSync(new URL("../client/src/components/GalacticCodeMap.tsx", import.meta.url), "utf8");
const profile = readFileSync(new URL("../client/src/pages/profile.tsx", import.meta.url), "utf8");

test("profile wires the qualified profile-owned Galactic endpoint", () => {
  assert.match(profile, /GalacticCodePanel/);
  assert.match(panel, /encodeURIComponent\(profileId\)/);
  assert.match(panel, /apiRequest\("POST", `\/api\/profiles\/\$\{encodeURIComponent\(profileId\)\}\/galactic-code`, \{\}\)/);
  assert.match(panel, /saved profile/i);
});

test("Galactic profile errors distinguish evidence, throttling, outage, and ownership states", () => {
  assert.match(panel, /status === "422"/);
  assert.match(panel, /needs more verified evidence/);
  assert.match(panel, /status === "429"/);
  assert.match(panel, /Too many synthesis requests/);
  assert.match(panel, /status === "503"/);
  assert.match(panel, /temporarily unavailable/);
  assert.match(panel, /status === "404"/);
  assert.match(panel, /not available for synthesis/);
});

test("Free receives the clear brief without private fingerprint fields", () => {
  assert.equal(tierAllowsCapability("free", "cross_system_synthesis"), false);
  assert.match(panel, /The clear core stays visible on Free/);
  assert.doesNotMatch(panel, /shortCode/);
  assert.doesNotMatch(panel, /uniquenessKey/);
  assert.doesNotMatch(panel, /fingerprint/);
});

test("Plus depth is live and still capability-gated", () => {
  assert.equal(SOUL_CODEX_CAPABILITIES.cross_system_synthesis.availability, "live");
  assert.equal(tierAllowsCapability("plus", "cross_system_synthesis"), true);
  assert.match(panel, /tierAllowsCapability\(tier, "cross_system_synthesis"\)/);
  assert.match(panel, /fullResult && canSeeDepth/);
  assert.match(panel, /GalacticCodeMap/);
});

test("deep map uses plain-language headings", () => {
  for (const heading of [
    "Your strongest patterns",
    "How the pattern tends to move",
    "Element balance",
    "Long-term theme",
    "What this is based on",
  ]) {
    assert.match(map, new RegExp(heading));
  }
  assert.doesNotMatch(map, />Galactic Axes</);
  assert.doesNotMatch(map, />Behavioral Sequence</);
  assert.doesNotMatch(map, />Element Matrix</);
});

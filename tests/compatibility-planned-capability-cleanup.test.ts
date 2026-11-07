import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hub = readFileSync(new URL("../client/src/pages/CompatibilityHubPage.tsx", import.meta.url), "utf8");

test("Compatibility Hub presents advanced Connections as roadmap-only without a live entitlement branch", () => {
  assert.match(hub, /Planned · not included in current Soul Codex\+/);
  assert.doesNotMatch(hub, /tierAllowsCapability\(tier, "advanced_connections"\)/);
  assert.doesNotMatch(hub, /const advancedConnections/);
});

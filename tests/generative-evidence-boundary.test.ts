import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const openaiService = readFileSync("server/services/openai-service.ts", "utf8");
const activeRoutes = readFileSync("server/routes.ts", "utf8");

test("generated biography and guidance consume verified astrology only", () => {
  assert.match(openaiService, /extractVerifiedAstrology/);
  assert.match(openaiService, /Do not infer or interpret these placements/);
  assert.match(openaiService, /Do not invent or infer unresolved astrology/);
  assert.match(openaiService, /Unresolved astrology is intentionally omitted rather than turned into a polished guess/);
});

test("active profile creation passes verification-gated astrology aliases into prose", () => {
  assert.match(activeRoutes, /withVerifiedLegacyAliases\(verifiedAstrologyData\)/);
  assert.match(activeRoutes, /generateBiography\(\{/);
  assert.match(activeRoutes, /generateDailyGuidance\(\{/);
  assert.doesNotMatch(
    activeRoutes,
    /moonSign:\s*verifiedAstrologyData\.moon\.sign(?!\s*:)/,
    "profile creation must not bypass verification status when exposing Moon aliases",
  );
});

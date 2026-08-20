import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as geoTz from "geo-tz";

const createFlow = readFileSync(
  new URL("../client/src/pages/local-first-input-form.tsx", import.meta.url),
  "utf8",
);
const routeSource = readFileSync(
  new URL("../server/routes/location-resolution.ts", import.meta.url),
  "utf8",
);

test("coordinate-derived timezone resolution identifies known birth locations", () => {
  assert.ok(geoTz.find(40.7128, -74.006).includes("America/New_York"));
  assert.ok(geoTz.find(35.6762, 139.6503).includes("Asia/Tokyo"));
  assert.ok(geoTz.find(18.4655, -66.1057).includes("America/Puerto_Rico"));
});

test("create flow never substitutes the current device timezone for a remote birthplace", () => {
  assert.match(createFlow, /\/api\/location\/resolve/);
  assert.match(createFlow, /timezone:\s*""/);
  assert.match(createFlow, /Your current device timezone is never substituted/);
  assert.doesNotMatch(createFlow, /nominatim\.openstreetmap\.org/);
  assert.doesNotMatch(createFlow, /browserTimezone/);
  assert.doesNotMatch(createFlow, /timezone:\s*browserTimezone/);
});

test("complete timed chart inputs are explained as verification-ready, not missing", () => {
  assert.match(createFlow, /data-testid="chart-input-readiness"/);
  assert.match(createFlow, /Exact chart inputs are ready/);
  assert.match(createFlow, /calculate Moon and Rising candidates/);
  assert.match(createFlow, /Independent online verification is the only remaining step/);
});

test("location resolution remains minimal-purpose and non-persistent", () => {
  assert.match(routeSource, /resolveGeo\(parsed\.data\.place\)/);
  assert.match(routeSource, /geoTz\.find\(geo\.lat, geo\.lon\)/);
  assert.match(routeSource, /persistedProfile:\s*false/);
  assert.match(routeSource, /aiGeneration:\s*false/);
  assert.match(routeSource, /birth_location_resolution_only/);
  assert.doesNotMatch(routeSource, /storage\./);
  assert.doesNotMatch(routeSource, /generateBiography|generateDailyGuidance|OpenAI/);
});

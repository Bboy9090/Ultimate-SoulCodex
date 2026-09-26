import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activeRoutes = readFileSync("server/routes.ts", "utf8");
const openaiService = readFileSync("server/services/openai-service.ts", "utf8");
const dailyInsights = readFileSync("packages/astrology/daily-insights.ts", "utf8");
const offlineProfilePage = readFileSync("client/src/pages/offline-profile.tsx", "utf8");

test("profile creation persists governed stable guidance instead of AI daily prose", () => {
  assert.doesNotMatch(
    activeRoutes,
    /generateDailyGuidance\s*\(/,
    "production profile creation must not call generative daily guidance",
  );
  assert.match(
    activeRoutes,
    /const dailyGuidance = archetypeData\.guidance/,
  );
});

test("legacy daily guidance compatibility surface cannot call a generative model", () => {
  const fn =
    openaiService.match(
      /export async function generateDailyGuidance[\s\S]*?\n}\n/,
    )?.[0] ?? "";

  assert.ok(fn.length > 0);
  assert.doesNotMatch(fn, /generateText|Gemini|temperature|prompt\s*=/i);
  assert.match(fn, /data\.archetype\?\.guidance/);
});

test("live current-day guidance remains owned by the governed daily engine", () => {
  assert.match(dailyInsights, /getDailyContext/);
  assert.match(dailyInsights, /selectTemplates/);
  assert.match(dailyInsights, /template\.template\(contextWithProfile\)/);
});

test("stable profile guidance is not mislabeled as current-day output", () => {
  assert.match(offlineProfilePage, /Grounded action/);
  assert.match(offlineProfilePage, /stable profile synthesis/);
  assert.doesNotMatch(
    offlineProfilePage,
    />Current guidance<\/p><p[^>]*>local interpretation/,
  );
});

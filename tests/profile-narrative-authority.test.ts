import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activeRoutes = readFileSync("server/routes.ts", "utf8");
const narrativeService = readFileSync("server/services/openai-service.ts", "utf8");
const profilePage = readFileSync("client/src/pages/profile.tsx", "utf8");

test("persisted biography remains deterministic and provider-independent", () => {
  const fn =
    narrativeService.match(
      /export async function generateBiography[\s\S]*?\n}\n/,
    )?.[0] ?? "";

  assert.ok(fn.length > 0);
  assert.doesNotMatch(fn, /generateText|Gemini|temperature|prompt\s*=/i);
  assert.match(fn, /data\.archetype\?\.description/);
  assert.match(fn, /data\.archetype\?\.guidance/);
});

test("profile creation stores governed synthesis rather than a provider result", () => {
  assert.match(activeRoutes, /const biography = await generateBiography/);
  assert.match(activeRoutes, /const dailyGuidance = archetypeData\.guidance/);
  assert.doesNotMatch(
    activeRoutes,
    /generateDailyGuidance\s*\(/,
  );
});

test("profile UI does not present AI prose as identity evidence", () => {
  assert.match(profilePage, /saved deterministic biography and governed archetype synthesis/);
  assert.match(profilePage, /not clinical findings or AI-authored evidence/);
});

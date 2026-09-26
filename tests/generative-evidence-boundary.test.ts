import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const openaiService = readFileSync("server/services/openai-service.ts", "utf8");
const activeRoutes = readFileSync("server/routes.ts", "utf8");

test("persisted biography and guidance consume only governed verified astrology", () => {
  assert.match(openaiService, /extractVerifiedAstrology/);
  assert.match(openaiService, /Do not infer or interpret these placements/);
  assert.match(
    openaiService,
    /Unresolved astrology is intentionally omitted rather than turned into a polished guess/,
  );
  assert.match(
    openaiService,
    /Persisted identity text must be reproducible from governed inputs/,
  );
  assert.match(
    openaiService,
    /this function never\s*\n?\s*\*?\s*calls a generative model|this function never\s+calls a generative model/,
  );
});

test("active profile creation passes verification-gated astrology into stable prose only", () => {
  assert.match(activeRoutes, /withVerifiedLegacyAliases\(verifiedAstrologyData\)/);
  assert.match(activeRoutes, /generateBiography\(\{/);

  // Current-day guidance must not be generated and frozen during profile
  // creation. The stable profile stores governed archetype guidance; live
  // timing belongs to the Today/Daily engine.
  assert.match(activeRoutes, /const dailyGuidance = archetypeData\.guidance/);
  assert.doesNotMatch(
    activeRoutes,
    /app\.post\("\/api\/profiles"[\s\S]*generateDailyGuidance\(\{/,
    "profile creation must not freeze time-sensitive AI guidance into the stable profile",
  );

  assert.doesNotMatch(
    activeRoutes,
    /moonSign:\s*verifiedAstrologyData\.moon\.sign(?!\s*:)/,
    "profile creation must not bypass verification status when exposing Moon aliases",
  );
});

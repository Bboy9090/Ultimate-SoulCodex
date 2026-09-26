import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const offline = readFileSync(
  "client/src/lib/foundationOfflineCodex.ts",
  "utf8",
);
const daily = readFileSync(
  "packages/astrology/daily-context.ts",
  "utf8",
);
const timeline = readFileSync(
  "packages/core/timeline/index.ts",
  "utf8",
);
const timelineNumerology = readFileSync(
  "packages/astrology/timeline/numerology.ts",
  "utf8",
);
const lifeMap = readFileSync(
  "src/lifemap/engine.ts",
  "utf8",
);
const serverNumerology = readFileSync(
  "server/services/numerology.ts",
  "utf8",
);

test("all governed Personal Year consumers use the core calculator", () => {
  for (const [name, source] of [
    ["offline", offline],
    ["timeline", timeline],
    ["timelineNumerology", timelineNumerology],
    ["serverNumerology", serverNumerology],
  ] as const) {
    assert.match(
      source,
      /calcPersonalYear/,
      `${name} must depend on the canonical Personal Year calculator`,
    );
  }

  assert.doesNotMatch(
    offline,
    /function\s+personalYear\s*\(/,
  );
  assert.doesNotMatch(
    timelineNumerology,
    /digitSum\(|reduceToSingleDigit\(/,
  );
});

test("Today uses canonical Personal Day and Universal Day arithmetic", () => {
  assert.match(daily, /calcPersonalDay/);
  assert.match(daily, /calcUniversalDay/);
  assert.doesNotMatch(
    daily,
    /function\s+reduceToSingleDigit\s*\(/,
  );
});

test("LifeMap never invents Personal Year 1 when evidence is absent", () => {
  assert.match(lifeMap, /lifemap_personal_year_required/);
  assert.doesNotMatch(
    lifeMap,
    /personalYear\s*\|\|\s*1/,
  );
  assert.doesNotMatch(
    lifeMap,
    /personalYear\s*\?\?\s*1/,
  );
});

test("Timeline keeps master-number identity separate from phase scoring root", () => {
  assert.match(
    timelineNumerology,
    /11:\s*2[\s\S]*22:\s*4[\s\S]*33:\s*6/,
  );
  assert.match(
    timelineNumerology,
    /preserves its master-number identity/i,
  );
});

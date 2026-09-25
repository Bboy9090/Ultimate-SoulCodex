import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const serverIndex = readFileSync("server/index.ts", "utf8");
const activeServerRoutes = readFileSync("server/routes.ts", "utf8");
const compatibilityRoute = readFileSync("server/routes/compatibility.ts", "utf8");

test("production server entry stays on governed server routes", () => {
  assert.match(
    serverIndex,
    /from "\.\/routes\.js"/,
    "production must register server/routes.ts",
  );
  assert.doesNotMatch(
    serverIndex,
    /from "\.\.\/routes|from "\.\/\.\.\/routes/,
    "production must never import the legacy root routes.ts",
  );
});

test("production compatibility stays on evidence-aware router", () => {
  assert.match(
    serverIndex,
    /from "\.\/routes\/compatibility\.js"/,
    "production must mount the evidence-aware compatibility router",
  );
  assert.doesNotMatch(
    serverIndex,
    /services\/compatibility/,
    "production entry must not import the legacy monolithic compatibility engine",
  );
  assert.doesNotMatch(
    activeServerRoutes,
    /calculateCompatibility|services\/compatibility/,
    "active server routes must not reintroduce the legacy compatibility scorer",
  );
});

test("Foundation compatibility keeps unverified time-sensitive systems excluded", () => {
  assert.match(compatibilityRoute, /extractVerifiedAstrology/);
  assert.match(compatibilityRoute, /Human Design excluded from Foundation compatibility/);
  assert.match(compatibilityRoute, /Moon and Rising are not used in Foundation Compatibility/);
  assert.match(compatibilityRoute, /evidenceMode/);
});

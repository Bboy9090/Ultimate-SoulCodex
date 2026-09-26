import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activeRoutes = readFileSync("server/routes.ts", "utf8");
const registry = readFileSync("shared/system-registry.ts", "utf8");

test("production Enneagram and MBTI require explicit assessment payloads", () => {
  assert.match(
    activeRoutes,
    /enneagramAssessmentSchema\.parse\(req\.body\)[\s\S]*calculateEnneagram\(assessment\.responses\)/,
  );
  assert.match(
    activeRoutes,
    /mbtiAssessmentSchema\.parse\(req\.body\)[\s\S]*calculateMBTI\(assessment\.responses\)/,
  );
});

test("production does not infer personality assessments from birth data", () => {
  const enneagramRoute =
    activeRoutes.match(
      /app\.post\("\/api\/profiles\/:id\/enneagram"[\s\S]*?\n\s*}\);/,
    )?.[0] ?? "";
  const mbtiRoute =
    activeRoutes.match(
      /app\.post\("\/api\/profiles\/:id\/mbti"[\s\S]*?\n\s*}\);/,
    )?.[0] ?? "";

  for (const route of [enneagramRoute, mbtiRoute]) {
    assert.ok(route.length > 0);
    assert.doesNotMatch(route, /birthDate|birthTime|astrologyData|numerologyData/);
  }
});

test("registry keeps personality frameworks supporting-only", () => {
  assert.match(
    registry,
    /id: "personality-assessments"[\s\S]*state: "user-assessed"[\s\S]*mayInfluenceUltimateCodex: false/,
  );
  assert.match(registry, /Never infer a type from birth data/);
});

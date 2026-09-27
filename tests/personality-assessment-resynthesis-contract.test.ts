import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routesUrl = new URL("../server/routes.ts", import.meta.url);
const openAiUrl = new URL("../server/services/openai-service.ts", import.meta.url);

test("personality assessments resynthesize saved narrative outputs", async () => {
  const source = await readFile(routesUrl, "utf8");

  for (const route of ["enneagram", "mbti"]) {
    const start = source.indexOf(`app.post("/api/profiles/:id/${route}"`);
    assert.notEqual(start, -1, `${route} route should exist`);
    const nextRoute = source.indexOf("app.post(", start + 20);
    const block = source.slice(start, nextRoute === -1 ? source.length : nextRoute);

    assert.match(block, /generateBiography\(/, `${route} should refresh biography`);
    assert.match(block, /generateDailyGuidance\(/, `${route} should refresh daily guidance`);
    assert.match(block, /biography,\s*\n\s*dailyGuidance/, `${route} should persist refreshed narrative outputs`);
  }
});

test("biography and daily guidance prompts calibrate symbolic claims", async () => {
  const source = await readFile(openAiUrl, "utf8");

  assert.match(source, /symbolic or assessed reflection frameworks/);
  assert.match(source, /not scientific diagnoses or fixed destiny/);
  assert.match(source, /calibrated language/);
  assert.match(source, /reflection prompts rather than fixed identity/);
});

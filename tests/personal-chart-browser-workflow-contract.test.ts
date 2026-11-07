import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../.github/workflows/personal-chart-browser-acceptance.yml", import.meta.url), "utf8");

test("personal chart browser acceptance pins a Playwright-supported runner image", () => {
  assert.match(workflow, /runs-on:\s*ubuntu-24\.04/);
  assert.doesNotMatch(workflow, /runs-on:\s*ubuntu-latest/);
  assert.match(workflow, /@playwright\/test@1\.54\.1/);
  assert.match(workflow, /install --with-deps chromium webkit/);
});

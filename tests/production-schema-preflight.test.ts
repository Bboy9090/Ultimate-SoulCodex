import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scriptUrl = new URL("../scripts/ensure-public-share-schema.mjs", import.meta.url);
const dockerUrl = new URL("../Dockerfile", import.meta.url);

test("production schema preflight is idempotent and non-destructive", async () => {
  const source = await readFile(scriptUrl, "utf8");

  assert.match(source, /CREATE TABLE IF NOT EXISTS "public_profile_shares"/);
  assert.match(source, /CREATE INDEX IF NOT EXISTS "public_profile_shares_profile_idx"/);
  assert.doesNotMatch(source, /DROP\s+TABLE/i);
  assert.doesNotMatch(source, /ALTER\s+TABLE.*DROP/i);
  assert.match(source, /information_schema\.columns/);
  assert.match(source, /missing required columns/);
});

test("production image runs schema preflight before starting the API", async () => {
  const docker = await readFile(dockerUrl, "utf8");

  assert.match(docker, /ensure-public-share-schema\.mjs/);
  assert.match(docker, /node.*ensure-public-share-schema\.mjs.*&&.*node.*dist\/index\.js/);
});

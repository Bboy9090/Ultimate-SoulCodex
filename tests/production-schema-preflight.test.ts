import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scriptUrl = new URL("../scripts/ensure-public-share-schema.mjs", import.meta.url);
const dockerUrl = new URL("../Dockerfile", import.meta.url);

test("production schema preflight is idempotent, complete, and non-destructive", async () => {
  const source = await readFile(scriptUrl, "utf8");

  for (const table of [
    "users",
    "local_users",
    "access_code_redemptions",
    "soul_profiles",
    "assessment_responses",
    "public_profile_shares",
  ]) {
    assert.match(source, new RegExp(`CREATE TABLE IF NOT EXISTS "${table}"`));
  }

  assert.match(source, /"full_birth_name" text/);
  assert.match(source, /ALTER TABLE "soul_profiles" ADD COLUMN IF NOT EXISTS "full_birth_name" text/);
  assert.match(source, /full_birth_name: "text"/);
  assert.match(source, /"birth_date" timestamp NOT NULL/);
  assert.match(source, /birth_date: "timestamp without time zone"/);
  assert.match(source, /CREATE INDEX IF NOT EXISTS "public_profile_shares_profile_idx"/);
  assert.doesNotMatch(source, /DROP\s+TABLE/i);
  assert.doesNotMatch(source, /ALTER\s+TABLE.*DROP/i);
  assert.match(source, /information_schema\.columns/);
  assert.match(source, /incompatible column types/);
  assert.match(source, /active Soul Codex storage schema ready/);
});

test("production image runs schema preflight before starting the API", async () => {
  const docker = await readFile(dockerUrl, "utf8");

  assert.match(docker, /ensure-public-share-schema\.mjs/);
  assert.match(docker, /node.*ensure-public-share-schema\.mjs.*&&.*node.*dist\/index\.js/);
});


test("schema preflight preserves the supported no-database production mode", async () => {
  const source = await readFile(scriptUrl, "utf8");

  assert.match(
    source,
    /DATABASE_URL is not configured; server will use MemStorage/,
  );
  assert.match(source, /process\.exit\(0\)/);
  assert.doesNotMatch(source, /DATABASE_URL is required/);
});

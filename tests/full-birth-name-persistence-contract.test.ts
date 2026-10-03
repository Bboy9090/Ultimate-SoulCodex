import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("durable profile creation persists full birth name separately from display name", () => {
  const source = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
  const profileRoute = source.slice(
    source.indexOf('app.post("/api/profiles"'),
    source.indexOf('app.get("/api/profiles/:id"'),
  );

  assert.match(profileRoute, /calculateNumerology\(birthData\.fullBirthName, birthData\.birthDate\)/);
  assert.match(profileRoute, /name:\s*birthData\.name,/);
  assert.match(
    profileRoute,
    /fullBirthName:\s*birthData\.fullBirthName\?\.trim\(\)\s*\|\|\s*null,/,
  );
  assert.doesNotMatch(
    profileRoute,
    /fullBirthName:\s*birthData\.name/,
    "display names and aliases must never be promoted to full birth name",
  );
});
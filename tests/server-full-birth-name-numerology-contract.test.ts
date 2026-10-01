import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routesUrl = new URL("../server/routes.ts", import.meta.url);

test("profile creation never substitutes display name for name-based numerology", async () => {
  const source = await readFile(routesUrl, "utf8");

  assert.match(
    source,
    /calculateNumerology\(birthData\.fullBirthName, birthData\.birthDate\)/,
  );
  assert.doesNotMatch(
    source,
    /calculateNumerology\(birthData\.name, birthData\.birthDate\)/,
  );
});

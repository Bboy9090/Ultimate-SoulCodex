import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");

test("profile creation returns the entitlement-projected profile with no-store caching", () => {
  const start = routes.indexOf('app.post("/api/profiles"');
  const end = routes.indexOf('app.get("/api/profiles/:id"', start);
  const section = routes.slice(start, end);
  assert.match(section, /resolveProductEntitlementForUser/);
  assert.match(section, /Cache-Control", "private, no-store, max-age=0"/);
  assert.match(section, /res\.status\(201\)\.json\(projectProfileResponseForTier\(profile as any, entitlement\.tier\)\)/);
});

test("owned profile reads resolve current entitlement before returning private profile data", () => {
  const start = routes.indexOf('app.get("/api/profiles/:id"');
  const end = routes.indexOf('app.get("/api/profiles/:id/public-shares"', start);
  const section = routes.slice(start, end);
  assert.match(section, /requestOwnsProfile/);
  assert.match(section, /resolveProductEntitlementForUser\(storage, req\.session\?\.userId \?\? null\)/);
  assert.match(section, /projectProfileResponseForTier\(profile as any, entitlement\.tier\)/);
  assert.match(section, /Cache-Control", "private, no-store, max-age=0"/);
});

for (const assessment of ["enneagram", "mbti"]) {
  test(`${assessment} refresh returns only the current tier projection`, () => {
    const start = routes.indexOf(`app.post("/api/profiles/:id/${assessment}"`);
    const end = routes.indexOf("\n  app.", start + 1);
    const section = routes.slice(start, end);
    assert.match(section, /const entitlement = await resolveProductEntitlementForUser/);
    assert.match(section, /projectProfileResponseForTier\(updatedProfile as any, entitlement\.tier\)/);
    assert.match(section, /Cache-Control", "private, no-store, max-age=0"/);
  });
}

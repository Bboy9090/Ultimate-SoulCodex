import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { buildProfileBirthMomentEvidence } from "../server/lib/profile-birth-moment";

const profile = (birthDate: Date | string, birthTime: string | null, timezone: string | null) =>
  ({ birthDate, birthTime, timezone });

test("saved NYC profile resolves a sourced birth moment from IANA civil time", () => {
  const result = buildProfileBirthMomentEvidence(profile(new Date("1990-09-17T00:00:00.000Z"), "11:11", "America/New_York"));
  assert.equal(result.status, "verified_calculation");
  if (result.status !== "verified_calculation") return;
  assert.equal(result.astronomicalFacts.utcInstant, "1990-09-17T15:11:00.000Z");
  assert.equal(result.astronomicalFacts.timezoneProvenance.suppliedOffset, "-04:00");
  assert.equal(result.astronomicalFacts.source, "astronomy-engine");
  assert.equal(result.astronomicalFacts.calculationContract, "SOUL-BIRTH-MOMENT-LUNAR-v1");
  assert.equal(result.symbolicInterpretation, null);
});

test("historical EST profiles resolve the verified instant, not the server timezone", () => {
  const result = buildProfileBirthMomentEvidence(profile("1987-11-16", "21:00", "America/New_York"));
  assert.equal(result.status, "verified_calculation");
  if (result.status === "verified_calculation") {
    assert.equal(result.astronomicalFacts.utcInstant, "1987-11-17T02:00:00.000Z");
    assert.equal(result.astronomicalFacts.timezoneProvenance.suppliedOffset, "-05:00");
  }
});

test("missing time and timezone never produce invented phase claims", () => {
  const unknown = buildProfileBirthMomentEvidence(profile("1990-09-17", "", "America/New_York"));
  assert.equal(unknown.status, "unavailable");
  if (unknown.status === "unavailable") assert.equal(unknown.reason, "birth_time_unknown");
  const noZone = buildProfileBirthMomentEvidence(profile("1990-09-17", "11:11", null));
  assert.equal(noZone.status, "unavailable");
  if (noZone.status === "unavailable") assert.equal(noZone.reason, "birth_timezone_unknown");
});

test("DST gap and repeated hour fail closed instead of selecting an instant", () => {
  for (const [date, time] of [["2024-03-10", "02:30"], ["2024-11-03", "01:30"]]) {
    const result = buildProfileBirthMomentEvidence(profile(date, time, "America/New_York"));
    assert.equal(result.status, "unavailable");
    if (result.status === "unavailable") {
      assert.equal(result.reason, "birth_time_unresolved");
      assert.equal(result.astronomicalFacts, null);
    }
  }
});

test("bad birth date and unknown zone fail closed", () => {
  for (const item of [
    profile("1990-02-30", "11:11", "America/New_York"),
    profile("1990-09-17", "11:11", "No/Real_Timezone"),
    profile(null as unknown as string, "11:11", "America/New_York"),
  ]) {
    const result = buildProfileBirthMomentEvidence(item);
    assert.equal(result.status, "unavailable");
    assert.equal(result.astronomicalFacts, null);
  }
});

test("birth-moment route is owner-only, no-store and separate from public shares and tier projection", () => {
  const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
  const start = routes.indexOf('app.get("/api/profiles/:id/birth-moment"');
  const end = routes.indexOf('app.get("/api/profiles/:id/public-shares"', start);
  assert.ok(start > 0 && end > start);
  const section = routes.slice(start, end);
  assert.match(section, /requestOwnsProfile\(req, profile\)/);
  assert.match(section, /profileNotFound\(res\)/);
  assert.match(section, /Cache-Control", "private, no-store, max-age=0"/);
  assert.match(section, /buildProfileBirthMomentEvidence\(profile\)/);
  assert.doesNotMatch(section, /publicShare|subscriptionPlan|isPremium/);
});

test("owned profile includes an accessible Free factual panel with explicit unavailable states", () => {
  const page = readFileSync(new URL("../client/src/pages/profile.tsx", import.meta.url), "utf8");
  const panel = readFileSync(new URL("../client/src/components/BirthMomentPanel.tsx", import.meta.url), "utf8");
  assert.match(page, /<BirthMomentPanel profileId=\{String\(id\)\} \/>/);
  assert.match(panel, /Included on Free/);
  assert.match(panel, /birth_time_unknown/);
  assert.match(panel, /birth_time_unresolved/);
  assert.match(panel, /aria-labelledby="birth-moment-heading"/);
  assert.match(panel, /role="status"/);
  assert.match(panel, /not a personality diagnosis/);
  assert.doesNotMatch(panel, /purchase|checkout|upgrade\(/i);
});

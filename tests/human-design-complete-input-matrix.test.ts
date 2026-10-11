import assert from "node:assert/strict";
import test from "node:test";
import { fromZonedTime } from "date-fns-tz";
import { calculateHumanDesign } from "../packages/astrology/human-design";
import { createVerifiedHumanDesignTrustRecord, hasApprovedVerifiedHumanDesignTrust } from "../server/services/human-design-trust";

const places = [
  ["Bronx", "America/New_York", "40.8448", "-73.8648"],
  ["London", "Europe/London", "51.5074", "-0.1278"],
  ["Tokyo", "Asia/Tokyo", "35.6762", "139.6503"],
  ["Sydney", "Australia/Sydney", "-33.8688", "151.2093"],
  ["Kathmandu", "Asia/Kathmandu", "27.7172", "85.3240"],
  ["Mexico City", "America/Mexico_City", "19.4326", "-99.1332"],
  ["Reykjavik", "Atlantic/Reykjavik", "64.1466", "-21.9426"],
  ["Cape Town", "Africa/Johannesburg", "-33.9249", "18.4241"],
];
const births = [
  ["1990-09-17", "11:11"],
  ["1988-02-29", "00:15"],
  ["2001-12-31", "23:45"],
];

test("24 complete birth inputs resolve Human Design and retain approved core trust", () => {
  const signatures = new Set<string>();
  for (const [birthLocation, timezone, latitude, longitude] of places) {
    for (const [birthDate, birthTime] of births) {
      const label = `${birthLocation} ${birthDate} ${birthTime}`;
      const result = calculateHumanDesign({ name: label, birthDate, birthTime,
        birthLocation, timezone, latitude, longitude });
      assert.equal(result.status, "resolved", `${label}: ${JSON.stringify(result)}`);
      if (result.status !== "resolved") continue;
      const trust = createVerifiedHumanDesignTrustRecord({ birthTimeKnown: true,
        inputTimestampUtc: fromZonedTime(`${birthDate}T${birthTime}:00`, timezone).toISOString(),
        calculatedAt: "2026-10-07T18:00:00.000Z", candidate: result });
      assert.equal(trust.status, "verified", `${label}: ${result.type}/${result.authority}/${result.profile}`);
      assert.equal(hasApprovedVerifiedHumanDesignTrust(trust), true, label);
      assert.equal(Object.keys(result.activations.conscious).length, 13, label);
      assert.equal(Object.keys(result.activations.unconscious).length, 13, label);
      signatures.add(`${result.type}/${result.authority}/${result.profile}`);
    }
  }
  assert.ok(signatures.size >= 6, `Unexpectedly collapsed core signatures: ${[...signatures].join(", ")}`);
});

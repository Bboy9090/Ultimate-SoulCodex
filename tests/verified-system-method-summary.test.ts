import assert from "node:assert/strict";
import test from "node:test";
import type { VerifiedSystems } from "../packages/core/soul-codex-reading-types";
import { buildVerifiedSystemMethodSummaries } from "../client/src/lib/verifiedSystemMethodSummary";

function verifiedSystems(): VerifiedSystems {
  return {
    astrology: {
      status: "verified_ephemeris",
      sunSign: "Virgo",
      sunDegree: 24.2,
      moonSign: "Pisces",
      moonDegree: 11.8,
      ascendant: "Scorpio",
      ascendantDegree: 3.4,
    },
    numerology: {
      lifePathNumber: 9,
      birthdayNumber: 8,
      expressionNumber: 5,
      soulUrgeNumber: 2,
    },
    humanDesign: {
      status: "verified",
      type: "Reflector",
      profileType: "2/5",
      strategy: "Wait a lunar cycle",
      authority: "Lunar",
      verificationReceiptId: "hd-secret-receipt-123",
      independentSource: "private-independent-source-name",
      verifiedAt: "2026-09-26T11:11:11.000Z",
    },
  };
}

test("verified method summaries include only qualified systems", () => {
  const summaries = buildVerifiedSystemMethodSummaries(
    verifiedSystems(),
    "verified_ephemeris",
  );

  assert.deepEqual(
    summaries.map((summary) => summary.id),
    ["astrology", "numerology", "human-design"],
  );
  assert.equal(summaries[0]?.statusLabel, "Verified ephemeris");
  assert.equal(summaries[1]?.statusLabel, "Deterministic arithmetic");
  assert.equal(summaries[2]?.statusLabel, "Verified core");
});

test("method summaries never expose raw verification metadata", () => {
  const serialized = JSON.stringify(
    buildVerifiedSystemMethodSummaries(
      verifiedSystems(),
      "verified_ephemeris",
    ),
  );

  for (const forbidden of [
    "hd-secret-receipt-123",
    "private-independent-source-name",
    "2026-09-26T11:11:11.000Z",
    "verificationReceiptId",
    "independentSource",
    "verifiedAt",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});

test("Human Design disclosure fails closed without the complete verification contract", () => {
  const systems = verifiedSystems();
  systems.humanDesign = {
    ...systems.humanDesign!,
    verificationReceiptId: undefined,
  };

  const summaries = buildVerifiedSystemMethodSummaries(
    systems,
    "verified_ephemeris",
  );

  assert.equal(
    summaries.some((summary) => summary.id === "human-design"),
    false,
  );
});

test("astrology disclosure appears only for verified ephemeris status on both authorities", () => {
  const systems = verifiedSystems();

  assert.equal(
    buildVerifiedSystemMethodSummaries(
      systems,
      "date_only",
    ).some((summary) => summary.id === "astrology"),
    false,
  );

  systems.astrology.status = "estimated_birth_window";
  assert.equal(
    buildVerifiedSystemMethodSummaries(
      systems,
      "verified_ephemeris",
    ).some((summary) => summary.id === "astrology"),
    false,
  );
});

test("method language preserves the calculation-versus-interpretation boundary", () => {
  const rendered = buildVerifiedSystemMethodSummaries(
    verifiedSystems(),
    "verified_ephemeris",
  )
    .map((summary) => `${summary.basis} ${summary.interpretationBoundary}`)
    .join(" ");

  assert.match(rendered, /calculated evidence/i);
  assert.match(rendered, /symbolic interpretation/i);
  assert.match(rendered, /deterministic/i);
  assert.doesNotMatch(
    rendered,
    /proves personality|guarantees|destined|fated|scientifically proves/i,
  );
});

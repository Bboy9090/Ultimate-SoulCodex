import assert from "node:assert/strict";
import test from "node:test";
import type { VerifiedSystems } from "../packages/core/soul-codex-reading-types";
import { APPROVED_HUMAN_DESIGN_TRUST } from "../packages/core/human-design-trust";
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
      authority: "Lunar Authority",
      engine: APPROVED_HUMAN_DESIGN_TRUST.engine,
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-26T18:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId,
      independentSource: APPROVED_HUMAN_DESIGN_TRUST.independentSource,
      verifiedAt: APPROVED_HUMAN_DESIGN_TRUST.verifiedAt,
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
    APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId,
    APPROVED_HUMAN_DESIGN_TRUST.independentSource,
    APPROVED_HUMAN_DESIGN_TRUST.verifiedAt,
    "2026-09-26T18:00:00.000Z",
    "1990-09-17T15:11:00.000Z",
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


test("Human Design disclosure rejects every canonical trust mutation", () => {
  const mutations: Array<Partial<NonNullable<VerifiedSystems["humanDesign"]>>> = [
    { engine: "other-engine" },
    { source: "" },
    { calculatedAt: "not-a-date" },
    { inputTimestampUtc: "1990-09-17T11:11:00-04:00" },
    { verificationReceiptId: "wrong" },
    { independentSource: "wrong" },
    { verifiedAt: "2026-09-20T00:00:00.000Z" },
    { authority: "Sacral Authority" },
    { profileType: "9/9" },
  ];

  for (const mutation of mutations) {
    const systems = verifiedSystems();
    systems.humanDesign = {
      ...systems.humanDesign!,
      ...mutation,
    };

    const summaries = buildVerifiedSystemMethodSummaries(
      systems,
      "verified_ephemeris",
    );

    assert.equal(
      summaries.some((summary) => summary.id === "human-design"),
      false,
      JSON.stringify(mutation),
    );
  }
});

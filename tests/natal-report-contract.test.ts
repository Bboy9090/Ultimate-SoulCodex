import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildNatalReportPdf } from "../server/natalReportPdf.ts";
import {
  buildNatalReportInput,
  natalReportFilename,
} from "../server/lib/natal-report-contract.ts";

const placementEvidence = {
  source: "independent ephemeris reference",
  engine: "astronomy-engine@2.1.19 + independent-reference@1",
  calculatedAt: "2026-09-25T12:00:00.000Z",
};

const verifiedSun = {
  sign: "Virgo",
  verificationStatus: "verified",
  evidence: placementEvidence,
  internalCandidate: { longitude: 174.25 },
};

function evidenceProfile() {
  return {
    name: "Evidence Test",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    birthTime: "",
    birthLocation: "Bronx, NY",
    isPremium: true,
    astrologyData: {
      sun: verifiedSun,
      moon: {
        sign: null,
        verificationStatus: "requires_verified_birth_time",
        reason: "Birth time required for Moon sign calculation",
      },
      rising: {
        sign: null,
        verificationStatus: "requires_verified_birth_time",
        reason: "Verified birth time required for Ascendant",
      },
      // Deliberately tempting legacy values. None may leak into the report.
      moonSign: "Fake Moon",
      risingSign: "Fake Rising",
      planets: {
        mercury: { sign: "Fake Mercury", degree: 12, house: 7 },
      },
      houses: Array.from({ length: 12 }, (_, i) => ({ degree: i * 30 })),
      aspects: [{ planet1: "sun", planet2: "moon", aspect: "trine", orb: 1 }],
      northNode: { sign: "Fake Node", degree: 10, house: 3 },
      chiron: { sign: "Fake Chiron", degree: 2, house: 8 },
    },
    numerologyData: { lifePath: 9 },
    humanDesignData: {
      status: "calculated_unverified",
      candidate: { type: "Reflector", strategy: "Wait a lunar cycle" },
    },
  };
}

test("natal PDF promotes only verified astronomy and drops legacy precision", () => {
  const report = buildNatalReportInput(evidenceProfile());

  const astrology = report.astrology as any;
  assert.equal(astrology.sunSign, "Virgo");
  assert.equal(astrology.moonSign, null);
  assert.equal(astrology.risingSign, null);
  assert.deepEqual(Object.keys(astrology.planets), ["sun"]);
  assert.equal(astrology.planets.sun.degree, 24.25);
  assert.deepEqual(astrology.houses, []);
  assert.deepEqual(astrology.aspects, []);
  assert.deepEqual(report.humanDesign, {});
  assert.match(report.aiText.bigThreeMoon, /unresolved/i);
  assert.match(report.aiText.houseEmphasis, /intentionally not claimed/i);
  assert.match(report.aiText.hdInterpretation, /not independently verified/i);
});

test("truth-safe premium payload renders real PDF bytes", async () => {
  const pdf = await buildNatalReportPdf(buildNatalReportInput(evidenceProfile()));
  assert.equal(pdf.subarray(0, 4).toString("latin1"), "%PDF");
  assert.ok(pdf.length > 5_000, `expected a substantial report, got ${pdf.length} bytes`);
});

test("verified Human Design exposes only verified core fields", () => {
  const report = buildNatalReportInput({
    name: "HD Test",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    birthTime: "11:11",
    birthLocation: "Bronx, NY",
    astrologyData: {
      sun: verifiedSun,
      moon: { sign: "Leo", verificationStatus: "verified", evidence: placementEvidence, internalCandidate: { longitude: 128.5 } },
      rising: { sign: "Scorpio", verificationStatus: "verified", evidence: placementEvidence, internalCandidate: { longitude: 220 } },
    },
    humanDesignData: {
      status: "verified",
      candidate: {
        type: "Reflector",
        strategy: "Wait a lunar cycle",
        authority: "Lunar",
        profile: "2/5",
        incarnationCross: "must-not-pass-through",
      },
    },
  });

  assert.deepEqual(report.humanDesign, {
    type: "Reflector",
    strategy: "Wait a lunar cycle",
    authority: "Lunar",
    profile: "2/5",
  });
  assert.match(report.aiText.hdInterpretation, /verified trust record/i);
});

test("report filenames cannot inject headers or unsafe path characters", () => {
  assert.equal(
    natalReportFilename(' Bobby\r\nContent-Type: text/html / ../ '),
    "BobbyContent_Type_texthtml_Natal_Chart_Report.pdf",
  );
});

test("production profile UI and endpoint are wired to the canonical report path", () => {
  const profilePage = readFileSync("client/src/pages/profile.tsx", "utf8");
  const downloadButton = readFileSync("client/src/components/NatalReportDownloadButton.tsx", "utf8");
  const routes = readFileSync("server/routes.ts", "utf8");

  assert.match(profilePage, /NatalReportDownloadButton/);
  assert.match(profilePage, /href=\{`\/reading\/\$\{id\}`\}/);
  assert.match(downloadButton, /\/api\/pdf\/profile\/\$\{encodeURIComponent\(profileId\)\}/);
  assert.match(downloadButton, /signature !== "%PDF"/);
  assert.match(routes, /app\.get\("\/api\/pdf\/profile\/:id"/);
  assert.match(routes, /buildNatalReportInput\(profile\)/);
  assert.doesNotMatch(routes, /authToken !== profileId/);
  assert.match(routes, /requestOwnsProfile\(req, profile\)/);
});


test("verified labels without provenance stay unresolved in natal reports", () => {
  const report = buildNatalReportInput({
    name: "Forged Evidence",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    astrologyData: {
      sun: {
        sign: "Virgo",
        verificationStatus: "verified",
        internalCandidate: { longitude: 174.25 },
      },
    },
  });

  assert.equal((report.astrology as any).sunSign, null);
  assert.match(report.aiText.bigThreeSun, /unresolved/i);
});

test("legacy premium natal-report route uses the hardened saved-profile contract", () => {
  const rootRoutes = readFileSync("routes.ts", "utf8");
  const start = rootRoutes.indexOf('app.post("/api/natal-report"');
  const end = rootRoutes.indexOf('app.post("/api/pdf/compatibility"', start);
  assert.ok(start >= 0 && end > start);
  const route = rootRoutes.slice(start, end);

  assert.match(route, /storage\.getProfile/);
  assert.match(route, /profileBelongsToActor/);
  assert.match(route, /buildNatalReportInput\(reportProfile\)/);
  assert.doesNotMatch(route, /const \{ profile, astrologyData, humanDesignData \} = req\.body/);
  assert.doesNotMatch(route, /routeAIRequest/);
  assert.match(route, /astrologyData: null/);
  assert.match(route, /humanDesignData: null/);
});


test("legacy profile PDF route uses the canonical natal report contract", () => {
  const routes = readFileSync("routes.ts", "utf8");
  const start = routes.indexOf('app.post("/api/pdf/profile"');
  const end = routes.indexOf('// ── Full Cosmic Blueprint', start);
  assert.ok(start >= 0 && end > start);
  const source = routes.slice(start, end);

  assert.match(source, /buildNatalReportInput\(profile\)/);
  assert.doesNotMatch(source, /A comprehensive behavioral analysis of your soul architecture/);
  assert.doesNotMatch(source, /Guidance based on your dominant elements/);
  assert.doesNotMatch(source, /Analysis of your life focus areas/);
});


test("natal report rejects non-canonical stored birth timestamps", () => {
  const profile = evidenceProfile();
  profile.birthDate = new Date("1990-09-17T11:11:00.000Z");

  assert.throws(
    () => buildNatalReportInput(profile),
    /non-canonical.*ambiguous/i,
  );
});

test("natal report preserves canonical stored civil birth date", () => {
  const report = buildNatalReportInput(evidenceProfile());
  assert.equal(report.birthDate, "1990-09-17");
});

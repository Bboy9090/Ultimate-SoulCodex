import { writeFile } from "node:fs/promises";
import {
  generateOfflineCodexProfile,
  type OfflineCodexProfile,
} from "../packages/core/offline-codex/index.ts";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  evaluateDepthInterpretationQuality,
} from "../packages/core/depth-interpretation/index.ts";

const NAMES = [
  "Ari Stone", "Maya Rivers", "Jon Bell", "Lena Cruz", "Theo Grant",
  "Nia Brooks", "Kai Morgan", "Iris Vale", "Noah Reed", "Zoe Lane",
];

const MONTH_DATES = [
  "1990-01-25", "1991-02-25", "1992-03-25", "1993-04-25",
  "1994-05-25", "1995-06-25", "1996-07-25", "1997-08-25",
  "1998-09-25", "1999-10-25", "2000-11-25", "2001-12-25",
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[a-z]+(?:\s+[a-z]+)*'s local codex/g, "person local codex")
    .replace(/\b(?:ari stone|maya rivers|jon bell|lena cruz|theo grant|nia brooks|kai morgan|iris vale|noah reed|zoe lane)\b/gi, "person")
    .replace(/[^a-z0-9\s/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceSignature(profile: OfflineCodexProfile): string {
  return [
    profile.astrologyData.sunSign,
    profile.numerologyData.lifePath,
    profile.numerologyData.expression,
    profile.numerologyData.soulUrge,
    profile.archetypeData.title,
  ].join("|");
}

function readingFingerprint(profile: OfflineCodexProfile): string {
  const layers = DEPTH_INTERPRETATION_LAYER_KEYS.map((key) => {
    const layer = profile.depthInterpretation[key];
    return [
      key,
      layer.claimKind,
      normalize(layer.summary),
      normalize(layer.explanation),
      [...layer.evidenceIds].sort().join(","),
    ].join("::");
  });
  return [
    profile.archetypeData.title,
    normalize(profile.archetypeData.description),
    normalize(profile.dailyGuidance),
    ...layers,
  ].join("||");
}

function tokenSet(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 2));
}

function jaccard(left: string, right: string): number {
  const a = tokenSet(left);
  const b = tokenSet(right);
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 1;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / union.size;
}

const profiles: OfflineCodexProfile[] = [];
for (let monthIndex = 0; monthIndex < MONTH_DATES.length; monthIndex += 1) {
  for (let nameIndex = 0; nameIndex < NAMES.length; nameIndex += 1) {
    profiles.push(generateOfflineCodexProfile(
      {
        name: NAMES[nameIndex],
        birthDate: MONTH_DATES[monthIndex],
        birthTime: "12:34",
        birthLocation: "Differentiation Corpus",
        timezone: "UTC",
        latitude: "0",
        longitude: "0",
      },
      {
        id: `diff-${monthIndex}-${nameIndex}`,
        generatedAt: "2026-09-20T00:15:00.000Z",
        currentYear: 2026,
      },
    ));
  }
}

const rows = profiles.map((profile) => {
  const quality = evaluateDepthInterpretationQuality(profile.depthInterpretation, {
    birthTimeStatus: "known",
  });
  return {
    id: profile.id,
    sunSign: profile.astrologyData.sunSign,
    lifePath: profile.numerologyData.lifePath,
    expression: profile.numerologyData.expression,
    soulUrge: profile.numerologyData.soulUrge,
    archetype: profile.archetypeData.title,
    sourceSignature: sourceSignature(profile),
    readingFingerprint: readingFingerprint(profile),
    qualityPass: quality.pass,
    qualityScore: quality.score,
    qualityErrors: quality.findings.filter((finding) => finding.severity === "error").map((finding) => finding.code),
  };
});

const fingerprintGroups = new Map<string, typeof rows>();
for (const row of rows) {
  const list = fingerprintGroups.get(row.readingFingerprint) ?? [];
  list.push(row);
  fingerprintGroups.set(row.readingFingerprint, list);
}
const sourceGroups = new Map<string, typeof rows>();
for (const row of rows) {
  const list = sourceGroups.get(row.sourceSignature) ?? [];
  list.push(row);
  sourceGroups.set(row.sourceSignature, list);
}

const crossSignatureDuplicates = Array.from(fingerprintGroups.values())
  .filter((group) => new Set(group.map((row) => row.sourceSignature)).size > 1)
  .map((group) => ({
    size: group.length,
    sourceSignatures: [...new Set(group.map((row) => row.sourceSignature))],
    ids: group.map((row) => row.id),
  }));

let pairCount = 0;
let similarityTotal = 0;
let maximumCrossSignatureSimilarity = 0;
let maximumPair: string[] = [];
for (let i = 0; i < profiles.length; i += 1) {
  for (let j = i + 1; j < profiles.length; j += 1) {
    if (rows[i].sourceSignature === rows[j].sourceSignature) continue;
    const similarity = jaccard(rows[i].readingFingerprint, rows[j].readingFingerprint);
    pairCount += 1;
    similarityTotal += similarity;
    if (similarity > maximumCrossSignatureSimilarity) {
      maximumCrossSignatureSimilarity = similarity;
      maximumPair = [rows[i].id, rows[j].id];
    }
  }
}

const summary = {
  profileCount: rows.length,
  uniqueSourceSignatures: sourceGroups.size,
  uniqueReadingFingerprints: fingerprintGroups.size,
  crossSignatureDuplicateGroups: crossSignatureDuplicates.length,
  largestFingerprintGroup: Math.max(...Array.from(fingerprintGroups.values()).map((group) => group.length)),
  qualityPassCount: rows.filter((row) => row.qualityPass).length,
  minimumQualityScore: Math.min(...rows.map((row) => row.qualityScore)),
  averageCrossSignatureTokenSimilarity: pairCount ? similarityTotal / pairCount : 0,
  maximumCrossSignatureTokenSimilarity,
  maximumSimilarityPair: maximumPair,
};

const receipt = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  policyStatus: "audit_only_no_differentiation_policy_approved",
  corpus: "12 Sun-sign dates × 10 names = 120 deterministic profiles",
  comparisonRule: "Names/IDs excluded from reading fingerprint; compare only supported local synthesis output",
  rows,
  crossSignatureDuplicates,
  summary,
};

const output = process.argv[2] ?? "profile-differentiation-audit.json";
await writeFile(output, JSON.stringify(receipt, null, 2) + "\n", "utf8");
console.log(JSON.stringify({output, ...summary}, null, 2));

if (rows.length !== 120) process.exitCode = 2;
if (rows.some((row) => row.qualityErrors.length > 0)) process.exitCode = 3;

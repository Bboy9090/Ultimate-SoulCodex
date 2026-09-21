import assert from "node:assert/strict";
import test from "node:test";
import { generateOfflineCodexProfile } from "../index.js";

const LOCATIONS = [
  { birthLocation: "Bronx, New York", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648" },
  { birthLocation: "Los Angeles, California", timezone: "America/Los_Angeles", latitude: "34.0522", longitude: "-118.2437" },
  { birthLocation: "London, United Kingdom", timezone: "Europe/London", latitude: "51.5074", longitude: "-0.1278" },
  { birthLocation: "Tokyo, Japan", timezone: "Asia/Tokyo", latitude: "35.6762", longitude: "139.6503" },
];

const GIVEN_NAMES = [
  "Avery Cole","Bianca Stone","Caleb Hart","Dalia Reed","Elias North",
  "Farah Lane","Gavin Frost","Hana Vale","Isaac Moon","Jade Rivers",
  "Kai Mercer","Lena Brooks","Miles Rowan","Nia Cross","Owen Blake",
  "Pia Solis","Quinn Adler","Rhea Moss","Silas Reed","Talia Wynn",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function semanticFingerprint(profile: ReturnType<typeof generateOfflineCodexProfile>): string {
  const raw = [
    profile.archetypeData.title,
    profile.archetypeData.description,
    profile.archetypeData.strengths.join(" "),
    profile.archetypeData.shadows.join(" "),
    profile.archetypeData.guidance,
    profile.biography,
    profile.dailyGuidance,
    profile.depthInterpretation.claritySummary.summary,
    profile.depthInterpretation.visiblePattern.summary,
    profile.depthInterpretation.innerExperience.summary,
    profile.depthInterpretation.coreContradiction.summary,
    profile.depthInterpretation.gift.summary,
    profile.depthInterpretation.shadow.summary,
    profile.depthInterpretation.relationshipImpact.summary,
    profile.depthInterpretation.decisionImpact.summary,
    profile.depthInterpretation.action.summary,
  ].join(" ");

  // Names/IDs cannot make two otherwise identical readings count as differentiated.
  return normalize(raw.replaceAll(profile.name, "person"));
}

function tokenSet(text: string): Set<string> {
  return new Set(
    semanticFingerprintText(text)
      .split(" ")
      .filter((token) => token.length > 3 && token !== "person"),
  );
}

function semanticFingerprintText(text: string): string {
  return normalize(text);
}

function jaccard(leftText: string, rightText: string): number {
  const left = tokenSet(leftText);
  const right = tokenSet(rightText);
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function calendarDate(index: number): string {
  const year = 1975 + (index % 45);
  const month = (index * 5 % 12) + 1;
  const day = (index * 11 % 27) + 1;
  return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

test("unverified time and location cannot differentiate local synthesis", () => {
  const base = {
    name: "Invariant Example",
    birthDate: "1990-09-17",
  };

  const variants = LOCATIONS.flatMap((location, locationIndex) =>
    [undefined, "00:17", "11:11", "23:41"].map((birthTime, timeIndex) =>
      generateOfflineCodexProfile(
        { ...base, birthTime, ...location },
        {
          id: `invariant-${locationIndex}-${timeIndex}`,
          generatedAt: "2026-09-20T19:50:00.000Z",
          currentYear: 2026,
        },
      ),
    ),
  );

  const fingerprints = new Set(variants.map(semanticFingerprint));
  assert.equal(
    fingerprints.size,
    1,
    "unverified time/location must not alter local narrative substance",
  );

  for (const profile of variants) {
    const evidenceIds = profile.depthInterpretation.evidence.map((evidence) => evidence.id);
    assert.ok(!evidenceIds.includes("offline.astrology.moon"));
    assert.ok(!evidenceIds.includes("offline.astrology.rising"));
  }
});

test("60 materially different deterministic profiles do not collapse onto a small reading set", () => {
  const profiles = Array.from({ length: 60 }, (_, index) =>
    generateOfflineCodexProfile(
      {
        name: `${GIVEN_NAMES[index % GIVEN_NAMES.length]} ${String(index + 17)}`,
        birthDate: calendarDate(index),
        birthTime: index % 3 === 0 ? undefined : ["03:17","11:11","20:43"][index % 3],
        ...LOCATIONS[index % LOCATIONS.length],
      },
      {
        id: `semantic-${index}`,
        generatedAt: "2026-09-20T19:50:00.000Z",
        currentYear: 2026,
      },
    ),
  );

  const fingerprints = profiles.map(semanticFingerprint);
  const unique = new Set(fingerprints);
  assert.ok(unique.size >= 54, `expected at least 54 substantive readings, got ${unique.size}`);

  let worst = { score: 0, left: -1, right: -1 };
  for (let left = 0; left < fingerprints.length; left += 1) {
    for (let right = left + 1; right < fingerprints.length; right += 1) {
      const score = jaccard(fingerprints[left], fingerprints[right]);
      if (score > worst.score) worst = { score, left, right };
    }
  }

  assert.ok(
    worst.score <= 0.94,
    `profiles ${worst.left} and ${worst.right} are ${(worst.score * 100).toFixed(1)}% token-similar`,
  );
});

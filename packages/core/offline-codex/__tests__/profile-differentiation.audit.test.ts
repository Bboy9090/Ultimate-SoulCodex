import assert from "node:assert";
import { test } from "node:test";
import { generateOfflineCodexProfile } from "../../index.js";

const names = [
  "Avery Cole", "Bianca Stone", "Caleb Hart", "Dalia Reed", "Elias North",
  "Farah Lane", "Gavin Frost", "Hana Vale", "Isaac Moon", "Jade Rivers",
  "Kai Mercer", "Lena Brooks", "Miles Rowan", "Nia Cross", "Owen Blake",
];

const locations = [
  { birthLocation: "Bronx, New York", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648" },
  { birthLocation: "Los Angeles, California", timezone: "America/Los_Angeles", latitude: "34.0522", longitude: "-118.2437" },
  { birthLocation: "Chicago, Illinois", timezone: "America/Chicago", latitude: "41.8781", longitude: "-87.6298" },
  { birthLocation: "London, United Kingdom", timezone: "Europe/London", latitude: "51.5074", longitude: "-0.1278" },
  { birthLocation: "Tokyo, Japan", timezone: "Asia/Tokyo", latitude: "35.6762", longitude: "139.6503" },
];

const dates = [
  "1986-01-14", "1987-02-22", "1988-03-30", "1989-04-18", "1990-05-27",
  "1991-06-09", "1992-07-24", "1993-08-11", "1994-09-29", "1995-10-16",
  "1996-11-07", "1997-12-25", "1998-01-31", "1999-02-12", "2000-03-05",
];

const times = ["00:17", "03:41", "06:28", "09:53", "12:11", "15:36", "18:22", "21:47"];
const genericTerms = ["discernment", "over-expression", "overexpression", "balance", "boundaries", "sensitivity"];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(text: string): Set<string> {
  return new Set(normalize(text).split(" ").filter((token) => token.length > 3));
}

function jaccard(a: string, b: string): number {
  const left = tokens(a);
  const right = tokens(b);
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function fingerprint(profile: ReturnType<typeof generateOfflineCodexProfile>): string {
  return [
    profile.archetypeData.title,
    profile.archetypeData.description,
    profile.archetypeData.strengths.join(" "),
    profile.archetypeData.shadows.join(" "),
    profile.archetypeData.guidance,
    profile.biography,
    profile.dailyGuidance,
    profile.depthInterpretation.claritySummary.summary,
    profile.depthInterpretation.coreContradiction.summary,
    profile.depthInterpretation.action.summary,
  ].join(" ");
}

test("Federation profile differentiation audit", async (suite) => {
  const profiles = Array.from({ length: 60 }, (_, index) => {
    const location = locations[index % locations.length];
    return generateOfflineCodexProfile(
      {
        name: names[index % names.length],
        birthDate: dates[index % dates.length],
        birthTime: index % 7 === 0 ? undefined : times[index % times.length],
        ...location,
      },
      {
        id: `federation-audit-${index}`,
        generatedAt: "2026-09-08T04:40:00.000Z",
        currentYear: 2026,
      },
    );
  });

  await suite.test("generates at least 60 deterministic fixtures", () => {
    assert.equal(profiles.length, 60);
    for (let index = 0; index < profiles.length; index += 1) {
      const first = profiles[index];
      const location = locations[index % locations.length];
      const second = generateOfflineCodexProfile(
        {
          name: names[index % names.length],
          birthDate: dates[index % dates.length],
          birthTime: index % 7 === 0 ? undefined : times[index % times.length],
          ...location,
        },
        {
          id: `federation-audit-${index}`,
          generatedAt: "2026-09-08T04:40:00.000Z",
          currentYear: 2026,
        },
      );
      assert.deepStrictEqual(first, second);
    }
  });

  await suite.test("does not collapse materially different fixtures onto one identical reading", () => {
    const unique = new Set(profiles.map((profile) => normalize(fingerprint(profile))));
    assert.ok(unique.size >= 45, `expected at least 45 unique readings, got ${unique.size}`);
  });

  await suite.test("generic umbrella language does not dominate the population", () => {
    const texts = profiles.map((profile) => normalize(fingerprint(profile)));
    for (const term of genericTerms) {
      const hits = texts.filter((text) => text.includes(term)).length;
      const ratio = hits / texts.length;
      assert.ok(ratio <= 0.45, `${term} appears in ${(ratio * 100).toFixed(1)}% of profiles`);
    }
  });

  await suite.test("different fixtures do not become near-duplicates", () => {
    let worst = { score: 0, left: -1, right: -1 };
    for (let left = 0; left < profiles.length; left += 1) {
      for (let right = left + 1; right < profiles.length; right += 1) {
        const score = jaccard(fingerprint(profiles[left]), fingerprint(profiles[right]));
        if (score > worst.score) worst = { score, left, right };
      }
    }
    assert.ok(
      worst.score <= 0.78,
      `profiles ${worst.left} and ${worst.right} are ${(worst.score * 100).toFixed(1)}% token-similar`,
    );
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import { calculateProfileHumanDesign, ProfileHumanDesignError, verifiedProfileHumanDesignSummary } from "../server/services/profile-human-design";
import { synthesizeArchetype } from "../server/services/archetype";
import { generateBiography, generateDailyGuidance } from "../server/services/openai-service";
import { isGeminiAvailable } from "../gemini";
import { readFileSync } from "node:fs";

const input = { birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648" };

test("server profile complete inputs produce actual trusted HD and symbolic archetype context", () => {
  const design = calculateProfileHumanDesign(input);
  assert.equal(design.status, "verified");
  assert.equal(design.type, "Reflector");
  assert.equal(design.profile, "2/5");
  assert.equal(design.inputTimestampUtc, "1990-09-17T15:11:00.000Z");
  assert.ok(Array.isArray(design.activatedGates) && design.activatedGates.length > 0);
  assert.match(verifiedProfileHumanDesignSummary(design)!, /Lunar Authority/);
  const archetype = synthesizeArchetype({}, { lifePath: 9 }, {}, design);
  assert.match(archetype.description, /Reflector/);
  assert.ok(archetype.themes.some((theme) => theme.includes("2/5")));
  assert.equal(synthesizeArchetype({}, {}, {}, design).title, "Human Design Reflector");
  assert.equal(verifiedProfileHumanDesignSummary({ ...design, verificationReceiptId: "forged" }), null);
  assert.equal(verifiedProfileHumanDesignSummary({ status: "verified", type: "Reflector" }), null);
});

test("missing inputs remain unresolved while invalid exact inputs reject before persistence", () => {
  assert.equal(calculateProfileHumanDesign({ ...input, birthTime: "" }).status, "unresolved");
  assert.equal(calculateProfileHumanDesign({ ...input, latitude: undefined }).status, "unresolved");
  assert.equal(calculateProfileHumanDesign({ ...input, latitude: "" }).status, "unresolved");
  assert.throws(() => calculateProfileHumanDesign({ ...input, birthTime: "25:00" }), ProfileHumanDesignError);
  assert.throws(() => calculateProfileHumanDesign({ ...input, latitude: "100" }), ProfileHumanDesignError);
});

test("server HD trust receipt and calculation use the same summer EST instant", () => {
  const est = calculateProfileHumanDesign({ ...input, birthDate: "1990-06-17", timezone: "EST" });
  const utc = calculateProfileHumanDesign({ ...input, birthDate: "1990-06-17", birthTime: "16:11", timezone: "Etc/UTC" });
  assert.equal(est.inputTimestampUtc, "1990-06-17T16:11:00.000Z");
  assert.deepEqual(est.activations, utc.activations);
});

test("deterministic server narration includes trusted HD and excludes forged evidence", { skip: isGeminiAvailable() }, async () => {
  const humanDesignData = calculateProfileHumanDesign(input);
  const request = {
    name: "Actual engine profile", archetypeTitle: "Test reflection", astrologyData: {},
    numerologyData: { lifePath: 9 }, personalityData: {}, archetype: {}, humanDesignData,
  };
  assert.match(await generateBiography(request), /Reflector.*Lunar Authority.*2\/5/);
  assert.match(await generateDailyGuidance(request), /Reflector.*Lunar Authority.*2\/5/);
  const forged = { ...request, humanDesignData: { ...humanDesignData, verificationReceiptId: "forged" } };
  assert.doesNotMatch(await generateBiography(forged), /Reflector/);
  assert.doesNotMatch(await generateDailyGuidance(forged), /Reflector/);
});

test("canonical creation and both assessment routes wire HD storage and narration", () => {
  const source = readFileSync("server/routes.ts", "utf8");
  const creation = source.slice(source.indexOf('app.post("/api/profiles",'), source.indexOf('app.get("/api/profiles/:id",'));
  assert.match(creation, /calculateProfileHumanDesign\(birthData\)/);
  assert.match(creation, /synthesizeArchetype\(astrologyData, numerologyData, \{\}, humanDesignData\)/);
  assert.match(creation, /storage.createProfile\(\{[\s\S]*humanDesignData/);
  assert.equal((creation.match(/humanDesignData,/g) ?? []).length, 3);
  for (const assessment of ["enneagram", "mbti"]) {
    const start = source.indexOf(`app.post("/api/profiles/:id/${assessment}"`);
    const section = source.slice(start, source.indexOf("\n  app.", start + 1));
    assert.match(section, /updatedPersonalityData, profile.humanDesignData/);
    assert.equal((section.match(/humanDesignData: profile.humanDesignData/g) ?? []).length, 2);
  }
});

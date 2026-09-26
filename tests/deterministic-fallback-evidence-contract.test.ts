import assert from "node:assert/strict";
import test from "node:test";
import { deterministicFallback } from "../services/deterministic-fallback";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

test("deterministic AI fallback evidence boundary", async (suite) => {
  await suite.test("unverified astrology aliases never become natal facts", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "daily_horoscope",
      profile: {
        astrologyData: {
          sunSign: "Virgo",
          moonSign: "Pisces",
          sun: {
            sign: "Virgo",
            verificationStatus: "pending_independent_verification",
          },
          moon: {
            sign: "Pisces",
            verificationStatus: "calculated",
          },
        },
      },
    } as any);

    assert.doesNotMatch(result.content, /verified natal Sun is Virgo/i);
    assert.doesNotMatch(result.content, /verified natal Moon is Pisces/i);
    assert.doesNotMatch(result.content, /Virgo Sun is in high-friction today/i);
    assert.match(result.content, /will not invent a planetary condition for today/i);
  });

  await suite.test("verified natal placements remain available without becoming daily transit claims", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "daily_horoscope",
      profile: {
        astrologyData: {
          sun: { sign: "Virgo", verificationStatus: "verified", evidence },
          moon: { sign: "Cancer", verificationStatus: "verified", evidence },
        },
      },
    } as any);

    assert.match(result.content, /verified natal Sun is Virgo/i);
    assert.match(result.content, /verified natal Moon is Cancer/i);
    assert.match(result.content, /static birth-chart fact/i);
    assert.doesNotMatch(result.content, /high-friction today|Moon needs a boundary/i);
  });

  await suite.test("unverified Human Design cannot drive fallback mechanics", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "soul_guide",
      profile: {
        humanDesignData: {
          status: "calculated_unverified",
          type: "Manifestor",
          strategy: "Inform",
          authority: "Ego Authority",
        },
      },
      timeline: { currentPhase: "Construction" },
      dailyCard: { focus: "Finish one bounded task" },
    } as any);

    assert.doesNotMatch(result.content, /Manifestor|Ego Authority|Verified Human Design core:/i);
    assert.match(result.content, /No verified Human Design core is available/i);
    assert.doesNotMatch(result.content, /trauma response/i);
  });

  await suite.test("verified Human Design core can enter the fallback with symbolic caveat", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "codex_reading",
      profile: {
        humanDesignData: {
          status: "verified",
          type: "Reflector",
          strategy: "Wait a lunar cycle",
          authority: "Lunar Authority",
        },
      },
    } as any);

    assert.match(result.content, /Verified Human Design core: Reflector/i);
    assert.match(result.content, /symbolic experiment/i);
  });

  await suite.test("biography fallback with missing evidence explicitly withholds invented identity claims", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "biography",
      profile: {
        astrologyData: { sunSign: "Scorpio", moonSign: "Pisces" },
        humanDesignData: { type: "Projector" },
      },
    } as any);

    const parsed = JSON.parse(result.content);
    assert.match(parsed.my_pattern, /not enough verified behavioral evidence/i);
    assert.match(parsed.how_i_move, /No verified Human Design movement strategy/i);
    assert.doesNotMatch(result.content, /Scorpio|Pisces|Projector/);
  });
});

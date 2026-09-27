import assert from "node:assert/strict";
import test from "node:test";
import { deterministicFallback } from "../services/deterministic-fallback";

test("deterministic AI fallback remains stricter than symbolic identity surfaces", async (suite) => {
  await suite.test("daily horoscope fallback never invents natal or transit facts", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "daily_horoscope",
      profile: {
        astrologyData: {
          sunSign: "Virgo",
          moonSign: "Pisces",
          sun: { sign: "Virgo", verificationStatus: "verified" },
        },
      },
    } as any);

    assert.doesNotMatch(result.content, /Virgo|Pisces|verified natal/i);
    assert.match(result.content, /not being converted into a prediction/i);
    assert.match(result.content, /optional reflection prompt/i);
  });

  await suite.test("Human Design does not drive outage fallback even when caller labels it verified", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "soul_guide",
      profile: {
        humanDesignData: {
          status: "verified",
          type: "Reflector",
          strategy: "Wait a lunar cycle",
          authority: "Lunar Authority",
          profile: "2/5",
        },
      },
      timeline: { currentPhase: "Construction" },
      dailyCard: { focus: "Finish one bounded task" },
    } as any);

    assert.doesNotMatch(result.content, /Reflector|Lunar Authority|Human Design/i);
    assert.match(result.content, /No hidden behavioral pattern is inferred/i);
    assert.match(result.content, /Finish one bounded task/i);
  });

  await suite.test("codex fallback with supported profile data still withholds substitute identity claims", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "codex_reading",
      profile: {
        astrologyData: {
          sun: {
            sign: "Virgo",
            verificationStatus: "verified",
            evidence: {
              source: "independent",
              engine: "reference@1",
              calculatedAt: "2026-09-26T18:00:00.000Z",
            },
          },
        },
      },
    } as any);

    assert.doesNotMatch(result.content, /Virgo/i);
    assert.match(result.content, /No substitute identity, strength, shadow, motive, destiny, or purpose/i);
  });

  await suite.test("biography fallback returns explicit unavailable state instead of generated biography", () => {
    const result = deterministicFallback({
      prompt: "",
      promptType: "biography",
      profile: {
        astrologyData: { sunSign: "Scorpio" },
        humanDesignData: { type: "Projector" },
      },
    } as any);

    const parsed = JSON.parse(result.content);
    assert.equal(parsed.status, "unavailable");
    assert.match(parsed.reason, /no behavioral biography is inferred/i);
    assert.doesNotMatch(result.content, /Scorpio|Projector/);
  });
});

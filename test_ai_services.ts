import { routeAIRequest } from "./services/ai-router";
import { narratorPrompt } from "./soulcodex/codex30/prompts/narrator";
import { rewritePrompt } from "./soulcodex/codex30/prompts/rewrite";
import { deterministicFallback } from "./services/deterministic-fallback";

async function testAIServices() {
  console.log("🚀 STARTING AI SERVICE AUDIT...");

  // 1. Mock a profile for testing
  const mockProfile = {
    id: "test-profile-123",
    name: "Bobby Workshop",
    birthDate: "1990-01-01",
    astrologyData: { sunSign: "Capricorn", moonSign: "Pisces", risingSign: "Scorpio" },
    numerologyData: { lifePath: 5 },
    humanDesignData: { type: "Manifesting Generator", strategy: "To Respond", authority: "Sacral" },
    archetypeData: {
      archetype: "The Architect",
      themes: ["Precision", "Scale", "Legacy"],
      strengths: ["Strategic Thinking", "Execution"],
      shadows: ["Rigidity", "Isolation"]
    }
  };

  console.log("\n--- SERVICE 1: NARRATOR (SOUL PROFILE GEN) ---");
  const prompt1 = narratorPrompt({
    codename: "The Architect",
    archetype: "The Architect",
    themes: [{ tag: "Precision", score: 9 }, { tag: "Scale", score: 8 }],
    strengths: ["Strategic Thinking", "Execution"],
    shadows: ["Rigidity", "Isolation"],
    triggers: ["Incompetence"],
    prescriptions: ["Simplify"],
    anchors: ["Focus"]
  });
  
  try {
    const res1 = await routeAIRequest({
      prompt: prompt1,
      promptType: "codex_reading",
      profile: mockProfile
    });
    console.log(`STATUS: ${res1.status} | PROVIDER: ${res1.provider}`);
    console.log("CONTENT PREVIEW:", res1.content?.substring(0, 200) + "...");
  } catch (e) {
    console.error("Narrator failed:", e);
  }

  console.log("\n--- SERVICE 2: REWRITE (POLISH LAYER) ---");
  const res2 = await routeAIRequest({
    prompt: rewritePrompt("I am a builder of things. I like precision.", ["Architect", "Scale"]),
    promptType: "biography",
    profile: mockProfile
  });
  console.log(`STATUS: ${res2.status} | PROVIDER: ${res2.provider}`);
  console.log("CONTENT PREVIEW:", res2.content?.substring(0, 200) + "...");

  console.log("\n--- SERVICE 3: DAILY GUIDANCE (REAL-TIME) ---");
  const res3 = await routeAIRequest({
    prompt: "Give me guidance for today.",
    promptType: "daily_guidance",
    profile: mockProfile
  });
  console.log(`STATUS: ${res3.status} | PROVIDER: ${res3.provider}`);
  console.log("CONTENT PREVIEW:", res3.content?.substring(0, 200) + "...");

  console.log("\n--- FAILSAFE TEST (AI UNREACHABLE) ---");
  const fallbackRes = deterministicFallback({
    prompt: "Any prompt",
    promptType: "codex_reading",
    profile: mockProfile
  });
  console.log("DETERMINISTIC FALLBACK (Codex Reading):");
  console.log(fallbackRes.content);

  console.log("\n✅ AUDIT COMPLETE.");
}

testAIServices().catch(console.error);

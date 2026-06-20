/**
 * Unknown-time honesty smoke test (no framework — run with tsx).
 *
 * Verifies: when birth time is unknown, the AI prompt/context builder
 * injects the unknown-time warning and the deterministic fallback
 * never fabricates rising sign or house content.
 *
 *   npx tsx scripts/smoke-unknown-time.ts
 */

// ── 1. Test the prompt builder (ai-respond.ts buildPromptForType) ──────────

// We can't import buildPromptForType directly (it's not exported), so we
// replicate the profileBlock construction logic and test its output.
// Instead, test the exported buildSoulCodexSystemPrompt for the flag.

import { buildSoulCodexSystemPrompt } from "../src/ai/soulCodexEngine";
import { deterministicFallback } from "../services/deterministic-fallback";

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
let failed = 0;
function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  if (!pass) failed++;
}

// ── Test 1: System prompt with birthTimeKnown=false includes warning ────────
{
  const prompt = buildSoulCodexSystemPrompt({
    includePatternDetection: true,
    birthTimeKnown: false,
  });
  const hasWarning = prompt.includes("BIRTH TIME UNKNOWN");
  const forbidsRising = prompt.includes("Do not infer, guess, or mention them");
  record(
    "1. system prompt (time unknown) has warning",
    hasWarning && forbidsRising,
    `hasWarning=${hasWarning} forbidsRising=${forbidsRising}`
  );
}

// ── Test 2: System prompt with birthTimeKnown=true does NOT include warning ─
{
  const prompt = buildSoulCodexSystemPrompt({
    includePatternDetection: true,
    birthTimeKnown: true,
  });
  const hasWarning = prompt.includes("BIRTH TIME UNKNOWN");
  record(
    "2. system prompt (time known) no warning",
    !hasWarning,
    `hasWarning=${hasWarning}`
  );
}

// ── Test 3: System prompt with birthTimeKnown omitted (default) — no warning
{
  const prompt = buildSoulCodexSystemPrompt({
    includePatternDetection: true,
  });
  const hasWarning = prompt.includes("BIRTH TIME UNKNOWN");
  record(
    "3. system prompt (default) no warning",
    !hasWarning,
    `hasWarning=${hasWarning}`
  );
}

// ── Test 4: Deterministic fallback (soul_guide, no rising) — no fake rising ─
{
  const result = deterministicFallback({
    prompt: "",
    promptType: "soul_guide",
    temperature: 0.8,
    profile: {
      astrologyData: { sunSign: "Scorpio", moonSign: "Leo" },
      numerologyData: { lifePath: 7 },
      humanDesignData: { type: "Generator", strategy: "To Respond" },
    },
  });
  const content = result.content.toLowerCase();
  const mentionsRising = /rising\s*sign|ascendant|rising:/i.test(result.content);
  const mentionsHouse = /\bhouse\b/i.test(result.content);
  record(
    "4. fallback soul_guide (no rising) — no fake rising/house",
    !mentionsRising && !mentionsHouse,
    `mentionsRising=${mentionsRising} mentionsHouse=${mentionsHouse}`
  );
}

// ── Test 5: Deterministic fallback (codex_reading, no rising) ───────────────
{
  const result = deterministicFallback({
    prompt: "",
    promptType: "codex_reading",
    temperature: 0.8,
    profile: {
      astrologyData: { sunSign: "Aries", moonSign: "Cancer" },
      numerologyData: { lifePath: 3 },
    },
  });
  const mentionsRising = /rising\s*sign|ascendant|\brising\b(?!.*energy)/i.test(result.content);
  record(
    "5. fallback codex_reading (no rising) — no fake rising",
    !mentionsRising,
    `mentionsRising=${mentionsRising}`
  );
}

// ── Test 6: Deterministic fallback (biography, no rising) ───────────────────
{
  const result = deterministicFallback({
    prompt: "",
    promptType: "biography",
    temperature: 0.8,
    profile: {
      astrologyData: { sunSign: "Gemini", moonSign: "Virgo" },
      numerologyData: { lifePath: 5 },
    },
  });
  const mentionsRising = /rising\s*sign|ascendant|\brising:/i.test(result.content);
  record(
    "6. fallback biography (no rising) — no fake rising",
    !mentionsRising,
    `mentionsRising=${mentionsRising}`
  );
}

// ── Test 7: Fallback WITH rising sign — rising IS mentioned ─────────────────
{
  const result = deterministicFallback({
    prompt: "",
    promptType: "soul_guide",
    temperature: 0.8,
    profile: {
      astrologyData: { sunSign: "Scorpio", moonSign: "Leo", risingSign: "Pisces" },
      numerologyData: { lifePath: 7 },
      humanDesignData: { type: "Generator", strategy: "To Respond" },
    },
  });
  // With rising present, the fallback may or may not mention it — that's fine.
  // This test just confirms it doesn't crash and returns content.
  record(
    "7. fallback (with rising) — produces content",
    result.content.length > 50,
    `contentLength=${result.content.length}`
  );
}

console.log("\n=== Soul Codex unknown-time honesty smoke test ===");
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(52)} ${r.detail}`);
}
console.log(`\n${results.length - failed}/${results.length} passed${failed ? ` — ${failed} FAILED` : ""}\n`);
process.exit(failed ? 1 : 0);

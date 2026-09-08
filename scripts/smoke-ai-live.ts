/**
 * Live AI provider smoke test (run with tsx).
 *
 * Requires GEMINI_API_KEY and/or GROQ_API_KEY in environment.
 * Requires a running server:
 *   SESSION_SECRET=dev DEMO_MODE=true PORT=5064 \
 *     GEMINI_API_KEY=... GROQ_API_KEY=... npx tsx server/index.ts &
 *   SMOKE_BASE=http://localhost:5064 npx tsx scripts/smoke-ai-live.ts
 */

const BASE = process.env.SMOKE_BASE || "http://localhost:5064";

let cookie = "";
async function call(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(BASE + path, { ...init, headers });
  const setCookies = (res.headers as any).getSetCookie?.() || [];
  for (const c of setCookies) {
    const m = /^(connect\.sid=[^;]+)/.exec(c);
    if (m) cookie = m[1];
  }
  return res;
}

async function readSSE(res: Response): Promise<string> {
  const text = await res.text();
  let content = "";
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (payload === "[DONE]") break;
    try {
      const d = JSON.parse(payload);
      content += d.content || "";
    } catch {}
  }
  return content;
}

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
let failed = 0;
function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  if (!pass) failed++;
}

async function main() {
  // Establish session with a profile
  await call("/api/soul-archetype", {
    method: "POST",
    body: JSON.stringify({
      birth_data: {
        name: "Alice",
        birthDate: "1990-11-08",
        birthTime: "14:30",
        birthLocation: "New York, NY, USA",
      },
      nonNegotiables: ["honesty"],
      goals: ["clarity"],
    }),
  });

  // ── Test 1: Soul Guide with known time — live AI response ────────────────
  {
    const res = await call("/api/chat/soul-guide", {
      method: "POST",
      body: JSON.stringify({
        message: "What is my biggest blind spot right now?",
        history: [],
        profileContext: {
          name: "Alice",
          archetype: "The Alchemist",
          sunSign: "Scorpio",
          moonSign: "Leo",
          risingSign: "Pisces",
          hdType: "Generator",
          lifePath: 7,
          element: "Water",
        },
      }),
    });

    const content = await readSSE(res);
    const isLive = content.length > 50;
    record(
      "1. soul_guide (known time) — live AI",
      isLive,
      `length=${content.length} status=${res.status}`
    );

    if (isLive) {
      console.log("\n--- Test 1 content preview (first 300 chars) ---");
      console.log(content.slice(0, 300));
      console.log("---\n");
    }
  }

  // ── Test 2: Soul Guide with unknown time — live AI, no rising fabrication ─
  {
    const res = await call("/api/chat/soul-guide", {
      method: "POST",
      body: JSON.stringify({
        message: "What pattern am I stuck in?",
        history: [],
        profileContext: {
          name: "Bob",
          archetype: "The Visionary",
          sunSign: "Aries",
          moonSign: "Cancer",
          hdType: "Projector",
          lifePath: 3,
        },
      }),
    });

    const content = await readSSE(res);
    const isLive = content.length > 50;
    record(
      "2. soul_guide (unknown time) — live AI",
      isLive,
      `length=${content.length} status=${res.status}`
    );

    const mentionsRising = /rising\s*sign|ascendant|\brising:/i.test(content);
    const mentionsHouse = /\bhouse\b|\bhouses\b/i.test(content);
    record(
      "3. unknown-time honesty — no rising/house",
      !mentionsRising && !mentionsHouse,
      `rising=${mentionsRising} house=${mentionsHouse}`
    );

    if (isLive) {
      console.log("--- Test 2 content preview (first 300 chars) ---");
      console.log(content.slice(0, 300));
      console.log("---\n");
    }
  }

  // ── Test 3: Check the limit_reached gate (free user should hit limit) ────
  {
    const res = await call("/api/chat/soul-guide", {
      method: "POST",
      body: JSON.stringify({
        message: "One more question",
        history: [],
        profileContext: { sunSign: "Leo" },
      }),
    });

    // Should be 403 after 2 free questions
    record(
      "4. free user rate limit — 403 after 2",
      res.status === 403,
      `status=${res.status}`
    );
  }

  console.log("\n=== Soul Codex live AI smoke test ===");
  for (const r of results) {
    console.log(
      `${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(48)} ${r.detail}`
    );
  }
  console.log(
    `\n${results.length - failed}/${results.length} passed${failed ? ` — ${failed} FAILED` : ""}\n`
  );
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("smoke-ai-live crashed:", e);
  process.exit(1);
});

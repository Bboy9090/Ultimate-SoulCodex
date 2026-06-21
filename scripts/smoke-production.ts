/**
 * Production hardening smoke test.
 *
 * Verifies security headers, rate limiting, session config, CORS,
 * health endpoint, and startup validation.
 *
 * Requires a running server:
 *   SESSION_SECRET=dev DEMO_MODE=true npx tsx server/index.ts
 *   SMOKE_BASE=http://localhost:5055 npx tsx scripts/smoke-production.ts
 */

const BASE = process.env.SMOKE_BASE || "http://localhost:5055";

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
let failed = 0;

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  if (!pass) failed++;
}

async function main() {
  // ── Test 1: Health endpoint ───────────────────────────────────────────────
  {
    const res = await fetch(`${BASE}/health`);
    const body = await res.json();
    record(
      "1. health endpoint returns 200",
      res.status === 200 && body.status === "ok",
      `status=${res.status} body=${JSON.stringify(body)}`
    );
  }

  // ── Test 2: Helmet security headers ───────────────────────────────────────
  {
    const res = await fetch(`${BASE}/health`);
    const headers = Object.fromEntries(res.headers.entries());

    const hasXCTO = headers["x-content-type-options"] === "nosniff";
    const hasXFrame = !!headers["x-frame-options"];
    const hasReferrer = !!headers["referrer-policy"];
    const hasXDNS = headers["x-dns-prefetch-control"] === "off";
    const hasXPoweredBy = !headers["x-powered-by"];

    record(
      "2. helmet security headers present",
      hasXCTO && hasXFrame && hasReferrer && hasXDNS && hasXPoweredBy,
      `x-content-type-options=${headers["x-content-type-options"]} ` +
      `x-frame-options=${headers["x-frame-options"]} ` +
      `referrer-policy=${headers["referrer-policy"]} ` +
      `x-dns-prefetch-control=${headers["x-dns-prefetch-control"]} ` +
      `x-powered-by=${headers["x-powered-by"] || "(hidden)"}`
    );
  }

  // ── Test 3: JSON body size limit ──────────────────────────────────────────
  {
    const bigBody = JSON.stringify({ data: "x".repeat(2 * 1024 * 1024) });
    try {
      const res = await fetch(`${BASE}/api/soul-archetype`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bigBody,
      });
      record(
        "3. oversized JSON body rejected",
        res.status === 413,
        `status=${res.status}`
      );
    } catch (e: any) {
      record(
        "3. oversized JSON body rejected",
        true,
        `connection rejected (expected for oversized payload)`
      );
    }
  }

  // ── Test 4: API returns JSON errors (no stack traces) ─────────────────────
  {
    const res = await fetch(`${BASE}/api/soul-archetype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await res.text();
    const hasStack = body.includes("at ") && body.includes(".ts:");
    record(
      "4. error responses have no stack traces",
      !hasStack && res.status >= 400,
      `status=${res.status} hasStack=${hasStack} bodyLen=${body.length}`
    );
  }

  // ── Test 5: CORS headers present on API ───────────────────────────────────
  {
    const res = await fetch(`${BASE}/api/soul-archetype`, {
      method: "OPTIONS",
      headers: {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
      },
    });
    const acao = res.headers.get("access-control-allow-origin");
    const acac = res.headers.get("access-control-allow-credentials");
    record(
      "5. CORS headers on preflight",
      !!acao && acac === "true",
      `allow-origin=${acao} allow-credentials=${acac}`
    );
  }

  // ── Test 6: Session cookie has httpOnly + sameSite ────────────────────────
  // Use chat endpoint which writes to session (saveUninitialized=false means
  // no cookie until session data is modified)
  {
    const res = await fetch(`${BASE}/api/chat/soul-guide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "hello",
        history: [],
        profileContext: { sunSign: "Leo" },
      }),
    });
    await res.text();
    const setCookieHeaders: string[] = (res.headers as any).getSetCookie?.() || [];
    const sessionCookie = setCookieHeaders.find((c: string) => c.startsWith("connect.sid="));
    const hasHttpOnly = sessionCookie?.toLowerCase().includes("httponly") ?? false;
    const hasSameSite = sessionCookie?.toLowerCase().includes("samesite") ?? false;
    const hasExpiry = (sessionCookie?.toLowerCase().includes("max-age") || sessionCookie?.toLowerCase().includes("expires")) ?? false;
    record(
      "6. session cookie hardened",
      hasHttpOnly && hasSameSite && hasExpiry,
      `httpOnly=${hasHttpOnly} sameSite=${hasSameSite} expiry=${hasExpiry} cookie=${sessionCookie?.slice(0, 120) || "(none)"}...`
    );
  }

  // ── Test 7: Rate limiter headers present ──────────────────────────────────
  {
    const res = await fetch(`${BASE}/api/soul-archetype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const rlLimit = res.headers.get("ratelimit-limit");
    const rlRemaining = res.headers.get("ratelimit-remaining");
    record(
      "7. rate limit headers present on API",
      !!rlLimit && !!rlRemaining,
      `ratelimit-limit=${rlLimit} ratelimit-remaining=${rlRemaining}`
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  console.log("\n=== Soul Codex production hardening smoke test ===");
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
  console.error("smoke-production crashed:", e);
  process.exit(1);
});

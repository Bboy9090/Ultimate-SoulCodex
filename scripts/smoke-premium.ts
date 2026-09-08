/**
 * Premium entitlement + PDF gating smoke test (no framework — run with tsx).
 *
 *   # start a server first, e.g.:
 *   SESSION_SECRET=dev DEMO_MODE=true PORT=5063 npx tsx server/index.ts &
 *   SMOKE_BASE=http://localhost:5063 npx tsx scripts/smoke-premium.ts
 *
 * Proves: anonymous/free users get 403 on premium PDFs; an entitled session
 * (access code redeemed) gets real application/pdf bytes (starting with %PDF) for
 * natal-report, profile, and compatibility; /api/natal-report is no longer free.
 * Exits 1 on any failure.
 */
const BASE = process.env.SMOKE_BASE || "http://localhost:5063";
const CODE = process.env.SMOKE_CODE || "guest123t"; // seeded access code (maxUses 50)

// Minimal cookie jar (captures connect.sid across requests).
let cookie = "";
async function call(path: string, init: RequestInit & { raw?: boolean } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as any) };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(BASE + path, { ...init, headers });
  const setCookies = (res.headers as any).getSetCookie?.() || [];
  for (const c of setCookies) { const m = /^(connect\.sid=[^;]+)/.exec(c); if (m) cookie = m[1]; }
  return res;
}
async function freshCall(path: string, init: RequestInit = {}) {
  // No cookie jar — a brand-new anonymous request.
  return fetch(BASE + path, { ...init, headers: { "Content-Type": "application/json", ...(init.headers as any) } });
}

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
let failed = 0;
function record(name: string, pass: boolean, detail: string) { results.push({ name, pass, detail }); if (!pass) failed++; }
async function isPdf(res: Response): Promise<boolean> {
  const ct = res.headers.get("content-type") || "";
  if (!/application\/pdf/i.test(ct)) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.slice(0, 4).toString("latin1") === "%PDF";
}
const profileBody = (name: string, withTime: boolean) => JSON.stringify({
  birth_data: { name, birthDate: "1990-11-08", ...(withTime ? { birthTime: "14:30" } : {}), birthLocation: "New York, NY, USA" },
  nonNegotiables: ["honesty"], goals: ["build"],
});

async function main() {
  // 1. Anonymous (no session) → premium PDF must be 403.
  try {
    const r = await freshCall("/api/natal-report", { method: "POST", body: JSON.stringify({ profile: { name: "Anon", birthDate: "1990-11-08" } }) });
    record("1. anon natal-report → 403", r.status === 403, `status=${r.status}`);
  } catch (e) { record("1. anon natal-report → 403", false, `THREW ${(e as Error).message}`); }

  // Establish a session + two stored profiles.
  const p1 = await call("/api/soul-archetype", { method: "POST", body: profileBody("Alice", true) }).then(r => r.json()).catch(() => ({}));
  const p2 = await call("/api/soul-archetype", { method: "POST", body: profileBody("Bob", false) }).then(r => r.json()).catch(() => ({}));
  const id1 = p1.profileId, id2 = p2.profileId;
  await call("/api/compatibility", { method: "POST", body: JSON.stringify({ profile1Id: id1, profile2Id: id2 }) });

  // 2. Same session but NOT yet premium → 403.
  {
    const r = await call("/api/pdf/profile", { method: "POST", body: JSON.stringify({ profileId: id1 }) });
    record("2. non-premium session pdf/profile → 403", r.status === 403, `status=${r.status}`);
  }

  // Redeem access code → session becomes premium.
  const redeem = await call("/api/access-codes/validate", { method: "POST", body: JSON.stringify({ code: CODE, profileId: id1 }) });
  const redeemData = await redeem.json().catch(() => ({}));
  record("3. redeem access code", redeem.ok && redeemData.success === true, `status=${redeem.status} success=${redeemData.success}`);

  const ent = await call("/api/entitlements").then(r => r.json()).catch(() => ({}));
  record("4. /api/entitlements isPremium after redeem", ent.isPremium === true, `isPremium=${ent.isPremium} source=${ent.source}`);

  // 5. natal-report now returns real PDF.
  {
    const r = await call("/api/natal-report", { method: "POST", body: JSON.stringify({ profile: { name: "Alice", birthDate: "1990-11-08", birthTime: "14:30", birthLocation: "New York, NY, USA" } }) });
    record("5. entitled natal-report → PDF", r.status === 200 && await isPdf(r), `status=${r.status}`);
  }
  // 6. profile PDF.
  {
    const r = await call("/api/pdf/profile", { method: "POST", body: JSON.stringify({ profileId: id1 }) });
    record("6. entitled pdf/profile → PDF", r.status === 200 && await isPdf(r), `status=${r.status}`);
  }
  // 7. compatibility PDF.
  {
    const r = await call("/api/pdf/compatibility", { method: "POST", body: JSON.stringify({ profile1Id: id1, profile2Id: id2 }) });
    record("7. entitled pdf/compatibility → PDF", r.status === 200 && await isPdf(r), `status=${r.status}`);
  }

  console.log("\n=== Soul Codex premium smoke test ===");
  for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(46)} ${r.detail}`);
  console.log(`\n${results.length - failed}/${results.length} passed${failed ? ` — ${failed} FAILED` : ""}\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error("smoke-premium crashed:", e); process.exit(1); });

const BASE = "http://localhost:5055";
let cookie = "";

async function call(path, init = {}) {
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(BASE + path, { ...init, headers, redirect: "manual" });
  const setCookies = res.headers.getSetCookie?.() || [];
  for (const c of setCookies) {
    const m = /^(connect\.sid=[^;]+)/.exec(c);
    if (m) cookie = m[1];
  }
  return res;
}

const results = [];
let failed = 0;
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  if (!pass) failed++;
}

// === FLOW 1: Fresh User ===
{
  const res = await call("/");
  record("1a. Landing page loads", res.status === 200, "status=" + res.status);
}

{
  const res = await call("/api/soul-archetype", {
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
  const body = await res.json();
  const s = JSON.stringify(body);
  const hasSun = s.includes("sunSign") || s.includes("sun_sign");
  const hasRising = s.includes("risingSign") || s.includes("rising_sign");
  const noUndefined = !s.includes('"undefined"');
  record("1b. Known-time profile created", res.status === 200 && hasSun, "status=" + res.status + " sun=" + hasSun + " rising=" + hasRising);
  record("1c. No undefined stubs", noUndefined, "noUndefined=" + noUndefined);
}

{
  const res = await call("/api/soul-archetype", {
    method: "POST",
    body: JSON.stringify({
      birth_data: {
        name: "Bob",
        birthDate: "1990-11-08",
        birthLocation: "New York, NY, USA",
      },
    }),
  });
  const body = await res.json();
  const s = JSON.stringify(body);
  const profile = body.profile || body;
  const astro = profile.astrologyData || {};
  const status = profile.astrologyStatus || body.astrologyStatus || {};
  record("1d. Unknown-time — no fake rising", !astro.risingSign, "risingSign=" + (astro.risingSign || "(absent)"));
  record("1e. Unknown-time — partial status", status.state === "partial", "state=" + status.state);
}

{
  const res = await call("/api/today/card", {
    method: "POST",
    body: JSON.stringify({
      profile: {
        name: "Alice",
        sunSign: "Scorpio",
        moonSign: "Leo",
        risingSign: "Pisces",
        lifePath: 7,
        hdType: "Generator",
      },
    }),
  });
  const body = await res.json();
  const card = body.card || body;
  record("1f. Today card renders", res.status === 200 && !!(card.date || body.date), "status=" + res.status + " date=" + (card.date || body.date));
}

// === FLOW 2: Returning User ===
{
  const res = await call("/api/entitlements");
  const body = await res.json();
  record("2a. Session persists", res.status === 200, "status=" + res.status);
  record("2b. Not premium before code", body.isPremium === false, "isPremium=" + body.isPremium);
}

// === FLOW 3: Compatibility ===
{
  const r1 = await call("/api/soul-archetype", {
    method: "POST",
    body: JSON.stringify({
      birth_data: { name: "Carol", birthDate: "1985-03-15", birthTime: "09:00", birthLocation: "Los Angeles, CA, USA" },
    }),
  });
  const carol = await r1.json();
  const carolId = carol.profile?.id || carol.profileId;

  const r2 = await call("/api/soul-archetype", {
    method: "POST",
    body: JSON.stringify({
      birth_data: { name: "Dave", birthDate: "1988-07-22", birthLocation: "Chicago, IL, USA" },
    }),
  });
  const dave = await r2.json();
  const daveId = dave.profile?.id || dave.profileId;

  if (carolId && daveId) {
    const compRes = await call("/api/compatibility", {
      method: "POST",
      body: JSON.stringify({ profile1Id: carolId, profile2Id: daveId }),
    });
    const comp = await compRes.json();
    record("3a. Compatibility known x unknown", compRes.status === 200 && typeof comp.overallScore === "number", "score=" + comp.overallScore);
    record("3b. Confidence badge", !!comp.confidence, "confidence=" + comp.confidence);
    record("3c. Systems used listed", Array.isArray(comp.systemsUsed), "systemsUsed=" + JSON.stringify(comp.systemsUsed));
    record("3d. Missing systems listed", Array.isArray(comp.systemsExcluded) || Array.isArray(comp.missingDataWarnings), "excluded=" + JSON.stringify(comp.systemsExcluded?.slice(0,3) || comp.missingDataWarnings?.slice(0,3)));
  } else {
    record("3a. Compatibility known x unknown", false, "no profile IDs");
    record("3b. Confidence badge", false, "skipped");
    record("3c. Systems used listed", false, "skipped");
    record("3d. Missing systems listed", false, "skipped");
  }
}

// === FLOW 4: Premium ===
{
  const res = await call("/api/natal-report", {
    method: "POST",
    body: JSON.stringify({ profileId: "fake" }),
  });
  record("4a. Free user blocked from premium", res.status === 403 || res.status === 401, "status=" + res.status);
}

{
  const res = await call("/api/access-codes/validate", {
    method: "POST",
    body: JSON.stringify({ code: "guest123t" }),
  });
  const body = await res.json();
  record("4b. Access code redemption", res.status === 200 && body.success, "status=" + res.status + " success=" + body.success);
}

{
  const res = await call("/api/entitlements");
  const body = await res.json();
  record("4c. Premium after code", body.isPremium === true, "isPremium=" + body.isPremium + " source=" + body.source);
}

// === FLOW 5: AI Soul Guide ===
{
  const res = await call("/api/chat/soul-guide", {
    method: "POST",
    body: JSON.stringify({
      message: "What should I focus on today?",
      history: [],
      profileContext: { name: "Alice", sunSign: "Scorpio", moonSign: "Leo", risingSign: "Pisces", hdType: "Generator", lifePath: 7 },
    }),
  });
  const text = await res.text();
  record("5a. Soul Guide responds (known time)", res.status === 200 && text.length > 50, "status=" + res.status + " len=" + text.length);
}

{
  const res = await call("/api/chat/soul-guide", {
    method: "POST",
    body: JSON.stringify({
      message: "What pattern am I stuck in?",
      history: [],
      profileContext: { name: "Bob", sunSign: "Aries", moonSign: "Cancer", hdType: "Projector", lifePath: 3 },
    }),
  });
  const text = await res.text();
  const mentionsRising = /rising\s*sign|ascendant|\brising:/i.test(text);
  const mentionsHouse = /\bhouse\b|\bhouses\b/i.test(text);
  record("5b. Unknown-time — no rising/house inferred", !mentionsRising && !mentionsHouse, "rising=" + mentionsRising + " house=" + mentionsHouse);
}

// === FLOW 7: Production Readiness ===
{
  const res = await fetch(BASE + "/health");
  record("7a. Health endpoint", res.status === 200, "status=" + res.status);
}

{
  const res = await fetch(BASE + "/health");
  const h = Object.fromEntries(res.headers.entries());
  record("7b. Helmet headers", h["x-content-type-options"] === "nosniff" && !!h["x-frame-options"] && !h["x-powered-by"],
    "xcto=" + h["x-content-type-options"] + " xfo=" + h["x-frame-options"] + " xpb=" + (h["x-powered-by"] || "(hidden)"));
}

{
  const res = await call("/api/soul-archetype", { method: "POST", body: JSON.stringify({}) });
  const rl = res.headers.get("ratelimit-limit");
  record("7c. Rate limit headers", !!rl, "ratelimit-limit=" + rl);
}

// Print results
console.log("\n=== Soul Codex V1 RC1 Walkthrough ===");
for (const r of results) {
  console.log((r.pass ? "PASS" : "FAIL") + "  " + r.name.padEnd(52) + " " + r.detail);
}
console.log("\n" + (results.length - failed) + "/" + results.length + " passed" + (failed ? " -- " + failed + " FAILED" : "") + "\n");
process.exit(failed ? 1 : 0);

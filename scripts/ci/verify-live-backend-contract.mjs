import { writeFile } from "node:fs/promises";

const target = process.env.SOUL_CODEX_BACKEND_URL?.trim();
const expectedContract = process.env.SOUL_CODEX_API_CONTRACT?.trim();

if (!target || !target.startsWith("https://")) {
  throw new Error("SOUL_CODEX_BACKEND_URL must be an https URL");
}
if (!expectedContract) {
  throw new Error("SOUL_CODEX_API_CONTRACT is required");
}

async function requestJson(path, init = undefined) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(new URL(path, target), {
        ...init,
        signal: AbortSignal.timeout(30_000),
        headers: {
          ...(init?.body ? { "content-type": "application/json" } : {}),
          ...(init?.headers ?? {}),
        },
      });
      const text = await response.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error(`${path} returned non-JSON HTTP ${response.status}`);
      }
      if (!response.ok) {
        throw new Error(`${path} returned HTTP ${response.status}: ${text.slice(0, 300)}`);
      }
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
}

const health = await requestJson("/health");
if (health?.status !== "ok") {
  throw new Error(`backend health is not ok: ${JSON.stringify(health)}`);
}
if (health?.apiContract !== expectedContract) {
  throw new Error(
    `backend API contract mismatch: expected ${expectedContract}, got ${health?.apiContract}`,
  );
}
if (
  typeof health?.releaseSha !== "string" ||
  !health.releaseSha.trim() ||
  health.releaseSha === "unknown"
) {
  throw new Error("backend /health must report a non-unknown release SHA");
}
if (typeof health?.appVersion !== "string" || !health.appVersion.trim()) {
  throw new Error("backend /health must report an appVersion");
}

const ping = await requestJson("/api/compatibility/ping");
if (ping?.ok !== true || ping?.apiContract !== expectedContract) {
  throw new Error(`compatibility ping contract failed: ${JSON.stringify(ping)}`);
}

const explorer = await requestJson("/api/compatibility/archetype-matches", {
  method: "POST",
  body: JSON.stringify({
    profile: {
      astrologyData: { sunSign: "Virgo" },
      numerologyData: { lifePath: 11 },
    },
    mode: "love",
  }),
});
if (explorer?.available !== true) {
  throw new Error(`compatibility explorer unavailable: ${JSON.stringify(explorer)}`);
}
if (!Array.isArray(explorer?.all) || explorer.all.length !== 12) {
  throw new Error("compatibility explorer must return all 12 signs");
}
if (explorer?.formula?.inputs?.sunSign !== "Virgo") {
  throw new Error("compatibility explorer Sun input mismatch");
}
if (explorer?.formula?.inputs?.lifePathNumber !== 11) {
  throw new Error("compatibility explorer must preserve master Life Path 11");
}
if (Object.hasOwn(explorer, "overallScore")) {
  throw new Error("compatibility explorer returned forbidden overallScore");
}

const person = await requestJson("/api/compatibility/person", {
  method: "POST",
  body: JSON.stringify({
    profile: {
      astrologyData: { sunSign: "Virgo" },
      numerologyData: { lifePath: 22 },
    },
    otherPerson: {
      name: "Release Contract Partner",
      sunSign: "Pisces",
    },
  }),
});
if (person?.available !== true) {
  throw new Error(`person comparison unavailable: ${JSON.stringify(person)}`);
}
if (person?.formula?.inputs?.lifePathNumber !== 22) {
  throw new Error("person comparison must preserve master Life Path 22");
}
for (const key of ["romantic", "chemistry", "mentalFriendship", "growth"]) {
  if (typeof person?.dimensions?.[key] !== "number") {
    throw new Error(`person comparison missing numeric dimension: ${key}`);
  }
}
if (Object.hasOwn(person, "overallScore")) {
  throw new Error("person comparison returned forbidden overallScore");
}

const receipt = {
  checkedAt: new Date().toISOString(),
  backendOrigin: new URL(target).origin,
  apiContract: expectedContract,
  backendAppVersion: health.appVersion,
  backendReleaseSha: health.releaseSha,
  health: "ok",
  compatibilityPing: "ok",
  explorer: "ok",
  personComparison: "ok",
  exactCandidateShaRequiredPreMerge: false,
};

await writeFile(
  "BACKEND-CONTRACT-RECEIPT.json",
  JSON.stringify(receipt, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(receipt, null, 2));

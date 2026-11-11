import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const PUBLIC_BASE = "https://soulcodex.up.railway.app";
const EXPECTED_API_CONTRACT = "foundation-v4";
const FULL_SHA = /^[0-9a-f]{40}$/i;

export function evaluateRuntimeParity({ expectedSha, health, ready, healthHttpStatus, readyHttpStatus }) {
  const hasValidExpectedSha = typeof expectedSha === "string" && FULL_SHA.test(expectedSha);
  const healthValid = healthHttpStatus === 200 &&
    health?.status === "ok" &&
    typeof health?.releaseSha === "string" &&
    FULL_SHA.test(health.releaseSha) &&
    health.apiContract === EXPECTED_API_CONTRACT &&
    health?.persistence?.mode === "postgres" &&
    health?.persistence?.durable === true;
  const readyValid = readyHttpStatus === 200 &&
    ready?.status === "ready" &&
    ready?.releaseSha === health?.releaseSha &&
    ready?.apiContract === EXPECTED_API_CONTRACT &&
    ready?.persistence?.ready === true;
  // Keep malformed/unavailable payloads distinct from a known stale runtime.
  const status = !hasValidExpectedSha || !healthValid || !readyValid
    ? "INCOMPLETE"
    : health.releaseSha === expectedSha ? "CURRENT_READY" : "STALE_READY";
  return {
    status,
    expectedSha: hasValidExpectedSha ? expectedSha : null,
    observedSha: healthValid ? health.releaseSha : null,
    healthHttpStatus,
    readyHttpStatus,
    healthValid,
    readyValid,
    apiContract: healthValid ? health.apiContract : null,
    persistenceMode: healthValid ? health.persistence.mode : null,
    // Public endpoints cannot prove the Railway service's builder override
    // or App Store/Play Console release provenance.
    railwayServiceIdentityQualified: false,
    appStoreBinaryQualified: false,
  };
}

export async function inspectPublicRuntime(expectedSha, fetchImpl = fetch) {
  const checkedAt = new Date().toISOString();
  const get = async (route) => {
    try {
      const response = await fetchImpl(`${PUBLIC_BASE}${route}`, {
        headers: { Accept: "application/json", "User-Agent": "SoulCodex-Public-Release-Parity/1.0" },
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      let payload = null;
      if (response.headers.get("content-type")?.includes("application/json")) {
        try { payload = await response.json(); } catch { /* malformed JSON remains incomplete */ }
      }
      return { status: response.status, payload };
    } catch {
      return { status: null, payload: null };
    }
  };
  const [health, ready] = await Promise.all([get("/health"), get("/ready")]);
  return {
    checkedAt,
    source: "public_read_only",
    publicBase: PUBLIC_BASE,
    ...evaluateRuntimeParity({
      expectedSha,
      health: health.payload,
      ready: ready.payload,
      healthHttpStatus: health.status,
      readyHttpStatus: ready.status,
    }),
  };
}

async function main() {
  const expectedSha = process.env.GITHUB_SHA ?? "";
  const report = await inspectPublicRuntime(expectedSha);
  const path = process.env.SOUL_CODEX_PUBLIC_RUNTIME_REPORT ?? "artifacts/public-runtime-parity.json";
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(JSON.stringify({
    status: report.status,
    expectedSha: report.expectedSha,
    observedSha: report.observedSha,
    healthHttpStatus: report.healthHttpStatus,
    readyHttpStatus: report.readyHttpStatus,
    report: path,
  }) + "\n");
  if (report.status !== "CURRENT_READY") {
    process.stdout.write("::warning::Public runtime parity is not verified; compare the source, Railway routing, and live readiness receipts.\n");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error("Read-only runtime audit could not save its receipt:", error?.message ?? String(error));
    process.exitCode = 1;
  });
}

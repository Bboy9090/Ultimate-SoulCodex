import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_BASE = "https://soulcodex.up.railway.app";
const QUALIFICATION_HEADER = "X-SoulCodex-Billing-Qualification";

export function assessBillingBoundary({ web, android, androidQualification, ios, iosQualification }) {
  const entries = [web, android, androidQualification, ios, iosQualification];
  const wellFormed = entries.every((x) => x?.httpStatus === 200 && x?.body && typeof x.body.enabled === "boolean") &&
    ["android", "ios"].every((p) => {
      const normal = p === "android" ? android : ios;
      const qualified = p === "android" ? androidQualification : iosQualification;
      return normal.body.platform === p &&
        qualified.body.platform === p &&
        typeof normal.body.qualificationMode === "boolean" &&
        typeof qualified.body.qualificationMode === "boolean" &&
        typeof normal.body.verifierConfigured === "boolean" &&
        typeof qualified.body.verifierConfigured === "boolean";
    });
  // Missing, non-JSON, HTML SPA fallback, or changed API contract is never
  // recorded as disabled/safe merely because fields were absent.
  if (!wellFormed) return { status: "INCOMPLETE", productionDisabled: null, iosSandboxAvailable: null, androidSandboxAvailable: null };
  const productionDisabled = !web.body.enabled && !android.body.enabled && !ios.body.enabled &&
    !android.body.qualificationMode && !ios.body.qualificationMode;
  if (!productionDisabled) {
    return { status: "PRODUCTION_BILLING_REVIEW_REQUIRED", productionDisabled: false,
      iosSandboxAvailable: null, androidSandboxAvailable: null };
  }
  const iosSandboxAvailable = iosQualification.body.enabled && iosQualification.body.qualificationMode &&
    iosQualification.body.verifierConfigured;
  const androidSandboxAvailable = androidQualification.body.enabled && androidQualification.body.qualificationMode &&
    androidQualification.body.verifierConfigured;
  return { status: "PRODUCTION_OFF", productionDisabled: true, iosSandboxAvailable, androidSandboxAvailable };
}

export async function inspectPublicBillingBoundary(fetchImpl = fetch) {
  const get = async (path, qualification = false) => {
    try {
      const response = await fetchImpl(`${PUBLIC_BASE}${path}`, {
        redirect: "error",
        signal: AbortSignal.timeout(15000),
        headers: { Accept: "application/json", ...(qualification ? { [QUALIFICATION_HEADER]: "1" } : {}) },
      });
      const type = response.headers.get("content-type") ?? "";
      if (!type.includes("application/json")) return { httpStatus: response.status, body: null };
      try {
        return { httpStatus: response.status, body: await response.json() };
      } catch {
        return { httpStatus: response.status, body: null };
      }
    } catch {
      return { httpStatus: null, body: null };
    }
  };
  const [web, android, androidQualification, ios, iosQualification] = await Promise.all([
    get("/api/billing/status"),
    get("/api/billing/native-catalog?platform=android"),
    get("/api/billing/native-catalog?platform=android", true),
    get("/api/billing/native-catalog?platform=ios"),
    get("/api/billing/native-catalog?platform=ios", true),
  ]);
  // Store only deliberately selected booleans. Never archive full provider
  // response bodies, prices, customer data, product tokens or credentials.
  const result = assessBillingBoundary({ web, android, androidQualification, ios, iosQualification });
  return {
    checkedAt: new Date().toISOString(),
    publicBase: PUBLIC_BASE,
    source: "public_read_only",
    ...result,
    http: {
      web: web.httpStatus,
      android: android.httpStatus,
      androidQualification: androidQualification.httpStatus,
      ios: ios.httpStatus,
      iosQualification: iosQualification.httpStatus,
    },
    // This check cannot authenticate a store purchase, prove TestFlight or Play
    // eligibility, verify subscription lifecycle, or activate provider billing.
    storePurchaseQualified: false,
    productionActivationAuthorized: false,
  };
}

async function main() {
  const result = await inspectPublicBillingBoundary();
  const output = process.env.SOUL_CODEX_PUBLIC_BILLING_REPORT ?? "artifacts/public-billing-boundary.json";
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  process.stdout.write(JSON.stringify({
    status: result.status,
    productionDisabled: result.productionDisabled,
    iosSandboxAvailable: result.iosSandboxAvailable,
    androidSandboxAvailable: result.androidSandboxAvailable,
    path: output,
  }) + "\n");
  if (result.status !== "PRODUCTION_OFF") {
    process.stdout.write("::warning::Production billing disabled state could not be verified; review live catalog and provider receipts.\n");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error("Public billing-boundary audit failed:", error?.message ?? String(error));
    process.exitCode = 1;
  });
}

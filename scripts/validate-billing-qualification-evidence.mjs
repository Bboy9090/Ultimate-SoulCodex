import fs from "node:fs";
import process from "node:process";

export const PROVIDER_CHECKPOINTS = Object.freeze({
  ios: [
    "catalog",
    "monthly_purchase",
    "annual_purchase",
    "cancelled_purchase",
    "persistence",
    "restore",
    "reinstall_restore",
    "second_device",
    "expiration_cancellation",
    "refund_revocation",
    "transaction_updates",
    "server_notifications_v2",
    "replay_environment_product_rejection",
    "free_fallback",
  ],
  android: [
    "catalog",
    "monthly_purchase",
    "annual_purchase",
    "cancelled_purchase",
    "verify_before_acknowledge",
    "persistence",
    "restore",
    "reinstall_restore",
    "second_device",
    "expiration_cancellation",
    "refund_revocation",
    "grace_account_hold",
    "rtdn_requery",
    "replay_package_product_token_rejection",
    "free_fallback",
  ],
  web: [
    "catalog",
    "monthly_purchase",
    "annual_purchase",
    "cancelled_purchase",
    "persistence",
    "manage_subscription",
    "expiration_cancellation",
    "refund_revocation",
    "webhook_verification",
    "replay_product_rejection",
    "free_fallback",
  ],
});

const ALLOWED_RESULTS = new Set(["PASS", "FAIL", "INCONCLUSIVE", "NOT APPLICABLE"]);
const FORBIDDEN_KEY = /(password|secret|private.?key|service.?account|signed.?payload|receipt|purchase.?token|identity.?token|access.?token|refresh.?token|authorization|card|pan|cvc|cvv)/i;
const FORBIDDEN_VALUE = /(?:sk_(?:live|test)_|whsec_|-----BEGIN [A-Z ]+PRIVATE KEY-----|eyJ[a-zA-Z0-9_-]{20,}\.|AIza[0-9A-Za-z_-]{20,})/;

function assertPlainObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function scanSafeMetadata(value, path = "evidence") {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanSafeMetadata(entry, `${path}[${index}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_KEY.test(key)) {
        throw new Error(`Forbidden evidence key at ${path}.${key}`);
      }
      scanSafeMetadata(child, `${path}.${key}`);
    }
    return;
  }
  if (typeof value === "string" && FORBIDDEN_VALUE.test(value)) {
    throw new Error(`Secret-like evidence value rejected at ${path}`);
  }
}

function normalizeProvider(raw) {
  const provider = String(raw ?? "").trim().toLowerCase();
  if (!Object.hasOwn(PROVIDER_CHECKPOINTS, provider)) {
    throw new Error("provider must be ios, android, or web");
  }
  return provider;
}

function normalizeEvidenceEntry(provider, checkpoint, entry) {
  assertPlainObject(entry, `${provider}.${checkpoint}`);
  const result = String(entry.result ?? "").trim().toUpperCase();
  if (!ALLOWED_RESULTS.has(result)) {
    throw new Error(`${provider}.${checkpoint}.result must be PASS, FAIL, INCONCLUSIVE, or NOT APPLICABLE`);
  }

  const evidenceRef = String(entry.evidenceRef ?? "").trim();
  if (result === "PASS" && !evidenceRef) {
    throw new Error(`${provider}.${checkpoint} PASS requires a redacted evidenceRef`);
  }
  if (evidenceRef && evidenceRef.length > 180) {
    throw new Error(`${provider}.${checkpoint}.evidenceRef is too long`);
  }

  const serverVerification = String(entry.serverVerification ?? "").trim();
  if (result === "PASS" && checkpoint.includes("purchase") && !serverVerification) {
    throw new Error(`${provider}.${checkpoint} PASS requires serverVerification`);
  }

  scanSafeMetadata(entry, `${provider}.${checkpoint}`);

  return {
    result,
    evidenceRef,
    serverVerification,
    observedAt: entry.observedAt ? String(entry.observedAt) : null,
    appBuild: entry.appBuild ? String(entry.appBuild) : null,
    device: entry.device ? String(entry.device) : null,
    accountAlias: entry.accountAlias ? String(entry.accountAlias) : null,
  };
}

export function validateBillingQualificationEvidence(input) {
  assertPlainObject(input, "input");
  scanSafeMetadata(input);

  const releaseSha = String(input.releaseSha ?? "").trim();
  if (!/^[a-f0-9]{40}$/i.test(releaseSha)) {
    throw new Error("releaseSha must be a 40-character Git SHA");
  }

  const appVersionBuild = String(input.appVersionBuild ?? "").trim();
  if (!appVersionBuild) throw new Error("appVersionBuild is required");

  const providers = {};
  for (const providerName of Object.keys(PROVIDER_CHECKPOINTS)) {
    const rawProvider = input.providers?.[providerName] ?? {};
    assertPlainObject(rawProvider, `providers.${providerName}`);

    const checkpoints = {};
    for (const checkpoint of PROVIDER_CHECKPOINTS[providerName]) {
      const entry = rawProvider[checkpoint] ?? { result: "INCONCLUSIVE" };
      checkpoints[checkpoint] = normalizeEvidenceEntry(providerName, checkpoint, entry);
    }

    const unexpected = Object.keys(rawProvider).filter(
      (checkpoint) => !PROVIDER_CHECKPOINTS[providerName].includes(checkpoint),
    );
    if (unexpected.length) {
      throw new Error(`Unexpected ${providerName} checkpoints: ${unexpected.join(", ")}`);
    }

    const requiredResults = Object.values(checkpoints).map((entry) => entry.result);
    const qualified = requiredResults.every(
      (result) => result === "PASS" || result === "NOT APPLICABLE",
    );
    const failed = requiredResults.some((result) => result === "FAIL");
    providers[providerName] = {
      qualified,
      decision: failed ? "FAIL" : qualified ? "PASS" : "INCONCLUSIVE",
      checkpoints,
    };
  }

  return {
    releaseSha,
    appVersionBuild,
    testWindow: String(input.testWindow ?? "").trim() || null,
    providers,
    overallQualified:
      providers.ios.qualified &&
      providers.android.qualified &&
      providers.web.qualified,
  };
}

export function providerQualificationDecision(report, providerName) {
  const provider = normalizeProvider(providerName);
  const state = report?.providers?.[provider];
  if (!state) throw new Error(`Missing provider report for ${provider}`);
  return {
    provider,
    qualified: Boolean(state.qualified),
    decision: state.decision,
  };
}

export function renderQualificationSummary(report) {
  const lines = [
    "# Soul Codex Billing Qualification Evidence Summary",
    "",
    `Release SHA: \`${report.releaseSha}\``,
    `App version/build: ${report.appVersionBuild}`,
    report.testWindow ? `Test window: ${report.testWindow}` : null,
    "",
  ].filter(Boolean);

  for (const provider of ["ios", "android", "web"]) {
    const state = report.providers[provider];
    lines.push(`## ${provider.toUpperCase()} — ${state.decision}`, "");
    for (const checkpoint of PROVIDER_CHECKPOINTS[provider]) {
      const row = state.checkpoints[checkpoint];
      lines.push(
        `- ${checkpoint}: **${row.result}**${row.evidenceRef ? ` — ${row.evidenceRef}` : ""}`,
      );
    }
    lines.push("");
  }

  lines.push(
    `Overall provider qualification: **${report.overallQualified ? "PASS" : "INCONCLUSIVE"}**`,
  );
  return lines.join("\n");
}

function readInput(argv) {
  const fileIndex = argv.indexOf("--file");
  if (fileIndex >= 0 && argv[fileIndex + 1]) {
    return JSON.parse(fs.readFileSync(argv[fileIndex + 1], "utf8"));
  }

  const jsonIndex = argv.indexOf("--json");
  if (jsonIndex >= 0 && argv[jsonIndex + 1]) {
    return JSON.parse(argv[jsonIndex + 1]);
  }

  throw new Error("Provide --file <redacted-evidence.json> or --json '<json>'");
}

if (process.argv[1]?.endsWith("validate-billing-qualification-evidence.mjs")) {
  try {
    const argv = process.argv.slice(2);
    const report = validateBillingQualificationEvidence(readInput(argv));
    console.log(renderQualificationSummary(report));

    const providerIndex = argv.indexOf("--require-provider-pass");
    if (providerIndex >= 0) {
      const provider = argv[providerIndex + 1];
      if (!provider) {
        throw new Error("--require-provider-pass requires ios, android, or web");
      }
      const decision = providerQualificationDecision(report, provider);
      if (!decision.qualified) process.exitCode = 3;
    }

    if (argv.includes("--require-all-pass") && !report.overallQualified) {
      process.exitCode = 3;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}

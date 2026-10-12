import process from "node:process";

export const BILLING_REQUIRED_VARIABLES = {
  shared: ["DATABASE_URL", "PUBLIC_APP_URL"],
  webAuth: ["APPLE_WEB_CLIENT_ID"],
  stripe: [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PLUS_MONTHLY_PRICE_ID",
    "STRIPE_PLUS_ANNUAL_PRICE_ID",
  ],
  apple: [
    "APPLE_CLIENT_ID",
    "APPLE_APP_ID",
    "APPLE_IAP_ROOT_CERTS_BASE64",
    "APPLE_PLUS_MONTHLY_PRODUCT_ID",
    "APPLE_PLUS_ANNUAL_PRODUCT_ID",
    "APPLE_IAP_ALLOWED_ENVIRONMENTS",
    "SOUL_CODEX_PLUS_IOS_BILLING_ENABLED",
  ],
  google: [
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
    "GOOGLE_PLAY_PACKAGE_NAME",
    "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
    "GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID",
    "GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN",
    "SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED",
  ],
  flags: [
    "SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED",
    "SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED",
  ],
};

export function auditBillingVariableNames(variableNames = []) {
  const present = new Set(variableNames.map((value) => String(value).trim()).filter(Boolean));
  const missingByGroup = Object.fromEntries(
    Object.entries(BILLING_REQUIRED_VARIABLES).map(([group, required]) => [
      group,
      required.filter((name) => !present.has(name)),
    ]),
  );
  const missing = [...new Set(Object.values(missingByGroup).flat())].sort();
  return {
    completeByName: missing.length === 0,
    missing,
    missingByGroup,
    checkedVariableCount: present.size,
  };
}

function parseNames(argv) {
  const jsonIndex = argv.indexOf("--names-json");
  if (jsonIndex >= 0 && argv[jsonIndex + 1]) {
    const parsed = JSON.parse(argv[jsonIndex + 1]);
    if (!Array.isArray(parsed)) throw new Error("--names-json must contain a JSON array");
    return parsed;
  }

  const csvIndex = argv.indexOf("--names");
  if (csvIndex >= 0 && argv[csvIndex + 1]) {
    return argv[csvIndex + 1].split(",").map((value) => value.trim()).filter(Boolean);
  }

  if (process.env.BILLING_VARIABLE_NAMES_JSON) {
    const parsed = JSON.parse(process.env.BILLING_VARIABLE_NAMES_JSON);
    if (!Array.isArray(parsed)) throw new Error("BILLING_VARIABLE_NAMES_JSON must be a JSON array");
    return parsed;
  }

  throw new Error("Provide --names-json, --names, or BILLING_VARIABLE_NAMES_JSON. Values are never required.");
}

if (process.argv[1]?.endsWith("audit-billing-variable-names.mjs")) {
  try {
    const report = auditBillingVariableNames(parseNames(process.argv.slice(2)));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.completeByName ? 0 : 3;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}

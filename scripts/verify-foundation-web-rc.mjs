import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

const files = {
  server: read("server/index.ts"),
  billing: read("server/billing.ts"),
  premiumModal: read("client/src/components/PremiumUpgradeModal.tsx"),
  astrology: read("server/services/astrology-production.ts"),
  ascendant: read("server/services/ascendant-verification.ts"),
  humanDesign: read("server/services/human-design-trust.ts"),
  reconciliation: read(
    "client/src/lib/profileVerificationReconciliation.ts",
  ),
  ci: read(".github/workflows/ci.yml"),
  pwaWorkflow: read(".github/workflows/pwa-offline-browser.yml"),
};

const checks = [];

function check(id, description, condition) {
  checks.push({ id, description, passed: Boolean(condition) });
}

check(
  "WEB-HTTP-01",
  "Helmet security headers are active",
  files.server.includes("helmet({"),
);
check(
  "WEB-HTTP-02",
  "API rate limiting is active",
  files.server.includes("rateLimit({") && files.server.includes("apiLimiter"),
);
check(
  "WEB-HTTP-03",
  "API responses are non-cacheable",
  files.server.includes('Cache-Control", "no-store'),
);
check(
  "WEB-HTTP-04",
  "Referrer leakage is disabled",
  files.server.includes('referrerPolicy: { policy: "no-referrer" }'),
);

check(
  "BILLING-01",
  "Client does not collect raw payment fields",
  !/\b(cardNumber|expiryDate|cvv|cvc)\b/.test(files.premiumModal),
);
check(
  "BILLING-02",
  "Checkout uses Stripe hosted sessions",
  /checkout\.sessions\.create\s*\(/.test(files.billing) &&
    files.billing.includes('provider: "stripe_checkout"'),
);
check(
  "BILLING-03",
  "Stripe webhook signatures are verified",
  files.billing.includes("stripe.webhooks.constructEvent"),
);
check(
  "BILLING-04",
  "Raw payment fields are explicitly rejected",
  files.billing.includes("raw_payment_data_rejected") &&
    files.billing.includes("containsRawPaymentFields"),
);
check(
  "BILLING-05",
  "Legacy direct-card endpoint is retired before JSON parsing",
  files.server.indexOf("registerBillingRawRoutes(app)") <
    files.server.indexOf("express.json"),
);

check(
  "ASTRO-01",
  "Production astrology integrates independent Ascendant verification",
  files.astrology.includes("verifyAscendant") &&
    files.astrology.includes('rising.status === "verified"') &&
    files.astrology.includes('(["Ascendant"] as const)') &&
    files.astrology.includes("ASTRO-ASCENDANT-v1") &&
    files.astrology.includes("withRisingVerificationSummary(base, rising)"),
);
check(
  "ASTRO-02",
  "Ascendant policy retains an approved evidence receipt",
  files.ascendant.includes('status: "approved"') &&
    files.ascendant.includes("ASCENDANT-VERIFICATION-RECEIPT-v1"),
);
check(
  "ASTRO-03",
  "Saved profiles require the verified Big Three migration version",
  files.reconciliation.includes(
    "CURRENT_ASTROLOGY_VERIFICATION_VERSION = 2",
  ) && files.reconciliation.includes("hasVerifiedBigThree"),
);

check(
  "HD-01",
  "Human Design has explicit unresolved and unverified states",
  files.humanDesign.includes('"unresolved"') &&
    files.humanDesign.includes('"calculated_unverified"'),
);
check(
  "HD-02",
  "Human Design cannot affect compatibility unless verified",
  files.humanDesign.includes('return record.status === "verified"'),
);

check(
  "CI-01",
  "Golden Big Three and billing security tests run in CI",
  files.ci.includes("tests/bobby-big-three-golden.test.ts") &&
    files.ci.includes("tests/billing-security.test.ts"),
);
check(
  "PWA-01",
  "Chromium and WebKit offline restart validation remains configured",
  files.pwaWorkflow.includes("Chromium and WebKit offline restart") &&
    files.pwaWorkflow.includes("Test offline browser restart"),
);

const failures = checks.filter((entry) => !entry.passed);
const receipt = {
  audit: "Soul Codex Foundation Web RC invariant audit",
  version: 1,
  generatedAt: new Date().toISOString(),
  passed: failures.length === 0,
  totalChecks: checks.length,
  passedChecks: checks.length - failures.length,
  failedChecks: failures.length,
  checks,
  deferredByOwner: [
    "iOS App Store submission and validation",
    "Google Play submission and validation",
  ],
  deliberatelyUnresolved: [
    "Astrological houses and Midheaven",
    "Nodes, Chiron, and planetary house placements",
    "Human Design verification and interpretation",
  ],
};

console.log(JSON.stringify(receipt, null, 2));

if (failures.length > 0) {
  console.error(
    `Foundation web RC audit failed: ${failures
      .map((entry) => entry.id)
      .join(", ")}`,
  );
  process.exit(1);
}

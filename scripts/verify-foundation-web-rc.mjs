import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

const files = {
  server: read("server/index.ts"),
  serverRoutes: read("server/routes.ts"),
  app: read("client/src/App.tsx"),
  localFirst: read("client/src/pages/local-first-input-form.tsx"),
  offlineProfile: read("client/src/pages/offline-profile.tsx"),
  foundationOffline: read("client/src/lib/foundationOfflineCodex.ts"),
  verificationRoute: read("server/routes/profile-verification.ts"),
  schema: read("shared/schema.ts"),
  billing: read("server/billing.ts"),
  premiumModal: read("client/src/components/PremiumUpgradeModal.tsx"),
  astrology: read("server/services/astrology-production.ts"),
  ascendant: read("server/services/ascendant-verification.ts"),
  humanDesign: read("server/services/human-design-trust.ts"),
  compatibility: read("routes/compatibility.ts"),
  compatibilityHub: read("client/src/pages/CompatibilityHubPage.tsx"),
  compatibilityExplorer: read("client/src/pages/CompatibilityExplorerPage.tsx"),
  compatibilityPerson: read("client/src/pages/CompatibilityPersonPage.tsx"),
  compatibilityPayload: read("client/src/lib/compatibilityProfilePayload.ts"),
  reconciliation: read(
    "client/src/lib/profileVerificationReconciliation.ts",
  ),
  ci: read(".github/workflows/ci.yml"),
  doctrineWorkflow: read(".github/workflows/foundation-doctrine-gate.yml"),
  pwaWorkflow: read(".github/workflows/pwa-offline-browser.yml"),
};

const checks = [];

function check(id, description, condition) {
  checks.push({ id, description, passed: Boolean(condition) });
}

check(
  "ARCH-01",
  "Production server uses the canonical server/routes entrypoint",
  files.server.includes('from "./routes.js"') &&
    !files.server.includes('from "../routes.js"'),
);
check(
  "ARCH-02",
  "Simulated premium analysis pages are not exposed by the Foundation production router",
  !files.app.includes("PalmistryPage") &&
    !files.app.includes('path="/palmistry/:id"') &&
    !files.app.includes("AstrocartographyPage") &&
    !files.app.includes('path="/astrocartography/:id"'),
);

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
  "PRIVACY-01",
  "Local profile creation does not upload for verification unless the user explicitly opts in",
  files.localFirst.includes("const [verifyOnline, setVerifyOnline] = useState(false)") &&
    files.localFirst.includes('data-testid="checkbox-online-verification"') &&
    /if \(verifyOnline\) \{\s*void requestVerificationWhenOnline\(data, profile\);\s*\}/s.test(files.localFirst),
);
check(
  "PRIVACY-02",
  "Opening an offline profile does not upload it; verification requires an explicit action",
  files.offlineProfile.includes("const requestOnlineVerification = async () =>") &&
    files.offlineProfile.includes('data-testid="button-verify-online-profile"') &&
    files.offlineProfile.includes("Merely opening this local profile does not upload it.") &&
    !/useEffect\s*\(\s*\(\)\s*=>[\s\S]*apiFetch\("\/api\/profiles"/.test(files.offlineProfile),
);
check(
  "PRIVACY-03",
  "Local-first UI explains the online verification boundary",
  files.localFirst.includes("Online astronomy verification happens only when you explicitly choose it.") &&
    files.localFirst.includes("Leave this off to keep profile creation entirely on-device.") &&
    files.localFirst.includes("No profile data was uploaded for verification."),
);
check(
  "PRIVACY-04",
  "Server-backed profile reads and personal-data mutations enforce user/session ownership",
  files.serverRoutes.includes("profileBelongsToActor") &&
    files.serverRoutes.includes("requestOwnsProfile") &&
    files.serverRoutes.includes("if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res)") &&
    files.ci.includes("tests/server-profile-ownership.test.ts"),
);
check(
  "PRIVACY-05",
  "Compatibility uploads are minimized to Sun evidence and Life Path instead of the full saved profile",
  files.compatibilityPayload.includes("minimum server payload required by Foundation compatibility") &&
    files.compatibilityExplorer.includes("buildCompatibilityProfilePayload") &&
    files.compatibilityExplorer.includes("profile: compatibilityProfile") &&
    files.compatibilityPerson.includes("buildCompatibilityProfilePayload") &&
    files.compatibilityPerson.includes("profile: compatibilityProfile") &&
    files.ci.includes("tests/compatibility-data-minimization.test.ts"),
);
check(
  "PRIVACY-06",
  "Astronomy verification is a minimal evidence-only endpoint and cannot create a server profile or invoke AI",
  files.localFirst.includes('"/api/verification/profile"') &&
    files.offlineProfile.includes('"/api/verification/profile"') &&
    files.verificationRoute.includes('app.post("/api/verification/profile"') &&
    files.verificationRoute.includes("persistedProfile: false") &&
    files.verificationRoute.includes("aiGeneration: false") &&
    !/^import .*storage/im.test(files.verificationRoute) &&
    !/^import .*openai/im.test(files.verificationRoute),
);

check(
  "TRUTH-01",
  "Foundation local generation does not fabricate time-dependent astronomy",
  files.localFirst.includes("generateFoundationOfflineCodexProfile") &&
    files.foundationOffline.includes("moonSign: \"\"") &&
    files.foundationOffline.includes("risingSign: \"\"") &&
    files.foundationOffline.includes("planets: {}") &&
    files.foundationOffline.includes("houses: []") &&
    files.foundationOffline.includes("aspects: []") &&
    files.foundationOffline.includes("Moon, Rising, planets, houses, aspects, nodes, and Chiron are deliberately absent rather than approximated."),
);
check(
  "TRUTH-02",
  "Unknown birth time is accepted explicitly instead of forcing invented precision",
  files.schema.includes('z.literal("")') &&
    files.schema.includes("birthTime: birthTimeSchema") &&
    files.localFirst.includes("Unknown time is better than invented precision."),
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
  "BILLING-06",
  "Legacy profile upgrade route cannot collect card data or grant premium directly",
  files.serverRoutes.includes("direct_card_upgrade_retired") &&
    !/const\s*\{\s*cardNumber\s*,\s*expiryDate\s*,\s*cvv\s*\}\s*=\s*req\.body/.test(files.serverRoutes) &&
    !/updateProfile\([^)]*\{\s*isPremium:\s*true\s*\}/.test(files.serverRoutes),
);

check(
  "ASTRO-01",
  "Production astrology integrates independent Ascendant verification",
  files.astrology.includes("verifyAscendant") &&
    files.astrology.includes('rising.verificationStatus === "verified"') &&
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
  "Foundation compatibility excludes Human Design even when legacy profile data contains it",
  files.compatibility.includes("Human Design excluded from Foundation compatibility") &&
    files.compatibility.includes("calculateArchetypeMatches(sunSign, verifiedInput.lifePathNumber, undefined") &&
    !files.compatibility.includes("verifiedHumanDesignType"),
);

check(
  "COMPAT-01",
  "Specific-person compatibility reuses the saved profile and asks only for the other person's data",
  files.compatibility.includes('router.post("/compatibility/person"') &&
    files.compatibilityPerson.includes("otherPerson") &&
    files.compatibilityPerson.includes("loadActiveProfile") &&
    files.compatibilityPerson.includes("Four dimensions, not one verdict"),
);
check(
  "COMPAT-02",
  "Compatibility hub exposes the specific-person comparison instead of a future-work placeholder",
  files.compatibilityHub.includes('/compatibility/compare') &&
    !files.compatibilityHub.includes("Next consumer pass"),
);
check(
  "COMPAT-03",
  "Universal compatibility labels model values as symbolic scores rather than relationship probabilities",
  files.compatibilityExplorer.includes("Highest symbolic fit") &&
    files.compatibilityExplorer.includes("Highest symbolic friction") &&
    files.compatibilityExplorer.includes("not relationship probability") &&
    files.compatibilityExplorer.includes("symbolic score"),
);

check(
  "CI-01",
  "Golden Big Three, data minimization, billing, local-first privacy, and profile ownership tests run in CI",
  files.ci.includes("tests/bobby-big-three-golden.test.ts") &&
    files.ci.includes("tests/compatibility-data-minimization.test.ts") &&
    files.ci.includes("tests/billing-security.test.ts") &&
    files.ci.includes("tests/local-first-privacy-contract.test.ts") &&
    files.ci.includes("tests/server-profile-ownership.test.ts"),
);
check(
  "CI-02",
  "The exact-head doctrine gate enforces unknown-time, no-fabrication, minimal verification, privacy, compatibility, billing, and no-simulation contracts",
  files.doctrineWorkflow.includes("tests/unknown-time-input-contract.test.ts") &&
    files.doctrineWorkflow.includes("tests/foundation-local-astronomy-boundary.test.ts") &&
    files.doctrineWorkflow.includes("tests/profile-verification-boundary.test.ts") &&
    files.doctrineWorkflow.includes("tests/local-first-privacy-contract.test.ts") &&
    files.doctrineWorkflow.includes("tests/compatibility-data-minimization.test.ts") &&
    files.doctrineWorkflow.includes("tests/billing-security.test.ts") &&
    files.doctrineWorkflow.includes("tests/no-simulated-release-routes.test.ts"),
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
  version: 7,
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
    "Human Design compatibility and authoritative interpretation",
    "Palmistry computer-vision analysis",
    "Astrocartography planetary-line calculation and mapping",
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
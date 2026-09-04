import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

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
  compatibility: read("server/routes/compatibility.ts"),
  compatibilityShim: read("routes/compatibility.ts"),
  compatibilityHub: read("client/src/pages/CompatibilityHubPage.tsx"),
  compatibilityExplorer: read("client/src/pages/CompatibilityExplorerPage.tsx"),
  compatibilityPerson: read("client/src/pages/CompatibilityPersonPage.tsx"),
  compatibilityPayload: read("client/src/lib/compatibilityProfilePayload.ts"),
  activeProfileHook: read("client/src/hooks/useActiveProfile.ts"),
  activeProfileRepository: read("client/src/lib/ActiveProfileRepository.ts"),
  releaseIdentity: read("server/lib/release-identity.ts"),
  diagnostics: read("client/src/pages/DiagnosticsPage.tsx"),
  reconciliation: read("client/src/lib/profileVerificationReconciliation.ts"),
  codebuild: read("scripts/ci/codebuild-core.sh"),
  planetaryCodebuild: read("scripts/ci/codebuild-planetary-evidence.sh"),
  buildspec: read("buildspec.yml"),
  planetaryBuildspec: read("buildspec-planetary-evidence.yml"),
};

const checks = [];
const check = (id, description, condition) => checks.push({ id, description, passed: Boolean(condition) });

check("ARCH-01", "Production server uses canonical server/routes entrypoint", files.server.includes('from "./routes.js"') && !files.server.includes('from "../routes.js"'));
check("ARCH-02", "Simulated premium analysis pages are not exposed", !files.app.includes("PalmistryPage") && !files.app.includes('path="/palmistry/:id"') && !files.app.includes("AstrocartographyPage") && !files.app.includes('path="/astrocartography/:id"'));
check("ARCH-03", "Compatibility has one canonical server route tree", files.server.includes('from "./routes/compatibility.js"') && files.compatibilityShim.includes('from "../server/routes/compatibility"') && !files.compatibilityShim.includes('router.post("/compatibility/person"'));

check("WEB-HTTP-01", "Helmet security headers are active", files.server.includes("helmet({"));
check("WEB-HTTP-02", "API rate limiting is active", files.server.includes("rateLimit({") && files.server.includes("apiLimiter"));
check("WEB-HTTP-03", "API responses are non-cacheable", files.server.includes('Cache-Control", "no-store'));
check("WEB-HTTP-04", "Referrer leakage is disabled", files.server.includes('referrerPolicy: { policy: "no-referrer" }'));
check("WEB-HTTP-05", "Health exposes inspectable release identity", files.server.includes("resolveReleaseIdentity()") && files.releaseIdentity.includes('apiContract: FOUNDATION_API_CONTRACT') && files.releaseIdentity.includes('"unknown"'));

check("PRIVACY-01", "Local creation uploads only after explicit opt-in", files.localFirst.includes("const [verifyOnline, setVerifyOnline] = useState(false)") && files.localFirst.includes('data-testid="checkbox-online-verification"'));
check("PRIVACY-02", "Opening an offline profile does not upload it", files.offlineProfile.includes("const requestOnlineVerification = async () =>") && files.offlineProfile.includes('data-testid="button-verify-online-profile"') && files.offlineProfile.includes("Merely opening this local profile does not upload it."));
check("PRIVACY-03", "Local-first UI explains verification boundary", files.localFirst.includes("Online astronomy verification happens only when you explicitly choose it.") && files.localFirst.includes("Leave this off to keep profile creation entirely on-device."));
check("PRIVACY-04", "Profile ownership tests remain in external CI", files.serverRoutes.includes("profileBelongsToActor") && files.serverRoutes.includes("requestOwnsProfile") && files.codebuild.includes("tests/server-profile-ownership.test.ts"));
check("PRIVACY-05", "Compatibility uploads are minimized", files.compatibilityPayload.includes("minimum server payload required by Foundation compatibility") && files.codebuild.includes("tests/compatibility-data-minimization.test.ts"));
check("PRIVACY-06", "Astronomy verification is evidence-only", files.verificationRoute.includes('app.post("/api/verification/profile"') && files.verificationRoute.includes("persistedProfile: false") && files.verificationRoute.includes("aiGeneration: false") && !/^import .*storage/im.test(files.verificationRoute) && !/^import .*openai/im.test(files.verificationRoute));

check("TRUTH-01", "Local generation does not fabricate time-dependent astronomy", files.foundationOffline.includes('moonSign: ""') && files.foundationOffline.includes('risingSign: ""') && files.foundationOffline.includes("planets: {}") && files.foundationOffline.includes("houses: []") && files.foundationOffline.includes("aspects: []"));
check("TRUTH-02", "Unknown birth time remains explicit", files.schema.includes('z.literal("")') && files.schema.includes("birthTime: birthTimeSchema") && files.localFirst.includes("Unknown time is better than invented precision."));

check("BILLING-01", "Client does not collect raw payment fields", !/\b(cardNumber|expiryDate|cvv|cvc)\b/.test(files.premiumModal));
check("BILLING-02", "Checkout uses Stripe hosted sessions", /checkout\.sessions\.create\s*\(/.test(files.billing) && files.billing.includes('provider: "stripe_checkout"'));
check("BILLING-03", "Stripe webhook signatures are verified", files.billing.includes("stripe.webhooks.constructEvent"));
check("BILLING-04", "Raw payment fields are rejected", files.billing.includes("raw_payment_data_rejected") && files.billing.includes("containsRawPaymentFields"));
check("BILLING-05", "Legacy direct-card endpoint is retired before JSON parsing", files.server.indexOf("registerBillingRawRoutes(app)") < files.server.indexOf("express.json"));
check("BILLING-06", "Legacy profile upgrade cannot grant premium directly", files.serverRoutes.includes("direct_card_upgrade_retired") && !/updateProfile\([^)]*\{\s*isPremium:\s*true\s*\}/.test(files.serverRoutes));

check("ASTRO-01", "Production astrology integrates independent Ascendant verification", files.astrology.includes("verifyAscendant") && files.astrology.includes('rising.verificationStatus === "verified"') && files.astrology.includes("ASTRO-ASCENDANT-v1"));
check("ASTRO-02", "Ascendant policy retains approved evidence receipt", files.ascendant.includes('status: "approved"') && files.ascendant.includes("ASCENDANT-VERIFICATION-RECEIPT-v1"));
check("ASTRO-03", "Saved profiles require verified Big Three and major-planet migration", files.reconciliation.includes("CURRENT_ASTROLOGY_VERIFICATION_VERSION = 3") && files.reconciliation.includes("hasVerifiedBigThree") && files.reconciliation.includes("hasVerifiedMajorPlanets"));
check("ASTRO-04", "External CI enforces planetary verification and production-promotion contracts", files.codebuild.includes("tests/planetary-verification-contract.test.ts") && files.codebuild.includes("tests/planetary-production-promotion.test.ts") && files.planetaryCodebuild.includes("run-live-planetary-evidence.ts") && files.planetaryBuildspec.includes("codebuild-planetary-evidence.sh"));

check("HD-01", "Human Design keeps unresolved/unverified states", files.humanDesign.includes('"unresolved"') && files.humanDesign.includes('"calculated_unverified"'));
check("HD-02", "Foundation compatibility excludes unverified Human Design", files.compatibility.includes("Human Design excluded from Foundation compatibility") && !files.compatibility.includes("verifiedHumanDesignType"));

check("COMPAT-01", "Specific-person compatibility reuses canonical active profile", files.compatibility.includes('router.post("/compatibility/person"') && files.compatibilityPerson.includes("useActiveProfile") && files.compatibilityPerson.includes("buildCompatibilityProfilePayload"));
check("COMPAT-02", "Compatibility hub exposes specific-person comparison", files.compatibilityHub.includes('/compatibility/compare') && !files.compatibilityHub.includes("Next consumer pass"));
check("COMPAT-03", "Compatibility scores remain symbolic", files.compatibilityExplorer.includes("not relationship probability") && files.compatibilityExplorer.includes("symbolic score"));
check("COMPAT-04", "Master Life Paths are preserved without universal overall score", files.compatibility.includes("SUPPORTED_LIFE_PATHS") && files.compatibility.includes("11, 22, 33") && !files.compatibility.includes("overallScore"));

check("PROFILE-01", "Cross-feature consumers share reactive profile event contract", files.activeProfileRepository.includes("ACTIVE_PROFILE_UPDATED_EVENT") && files.activeProfileRepository.includes("notifyProfileUpdated()") && files.activeProfileHook.includes("ACTIVE_PROFILE_UPDATED_EVENT"));
check("RELEASE-01", "Diagnostics expose release/API identity without profile data", files.app.includes('path="/diagnostics"') && files.diagnostics.includes("expectedApiContract") && files.diagnostics.includes("releaseSha") && !files.diagnostics.includes("birthDate"));

const requiredExternalTests = [
  "tests/bobby-big-three-golden.test.ts",
  "tests/compatibility-data-minimization.test.ts",
  "tests/billing-security.test.ts",
  "tests/local-first-privacy-contract.test.ts",
  "tests/server-profile-ownership.test.ts",
  "tests/unknown-time-input-contract.test.ts",
  "tests/foundation-local-astronomy-boundary.test.ts",
  "tests/profile-verification-boundary.test.ts",
  "tests/no-simulated-release-routes.test.ts",
  "tests/planetary-verification-contract.test.ts",
  "tests/planetary-production-promotion.test.ts",
];
check("CI-01", "CodeBuild retains required trust/privacy/security tests", requiredExternalTests.every((test) => files.codebuild.includes(test)));
check("CI-02", "CodeBuild runs locked install, checks, tests, audit, invariant audit, and production build", files.codebuild.includes("npm ci") && files.codebuild.includes("npm run check") && files.codebuild.includes("npm test") && files.codebuild.includes("npm audit --omit=dev --audit-level=high") && files.codebuild.includes("npm run build") && files.buildspec.includes("./scripts/ci/codebuild-core.sh"));

const failures = checks.filter((entry) => !entry.passed);
const receipt = {
  audit: "Soul Codex Foundation CodeBuild invariant audit",
  version: 2,
  generatedAt: new Date().toISOString(),
  passed: failures.length === 0,
  totalChecks: checks.length,
  passedChecks: checks.length - failures.length,
  failedChecks: failures.length,
  checks,
  deferredByOwner: ["iOS App Store submission and validation", "Google Play submission and validation"],
  deliberatelyUnresolved: ["Astrological houses and Midheaven", "Nodes, Chiron, and planetary house placements", "Human Design compatibility and authoritative interpretation", "Palmistry computer-vision analysis", "Astrocartography planetary-line calculation and mapping"],
};

console.log(JSON.stringify(receipt, null, 2));
if (failures.length > 0) {
  console.error(`Foundation CodeBuild audit failed: ${failures.map((entry) => entry.id).join(", ")}`);
  process.exit(1);
}

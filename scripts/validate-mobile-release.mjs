import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

const platform = process.argv[2];
const failures = [];

function requireFile(path) {
  if (!existsSync(path)) failures.push(`Missing required file: ${path}`);
}

function requireMatch(path, pattern, message) {
  requireFile(path);
  if (existsSync(path) && !pattern.test(readFileSync(path, "utf8"))) failures.push(message);
}

if (!platform || !["ios", "android"].includes(platform)) {
  failures.push("Usage: node scripts/validate-mobile-release.mjs <ios|android>");
}

const apiUrl = process.env.VITE_API_URL?.trim();
if (!apiUrl) {
  failures.push("VITE_API_URL is required for a native release build.");
} else {
  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== "https:") failures.push("VITE_API_URL must use HTTPS.");
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) {
      failures.push("VITE_API_URL cannot point at localhost for a store build.");
    }
  } catch {
    failures.push("VITE_API_URL must be a valid absolute URL.");
  }
}

const releaseVersion = process.env.VITE_RELEASE_VERSION?.trim();
const releaseSha = process.env.VITE_RELEASE_SHA?.trim();
const apiContract = process.env.VITE_API_CONTRACT?.trim();

if (!releaseVersion) failures.push("VITE_RELEASE_VERSION is required for a native release build.");
if (!releaseSha) {
  failures.push("VITE_RELEASE_SHA is required for a native release build.");
} else if (releaseSha === "unknown") {
  failures.push("VITE_RELEASE_SHA cannot be unknown for a native release build.");
} else if (!/^[0-9a-f]{40}$/i.test(releaseSha)) {
  failures.push("VITE_RELEASE_SHA must be an exact 40-character Git commit SHA.");
}
if (!apiContract) {
  failures.push("VITE_API_CONTRACT is required for a native release build.");
} else if (apiContract !== "foundation-v4") {
  failures.push("VITE_API_CONTRACT must remain foundation-v4 for the current release line.");
}

requireMatch("capacitor.config.ts", /appId:\s*["']app\.soulcodex\.main["']/, "Capacitor appId must remain app.soulcodex.main.");
requireFile("client/src/pages/AccountDeletionPage.tsx");
requireFile("client/src/pages/SupportPage.tsx");
requireFile("client/src/pages/DiagnosticsPage.tsx");

if (platform === "ios") {
  const exportOptionsPath = "ios/App/ExportOptions.plist";
  requireFile("ios/App/App/PrivacyInfo.xcprivacy");
  requireFile("ios/App/App.xcodeproj/xcshareddata/xcschemes/Soul Codex.xcscheme");
  requireMatch(exportOptionsPath, /<key>teamID<\/key>\s*<string>86NUJ8M3B8<\/string>/, "The iOS export Team ID is missing or incorrect in ios/App/ExportOptions.plist.");
  requireMatch(exportOptionsPath, /<key>method<\/key>\s*<string>(app-store|app-store-connect)<\/string>/, "The iOS export method must target App Store distribution.");
  requireMatch("ios/App/App.xcodeproj/project.pbxproj", /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/, "The iOS bundle identifier must remain app.soulcodex.ios.");
  requireMatch("ios/App/App/Info.plist", /<key>CFBundleVersion<\/key>\s*<string>4000003<\/string>/, "The iOS build number must be 4000003 for rc.3.");
}

if (platform === "android") {
  if (releaseVersion !== "4.0.0-rc.4") {
    failures.push("Android VITE_RELEASE_VERSION must be 4.0.0-rc.4 for the current Play release candidate.");
  }
  requireMatch("android/app/build.gradle", /applicationId\s+["']app\.soulcodex\.main["']/, "The Android application ID must remain app.soulcodex.main.");
  requireMatch("android/variables.gradle", /targetSdkVersion\s*=\s*36/, "Android targetSdkVersion must be 36.");
  requireMatch("android/app/build.gradle", /versionCode\s+4000004/, "The Android versionCode must be 4000004 for rc.4.");
  requireMatch("android/app/build.gradle", /versionName\s+["']4\.0\.0-rc\.4["']/, "The Android versionName must be 4.0.0-rc.4.");

  requireFile("client/src/components/AIContentReport.tsx");
  requireMatch("client/src/App.tsx", /<AIContentReport\s*\/>/, "The Android release must expose the in-app AI content reporting control.");
  requireMatch("client/src/components/AIContentReport.tsx", /\/api\/ai-content-report/, "The AI content reporting control must submit to the governed report endpoint.");
  requireMatch("routes/chat.ts", /app\.post\(["']\/api\/ai-content-report["']/, "The AI content report API endpoint must remain registered.");
  requireMatch("routes/chat.ts", /AI_REPORT_CATEGORIES/, "The AI content report endpoint must validate report categories.");
}

if (failures.length) {
  console.error("Mobile release validation failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`${platform} mobile release configuration validated for ${apiUrl} at ${releaseVersion} ${releaseSha} (${apiContract})`);

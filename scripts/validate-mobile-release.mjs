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

requireMatch("capacitor.config.ts", /appId:\s*["']app\.soulcodex\.main["']/, "Capacitor appId must remain app.soulcodex.main.");
requireFile("client/src/pages/AccountDeletionPage.tsx");
requireFile("client/src/pages/SupportPage.tsx");

if (platform === "ios") {
  const exportOptionsPath = "ios/App/ExportOptions.plist";
  requireFile("ios/App/App/PrivacyInfo.xcprivacy");
  requireFile("ios/App/App.xcodeproj/xcshareddata/xcschemes/Soul Codex.xcscheme");
  requireMatch(exportOptionsPath, /<key>teamID<\/key>\s*<string>86NUJ8M3B8<\/string>/, "The iOS export Team ID is missing or incorrect in ios/App/ExportOptions.plist.");
  requireMatch(exportOptionsPath, /<key>method<\/key>\s*<string>(app-store|app-store-connect)<\/string>/, "The iOS export method must target App Store distribution.");
  requireMatch("ios/App/App.xcodeproj/project.pbxproj", /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/, "The iOS bundle identifier must remain app.soulcodex.ios.");
}

if (platform === "android") {
  requireMatch("android/app/build.gradle", /applicationId\s+["']app\.soulcodex\.main["']/, "The Android application ID must remain app.soulcodex.main.");
  requireMatch("android/variables.gradle", /targetSdkVersion\s*=\s*36/, "Android targetSdkVersion must be 36.");
}

if (failures.length) {
  console.error("Mobile release validation failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`${platform} mobile release configuration validated for ${apiUrl}`);

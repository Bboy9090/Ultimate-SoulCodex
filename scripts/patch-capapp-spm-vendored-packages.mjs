import { existsSync, readFileSync, writeFileSync } from "node:fs";

const manifestPath = "ios/App/CapApp-SPM/Package.swift";
const dependencyReplacements = [
  {
    generated: '.package(name: "CapacitorKeyboard", path: "../../../node_modules/@capacitor/keyboard")',
    cloneReady: '.package(url: "https://github.com/ionic-team/capacitor-keyboard.git", exact: "8.0.3")',
  },
  {
    generated: '.package(name: "CapacitorSplashScreen", path: "../../../node_modules/@capacitor/splash-screen")',
    cloneReady: '.package(name: "CapacitorSplashScreen", path: "../Vendor/CapacitorSplashScreen")',
  },
  {
    generated: '.package(name: "CapacitorStatusBar", path: "../../../node_modules/@capacitor/status-bar")',
    cloneReady: '.package(name: "CapacitorStatusBar", path: "../Vendor/CapacitorStatusBar")',
  },
  {
    generated: '.package(name: "CapawesomeCapacitorAppleSignIn", path: "../../../node_modules/@capawesome/capacitor-apple-sign-in")',
    cloneReady: '.package(name: "CapawesomeCapacitorAppleSignIn", path: "../Vendor/CapawesomeCapacitorAppleSignIn")',
  },
];

const productIdentityReplacements = [
  {
    generated: '.product(name: "CapacitorKeyboard", package: "CapacitorKeyboard")',
    cloneReady: '.product(name: "CapacitorKeyboard", package: "capacitor-keyboard")',
  },
];

const requiredVendorManifests = [
  "ios/App/Vendor/CapacitorSplashScreen/Package.swift",
  "ios/App/Vendor/CapacitorStatusBar/Package.swift",
  "ios/App/Vendor/CapawesomeCapacitorAppleSignIn/Package.swift",
];

for (const vendorManifest of requiredVendorManifests) {
  if (!existsSync(vendorManifest)) throw new Error(`Vendored Swift package is missing: ${vendorManifest}`);
}

let manifest = readFileSync(manifestPath, "utf8");
for (const { generated, cloneReady } of [...dependencyReplacements, ...productIdentityReplacements]) {
  if (manifest.includes(generated)) manifest = manifest.replace(generated, cloneReady);
  else if (!manifest.includes(cloneReady)) throw new Error(`CapApp-SPM is missing generated or clone-ready declaration: ${generated}`);
}

if (manifest.includes("node_modules/")) throw new Error("CapApp-SPM still contains a clone-time dependency on node_modules.");

for (const { cloneReady } of [...dependencyReplacements, ...productIdentityReplacements]) {
  if (!manifest.includes(cloneReady)) throw new Error(`CapApp-SPM is missing clone-ready declaration: ${cloneReady}`);
}

writeFileSync(manifestPath, manifest, "utf8");
console.log("Patched CapApp-SPM to use clone-ready Swift package dependencies.");

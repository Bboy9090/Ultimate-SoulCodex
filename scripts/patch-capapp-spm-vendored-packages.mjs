import { existsSync, readFileSync, writeFileSync } from "node:fs";

const manifestPath = "ios/App/CapApp-SPM/Package.swift";
const vendorManifest =
  "ios/App/Vendor/CapawesomeCapacitorAppleSignIn/Package.swift";
const generatedDependency =
  '.package(name: "CapawesomeCapacitorAppleSignIn", path: "../../../node_modules/@capawesome/capacitor-apple-sign-in")';
const vendoredDependency =
  '.package(name: "CapawesomeCapacitorAppleSignIn", path: "../Vendor/CapawesomeCapacitorAppleSignIn")';

if (!existsSync(vendorManifest)) {
  throw new Error(`Vendored Apple Sign-In package is missing: ${vendorManifest}`);
}

let manifest = readFileSync(manifestPath, "utf8");

if (manifest.includes(generatedDependency)) {
  manifest = manifest.replace(generatedDependency, vendoredDependency);
  writeFileSync(manifestPath, manifest, "utf8");
} else if (!manifest.includes(vendoredDependency)) {
  throw new Error(
    `CapApp-SPM does not contain the generated or vendored Apple Sign-In dependency declaration: ${manifestPath}`,
  );
}

const patchedManifest = readFileSync(manifestPath, "utf8");
if (patchedManifest.includes("node_modules/@capawesome/capacitor-apple-sign-in")) {
  throw new Error("CapApp-SPM still depends on Apple Sign-In through node_modules.");
}
if (!patchedManifest.includes(vendoredDependency)) {
  throw new Error("CapApp-SPM does not reference the vendored Apple Sign-In package.");
}

console.log("Patched CapApp-SPM to use the vendored Apple Sign-In Swift package.");

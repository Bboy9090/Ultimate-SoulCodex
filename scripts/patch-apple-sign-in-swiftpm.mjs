import { readFileSync, writeFileSync } from "node:fs";

const pluginPath =
  "node_modules/@capawesome/capacitor-apple-sign-in/ios/Plugin/AppleSignInPlugin.swift";

const replacements = [
  [
    "import AuthenticationServices\n",
    "import AuthenticationServices\nimport UIKit\n",
  ],
  [
    "        call.reject(error.localizedDescription, code)",
    "        call.errorHandler(CAPPluginCallError(message: error.localizedDescription, code: code, error: error, data: nil))",
  ],
  [
    "        return self.bridge?.webView?.window ?? ASPresentationAnchor()",
    `        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()`,
  ],
];

let source = readFileSync(pluginPath, "utf8");

for (const [original, replacement] of replacements) {
  if (source.includes(replacement)) {
    continue;
  }
  if (!source.includes(original)) {
    throw new Error(
      `Apple Sign-In compatibility patch could not find expected source: ${original.trim()}`,
    );
  }
  source = source.replace(original, replacement);
}

writeFileSync(pluginPath, source);
console.log("Applied Apple Sign-In SwiftPM compatibility patch.");

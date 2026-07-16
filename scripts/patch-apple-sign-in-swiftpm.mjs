import { readFileSync, writeFileSync } from "node:fs";

const pluginRoot =
  "node_modules/@capawesome/capacitor-apple-sign-in/ios/Plugin";

const patches = [
  {
    path: `${pluginRoot}/AppleSignInPlugin.swift`,
    replacements: [
      [
        "import AuthenticationServices\n",
        "import AuthenticationServices\nimport UIKit\n",
      ],
      [
        "        call.reject(error.localizedDescription, code)",
        '        call.unavailable(code.map { "\\($0): \\(error.localizedDescription)" } ?? error.localizedDescription)',
      ],
      [
        "        return self.bridge?.webView?.window ?? ASPresentationAnchor()",
        `        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()`,
      ],
    ],
  },
  {
    path: `${pluginRoot}/Classes/Options/SignInOptions.swift`,
    replacements: [
      [
        '        self.nonce = call.getString("nonce")',
        `        let nonce = call.getString("nonce", "")
        self.nonce = nonce.isEmpty ? nil : nonce`,
      ],
      [
        '        guard let scopeStrings = call.getArray("scopes") as? [String] else {',
        '        guard let scopeStrings = call.getArray("scopes", []) as? [String] else {',
      ],
    ],
  },
];

for (const patch of patches) {
  let source = readFileSync(patch.path, "utf8");

  for (const [original, replacement] of patch.replacements) {
    if (source.includes(replacement)) {
      continue;
    }
    if (!source.includes(original)) {
      throw new Error(
        `Apple Sign-In compatibility patch could not find expected source in ${patch.path}: ${original.trim()}`,
      );
    }
    source = source.replace(original, replacement);
  }

  writeFileSync(patch.path, source);
}
console.log("Applied Apple Sign-In SwiftPM compatibility patch.");

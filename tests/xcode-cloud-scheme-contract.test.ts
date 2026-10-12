import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schemePath =
  "ios/App/App.xcodeproj/xcshareddata/xcschemes/Ultimate Soul Codex.xcscheme";
const scheme = readFileSync(schemePath, "utf8");
const project = readFileSync("ios/App/App.xcodeproj/project.pbxproj", "utf8");

test("Xcode Cloud archive scheme is shared and targets the production app", () => {
  assert.match(scheme, /<ArchiveAction buildConfiguration="Release"/);
  assert.match(scheme, /BlueprintIdentifier="504EC3031FED79650016851F"/);
  assert.match(scheme, /BlueprintName="Ultimate Soul Codex"/);
  assert.match(scheme, /ReferencedContainer="container:App\.xcodeproj"/);
  assert.match(
    project,
    /504EC3031FED79650016851F \/\* Ultimate Soul Codex \*\/ = \{\s*isa = PBXNativeTarget;/,
  );
});


test("Xcode Cloud release signing uses automatic team-managed archive signing", () => {
  const release = project.match(
    /504EC3181FED79650016851F \/\* Release \*\/ = \{[\s\S]*?buildSettings = \{([\s\S]*?)\n\t\t\t\};/,
  )?.[1] ?? "";
  assert.match(release, /CODE_SIGN_IDENTITY = "Apple Development";/);
  assert.match(release, /CODE_SIGN_STYLE = Automatic;/);
  assert.match(release, /DEVELOPMENT_TEAM = 86NUJ8M3B8;/);
  assert.match(release, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
  assert.doesNotMatch(release, /PROVISIONING_PROFILE_SPECIFIER/);
  assert.doesNotMatch(release, /Apple Distribution/);
});

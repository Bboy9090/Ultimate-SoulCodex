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

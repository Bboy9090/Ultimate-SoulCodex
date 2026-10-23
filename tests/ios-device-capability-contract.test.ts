import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const infoPlist = readFileSync("ios/App/App/Info.plist", "utf8");
const project = readFileSync("ios/App/App.xcodeproj/project.pbxproj", "utf8");

test("iOS does not advertise obsolete armv7-only device capability", () => {
  assert.doesNotMatch(
    infoPlist,
    /<key>UIRequiredDeviceCapabilities<\/key>[\s\S]*?<string>armv7<\/string>/,
  );
});

test("iOS deployment target remains modern after capability cleanup", () => {
  const targets = [...project.matchAll(/IPHONEOS_DEPLOYMENT_TARGET = ([0-9.]+);/g)].map((match) => match[1]);
  assert.ok(targets.length > 0, "expected iOS deployment targets in Xcode project");
  assert.ok(targets.every((value) => Number(value) >= 15), `unexpected deployment targets: ${targets.join(", ")}`);
});

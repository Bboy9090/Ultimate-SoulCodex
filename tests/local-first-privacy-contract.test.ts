import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("client/src/pages/local-first-input-form.tsx", "utf8");

test("local profile creation keeps online verification opt-in and off by default", () => {
  assert.match(source, /const \[verifyOnline, setVerifyOnline\] = useState\(false\)/);
  assert.match(source, /data-testid="checkbox-online-verification"/);
  assert.match(source, /checked=\{verifyOnline\}/);
  assert.match(source, /if \(verifyOnline\) \{\s*void syncProfileWhenOnline\(data, profile\);\s*\}/s);
  assert.doesNotMatch(source, /if \(!verifyOnline\)[\s\S]{0,200}syncProfileWhenOnline/);
});

test("local-first copy discloses the upload boundary in plain language", () => {
  assert.match(source, /Online verification happens only when you explicitly choose it\./);
  assert.match(source, /Leave this off to keep profile creation on-device only\./);
  assert.match(source, /No profile data was uploaded for verification\./);
  assert.match(source, /Online verification is opt-in/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const createSource = readFileSync("client/src/pages/local-first-input-form.tsx", "utf8");
const profileSource = readFileSync("client/src/pages/offline-profile.tsx", "utf8");

test("local profile creation keeps online verification opt-in and off by default", () => {
  assert.match(createSource, /const \[verifyOnline, setVerifyOnline\] = useState\(false\)/);
  assert.match(createSource, /data-testid="checkbox-online-verification"/);
  assert.match(createSource, /checked=\{verifyOnline\}/);
  assert.match(createSource, /if \(verifyOnline\) \{\s*void syncProfileWhenOnline\(data, profile\);\s*\}/s);
  assert.doesNotMatch(createSource, /if \(!verifyOnline\)[\s\S]{0,200}syncProfileWhenOnline/);
});

test("local-first creation copy discloses the upload boundary in plain language", () => {
  assert.match(createSource, /Online verification happens only when you explicitly choose it\./);
  assert.match(createSource, /Leave this off to keep profile creation on-device only\./);
  assert.match(createSource, /No profile data was uploaded for verification\./);
  assert.match(createSource, /Online verification is opt-in/);
});

test("opening an offline profile never triggers verification as a background effect", () => {
  assert.doesNotMatch(profileSource, /useEffect\s*\(\s*\(\)\s*=>[\s\S]*apiFetch\("\/api\/profiles"/);
  assert.match(profileSource, /const requestOnlineVerification = async \(\) =>/);
  assert.match(profileSource, /data-testid="button-verify-online-profile"/);
  assert.match(profileSource, /onClick=\{\(\) => void requestOnlineVerification\(\)\}/);
});

test("offline profile explains that verification requires an explicit request", () => {
  assert.match(profileSource, /Choosing Verify online sends the saved birth details/);
  assert.match(profileSource, /Merely opening this local profile does not upload it\./);
  assert.match(profileSource, /until you explicitly request independent astronomical verification and it succeeds\./);
});

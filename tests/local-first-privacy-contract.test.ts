import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const createSource = readFileSync("client/src/pages/local-first-input-form.tsx", "utf8");
const profileSource = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
const homeSource = readFileSync("client/src/pages/home.tsx", "utf8");

test("local profile creation keeps online verification opt-in and off by default", () => {
  assert.match(createSource, /const \[verifyOnline, setVerifyOnline\] = useState\(false\)/);
  assert.match(createSource, /data-testid="checkbox-online-verification"/);
  assert.match(createSource, /checked=\{verifyOnline\}/);
  assert.match(createSource, /if \(verifyOnline\) \{[\s\S]*await requestVerificationWhenOnline\(data, profile\);\s*\}/s);
  assert.doesNotMatch(createSource, /if \(!verifyOnline\)[\s\S]{0,200}requestVerificationWhenOnline/);
});

test("local-first creation uses the minimal astronomy-only verification endpoint", () => {
  assert.match(createSource, /"\/api\/verification\/profile"/);
  assert.doesNotMatch(createSource, /apiRequest\("POST", "\/api\/profiles"/);
  assert.match(createSource, /birthDate: data\.birthDate/);
  assert.match(createSource, /timezone: data\.timezone/);
  assert.doesNotMatch(createSource, /name: data\.name/);
  assert.doesNotMatch(createSource, /birthLocation: data\.birthLocation/);
});

test("local-first creation copy discloses the upload boundary in plain language", () => {
  assert.match(createSource, /Three short steps: identity basics, birth details, then an optional verification choice\./);
  assert.match(createSource, /does not create a server profile or invoke AI generation for this check\./);
  assert.match(createSource, /Leave this off to keep profile creation entirely on-device\./);
  assert.match(createSource, /No profile data was uploaded for verification\./);
  assert.match(createSource, /Online verification is opt-in/);
});

test("opening an offline profile never triggers verification as a background effect", () => {
  const refreshEffect = profileSource.match(
    /useEffect\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}, \[id, queryClient\]\);/,
  )?.[1] ?? "";
  assert.ok(refreshEffect, "profile refresh effect must remain inspectable");
  assert.doesNotMatch(refreshEffect, /apiFetch|requestOnlineVerification/);
  assert.match(profileSource, /const requestOnlineVerification = async \(\) =>/);
  assert.match(profileSource, /data-testid="button-verify-online-profile"/);
  assert.match(profileSource, /onClick=\{\(\) => void requestOnlineVerification\(\)\}/);
});

test("an opted-in creation reconciles verification before opening the profile", () => {
  const saveIndex = createSource.indexOf("await requestVerificationWhenOnline(data, profile)");
  const navigateIndex = createSource.indexOf("setLocation(`/profile/${profile.id}`)");

  assert.ok(saveIndex >= 0, "opted-in verification must be awaited");
  assert.ok(navigateIndex > saveIndex, "profile navigation must happen after reconciliation");
  assert.match(profileSource, /soulcodex:profile-updated/);
  assert.match(profileSource, /invalidateQueries\(\{ queryKey: \["offline-profile", id\] \}\)/);
});

test("offline profile verification sends only calculation inputs and explains the boundary", () => {
  assert.match(profileSource, /apiFetch\("\/api\/verification\/profile"/);
  assert.match(profileSource, /birthDate: currentProfile\.birthDate/);
  assert.match(profileSource, /timezone: currentProfile\.timezone/);
  assert.doesNotMatch(profileSource, /name: currentProfile\.name/);
  assert.doesNotMatch(profileSource, /birthLocation: currentProfile\.birthLocation/);
  assert.match(profileSource, /It does not create a server profile or invoke AI generation\./);
  assert.match(profileSource, /Merely opening this local profile does not upload it\./);
  assert.match(profileSource, /until you explicitly request independent astronomical verification and it succeeds\./);
});


test("first-time profile creation uses three progressive steps instead of one dense form", () => {
  assert.match(createSource, /const \[step, setStep\] = useState<1 \| 2 \| 3>\(1\)/);
  assert.match(createSource, /Step \{step\} of 3/);
  assert.match(createSource, /Identity basics/);
  assert.match(createSource, /Birth details/);
  assert.match(createSource, /Verify and create/);
  assert.match(createSource, /data-testid="button-onboarding-next"/);
  assert.match(createSource, /form\.trigger\(\["name", "birthDate", "birthTime", "fullBirthName"\]\)/);
  assert.match(createSource, /form\.trigger\(\["birthLocation", "timezone", "latitude", "longitude"\]\)/);
  assert.match(createSource, /step === 3/);
  assert.match(createSource, /data-testid="button-create-profile"/);
});


test("fresh installs enter the stepped onboarding flow after profile hydration", () => {
  assert.match(homeSource, /const \{ profile, isHydrated, isEmpty \} = useActiveProfile\(\)/);
  assert.match(homeSource, /if \(isHydrated && isEmpty\) setLocation\("\/create"\)/);
  assert.match(homeSource, /if \(!isHydrated \|\| isEmpty\)/);
  assert.match(homeSource, /Opening profile setup/);
});

test("local profile front-loads daily guidance before supporting copy", () => {
  assert.match(profileSource, /function splitDailyGuidance\(value: string\)/);
  assert.match(profileSource, /data-testid="daily-guidance-card"/);
  assert.match(profileSource, /data-testid="daily-guidance-headline"/);
  assert.match(profileSource, /dailyGuidance\.headline/);
  assert.match(profileSource, /dailyGuidance\.detail/);
  assert.doesNotMatch(profileSource, /<p className="text-sm leading-7 text-\[var\(--sc-ivory-soft\)\]">\{profile\.dailyGuidance\}<\/p>/);
});

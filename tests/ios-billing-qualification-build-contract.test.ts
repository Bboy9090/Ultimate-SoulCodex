import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const bootstrap = readFileSync("ios/App/ci_scripts/ci_post_clone.sh", "utf8");
const parity = readFileSync(".github/workflows/xcode-cloud-bootstrap-parity.yml", "utf8");
const qualificationParity = readFileSync(".github/workflows/ios-billing-qualification-parity.yml", "utf8");
const billing = readFileSync("server/billing.ts", "utf8");
const client = readFileSync("client/src/lib/nativeBilling.ts", "utf8");

test("qualification build requires two explicit client-side switches", () => {
  assert.match(bootstrap, /VITE_BILLING_QUALIFICATION_MODE/);
  assert.match(bootstrap, /SOUL_CODEX_IOS_QUALIFICATION_BUILD/);
  assert.match(bootstrap, /Refusing to enable billing qualification mode/);
  assert.match(bootstrap, /must be true or false/);
});

test("normal release parity proves qualification mode is off", () => {
  assert.match(parity, /VITE_BILLING_QUALIFICATION_MODE: "false"/);
  assert.match(parity, /SOUL_CODEX_IOS_QUALIFICATION_BUILD: "false"/);
  assert.match(parity, /Prove normal release bootstrap is not a billing qualification build/);
});

test("server qualification path remains separate from production iOS billing", () => {
  assert.match(billing, /SOUL_CODEX_PLUS_IOS_QUALIFICATION_ENABLED/);
  assert.match(billing, /SOUL_CODEX_PLUS_IOS_BILLING_ENABLED/);
  assert.match(billing, /verifiedEvent\.environment !== "sandbox"/);
  assert.match(billing, /native_billing_qualification_requires_sandbox/);
});

test("qualification marker is sent only by qualification builds", () => {
  assert.match(client, /import\.meta\.env\.VITE_BILLING_QUALIFICATION_MODE === "true"/);
  assert.match(client, /X-SoulCodex-Billing-Qualification/);
});


test("dedicated qualification parity proves both build markers are on", () => {
  assert.match(qualificationParity, /VITE_BILLING_QUALIFICATION_MODE: "true"/);
  assert.match(qualificationParity, /SOUL_CODEX_IOS_QUALIFICATION_BUILD: "true"/);
  assert.match(qualificationParity, /Run real Xcode Cloud post-clone bootstrap in qualification mode/);
  assert.match(qualificationParity, /Create unsigned qualification device archive/);
  assert.match(qualificationParity, /ios-billing-qualification-cors-contract\.test\.ts/);
  assert.match(qualificationParity, /native-billing-server-verification-contract\.test\.ts/);
});

test("normal and qualification parity lanes cannot collapse into one mode", () => {
  assert.match(parity, /VITE_BILLING_QUALIFICATION_MODE: "false"/);
  assert.match(parity, /SOUL_CODEX_IOS_QUALIFICATION_BUILD: "false"/);
  assert.match(qualificationParity, /VITE_BILLING_QUALIFICATION_MODE: "true"/);
  assert.match(qualificationParity, /SOUL_CODEX_IOS_QUALIFICATION_BUILD: "true"/);
});

test("qualification checkout, embedded release identity, and receipt use the exact candidate", () => {
  assert.match(qualificationParity, /CANDIDATE_SHA: \$\{\{ github.event.pull_request.head.sha \|\| github.sha \}\}/);
  assert.match(qualificationParity, /VITE_RELEASE_SHA: \$\{\{ github.event.pull_request.head.sha \|\| github.sha \}\}/);
  assert.match(qualificationParity, /ref: \$\{\{ env.CANDIDATE_SHA \}\}/);
  assert.match(qualificationParity, /test "\$\(git rev-parse HEAD\)" = "\$CANDIDATE_SHA"/);
  assert.match(qualificationParity, /echo "SHA=\$CANDIDATE_SHA"/);
  assert.doesNotMatch(qualificationParity, /echo "SHA=\$GITHUB_SHA"/);
});

test("always-uploaded qualification receipt distinguishes failed jobs and unsigned builds from purchase evidence", () => {
  assert.match(qualificationParity, /QUALIFICATION_JOB_STATUS: \$\{\{ job.status \}\}/);
  assert.match(qualificationParity, /echo "job_status=\$QUALIFICATION_JOB_STATUS"/);
  assert.match(qualificationParity, /archive_signing=unsigned/);
  assert.match(qualificationParity, /provider_transactions=not_tested/);
});

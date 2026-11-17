import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

// @ts-ignore -- plain ESM release script without type declarations
import { publishClosedTesting, resolvePlan } from "../scripts/publish-play-closed-testing.mjs";

const SHA = "75d6200dc96caa8ef394e9c842b23c412292ee24";

function env(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    PLAY_PUBLISH_MODE: "validate",
    EXPECTED_VERSION_CODE: "4000019",
    EXPECTED_VERSION_NAME: "4.1.2",
    CANDIDATE_SHA: SHA,
    SOURCE_RUN_ID: "43948457688",
    AAB_PATH: "app-release.aab",
    RECEIPT_PATH: "receipt.json",
    ...overrides,
  };
}

type Call = { method: string; url: string; body: unknown };

// Test-only stand-in for the Google Play API; the production path uses global fetch.
function fakePlay(aab: Buffer, overrides: Record<string, { status: number; body: unknown }> = {}) {
  const calls: Call[] = [];
  const fetchImpl = async (url: string, init: { method: string; body?: unknown }) => {
    calls.push({ method: init.method, url, body: init.body });
    const path = new URL(url).pathname;
    const key = `${init.method} ${path}`;
    const match = Object.keys(overrides).find((suffix) => key.endsWith(suffix));
    let status = 200;
    let body: unknown = {};
    if (match) {
      ({ status, body } = overrides[match]);
    } else if (key.endsWith("/edits")) {
      body = { id: "edit-1" };
    } else if (key.endsWith("/bundles")) {
      body = { versionCode: 4000019, sha256: createHash("sha256").update(aab).digest("hex") };
    } else if (init.method === "PUT") {
      body = JSON.parse(String(init.body));
    } else if (key.endsWith(":commit")) {
      body = { id: "edit-1" };
    }
    return new Response(init.method === "DELETE" ? null : JSON.stringify(body), { status: init.method === "DELETE" && status === 200 ? 204 : status });
  };
  return { calls, fetchImpl };
}

test("plan refuses anything other than the closed testing track for soulcodex.app", () => {
  assert.equal(resolvePlan(env()).track, "alpha");
  for (const track of ["production", "beta", "internal", "Alpha", ""]) {
    assert.throws(() => resolvePlan(env({ PLAY_TRACK: track })), /only publishes to closed testing/);
  }
  assert.throws(() => resolvePlan(env({ PLAY_PACKAGE_NAME: "other.app" })), /Refusing package/);
  assert.throws(() => resolvePlan(env({ PLAY_PUBLISH_MODE: "production" })), /PLAY_PUBLISH_MODE/);
  assert.throws(() => resolvePlan(env({ CANDIDATE_SHA: "75d6200d" })), /full 40-character/);
  assert.throws(() => resolvePlan(env({ EXPECTED_VERSION_CODE: "" })), /EXPECTED_VERSION_CODE is required/);
});

test("validate mode never commits and discards the edit", async () => {
  const aab = Buffer.from("signed-bundle");
  const { calls, fetchImpl } = fakePlay(aab);
  const receipt = await publishClosedTesting({ plan: resolvePlan(env()), token: "t", aab, fetchImpl });

  assert.equal(receipt.outcome, "validated_not_committed");
  assert.equal(receipt.committed, false);
  assert.equal(receipt.editDiscarded, true);
  assert.equal(receipt.candidateSha, SHA);
  assert.ok(!calls.some((call) => call.url.includes(":commit")));
  assert.ok(calls.some((call) => call.url.endsWith(":validate")));
  assert.equal(calls.at(-1)?.method, "DELETE");
  assert.ok(!JSON.stringify(receipt).includes('"t"'));
});

test("commit mode releases only the expected versionCode to the alpha track", async () => {
  const aab = Buffer.from("signed-bundle");
  const { calls, fetchImpl } = fakePlay(aab);
  const receipt = await publishClosedTesting({
    plan: resolvePlan(env({ PLAY_PUBLISH_MODE: "commit" })),
    token: "t",
    aab,
    fetchImpl,
  });

  assert.equal(receipt.outcome, "committed_to_closed_testing");
  assert.equal(receipt.committed, true);
  const trackCalls = calls.filter((call) => call.url.includes("/tracks/"));
  assert.equal(trackCalls.length, 1);
  assert.match(trackCalls[0].url, /\/applications\/soulcodex\.app\/edits\/edit-1\/tracks\/alpha$/);
  assert.deepEqual(JSON.parse(String(trackCalls[0].body)), {
    track: "alpha",
    releases: [{ name: "Soul Codex 4.1.2 (4000019) Closed Testing", versionCodes: ["4000019"], status: "completed" }],
  });
  assert.ok(!calls.some((call) => call.method === "DELETE"));
  const commitCalls = calls.filter((call) => call.url.includes(":commit"));
  assert.equal(commitCalls.length, 1);
  assert.equal(new URL(commitCalls[0].url).searchParams.get("changesInReviewBehavior"), "ERROR_IF_IN_REVIEW");
  for (const call of calls) {
    assert.doesNotMatch(call.url, /production|inappproducts|subscriptions|monetization/);
  }
});

test("a bundle with an unexpected versionCode is never assigned to a track or committed", async () => {
  const aab = Buffer.from("signed-bundle");
  const { calls, fetchImpl } = fakePlay(aab, { "/bundles": { status: 200, body: { versionCode: 4000020 } } });
  const receipt = await publishClosedTesting({
    plan: resolvePlan(env({ PLAY_PUBLISH_MODE: "commit" })),
    token: "t",
    aab,
    fetchImpl,
  });

  assert.equal(receipt.outcome, "failed");
  assert.match(receipt.error.message, /expected 4000019/);
  assert.ok(!calls.some((call) => call.url.includes("/tracks/") || call.url.includes(":commit")));
  assert.equal(receipt.editDiscarded, true);
});

test("provider rejection is recorded as a failure with the provider body", async () => {
  const aab = Buffer.from("signed-bundle");
  const providerBody = { error: { code: 403, message: "The caller does not have permission" } };
  const { fetchImpl } = fakePlay(aab, { "/edits": { status: 403, body: providerBody } });
  const receipt = await publishClosedTesting({ plan: resolvePlan(env()), token: "t", aab, fetchImpl });

  assert.equal(receipt.outcome, "failed");
  assert.equal(receipt.error.status, 403);
  assert.deepEqual(receipt.error.providerBody, providerBody);
  assert.equal(receipt.committed, false);
});

test("upload workflow is manual, main-only, exact-candidate, and closed-testing-only", async () => {
  const workflow = await readFile(".github/workflows/play-closed-testing-upload.yml", "utf8");
  const android = await readFile("android/app/build.gradle", "utf8");
  const candidate = await readFile(".github/workflows/store-4.0.0-release.yml", "utf8");

  const triggers = workflow.slice(workflow.indexOf("\non:"), workflow.indexOf("\npermissions:"));
  assert.match(triggers, /workflow_dispatch:/);
  assert.doesNotMatch(triggers, /^\s{2}(push|pull_request|pull_request_target|schedule|workflow_run):/m);

  assert.match(workflow, /github\.repository == 'Bboy9090\/Ultimate-SoulCodex' && github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /PLAY_TRACK: alpha/);
  assert.doesNotMatch(workflow, /PLAY_TRACK: (?!alpha)/);
  assert.doesNotMatch(workflow, /gradlew|bundleRelease|ANDROID_KEYSTORE|GOOGLE_PLAY_SERVICE_ACCOUNT_JSON/);
  assert.match(workflow, /default: validate/);
  assert.match(workflow, /"\$CONFIRM" != "closed-testing \$EXPECTED_VERSION_CODE"/);

  assert.match(workflow, /git merge-base --is-ancestor "\$CANDIDATE_SHA" HEAD/);
  for (const field of [".head_sha", ".head_branch main", ".event push", ".conclusion success", ".path"]) {
    assert.ok(workflow.includes(`check ${field}`), `missing source-run check: ${field}`);
  }
  assert.match(workflow, /sha256sum -c AAB-SHA256\.txt/);
  assert.match(workflow, /jarsigner -verify/);
  assert.match(workflow, /signing_available=true/);

  // User-controlled inputs reach shell only through env, never by direct interpolation.
  for (const block of workflow.split(/\n\s+- name: /).slice(1)) {
    const run = block.split(/\n\s+run: /)[1];
    if (run) assert.doesNotMatch(run, /\$\{\{\s*inputs\./);
  }

  // Version identity stays aligned with the Android source and the qualifying workflow.
  const versionCode = /EXPECTED_VERSION_CODE: "(\d+)"/.exec(workflow)?.[1];
  const versionName = /EXPECTED_VERSION_NAME: ([\d.]+)/.exec(workflow)?.[1];
  assert.ok(versionCode && versionName);
  assert.match(android, new RegExp(`versionCode\\s+${versionCode}\\b`));
  assert.match(android, new RegExp(`versionName\\s+"${versionName!.replaceAll(".", "\\.")}"`));
  const artifact = /SOURCE_ARTIFACT_NAME: (\S+)/.exec(workflow)?.[1];
  assert.ok(artifact && candidate.includes(`name: ${artifact}`));
  assert.ok(candidate.includes(`echo "versionCode=${versionCode}"`));

  // The qualifying workflow itself still never publishes.
  assert.doesNotMatch(candidate, /publish-play-closed-testing/);
  assert.match(candidate, /production_publish_attempted=false/);
});

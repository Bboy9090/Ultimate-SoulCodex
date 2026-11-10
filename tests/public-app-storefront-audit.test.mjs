import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { inspectPublicStorefront, parsePublicAppStoreHtml } from "../scripts/audit-public-app-storefront.mjs";

const exampleHtml = `
<div><span>Age Rating</span></div><div><span>9+</span></div>
<a class="privacy" aria-label="Developer’s Privacy Policy" href="https://soulcodex.up.railway.app/privacy">privacy</a>`;

test("public listing parser finds the labelled privacy URL and age rating", () => {
  assert.deepEqual(parsePublicAppStoreHtml(exampleHtml), {
    privacyPolicyUrl: "https://soulcodex.up.railway.app/privacy",
    ageRating: "9+",
    parseStatus: "observed",
  });
});

test("public parser refuses to treat an arbitrary URL as the Apple privacy policy", () => {
  const html = '<a href="https://bboy9090.github.io/Ultimate-SoulCodex/privacy/">unrelated</a><span>Age Rating</span><span>13+</span>';
  assert.equal(parsePublicAppStoreHtml(html).parseStatus, "incomplete");
  assert.equal(parsePublicAppStoreHtml(html).privacyPolicyUrl, null);
});

test("public store audit separates reachable legal pages from stale App Store metadata", async () => {
  const mockFetch = async (url) => new Response(url.includes("apps.apple.com") ? exampleHtml : "ok", { status: 200 });
  const receipt = await inspectPublicStorefront(mockFetch);
  assert.equal(receipt.status, "ACTION_REQUIRED");
  assert.equal(receipt.observed.ageRating, "9+");
  assert.equal(receipt.publicAgeRatingReviewRequired, true);
  assert.equal(receipt.publicPrivacyUrlMatches, false);
  assert.equal(receipt.legal.privacy.reachable, true);
  assert.equal(receipt.legal.support.reachable, true);
  assert.equal(receipt.legal["account-deletion"].reachable, true);
  assert.equal(receipt.appStoreConnectPrivacyQualified, false);
  assert.equal(receipt.binarySubmissionQualified, false);
});

test("public store audit leaves missing Apple markup as INCOMPLETE, not success", async () => {
  const mockFetch = async (url) => new Response(url.includes("apps.apple.com") ? "<html>unknown layout</html>" : "ok", { status: 200 });
  const receipt = await inspectPublicStorefront(mockFetch);
  assert.equal(receipt.status, "INCOMPLETE");
  assert.equal(receipt.publicPrivacyUrlMatches, false);
  assert.equal(receipt.publicAgeRatingReviewRequired, null);
  assert.equal(receipt.appStoreConnectPrivacyQualified, false);
});

test("public URL alignment never qualifies private App Store Connect metadata", async () => {
  const html = exampleHtml.replace("https://soulcodex.up.railway.app/privacy", "https://bboy9090.github.io/Ultimate-SoulCodex/privacy/");
  const receipt = await inspectPublicStorefront(async (url) => new Response(url.includes("apps.apple.com") ? html : "ok", { status: 200 }));
  assert.equal(receipt.status, "PUBLIC_URL_ALIGNED");
  assert.equal(receipt.publicAgeRatingReviewRequired, true);
  assert.equal(receipt.appStoreConnectPrivacyQualified, false);
  assert.equal(receipt.binarySubmissionQualified, false);
});

test("public legal host failures never emit aligned status", async () => {
  const html = exampleHtml.replace("https://soulcodex.up.railway.app/privacy", "https://bboy9090.github.io/Ultimate-SoulCodex/privacy/");
  const receipt = await inspectPublicStorefront(async (url) => new Response(url.includes("/support/") ? "offline" : url.includes("apps.apple.com") ? html : "ok", {
    status: url.includes("/support/") ? 503 : 200,
  }));
  assert.equal(receipt.status, "INCOMPLETE");
  assert.equal(receipt.legal.support.reachable, false);
});


test("public parser accepts real-world Apple rating badge structure without guessing a private rating", () => {
  const html = `
  <span class="multiline-clamp__text">Age Rating</span> </div></div>
  <div class="badge-dd svelte-qmqa7g" role="definition">
    <span class="svelte-km1qy2">9+</span>
  </div>
  <a class="some-class" aria-label="Developer’s Privacy Policy" data-test-id="external-link"
    href="https://soulcodex.up.railway.app/privacy" target="_blank">privacy</a>`;
  const result = parsePublicAppStoreHtml(html);
  assert.equal(result.ageRating, "9+");
  assert.equal(result.privacyPolicyUrl, "https://soulcodex.up.railway.app/privacy");
  assert.equal(result.parseStatus, "observed");
});

test("a public 13+ badge needs no intended-audience age warning but does not qualify App Store Connect", async () => {
  const html = exampleHtml.replace("9+", "13+").replace(
    "https://soulcodex.up.railway.app/privacy",
    "https://bboy9090.github.io/Ultimate-SoulCodex/privacy/",
  );
  const receipt = await inspectPublicStorefront(async (url) => new Response(
    url.includes("apps.apple.com") ? html : "ok", { status: 200 },
  ));
  assert.equal(receipt.publicAgeRatingReviewRequired, false);
  assert.equal(receipt.status, "PUBLIC_URL_ALIGNED");
  assert.equal(receipt.appStoreConnectPrivacyQualified, false);
});

test("weekly audit fetches only on schedule or explicit dispatch, never on a PR", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/public-app-storefront-disclosure-audit.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /cron: "17 15 \\* \\* 1"/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /if: github\\.event_name != 'pull_request'/);
  assert.match(workflow, /permissions:\\s*\\n  contents: read/);
  assert.doesNotMatch(workflow, /id-token: write|pages: write|track: production|google-github-actions\\/auth/);
  assert.match(workflow, /retention-days: 30/);
});

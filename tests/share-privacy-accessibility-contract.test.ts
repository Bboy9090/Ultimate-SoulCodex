import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shareModalUrl = new URL("../client/src/components/ShareModal.tsx", import.meta.url);
const publicPageUrl = new URL("../client/src/pages/PublicSharedProfilePage.tsx", import.meta.url);
const appUrl = new URL("../client/src/App.tsx", import.meta.url);
const routesUrl = new URL("../server/routes.ts", import.meta.url);

test("share modal never publishes a raw private profile route", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.doesNotMatch(source, /window\.location\.origin}\/profile\//);
  assert.doesNotMatch(source, /\/profile\/\$\{profileId\}/);
  assert.match(source, /\/shared\/\$\{shareToken\}/);
  assert.match(source, /Nothing is shared automatically/);
  assert.match(source, /private profile ID/);
});

test("share modal requires explicit field selection and supports revocation", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /new Set\(\)/);
  assert.match(source, /selected\.size === 0/);
  assert.match(source, /Create revocable public link/);
  assert.match(source, /\/api\/profiles\/\$\{profileId\}\/public-shares/);
  assert.match(source, /method: "DELETE"/);
  assert.match(source, /Public link revoked/);
});

test("share modal exposes accessible dialog semantics and guarded clipboard behavior", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby="share-soul-codex-title"/);
  assert.match(source, /aria-describedby="share-soul-codex-description"/);
  assert.match(source, /aria-label="Close share dialog"/);
  assert.match(source, /aria-label="Copy public Soul Codex link"/);
  assert.match(source, /await navigator\.clipboard\.writeText\(shareUrl\)/);
  assert.match(source, /typeof navigator\.share === "function"/);
});

test("share dialog manages keyboard focus lifecycle", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /closeButtonRef\.current\?\.focus\(\)/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /document\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /document\.removeEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /previouslyFocused\?\.focus\(\)/);
});

test("public viewer is routed separately and fetches only the public-share endpoint", async () => {
  const [page, app] = await Promise.all([
    readFile(publicPageUrl, "utf8"),
    readFile(appUrl, "utf8"),
  ]);

  assert.match(app, /<Route path="\/shared\/:token" component=\{PublicSharedProfilePage\} \/>/);
  assert.match(page, /\/api\/public-shares\/\$\{encodeURIComponent\(String\(token\)\)\}/);
  assert.doesNotMatch(page, /\/api\/profiles\//);
  assert.match(page, /credentials: "omit"/);
  assert.match(page, /cache: "no-store"/);
});

test("server public-share API stores sanitized snapshots and treats revoked links as unavailable", async () => {
  const source = await readFile(routesUrl, "utf8");

  assert.match(source, /buildPublicProfileProjection\(profile, selection\)/);
  assert.match(source, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.match(source, /createPublicProfileShare\(profile\.id, token, snapshot\)/);
  assert.match(source, /if \(!share \|\| share\.revokedAt\) return profileNotFound\(res\)/);
  assert.match(source, /Cache-Control", "no-store, max-age=0"/);
});


test("public share management exposes owned history and dedicated abuse controls", async () => {
  const [routes, storage, modal] = await Promise.all([
    readFile(routesUrl, "utf8"),
    readFile(new URL("../server/storage.ts", import.meta.url), "utf8"),
    readFile(shareModalUrl, "utf8"),
  ]);

  assert.match(routes, /publicShareReadLimiter/);
  assert.match(routes, /publicShareMutationLimiter/);
  assert.match(routes, /limit: 120/);
  assert.match(routes, /limit: 30/);
  assert.match(routes, /activeShareCount >= 10/);
  assert.match(routes, /public_share_active_limit/);
  assert.match(routes, /app\.get\("\/api\/profiles\/:id\/public-shares"/);

  assert.match(storage, /listPublicProfileShares\(profileId: string, limit\?: number\)/);
  assert.match(storage, /orderBy\(desc\(publicProfileShares\.createdAt\)\)/);

  assert.match(modal, /Your public links/);
  assert.match(modal, /Active/);
  assert.match(modal, /Revoked/);
  assert.match(modal, /revokePublicShare\(item\.token\)/);
});


test("public share viewer stays out of search indexes and mobile share checks payload capability", async () => {
  const [page, modal] = await Promise.all([
    readFile(publicPageUrl, "utf8"),
    readFile(shareModalUrl, "utf8"),
  ]);

  assert.match(page, /noindex,nofollow,noarchive/);
  assert.match(page, /meta\[name="robots"\]/);
  assert.match(page, /Create your Soul Codex/);

  assert.match(modal, /typeof navigator\.canShare !== "function" \|\| navigator\.canShare\(shareData\)/);
  assert.match(modal, /pb-\[max\(1\.25rem,env\(safe-area-inset-bottom\)\)\]/);
  assert.match(modal, /Share sheet unavailable/);
});


test("share modal traps keyboard focus and never disguises history load failure as empty history", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /dialogRef\.current/);
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /last\.focus\(\)/);
  assert.match(source, /first\.focus\(\)/);
  assert.match(source, /setHistoryError\(true\)/);
  assert.match(source, /Existing links may still be active/);
  assert.match(source, /!historyError && shareHistory\.length === 0/);
});

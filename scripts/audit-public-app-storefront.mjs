import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export const PUBLIC_APP_STORE_URL = "https://apps.apple.com/us/app/soul-codex/id6764221944";
export const CANONICAL_LEGAL_BASE = "https://bboy9090.github.io/Ultimate-SoulCodex";
export const LEGAL_ROUTES = ["privacy", "support", "account-deletion"];

export function parsePublicAppStoreHtml(html) {
  if (typeof html !== "string" || !html.includes("Developer")) {
    return { privacyPolicyUrl: null, ageRating: null, parseStatus: "incomplete" };
  }
  // Attribute order can change; match the *privacy-policy-labelled* anchor only.
  const anchor = [...html.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => tag).find(
    (tag) => /aria-label\s*=\s*["']Developer(?:&#8217;|&rsquo;|['’])s Privacy Policy["']/i.test(tag),
  );
  const href = anchor?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, "&") ?? null;
  const ageRating = html.match(/Age Rating<\/span>[\s\S]{0,400}?<span[^>]*>\s*(\d{1,2}\+)\s*<\/span>/i)?.[1] ?? null;
  return {
    privacyPolicyUrl: href,
    ageRating,
    parseStatus: href && ageRating ? "observed" : "incomplete",
  };
}

export async function inspectPublicStorefront(fetchImpl = fetch) {
  const checkedAt = new Date().toISOString();
  const request = async (url) => {
    try {
      const response = await fetchImpl(url, {
        headers: { "User-Agent": "SoulCodex-Release-Compliance-Audit/1.0" },
        signal: AbortSignal.timeout(15000),
        redirect: "follow",
      });
      return { ok: response.ok, status: response.status, response };
    } catch (error) {
      return { ok: false, status: null, error: String(error?.message ?? error) };
    }
  };
  const canonicalPrivacyUrl = `${CANONICAL_LEGAL_BASE}/privacy/`;
  const legal = {};
  for (const route of LEGAL_ROUTES) {
    const result = await request(`${CANONICAL_LEGAL_BASE}/${route}/`);
    legal[route] = { httpStatus: result.status, reachable: result.ok, ...(result.error ? { error: result.error } : {}) };
  }
  const listing = await request(PUBLIC_APP_STORE_URL);
  let parsed = { privacyPolicyUrl: null, ageRating: null, parseStatus: "unavailable" };
  if (listing.ok) {
    try {
      parsed = parsePublicAppStoreHtml(await listing.response.text());
    } catch {
      parsed = { privacyPolicyUrl: null, ageRating: null, parseStatus: "incomplete" };
    }
  }
  const canonicalHostReady = LEGAL_ROUTES.every((route) => legal[route].reachable);
  const publicPrivacyUrlMatches = parsed.privacyPolicyUrl === canonicalPrivacyUrl;
  // Intended audience is 13+ in the submission packet. The public age badge
  // can differ from product intent and must be reviewed in App Store Connect;
  // public HTML alone cannot establish a policy violation or an approved rating.
  const publicAgeRatingReviewRequired =
    /^\d+\+$/.test(parsed.ageRating ?? "")
      ? Number.parseInt(parsed.ageRating, 10) < 13
      : null;
  const status = !listing.ok || !canonicalHostReady || parsed.parseStatus !== "observed"
    ? "INCOMPLETE"
    : publicPrivacyUrlMatches ? "PUBLIC_URL_ALIGNED" : "ACTION_REQUIRED";
  return {
    checkedAt,
    source: "public_read_only",
    listingUrl: PUBLIC_APP_STORE_URL,
    listingHttpStatus: listing.status,
    canonicalPrivacyUrl,
    legal,
    observed: parsed,
    publicPrivacyUrlMatches,
    publicAgeRatingReviewRequired,
    status,
    // Public HTML cannot prove private App Store Connect metadata, privacy selections,
    // exact binary under review, age questionnaire, subscription approval or submission.
    appStoreConnectPrivacyQualified: false,
    binarySubmissionQualified: false,
  };
}

async function main() {
  const report = await inspectPublicStorefront();
  const path = process.env.SOUL_CODEX_PUBLIC_STORE_REPORT || "artifacts/public-app-storefront-audit.json";
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(JSON.stringify({
    status: report.status,
    listingHttpStatus: report.listingHttpStatus,
    publicPrivacyUrlMatches: report.publicPrivacyUrlMatches,
    ageRating: report.observed.ageRating,
    publicAgeRatingReviewRequired: report.publicAgeRatingReviewRequired,
    report: path,
  }) + "\n");
  if (report.publicAgeRatingReviewRequired) {
    process.stdout.write("::warning::Public Apple age badge is below the product’s intended 13+ audience; verify the live App Store Connect questionnaire.\\n");
  }
  if (report.status !== "PUBLIC_URL_ALIGNED") {
    process.stdout.write("::warning::Public App Store listing or legal pages require manual reconciliation; private App Store Connect state is NOT verified.\n");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error("Public surface audit failed:", error?.message ?? String(error));
    process.exitCode = 1;
  });
}

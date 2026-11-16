#!/usr/bin/env node
// Uploads an already-signed, already-qualified Android App Bundle to the Google Play
// closed testing track and writes the provider responses to a receipt file.
//
// Boundaries (enforced here, and by tests/play-closed-testing-publish-contract.test.ts):
// - the only track this script can touch is the closed testing track ("alpha");
// - it never builds, signs, or modifies the bundle;
// - it never touches production, rollout percentages, in-app products, or subscriptions;
// - "validate" mode asks Play to validate the edit and then discards it without committing.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const PACKAGE_NAME = "soulcodex.app";
export const CLOSED_TESTING_TRACK = "alpha";
export const MODES = Object.freeze(["validate", "commit"]);

const API_ROOT = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";
const UPLOAD_ROOT = "https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications";

export function resolvePlan(env) {
  const required = (name) => {
    const value = (env[name] ?? "").trim();
    if (!value) throw new Error(`${name} is required.`);
    return value;
  };

  const track = (env.PLAY_TRACK ?? CLOSED_TESTING_TRACK).trim();
  if (track !== CLOSED_TESTING_TRACK) {
    throw new Error(`Refusing track "${track}": this script only publishes to closed testing ("${CLOSED_TESTING_TRACK}").`);
  }

  const packageName = (env.PLAY_PACKAGE_NAME ?? PACKAGE_NAME).trim();
  if (packageName !== PACKAGE_NAME) {
    throw new Error(`Refusing package "${packageName}": expected "${PACKAGE_NAME}".`);
  }

  const mode = required("PLAY_PUBLISH_MODE");
  if (!MODES.includes(mode)) {
    throw new Error(`PLAY_PUBLISH_MODE must be one of: ${MODES.join(", ")}.`);
  }

  const versionCode = required("EXPECTED_VERSION_CODE");
  if (!/^[1-9][0-9]{0,9}$/.test(versionCode)) {
    throw new Error("EXPECTED_VERSION_CODE must be a positive integer.");
  }

  const versionName = required("EXPECTED_VERSION_NAME");
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(versionName)) {
    throw new Error("EXPECTED_VERSION_NAME must look like 1.2.3.");
  }

  const candidateSha = required("CANDIDATE_SHA");
  if (!/^[0-9a-f]{40}$/.test(candidateSha)) {
    throw new Error("CANDIDATE_SHA must be a full 40-character commit SHA.");
  }

  return {
    packageName,
    track,
    mode,
    versionCode,
    versionName,
    candidateSha,
    sourceRunId: (env.SOURCE_RUN_ID ?? "").trim() || null,
    aabPath: required("AAB_PATH"),
    receiptPath: required("RECEIPT_PATH"),
    releaseName: `Soul Codex ${versionName} (${versionCode}) Closed Testing`,
  };
}

async function callPlay(fetchImpl, token, method, url, { body, contentType } = {}) {
  const headers = { Authorization: `Bearer ${token}` };
  if (contentType) headers["Content-Type"] = contentType;
  const response = await fetchImpl(url, { method, headers, body });
  const raw = await response.text();
  let parsed = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { nonJsonBody: raw.slice(0, 2000) };
    }
  }
  if (!response.ok) {
    const error = new Error(`Google Play API ${method} ${new URL(url).pathname} failed with HTTP ${response.status}.`);
    error.status = response.status;
    error.providerBody = parsed;
    throw error;
  }
  return parsed;
}

export async function publishClosedTesting({ plan, token, aab, fetchImpl = fetch, now = () => new Date() }) {
  if (!token) throw new Error("A Google Play access token is required.");

  const receipt = {
    receiptType: "google-play-closed-testing-upload",
    startedAt: now().toISOString(),
    packageName: plan.packageName,
    track: plan.track,
    mode: plan.mode,
    candidateSha: plan.candidateSha,
    sourceRunId: plan.sourceRunId,
    expectedVersionCode: plan.versionCode,
    expectedVersionName: plan.versionName,
    aabSha256: createHash("sha256").update(aab).digest("hex"),
    aabBytes: aab.length,
    productionTouched: false,
    billingCatalogTouched: false,
    committed: false,
    outcome: "incomplete",
  };

  const app = `${API_ROOT}/${plan.packageName}`;
  let editId = null;

  try {
    const edit = await callPlay(fetchImpl, token, "POST", `${app}/edits`, {
      body: "{}",
      contentType: "application/json",
    });
    editId = edit?.id;
    if (!editId) throw new Error("Google Play did not return an edit id.");
    receipt.editId = editId;

    const bundle = await callPlay(
      fetchImpl,
      token,
      "POST",
      `${UPLOAD_ROOT}/${plan.packageName}/edits/${editId}/bundles?uploadType=media`,
      { body: aab, contentType: "application/octet-stream" },
    );
    receipt.bundle = bundle;
    if (String(bundle?.versionCode) !== plan.versionCode) {
      throw new Error(
        `Google Play read versionCode ${bundle?.versionCode} from the bundle; expected ${plan.versionCode}.`,
      );
    }
    if (bundle?.sha256 && bundle.sha256.toLowerCase() !== receipt.aabSha256) {
      throw new Error("Google Play reported a bundle SHA-256 that differs from the uploaded file.");
    }

    receipt.trackUpdate = await callPlay(fetchImpl, token, "PUT", `${app}/edits/${editId}/tracks/${plan.track}`, {
      body: JSON.stringify({
        track: plan.track,
        releases: [{ name: plan.releaseName, versionCodes: [plan.versionCode], status: "completed" }],
      }),
      contentType: "application/json",
    });

    if (plan.mode === "commit") {
      receipt.commit = await callPlay(fetchImpl, token, "POST", `${app}/edits/${editId}:commit`);
      receipt.committed = true;
      receipt.outcome = "committed_to_closed_testing";
    } else {
      receipt.validation = await callPlay(fetchImpl, token, "POST", `${app}/edits/${editId}:validate`);
      receipt.outcome = "validated_not_committed";
    }
  } catch (error) {
    receipt.outcome = "failed";
    receipt.error = {
      message: error instanceof Error ? error.message : String(error),
      status: error?.status ?? null,
      providerBody: error?.providerBody ?? null,
    };
  }

  // An uncommitted edit is discarded so nothing is left pending in the Play Console.
  if (editId && !receipt.committed) {
    try {
      await callPlay(fetchImpl, token, "DELETE", `${app}/edits/${editId}`);
      receipt.editDiscarded = true;
    } catch (error) {
      receipt.editDiscarded = false;
      receipt.editDiscardError = error instanceof Error ? error.message : String(error);
    }
  }

  receipt.finishedAt = now().toISOString();
  return receipt;
}

async function main() {
  const plan = resolvePlan(process.env);
  const token = (process.env.PLAY_ACCESS_TOKEN ?? "").trim();
  const aab = await readFile(plan.aabPath);
  const receipt = await publishClosedTesting({ plan, token, aab });
  await writeFile(plan.receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`Receipt written to ${plan.receiptPath}: outcome=${receipt.outcome}`);
  if (receipt.outcome === "failed") {
    console.error(receipt.error.message);
    if (receipt.error.providerBody) console.error(JSON.stringify(receipt.error.providerBody, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

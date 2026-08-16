import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_FOUNDATION_RELEASE_VERSION,
  FOUNDATION_API_CONTRACT,
  resolveReleaseIdentity,
} from "../server/lib/release-identity";

describe("release identity contract", () => {
  it("keeps an unknown deployment SHA visible instead of fabricating exact evidence", () => {
    const identity = resolveReleaseIdentity({});
    assert.equal(identity.status, "ok");
    assert.equal(identity.releaseSha, "unknown");
    assert.equal(identity.appVersion, DEFAULT_FOUNDATION_RELEASE_VERSION);
    assert.equal(identity.apiContract, FOUNDATION_API_CONTRACT);
  });

  it("uses Railway's Git commit SHA when supplied by the deployment runtime", () => {
    const identity = resolveReleaseIdentity({
      RAILWAY_GIT_COMMIT_SHA: "railway-commit-sha",
    });
    assert.equal(identity.releaseSha, "railway-commit-sha");
  });

  it("allows an explicit release SHA to override provider-derived identity", () => {
    const identity = resolveReleaseIdentity({
      SOUL_CODEX_RELEASE_SHA: "explicit-candidate",
      RAILWAY_GIT_COMMIT_SHA: "railway-candidate",
    });
    assert.equal(identity.releaseSha, "explicit-candidate");
  });

  it("allows release version injection without changing the API contract", () => {
    const identity = resolveReleaseIdentity({
      SOUL_CODEX_RELEASE_VERSION: "4.0.0-rc.3+staging",
      SOUL_CODEX_RELEASE_SHA: "abc123",
    });
    assert.equal(identity.appVersion, "4.0.0-rc.3+staging");
    assert.equal(identity.apiContract, "foundation-v4");
  });
});

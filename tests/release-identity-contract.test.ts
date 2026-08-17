import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FOUNDATION_API_CONTRACT, releaseIdentity } from "../server/lib/release-identity";

describe("release identity contract", () => {
  it("reports a stable API contract and non-secret release metadata", () => {
    const identity = releaseIdentity();
    assert.equal(identity.status, "ok");
    assert.equal(identity.apiContract, FOUNDATION_API_CONTRACT);
    assert.equal(identity.apiContract, "foundation-v4");
    assert.equal(typeof identity.appVersion, "string");
    assert.ok(identity.appVersion.length > 0);
    assert.equal(typeof identity.releaseSha, "string");
    assert.ok(identity.releaseSha.length > 0);
    assert.equal(Object.prototype.hasOwnProperty.call(identity, "databaseUrl"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(identity, "secret"), false);
  });
});

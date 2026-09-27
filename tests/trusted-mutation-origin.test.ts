import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedMutationOrigin } from "../server/lib/trusted-mutation-origin";

const allowed = [
  "https://soulcodex.up.railway.app",
  "https://localhost",
  "capacitor://localhost",
];

test("safe reads are not blocked by mutation-origin policy", () => {
  assert.equal(isTrustedMutationOrigin("GET", undefined, true, allowed), true);
});

test("session-backed mutations require a trusted Origin", () => {
  assert.equal(isTrustedMutationOrigin("POST", undefined, true, allowed), false);
  assert.equal(isTrustedMutationOrigin("DELETE", "https://evil.example", true, allowed), false);
  assert.equal(isTrustedMutationOrigin("POST", "https://soulcodex.up.railway.app", true, allowed), true);
  assert.equal(isTrustedMutationOrigin("POST", "https://localhost", true, allowed), true);
});

test("non-session mutations remain available for first-contact APIs", () => {
  assert.equal(isTrustedMutationOrigin("POST", undefined, false, allowed), true);
  assert.equal(isTrustedMutationOrigin("POST", "https://evil.example", false, allowed), true);
});

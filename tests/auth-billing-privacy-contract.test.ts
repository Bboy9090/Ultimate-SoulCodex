import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const auth = readFileSync(new URL("../server/routes/consumer-auth.ts", import.meta.url), "utf8");

test("authenticated user projection excludes internal billing state", () => {
  for (const field of [
    "stripeCustomerId",
    "stripeSubscriptionId",
    "subscriptionStatus",
    "subscriptionPlan",
    "subscriptionEndsAt",
    "isPremium",
  ]) {
    assert.match(auth, new RegExp(`${field}: _${field}`));
  }
});

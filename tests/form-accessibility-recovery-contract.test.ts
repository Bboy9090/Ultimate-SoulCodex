import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const formPrimitiveUrl = new URL("../client/src/components/ui/form.tsx", import.meta.url);
const toastUrl = new URL("../client/src/components/ui/toast.tsx", import.meta.url);
const createUrl = new URL("../client/src/pages/local-first-input-form.tsx", import.meta.url);

test("shared form controls expose validation errors to assistive technology", async () => {
  const source = await readFile(formPrimitiveUrl, "utf8");

  assert.match(source, /aria-errormessage=\{error \? formMessageId : undefined\}/);
  assert.match(source, /aria-invalid=\{!!error\}/);
  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /id=\{formMessageId\}/);
});

test("toast actions and dismiss controls keep touch-sized targets", async () => {
  const source = await readFile(toastUrl, "utf8");

  assert.match(source, /inline-flex min-h-11/);
  assert.match(source, /right-2 top-2 grid h-11 w-11 place-items-center/);
});

test("create profile connects helper text, verification consequences, and live/busy states", async () => {
  const source = await readFile(createUrl, "utf8");

  assert.match(source, /FormDescription/);
  assert.match(source, /aria-describedby="verify-online-description"/);
  assert.match(source, /id="verify-online-description"/);
  assert.match(source, /data-testid="chart-input-readiness" role="status" aria-live="polite"/);
  assert.match(source, /button-location-lookup"[\s\S]*?aria-busy=\{isLocating\}|aria-busy=\{isLocating\}[\s\S]*?button-location-lookup"/);
  assert.match(source, /button-create-profile"[\s\S]*?aria-busy=\{isCreating\}|aria-busy=\{isCreating\}[\s\S]*?button-create-profile"/);
  assert.match(source, /checkbox-online-verification[\s\S]*?h-6 w-6/);
});

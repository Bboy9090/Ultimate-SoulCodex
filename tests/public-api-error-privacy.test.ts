import assert from "node:assert/strict";
import test from "node:test";
import { publicApiErrorMessage } from "../client/src/lib/queryClient";

test("public API errors expose only bounded message and code fields", async () => {
  const response = new Response(JSON.stringify({
    message: "Public explanation",
    code: "example_code",
    privateDebug: "SECRET_INTERNAL_PAYLOAD",
    nested: { birthDate: "1990-09-17" },
  }), {
    status: 400,
    statusText: "Bad Request",
    headers: { "content-type": "application/json" },
  });

  const message = await publicApiErrorMessage(response);
  assert.equal(message, "Public explanation (example_code)");
  assert.doesNotMatch(message, /SECRET_INTERNAL_PAYLOAD/);
  assert.doesNotMatch(message, /1990-09-17/);
});

test("non-json error bodies are never echoed to the user", async () => {
  const response = new Response("<html>proxy private diagnostic SECRET</html>", {
    status: 502,
    statusText: "Bad Gateway",
    headers: { "content-type": "text/html" },
  });

  assert.equal(await publicApiErrorMessage(response), "Bad Gateway");
});

test("public API error messages are whitespace-normalized and bounded", async () => {
  const oversized = "A".repeat(500);
  const response = new Response(JSON.stringify({ message: `  hello\n\n${oversized}  ` }), {
    status: 422,
    statusText: "Unprocessable Entity",
    headers: { "content-type": "application/json" },
  });

  const message = await publicApiErrorMessage(response);
  assert.ok(message.length <= 240);
  assert.doesNotMatch(message, /\n/);
});

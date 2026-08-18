import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import express from "express";
import { registerCodexToolRoutes } from "../server/routes/codex-tools.ts";

async function withToolServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json({ limit: "256kb", strict: true }));
  registerCodexToolRoutes(app);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function json(response: Response) {
  return response.json() as Promise<any>;
}

test("production catalog exposes only the three truth-labeled recovered tools", async () => {
  await withToolServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/codex-tools`);
    assert.equal(response.status, 200);
    const body = await json(response);

    assert.deepEqual(
      body.tools.map((tool: any) => tool.id),
      ["before-you-act", "boundary-script", "codex-draw"],
    );
    assert.deepEqual(
      body.tools.map((tool: any) => tool.evidenceKind),
      ["heuristic", "template", "symbolic_random_draw"],
    );
    assert.ok(body.deliberatelyUnavailable.includes("daily-pull-transit"));
    assert.ok(body.deliberatelyUnavailable.includes("decision-confidence-percentage"));
    assert.ok(body.deliberatelyUnavailable.includes("profile-personalized-codex-tools"));
  });
});

test("Before You Act accepts only message text and never a caller-supplied profile", async () => {
  await withToolServer(async (baseUrl) => {
    const rejected = await fetch(`${baseUrl}/api/codex-tools/before-you-act`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "I need more time before I answer.",
        profile: { moonSign: "Fake Moon", hdType: "Fake Design" },
      }),
    });
    assert.equal(rejected.status, 400);

    const response = await fetch(`${baseUrl}/api/codex-tools/before-you-act`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "I need more time before I answer." }),
    });
    assert.equal(response.status, 200);
    const body = await json(response);

    assert.equal(body.evidence.kind, "heuristic");
    assert.equal(body.evidence.personalizedFromProfile, false);
    assert.deepEqual(body.evidence.verifiedFactsUsed, []);
    assert.match(body.evidence.note, /text-pattern heuristic/i);
    assert.doesNotMatch(JSON.stringify(body), /Fake Moon|Fake Design/);
    assert.doesNotMatch(body.action, /Send it\. It's ready/i);
  });
});

test("Boundary Script is an editable template and rejects hidden profile payloads", async () => {
  await withToolServer(async (baseUrl) => {
    const rejected = await fetch(`${baseUrl}/api/codex-tools/boundary-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation: "My boss wants work after hours", profile: { sunSign: "Fake" } }),
    });
    assert.equal(rejected.status, 400);

    const response = await fetch(`${baseUrl}/api/codex-tools/boundary-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation: "My boss wants work after hours" }),
    });
    assert.equal(response.status, 200);
    const body = await json(response);

    assert.equal(body.evidence.kind, "template");
    assert.equal(body.evidence.personalizedFromProfile, false);
    assert.match(body.action, /editable wording/i);
    assert.match(body.evidence.note, /not a diagnosis, prediction, or rule/i);
  });
});

test("Codex Draw is explicitly symbolic, non-predictive, and does not pretend a question influenced the draw", async () => {
  await withToolServer(async (baseUrl) => {
    const questionRejected = await fetch(`${baseUrl}/api/codex-tools/codex-draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spread: "quick", question: "Will I get the job?" }),
    });
    assert.equal(questionRejected.status, 400);

    const response = await fetch(`${baseUrl}/api/codex-tools/codex-draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spread: "situation" }),
    });
    assert.equal(response.status, 200);
    const body = await json(response);

    assert.equal(body.evidence.kind, "symbolic_random_draw");
    assert.equal(body.evidence.personalizedFromProfile, false);
    assert.match(body.evidence.note, /not astronomical evidence/i);
    assert.match(body.evidence.note, /not.*prediction/i);
    assert.match(body.meaning, /symbolic prompts/i);
    assert.match(body.action, /medical, legal, financial/i);
    assert.doesNotMatch(JSON.stringify(body), /transit signal/i);
  });
});

test("current server and client mount the safe tools path, while the unsafe legacy route is removed", () => {
  const serverIndex = readFileSync("server/index.ts", "utf8");
  const app = readFileSync("client/src/App.tsx", "utf8");
  const navigation = readFileSync("client/src/components/navigation.tsx", "utf8");
  const page = readFileSync("client/src/pages/CodexToolsPage.tsx", "utf8");

  assert.match(serverIndex, /registerCodexToolRoutes\(app\)/);
  assert.match(app, /<Route path="\/tools" component=\{CodexToolsPage\}/);
  assert.match(navigation, /href: "\/tools", label: "Tools"/);
  assert.match(page, /Only this text is sent/);
  assert.match(page, /No profile data is attached/);
  assert.match(page, /Symbolic random reflection/);
  assert.equal(existsSync("routes/codex-tools.ts"), false);
});

test("native-facing PDF and clarity tools use the configured API resolver", () => {
  const pdfButton = readFileSync("client/src/components/NatalReportDownloadButton.tsx", "utf8");
  const toolsPage = readFileSync("client/src/pages/CodexToolsPage.tsx", "utf8");

  assert.match(pdfButton, /import \{ apiFetch \} from "@\/lib\/queryClient"/);
  assert.match(pdfButton, /apiFetch\(`\/api\/pdf\/profile\//);
  assert.doesNotMatch(pdfButton, /fetch\(`\/api\/pdf\/profile\//);
  assert.match(toolsPage, /apiFetch\(path/);
});

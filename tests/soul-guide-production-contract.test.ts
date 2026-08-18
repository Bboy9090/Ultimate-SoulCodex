import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import express from "express";
import {
  buildSoulGuideEvidence,
  buildSoulGuideSystemPrompt,
  registerSoulGuideRoutes,
} from "../server/routes/soul-guide.ts";
import { validateDiamondOutput } from "../src/ai/diamondClarity.ts";

async function withGuideServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json({ limit: "256kb", strict: true }));
  registerSoulGuideRoutes(app);

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

const placementEvidence = {
  source: "NASA/JPL Horizons independent reference",
  engine: "nasa-jpl-horizons-api@1.3",
  calculatedAt: "2026-08-03T11:30:00.000Z",
};

const verifiedHd = {
  status: "verified",
  engine: "independent-hd-engine@1",
  source: "Soul Codex candidate plus independent HD reference",
  calculatedAt: "2026-08-03T12:00:00.000Z",
  verificationReceiptId: "HD-VERIFICATION-RECEIPT-v1",
  independentSource: "Independent Human Design reference",
  verifiedAt: "2026-08-03T12:01:00.000Z",
  candidate: {
    type: "Reflector",
    strategy: "Wait a lunar cycle",
    authority: "Lunar",
    profile: "2/5",
  },
};

test("Soul Guide evidence adapter admits only provenance-complete verified fields", () => {
  const evidence = buildSoulGuideEvidence({
    astrologyData: {
      sun: { sign: "Virgo", verificationStatus: "verified", evidence: placementEvidence },
      moon: { sign: "Scorpio", verificationStatus: "verified" },
      rising: { sign: null, verificationStatus: "requires_verified_birth_time" },
    },
    numerologyData: { lifePath: 9, expression: 4, soulUrge: 7 },
    humanDesignData: verifiedHd,
    archetypeData: { title: "Pattern Witness" },
  });

  assert.deepEqual(evidence.verifiedAstrology, { sun: "Virgo" });
  assert.deepEqual(evidence.deterministicNumerology, {
    lifePath: 9,
    expression: 4,
    soulUrge: 7,
  });
  assert.deepEqual(evidence.verifiedHumanDesign, verifiedHd.candidate);
  assert.deepEqual(evidence.symbolicContext, { archetypeTitle: "Pattern Witness" });
  assert.ok(evidence.unresolved.includes("Moon"));
  assert.ok(evidence.unresolved.includes("Ascendant"));
});

test("forged Human Design verified status without independent provenance is excluded", () => {
  const evidence = buildSoulGuideEvidence({
    astrologyData: {},
    numerologyData: {},
    humanDesignData: {
      status: "verified",
      candidate: { type: "Reflector", authority: "Lunar" },
    },
  });

  assert.deepEqual(evidence.verifiedHumanDesign, {});
  assert.ok(evidence.unresolved.includes("Human Design"));
});

test("system prompt labels evidence classes and forbids unresolved inference", () => {
  const evidence = buildSoulGuideEvidence(null);
  const prompt = buildSoulGuideSystemPrompt(evidence);

  assert.match(prompt, /No server-backed profile was supplied/i);
  assert.match(prompt, /Never infer missing birth data/i);
  assert.match(prompt, /Verified astronomy/i);
  assert.match(prompt, /Numerology arithmetic.*deterministic/i);
  assert.match(prompt, /Human Design may be referenced only when a verified field is listed/i);
  assert.match(prompt, /medical, legal, financial, crisis, or safety-critical/i);
});

test("generic HTTP route rejects caller-supplied profile blobs and returns a Diamond-valid safe response without provider keys", async () => {
  const oldGemini = process.env.GEMINI_API_KEY;
  const oldGroq = process.env.GROQ_API_KEY;
  const oldOpenAI = process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    await withGuideServer(async (baseUrl) => {
      const rejected = await fetch(`${baseUrl}/api/soul-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Why do I keep delaying this decision?",
          profileContext: { moonSign: "Fake Moon", hdType: "Fake Design" },
        }),
      });
      assert.equal(rejected.status, 400);

      const response = await fetch(`${baseUrl}/api/soul-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Why do I keep delaying this decision?" }),
      });
      assert.equal(response.status, 200);
      const body = await response.json() as any;

      assert.equal(body.status, "fallback");
      assert.equal(body.provider, "deterministic");
      assert.equal(body.evidence.profileUsed, false);
      assert.equal(validateDiamondOutput(body.content).valid, true);
      assert.doesNotMatch(body.content, /trauma response/i);
      assert.doesNotMatch(body.content, /Fake Moon|Fake Design/);
      assert.match(body.content, /legacy deterministic personality fallback intentionally suppressed/i);
    });
  } finally {
    if (oldGemini === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = oldGemini;
    if (oldGroq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldGroq;
    if (oldOpenAI === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldOpenAI;
  }
});

test("current client and server mount the guide without uploading a local profile blob", () => {
  const app = readFileSync("client/src/App.tsx", "utf8");
  const page = readFileSync("client/src/pages/SoulGuidePage.tsx", "utf8");
  const navigation = readFileSync("client/src/components/navigation.tsx", "utf8");
  const server = readFileSync("server/index.ts", "utf8");
  const route = readFileSync("server/routes/soul-guide.ts", "utf8");

  assert.match(app, /<Route path="\/guide" component=\{SoulGuidePage\}/);
  assert.match(navigation, /href: "\/guide", label: "Guide"/);
  assert.match(server, /registerSoulGuideRoutes\(app\)/);
  assert.match(page, /apiFetch\("\/api\/soul-guide"/);
  assert.match(page, /profileId: remoteId/);
  assert.doesNotMatch(page, /profileContext/);
  assert.match(route, /requestSchema.*strict/s);
  assert.doesNotMatch(route, /req\.body.*profileContext/);
});

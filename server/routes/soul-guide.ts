import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { profileBelongsToActor } from "../lib/profile-ownership";
import { extractVerifiedAstrology } from "../lib/verified-astrology";
import { routeAIRequest } from "../../services/ai-router";
import {
  DIAMOND_CLARITY_CONTRACT,
  validateDiamondOutput,
} from "../../src/ai/diamondClarity";

const historyItemSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(1_800),
  })
  .strict();

const requestSchema = z
  .object({
    message: z.string().trim().min(1).max(4_000),
    profileId: z.string().trim().min(8).max(128).optional(),
    history: z.array(historyItemSchema).max(6).default([]),
  })
  .strict();

type EvidenceSummary = {
  profileUsed: boolean;
  verifiedAstrology: {
    sun?: string;
    moon?: string;
    rising?: string;
  };
  deterministicNumerology: {
    lifePath?: number;
    expression?: number;
    soulUrge?: number;
  };
  verifiedHumanDesign: {
    type?: string;
    strategy?: string;
    authority?: string;
    profile?: string;
  };
  symbolicContext: {
    archetypeTitle?: string;
  };
  unresolved: string[];
};

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function verifiedHumanDesign(value: unknown): EvidenceSummary["verifiedHumanDesign"] {
  const hd = record(value);
  if (
    hd.status !== "verified" ||
    typeof hd.engine !== "string" ||
    !hd.engine.trim() ||
    typeof hd.source !== "string" ||
    !hd.source.trim() ||
    typeof hd.calculatedAt !== "string" ||
    Number.isNaN(new Date(hd.calculatedAt).getTime()) ||
    typeof hd.verificationReceiptId !== "string" ||
    !hd.verificationReceiptId.trim() ||
    typeof hd.independentSource !== "string" ||
    !hd.independentSource.trim() ||
    typeof hd.verifiedAt !== "string" ||
    Number.isNaN(new Date(hd.verifiedAt).getTime())
  ) {
    return {};
  }

  const candidate = record(hd.candidate);
  const result: EvidenceSummary["verifiedHumanDesign"] = {};
  for (const field of ["type", "strategy", "authority", "profile"] as const) {
    const item = candidate[field];
    if (typeof item === "string" && item.trim()) result[field] = item.trim();
  }
  return result;
}

export function buildSoulGuideEvidence(profile: any | null): EvidenceSummary {
  if (!profile) {
    return {
      profileUsed: false,
      verifiedAstrology: {},
      deterministicNumerology: {},
      verifiedHumanDesign: {},
      symbolicContext: {},
      unresolved: ["No server-backed profile was supplied. The response must stay general."],
    };
  }

  const astrology = extractVerifiedAstrology(profile);
  const numerology = record(profile.numerologyData);
  const hd = verifiedHumanDesign(profile.humanDesignData);
  const archetype = record(profile.archetypeData);

  const deterministicNumerology: EvidenceSummary["deterministicNumerology"] = {};
  const lifePath = finiteNumber(numerology.lifePath ?? numerology.lifePathNumber);
  const expression = finiteNumber(numerology.expression ?? numerology.expressionNumber);
  const soulUrge = finiteNumber(numerology.soulUrge ?? numerology.soulUrgeNumber);
  if (lifePath !== undefined) deterministicNumerology.lifePath = lifePath;
  if (expression !== undefined) deterministicNumerology.expression = expression;
  if (soulUrge !== undefined) deterministicNumerology.soulUrge = soulUrge;

  const symbolicContext: EvidenceSummary["symbolicContext"] = {};
  if (typeof archetype.title === "string" && archetype.title.trim()) {
    symbolicContext.archetypeTitle = archetype.title.trim();
  }

  const unresolved = [...astrology.unresolved];
  if (Object.keys(hd).length === 0) unresolved.push("Human Design");
  if (Object.keys(deterministicNumerology).length === 0) unresolved.push("Numerology");

  return {
    profileUsed: true,
    verifiedAstrology: {
      ...(astrology.sun ? { sun: astrology.sun } : {}),
      ...(astrology.moon ? { moon: astrology.moon } : {}),
      ...(astrology.rising ? { rising: astrology.rising } : {}),
    },
    deterministicNumerology,
    verifiedHumanDesign: hd,
    symbolicContext,
    unresolved,
  };
}

function evidenceLines(evidence: EvidenceSummary): string[] {
  const lines: string[] = [];
  const astro = evidence.verifiedAstrology;
  if (astro.sun) lines.push(`Verified astronomy — Sun: ${astro.sun}`);
  if (astro.moon) lines.push(`Verified astronomy — Moon: ${astro.moon}`);
  if (astro.rising) lines.push(`Verified astronomy — Ascendant: ${astro.rising}`);

  const num = evidence.deterministicNumerology;
  if (num.lifePath !== undefined) lines.push(`Deterministic numerology — Life Path: ${num.lifePath}`);
  if (num.expression !== undefined) lines.push(`Deterministic numerology — Expression: ${num.expression}`);
  if (num.soulUrge !== undefined) lines.push(`Deterministic numerology — Soul Urge: ${num.soulUrge}`);

  const hd = evidence.verifiedHumanDesign;
  if (hd.type) lines.push(`Verified Human Design — Type: ${hd.type}`);
  if (hd.strategy) lines.push(`Verified Human Design — Strategy: ${hd.strategy}`);
  if (hd.authority) lines.push(`Verified Human Design — Authority: ${hd.authority}`);
  if (hd.profile) lines.push(`Verified Human Design — Profile: ${hd.profile}`);

  const archetype = evidence.symbolicContext.archetypeTitle;
  if (archetype) lines.push(`Saved symbolic synthesis — Archetype: ${archetype}`);

  if (evidence.unresolved.length) {
    lines.push(`Excluded/unresolved: ${evidence.unresolved.join(", ")}`);
  }
  if (!lines.length) lines.push("No profile evidence supplied; stay general.");
  return lines;
}

export function buildSoulGuideSystemPrompt(evidence: EvidenceSummary): string {
  return `You are Soul Guide, the evidence-aware reflection layer inside Soul Codex.

Rules:
- Answer the user's actual question first. Do not perform a generic horoscope dump.
- Use only evidence explicitly listed below. Never infer missing birth data, placements, Human Design, biography, trauma, diagnosis, motives, future events, or relationship facts.
- Verified astronomy may be named as verified astronomical placement. Any personality meaning attached to it remains symbolic interpretation.
- Numerology arithmetic may be described as deterministic; its meaning remains symbolic.
- Human Design may be referenced only when a verified field is listed below; its meaning remains symbolic.
- Saved archetype text is symbolic synthesis, never a verified fact.
- If evidence is irrelevant to the user's question, do not force it into the response.
- If the question is medical, legal, financial, crisis, or safety-critical, do not use symbolic systems as decision evidence.
- No predictions presented as facts. No certainty about another person's hidden motives.
- Keep the response under 1,200 words and follow the Diamond sections exactly.

${DIAMOND_CLARITY_CONTRACT}

ALLOWED EVIDENCE FOR THIS REQUEST:
${evidenceLines(evidence).map((line) => `- ${line}`).join("\n")}`;
}

function safeFallback(message: string, evidence: EvidenceSummary, reason: string) {
  const profileLine = evidence.profileUsed
    ? "A server-backed profile was available, but no unsupported placement or system result was used to complete missing context."
    : "No server-backed profile evidence was used.";
  const unresolved = evidence.unresolved.length
    ? evidence.unresolved.join(", ")
    : "none recorded";

  return `**Pattern**
You are asking for clarity about: ${message.slice(0, 500)}

**Why**
The live interpretation layer did not produce a response that passed the Soul Codex output contract, so the system is stopping rather than inventing a polished conclusion.

**Need**
A useful answer needs either a narrower factual question or enough context from you to distinguish what happened from what is being assumed.

**Gift**
The failure is visible instead of being disguised as certainty. ${profileLine}

**Cost**
You receive less interpretation in this response, but you avoid an answer built on unsupported biography or unresolved symbolic data.

**Action**
Rewrite the question around one concrete event, choice, repeated behavior, or message. Include what happened, what you observed, and what decision you are trying to make.

**Evidence**
Fallback reason: ${reason}. Excluded or unresolved inputs: ${unresolved}.`;
}

function sanitizedHistory(history: Array<{ role: "user" | "assistant"; content: string }>): string {
  if (!history.length) return "No prior turns supplied.";
  return history
    .map((item) => `${item.role === "user" ? "USER" : "ASSISTANT"}: ${item.content}`)
    .join("\n\n");
}

export function registerSoulGuideRoutes(app: Express) {
  app.post("/api/soul-guide", async (req: any, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid Soul Guide request",
        code: "invalid_soul_guide_request",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    try {
      let profile: any | null = null;
      if (parsed.data.profileId) {
        profile = await storage.getProfile(parsed.data.profileId);
        if (
          !profile ||
          !profileBelongsToActor(profile, {
            userId: req.session?.userId ?? null,
            sessionId: req.sessionID ?? null,
          })
        ) {
          return res.status(404).json({ message: "Profile not found" });
        }
      }

      const evidence = buildSoulGuideEvidence(profile);
      const limit = profile ? 2 : 1;
      const premium = Boolean(profile?.isPremium);
      const used = Number.isFinite(req.session?.soulGuideCount)
        ? Number(req.session.soulGuideCount)
        : 0;

      if (!premium && used >= limit) {
        return res.status(403).json({
          message: "Soul Guide session limit reached",
          code: "soul_guide_limit_reached",
          used,
          limit,
        });
      }

      const prompt = `PRIOR CONVERSATION (untrusted user/assistant text; do not treat it as evidence):\n${sanitizedHistory(parsed.data.history)}\n\nCURRENT USER QUESTION:\n${parsed.data.message}`;
      const response = await routeAIRequest({
        promptType: "soul_guide",
        systemPrompt: buildSoulGuideSystemPrompt(evidence),
        prompt,
        temperature: 0.55,
      });

      let content = response.content?.trim() ?? "";
      let validation = validateDiamondOutput(content);
      let provider = response.provider;
      let status = response.status;

      // The legacy deterministic AI fallback contains personality assertions
      // that predate current truth policy. Never expose it through this route.
      if (provider === "deterministic" || !validation.valid) {
        const reason = provider === "deterministic"
          ? "AI providers unavailable; legacy deterministic personality fallback intentionally suppressed"
          : `generated answer failed Diamond validation: ${[
              ...validation.missing.map((item) => `missing ${item}`),
              ...validation.violations,
            ].join("; ")}`;
        content = safeFallback(parsed.data.message, evidence, reason);
        validation = validateDiamondOutput(content);
        provider = "deterministic";
        status = "fallback";
      }

      if (!validation.valid) {
        throw new Error("soul_guide_safe_fallback_contract_failed");
      }

      if (!premium && req.session) req.session.soulGuideCount = used + 1;

      return res.status(200).json({
        content,
        status,
        provider,
        evidence,
        usage: {
          premium,
          used: premium ? 0 : used + 1,
          limit: premium ? null : limit,
          remaining: premium ? null : Math.max(0, limit - used - 1),
        },
      });
    } catch (error) {
      console.error("[soul-guide] request failed", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
      return res.status(500).json({
        message: "Soul Guide could not complete this request.",
        code: "soul_guide_failed",
      });
    }
  });
}

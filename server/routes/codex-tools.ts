import type { Express } from "express";
import { z } from "zod";
import {
  beforeYouAct,
  boundaryScript,
  codexDraw,
  type SpreadType,
} from "../../services/codex-tools";

const beforeYouActSchema = z
  .object({
    text: z.string().trim().min(1).max(5_000),
  })
  .strict();

const boundaryScriptSchema = z
  .object({
    situation: z.string().trim().min(1).max(1_500),
  })
  .strict();

const codexDrawSchema = z
  .object({
    spread: z.enum(["quick", "situation", "deep"]).default("quick"),
  })
  .strict();

type ToolEvidence = {
  kind: "heuristic" | "template" | "symbolic_random_draw";
  personalizedFromProfile: false;
  verifiedFactsUsed: readonly [];
  note: string;
};

function respondValidationError(res: any, error: z.ZodError) {
  return res.status(400).json({
    message: "Invalid tool input",
    code: "invalid_tool_input",
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}

function serverError(res: any, tool: string, error: unknown) {
  console.error(`[codex-tools] ${tool} failed`, {
    message: error instanceof Error ? error.message : "unknown_error",
  });
  return res.status(500).json({
    message: "The clarity tool could not complete this request.",
    code: "clarity_tool_failed",
  });
}

const BEFORE_YOU_ACT_EVIDENCE: ToolEvidence = {
  kind: "heuristic",
  personalizedFromProfile: false,
  verifiedFactsUsed: [],
  note:
    "This is a transparent text-pattern heuristic. It does not determine whether a message is safe, correct, or appropriate for your real-world context.",
};

const BOUNDARY_EVIDENCE: ToolEvidence = {
  kind: "template",
  personalizedFromProfile: false,
  verifiedFactsUsed: [],
  note:
    "This is a communication template selected from the situation words you entered. It is not a diagnosis, prediction, or rule about another person.",
};

const DRAW_EVIDENCE: ToolEvidence = {
  kind: "symbolic_random_draw",
  personalizedFromProfile: false,
  verifiedFactsUsed: [],
  note:
    "Cards are drawn as symbolic reflection prompts. The draw is not astronomical evidence, a prediction, a transit reading, or proof that an event will occur.",
};

export function registerCodexToolRoutes(app: Express) {
  app.get("/api/codex-tools", (_req, res) => {
    res.json({
      tools: [
        {
          id: "before-you-act",
          endpoint: "/api/codex-tools/before-you-act",
          method: "POST",
          evidenceKind: BEFORE_YOU_ACT_EVIDENCE.kind,
        },
        {
          id: "boundary-script",
          endpoint: "/api/codex-tools/boundary-script",
          method: "POST",
          evidenceKind: BOUNDARY_EVIDENCE.kind,
        },
        {
          id: "codex-draw",
          endpoint: "/api/codex-tools/codex-draw",
          method: "POST",
          evidenceKind: DRAW_EVIDENCE.kind,
          spreads: ["quick", "situation", "deep"],
        },
      ],
      deliberatelyUnavailable: [
        "daily-pull-transit",
        "decision-confidence-percentage",
        "what-youre-ignoring",
        "profile-personalized-codex-tools",
      ],
    });
  });

  app.post("/api/codex-tools/before-you-act", (req, res) => {
    try {
      const parsed = beforeYouActSchema.safeParse(req.body);
      if (!parsed.success) return respondValidationError(res, parsed.error);

      // Deliberately pass an empty profile. The legacy engine can inject naked
      // Moon/Rising/Human Design claims; this production route uses only the
      // user's explicitly submitted message text until profile evidence is
      // independently adapted and verified.
      const base = beforeYouAct({}, parsed.data.text);
      const risk = String(base.extras?.risk ?? "unknown");
      const action =
        risk === "high"
          ? "Several reactive-language markers were detected. Consider waiting, shortening the message, and checking the factual point you want to communicate before sending."
          : risk === "medium"
            ? "Some emotional or unclear-language markers were detected. Review the message for one clear point, one direct need, and any wording you would regret if the conversation became tense."
            : "No strong reactive-language markers were detected by this simple heuristic. Re-read the message for context, accuracy, tone, and consequences before deciding whether to send it.";

      return res.json({
        ...base,
        title: "Before You Act — text check",
        action,
        evidence: BEFORE_YOU_ACT_EVIDENCE,
      });
    } catch (error) {
      return serverError(res, "before-you-act", error);
    }
  });

  app.post("/api/codex-tools/boundary-script", (req, res) => {
    try {
      const parsed = boundaryScriptSchema.safeParse(req.body);
      if (!parsed.success) return respondValidationError(res, parsed.error);

      const base = boundaryScript({}, parsed.data.situation);
      return res.json({
        ...base,
        title: "Boundary Script — template",
        action: `${base.action}\n\nTreat this as editable wording, not a command. Keep only language that fits the actual relationship, safety considerations, and consequences.`,
        evidence: BOUNDARY_EVIDENCE,
      });
    } catch (error) {
      return serverError(res, "boundary-script", error);
    }
  });

  app.post("/api/codex-tools/codex-draw", (req, res) => {
    try {
      const parsed = codexDrawSchema.safeParse(req.body);
      if (!parsed.success) return respondValidationError(res, parsed.error);

      const spread = parsed.data.spread as SpreadType;
      const base = codexDraw({}, spread);
      return res.json({
        ...base,
        meaning:
          "Use these cards as symbolic prompts for reflection. Notice which themes feel relevant, which do not, and what concrete evidence in your life supports or contradicts the interpretation.",
        action:
          "Choose at most one reflection prompt to test against lived experience. Do not use this draw as evidence for medical, legal, financial, safety-critical, or irreversible decisions.",
        evidence: DRAW_EVIDENCE,
      });
    } catch (error) {
      return serverError(res, "codex-draw", error);
    }
  });
}

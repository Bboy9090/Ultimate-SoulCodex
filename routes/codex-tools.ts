/**
 * Codex Tools API — POST /api/codex-tools/:tool
 *
 * Every tool is deterministic. No LLM needed. No failure state.
 * Returns a consistent CodexToolResult following Observation → Meaning → Action.
 */

import type { Express } from "express";
import {
  dailyPull,
  oracleSymbolDraw,
  timingWindow,
  realityCheck,
  decisionTemperature,
  signalVsNoise,
  shadowPattern,
  energyLeak,
  innerConflict,
  whyThisKeepsHappening,
  stopDoingThis,
  oneMove,
} from "../services/codex-tools";
import { storage } from "../storage";

const TOOLS: Record<string, (profile: any, ...args: any[]) => any> = {
  "daily-pull": (p) => dailyPull(p),
  "oracle-symbol": (p) => oracleSymbolDraw(p),
  "timing-window": (p) => timingWindow(p),
  "reality-check": (p) => realityCheck(p),
  "decision-temperature": (p, decision) => decisionTemperature(p, decision),
  "signal-vs-noise": (p) => signalVsNoise(p),
  "shadow-pattern": (p) => shadowPattern(p),
  "energy-leak": (p) => energyLeak(p),
  "inner-conflict": (p) => innerConflict(p),
  "why-this-keeps-happening": (p) => whyThisKeepsHappening(p),
  "stop-doing-this": (p) => stopDoingThis(p),
  "one-move": (p) => oneMove(p),
};

export function registerCodexToolsRoutes(app: Express) {
  app.post("/api/codex-tools/:tool", async (req, res) => {
    try {
      const toolName = req.params.tool;
      const toolFn = TOOLS[toolName];

      if (!toolFn) {
        return res.status(400).json({
          error: `Unknown tool: ${toolName}`,
          available: Object.keys(TOOLS),
        });
      }

      const { profile: bodyProfile, decision } = req.body || {};

      let profile = bodyProfile || null;

      if (!profile) {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionID;

        if (userId) {
          profile = await storage.getProfileByUserId(userId);
        } else if (sessionId) {
          const profiles = await storage.getAllProfiles();
          profile = profiles.find((p: any) => (p as any).sessionId === sessionId);
        }
      }

      const result = toolFn(profile || {}, decision);

      return res.json(result);
    } catch (error: any) {
      console.error(`[Codex Tools] Error in ${req.params.tool}:`, error);
      return res.status(200).json({
        tool: req.params.tool,
        title: "Guidance from your Codex",
        observation: "Your Codex tools are available.",
        meaning: "The specific tool encountered an issue, but your profile data is intact.",
        action: "Try your Daily Pull or Reality Check — those are the strongest signals right now.",
      });
    }
  });

  app.get("/api/codex-tools", (_req, res) => {
    return res.json({
      tools: Object.keys(TOOLS).map((key) => ({
        id: key,
        endpoint: `/api/codex-tools/${key}`,
        method: "POST",
      })),
    });
  });
}

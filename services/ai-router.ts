/**
 * AI Router — the 3-layer reliability engine.
 *
 * Every AI call goes: Primary (Gemini) → Backup (Groq) → Deterministic fallback.
 * Never: Primary → red error box. That's amateur hour.
 */

import { generateText, isGeminiAvailable, streamChat as geminiStreamChat } from "../gemini";
import { generateTextGroq, isGroqAvailable, streamChatGroq } from "./groq";
import { generateTextOpenAI, isOpenAIAvailable, streamChatOpenAI } from "./openai-provider";
import { getCached, setCached } from "./ai-cache";
import { deterministicFallback } from "./deterministic-fallback";
import type { AIResponse, AIRequest, AIStreamRequest, AIStatus, AIProvider } from "../src/types/ai";

import { scoreOutput } from "../soulcodex/codex30/synth/quality";

/**
 * FINAL OUTPUT FIREWALL — Zero tolerance for mid-tier content or system leakage.
 * If the output score is below 7.5, it is REJECTED.
 */
export function finalOutputGuard(text: string): string {
  if (!text) return "";

  // 1. Scoring Firewall (Architecture over Patterns)
  const score = scoreOutput(text);
  if (!score.passed) {
    console.warn(`[AI Firewall] Rejected output: Score ${score.total.toFixed(1)} < 7.5 threshold.`);
    return "";
  }

  // 2. Leakage Patterns (Cleanup)
  const invalidPatterns = [
    /\|/g,                        // Raw signal pipes: |1221-12-12|
    /unknown/i,                   // System placeholders
    /chaos/i,                     // Leakage tokens
    /fix/i,                       // Leakage tokens
    /[0-9]{4}-[0-9]{2}-[0-9]{2}/, // Raw dates: 1221-12-12
    /[a-z]{1,3}\|/i,              // Specific leakage: hj|
    /raw variables/i,
    /placeholder text/i,
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(text)) {
      console.warn(`[AI Firewall] Rejected output due to pattern: ${pattern}`);
      return "";
    }
  }

  return text.trim();
}

/**
 * Sanitizes input before it even reaches the AI.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/\|.*?\|/g, "")
    .replace(/chaos+/gi, "")
    .replace(/fix/gi, "")
    .replace(/unknown/gi, "")
    .replace(/I am someone who/gi, "I")
    .replace(/I tend to/gi, "I default to")
    .replace(/I try to/gi, "I")
    .replace(/I aim to/gi, "I")
    .replace(/I enjoy/gi, "I")
    .trim();
}

export async function routeAIRequest(input: AIRequest): Promise<AIResponse> {
  // Full prompt in cache key — truncated keys caused wrong cached answers for different users.
  const cacheKey = `${input.promptType}::${input.systemPrompt || ""}::${input.prompt}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return {
      status: "live",
      provider: "cache",
      content: cached,
      meta: { cached: true, promptType: input.promptType },
    };
  }

  const temperature = input.temperature ?? 0.7;

  const sanitizedPrompt = sanitizeInput(input.prompt);
  const sanitizedSystemPrompt = input.systemPrompt ? sanitizeInput(input.systemPrompt) : undefined;

  // 1. Try Gemini (Primary)
  if (isGeminiAvailable()) {
    try {
      const fullPrompt = sanitizedSystemPrompt
        ? `${sanitizedSystemPrompt}\n\n${sanitizedPrompt}`
        : sanitizedPrompt;
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Gemini timeout")), 8000)
      );

      const text = await Promise.race([
        generateText({ prompt: fullPrompt, temperature }),
        timeoutPromise
      ]) as string;

      if (text && text.trim().length > 20) {
        const guardedText = finalOutputGuard(text);
        if (guardedText) {
          setCached(cacheKey, guardedText);
          return {
            status: "live",
            provider: "gemini",
            content: guardedText,
            meta: { promptType: input.promptType },
          };
        }
      }
    } catch (e) {
      console.warn("[AI Router] Gemini failed or timed out:", (e as Error).message);
    }
  }

  // 2. Try Groq (Backup)
  if (isGroqAvailable()) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Groq timeout")), 8000)
      );

      const text = await Promise.race([
        generateTextGroq({
          prompt: sanitizedPrompt,
          systemPrompt: sanitizedSystemPrompt,
          temperature,
        }),
        timeoutPromise
      ]) as string;

      if (text && text.trim().length > 20) {
        const guardedText = finalOutputGuard(text);
        if (guardedText) {
          setCached(cacheKey, guardedText);
          return {
            status: "backup",
            provider: "groq",
            content: guardedText,
            meta: {
              promptType: input.promptType,
              reason: "Primary provider unavailable",
            },
          };
        }
      }
    } catch (e) {
      console.warn("[AI Router] Groq failed or timed out:", (e as Error).message);
    }
  }

  // 3. Try OpenAI (Solid Backstop)
  if (isOpenAIAvailable()) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("OpenAI timeout")), 8000)
      );

      const text = await Promise.race([
        generateTextOpenAI({
          prompt: sanitizedPrompt,
          systemPrompt: sanitizedSystemPrompt,
          temperature,
        }),
        timeoutPromise
      ]) as string;

      if (text && text.trim().length > 20) {
        const guardedText = finalOutputGuard(text);
        if (guardedText) {
          setCached(cacheKey, guardedText);
          return {
            status: "backup",
            provider: "openai",
            content: guardedText,
            meta: {
              promptType: input.promptType,
              reason: "Multiple providers failed",
            },
          };
        }
      }
    } catch (e) {
      console.warn("[AI Router] OpenAI also failed or timed out:", (e as Error).message);
    }
  }

  const fallback = deterministicFallback(input);
  return {
    status: "fallback",
    provider: "deterministic",
    title: fallback.title,
    content: fallback.content,
    meta: {
      promptType: input.promptType,
      reason: "AI providers unavailable — using Codex-generated guidance",
    },
  };
}

/**
 * Streaming AI router for chat-style responses.
 * Tries Gemini stream → Groq stream → deterministic fallback (yielded as single chunk).
 */
export async function* routeAIStream(
  input: AIStreamRequest
): AsyncGenerator<{ chunk: string; status: AIStatus; provider: AIProvider }> {
  const sanitizedMessage = sanitizeInput(input.message);
  const sanitizedSystemInstruction = input.systemInstruction ? sanitizeInput(input.systemInstruction) : undefined;

  if (isGeminiAvailable()) {
    try {
      const stream = geminiStreamChat({
        systemInstruction: sanitizedSystemInstruction,
        history: input.history.map((h) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
        message: sanitizedMessage,
        temperature: input.temperature ?? 0.8,
      });

      let yielded = false;
      const controller = new AbortController();
      const watchdog = setTimeout(() => {
        console.warn("[AI Router] Gemini stream watchdog triggered (15s)");
        controller.abort();
      }, 15000);

      try {
        for await (const chunk of stream) {
          if (chunk) {
            yielded = true;
            yield { chunk, status: "live", provider: "gemini" };
          }
        }
      } finally {
        clearTimeout(watchdog);
      }
      if (yielded) return;
    } catch (e) {
      console.warn("[AI Router] Gemini stream failed, trying Groq:", (e as Error).message);
    }
  }

  if (isGroqAvailable()) {
    try {
      const stream = streamChatGroq({
        systemInstruction: input.systemInstruction,
        history: input.history.map((h) => ({
          role: h.role,
          content:
            typeof h.content === "string"
              ? h.content
              : (h as any).parts?.[0]?.text || "",
        })),
        message: input.message,
        temperature: input.temperature ?? 0.8,
      });

      let yielded = false;
      for await (const chunk of stream) {
        if (chunk) {
          yielded = true;
          yield { chunk, status: "backup", provider: "groq" };
        }
      }
      if (yielded) return;
    } catch (e) {
      console.warn("[AI Router] Groq stream failed, trying OpenAI:", (e as Error).message);
    }
  }

  if (isOpenAIAvailable()) {
    try {
      const stream = streamChatOpenAI({
        systemInstruction: input.systemInstruction,
        history: input.history.map((h) => ({
          role: h.role,
          content:
            typeof h.content === "string"
              ? h.content
              : (h as any).parts?.[0]?.text || "",
        })),
        message: input.message,
        temperature: input.temperature ?? 0.8,
      });

      let yielded = false;
      for await (const chunk of stream) {
        if (chunk) {
          yielded = true;
          yield { chunk, status: "backup", provider: "openai" };
        }
      }
      if (yielded) return;
    } catch (e) {
      console.warn("[AI Router] OpenAI stream also failed:", (e as Error).message);
    }
  }

  const fallback = deterministicFallback({
    prompt: input.message,
    promptType: input.promptType,
    profile: input.profile,
    timeline: input.timeline,
    dailyCard: input.dailyCard,
  });

  yield {
    chunk: fallback.content,
    status: "fallback",
    provider: "deterministic",
  };
}

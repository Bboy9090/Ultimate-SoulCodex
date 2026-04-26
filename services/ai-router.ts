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

  // 1. Try Gemini (Primary)
  if (isGeminiAvailable()) {
    try {
      const fullPrompt = input.systemPrompt
        ? `${input.systemPrompt}\n\n${input.prompt}`
        : input.prompt;
      const text = await generateText({ prompt: fullPrompt, temperature });
      if (text && text.trim().length > 20) {
        setCached(cacheKey, text);
        return {
          status: "live",
          provider: "gemini",
          content: text,
          meta: { promptType: input.promptType },
        };
      }
    } catch (e) {
      console.warn("[AI Router] Gemini failed, trying Groq:", (e as Error).message);
    }
  }

  // 2. Try Groq (Backup)
  if (isGroqAvailable()) {
    try {
      const text = await generateTextGroq({
        prompt: input.prompt,
        systemPrompt: input.systemPrompt,
        temperature,
      });
      if (text && text.trim().length > 20) {
        setCached(cacheKey, text);
        return {
          status: "backup",
          provider: "groq",
          content: text,
          meta: {
            promptType: input.promptType,
            reason: "Primary provider unavailable",
          },
        };
      }
    } catch (e) {
      console.warn("[AI Router] Groq failed, trying OpenAI:", (e as Error).message);
    }
  }

  // 3. Try OpenAI (Solid Backstop)
  if (isOpenAIAvailable()) {
    try {
      const text = await generateTextOpenAI({
        prompt: input.prompt,
        systemPrompt: input.systemPrompt,
        temperature,
      });
      if (text && text.trim().length > 20) {
        setCached(cacheKey, text);
        return {
          status: "backup",
          provider: "openai",
          content: text,
          meta: {
            promptType: input.promptType,
            reason: "Multiple providers failed",
          },
        };
      }
    } catch (e) {
      console.warn("[AI Router] OpenAI also failed:", (e as Error).message);
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
  if (isGeminiAvailable()) {
    try {
      const stream = geminiStreamChat({
        systemInstruction: input.systemInstruction,
        history: input.history.map((h) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
        message: input.message,
        temperature: input.temperature ?? 0.8,
      });

      let yielded = false;
      for await (const chunk of stream) {
        if (chunk) {
          yielded = true;
          yield { chunk, status: "live", provider: "gemini" };
        }
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

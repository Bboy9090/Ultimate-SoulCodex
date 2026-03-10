import { generateText, isGeminiAvailable, streamChat as geminiStreamChat } from "../gemini";
import { generateTextGroq, isGroqAvailable, streamChatGroq } from "./groq";

export type AIProvider = "gemini" | "groq" | "none";

export function getAvailableProvider(): AIProvider {
  if (isGeminiAvailable()) return "gemini";
  if (isGroqAvailable()) return "groq";
  return "none";
}

export function isAnyProviderAvailable(): boolean {
  return getAvailableProvider() !== "none";
}

export async function generateTextMulti({
  prompt,
  systemPrompt,
  temperature = 0.7,
}: {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}): Promise<{ text: string; provider: AIProvider }> {
  if (isGeminiAvailable()) {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const text = await generateText({ prompt: fullPrompt, temperature });
      if (text) return { text, provider: "gemini" };
    } catch (e) {
      console.warn("[AI Provider] Gemini failed, falling back to Groq:", e);
    }
  }

  if (isGroqAvailable()) {
    try {
      const text = await generateTextGroq({ prompt, systemPrompt, temperature });
      if (text) return { text, provider: "groq" };
    } catch (e) {
      console.error("[AI Provider] Groq also failed:", e);
    }
  }

  return { text: "", provider: "none" };
}

export async function* streamChatMulti({
  systemInstruction,
  history,
  message,
  temperature = 0.7,
}: {
  systemInstruction: string;
  history: { role: string; content: string }[];
  message: string;
  temperature?: number;
}): AsyncGenerator<string> {
  if (isGeminiAvailable()) {
    try {
      const stream = geminiStreamChat({
        model: "gemini-1.5-flash",
        systemInstruction,
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
        message,
        temperature,
      });

      let yielded = false;
      for await (const chunk of stream) {
        if (chunk) {
          yielded = true;
          yield chunk;
        }
      }
      if (yielded) return;
    } catch (e) {
      console.warn("[AI Provider] Gemini stream failed, falling back to Groq:", e);
    }
  }

  if (isGroqAvailable()) {
    try {
      const stream = streamChatGroq({
        systemInstruction,
        history: history.map(h => ({
          role: h.role,
          content: typeof h.content === "string"
            ? h.content
            : (h as any).parts?.[0]?.text || "",
        })),
        message,
        temperature,
      });

      for await (const chunk of stream) {
        if (chunk) yield chunk;
      }
      return;
    } catch (e) {
      console.error("[AI Provider] Groq stream also failed:", e);
    }
  }

  yield "The Soul Guide is reconnecting. Please try again in a moment.";
}

import { GoogleGenAI } from "@google/genai";

const apiKey  = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

// When using Replit AI integrations the key may be "_DUMMY_API_KEY_" — that is correct.
// The proxy handles real auth via the base URL; the dummy key is just a placeholder.
const integrationMode = !!baseUrl && !!apiKey;
const directKeyMode   = !!apiKey && apiKey !== "_DUMMY_API_KEY_";
const available       = integrationMode || directKeyMode;

if (!available) {
  console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
} else {
  console.log(`[Gemini] Ready — ${integrationMode ? "Replit AI integration" : "direct key"}`);
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  ...(baseUrl ? { httpOptions: { baseUrl, apiVersion: "" } } : {}),
});

const DEFAULT_MODEL = "gemini-2.5-flash";

export function isGeminiAvailable() {
  return available;
}

export async function generateText({ model, prompt, temperature = 0.7 }: { model?: string; prompt: string; temperature?: number; }): Promise<string> {
  if (!isGeminiAvailable()) return "";
  try {
    const response = await ai.models.generateContent({
      model: model || DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature, maxOutputTokens: 1024 },
    });
    return response.text ?? "";
  } catch (e) {
    console.error("Gemini generateText error:", e);
    return "";
  }
}

export async function* streamChat({ model, systemInstruction, history, message, temperature }: any) {
  // Build contents array from history + new message
  const contents: any[] = [];

  if (history && Array.isArray(history)) {
    for (const h of history) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content ?? h.parts?.[0]?.text ?? "" }],
      });
    }
  }

  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const stream = await ai.models.generateContentStream({
      model: model || DEFAULT_MODEL,
      contents,
      config: {
        temperature: temperature ?? 0.7,
        maxOutputTokens: 1000,
        systemInstruction: systemInstruction ?? undefined,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
}

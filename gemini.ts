import { GoogleGenAI } from "@google/genai";

// Use Replit AI integration for Gemini
const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Check if configured
const hasReplitIntegration = !!baseUrl && !!apiKey;
const hasManualKey = !baseUrl && !!apiKey && apiKey !== "_DUMMY_API_KEY_";

if (!hasReplitIntegration && !hasManualKey) {
  console.warn("Gemini AI not configured. AI features will use fallback templates.");
} else {
  console.log("Gemini AI configured via", hasReplitIntegration ? "Replit AI integration" : "manual API key");
}

// Support both a provider-proxy integration and a direct Gemini API key.
// Never instantiate a client for the placeholder/dummy key.
const ai = hasReplitIntegration
  ? new GoogleGenAI({
      apiKey: apiKey!,
      httpOptions: {
        apiVersion: "",
        baseUrl: baseUrl,
      },
    })
  : hasManualKey ? new GoogleGenAI({ apiKey: apiKey! }) : null;

export function isGeminiAvailable() {
  return hasReplitIntegration || hasManualKey;
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export async function generateText({ model, prompt, temperature = 0.7 }: { model?: string; prompt: string; temperature?: number; }): Promise<string> {
  if (!isGeminiAvailable() || !ai) return "";
  try {
    const response = await ai.models.generateContent({
      model: model || DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature,
        maxOutputTokens: 1024,
      },
    });
    return response.text || "";
  } catch (e) {
    console.error("Gemini generateText error:", e);
    return "";
  }
}

export async function* streamChat({ model, systemInstruction, history, message, temperature }: any) {
  if (!ai) throw new Error("Gemini not configured");
  
  const contents = [
    ...history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content ?? h.parts?.[0]?.text ?? "" }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const stream = await ai.models.generateContentStream({
      model: model || DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: temperature || 0.7,
        maxOutputTokens: 1000,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('abort')) {
      console.log("[Gemini] Stream aborted");
      return;
    }
    console.error("Gemini Stream Error:", error);
    throw error;
  }
}

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

// Create Gemini client with Replit AI integration
const ai = hasReplitIntegration 
  ? new GoogleGenAI({
      apiKey: apiKey!,
      httpOptions: {
        apiVersion: "",
        baseUrl: baseUrl,
      },
    })
  : null;

export function isGeminiAvailable() {
  return hasReplitIntegration || hasManualKey;
}

export async function generateText({ model, prompt, temperature = 0.7 }: { model?: string; prompt: string; temperature?: number; }): Promise<string> {
  if (!isGeminiAvailable() || !ai) return "";
  try {
    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
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
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const stream = await ai.models.generateContentStream({
      model: model || "gemini-2.5-flash",
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
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
}

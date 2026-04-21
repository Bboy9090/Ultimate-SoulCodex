import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const available = !!apiKey;

if (!available) {
  console.warn("GOOGLE_API_KEY is missing. AI features will be disabled.");
} else {
  console.log("[Gemini] Ready — manual API key mode");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
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
      config: { temperature, maxOutputTokens: 2048 },
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
        maxOutputTokens: 2048,
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

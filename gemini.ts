import { GoogleGenAI } from "@google/genai";

// Use direct API key to avoid Replit dependency
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "_DUMMY_API_KEY_") {
  console.warn("[Gemini] API key is missing. AI features will use fallback templates.");
} else {
  console.log("[Gemini] Configured with direct API key");
}

// Create Gemini client
const ai = apiKey && apiKey !== "_DUMMY_API_KEY_"
  ? new GoogleGenAI({
      apiKey: apiKey,
    })
  : null;

export function isGeminiAvailable() {
  return !!ai;
}

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function generateText({ model, prompt, temperature = 0.7 }: { model?: string; prompt: string; temperature?: number; }): Promise<string> {
  if (!ai) return "";
  try {
    const response = await ai.models.generateContent({
      model: model || DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature,
        maxOutputTokens: 2048,
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
    ...(history || []).map((h: any) => ({
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
        systemInstruction: systemInstruction ?? undefined,
        temperature: temperature || 0.7,
        maxOutputTokens: 2048,
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

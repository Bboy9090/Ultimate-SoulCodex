import { GoogleGenerativeAI } from "@google/generative-ai";

// Standardizing for Render deployment
const apiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

if (!apiKey || apiKey === "_DUMMY_API_KEY_") {
  console.warn("GEMINI_API_KEY is missing or dummy. AI features will be disabled.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export function isGeminiAvailable() {
  return !!apiKey && apiKey !== "_DUMMY_API_KEY_";
}

export async function generateText({ model, prompt, temperature = 0.7 }: { model?: string; prompt: string; temperature?: number; }): Promise<string> {
  if (!isGeminiAvailable()) return "";
  try {
    const geminiModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });
    const result = await geminiModel.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 1024,
      }
    });
    const text = result.response.text();
    return text || "";
  } catch (e) {
    console.error("Gemini generateText error:", e);
    return "";
  }
}

export async function* streamChat({ model, systemInstruction, history, message, temperature }: any) {
  const geminiModel = genAI.getGenerativeModel({ 
    model: model || "gemini-1.5-flash",
    systemInstruction 
  });

  const chat = geminiModel.startChat({
    history: history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    generationConfig: { 
      temperature: temperature || 0.7,
      maxOutputTokens: 1000,
    }
  });

  try {
    const result = await chat.sendMessageStream(message);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
}

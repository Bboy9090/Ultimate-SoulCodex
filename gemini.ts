import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the standard key name we set in Render
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("CRITICAL: GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function* streamChat({ model, systemInstruction, history, message, temperature }: any) {
  // Use "gemini-1.5-flash" or "gemini-2.0-flash" for 2025 speed
  const geminiModel = genAI.getGenerativeModel({ 
    model: model || "gemini-1.5-flash",
    systemInstruction 
  });

  const chat = geminiModel.startChat({
    history: history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    generationConfig: { temperature: temperature || 0.7 }
  });

  const result = await chat.sendMessageStream(message);
  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}

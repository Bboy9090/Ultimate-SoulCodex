import { GoogleGenAI } from "@google/genai";

// Using Replit's AI Integrations service for Gemini (no API key needed, billed to Replit credits)
// Reference: javascript_gemini_ai_integrations blueprint
const ai = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL && process.env.AI_INTEGRATIONS_GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      },
    })
  : null;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamChatOptions {
  model?: "gemini-2.5-flash" | "gemini-2.5-pro";
  temperature?: number;
  systemInstruction?: string;
  history?: ChatMessage[];
  message: string;
}

/**
 * Stream chat completions from Gemini (for real-time responses like Soul Guide Oracle)
 * Yields text chunks as they arrive
 */
export async function* streamChat(options: StreamChatOptions): AsyncGenerator<string> {
  if (!ai) {
    throw new Error("Gemini AI service is not available");
  }

  const {
    model = "gemini-2.5-flash",
    temperature = 0.8,
    systemInstruction,
    history = [],
    message
  } = options;

  // Convert chat history to Gemini format
  // Gemini uses "user" and "model" roles (not "assistant")
  const contents = history
    .filter(msg => msg.role !== "system") // System goes to systemInstruction
    .map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  const config: any = {
    model,
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: 8192,
    }
  };

  // Add system instruction if provided
  if (systemInstruction) {
    config.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const stream = await ai.models.generateContentStream(config);

  for await (const chunk of stream) {
    const text = chunk.text || "";
    if (text) {
      yield text;
    }
  }
}

export interface GenerateTextOptions {
  model?: "gemini-2.5-flash" | "gemini-2.5-pro";
  temperature?: number;
  prompt: string;
  systemInstruction?: string;
}

/**
 * Generate text completion from Gemini (for biography, daily guidance, etc.)
 */
export async function generateText(options: GenerateTextOptions): Promise<string> {
  if (!ai) {
    throw new Error("Gemini AI service is not available");
  }

  const {
    model = "gemini-2.5-flash",
    temperature = 0.8,
    prompt,
    systemInstruction
  } = options;

  const config: any = {
    model,
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature,
      maxOutputTokens: 8192,
    }
  };

  if (systemInstruction) {
    config.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await ai.models.generateContent(config);
  return response.text || "";
}

/**
 * Check if Gemini AI service is available
 */
export function isGeminiAvailable(): boolean {
  return ai !== null;
}

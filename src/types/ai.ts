/**
 * Shared AI response contract.
 * Every AI feature returns this shape — frontend always knows what it got.
 */

export type AIStatus = "live" | "backup" | "fallback";

export type AIProvider = "gemini" | "groq" | "deterministic" | "cache";

export type AIPromptType =
  | "soul_guide"
  | "daily_guidance"
  | "daily_horoscope"
  | "codex_reading"
  | "biography"
  | "compatibility";

export interface AIResponse {
  status: AIStatus;
  provider: AIProvider;
  title?: string;
  content: string;
  meta?: {
    reason?: string;
    cached?: boolean;
    promptType?: AIPromptType;
    clarityScore?: number;
  };
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  promptType: AIPromptType;
  temperature?: number;
  profile?: any;
  timeline?: any;
  dailyCard?: any;
}

export interface AIStreamRequest {
  systemInstruction: string;
  history: { role: string; content: string }[];
  message: string;
  temperature?: number;
  promptType: AIPromptType;
  profile?: any;
  timeline?: any;
  dailyCard?: any;
}

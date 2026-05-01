import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

export function isOpenAIAvailable(): boolean {
  return !!apiKey && apiKey !== "_DUMMY_API_KEY_";
}

const openai = isOpenAIAvailable() 
  ? new OpenAI({ apiKey })
  : null;

export async function generateTextOpenAI({
  prompt,
  systemPrompt,
  model = "gpt-4o-mini",
  temperature = 0.7,
}: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  if (!openai) return "";
  try {
    const messages: any[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 2048,
    });

    return response.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("[OpenAI] generateText error:", e);
    return "";
  }
}

export async function* streamChatOpenAI({
  systemInstruction,
  history,
  message,
  model = "gpt-4o-mini",
  temperature = 0.7,
  signal,
}: {
  systemInstruction: string;
  history: { role: string; content: string }[];
  message: string;
  model?: string;
  temperature?: number;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  if (!openai) {
    yield "Soul Guide is adjusting the cosmic frequency. Please try again.";
    return;
  }

  try {
    const messages: any[] = [
      { role: "system", content: systemInstruction },
    ];

    for (const h of history) {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      });
    }
    messages.push({ role: 'user', content: message });

    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 1000,
      stream: true,
    }, { signal });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  } catch (error) {
    console.error("[OpenAI] Stream error:", error);
    throw error;
  }
}

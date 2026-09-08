const apiKey = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_BASE = "https://api.groq.com/openai/v1";

export function isGroqAvailable(): boolean {
  return !!apiKey;
}

export async function generateTextGroq({
  prompt,
  systemPrompt,
  model = GROQ_MODEL,
  temperature = 0.7,
}: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  if (!apiKey) return "";
  try {
    const messages: { role: string; content: string }[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: 1024 }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    console.error("[Groq] generateText error:", e);
    return "";
  }
}

export async function* streamChatGroq({
  systemInstruction,
  history,
  message,
  model = GROQ_MODEL,
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
  if (!apiKey) {
    yield "Soul Guide is reconnecting. Please try again in a moment.";
    return;
  }

  try {
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemInstruction },
    ];

    for (const h of history) {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      });
    }
    messages.push({ role: "user", content: message });

    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: 1000, stream: true }),
      signal,
    });

    if (!res.ok) throw new Error(`Groq stream error: ${res.status}`);
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") return;

        try {
          const parsed = JSON.parse(payload);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // partial JSON chunk, skip
        }
      }
    }
  } catch (error) {
    console.error("[Groq] Stream error:", error);
    throw error;
  }
}

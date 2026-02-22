/**
 * OpenAI helper — replaces Manus LLM proxy.
 * Used by the AI resource assistant chat feature.
 */
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function invokeLLM({
  messages,
  model = "gpt-4o-mini",
  response_format,
}: {
  messages: Message[];
  model?: string;
  response_format?: { type: "json_schema"; json_schema: Record<string, unknown> } | { type: "text" };
}): Promise<OpenAI.Chat.ChatCompletion> {
  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
  };
  if (response_format) {
    (params as any).response_format = response_format;
  }
  return client.chat.completions.create(params);
}

export async function streamLLM({
  messages,
  model = "gpt-4o-mini",
  onChunk,
  onDone,
}: {
  messages: Message[];
  model?: string;
  onChunk: (chunk: string) => void;
  onDone: () => void;
}): Promise<void> {
  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? "";
    if (content) onChunk(content);
  }
  onDone();
}

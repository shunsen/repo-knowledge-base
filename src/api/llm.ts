import type { ChatMessage, LlmConfig } from "../types";
import { requestJson } from "./request";

interface LlmChoice {
  message: {
    role: string;
    content: string | null;
  };
}

interface LlmChatResponse {
  choices: LlmChoice[];
}

/**
 * 调用 OpenAI 兼容的 /chat/completions 接口，返回首条回复文本。
 * apiBase 形如 https://api.openai.com/v1
 */
export async function createChatCompletion(
  config: LlmConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const base = config.apiBase.replace(/\/+$/, "");
  const data = await requestJson<LlmChatResponse>(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: {
      model: config.model,
      messages: messages
        .filter((message) => message.content.length > 0)
        .map(({ role, content }) => ({ role, content })),
    },
    signal,
    timeoutMs: 60_000,
  });

  return data.choices[0]?.message.content ?? "";
}

/** 拉取 OpenAI 兼容接口的可用模型列表（GET /models），按 id 排序返回 */
export async function listModels(
  config: LlmConfig,
  signal?: AbortSignal,
): Promise<string[]> {
  const base = config.apiBase.replace(/\/+$/, "");
  const data = await requestJson<{ data: Array<{ id: string }> }>(
    `${base}/models`,
    {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal,
      timeoutMs: 15_000,
    },
  );
  return data.data.map((item) => item.id).sort();
}

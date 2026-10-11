import type { ChatMessage, LlmConfig } from '../types'
import { requestJson } from './request'

interface LlmChoice {
  message: {
    role: string
    content: string | null
  }
}

interface LlmChatResponse {
  choices: LlmChoice[]
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
  const base = config.apiBase.replace(/\/+$/, '')
  const data = await requestJson<LlmChatResponse>(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: {
      model: config.model,
      messages: messages
        .filter((message) => message.content.length > 0)
        .map(({ role, content }) => ({ role, content })),
    },
    signal,
  })

  return data.choices[0]?.message.content ?? ''
}

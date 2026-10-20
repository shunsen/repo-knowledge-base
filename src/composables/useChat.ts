import { ref } from "vue";
import { storeToRefs } from "pinia";
import { createChatCompletion } from "../api/llm";
import { useChatStore } from "../stores/chat";
import type { LlmConfig } from "../types";

/**
 * 聊天发送逻辑的组合式封装。
 * @param getLlmConfig 返回当前 LLM 配置的 getter，允许调用方动态读取表单状态
 */
export function useChat(getLlmConfig: () => LlmConfig | null) {
  const chatStore = useChatStore();
  const { messages, sending, error, messageCount } = storeToRefs(chatStore);
  const input = ref("");

  /** 发送当前输入框内容，并请求一条助手回复 */
  async function send(): Promise<void> {
    const content = input.value.trim();
    if (!content || sending.value) return;

    const llmConfig = getLlmConfig();
    if (!llmConfig || !llmConfig.apiKey || !llmConfig.model) {
      chatStore.setError("请先在上方完善 LLM 配置（API Base  / Key / 模型）");
      return;
    }

    input.value = "";
    chatStore.setError("");
    chatStore.addMessage("user", content);
    const assistant = chatStore.addMessage("assistant", "");
    chatStore.setSending(true);

    try {
      // 发送时排除刚插入的空助手占位消息
      const reply = await createChatCompletion(
        llmConfig,
        chatStore.messages.slice(0, -1),
      );
      chatStore.updateMessage(assistant.id, reply || "（模型返回了空内容）");
    } catch (err) {
      chatStore.updateMessage(assistant.id, "（回复失败，请稍后重试）");
      chatStore.setError(err instanceof Error ? err.message : "LLM 请求失败");
    } finally {
      chatStore.setSending(false);
    }
  }

  function clear() {
    chatStore.clearMessages();
    input.value = "";
  }

  return {
    input,
    messages,
    sending,
    error,
    messageCount,
    send,
    clear,
  };
}

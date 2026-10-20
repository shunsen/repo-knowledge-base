<script setup lang="ts">
import { ref, watch } from "vue";
import ChatMessageBubble from "../components/ChatMessageBubble.vue";
import { useChat } from "../composables/useChat";
import { listModels } from "../api/llm";
import type { LlmConfig } from "../types";

const API_BASE_KEY = "repo-knowledge-base:llm-api-base-v2";
const MODEL_KEY = "repo-knowledge-base:llm-model-v2";
const DEFAULT_API_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-flash";

const apiBase = ref(localStorage.getItem(API_BASE_KEY) ?? DEFAULT_API_BASE);
const model = ref(localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL);
// 构建时注入的 Key 作为默认值，用户在表单中可覆盖
const apiKey = ref(import.meta.env.VITE_LLM_API_KEY ?? "");

watch(apiBase, (value) => localStorage.setItem(API_BASE_KEY, value));
watch(model, (value) => localStorage.setItem(MODEL_KEY, value));

// 模型下拉候选：根据 API Base + Key 自动拉取 /models，拉取失败则退化为手输
const modelOptions = ref<string[]>([]);
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let refreshAbort: AbortController | undefined;

async function refreshModelOptions() {
  const base = apiBase.value.trim();
  const key = apiKey.value.trim();
  if (!base || !key) {
    modelOptions.value = [];
    return;
  }
  refreshAbort?.abort();
  refreshAbort = new AbortController();
  try {
    modelOptions.value = await listModels(
      { apiBase: base, apiKey: key, model: model.value },
      refreshAbort.signal,
    );
  } catch {
    modelOptions.value = [];
  }
}

watch(
  [apiBase, apiKey],
  () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshModelOptions, 600);
  },
  { immediate: true },
);

const { input, messages, sending, error, send, clear } = useChat(
  (): LlmConfig | null => {
    const base = apiBase.value.trim();
    const key = apiKey.value.trim();
    const modelName = model.value.trim();
    if (!base || !key || !modelName) return null;
    return { apiBase: base, apiKey: key, model: modelName };
  },
);
</script>

<template>
  <section class="chat">
    <h2>知识库问答</h2>

    <form class="llm-config" @submit.prevent="">
      <label class="field">
        <span>API Base</span>
        <input
          v-model="apiBase"
          type="text"
          placeholder="https://api.deepseek.com"
        />
      </label>
      <label class="field">
        <span>模型</span>
        <input
          v-model="model"
          type="text"
          list="llm-model-options"
          placeholder="gpt-4o-mini"
        />
        <datalist id="llm-model-options">
          <option
            v-for="option in modelOptions"
            :key="option"
            :value="option"
          />
        </datalist>
      </label>
      <label class="field">
        <span>API Key</span>
        <input
          v-model="apiKey"
          type="password"
          placeholder="sk-..."
          autocomplete="off"
        />
      </label>
    </form>
    <p class="hint">
      填入 Key 后会自动拉取该服务商的可用模型供下拉选择。API Base 需与 Key
      的服务商匹配， 如 DeepSeek 用 <code>https://api.deepseek.com</code>（不带
      /v1）。
    </p>

    <div class="messages">
      <p v-if="messages.length === 0" class="empty">
        还没有对话，先发送一条消息吧。
      </p>
      <ChatMessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="composer">
      <textarea
        v-model="input"
        rows="3"
        placeholder="输入问题，Enter 发送，Shift+Enter 换行"
        @keydown.enter.exact.prevent="send"
      ></textarea>
      <div class="composer-actions">
        <button type="button" class="ghost" @click="clear">清空对话</button>
        <button type="button" class="primary" :disabled="sending" @click="send">
          {{ sending ? "发送中…" : "发送" }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chat {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.llm-config {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.field input,
.composer textarea {
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.hint {
  margin: -6px 0 0;
  color: #909399;
  font-size: 12px;
}

.hint code {
  padding: 1px 4px;
  border-radius: 4px;
  background: #f4f4f5;
  font-size: 12px;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px;
  max-height: 46vh;
  overflow-y: auto;
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.empty {
  margin: auto;
  color: #909399;
  font-size: 13px;
}

.composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: #fff;
  cursor: pointer;
}

button.primary {
  border-color: #409eff;
  background: #409eff;
  color: #fff;
}

button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 0;
  color: #f56c6c;
  font-size: 13px;
}
</style>

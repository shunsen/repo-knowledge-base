<script setup lang="ts">
import { ref, watch } from 'vue'
import ChatMessageBubble from '../components/ChatMessageBubble.vue'
import { useChat } from '../composables/useChat'
import type { LlmConfig } from '../types'

const API_BASE_KEY = 'repo-knowledge-base:llm-api-base'
const MODEL_KEY = 'repo-knowledge-base:llm-model'
const DEFAULT_API_BASE = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4o-mini'

const apiBase = ref(localStorage.getItem(API_BASE_KEY) ?? DEFAULT_API_BASE)
const model = ref(localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL)
// 构建时注入的 Key 作为默认值，用户在表单中可覆盖
const apiKey = ref(import.meta.env.VITE_LLM_API_KEY ?? '')

watch(apiBase, (value) => localStorage.setItem(API_BASE_KEY, value))
watch(model, (value) => localStorage.setItem(MODEL_KEY, value))

const { input, messages, sending, error, send, clear } = useChat((): LlmConfig | null => {
  const base = apiBase.value.trim()
  const key = apiKey.value.trim()
  const modelName = model.value.trim()
  if (!base || !key || !modelName) return null
  return { apiBase: base, apiKey: key, model: modelName }
})
</script>

<template>
  <section class="chat">
    <h2>知识库问答</h2>

    <form class="llm-config" @submit.prevent="">
      <label class="field">
        <span>API Base</span>
        <input v-model="apiBase" type="text" placeholder="https://api.openai.com/v1" />
      </label>
      <label class="field">
        <span>模型</span>
        <input v-model="model" type="text" placeholder="gpt-4o-mini" />
      </label>
      <label class="field">
        <span>API Key</span>
        <input v-model="apiKey" type="password" placeholder="sk-..." autocomplete="off" />
      </label>
    </form>

    <div class="messages">
      <p v-if="messages.length === 0" class="empty">还没有对话，先发送一条消息吧。</p>
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
          {{ sending ? '发送中…' : '发送' }}
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

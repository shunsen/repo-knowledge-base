import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatMessage, ChatRole } from '../types'

let messageSeq = 0

function createMessage(role: ChatRole, content: string): ChatMessage {
  messageSeq += 1
  return {
    id: `${Date.now()}-${messageSeq}`,
    role,
    content,
    createdAt: Date.now(),
  }
}

/** 聊天会话状态 */
export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const sending = ref(false)
  const error = ref('')

  const messageCount = computed(() => messages.value.length)

  function addMessage(role: ChatRole, content: string): ChatMessage {
    const message = createMessage(role, content)
    messages.value.push(message)
    return message
  }

  function updateMessage(id: string, content: string) {
    const target = messages.value.find((message) => message.id === id)
    if (target) {
      target.content = content
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = ''
  }

  function setSending(value: boolean) {
    sending.value = value
  }

  function setError(value: string) {
    error.value = value
  }

  return {
    messages,
    sending,
    error,
    messageCount,
    addMessage,
    updateMessage,
    clearMessages,
    setSending,
    setError,
  }
})

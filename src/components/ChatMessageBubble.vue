<script setup lang="ts">
import type { ChatMessage, ChatRole } from '../types'

defineProps<{ message: ChatMessage }>()

const roleLabels: Record<ChatRole, string> = {
  system: '系统',
  user: '我',
  assistant: '助手',
}
</script>

<template>
  <div class="bubble" :class="`is-${message.role}`">
    <span class="role">{{ roleLabels[message.role] }}</span>
    <p class="content">{{ message.content || '…' }}</p>
  </div>
</template>

<style scoped>
.bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f4f4f5;
}

.bubble.is-user {
  align-self: flex-end;
  background: #e6f4ff;
}

.bubble.is-assistant {
  align-self: flex-start;
}

.bubble.is-system {
  align-self: center;
  background: #fff7e6;
  font-size: 13px;
}

.role {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

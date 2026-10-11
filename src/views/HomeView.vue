<script setup lang="ts">
import { useRepoConfig } from '../composables/useRepoConfig'

const {
  fullName,
  token,
  formError,
  repoInfo,
  loading,
  error,
  loadRepoInfo,
  resetConfig,
} = useRepoConfig()
</script>

<template>
  <section class="home">
    <h2>仓库配置</h2>
    <form class="repo-form" @submit.prevent="loadRepoInfo">
      <label class="field">
        <span>仓库全名</span>
        <input
          v-model="fullName"
          type="text"
          placeholder="owner/repo，如 vuejs/core"
          autocomplete="off"
        />
      </label>
      <label class="field">
        <span>GitHub Token（可选）</span>
        <input
          v-model="token"
          type="password"
          placeholder="匿名调用时可留空"
          autocomplete="off"
        />
      </label>
      <p v-if="formError" class="error">{{ formError }}</p>
      <div class="actions">
        <button type="submit" class="primary" :disabled="loading">
          {{ loading ? '加载中…' : '保存并加载' }}
        </button>
        <button type="button" class="ghost" @click="resetConfig">重置</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <article v-if="repoInfo" class="repo-card">
      <h3>
        <a :href="repoInfo.htmlUrl" target="_blank" rel="noopener noreferrer">
          {{ repoInfo.fullName }}
        </a>
      </h3>
      <p>{{ repoInfo.description }}</p>
      <ul class="meta">
        <li>语言：{{ repoInfo.language }}</li>
        <li>Stars：{{ repoInfo.stargazersCount }}</li>
        <li>Forks：{{ repoInfo.forksCount }}</li>
        <li>更新时间：{{ repoInfo.updatedAt }}</li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.home {
  max-width: 640px;
  margin: 0 auto;
}

.repo-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.field input {
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
}

.actions {
  display: flex;
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

.repo-card {
  margin-top: 24px;
  padding: 16px 18px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.repo-card h3 {
  margin: 0 0 8px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  color: #606266;
  font-size: 13px;
}
</style>

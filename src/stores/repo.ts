import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getRepo } from '../api/github'
import type { RepoConfig, RepoInfo } from '../types'

/** 仓库配置与仓库信息的全局状态 */
export const useRepoStore = defineStore('repo', () => {
  const config = ref<RepoConfig | null>(null)
  const repoInfo = ref<RepoInfo | null>(null)
  const loading = ref(false)
  const error = ref('')

  const isConfigured = computed(() => config.value !== null)

  function setConfig(next: RepoConfig) {
    config.value = next
  }

  function reset() {
    config.value = null
    repoInfo.value = null
    error.value = ''
  }

  /** 拉取当前配置对应仓库的摘要信息 */
  async function fetchRepoInfo() {
    if (!config.value) return
    loading.value = true
    error.value = ''
    try {
      repoInfo.value = await getRepo(config.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取仓库信息失败'
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    repoInfo,
    loading,
    error,
    isConfigured,
    setConfig,
    reset,
    fetchRepoInfo,
  }
})

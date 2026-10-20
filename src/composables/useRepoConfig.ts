import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRepoStore } from "../stores/repo";
import { parseRepoFullName } from "../utils/dataClean";
import type { RepoConfig } from "../types";

const STORAGE_KEY = "repo-knowledge-base:repo";

/** 构建时注入的 GitHub Token，作为表单默认值（不会持久化到 localStorage） */
const ENV_GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN ?? "";

/** 读取本地缓存的 owner/repo（不缓存 token，避免敏感信息落盘） */
function loadStoredFullName(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

/** 仓库配置表单与状态的组合式封装 */
export function useRepoConfig() {
  const repoStore = useRepoStore();
  const { config, repoInfo, loading, error } = storeToRefs(repoStore);

  const fullName = ref(
    config.value
      ? `${config.value.owner}/${config.value.repo}`
      : loadStoredFullName(),
  );
  const token = ref(config.value?.token ?? ENV_GITHUB_TOKEN);
  const formError = ref("");

  const isConfigured = computed(() => config.value !== null);

  // 首次使用时，用本地缓存恢复 store 中的配置
  const stored = parseRepoFullName(fullName.value);
  if (stored && !config.value) {
    repoStore.setConfig({ owner: stored.owner, repo: stored.repo });
  }

  watch(config, (next) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, `${next.owner}/${next.repo}`);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  /** 校验并保存表单中的仓库配置，成功返回 true */
  function saveConfig(): boolean {
    const parsed = parseRepoFullName(fullName.value);
    if (!parsed) {
      formError.value = "请输入正确的仓库全名，格式为 owner/repo";
      return false;
    }
    formError.value = "";
    const next: RepoConfig = {
      owner: parsed.owner,
      repo: parsed.repo,
      token: token.value.trim() || undefined,
    };
    repoStore.setConfig(next);
    return true;
  }

  /** 保存配置并拉取仓库信息 */
  async function loadRepoInfo(): Promise<boolean> {
    if (!saveConfig()) return false;
    await repoStore.fetchRepoInfo();
    return !error.value;
  }

  function resetConfig() {
    repoStore.reset();
    fullName.value = "";
    token.value = "";
    formError.value = "";
  }

  return {
    fullName,
    token,
    formError,
    config,
    repoInfo,
    loading,
    error,
    isConfigured,
    saveConfig,
    loadRepoInfo,
    resetConfig,
  };
}

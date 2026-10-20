import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { listIssues } from "../api/github";
import type { RepoConfig, RepoIssue } from "../types";

/** 默认每页条数 */
export const DEFAULT_PAGE_SIZE = 20;

/** Issue 列表状态（GitHub 服务端分页，总页数来自 Link 响应头） */
export const useIssuesStore = defineStore("issues", () => {
  const issues = ref<RepoIssue[]>([]);
  const page = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const totalPages = ref(1);
  /** 仓库 Issue 总数超出 Search API 的 1000 条窗口，仅部分可浏览 */
  const truncated = ref(false);
  const loading = ref(false);
  const error = ref("");

  const hasMore = computed(() => page.value < totalPages.value);

  /** 拉取指定页的 Issues（Search API 服务端排除 PR，每页条数精确） */
  async function fetchPage(
    config: RepoConfig,
    targetPage = page.value,
    targetSize = pageSize.value,
  ): Promise<void> {
    loading.value = true;
    error.value = "";
    try {
      const result = await listIssues(config, {
        page: targetPage,
        perPage: targetSize,
      });
      issues.value = result.items;
      page.value = targetPage;
      pageSize.value = targetSize;
      totalPages.value = Math.max(1, result.totalPages);
      truncated.value = result.truncated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取 Issues 失败";
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    issues.value = [];
    page.value = 1;
    pageSize.value = DEFAULT_PAGE_SIZE;
    totalPages.value = 1;
    truncated.value = false;
    error.value = "";
  }

  return {
    issues,
    page,
    pageSize,
    totalPages,
    truncated,
    loading,
    error,
    hasMore,
    fetchPage,
    reset,
  };
});

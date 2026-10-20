<script setup lang="ts">
import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRepoStore } from "../stores/repo";
import { useIssuesStore } from "../stores/issues";
import { truncateText } from "../utils/dataClean";
import AppPagination from "../components/AppPagination.vue";

const repoStore = useRepoStore();
const { config } = storeToRefs(repoStore);
const issuesStore = useIssuesStore();
const { issues, page, pageSize, totalPages, truncated, loading, error } =
  storeToRefs(issuesStore);

function load(targetPage: number, targetSize: number) {
  if (config.value) {
    issuesStore.fetchPage(config.value, targetPage, targetSize);
  }
}

onMounted(() => {
  if (config.value && issues.value.length === 0) {
    load(1, pageSize.value);
  }
});

// 仓库配置变化时重新拉取
watch(config, (next, prev) => {
  if (next && (!prev || next.owner !== prev.owner || next.repo !== prev.repo)) {
    load(1, pageSize.value);
  }
});
</script>

<template>
  <section class="issues">
    <h2>Issues 浏览</h2>

    <p v-if="!config" class="empty">
      尚未配置仓库，请先在「仓库配置」页填写 owner/repo。
    </p>

    <template v-else>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="loading">加载中…</p>

      <ul v-else-if="issues.length > 0" class="issue-list">
        <li v-for="issue in issues" :key="issue.id" class="issue-item">
          <div class="issue-head">
            <span class="state" :class="`is-${issue.state}`">
              {{ issue.state === "open" ? "开放" : "关闭" }}
            </span>
            <a
              :href="issue.htmlUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="title"
            >
              #{{ issue.number }} {{ truncateText(issue.title, 80) }}
            </a>
          </div>
          <p v-if="issue.body" class="body">
            {{ truncateText(issue.body, 120) }}
          </p>
          <div class="meta">
            <span>@{{ issue.author }}</span>
            <span>评论 {{ issue.commentsCount }}</span>
            <span>更新于 {{ issue.updatedAt.slice(0, 10) }}</span>
            <span v-for="label in issue.labels" :key="label" class="label">{{
              label
            }}</span>
          </div>
        </li>
      </ul>

      <p v-else-if="!loading && !error" class="empty">该仓库没有 Issue。</p>

      <template v-if="!loading && !error && issues.length > 0">
        <p v-if="truncated" class="truncated-hint">
          受 GitHub Search API 限制，仅可浏览最近 1000 条 Issue。
        </p>
        <AppPagination
          :page="page"
          :total-pages="totalPages"
          :page-size="pageSize"
          :disabled="loading"
          @change="load"
        />
      </template>
    </template>
  </section>
</template>

<style scoped>
.issues {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.issue-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.issue-item {
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.issue-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.state {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #fff;
}

.state.is-open {
  background: #67c23a;
}

.state.is-closed {
  background: #f56c6c;
}

.title {
  color: #303133;
  text-decoration: none;
  font-weight: 600;
}

.title:hover {
  color: #409eff;
}

.body {
  margin: 8px 0 0;
  color: #606266;
  font-size: 13px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.label {
  padding: 1px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
}

.truncated-hint {
  margin: 0;
  color: #e6a23c;
  font-size: 12px;
  text-align: center;
}

.empty,
.loading,
.error {
  margin: 0;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

.error {
  color: #f56c6c;
}
</style>

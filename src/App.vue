<script setup lang="ts">
import { shallowRef } from "vue";
import type { Component } from "vue";
import HomeView from "./views/HomeView.vue";
import IssuesView from "./views/IssuesView.vue";
import ChatView from "./views/ChatView.vue";

type TabKey = "home" | "issues" | "chat";

const tabs: ReadonlyArray<{
  key: TabKey;
  label: string;
  component: Component;
}> = [
  { key: "home", label: "仓库配置", component: HomeView },
  { key: "issues", label: "Issues 浏览", component: IssuesView },
  { key: "chat", label: "知识库问答", component: ChatView },
];

const activeTab = shallowRef<TabKey>("home");

function resolveComponent(key: TabKey): Component {
  return tabs.find((tab) => tab.key === key)?.component ?? HomeView;
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Repo Knowledge Base</h1>
      <nav class="app-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </header>
    <main class="app-main">
      <component :is="resolveComponent(activeTab)" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #ebeef5;
}

.app-header h1 {
  margin: 0;
  font-size: 18px;
}

.app-nav {
  display: flex;
  gap: 8px;
}

.app-nav button {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.app-nav button.active {
  border-color: #409eff;
  color: #409eff;
}

.app-main {
  padding: 24px;
}
</style>

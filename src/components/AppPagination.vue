<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { buildPageNumbers, type PageNumberItem } from "../utils/pagination";

const props = withDefaults(
  defineProps<{
    /** 当前页码（1 起） */
    page: number;
    /** 总页数 */
    totalPages: number;
    /** 每页条数 */
    pageSize: number;
    /** 每页条数候选项 */
    pageSizeOptions?: number[];
    /** 加载中时禁用全部控件 */
    disabled?: boolean;
  }>(),
  { pageSizeOptions: () => [10, 20, 30, 50], disabled: false },
);

const emit = defineEmits<{
  /** 页码或每页条数变化，参数为新的页码与每页条数 */
  change: [page: number, pageSize: number];
}>();

const jumperValue = ref("");
watch(
  () => props.page,
  (value) => {
    jumperValue.value = String(value);
  },
  { immediate: true },
);

const pageNumbers = computed<PageNumberItem[]>(() =>
  buildPageNumbers(props.page, props.totalPages),
);

function goTo(target: number) {
  if (props.disabled || props.totalPages < 1) return;
  const clamped = Math.min(Math.max(Math.floor(target), 1), props.totalPages);
  if (clamped === props.page) return;
  emit("change", clamped, props.pageSize);
}

function onSizeChange(event: Event) {
  const select = event.currentTarget as HTMLSelectElement;
  emit("change", 1, Number(select.value));
}

function onJumperConfirm() {
  const target = Number(jumperValue.value);
  jumperValue.value = String(props.page);
  if (Number.isFinite(target) && target >= 1) {
    goTo(target);
  }
}
</script>

<template>
  <nav class="pagination" aria-label="分页">
    <span class="info">共 {{ totalPages }} 页</span>

    <label class="size">
      每页
      <select :value="pageSize" :disabled="disabled" @change="onSizeChange">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }} 条
        </option>
      </select>
    </label>

    <button
      type="button"
      class="nav"
      :disabled="disabled || page <= 1"
      @click="goTo(props.page - 1)"
    >
      上一页
    </button>

    <template v-for="(item, index) in pageNumbers" :key="`${item}-${index}`">
      <button
        v-if="typeof item === 'number'"
        type="button"
        class="number"
        :class="{ active: item === page }"
        :disabled="disabled"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
      <span v-else class="ellipsis">…</span>
    </template>

    <button
      type="button"
      class="nav"
      :disabled="disabled || page >= totalPages"
      @click="goTo(props.page + 1)"
    >
      下一页
    </button>

    <span class="jumper">
      跳至
      <input
        v-model="jumperValue"
        type="number"
        min="1"
        :max="totalPages"
        :disabled="disabled || totalPages < 1"
        @change="onJumperConfirm"
      />
      页
    </span>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.info,
.size,
.jumper {
  white-space: nowrap;
}

.size select {
  margin: 0 2px;
  padding: 4px 6px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.pagination button {
  min-width: 30px;
  padding: 5px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  color: #303133;
  font: inherit;
  cursor: pointer;
}

.pagination button:hover:not(:disabled):not(.active) {
  color: #409eff;
  border-color: #409eff;
}

.pagination button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
  cursor: default;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ellipsis {
  padding: 0 2px;
  color: #909399;
}

.jumper input {
  width: 52px;
  padding: 4px 6px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font: inherit;
  text-align: center;
}

.jumper input::-webkit-outer-spin-button,
.jumper input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}
</style>

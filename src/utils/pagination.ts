import type { Paginated } from "../types";

/** 根据总条数与每页条数计算总页数（至少为 1） */
export function getTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.max(1, Math.ceil(total / pageSize));
}

/** 将数组按页码切片，返回带分页元信息的结果 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): Paginated<T> {
  if (pageSize <= 0) {
    throw new Error("pageSize 必须大于 0");
  }
  const currentPage = Math.max(1, page);
  const start = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    pageSize,
    total: items.length,
    totalPages: getTotalPages(items.length, pageSize),
    items: items.slice(start, start + pageSize),
  };
}

/** 页码序列中的省略号占位 */
export type PageNumberItem = number | "ellipsis";

/**
 * 生成带省略号的页码序列，如 [1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]。
 * 首尾页码始终保留，中间展示以 current 为中心的 windowSize 个页码。
 */
export function buildPageNumbers(
  current: number,
  total: number,
  windowSize = 5,
): PageNumberItem[] {
  if (total <= 0) return [];
  if (total <= windowSize + 2) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const start = Math.max(2, current - Math.floor(windowSize / 2));
  const end = Math.min(total - 1, start + windowSize - 1);
  const adjustedStart = Math.max(2, end - windowSize + 1);

  const items: PageNumberItem[] = [1];
  if (adjustedStart > 2) items.push("ellipsis");
  for (let p = adjustedStart; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

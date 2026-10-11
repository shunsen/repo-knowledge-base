import type { Paginated } from '../types'

/** 根据总条数与每页条数计算总页数（至少为 1） */
export function getTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 0
  return Math.max(1, Math.ceil(total / pageSize))
}

/** 将数组按页码切片，返回带分页元信息的结果 */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  if (pageSize <= 0) {
    throw new Error('pageSize 必须大于 0')
  }
  const currentPage = Math.max(1, page)
  const start = (currentPage - 1) * pageSize
  return {
    page: currentPage,
    pageSize,
    total: items.length,
    totalPages: getTotalPages(items.length, pageSize),
    items: items.slice(start, start + pageSize),
  }
}

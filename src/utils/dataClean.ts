import type { RepoConfig } from '../types'

/** 去除首尾空白，并将连续空白压缩为单个空格 */
export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

/** 超过最大长度时截断，并以省略号结尾 */
export function truncateText(input: string, maxLength: number): string {
  if (maxLength <= 0) return ''
  return input.length > maxLength ? `${input.slice(0, maxLength)}…` : input
}

/**
 * 解析 owner/repo 形式的仓库全名。
 * 解析失败返回 null，便于表单层做校验提示。
 */
export function parseRepoFullName(fullName: string): Pick<RepoConfig, 'owner' | 'repo'> | null {
  const match = normalizeWhitespace(fullName).match(/^([\w.-]+)\/([\w.-]+)$/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

/** 移除 Markdown 链接语法，保留链接文本 */
export function stripMarkdownLinks(input: string): string {
  return input.replace(/\[([^\]]+)]\((?!\))[^)]*\)/g, '$1')
}

/** 清洗可能为 null/undefined 的文本字段，统一兜底为空字符串并归一化空白 */
export function cleanNullableText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const normalized = normalizeWhitespace(value)
  return normalized || fallback
}

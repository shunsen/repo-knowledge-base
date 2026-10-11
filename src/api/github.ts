import type { RepoConfig, RepoContent, RepoContentType, RepoInfo } from '../types'
import { cleanNullableText } from '../utils/dataClean'
import { requestJson } from './request'

const GITHUB_API_BASE = 'https://api.github.com'
const ALLOWED_CONTENT_TYPES: readonly RepoContentType[] = ['file', 'dir', 'symlink', 'submodule']

interface GitHubRepoRaw {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
}

interface GitHubContentRaw {
  name: string
  path: string
  sha: string
  type: string
  size: number
  url: string
}

function buildHeaders(config: RepoConfig): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`
  }
  return headers
}

function toRepoInfo(raw: GitHubRepoRaw): RepoInfo {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: cleanNullableText(raw.description, '暂无描述'),
    htmlUrl: raw.html_url,
    language: cleanNullableText(raw.language, 'Unknown'),
    stargazersCount: raw.stargazers_count,
    forksCount: raw.forks_count,
    updatedAt: raw.updated_at,
  }
}

function toRepoContent(raw: GitHubContentRaw): RepoContent {
  const type = ALLOWED_CONTENT_TYPES.includes(raw.type as RepoContentType)
    ? (raw.type as RepoContentType)
    : 'file'
  return {
    name: raw.name,
    path: raw.path,
    sha: raw.sha,
    type,
    size: raw.size,
    url: raw.url,
  }
}

/** 获取仓库摘要信息 */
export async function getRepo(config: RepoConfig): Promise<RepoInfo> {
  const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}`
  const raw = await requestJson<GitHubRepoRaw>(url, { headers: buildHeaders(config) })
  return toRepoInfo(raw)
}

/** 列出仓库指定目录下的内容（默认根目录） */
export async function listRepoContents(config: RepoConfig, path = ''): Promise<RepoContent[]> {
  const url = new URL(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path)}`,
  )
  if (config.branch) {
    url.searchParams.set('ref', config.branch)
  }
  const data = await requestJson<GitHubContentRaw | GitHubContentRaw[]>(url.toString(), {
    headers: buildHeaders(config),
  })
  // 目录返回数组，单个文件返回对象；这里只消费目录场景
  return (Array.isArray(data) ? data : [data]).map(toRepoContent)
}

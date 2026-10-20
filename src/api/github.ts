import type {
  IssueState,
  RepoConfig,
  RepoContent,
  RepoContentType,
  RepoInfo,
  RepoIssue,
} from "../types";
import { cleanNullableText } from "../utils/dataClean";
import { requestJson } from "./request";

const GITHUB_API_BASE = "https://api.github.com";
const ALLOWED_CONTENT_TYPES: readonly RepoContentType[] = [
  "file",
  "dir",
  "symlink",
  "submodule",
];

interface GitHubRepoRaw {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface GitHubContentRaw {
  name: string;
  path: string;
  sha: string;
  type: string;
  size: number;
  url: string;
}

interface GitHubIssueRaw {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  comments: number;
  created_at: string;
  updated_at: string;
  user: { login: string } | null;
  labels: Array<{ name: string }> | null;
  /** 存在该字段表示条目实为 Pull Request */
  pull_request?: unknown;
}

export interface ListIssuesOptions {
  state?: IssueState | "all";
  page?: number;
  perPage?: number;
}

export interface IssuesPage {
  items: RepoIssue[];
  /** 本页实际条数（Search 结果已全部是真 Issue，不再稀疏） */
  rawCount: number;
  /** 总页数，由 total_count 与 perPage 计算，受前 1000 条限制约束 */
  totalPages: number;
  /** 仓库 Issue 总数超出 1000 条，仅前 1000 条可浏览 */
  truncated: boolean;
}

/** Search API 可访问的结果窗口上限（超出部分无法翻页） */
const SEARCH_RESULT_LIMIT = 1000;

/**
 * 分页列出仓库 Issues。
 * 走 Search API 而非 Issues REST：REST 把 Pull Request 混在 Issue 里返回
 * （活跃仓库一页 20 条可能只有 1~3 条真 Issue），且不支持服务端排除；
 * Search 的 is:issue 服务端排除 PR，每页条数精确，响应自带 total_count。
 */
export async function listIssues(
  config: RepoConfig,
  options: ListIssuesOptions = {},
): Promise<IssuesPage> {
  const { state = "all", page = 1, perPage = 30 } = options;
  const stateQuery = state === "all" ? "" : ` state:${state}`;
  const query = encodeURIComponent(
    `repo:${config.owner}/${config.repo} is:issue${stateQuery}`,
  );
  const url =
    `${GITHUB_API_BASE}/search/issues?q=${query}` +
    `&sort=created&order=desc&page=${page}&per_page=${perPage}`;
  const data = await requestJson<{
    total_count: number;
    items: GitHubIssueRaw[];
  }>(url, {
    headers: buildHeaders(config),
    timeoutMs: 15_000,
  });
  // Search 仅开放前 1000 条结果，总页数按可访问窗口裁剪
  const accessibleTotal = Math.min(data.total_count, SEARCH_RESULT_LIMIT);
  const items = data.items.map(toRepoIssue);
  return {
    items,
    rawCount: items.length,
    totalPages: Math.max(1, Math.ceil(accessibleTotal / perPage)),
    truncated: data.total_count > SEARCH_RESULT_LIMIT,
  };
}

function buildHeaders(config: RepoConfig): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }
  return headers;
}

function toRepoInfo(raw: GitHubRepoRaw): RepoInfo {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: cleanNullableText(raw.description, "暂无描述"),
    htmlUrl: raw.html_url,
    language: cleanNullableText(raw.language, "Unknown"),
    stargazersCount: raw.stargazers_count,
    forksCount: raw.forks_count,
    updatedAt: raw.updated_at,
  };
}

function toRepoContent(raw: GitHubContentRaw): RepoContent {
  const type = ALLOWED_CONTENT_TYPES.includes(raw.type as RepoContentType)
    ? (raw.type as RepoContentType)
    : "file";
  return {
    name: raw.name,
    path: raw.path,
    sha: raw.sha,
    type,
    size: raw.size,
    url: raw.url,
  };
}

/** 获取仓库摘要信息 */
export async function getRepo(config: RepoConfig): Promise<RepoInfo> {
  const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}`;
  const raw = await requestJson<GitHubRepoRaw>(url, {
    headers: buildHeaders(config),
    timeoutMs: 15_000,
  });
  return toRepoInfo(raw);
}

function toRepoIssue(raw: GitHubIssueRaw): RepoIssue {
  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    body: cleanNullableText(raw.body),
    state: raw.state === "closed" ? "closed" : "open",
    htmlUrl: raw.html_url,
    author: raw.user?.login ?? "unknown",
    labels: (raw.labels ?? []).map((label) => label.name),
    commentsCount: raw.comments,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** 列出仓库指定目录下的内容（默认根目录） */
export async function listRepoContents(
  config: RepoConfig,
  path = "",
): Promise<RepoContent[]> {
  const url = new URL(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path)}`,
  );
  if (config.branch) {
    url.searchParams.set("ref", config.branch);
  }
  const data = await requestJson<GitHubContentRaw | GitHubContentRaw[]>(
    url.toString(),
    {
      headers: buildHeaders(config),
      timeoutMs: 15_000,
    },
  );
  // 目录返回数组，单个文件返回对象；这里只消费目录场景
  return (Array.isArray(data) ? data : [data]).map(toRepoContent);
}

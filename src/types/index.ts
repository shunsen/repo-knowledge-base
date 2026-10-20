/** GitHub 仓库配置 */
export interface RepoConfig {
  /** 仓库所有者，如 vuejs */
  owner: string;
  /** 仓库名称，如 core */
  repo: string;
  /** 分支，不传时使用仓库默认分支 */
  branch?: string;
  /** GitHub Token，可留空（匿名调用有更严格的速率限制） */
  token?: string;
}

/** GitHub 仓库摘要信息（已将下划线字段清洗为驼峰） */
export interface RepoInfo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  updatedAt: string;
}

export type RepoContentType = "file" | "dir" | "symlink" | "submodule";

/** 仓库目录中的单个条目 */
export interface RepoContent {
  name: string;
  path: string;
  sha: string;
  type: RepoContentType;
  size: number;
  url: string;
}

export type ChatRole = "system" | "user" | "assistant";

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

/** OpenAI 兼容的 LLM 接口配置 */
export interface LlmConfig {
  /** 如 https://api.openai.com/v1 */
  apiBase: string;
  apiKey: string;
  model: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface Paginated<T> extends Pagination {
  items: T[];
  totalPages: number;
}

export type IssueState = "open" | "closed";

/** 仓库 Issue（已过滤 Pull Request，下划线字段清洗为驼峰） */
export interface RepoIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: IssueState;
  htmlUrl: string;
  author: string;
  labels: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

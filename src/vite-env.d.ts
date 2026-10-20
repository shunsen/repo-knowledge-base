/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GitHub Personal Access Token，作为表单默认值。注意：VITE_ 前缀变量会打包进客户端产物，仅限本地开发使用 */
  readonly VITE_GITHUB_TOKEN?: string
  /** LLM API Key，作为表单默认值。注意：VITE_ 前缀变量会打包进客户端产物，仅限本地开发使用 */
  readonly VITE_LLM_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

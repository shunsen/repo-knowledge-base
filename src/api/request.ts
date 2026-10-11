/** 统一的 API 错误，携带 HTTP 状态码 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  /** 对象类型的请求体，会自动 JSON.stringify */
  body?: unknown
  signal?: AbortSignal
}

/**
 * 基于 fetch 的 JSON 请求封装：
 * - 自动注入 Accept 头与 JSON 序列化
 * - 非 2xx 状态码抛出 ApiError，并尽量读取接口返回的 message
 */
export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, signal } = options

  const response = await fetch(url, {
    method,
    headers: { Accept: 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    let message = `请求失败：${response.status} ${response.statusText}`
    try {
      const data = (await response.json()) as { message?: unknown }
      if (typeof data.message === 'string' && data.message) {
        message = data.message
      }
    } catch {
      // 响应体不是 JSON，保留默认错误信息
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

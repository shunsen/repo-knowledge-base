/** 统一的 API 错误，携带 HTTP 状态码 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  /** 对象类型的请求体，会自动 JSON.stringify */
  body?: unknown;
  signal?: AbortSignal;
  /** 超时毫秒数；超时后抛出 ApiError（status=0），避免网络黑洞导致请求永久挂起 */
  timeoutMs?: number;
}

/** 常见 HTTP 状态码的友好提示，避免向用户暴露裸状态码 */
const FRIENDLY_STATUS_MESSAGES: Record<number, string> = {
  401: "API Key 无效或未授权，请检查 Key 是否正确",
  402: "账户余额不足，请前往服务商控制台充值",
  403: "该 Key 无权访问此资源",
  404: "接口路径不存在，请检查 API Base 是否正确",
  429: "请求过于频繁或超出配额，请稍后再试",
  500: "服务商服务器错误，请稍后再试",
  503: "服务商服务暂不可用，请稍后再试",
};

/**
 * 基于 fetch 的请求封装：
 * - 自动注入 Accept 头与 JSON 序列化
 * - 可选超时（与外部 signal 组合）
 * - 非 2xx 状态码抛出 ApiError，并尽量读取接口返回的 message
 * 需要读取响应头（如 GitHub 的 Link 分页头）时使用本函数。
 */
export async function requestRaw(
  url: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { method = "GET", headers = {}, body, signal, timeoutMs } = options;

  const signals: AbortSignal[] = [];
  if (signal) signals.push(signal);
  if (timeoutMs) signals.push(AbortSignal.timeout(timeoutMs));
  const composed = signals.length > 0 ? AbortSignal.any(signals) : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { Accept: "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: composed,
    });
  } catch (err) {
    if (composed?.reason?.name === "TimeoutError") {
      throw new ApiError(
        0,
        `请求超时（${Math.round(timeoutMs! / 1000)} 秒），请检查网络或 API Base 是否可达`,
      );
    }
    throw err;
  }

  if (!response.ok) {
    let message = `请求失败：${response.status} ${response.statusText}`;
    try {
      // 兼容两种错误体：GitHub 的 {message} 与 OpenAI 兼容服务商的 {error: {message}}
      const data = (await response.json()) as {
        message?: unknown;
        error?: { message?: unknown };
      };
      const detail =
        typeof data.message === "string" && data.message
          ? data.message
          : typeof data.error?.message === "string" && data.error.message
            ? data.error.message
            : "";
      const friendly = FRIENDLY_STATUS_MESSAGES[response.status];
      message = [friendly ?? message, detail].filter(Boolean).join("：");
    } catch {
      // 响应体不是 JSON，保留默认错误信息
    }
    throw new ApiError(response.status, message);
  }

  return response;
}

/** requestRaw 的 JSON 便捷封装；204 视为无内容 */
export async function requestJson<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await requestRaw(url, options);
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

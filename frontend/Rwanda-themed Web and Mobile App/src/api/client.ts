/**
 * In local Vite dev, prefer same-origin `/api/...` so the Vite proxy
 * forwards to the Express backend (avoids CORS / sticky-header issues).
 * Override with VITE_API_BASE_URL for production or a remote API.
 */
const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
const API_BASE =
  raw === undefined || raw === ""
    ? ""
    : raw.replace(/\/$/, "")

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
    this.name = "ApiError"
  }
}

function getToken(): string | null {
  return localStorage.getItem("urugendo_token")
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem("urugendo_token", token)
  else localStorage.removeItem("urugendo_token")
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })
  } catch (err) {
    throw new TypeError(
      err instanceof Error ? err.message : "Network request failed"
    )
  }

  const text = await res.text()
  let payload: any = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = { error: { message: text || res.statusText } }
  }

  if (!res.ok) {
    const details = payload?.error?.details
    const detailMsg = Array.isArray(details)
      ? details.map((d: any) => d.message || `${d.field}: invalid`).join("; ")
      : null
    const message =
      detailMsg ||
      payload?.error?.message ||
      payload?.message ||
      `Request failed (${res.status})`
    throw new ApiError(res.status, message, details)
  }

  return payload as T
}

export const api = {
  get: <T = unknown>(path: string) => apiRequest<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
}

export { API_BASE }

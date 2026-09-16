import { api, setAuthToken } from "./client"

export interface AuthUser {
  id: string
  name: string
  email: string | null
  contactPhone: string | null
  role: "USER" | "PROVIDER" | "ADMIN"
  preferredLanguage?: "EN" | "RW"
}

type AuthResponse = {
  status: string
  data: { user: AuthUser; token: string }
}

/** Creates account only — does NOT log the user in. */
export async function register(input: {
  name: string
  password: string
  email?: string
  contactPhone?: string
}) {
  const res = await api.post<AuthResponse>("/api/v1/auth/register", input)
  // Explicitly do not store the token — user must log in next.
  setAuthToken(null)
  localStorage.removeItem("urugendo_user")
  return res.data.user
}

/** Logs in and stores the session token. */
export async function login(input: { credential: string; password: string }) {
  const res = await api.post<AuthResponse>("/api/v1/auth/login", input)
  setAuthToken(res.data.token)
  return res.data
}

export function logout() {
  setAuthToken(null)
  localStorage.removeItem("urugendo_user")
}

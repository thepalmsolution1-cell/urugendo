import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import * as authApi from "../api/auth"
import type { AuthUser } from "../api/auth"

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credential: string, password: string) => Promise<AuthUser>
  register: (input: {
    name: string
    password: string
    email?: string
    contactPhone?: string
  }) => Promise<AuthUser>
  logout: () => void
  requireAuth: () => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = "urugendo_user"

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())

  const persist = useCallback((next: AuthUser | null) => {
    setUser(next)
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next))
    else localStorage.removeItem(USER_KEY)
  }, [])

  const login = useCallback(
    async (credential: string, password: string) => {
      const { user: next } = await authApi.login({ credential, password })
      persist(next)
      return next
    },
    [persist]
  )

  const register = useCallback(
    async (input: {
      name: string
      password: string
      email?: string
      contactPhone?: string
    }) => {
      // Account created only — no session until login.
      const created = await authApi.register(input)
      persist(null)
      return created
    },
    [persist]
  )

  const logout = useCallback(() => {
    authApi.logout()
    persist(null)
  }, [persist])

  const requireAuth = useCallback(() => Boolean(user), [user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      requireAuth,
    }),
    [user, login, register, logout, requireAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

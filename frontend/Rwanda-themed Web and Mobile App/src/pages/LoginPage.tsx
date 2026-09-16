import { useEffect, useState } from "react"
import { AppState, Btn } from "../App"
import { useAuth } from "../auth/AuthContext"
import { ApiError } from "../api/client"

export function LoginPage({ setPage }: AppState) {
  const { login, isAuthenticated } = useAuth()
  const [credential, setCredential] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("urugendo_signup_success") === "1") {
      setSuccessMsg("Account created. Please log in to continue.")
      const pref = sessionStorage.getItem("urugendo_signup_email")
      if (pref) setCredential(pref)
      sessionStorage.removeItem("urugendo_signup_success")
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) setPage("dashboard")
  }, [isAuthenticated, setPage])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(credential.trim(), password)
      sessionStorage.removeItem("urugendo_signup_email")
      setPage("dashboard")
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else if (err instanceof TypeError) {
        setError("Cannot reach the API. Make sure the backend is running.")
      } else {
        setError(err instanceof Error ? err.message : "Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-forest-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white font-display font-bold text-xl flex items-center justify-center mx-auto mb-3">
            U
          </div>
          <h1 className="font-display text-2xl font-semibold text-charcoal">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Log in to open your URUGENDO dashboard
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 text-sm text-forest-700 bg-forest-50 border border-forest-100 rounded-xl px-3 py-2">
            {successMsg}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Email or phone
            </label>
            <input
              required
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500"
              placeholder="you@example.com or +2507..."
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Password
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500"
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Btn type="submit" className="w-full justify-center" size="lg" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Btn>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          New to URUGENDO?{" "}
          <button
            type="button"
            className="text-forest-700 font-semibold"
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}

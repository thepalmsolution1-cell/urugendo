import { useEffect, useState } from "react"
import { AppState, Btn } from "../App"
import { useAuth } from "../auth/AuthContext"
import { ApiError } from "../api/client"

export function SignupPage({ setPage }: AppState) {
  const { register, isAuthenticated } = useAuth()
  const [name, setName] = useState("")
  const [credential, setCredential] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setPage("dashboard")
  }, [isAuthenticated, setPage])


  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const value = credential.trim()
      const isEmail = value.includes("@")
      await register({
        name: name.trim(),
        password,
        email: isEmail ? value : undefined,
        contactPhone: isEmail ? undefined : value,
      })
      sessionStorage.setItem(
        "urugendo_signup_email",
        isEmail ? value : value
      )
      sessionStorage.setItem("urugendo_signup_success", "1")
      setPage("login")
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else if (err instanceof TypeError) {
        setError("Cannot reach the API. Make sure the backend is running.")
      } else {
        setError(err instanceof Error ? err.message : "Sign up failed")
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
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign up to plan experiences across Rwanda. You&apos;ll log in after this.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Confirm password
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500"
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Btn type="submit" className="w-full justify-center" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Btn>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <button
            type="button"
            className="text-forest-700 font-semibold"
            onClick={() => setPage("login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}

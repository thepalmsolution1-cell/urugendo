import { useEffect } from "react"
import { AppState, Btn, Badge } from "../App"
import { useAuth } from "../auth/AuthContext"

export function DashboardPage({ setPage }: AppState) {
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) setPage("login")
  }, [isAuthenticated, setPage])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">
        Redirecting to login...
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-forest-50">
      <div className="bg-gradient-to-br from-forest-800 to-forest-950 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Badge color="gold" className="mb-3">Dashboard</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-white/70 text-sm">
            {user.email || user.contactPhone || "Your URUGENDO account"} · {user.role}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setPage("my-adventures")}
            className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-forest-200 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">📅</div>
            <h2 className="font-semibold text-charcoal mb-1">My Adventures</h2>
            <p className="text-sm text-gray-500">View bookings, goals, and saved plans</p>
          </button>
          <button
            onClick={() => setPage("builder")}
            className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-forest-200 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">✨</div>
            <h2 className="font-semibold text-charcoal mb-1">Plan an Experience</h2>
            <p className="text-sm text-gray-500">Build a trip, dinner, or adventure</p>
          </button>
          <button
            onClick={() => setPage("plan-for-me")}
            className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-forest-200 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">🤖</div>
            <h2 className="font-semibold text-charcoal mb-1">Plan For Me</h2>
            <p className="text-sm text-gray-500">Get AI-assisted experience options</p>
          </button>
          <button
            onClick={() => setPage("business")}
            className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-forest-200 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">🏪</div>
            <h2 className="font-semibold text-charcoal mb-1">For Businesses</h2>
            <p className="text-sm text-gray-500">List your business or open provider tools</p>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-charcoal text-sm">Account</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Signed in as {user.email || user.contactPhone}
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setPage("home")}>
              Back to Home
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                logout()
                setPage("login")
              }}
            >
              Logout
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

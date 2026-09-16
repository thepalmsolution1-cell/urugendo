import { useState } from "react"
import { HomePage } from "./pages/HomePage"
import { BuilderPage } from "./pages/BuilderPage"
import { PlanForMePage } from "./pages/PlanForMePage"
import { MyAdventuresPage } from "./pages/MyAdventuresPage"
import { EventsPage } from "./pages/EventsPage"
import { BusinessPage } from "./pages/BusinessPage"
import { TripDetailPage } from "./pages/TripDetailPage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"
import { DashboardPage } from "./pages/DashboardPage"
import { useAuth } from "./auth/AuthContext"

// ── Types ─────────────────────────────────────────────────────────────────────

export type Page =
  | "home"
  | "explore"
  | "builder"
  | "plan-for-me"
  | "my-adventures"
  | "events"
  | "business"
  | "trip-detail"
  | "login"
  | "signup"
  | "dashboard"

export interface SavingsGoal {
  id: string
  name: string
  emoji: string
  targetAmount: number
  currentSavings: number
  targetDate: string
  image: string
  history: Array<{ date: string; amount: number }>
}

export interface AppState {
  page: Page
  setPage: (p: Page) => void
  savingsGoals: SavingsGoal[]
  setSavingsGoals: (g: SavingsGoal[]) => void
  selectedTripId: string | null
  setSelectedTripId: (id: string | null) => void
}

// ── Shared data ───────────────────────────────────────────────────────────────

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: "lake-kivu",
    name: "Lake Kivu Weekend",
    emoji: "🌊",
    targetAmount: 200000,
    currentSavings: 50000,
    targetDate: "2026-12-20",
    image:
      "https://images.unsplash.com/photo-1706977570024-fefa419c48c8?w=800&h=500&fit=crop&auto=format",
    history: [
      { date: "2026-09-01", amount: 20000 },
      { date: "2026-09-08", amount: 15000 },
      { date: "2026-09-15", amount: 15000 },
    ],
  },
  {
    id: "musanze",
    name: "Musanze Adventure",
    emoji: "🌋",
    targetAmount: 150000,
    currentSavings: 75000,
    targetDate: "2027-01-10",
    image:
      "https://images.unsplash.com/photo-1621414050946-1b936a78491f?w=800&h=500&fit=crop&auto=format",
    history: [
      { date: "2026-08-10", amount: 25000 },
      { date: "2026-08-20", amount: 25000 },
      { date: "2026-09-01", amount: 25000 },
    ],
  },
]

// ── Shared UI Primitives ──────────────────────────────────────────────────────

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode
  variant?: "primary" | "outline" | "ghost" | "gold" | "danger"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2",
  }
  const variants = {
    primary:
      "bg-forest-700 text-white hover:bg-forest-800 active:scale-[0.98] shadow-sm",
    outline:
      "border-2 border-forest-700 text-forest-700 hover:bg-forest-50 active:scale-[0.98]",
    ghost: "text-forest-700 hover:bg-forest-50 active:scale-[0.98]",
    gold: "bg-gold-500 text-white hover:bg-gold-600 active:scale-[0.98] shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
  }
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Badge({
  children,
  color = "green",
  className = "",
}: {
  children: React.ReactNode
  color?: "green" | "gold" | "gray" | "red" | "blue"
  className?: string
}) {
  const colors = {
    green: "bg-forest-50 text-forest-700 border border-forest-100",
    gold: "bg-gold-50 text-gold-700 border border-gold-100",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
    red: "bg-red-50 text-red-600 border border-red-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  max,
  className = "",
}: {
  value: number
  max: number
  className?: string
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden h-2.5 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-forest-600 to-forest-400 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-gold-500 text-xs">
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span className="text-gray-400 ml-1">({rating})</span>
    </span>
  )
}

export function formatRWF(amount: number) {
  return new Intl.NumberFormat("en-RW").format(amount) + " RWF"
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const navLinks: Array<{ label: string; page: Page }> = [
    { label: "Explore", page: "explore" },
    { label: "Experiences", page: "explore" },
    { label: "Events", page: "events" },
    { label: "For Businesses", page: "business" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold font-display">U</span>
          </div>
          <span className="font-display font-semibold text-lg text-charcoal tracking-tight">
            URUGENDO
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <button
              key={l.label}
              onClick={() => setPage(l.page)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                page === l.page
                  ? "bg-forest-50 text-forest-700"
                  : "text-gray-600 hover:text-charcoal hover:bg-gray-50"
              }`}
            >
              {l.label}
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => setPage("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                page === "dashboard"
                  ? "bg-forest-50 text-forest-700"
                  : "text-gray-600 hover:text-charcoal hover:bg-gray-50"
              }`}
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => setPage("my-adventures")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              page === "my-adventures"
                ? "bg-forest-50 text-forest-700"
                : "text-gray-600 hover:text-charcoal hover:bg-gray-50"
            }`}
          >
            My Adventures
          </button>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setPage("dashboard")}
                className="text-sm text-gray-600 max-w-[140px] truncate hover:text-charcoal"
              >
                {user?.name}
              </button>
              <button
                onClick={() => {
                  logout()
                  setPage("home")
                }}
                className="text-sm font-medium text-gray-600 hover:text-charcoal transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPage("login")}
                className={`text-sm font-medium transition-colors ${
                  page === "login" ? "text-forest-700" : "text-gray-600 hover:text-charcoal"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setPage("signup")}
                className={`text-sm font-medium transition-colors ${
                  page === "signup" ? "text-forest-700" : "text-gray-600 hover:text-charcoal"
                }`}
              >
                Sign Up
              </button>
            </>
          )}
          <Btn onClick={() => setPage("builder")} size="sm">
            Plan an Experience
          </Btn>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {[
            ...navLinks,
            ...(isAuthenticated
              ? [{ label: "Dashboard", page: "dashboard" as Page }]
              : []),
            { label: "My Adventures", page: "my-adventures" as Page },
          ].map((l) => (
            <button
              key={l.label}
              onClick={() => { setPage(l.page); setMenuOpen(false) }}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-1 flex gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setPage("home"); setMenuOpen(false) }}
                className="flex-1 text-sm font-medium text-gray-600 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Logout ({user?.name})
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setPage("login"); setMenuOpen(false) }}
                  className="flex-1 text-sm font-medium text-gray-600 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => { setPage("signup"); setMenuOpen(false) }}
                  className="flex-1 text-sm font-medium text-forest-700 py-2 rounded-lg border border-forest-200 bg-forest-50 hover:bg-forest-100 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────

function MobileNav({
  page,
  setPage,
}: {
  page: Page
  setPage: (p: Page) => void
}) {
  const { isAuthenticated } = useAuth()
  const tabs: Array<{ label: string; page: Page; icon: React.ReactNode }> = [
    {
      label: "Home",
      page: "home",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Explore",
      page: "explore",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      label: "Plan",
      page: "builder",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: "Adventures",
      page: "my-adventures",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      label: "Profile",
      page: "dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg safe-pb">
      <div className="flex">
        {tabs.map((t) => {
          const active = page === t.page && t.page !== "home"
          const isHome = t.page === "home" && page === "home"
          const isActive = active || isHome
          const isPlan = t.label === "Plan"
          return (
            <button
              key={t.label}
              onClick={() => {
                if (t.label === "Profile" && !isAuthenticated) setPage("login")
                else setPage(t.page)
              }}
              className={`flex-1 flex flex-col items-center justify-center pt-2 pb-3 gap-0.5 transition-colors ${
                isPlan
                  ? "relative"
                  : isActive
                  ? "text-forest-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {isPlan ? (
                <div className="absolute -top-5 w-12 h-12 rounded-full bg-forest-700 flex items-center justify-center shadow-lg shadow-forest-700/30">
                  <span className="text-white">{t.icon}</span>
                </div>
              ) : (
                t.icon
              )}
              {!isPlan && (
                <span className={`text-[10px] font-medium ${isActive ? "text-forest-700" : "text-gray-400"}`}>
                  {t.label}
                </span>
              )}
              {isPlan && <span className="mt-4 text-[10px] font-medium text-gray-400">Plan</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_GOALS)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  const appState: AppState = {
    page,
    setPage,
    savingsGoals,
    setSavingsGoals,
    selectedTripId,
    setSelectedTripId,
  }

  const renderPage = () => {
    switch (page) {
      case "home":
      case "explore":
        return <HomePage {...appState} />
      case "builder":
        return <BuilderPage {...appState} />
      case "plan-for-me":
        return <PlanForMePage {...appState} />
      case "my-adventures":
        return <MyAdventuresPage {...appState} />
      case "events":
        return <EventsPage {...appState} />
      case "business":
        return <BusinessPage {...appState} />
      case "trip-detail":
        return <TripDetailPage {...appState} />
      case "login":
        return <LoginPage {...appState} />
      case "signup":
        return <SignupPage {...appState} />
      case "dashboard":
        return <DashboardPage {...appState} />
      default:
        return <HomePage {...appState} />
    }
  }

  const hideMobileNav = page === "login" || page === "signup"

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar page={page} setPage={setPage} />
      <main className={`flex-1 ${hideMobileNav ? "" : "pb-20 md:pb-0"}`}>
        {renderPage()}
      </main>
      {!hideMobileNav && <MobileNav page={page} setPage={setPage} />}
    </div>
  )
}

import { useEffect, useState } from "react"
import { AppState, Btn, Badge, ProgressBar, SavingsGoal, formatRWF } from "../App"
import { useAuth } from "../auth/AuthContext"
import { listMyReservations, type Reservation } from "../api/urugendo"

type Tab = "upcoming" | "saved" | "goals" | "past"

const PAST = [
  {
    id: "p1",
    title: "Lake Kivu Weekend",
    date: "20–22 Jul 2026",
    location: "Rubavu",
    emoji: "🌊",
    cost: 185000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1706977570024-fefa419c48c8?w=400&h=250&fit=crop&auto=format",
  },
  {
    id: "p2",
    title: "Graduation Dinner",
    date: "15 Jun 2026",
    location: "Kigali",
    emoji: "🎓",
    cost: 180000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1742134516273-03ec7c4eb0c7?w=400&h=250&fit=crop&auto=format",
  },
]

function weeksUntil(targetDate: string) {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)))
}

function suggestedWeeklySavings(goal: SavingsGoal) {
  const remaining = goal.targetAmount - goal.currentSavings
  const weeks = weeksUntil(goal.targetDate)
  if (weeks <= 0 || remaining <= 0) return 0
  return Math.ceil(remaining / weeks / 1000) * 1000
}

function getInsight(goal: SavingsGoal): string {
  const pct = (goal.currentSavings / goal.targetAmount) * 100
  const weeks = weeksUntil(goal.targetDate)
  const weeklyNeeded = suggestedWeeklySavings(goal)

  if (goal.currentSavings >= goal.targetAmount) return "🎉 You've reached your goal! Time to book!"
  if (pct >= 75) return `🚀 You're ${Math.round(pct)}% there! Just ${formatRWF(goal.targetAmount - goal.currentSavings)} to go.`
  if (pct >= 50) return `✨ Halfway there! Save ${formatRWF(weeklyNeeded)}/week to reach your goal in time.`
  if (weeks < 4) return `⚡ Only ${weeks} weeks left! You may need to increase savings to ${formatRWF(weeklyNeeded)}/week.`
  return `💡 Save ${formatRWF(weeklyNeeded)}/week and you'll reach your goal before ${new Date(goal.targetDate).toLocaleDateString("en-RW", { month: "short", year: "numeric" })}.`
}

function GoalCard({
  goal,
  onSelect,
}: {
  goal: SavingsGoal
  onSelect: () => void
}) {
  const pct = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100))
  const reached = goal.currentSavings >= goal.targetAmount
  const weeks = weeksUntil(goal.targetDate)

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="relative h-36 bg-forest-100 overflow-hidden">
        <img
          src={goal.image}
          alt={goal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="text-xl mr-1">{goal.emoji}</span>
          <span className="text-white font-semibold text-sm">{goal.name}</span>
        </div>
        {reached && (
          <div className="absolute top-3 right-3">
            <Badge color="gold">🎉 Goal Reached!</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-bold text-charcoal">
              {formatRWF(goal.currentSavings)}
            </span>
            <span className="text-xs text-gray-400"> / {formatRWF(goal.targetAmount)}</span>
          </div>
          <span className={`text-sm font-bold ${pct >= 100 ? "text-gold-600" : "text-forest-700"}`}>
            {pct}%
          </span>
        </div>
        <ProgressBar value={goal.currentSavings} max={goal.targetAmount} className="mb-3" />
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            🎯 {new Date(goal.targetDate).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span>{weeks > 0 ? `${weeks} weeks left` : "Past target date"}</span>
        </div>
      </div>
    </div>
  )
}

function GoalDetail({
  goal,
  onUpdate,
  onClose,
  setPage,
}: {
  goal: SavingsGoal
  onUpdate: (g: SavingsGoal) => void
  onClose: () => void
  setPage: (p: any) => void
}) {
  const [addAmount, setAddAmount] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [showPriceUpdate, setShowPriceUpdate] = useState(false)
  const [newTarget, setNewTarget] = useState(String(goal.targetAmount))

  const pct = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100))
  const reached = goal.currentSavings >= goal.targetAmount
  const weekly = suggestedWeeklySavings(goal)
  const insight = getInsight(goal)
  const weeks = weeksUntil(goal.targetDate)

  const handleAddSavings = () => {
    const amount = parseInt(addAmount) || 0
    if (amount <= 0) return
    const today = new Date().toISOString().split("T")[0]
    const updated: SavingsGoal = {
      ...goal,
      currentSavings: goal.currentSavings + amount,
      history: [...goal.history, { date: today, amount }],
    }
    onUpdate(updated)
    setAddAmount("")
    setShowAdd(false)
  }

  const handleUpdateTarget = () => {
    const amount = parseInt(newTarget) || goal.targetAmount
    onUpdate({ ...goal, targetAmount: amount })
    setShowPriceUpdate(false)
  }

  if (reached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-700 to-forest-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="font-display text-3xl font-semibold text-charcoal mb-3">
            You Reached Your Goal!
          </h1>
          <p className="text-gray-500 text-sm mb-2">Your adventure is now closer than ever.</p>
          <div className="bg-forest-50 rounded-xl p-4 my-5 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{goal.emoji}</span>
              <span className="font-semibold text-charcoal">{goal.name}</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Target</span>
                <span className="font-bold text-charcoal">{formatRWF(goal.targetAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Saved</span>
                <span className="font-bold text-forest-700">{formatRWF(goal.currentSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge color="gold">GOAL REACHED ✓</Badge>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            This is a savings goal tracker. URUGENDO does not hold your money.
          </p>
          <div className="space-y-2">
            <Btn className="w-full justify-center" onClick={() => setPage("builder")}>
              Review & Book Trip →
            </Btn>
            <Btn variant="outline" className="w-full justify-center" onClick={onClose}>
              Back to My Adventures
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display font-semibold text-charcoal text-base flex items-center gap-2">
              <span>{goal.emoji}</span> {goal.name}
            </h1>
            <p className="text-xs text-gray-400">My Adventure Goal</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Hero image */}
        <div className="relative h-44 rounded-2xl overflow-hidden bg-forest-100">
          <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{pct}% Complete</span>
              <Badge color={pct >= 75 ? "gold" : "green"}>
                {pct >= 75 ? "Almost there!" : "In progress"}
              </Badge>
            </div>
            <ProgressBar value={goal.currentSavings} max={goal.targetAmount} className="mt-2" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Target", value: formatRWF(goal.targetAmount), icon: "🎯" },
            { label: "Saved", value: formatRWF(goal.currentSavings), icon: "💰" },
            { label: "Remaining", value: formatRWF(Math.max(0, goal.targetAmount - goal.currentSavings)), icon: "📊" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="font-bold text-charcoal text-sm">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="bg-forest-700 rounded-2xl p-4 text-white">
          <p className="text-sm leading-relaxed">{insight}</p>
        </div>

        {/* Savings plan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-charcoal text-sm mb-4">Savings Plan</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-forest-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Suggested weekly</p>
              <p className="font-bold text-forest-700">{formatRWF(weekly)}</p>
            </div>
            <div className="bg-gold-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Suggested monthly</p>
              <p className="font-bold text-gold-700">{formatRWF(weekly * 4)}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 text-center">
            Target date: {new Date(goal.targetDate).toLocaleDateString("en-RW", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })} · {weeks} weeks remaining
          </div>
        </div>

        {/* Price update alert */}
        {showPriceUpdate && (
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5">
            <h3 className="font-semibold text-charcoal text-sm mb-3">
              📢 Update Estimated Cost
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              If your trip estimate has changed, update your goal target.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
              />
              <Btn size="sm" onClick={handleUpdateTarget}>Update</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setShowPriceUpdate(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* Add progress */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-forest-200 p-5">
            <h3 className="font-semibold text-charcoal text-sm mb-1">
              Add Savings Progress
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Demo Savings Progress — this tracks your goal, not actual money.
            </p>
            <div className="flex gap-3 mb-3">
              {[5000, 10000, 20000, 50000].map((a) => (
                <button
                  key={a}
                  onClick={() => setAddAmount(String(a))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    addAmount === String(a)
                      ? "border-forest-500 bg-forest-50 text-forest-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  +{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Or enter custom amount (RWF)"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:border-forest-500"
            />
            <div className="flex gap-2">
              <Btn className="flex-1 justify-center" onClick={handleAddSavings} disabled={!addAmount}>
                Update Progress
              </Btn>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* History */}
        {goal.history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-charcoal text-sm mb-4">Savings Activity</h3>
            <div className="space-y-2">
              {[...goal.history].reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center">
                      <span className="text-forest-600 text-xs">+</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(h.date).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-forest-700">
                    +{formatRWF(h.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2 font-bold text-sm border-t border-gray-100 mt-2">
              <span className="text-gray-600">Total Progress</span>
              <span className="text-forest-700">{formatRWF(goal.currentSavings)}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pb-4">
          {!showAdd && (
            <Btn className="w-full justify-center" size="lg" onClick={() => setShowAdd(true)}>
              + Add Savings Progress
            </Btn>
          )}
          <div className="flex gap-2">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowPriceUpdate(true)}>
              Edit Goal
            </Btn>
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setPage("trip-detail")}>
              View Trip
            </Btn>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          URUGENDO does not hold your money. This is a savings goal progress tracker.
        </p>
      </div>
    </div>
  )
}

export function MyAdventuresPage({ setPage, savingsGoals, setSavingsGoals }: AppState) {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState<Tab>("upcoming")
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loadingReservations, setLoadingReservations] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setReservations([])
      return
    }
    setLoadingReservations(true)
    listMyReservations()
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoadingReservations(false))
  }, [isAuthenticated])

  const upcoming = reservations.filter((r) =>
    ["REQUESTED", "PROCESSING", "CONFIRMED"].includes(r.status)
  )
  const pastFromApi = reservations.filter((r) =>
    ["REJECTED", "CANCELLED"].includes(r.status)
  )

  const updateGoal = (updated: SavingsGoal) => {
    setSavingsGoals(savingsGoals.map((g) => (g.id === updated.id ? updated : g)))
    setSelectedGoal(updated)
  }

  if (selectedGoal) {
    return (
      <GoalDetail
        goal={savingsGoals.find((g) => g.id === selectedGoal.id) || selectedGoal}
        onUpdate={updateGoal}
        onClose={() => setSelectedGoal(null)}
        setPage={setPage}
      />
    )
  }

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "saved", label: "Saved" },
    { id: "goals", label: "Savings Goals", count: savingsGoals.length },
    { id: "past", label: "Past Adventures", count: PAST.length + pastFromApi.length },
  ]

  return (
    <div className="min-h-screen bg-forest-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-1">
            My Adventures
          </h1>
          <p className="text-gray-500 text-sm">Track your trips, goals, and experiences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-4 flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tab === t.id
                  ? "border-forest-600 text-forest-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-forest-100 text-forest-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Upcoming */}
        {tab === "upcoming" && (
          <div className="space-y-4">
            {!isAuthenticated && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-4">Login to see your booking requests</p>
                <Btn onClick={() => setPage("login")}>Login</Btn>
              </div>
            )}
            {isAuthenticated && loadingReservations && (
              <p className="text-sm text-gray-500 text-center py-8">Loading reservations...</p>
            )}
            {isAuthenticated && !loadingReservations && upcoming.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-sm text-gray-500 mb-4">No upcoming bookings yet</p>
                <Btn onClick={() => setPage("builder")}>Plan an Experience</Btn>
              </div>
            )}
            {upcoming.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl bg-forest-100 flex items-center justify-center text-3xl shrink-0">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-charcoal text-sm">
                        {r.provider?.name || "Reservation"}
                      </h3>
                      <Badge
                        color={
                          r.status === "CONFIRMED"
                            ? "green"
                            : r.status === "REJECTED"
                            ? "red"
                            : "gold"
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(r.reservedDate).toLocaleDateString()} {r.reservedTime || ""}
                    </p>
                    <p className="text-xs text-gray-400">📍 {r.provider?.location || "Rwanda"}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {r.specialRequest || `${r.people} people`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved */}
        {tab === "saved" && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-2">No saved experiences yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              Browse experiences and save ones you&apos;re interested in
            </p>
            <Btn onClick={() => setPage("explore")}>Explore Experiences</Btn>
          </div>
        )}

        {/* Savings Goals */}
        {tab === "goals" && (
          <div>
            {savingsGoals.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
                  No savings goals yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Plan a trip or adventure and save for it
                </p>
                <Btn onClick={() => setPage("builder")}>Plan an Experience</Btn>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {savingsGoals.map((g) => (
                    <GoalCard key={g.id} goal={g} onSelect={() => setSelectedGoal(g)} />
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">Ready to plan another adventure?</p>
                  <Btn variant="outline" onClick={() => setPage("builder")} size="sm">
                    + New Experience
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Past Adventures */}
        {tab === "past" && (
          <div className="space-y-4">
            {pastFromApi.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl bg-forest-100 flex items-center justify-center text-3xl shrink-0">
                    📌
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal text-sm">{r.provider?.name || "Reservation"}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📅 {new Date(r.reservedDate).toLocaleDateString()}
                    </p>
                    <Badge color={r.status === "REJECTED" ? "red" : "gray"} className="mt-2">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {PAST.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl bg-forest-100 overflow-hidden shrink-0">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal text-sm">{exp.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">📅 {exp.date}</p>
                    <p className="text-xs text-gray-400">📍 {exp.location}</p>
                    <p className="text-xs font-semibold text-charcoal mt-1">{formatRWF(exp.cost)}</p>
                    <div className="mt-1 text-yellow-400 text-xs">
                      {"★".repeat(exp.rating)} <span className="text-gray-400">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setPage("builder")}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-forest-700 text-white shadow-xl shadow-forest-700/30 flex items-center justify-center hover:bg-forest-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}

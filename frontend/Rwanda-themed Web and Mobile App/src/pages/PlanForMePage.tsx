import { useState } from "react"
import { AppState, Btn, Badge, formatRWF } from "../App"
import { searchExperiences, submitExperienceRequest } from "../api/urugendo"

const EXPERIENCE_TYPES = [
  { id: "trip", label: "Trip", emoji: "🌍" },
  { id: "adventure", label: "Adventure", emoji: "🌋" },
  { id: "night-out", label: "Night Out", emoji: "🌙" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "graduation", label: "Graduation", emoji: "🎓" },
  { id: "date", label: "Date", emoji: "❤️" },
]

const STYLES = [
  { id: "nature", label: "Nature & Wildlife", emoji: "🌿" },
  { id: "relax", label: "Relaxation", emoji: "🌅" },
  { id: "food", label: "Food & Dining", emoji: "🍽️" },
  { id: "adventure", label: "Adventure & Active", emoji: "🏔️" },
  { id: "culture", label: "Culture & Arts", emoji: "🎭" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
]

interface GeneratedPlan {
  tier: "Budget Friendly" | "Balanced" | "Premium"
  totalCost: number
  emoji: string
  tagline: string
  services: Array<{ name: string; cost: number; provider: string }>
  highlights: string[]
  color: string
  withinBudget: boolean
}

function generatePlans(
  expType: string,
  destination: string,
  budget: number,
  people: number,
  styles: string[]
): GeneratedPlan[] {
  const dest = destination || "Kigali"
  const isAdventure = expType === "adventure" || expType === "trip"
  const isNight = expType === "night-out" || expType === "date"

  if (isAdventure) {
    const base = [
      { name: "Transport (return)", cost: 40000 * Math.max(1, Math.floor(people / 4)), provider: "Private Car" },
      { name: "Accommodation (2 nights)", cost: 25000 * people, provider: dest + " Guesthouse" },
      { name: "Meals (2 days)", cost: 20000 * people, provider: "Local Restaurant" },
      { name: "Activities", cost: 15000 * people, provider: "Local Guide" },
    ]
    const mid = [
      { name: "Transport (return)", cost: 55000 * Math.max(1, Math.floor(people / 4)), provider: "Comfortable Van" },
      { name: "Hotel (2 nights)", cost: 45000 * people, provider: dest + " Hotel" },
      { name: "Meals (2 days)", cost: 30000 * people, provider: "Mid-range Dining" },
      { name: "Activities", cost: 25000 * people, provider: "Certified Guide" },
      { name: "Photography", cost: 30000, provider: "Session Photographer" },
    ]
    const prem = [
      { name: "Transport (return)", cost: 80000 * Math.max(1, Math.ceil(people / 4)), provider: "Luxury 4x4" },
      { name: "Premium Hotel (2 nights)", cost: 70000 * people, provider: dest + " Premium Lodge" },
      { name: "Dining (2 days)", cost: 50000 * people, provider: "Fine Dining" },
      { name: "Premium Activities", cost: 45000 * people, provider: "Expert Guide" },
      { name: "Professional Photography", cost: 60000, provider: "Photo Package" },
    ]
    const t1 = base.reduce((s, i) => s + i.cost, 0)
    const t2 = mid.reduce((s, i) => s + i.cost, 0)
    const t3 = prem.reduce((s, i) => s + i.cost, 0)

    return [
      {
        tier: "Budget Friendly",
        totalCost: t1,
        emoji: "💚",
        tagline: "Smart adventure without breaking the bank",
        services: base,
        highlights: ["Local guesthouse", "Shared transport", "Local guide", "Street food included"],
        color: "forest",
        withinBudget: t1 <= budget,
      },
      {
        tier: "Balanced",
        totalCost: t2,
        emoji: "⭐",
        tagline: "Best balance of comfort and experience",
        services: mid,
        highlights: ["Comfortable hotel", "Private van", "Certified guide", "Photography session"],
        color: "gold",
        withinBudget: t2 <= budget,
      },
      {
        tier: "Premium",
        totalCost: t3,
        emoji: "💎",
        tagline: "The ultimate luxury experience",
        services: prem,
        highlights: ["Premium lodge", "Luxury 4x4", "Expert private guide", "Full photography package"],
        color: "charcoal",
        withinBudget: t3 <= budget,
      },
    ]
  }

  if (isNight) {
    return [
      {
        tier: "Budget Friendly",
        totalCost: 35000 * people,
        emoji: "💚",
        tagline: "Great night out on a sensible budget",
        services: [
          { name: "Dinner for " + people, cost: 25000 * people, provider: "Repub Lounge" },
          { name: "Transport", cost: 10000 * people, provider: "Moto Taxi" },
        ],
        highlights: ["Casual dining", "Local vibes", "Great atmosphere"],
        color: "forest",
        withinBudget: 35000 * people <= budget,
      },
      {
        tier: "Balanced",
        totalCost: 70000 * people,
        emoji: "⭐",
        tagline: "Memorable evening with quality dining",
        services: [
          { name: "Premium Dinner for " + people, cost: 50000 * people, provider: "Heaven Restaurant" },
          { name: "Activity / Rooftop Bar", cost: 10000 * people, provider: "KiGali Bar" },
          { name: "Private Transport", cost: 10000 * people, provider: "Taxi" },
        ],
        highlights: ["Fine dining", "Sunset views", "Private taxi", "Premium atmosphere"],
        color: "gold",
        withinBudget: 70000 * people <= budget,
      },
      {
        tier: "Premium",
        totalCost: 120000 * people,
        emoji: "💎",
        tagline: "An extraordinary night to remember",
        services: [
          { name: "Premium Dinner for " + people, cost: 80000 * people, provider: "Serena Hotel Restaurant" },
          { name: "Event / Show", cost: 20000 * people, provider: "VIP Event" },
          { name: "Luxury Transport", cost: 20000 * people, provider: "Chauffeur Car" },
        ],
        highlights: ["5-star dining", "VIP access", "Chauffeur service", "Exclusive experience"],
        color: "charcoal",
        withinBudget: 120000 * people <= budget,
      },
    ]
  }

  return [
    {
      tier: "Budget Friendly",
      totalCost: Math.round(budget * 0.65),
      emoji: "💚",
      tagline: "Enjoy a great experience within budget",
      services: [
        { name: "Venue", cost: Math.round(budget * 0.25), provider: "Local Venue" },
        { name: "Food & Drinks", cost: Math.round(budget * 0.30), provider: "Catering" },
        { name: "Transport", cost: Math.round(budget * 0.10), provider: "Taxi" },
      ],
      highlights: ["Simple decor", "Quality catering", "Good location", "Within budget"],
      color: "forest",
      withinBudget: true,
    },
    {
      tier: "Balanced",
      totalCost: Math.round(budget * 0.85),
      emoji: "⭐",
      tagline: "The perfect mix of quality and value",
      services: [
        { name: "Premium Venue", cost: Math.round(budget * 0.30), provider: "Event Hall" },
        { name: "Catering", cost: Math.round(budget * 0.35), provider: "Restaurant Catering" },
        { name: "Decoration", cost: Math.round(budget * 0.10), provider: "Decor Company" },
        { name: "Photography", cost: Math.round(budget * 0.10), provider: "Photographer" },
      ],
      highlights: ["Premium venue", "Professional catering", "Decoration", "Photography"],
      color: "gold",
      withinBudget: true,
    },
    {
      tier: "Premium",
      totalCost: Math.round(budget * 1.1),
      emoji: "💎",
      tagline: "Pull out all the stops — an unforgettable event",
      services: [
        { name: "Luxury Venue", cost: Math.round(budget * 0.35), provider: "Premium Venue" },
        { name: "Fine Catering", cost: Math.round(budget * 0.40), provider: "Top Restaurant" },
        { name: "Full Decoration", cost: Math.round(budget * 0.15), provider: "Event Designer" },
        { name: "Full Photography", cost: Math.round(budget * 0.15), provider: "Pro Photographer" },
        { name: "Entertainment", cost: Math.round(budget * 0.05), provider: "Live Band" },
      ],
      highlights: ["Luxury venue", "Fine dining", "Professional entertainment", "Full photography"],
      color: "charcoal",
      withinBudget: false,
    },
  ]
}

export function PlanForMePage({ setPage, setSavingsGoals, savingsGoals }: AppState) {
  const [formStep, setFormStep] = useState(1)
  const [expType, setExpType] = useState("")
  const [from, setFrom] = useState("Kigali")
  const [destination, setDestination] = useState("")
  const [people, setPeople] = useState(2)
  const [budget, setBudget] = useState(300000)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [plans, setPlans] = useState<GeneratedPlan[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<GeneratedPlan | null>(null)
  const [savedPlan, setSavedPlan] = useState<string | null>(null)

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const generatePlansHandler = async () => {
    setLoading(true)
    const expLabel = EXPERIENCE_TYPES.find((e) => e.id === expType)?.label || "experience"
    const styleLabels = selectedStyles
      .map((id) => STYLES.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(", ")
    const text = `I want a ${expLabel} in ${destination || from} for ${people} people with a budget of ${budget} RWF${
      styleLabels ? `, preferring ${styleLabels}` : ""
    }.`

    try {
      // Persist intent via Joe's experience-request (ML when available)
      await submitExperienceRequest(text).catch(() => null)

      const catalog = await searchExperiences({
        location: destination || from,
        price_max: budget,
        limit: 12,
      }).catch(() => [])

      if (catalog.length > 0) {
        const pick = (start: number, count: number) =>
          catalog.slice(start, start + count).map((e) => ({
            name: e.name,
            cost: e.priceRwf,
            provider: e.provider?.name || "URUGENDO partner",
          }))

        const budgetServices = pick(0, Math.min(2, catalog.length))
        const balancedServices = pick(0, Math.min(3, catalog.length))
        const premiumServices = catalog.slice(0, Math.min(4, catalog.length)).map((e) => ({
          name: e.name,
          cost: Math.round(e.priceRwf * 1.15),
          provider: e.provider?.name || "URUGENDO partner",
        }))

        const sum = (rows: Array<{ cost: number }>) => rows.reduce((s, r) => s + r.cost, 0)
        const t1 = sum(budgetServices)
        const t2 = sum(balancedServices)
        const t3 = sum(premiumServices)

        setPlans([
          {
            tier: "Budget Friendly",
            totalCost: t1,
            emoji: "💚",
            tagline: "Built from live URUGENDO listings near your budget",
            services: budgetServices,
            highlights: ["Verified local providers", "Within or near your budget", "Real catalog prices"],
            color: "forest",
            withinBudget: t1 <= budget,
          },
          {
            tier: "Balanced",
            totalCost: t2 || t1,
            emoji: "⚖️",
            tagline: "A fuller mix of live local experiences",
            services: balancedServices.length ? balancedServices : budgetServices,
            highlights: ["More variety", "Live provider data", "Easy to customize later"],
            color: "gold",
            withinBudget: (t2 || t1) <= budget,
          },
          {
            tier: "Premium",
            totalCost: t3 || t2 || t1,
            emoji: "✨",
            tagline: "Elevated picks from the current catalog",
            services: premiumServices.length ? premiumServices : balancedServices,
            highlights: ["Top listed options", "Higher comfort", "Still grounded in real inventory"],
            color: "charcoal",
            withinBudget: (t3 || t2 || t1) <= budget,
          },
        ])
      } else {
        setPlans(generatePlans(expType, destination, budget, people, selectedStyles))
      }
      setFormStep(3)
    } catch {
      setPlans(generatePlans(expType, destination, budget, people, selectedStyles))
      setFormStep(3)
    } finally {
      setLoading(false)
    }
  }

  const saveForAdventure = (plan: GeneratedPlan) => {
    const expLabel = EXPERIENCE_TYPES.find((e) => e.id === expType)?.label || "Experience"
    const goal = {
      id: `plan-goal-${Date.now()}`,
      name: `${expLabel} – ${destination || from}`,
      emoji: EXPERIENCE_TYPES.find((e) => e.id === expType)?.emoji || "✨",
      targetAmount: plan.totalCost,
      currentSavings: 0,
      targetDate: "2026-12-31",
      image: "https://images.unsplash.com/photo-1779900275257-aaadab6d9285?w=800&h=500&fit=crop&auto=format",
      history: [],
    }
    setSavingsGoals([...savingsGoals, goal])
    setSavedPlan(plan.tier)
    setTimeout(() => setPage("my-adventures"), 1500)
  }

  if (formStep === 3 && plans) {
    return (
      <div className="min-h-screen bg-forest-50">
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setFormStep(2)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-semibold text-charcoal text-lg">
              Your Generated Plans
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm">
              3 plans generated for your{" "}
              <strong className="text-charcoal">
                {EXPERIENCE_TYPES.find((e) => e.id === expType)?.label}
              </strong>{" "}
              in <strong className="text-charcoal">{destination || from}</strong> for{" "}
              <strong className="text-charcoal">{people} {people === 1 ? "person" : "people"}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Budget: {formatRWF(budget)} · All prices are estimated sample prices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                onClick={() => setSelectedPlan(selectedPlan?.tier === plan.tier ? null : plan)}
                className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  selectedPlan?.tier === plan.tier
                    ? "border-forest-500 shadow-lg"
                    : "border-gray-100 shadow-sm"
                }`}
              >
                <div className={`px-5 py-4 ${
                  plan.tier === "Budget Friendly"
                    ? "bg-forest-700"
                    : plan.tier === "Balanced"
                    ? "bg-gold-500"
                    : "bg-charcoal"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold text-sm">{plan.tier}</span>
                    <span className="text-2xl">{plan.emoji}</span>
                  </div>
                  <div className="text-white/80 text-xs">{plan.tagline}</div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-charcoal font-display">
                        {formatRWF(plan.totalCost)}
                      </span>
                      <p className="text-xs text-gray-400">estimated total</p>
                    </div>
                    <Badge color={plan.withinBudget ? "green" : "red"}>
                      {plan.withinBudget ? "✓ Within Budget" : "⚠ Over Budget"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {plan.services.map((s, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-500">{s.name}</span>
                        <span className="font-medium text-charcoal">{formatRWF(s.cost)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 pt-3 mb-4">
                    {plan.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-1.5 text-xs text-gray-500 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-400 shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Btn
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => setPage("builder")}
                    >
                      Use This Plan
                    </Btn>
                    <Btn
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => saveForAdventure(plan)}
                      disabled={savedPlan === plan.tier}
                    >
                      {savedPlan === plan.tier ? "✓ Saved!" : "💰 Save for This"}
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Btn variant="ghost" onClick={() => setFormStep(2)}>
              ← Adjust my preferences
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => (formStep > 1 ? setFormStep(s => s - 1) : setPage("home"))}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display font-semibold text-charcoal text-lg">Plan It For Me</h1>
            <p className="text-xs text-gray-400">
              Tell us what you want — we&apos;ll create your perfect plan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1 */}
        {formStep === 1 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                What are you planning?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {EXPERIENCE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setExpType(t.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      expType === t.id
                        ? "border-forest-600 bg-forest-50 shadow-sm"
                        : "border-gray-100 hover:border-forest-200"
                    }`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-xs font-medium text-center text-charcoal">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Starting from
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Kigali", "Musanze", "Rubavu", "Huye"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setFrom(loc)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      from === loc
                        ? "border-forest-600 bg-forest-50 text-forest-700"
                        : "border-gray-200 text-gray-600 hover:border-forest-200"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Destination (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {["Kigali", "Musanze", "Rubavu", "Nyungwe", "Akagera", "Huye"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setDestination(destination === loc ? "" : loc)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      destination === loc
                        ? "border-forest-600 bg-forest-50 text-forest-700"
                        : "border-gray-200 text-gray-600 hover:border-forest-200"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <Btn
              onClick={() => setFormStep(2)}
              disabled={!expType}
              className="w-full justify-center"
              size="lg"
            >
              Continue →
            </Btn>
          </div>
        )}

        {/* Step 2 */}
        {formStep === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                How many people?
              </label>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 4, 6, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPeople(n)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      people === n
                        ? "border-forest-600 bg-forest-50 text-forest-700"
                        : "border-gray-200 text-gray-600 hover:border-forest-200"
                    }`}
                  >
                    {n === 15 ? "10+" : n}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Total budget
              </label>
              <div className="text-2xl font-bold text-forest-700 font-display mb-3">
                {formatRWF(budget)}
              </div>
              <input
                type="range"
                min={20000}
                max={1000000}
                step={10000}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-forest-700 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {[50000, 100000, 200000, 300000, 500000].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      budget === b
                        ? "border-forest-500 bg-forest-50 text-forest-700"
                        : "border-gray-200 text-gray-500 hover:border-forest-200"
                    }`}
                  >
                    {formatRWF(b)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                What do you enjoy? (choose all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleStyle(s.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedStyles.includes(s.id)
                        ? "border-forest-500 bg-forest-50 text-forest-700"
                        : "border-gray-100 text-gray-600 hover:border-forest-200"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span className="text-xs">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Btn
              onClick={generatePlansHandler}
              className="w-full justify-center"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating your plans...
                </span>
              ) : (
                "✨ Generate My Plans →"
              )}
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}

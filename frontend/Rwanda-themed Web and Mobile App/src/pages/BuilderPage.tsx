import { useState, useMemo } from "react"
import { AppState, Btn, Badge, formatRWF } from "../App"
import { useAuth } from "../auth/AuthContext"
import { ApiError } from "../api/client"
import { createReservation, listPublicProviders } from "../api/urugendo"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceItem {
  id: string
  name: string
  cost: number
  icon: string
  options?: ServiceOption[]
}

interface ServiceOption {
  id: string
  name: string
  cost: number
  rating?: number
}

// ── Data ─────────────────────────────────────────────────────────────────────

const EXPERIENCE_TYPES = [
  { id: "trip", label: "Trip", emoji: "🌍" },
  { id: "adventure", label: "Adventure", emoji: "🌋" },
  { id: "night-out", label: "Night Out", emoji: "🌙" },
  { id: "dinner", label: "Dinner", emoji: "🍽️" },
  { id: "date", label: "Date", emoji: "❤️" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "graduation", label: "Graduation", emoji: "🎓" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "concert", label: "Concert", emoji: "🎵" },
  { id: "game", label: "Game", emoji: "⚽" },
  { id: "family", label: "Family Day", emoji: "👨‍👩‍👧" },
  { id: "other", label: "Other", emoji: "✨" },
]

const LOCATIONS = [
  "Kigali", "Musanze", "Rubavu", "Nyungwe", "Huye",
  "Akagera", "Muhanga", "Karongi", "Gisenyi", "Butare",
]

const PEOPLE_OPTIONS = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3–5", value: 4 },
  { label: "6–10", value: 8 },
  { label: "10+", value: 15 },
]

const getServicesForType = (type: string): ServiceItem[] => {
  const RESTAURANTS: ServiceOption[] = [
    { id: "r1", name: "Heaven Restaurant, Kigali", cost: 50000, rating: 4.9 },
    { id: "r2", name: "Repub Lounge, Kigali", cost: 35000, rating: 4.7 },
    { id: "r3", name: "1000 Hills Resto, Musanze", cost: 28000, rating: 4.5 },
    { id: "r4", name: "Cactus Restaurant", cost: 22000, rating: 4.3 },
  ]
  const TRANSPORT: ServiceOption[] = [
    { id: "t1", name: "Private Car (Toyota Corolla)", cost: 40000, rating: 4.6 },
    { id: "t2", name: "Minibus (8-seater)", cost: 65000, rating: 4.4 },
    { id: "t3", name: "Moto Taxi (×2)", cost: 8000, rating: 4.2 },
    { id: "t4", name: "Taxi / Yeggo", cost: 15000, rating: 4.5 },
  ]
  const HOTELS: ServiceOption[] = [
    { id: "h1", name: "Serena Hotel, Kigali", cost: 80000, rating: 4.9 },
    { id: "h2", name: "Kivu Lake Retreat", cost: 60000, rating: 4.7 },
    { id: "h3", name: "Gorillas Lake Kivu Hotel", cost: 45000, rating: 4.5 },
    { id: "h4", name: "Guesthouse, Musanze", cost: 25000, rating: 4.2 },
  ]
  const ACTIVITIES: ServiceOption[] = [
    { id: "a1", name: "Gorilla Trekking", cost: 150000, rating: 5.0 },
    { id: "a2", name: "Canopy Walk, Nyungwe", cost: 30000, rating: 4.8 },
    { id: "a3", name: "Boat Tour, Lake Kivu", cost: 25000, rating: 4.7 },
    { id: "a4", name: "City Tour, Kigali", cost: 20000, rating: 4.5 },
  ]
  const PHOTOGRAPHY: ServiceOption[] = [
    { id: "p1", name: "Professional Photographer (4h)", cost: 50000, rating: 4.8 },
    { id: "p2", name: "Photographer + Videographer", cost: 80000, rating: 4.9 },
    { id: "p3", name: "Basic Photo Package (2h)", cost: 30000, rating: 4.5 },
  ]

  switch (type) {
    case "birthday":
    case "graduation":
    case "party":
    case "wedding":
      return [
        { id: "venue", name: "Venue", cost: 80000, icon: "🏛️", options: [
          { id: "v1", name: "Private Villa, Kigali", cost: 120000, rating: 4.9 },
          { id: "v2", name: "Restaurant Private Room", cost: 80000, rating: 4.7 },
          { id: "v3", name: "Event Hall, Kacyiru", cost: 60000, rating: 4.5 },
          { id: "v4", name: "Garden Venue, Rebero", cost: 45000, rating: 4.4 },
        ]},
        { id: "restaurant", name: "Restaurant / Catering", cost: 50000, icon: "🍽️", options: RESTAURANTS },
        { id: "cake", name: "Cake", cost: 35000, icon: "🎂", options: [
          { id: "c1", name: "Custom 3-tier Cake", cost: 55000, rating: 4.8 },
          { id: "c2", name: "Standard Celebration Cake", cost: 35000, rating: 4.6 },
          { id: "c3", name: "Mini Cake + Cupcakes", cost: 25000, rating: 4.5 },
        ]},
        { id: "decoration", name: "Decoration", cost: 45000, icon: "🎀", options: [
          { id: "d1", name: "Full Decor Package", cost: 70000, rating: 4.7 },
          { id: "d2", name: "Balloon & Floral Decor", cost: 45000, rating: 4.5 },
          { id: "d3", name: "Simple Themed Decor", cost: 25000, rating: 4.3 },
        ]},
        { id: "photography", name: "Photography", cost: 50000, icon: "📸", options: PHOTOGRAPHY },
        { id: "transport", name: "Transport", cost: 30000, icon: "🚗", options: TRANSPORT },
        { id: "entertainment", name: "Entertainment", cost: 40000, icon: "🎤", options: [
          { id: "e1", name: "Live Band (2h)", cost: 80000, rating: 4.8 },
          { id: "e2", name: "DJ Set (4h)", cost: 50000, rating: 4.6 },
          { id: "e3", name: "Acoustic Guitarist", cost: 35000, rating: 4.5 },
        ]},
      ]
    case "concert":
      return [
        { id: "ticket", name: "Event Ticket", cost: 20000, icon: "🎫", options: [
          { id: "tk1", name: "VIP Ticket", cost: 50000, rating: 4.9 },
          { id: "tk2", name: "Standard Ticket", cost: 20000, rating: 4.7 },
          { id: "tk3", name: "Early Bird Ticket", cost: 15000, rating: 4.5 },
        ]},
        { id: "restaurant", name: "Dinner", cost: 35000, icon: "🍽️", options: RESTAURANTS },
        { id: "transport", name: "Transport", cost: 10000, icon: "🚗", options: TRANSPORT },
        { id: "accommodation", name: "Accommodation (optional)", cost: 0, icon: "🏨", options: HOTELS },
      ]
    case "night-out":
    case "date":
      return [
        { id: "restaurant", name: "Restaurant", cost: 35000, icon: "🍽️", options: RESTAURANTS },
        { id: "activity", name: "Activity", cost: 20000, icon: "🎯", options: [
          { id: "ac1", name: "Rooftop Bar Experience", cost: 20000, rating: 4.8 },
          { id: "ac2", name: "Cinema Screening", cost: 12000, rating: 4.4 },
          { id: "ac3", name: "Bowling Night", cost: 15000, rating: 4.3 },
          { id: "ac4", name: "Sunset Boat Ride", cost: 30000, rating: 4.9 },
        ]},
        { id: "transport", name: "Transport", cost: 10000, icon: "🚗", options: TRANSPORT },
      ]
    default:
      return [
        { id: "transport", name: "Transport", cost: 40000, icon: "🚗", options: TRANSPORT },
        { id: "accommodation", name: "Hotel / Accommodation", cost: 80000, icon: "🏨", options: HOTELS },
        { id: "restaurant", name: "Restaurants", cost: 50000, icon: "🍽️", options: RESTAURANTS },
        { id: "activities", name: "Activities", cost: 60000, icon: "🎯", options: ACTIVITIES },
        { id: "photography", name: "Photography", cost: 50000, icon: "📸", options: PHOTOGRAPHY },
        { id: "local-transport", name: "Local Transport", cost: 15000, icon: "🛵", options: TRANSPORT },
      ]
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BuilderPage({ setPage, setSavingsGoals, savingsGoals }: AppState) {
  const [step, setStep] = useState(1)
  const [expType, setExpType] = useState("")
  const [fromLoc, setFromLoc] = useState("Kigali")
  const [toLoc, setToLoc] = useState("")
  const [date, setDate] = useState("")
  const [people, setPeople] = useState(2)
  const [budget, setBudget] = useState(300000)
  const [customBudget, setCustomBudget] = useState("")
  const [services, setServices] = useState<ServiceItem[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ServiceOption>>({})
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)

  const activeBudget = customBudget ? parseInt(customBudget) || 0 : budget
  const totalCost = useMemo(() => {
    return services.reduce((sum, s) => {
      const opt = selectedOptions[s.id]
      return sum + (opt ? opt.cost : s.cost)
    }, 0)
  }, [services, selectedOptions])
  const remaining = activeBudget - totalCost
  const withinBudget = remaining >= 0

  const handleNext = () => {
    if (step === 5) {
      setServices(getServicesForType(expType))
    }
    if (step < 6) setStep((s) => s + 1)
  }

  const toggleService = (svc: ServiceItem) => {
    if (services.find((s) => s.id === svc.id)) {
      setServices(services.filter((s) => s.id !== svc.id))
      const newOpts = { ...selectedOptions }
      delete newOpts[svc.id]
      setSelectedOptions(newOpts)
    } else {
      setServices([...services, svc])
    }
  }

  const saveForTrip = () => {
    const goal = {
      id: `goal-${Date.now()}`,
      name: expType ? EXPERIENCE_TYPES.find((e) => e.id === expType)?.label + " – " + (toLoc || fromLoc) : "My Adventure",
      emoji: EXPERIENCE_TYPES.find((e) => e.id === expType)?.emoji || "✨",
      targetAmount: totalCost,
      currentSavings: 0,
      targetDate: date || "2026-12-31",
      image: "https://images.unsplash.com/photo-1779900275257-aaadab6d9285?w=800&h=500&fit=crop&auto=format",
      history: [],
    }
    setSavingsGoals([...savingsGoals, goal])
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setPage("my-adventures")
    }, 1500)
  }

  if (showBookingFlow) {
    return (
      <BookingFlow
        expType={expType}
        toLoc={toLoc}
        fromLoc={fromLoc}
        date={date}
        people={people}
        totalCost={totalCost}
        services={services}
        selectedOptions={selectedOptions}
        step={bookingStep}
        setStep={setBookingStep}
        onClose={() => setShowBookingFlow(false)}
        setPage={setPage}
      />
    )
  }

  return (
    <div className="min-h-screen bg-forest-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => (step > 1 ? setStep(s => s - 1) : setPage("home"))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-display font-semibold text-charcoal text-lg">
              Plan an Experience
            </h1>
            <div className="flex gap-1.5 mt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                    i < step ? "bg-forest-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs font-medium text-gray-400">
            Step {step} of 6
          </span>
        </div>
      </div>

      <div className={`max-w-3xl mx-auto px-4 py-8 ${step === 6 ? "md:flex gap-6" : ""}`}>
        {/* Steps 1-5 */}
        {step !== 6 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {/* Step 1: Type */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">
                  What are you planning?
                </h2>
                <p className="text-gray-500 text-sm mb-6">Choose the type of experience</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {EXPERIENCE_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setExpType(t.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        expType === t.id
                          ? "border-forest-600 bg-forest-50 shadow-sm"
                          : "border-gray-100 hover:border-forest-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-xs font-medium text-charcoal text-center">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">Where?</h2>
                <p className="text-gray-500 text-sm mb-6">Starting point and destination</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Starting from
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LOCATIONS.slice(0, 5).map((loc) => (
                        <button
                          key={loc}
                          onClick={() => setFromLoc(loc)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            fromLoc === loc
                              ? "border-forest-600 bg-forest-50 text-forest-700"
                              : "border-gray-200 text-gray-600 hover:border-forest-200"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Destination
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => setToLoc(loc)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            toLoc === loc
                              ? "border-forest-600 bg-forest-50 text-forest-700"
                              : "border-gray-200 text-gray-600 hover:border-forest-200"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Date */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">When?</h2>
                <p className="text-gray-500 text-sm mb-6">Select your date and time</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest-500 transition-colors"
                    />
                  </div>
                  <div className="bg-forest-50 rounded-xl p-4 flex gap-3">
                    <span className="text-2xl">📅</span>
                    <div className="text-sm text-forest-700">
                      <p className="font-semibold">Quick pick</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {["This weekend", "Next weekend", "This month"].map((opt) => (
                          <button
                            key={opt}
                            className="bg-white border border-forest-200 text-forest-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-forest-100 transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: People */}
            {step === 4 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">How many people?</h2>
                <p className="text-gray-500 text-sm mb-6">This helps us estimate costs accurately</p>
                <div className="flex flex-wrap gap-3">
                  {PEOPLE_OPTIONS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setPeople(p.value)}
                      className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 transition-all ${
                        people === p.value
                          ? "border-forest-600 bg-forest-50 shadow-sm"
                          : "border-gray-200 hover:border-forest-200"
                      }`}
                    >
                      <span className="text-2xl mb-1">
                        {p.value === 1 ? "👤" : p.value <= 2 ? "👥" : p.value <= 4 ? "👨‍👩‍👦" : p.value <= 8 ? "🎉" : "🏟️"}
                      </span>
                      <span className="text-sm font-semibold text-charcoal">{p.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 bg-forest-50 rounded-xl p-4 text-sm text-forest-700">
                  <strong>Custom number?</strong>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    placeholder="Enter exact number"
                    className="mt-2 w-32 border border-forest-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest-500"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Budget */}
            {step === 5 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">Set your budget</h2>
                <p className="text-gray-500 text-sm mb-6">Your total budget for this experience</p>
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>20,000 RWF</span>
                    <span className="text-forest-700 font-semibold text-base">
                      {formatRWF(customBudget ? parseInt(customBudget) || 0 : budget)}
                    </span>
                    <span>1,000,000 RWF</span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={1000000}
                    step={5000}
                    value={customBudget ? parseInt(customBudget) || 20000 : budget}
                    onChange={(e) => { setBudget(parseInt(e.target.value)); setCustomBudget("") }}
                    className="w-full accent-forest-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[50000, 100000, 200000, 300000, 500000].map((b) => (
                    <button
                      key={b}
                      onClick={() => { setBudget(b); setCustomBudget("") }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        budget === b && !customBudget
                          ? "border-forest-600 bg-forest-50 text-forest-700"
                          : "border-gray-200 text-gray-600 hover:border-forest-200"
                      }`}
                    >
                      {formatRWF(b)}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Custom amount (RWF)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your budget"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Btn variant="outline" onClick={() => setStep(s => s - 1)}>
                  Back
                </Btn>
              )}
              <Btn
                onClick={handleNext}
                className="flex-1 justify-center"
                disabled={
                  (step === 1 && !expType) ||
                  (step === 2 && !toLoc) ||
                  (step === 3 && !date)
                }
              >
                {step === 5 ? "Choose Services →" : "Continue →"}
              </Btn>
            </div>
          </div>
        )}

        {/* Step 6: Services + Live Budget */}
        {step === 6 && (
          <>
            {/* Services list */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="font-display text-xl font-semibold text-charcoal mb-1">
                  Choose your services
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                  Tap to add or remove. Change provider with the dropdown.
                </p>
                <div className="space-y-3">
                  {getServicesForType(expType).map((svc) => {
                    const isSelected = !!services.find((s) => s.id === svc.id)
                    const selectedOpt = selectedOptions[svc.id]
                    const displayCost = selectedOpt ? selectedOpt.cost : svc.cost

                    return (
                      <div
                        key={svc.id}
                        className={`rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-forest-500 bg-forest-50"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <span className="text-xl">{svc.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-charcoal text-sm">{svc.name}</span>
                              {isSelected && (
                                <Badge color="green">Added</Badge>
                              )}
                            </div>
                            {selectedOpt && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedOpt.name}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-sm font-semibold ${isSelected ? "text-forest-700" : "text-gray-500"}`}>
                              ~{formatRWF(displayCost)}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleService(svc)}
                            className={`ml-2 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-forest-600 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-forest-100"
                            }`}
                          >
                            {isSelected ? "−" : "+"}
                          </button>
                        </div>

                        {/* Provider dropdown */}
                        {isSelected && svc.options && (
                          <div className="border-t border-forest-100 px-4 pb-3">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === svc.id ? null : svc.id)}
                              className="mt-2 text-xs text-forest-600 font-medium flex items-center gap-1 hover:underline"
                            >
                              {selectedOpt ? "Change provider" : "Select provider"}
                              <svg className={`w-3 h-3 transition-transform ${openDropdown === svc.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {openDropdown === svc.id && (
                              <div className="mt-2 space-y-1.5">
                                {svc.options.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => {
                                      setSelectedOptions({ ...selectedOptions, [svc.id]: opt })
                                      setOpenDropdown(null)
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                      selectedOpt?.id === opt.id
                                        ? "bg-forest-100 text-forest-700"
                                        : "hover:bg-gray-50 text-gray-600"
                                    }`}
                                  >
                                    <span>{opt.name}</span>
                                    <span className="font-semibold ml-2">{formatRWF(opt.cost)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Live budget sidebar */}
            <div className="md:w-72 shrink-0">
              <div className={`sticky top-20 rounded-2xl border-2 p-5 transition-all ${
                withinBudget
                  ? "border-forest-400 bg-forest-50"
                  : "border-red-300 bg-red-50"
              }`}>
                <h3 className="font-display font-semibold text-charcoal text-base mb-4">
                  Your Experience
                </h3>

                <div className="space-y-2 mb-4">
                  {[
                    { label: "Type", value: EXPERIENCE_TYPES.find(e => e.id === expType)?.label || "–" },
                    { label: "From", value: fromLoc },
                    { label: "To", value: toLoc || "–" },
                    { label: "Date", value: date || "–" },
                    { label: "People", value: String(people) },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{r.label}</span>
                      <span className="font-medium text-charcoal">{r.value}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Your budget</span>
                    <span className="font-bold text-charcoal">{formatRWF(activeBudget)}</span>
                  </div>
                  {services.length > 0 && (
                    <div className="space-y-1">
                      {services.map((s) => {
                        const opt = selectedOptions[s.id]
                        return (
                          <div key={s.id} className="flex justify-between text-xs text-gray-500">
                            <span>{s.name}</span>
                            <span>{formatRWF(opt ? opt.cost : s.cost)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                    <span className="text-charcoal">Estimated total</span>
                    <span className="text-charcoal">{formatRWF(totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className={withinBudget ? "text-forest-700" : "text-red-600"}>
                      {withinBudget ? "Remaining" : "Over budget by"}
                    </span>
                    <span className={withinBudget ? "text-forest-700" : "text-red-600"}>
                      {formatRWF(Math.abs(remaining))}
                    </span>
                  </div>
                </div>

                <div className={`rounded-xl px-4 py-3 text-sm font-semibold text-center mb-4 ${
                  withinBudget
                    ? "bg-forest-600 text-white"
                    : "bg-red-500 text-white"
                }`}>
                  {withinBudget ? "✓ Within Budget" : "⚠ Over Budget"}
                </div>

                {!withinBudget && (
                  <div className="bg-white rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-charcoal mb-1">Suggestions:</p>
                    <p>• Choose a cheaper accommodation option</p>
                    <p>• Reduce transport cost</p>
                    <p>• Remove an activity</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Btn
                    onClick={() => setShowBookingFlow(true)}
                    className="w-full justify-center"
                    disabled={services.length === 0}
                  >
                    Book / Request →
                  </Btn>
                  <Btn
                    variant="outline"
                    onClick={saveForTrip}
                    className="w-full justify-center"
                    disabled={services.length === 0 || saveSuccess}
                  >
                    {saveSuccess ? "✓ Saved!" : "💰 Save for this Trip"}
                  </Btn>
                </div>

                <p className="text-center text-xs text-gray-400 mt-3">
                  All prices are estimated sample prices
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Booking Flow ──────────────────────────────────────────────────────────────

function BookingFlow({
  expType, toLoc, fromLoc, date, people, totalCost, services, selectedOptions,
  step, setStep, onClose, setPage,
}: {
  expType: string; toLoc: string; fromLoc: string; date: string; people: number
  totalCost: number; services: ServiceItem[]; selectedOptions: Record<string, ServiceOption>
  step: number; setStep: (s: number) => void; onClose: () => void; setPage: (p: any) => void
}) {
  const { isAuthenticated } = useAuth()
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const expLabel = EXPERIENCE_TYPES.find((e) => e.id === expType)?.label || "Experience"

  const confirmBooking = async () => {
    if (!isAuthenticated) {
      setPage("login")
      return
    }
    setBookingLoading(true)
    setBookingError(null)
    try {
      const providers = await listPublicProviders(
        toLoc ? { location: toLoc.split(",")[0].trim() } : undefined
      )
      let providerId = providers[0]?.id
      if (!providerId) {
        const all = await listPublicProviders()
        providerId = all[0]?.id
      }
      if (!providerId) {
        throw new ApiError(
          400,
          "No verified providers are available yet. Ask an admin to verify a business listing first."
        )
      }

      const reservedDate = date
        ? new Date(`${date}T18:00:00`).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const serviceSummary = services
        .map((s) => {
          const opt = selectedOptions[s.id]
          return `${s.name}: ${opt ? opt.name : "default"} (${opt ? opt.cost : s.cost} RWF)`
        })
        .join("; ")

      await createReservation({
        providerId,
        reservedDate,
        reservedTime: "18:00",
        people,
        specialRequest: `${expLabel} · ${fromLoc} → ${toLoc || fromLoc} · est ${totalCost} RWF · ${serviceSummary}`,
      })
      setStep(7)
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : "Booking failed")
    } finally {
      setBookingLoading(false)
    }
  }

  if (step === 7) {
    return (
      <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-3xl font-semibold text-charcoal mb-3">
            Booking Request Received!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Your booking request has been received. Our team will confirm your experience
            shortly. Check your adventures for updates.
          </p>
          <div className="bg-forest-50 rounded-2xl p-4 text-left mb-6">
            <h3 className="font-semibold text-charcoal text-sm mb-3">Sample Itinerary</h3>
            {[
              ["08:00", "Leave " + fromLoc],
              ["11:00", "Arrive at " + (toLoc || "destination")],
              ["13:00", "Lunch at selected restaurant"],
              ["15:00", "Main activity"],
              ["19:00", "Dinner"],
              ["21:00", "Return / Check-in"],
            ].map(([time, desc]) => (
              <div key={time} className="flex gap-3 text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-forest-600 font-mono font-semibold w-12 shrink-0">{time}</span>
                <span className="text-gray-600">{desc}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Btn className="w-full justify-center" onClick={() => setPage("my-adventures")}>
              View My Adventures
            </Btn>
            <Btn variant="ghost" className="w-full justify-center" onClick={() => setPage("home")}>
              Back to Home
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    "Review Experience",
    "Confirm Services",
    "Date & Time",
    "Number of People",
    "Review Total",
    "Payment",
  ]

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-display font-semibold text-charcoal text-base">Booking Flow</h1>
            <p className="text-xs text-gray-400">{steps[step - 1]}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex gap-1 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-forest-600" : "bg-gray-200"}`} />
            ))}
          </div>

          {step <= 4 && (
            <>
              <h2 className="font-display text-xl font-semibold text-charcoal mb-4">{steps[step - 1]}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium">{expLabel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Route</span>
                  <span className="font-medium">{fromLoc} → {toLoc || "Same city"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{date || "To be confirmed"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">People</span>
                  <span className="font-medium">{people}</span>
                </div>
                {services.map((s) => {
                  const opt = selectedOptions[s.id]
                  return (
                    <div key={s.id} className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">{s.name}</span>
                      <span className="font-medium">{formatRWF(opt ? opt.cost : s.cost)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="font-display text-xl font-semibold text-charcoal mb-4">Review Total</h2>
              <div className="bg-forest-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Estimated Total</span>
                  <span className="text-forest-700">{formatRWF(totalCost)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Final prices confirmed by providers</p>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="font-display text-xl font-semibold text-charcoal mb-4">Payment</h2>
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-4 text-center">
                <span className="text-2xl mb-2 block">🔒</span>
                <p className="font-semibold text-charcoal">Demo Payment</p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment integration coming soon. This is a prototype demo.
                </p>
              </div>
              <div className="bg-forest-50 rounded-xl p-4">
                <div className="flex justify-between font-bold">
                  <span>Total to pay</span>
                  <span className="text-forest-700">{formatRWF(totalCost)}</span>
                </div>
              </div>
            </>
          )}

          {bookingError && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {bookingError}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Btn variant="outline" onClick={() => setStep(step - 1)}>Back</Btn>
            )}
            <Btn
              className="flex-1 justify-center"
              disabled={bookingLoading}
              onClick={() => {
                if (step === 6) confirmBooking()
                else setStep(step + 1)
              }}
            >
              {bookingLoading
                ? "Sending request..."
                : step === 6
                ? "Confirm Booking"
                : "Continue →"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

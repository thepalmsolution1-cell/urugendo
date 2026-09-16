import { useEffect, useState } from "react"
import { AppState, Btn, Badge } from "../App"
import { useAuth } from "../auth/AuthContext"
import { ApiError } from "../api/client"
import {
  listMyProviders,
  listProviderReservations,
  mapBusinessCategory,
  registerProvider,
  updateReservationStatus,
  type Provider,
  type Reservation,
} from "../api/urugendo"

const CATEGORIES = [
  "Hotels & Guesthouses",
  "Restaurants & Cafes",
  "Transport Providers",
  "Tour Operators & Guides",
  "Event Organizers",
  "Venues",
  "Photographers & Videographers",
  "Cake & Decorations",
  "Entertainment",
  "Activity Providers",
  "Other",
]

const STATS = [
  { label: "Experiences Built", value: "2,400+", icon: "🌟" },
  { label: "Provider Listings", value: "180+", icon: "🏪" },
  { label: "Customer Bookings", value: "850+", icon: "📋" },
  { label: "Cities Covered", value: "12", icon: "📍" },
]

const PRICE_BANDS: Record<string, { min?: number; max?: number }> = {
  Budget: { min: 5000, max: 30000 },
  "Mid-range": { min: 30000, max: 80000 },
  Premium: { min: 80000, max: 200000 },
  Luxury: { min: 200000, max: 1000000 },
}

type FormStep = "landing" | "form" | "success" | "dashboard"

export function BusinessPage({ setPage }: AppState) {
  const { isAuthenticated } = useAuth()
  const [formStep, setFormStep] = useState<FormStep>("landing")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [form, setForm] = useState({
    name: "", category: "", location: "", phone: "", email: "",
    description: "", services: "", priceRange: "", website: "", social: "",
  })

  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const loadDashboard = async () => {
    const mine = await listMyProviders()
    const current = mine[0] || null
    setProvider(current)
    if (current) {
      const rows = await listProviderReservations(current.id)
      setReservations(rows)
    } else {
      setReservations([])
    }
  }

  useEffect(() => {
    if (formStep === "dashboard" && isAuthenticated) {
      loadDashboard().catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard")
      })
    }
  }, [formStep, isAuthenticated])

  const startPartnerFlow = () => {
    if (!isAuthenticated) {
      setPage("login")
      return
    }
    setFormStep("form")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setPage("login")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const band = PRICE_BANDS[form.priceRange] || {}
      const created = await registerProvider({
        name: form.name,
        category: mapBusinessCategory(form.category),
        description: [form.description, form.services].filter(Boolean).join("\n\n") || undefined,
        contactEmail: form.email,
        contactPhone: form.phone,
        location: form.location,
        priceRangeMin: band.min,
        priceRangeMax: band.max,
      })
      setProvider(created)
      setFormStep("success")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatus = async (reservationId: string, status: "CONFIRMED" | "REJECTED") => {
    if (!provider) return
    try {
      await updateReservationStatus(provider.id, reservationId, status)
      await loadDashboard()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update reservation")
    }
  }

  if (formStep === "success") {
    return (
      <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-forest-700 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-3">
            Application Submitted!
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            Thank you, <strong className="text-charcoal">{form.name || provider?.name || "your business"}</strong>!
            Your listing is <Badge color="gold">{provider?.verificationStatus || "PENDING"}</Badge>
          </p>
          <p className="text-xs text-gray-400 mb-6">
            We&apos;ll reach you at {form.email || provider?.contactEmail || "your provided email"}.
          </p>
          <div className="space-y-2">
            <Btn className="w-full justify-center" onClick={() => setFormStep("dashboard")}>
              View Business Dashboard →
            </Btn>
            <Btn variant="ghost" className="w-full justify-center" onClick={() => setPage("home")}>
              Back to Home
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  if (formStep === "dashboard") {
    const pending = reservations.filter((r) => r.status === "REQUESTED" || r.status === "PROCESSING")
    return (
      <div className="min-h-screen bg-forest-50">
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-display font-semibold text-charcoal text-lg">
                Business Dashboard
              </h1>
              <p className="text-xs text-gray-400">
                {provider?.name || form.name || "My Business"} · Live
              </p>
            </div>
            <Badge color={provider?.verificationStatus === "VERIFIED" ? "green" : "gold"}>
              {provider?.verificationStatus || "PENDING"}
            </Badge>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Bookings", value: String(reservations.length), icon: "📋", change: "Live" },
              { label: "Pending Requests", value: String(pending.length), icon: "⏳", change: "" },
              { label: "Experiences", value: String(provider?._count?.experiences ?? 0), icon: "🌟", change: "" },
              { label: "Status", value: provider?.verificationStatus || "—", icon: "✅", change: "" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  {s.change && <Badge color="green">{s.change}</Badge>}
                </div>
                <div className="font-bold text-2xl font-display text-charcoal">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-charcoal text-sm mb-4">Manage Your Services</h3>
              <p className="text-sm text-gray-500 mb-3">
                Listing connected to the URUGENDO backend. Refresh to pull the latest bookings.
              </p>
              <Btn variant="outline" size="sm" onClick={() => loadDashboard()}>
                Refresh data
              </Btn>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-charcoal text-sm mb-4">Recent Booking Requests</h3>
              {reservations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">No booking requests yet</p>
                  <p className="text-xs mt-1">They&apos;ll appear here once customers book you</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {reservations.map((r) => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-charcoal">
                            {r.user?.name || "Guest"} · {r.people} people
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(r.reservedDate).toLocaleString()} {r.reservedTime || ""}
                          </p>
                        </div>
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
                      {r.specialRequest && (
                        <p className="text-xs text-gray-500 mb-2">{r.specialRequest}</p>
                      )}
                      {(r.status === "REQUESTED" || r.status === "PROCESSING") && (
                        <div className="flex gap-2">
                          <Btn size="sm" onClick={() => handleStatus(r.id, "CONFIRMED")}>
                            Accept
                          </Btn>
                          <Btn size="sm" variant="danger" onClick={() => handleStatus(r.id, "REJECTED")}>
                            Reject
                          </Btn>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-forest-700 rounded-2xl p-5 text-white text-center">
            <h3 className="font-display font-semibold text-lg mb-2">
              {provider?.verificationStatus === "VERIFIED"
                ? "Your profile is live"
                : "Your profile is under review"}
            </h3>
            <p className="text-white/70 text-sm">
              {provider?.verificationStatus === "VERIFIED"
                ? "Customers planning experiences in Rwanda can find and book your business through URUGENDO."
                : "Once approved, customers planning experiences in Rwanda will be able to find and book your business through URUGENDO."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (formStep === "form") {
    return (
      <div className="min-h-screen bg-forest-50">
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={() => setFormStep("landing")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-display font-semibold text-charcoal text-base">Become a Partner</h1>
              <p className="text-xs text-gray-400">Submit your business information</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {[
              { key: "name", label: "Business Name", placeholder: "e.g. Kigali Eats Restaurant", required: true },
              { key: "location", label: "Location", placeholder: "e.g. Kacyiru, Kigali", required: true },
              { key: "phone", label: "Phone Number", placeholder: "+250 7XX XXX XXX", required: true },
              { key: "email", label: "Email Address", placeholder: "info@yourbusiness.com", required: true },
              { key: "website", label: "Website (optional)", placeholder: "www.yourbusiness.rw" },
              { key: "social", label: "Social Media (optional)", placeholder: "@yourbusiness on Instagram" },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => updateForm(key as keyof typeof form, e.target.value)}
                  placeholder={placeholder}
                  required={required}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500 transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Business Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500 transition-colors"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Price Range
              </label>
              <div className="flex gap-2">
                {["Budget", "Mid-range", "Premium", "Luxury"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateForm("priceRange", p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                      form.priceRange === p
                        ? "border-forest-500 bg-forest-50 text-forest-700"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Tell us about your business <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                required
                rows={3}
                placeholder="Describe your business and what makes it special..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Services offered
              </label>
              <textarea
                value={form.services}
                onChange={(e) => updateForm("services", e.target.value)}
                rows={2}
                placeholder="e.g. Dinner for groups, private dining, catering..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <Btn type="submit" className="w-full justify-center" size="lg" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Business Application →"}
            </Btn>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-forest-800 to-forest-950 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge color="gold" className="mb-5 inline-flex">
            🤝 For Businesses
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Bring your business to people{" "}
            <span className="italic text-gold-300">ready to experience it.</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Don&apos;t just advertise your business. Connect with customers who are
            actively planning trips, dinners, birthdays, events, and adventures
            across Rwanda — and need exactly what you offer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Btn onClick={startPartnerFlow} variant="gold" size="lg">
              Become a Partner →
            </Btn>
            {isAuthenticated && (
              <Btn
                onClick={() => setFormStep("dashboard")}
                variant="outline"
                size="lg"
                className="!border-white !text-white hover:!bg-white/10"
              >
                Open Dashboard
              </Btn>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-charcoal">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-semibold text-charcoal mb-3">
              Why join URUGENDO?
            </h2>
            <p className="text-gray-500 text-base">
              We connect your business with qualified customers already looking for what you offer
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🎯",
                title: "Qualified Customers",
                desc: "Every customer coming through URUGENDO is actively planning an experience — they have a budget, a date, and intent.",
              },
              {
                icon: "💰",
                title: "Pay When You Earn",
                desc: "URUGENDO earns a small commission only when a successful booking happens. No upfront fees.",
              },
              {
                icon: "📊",
                title: "Business Tools",
                desc: "Manage your availability, set packages, track bookings, and create promotions from your dashboard.",
              },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="w-12 h-12 rounded-xl bg-forest-700 flex items-center justify-center text-2xl mb-4 shadow-md shadow-forest-700/20">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-charcoal text-base mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">
              Who can join?
            </h2>
            <p className="text-gray-500 text-sm">Any business that helps create an experience in Rwanda</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="bg-forest-50 text-forest-700 border border-forest-100 px-4 py-2 rounded-xl text-sm font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-charcoal text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl font-semibold mb-8">
            The URUGENDO Marketplace
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-forest-700 rounded-2xl px-6 py-3 font-semibold">CUSTOMER</div>
            <div className="text-gray-400 text-2xl">↓</div>
            <div className="bg-gold-500 text-charcoal rounded-2xl px-8 py-4 font-bold text-lg">URUGENDO</div>
            <div className="text-gray-400 text-2xl">↓</div>
            <div className="flex flex-wrap justify-center gap-2">
              {["Hotels", "Restaurants", "Transport", "Activities", "Events", "Venues", "Tour Operators", "Photographers"].map((p) => (
                <span key={p} className="bg-white/10 text-white/80 px-3 py-1.5 rounded-xl text-xs font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-forest-700 text-white text-center">
        <h2 className="font-display text-3xl font-semibold mb-4">
          Ready to join URUGENDO?
        </h2>
        <p className="text-white/70 text-base mb-8 max-w-md mx-auto">
          Submit your business and start connecting with customers planning real experiences across Rwanda.
        </p>
        <Btn onClick={startPartnerFlow} variant="gold" size="lg">
          Become a Partner →
        </Btn>
      </section>
    </div>
  )
}

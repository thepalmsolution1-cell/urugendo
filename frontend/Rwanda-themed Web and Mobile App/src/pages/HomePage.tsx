import { useEffect, useState } from "react"
import { AppState, Btn, Badge, StarRating, formatRWF } from "../App"
import { searchExperiences } from "../api/urugendo"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1687986261123-b17f08f2796c?w=1600&h=900&fit=crop&auto=format"

const CATEGORIES = [
  { emoji: "🌍", label: "Trip" },
  { emoji: "🌋", label: "Adventure" },
  { emoji: "🌙", label: "Night Out" },
  { emoji: "🍽️", label: "Dinner" },
  { emoji: "❤️", label: "Date" },
  { emoji: "🎂", label: "Birthday" },
  { emoji: "🎓", label: "Graduation" },
  { emoji: "🎉", label: "Party" },
  { emoji: "💍", label: "Wedding" },
  { emoji: "🎵", label: "Concert" },
  { emoji: "⚽", label: "Game" },
  { emoji: "👨‍👩‍👧", label: "Family Day" },
]

const BUDGET_OPTIONS = [
  { label: "20,000 RWF", value: 20000 },
  { label: "50,000 RWF", value: 50000 },
  { label: "100,000 RWF", value: 100000 },
  { label: "250,000 RWF", value: 250000 },
  { label: "500,000+ RWF", value: 500000 },
  { label: "Custom", value: 0 },
]

const EXPERIENCES = [
  {
    id: "kigali-night",
    title: "Kigali Night Out",
    location: "Kigali",
    category: "Night Out",
    price: 65000,
    people: "2–4",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=600&h=400&fit=crop&auto=format",
    emoji: "🌙",
  },
  {
    id: "lake-kivu",
    title: "Lake Kivu Weekend",
    location: "Rubavu",
    category: "Trip",
    price: 200000,
    people: "2",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1706977570024-fefa419c48c8?w=600&h=400&fit=crop&auto=format",
    emoji: "🌊",
  },
  {
    id: "musanze-adventure",
    title: "Musanze Adventure",
    location: "Musanze",
    category: "Adventure",
    price: 150000,
    people: "2–6",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1621414050946-1b936a78491f?w=600&h=400&fit=crop&auto=format",
    emoji: "🌋",
  },
  {
    id: "nyungwe",
    title: "Nyungwe Nature Experience",
    location: "Nyungwe",
    category: "Adventure",
    price: 300000,
    people: "2–8",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&auto=format",
    emoji: "🌿",
  },
  {
    id: "kigali-date",
    title: "Kigali Date Night",
    location: "Kigali",
    category: "Date",
    price: 80000,
    people: "2",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",
    emoji: "❤️",
  },
  {
    id: "birthday",
    title: "Birthday Celebration Package",
    location: "Kigali",
    category: "Birthday",
    price: 420000,
    people: "10–20",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop&auto=format",
    emoji: "🎂",
  },
  {
    id: "akagera",
    title: "Akagera Safari Experience",
    location: "Akagera",
    category: "Adventure",
    price: 280000,
    people: "2–6",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&auto=format",
    emoji: "🦒",
  },
  {
    id: "concert-night",
    title: "Concert Night Experience",
    location: "Kigali",
    category: "Concert",
    price: 55000,
    people: "1–4",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=600&h=400&fit=crop&auto=format",
    emoji: "🎵",
  },
  {
    id: "graduation",
    title: "Graduation Dinner",
    location: "Kigali",
    category: "Graduation",
    price: 180000,
    people: "8–15",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1742134516273-03ec7c4eb0c7?w=600&h=400&fit=crop&auto=format",
    emoji: "🎓",
  },
]

const SAVE_TRIPS = [
  {
    emoji: "🌊",
    title: "Lake Kivu Weekend",
    cost: 200000,
    image: "https://images.unsplash.com/photo-1514547085879-968fe519da2c?w=600&h=400&fit=crop&auto=format",
  },
  {
    emoji: "🌋",
    title: "Musanze Adventure",
    cost: 150000,
    image: "https://images.unsplash.com/photo-1621414050946-1b936a78491f?w=600&h=400&fit=crop&auto=format",
  },
  {
    emoji: "🌿",
    title: "Nyungwe Experience",
    cost: 300000,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&auto=format",
  },
]

const EVENTS_PREVIEW = [
  {
    emoji: "🎵",
    title: "Kigali Jazz Festival",
    date: "Sat 12 Sep 2026",
    venue: "Kigali Arena",
    ticket: 25000,
    category: "Concert",
  },
  {
    emoji: "⚽",
    title: "APR FC vs Rayon Sports",
    date: "Sun 20 Sep 2026",
    venue: "Amahoro Stadium",
    ticket: 5000,
    category: "Sports",
  },
  {
    emoji: "🎭",
    title: "Rwanda Cultural Festival",
    date: "Fri 26 Sep 2026",
    venue: "Kigali City Centre",
    ticket: 15000,
    category: "Festival",
  },
]

export function HomePage({ setPage, setSelectedTripId }: AppState) {
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [liveExperiences, setLiveExperiences] = useState(EXPERIENCES)

  useEffect(() => {
    searchExperiences({ limit: 24 })
      .then((rows) => {
        if (!rows.length) return
        const mapped = rows.map((e) => ({
          id: e.id,
          title: e.name,
          location: e.location,
          category: e.category,
          price: e.priceRwf,
          people: e.capacity ? String(e.capacity) : "—",
          rating: e.provider?.verificationStatus === "VERIFIED" ? 4.8 : 4.5,
          image:
            e.photos?.[0] ||
            "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=600&h=400&fit=crop&auto=format",
          emoji: "✨",
        }))
        setLiveExperiences([...mapped, ...EXPERIENCES])
      })
      .catch(() => {
        // Keep prototype mock data if API is offline
        setLiveExperiences(EXPERIENCES)
      })
  }, [])

  const filtered = liveExperiences.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBudget = !selectedBudget || e.price <= selectedBudget
    const matchesCategory = !selectedCategory || e.category === selectedCategory
    return matchesSearch && matchesBudget && matchesCategory
  })

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-forest-950">
        <img
          src={HERO_IMAGE}
          alt="Kigali, Rwanda at golden hour"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/40 via-forest-950/50 to-forest-950/80" />

        {/* Rwanda flag stripe accent */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-blue-500" />
          <div className="w-8 bg-yellow-400" />
          <div className="flex-1 bg-forest-600" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <Badge color="gold" className="mb-6">
            🇷🇼 Rwanda&apos;s #1 Experience Platform
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] mb-6">
            Whatever you want to do,{" "}
            <span className="italic text-gold-300">we&apos;ll help you</span>{" "}
            make it happen.
          </h1>
          <p className="text-white/80 text-base sm:text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Plan trips, adventures, nights out, dinners, celebrations and
            unforgettable experiences across Rwanda.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Btn
              onClick={() => setPage("builder")}
              size="lg"
              className="shadow-xl shadow-forest-900/40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plan an Experience
            </Btn>
            <Btn
              onClick={() => setPage("explore")}
              variant="outline"
              size="lg"
              className="border-white/50 text-white hover:bg-white/10 hover:border-white"
            >
              Explore Experiences
            </Btn>
            <Btn
              onClick={() => setPage("my-adventures")}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10"
            >
              💰 Save for an Adventure
            </Btn>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 mt-10">
          <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <svg
              className="w-5 h-5 text-gray-400 ml-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences, restaurants, hotels in Rwanda..."
              className="flex-1 px-3 py-4 text-sm text-charcoal placeholder:text-gray-400 outline-none bg-transparent"
            />
            <button
              onClick={() => setPage("explore")}
              className="m-2 bg-forest-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {["restaurants in Kigali", "date ideas", "weekend trips", "birthday venues"].map(
              (q) => (
                <button
                  key={q}
                  onClick={() => setSearchQuery(q)}
                  className="text-xs text-white/70 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  {q}
                </button>
              )
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── What are you planning? ── */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
            What are you planning?
          </h2>
          <p className="text-gray-500 text-base">
            Choose your experience type and we&apos;ll guide you through the rest
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => {
                setSelectedCategory(selectedCategory === c.label ? null : c.label)
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                selectedCategory === c.label
                  ? "border-forest-600 bg-forest-50 shadow-md"
                  : "border-gray-100 bg-white hover:border-forest-200"
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-medium text-charcoal text-center leading-tight">
                {c.label}
              </span>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Btn onClick={() => setPage("builder")} size="lg">
            Start Planning →
          </Btn>
        </div>
      </section>

      {/* ── Tell us your budget ── */}
      <section className="py-14 bg-forest-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal mb-2">
              What&apos;s your budget?
            </h2>
            <p className="text-gray-500 text-sm">
              We&apos;ll show you experiences that fit what you can spend
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {BUDGET_OPTIONS.map((b) => (
              <button
                key={b.label}
                onClick={() => setSelectedBudget(selectedBudget === b.value ? null : b.value)}
                className={`px-5 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                  selectedBudget === b.value
                    ? "border-forest-600 bg-forest-700 text-white shadow-md"
                    : "border-gray-200 bg-white text-charcoal hover:border-forest-300 hover:bg-forest-50"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          {selectedBudget && selectedBudget > 0 && (
            <p className="text-center text-sm text-forest-700 mt-4 font-medium">
              ✓ Showing experiences under {formatRWF(selectedBudget)}
            </p>
          )}
        </div>
      </section>

      {/* ── Popular Experiences ── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-1">
              Popular Experiences
            </h2>
            <p className="text-gray-500 text-sm">
              Curated experiences across Rwanda — estimated prices
            </p>
          </div>
          <button
            onClick={() => setPage("explore")}
            className="text-forest-700 font-medium text-sm hover:underline shrink-0"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(filtered.length > 0 ? filtered : liveExperiences).slice(0, 9).map((exp) => (
            <div
              key={exp.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedTripId(exp.id)
                setPage("trip-detail")
              }}
            >
              <div className="relative h-48 bg-forest-100 overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge color="green">{exp.emoji} {exp.category}</Badge>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs font-semibold text-charcoal">
                    ~{formatRWF(exp.price)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-charcoal text-base mb-1 group-hover:text-forest-700 transition-colors">
                  {exp.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {exp.location}
                  <span className="text-gray-300">•</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {exp.people} people
                </div>
                <StarRating rating={exp.rating} />
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Estimated price</span>
                  <span className="text-xs text-forest-600 font-medium hover:underline">
                    View Experience →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plan it for me CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-forest-800 to-forest-900 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 left-10 text-8xl">🌍</div>
            <div className="absolute bottom-4 right-10 text-7xl">✨</div>
          </div>
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge color="gold" className="mb-4 inline-flex">
                ✨ AI-Powered Planning
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
                Not sure where to start?
                <br />
                <span className="italic text-gold-300">Let us plan it for you.</span>
              </h2>
              <p className="text-white/70 text-base mb-6">
                Tell us what you enjoy, your budget, and how many people — we&apos;ll
                generate three tailored plan options for you to choose from.
              </p>
              <Btn onClick={() => setPage("plan-for-me")} variant="gold" size="lg">
                Plan It For Me →
              </Btn>
            </div>
            <div className="hidden md:flex flex-col gap-3 shrink-0 w-56">
              {["Budget Friendly · 250,000 RWF", "Balanced · 285,000 RWF", "Premium · 340,000 RWF"].map(
                (opt, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-gold-300 font-semibold text-sm">0{i + 1}</span>
                    <span className="text-white text-sm">{opt}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Save for your adventure ── */}
      <section className="py-16 px-4 bg-gold-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
              Not ready to go yet?
            </h2>
            <p className="text-gray-600 text-base max-w-lg mx-auto">
              Plan your adventure today and start working toward your goal. Track your
              savings progress right here on URUGENDO.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SAVE_TRIPS.map((t) => (
              <div key={t.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gold-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-40 bg-forest-100 overflow-hidden relative">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-2xl">{t.emoji}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-charcoal text-sm mb-1">{t.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Estimated cost:{" "}
                    <strong className="text-forest-700">{formatRWF(t.cost)}</strong>
                  </p>
                  <Btn
                    onClick={() => setPage("my-adventures")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    💰 Save for this Trip
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events happening ── */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-1">
              Events Happening
            </h2>
            <p className="text-gray-500 text-sm">
              Turn any event into a complete experience
            </p>
          </div>
          <button
            onClick={() => setPage("events")}
            className="text-forest-700 font-medium text-sm hover:underline shrink-0"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EVENTS_PREVIEW.map((e) => (
            <div key={e.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center text-2xl shrink-0">
                  {e.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal text-sm leading-tight">{e.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{e.date}</p>
                  <p className="text-xs text-gray-400">{e.venue}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <Badge color="green">{e.category}</Badge>
                <span className="text-sm font-semibold text-charcoal">
                  ~{formatRWF(e.ticket)}
                </span>
              </div>
              <div className="bg-forest-50 rounded-xl p-3 mb-3 text-xs text-forest-700">
                <strong>Make it a complete experience:</strong> Add Dinner + Transport
              </div>
              <Btn
                onClick={() => setPage("events")}
                size="sm"
                className="w-full justify-center"
              >
                🌟 Build My Night
              </Btn>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marketplace section ── */}
      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
              How URUGENDO works
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              One platform connecting you with every service you need for an
              unforgettable experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { step: "01", title: "Discover & Plan", desc: "Browse experiences or use our builder to craft exactly what you want.", icon: "🔍" },
              { step: "02", title: "Budget & Save", desc: "Set your budget, track your savings, and prepare at your own pace.", icon: "💰" },
              { step: "03", title: "Book & Experience", desc: "When you're ready, book everything in one place and enjoy.", icon: "🌟" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-forest-700 text-white flex items-center justify-center text-2xl mb-4 shadow-md shadow-forest-700/20">
                  {s.icon}
                </div>
                <span className="text-xs font-mono text-forest-500 font-medium mb-1">{s.step}</span>
                <h3 className="font-semibold text-charcoal text-base mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-2xl p-6 border border-forest-100">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-semibold text-charcoal">
                Our Provider Network
              </h3>
              <p className="text-sm text-gray-500 mt-1">All the services you need for any experience</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {["Hotels", "Guesthouses", "Restaurants", "Transport", "Tour Guides", "Activities", "Venues", "Photographers", "Entertainment", "Events"].map(
                (cat) => (
                  <span key={cat} className="bg-forest-50 text-forest-700 border border-forest-100 px-4 py-2 rounded-xl text-sm font-medium">
                    {cat}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Business CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-4">
            Are you a business in Rwanda?
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto mb-8">
            "Don&apos;t just advertise your business. Connect with customers who are
            actively looking for what you offer."
          </p>
          <Btn onClick={() => setPage("business")} size="lg" variant="outline">
            Become a Partner →
          </Btn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-charcoal text-white/60 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-forest-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold font-display">U</span>
                </div>
                <span className="font-display font-semibold text-white text-base">URUGENDO</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                Plan it. Save for it. Book it. Experience it.
              </p>
              <p className="text-xs mt-2 text-white/40">Rwanda · Est. 2026</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-white font-medium mb-3">Platform</h4>
                <div className="flex flex-col gap-2">
                  {["Explore", "Plan", "Events", "For Businesses"].map((l) => (
                    <span key={l} className="hover:text-white cursor-pointer transition-colors">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Company</h4>
                <div className="flex flex-col gap-2">
                  {["About", "Careers", "Press", "Contact"].map((l) => (
                    <span key={l} className="hover:text-white cursor-pointer transition-colors">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Legal</h4>
                <div className="flex flex-col gap-2">
                  {["Privacy Policy", "Terms", "Cancellations"].map((l) => (
                    <span key={l} className="hover:text-white cursor-pointer transition-colors">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span>© 2026 URUGENDO. All rights reserved.</span>
            <span className="text-white/30">
              All prices shown are estimated sample prices and may vary.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

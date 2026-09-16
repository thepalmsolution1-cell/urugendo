import { AppState, Btn, Badge, StarRating, formatRWF } from "../App"

const TRIP_DATA = {
  id: "lake-kivu",
  title: "Lake Kivu Weekend",
  subtitle: "A breathtaking escape to Rwanda's most scenic lake",
  location: "Rubavu, Western Province",
  duration: "2 days / 1 night",
  people: "2–8 people",
  estimatedPrice: 200000,
  rating: 4.9,
  reviews: 142,
  emoji: "🌊",
  image: "https://images.unsplash.com/photo-1706977570024-fefa419c48c8?w=1200&h=700&fit=crop&auto=format",
  images: [
    "https://images.unsplash.com/photo-1514547085879-968fe519da2c?w=500&h=350&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1514548383638-cef9251a73ec?w=500&h=350&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=350&fit=crop&auto=format",
  ],
  description:
    "Escape the city and discover the magic of Lake Kivu — one of Africa's Great Lakes, nestled between the hills of western Rwanda and the Democratic Republic of Congo. This weekend package takes you through scenic drives, relaxing boat rides, and fresh local cuisine, all in a stunning natural setting.",
  included: [
    "Private transport from Kigali to Rubavu (return)",
    "1 night accommodation at lake-view guesthouse",
    "Boat tour on Lake Kivu",
    "All breakfasts and one group dinner",
    "Local guide for Rubavu town walk",
  ],
  notIncluded: [
    "Personal expenses and souvenirs",
    "Additional meals and drinks",
    "Travel insurance",
    "Visa fees (if applicable)",
  ],
  itinerary: [
    { day: "Saturday", time: "07:00", activity: "Depart Kigali" },
    { day: "Saturday", time: "10:30", activity: "Arrive Rubavu — check in" },
    { day: "Saturday", time: "12:00", activity: "Lunch at lakeside restaurant" },
    { day: "Saturday", time: "14:00", activity: "Boat tour on Lake Kivu" },
    { day: "Saturday", time: "17:00", activity: "Explore Gisenyi town" },
    { day: "Saturday", time: "19:30", activity: "Group dinner at hotel" },
    { day: "Sunday", time: "08:00", activity: "Breakfast with lake view" },
    { day: "Sunday", time: "10:00", activity: "Guided Rubavu walk" },
    { day: "Sunday", time: "12:30", activity: "Lunch and departure" },
    { day: "Sunday", time: "16:00", activity: "Arrive back in Kigali" },
  ],
  providers: [
    { name: "Kivu Lake Retreat", type: "Accommodation", rating: 4.7, price: 60000 },
    { name: "Safari Transport Ltd", type: "Transport", rating: 4.6, price: 40000 },
    { name: "Lake Breeze Restaurant", type: "Dining", rating: 4.8, price: 50000 },
    { name: "Kivu Boat Tours", type: "Activity", rating: 4.9, price: 25000 },
  ],
}

export function TripDetailPage({ setPage, setSavingsGoals, savingsGoals }: AppState) {
  const trip = TRIP_DATA

  const saveForTrip = () => {
    const already = savingsGoals.find((g) => g.id === "lake-kivu")
    if (already) {
      setPage("my-adventures")
      return
    }
    const goal = {
      id: "lake-kivu",
      name: "Lake Kivu Weekend",
      emoji: "🌊",
      targetAmount: trip.estimatedPrice,
      currentSavings: 0,
      targetDate: "2026-12-20",
      image: trip.image,
      history: [],
    }
    setSavingsGoals([...savingsGoals, goal])
    setPage("my-adventures")
  }

  const alreadySaving = !!savingsGoals.find((g) => g.id === "lake-kivu")

  return (
    <div className="min-h-screen bg-white">
      {/* Back button */}
      <div className="absolute top-20 left-4 z-20 md:top-24 md:left-6">
        <button
          onClick={() => setPage("home")}
          className="bg-white/90 backdrop-blur-sm shadow-md px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-charcoal hover:bg-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-72 md:h-96 bg-forest-100">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-6 left-4 right-4 md:left-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="green">{trip.emoji} Trip</Badge>
            <Badge color="gold">Top Rated</Badge>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">{trip.title}</h1>
          <p className="text-white/80 text-sm mt-1">{trip.subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:flex gap-8">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "📍", label: "Location", value: trip.location },
              { icon: "📅", label: "Duration", value: trip.duration },
              { icon: "👥", label: "Group size", value: trip.people },
              { icon: "💰", label: "Est. price", value: "~" + formatRWF(trip.estimatedPrice) },
            ].map((s) => (
              <div key={s.label} className="bg-forest-50 rounded-xl p-3">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
                <div className="text-xs font-semibold text-charcoal mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={trip.rating} />
            <span className="text-sm text-gray-500">{trip.reviews} reviews</span>
            <Badge color="green">Highly Rated</Badge>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">About this experience</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{trip.description}</p>
          </div>

          {/* Gallery */}
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">Gallery</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {trip.images.map((img, i) => (
                <div key={i} className="w-48 h-32 rounded-xl bg-forest-100 overflow-hidden shrink-0">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* What's included */}
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">What&apos;s included</h2>
            <div className="space-y-2">
              {trip.included.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-forest-600 mt-0.5 shrink-0">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-500">Not included</h3>
              {trip.notIncluded.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-gray-300 mt-0.5 shrink-0">✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-4">Sample Itinerary</h2>
            {["Saturday", "Sunday"].map((day) => (
              <div key={day} className="mb-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{day}</h3>
                <div className="relative pl-5 border-l-2 border-forest-100 space-y-3">
                  {trip.itinerary
                    .filter((i) => i.day === day)
                    .map((item) => (
                      <div key={item.time} className="relative flex gap-3">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-forest-600 border-2 border-white" />
                        <span className="text-xs font-mono text-forest-600 font-semibold w-12 shrink-0 mt-0.5">
                          {item.time}
                        </span>
                        <span className="text-sm text-gray-600">{item.activity}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Providers */}
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-4">Available Providers</h2>
            <div className="space-y-3">
              {trip.providers.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div>
                    <p className="font-medium text-charcoal text-sm">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge color="gray">{p.type}</Badge>
                      <span className="text-yellow-400 text-xs">★ {p.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-charcoal">{formatRWF(p.price)}</span>
                    <p className="text-xs text-gray-400">estimated</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="md:w-72 shrink-0 mt-6 md:mt-0">
          <div className="sticky top-20 bg-white rounded-2xl border-2 border-forest-100 p-5 shadow-sm">
            <div className="mb-4">
              <span className="text-2xl font-bold font-display text-charcoal">
                ~{formatRWF(trip.estimatedPrice)}
              </span>
              <span className="text-xs text-gray-400 block">estimated per group · sample price</span>
            </div>

            <div className="space-y-1 text-sm mb-5">
              {[
                { label: "Duration", value: trip.duration },
                { label: "Group size", value: trip.people },
                { label: "Rating", value: `★ ${trip.rating} (${trip.reviews} reviews)` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="font-medium text-charcoal text-right">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Btn className="w-full justify-center" size="lg" onClick={() => setPage("builder")}>
                Build This Trip
              </Btn>
              <Btn variant="outline" className="w-full justify-center" onClick={() => setPage("plan-for-me")}>
                Plan It For Me
              </Btn>
              <Btn
                variant={alreadySaving ? "ghost" : "outline"}
                className="w-full justify-center"
                onClick={saveForTrip}
              >
                {alreadySaving ? "✓ Saving for this Trip" : "💰 Save for this Trip"}
              </Btn>
            </div>

            <div className="mt-4 bg-forest-50 rounded-xl p-3 text-xs text-forest-700 text-center">
              <p className="font-semibold mb-1">Not ready to book yet?</p>
              <p className="text-forest-600 leading-relaxed">
                Start a savings goal and we&apos;ll help you reach your target before your trip.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center space-y-1">
              <p>✓ Verified providers</p>
              <p>✓ Estimated pricing</p>
              <p>Booking Integration Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

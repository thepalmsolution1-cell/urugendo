import { useState } from "react"
import { AppState, Btn, Badge, formatRWF } from "../App"

const EVENTS = [
  {
    id: "e1",
    title: "Kigali Jazz Festival 2026",
    category: "Concert",
    emoji: "🎵",
    venue: "Kigali Arena, Remera",
    date: "Sat 12 Sep 2026",
    time: "18:00",
    ticketPrice: 25000,
    image: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=700&h=420&fit=crop&auto=format",
    description: "Rwanda's premier jazz festival returns with world-class artists and local talent.",
  },
  {
    id: "e2",
    title: "APR FC vs Rayon Sports",
    category: "Sports",
    emoji: "⚽",
    venue: "Amahoro National Stadium",
    date: "Sun 20 Sep 2026",
    time: "15:00",
    ticketPrice: 5000,
    image: "https://images.unsplash.com/photo-1574155267225-3b5423dd45d9?w=700&h=420&fit=crop&auto=format",
    description: "The biggest Kigali derby. APR FC takes on Rayon Sports in a Premier League showdown.",
  },
  {
    id: "e3",
    title: "Rwanda Cultural Festival",
    category: "Festival",
    emoji: "🎭",
    venue: "Kigali City Centre",
    date: "Fri–Sun 26–28 Sep 2026",
    time: "10:00",
    ticketPrice: 15000,
    image: "https://images.unsplash.com/photo-1659928005804-0ec9c656918f?w=700&h=420&fit=crop&auto=format",
    description: "Celebrate Rwandan culture, music, food and art at this annual 3-day festival.",
  },
  {
    id: "e4",
    title: "Afro Nights Comedy Show",
    category: "Comedy",
    emoji: "😄",
    venue: "Kigali Serena Hotel Ballroom",
    date: "Sat 4 Oct 2026",
    time: "19:30",
    ticketPrice: 20000,
    image: "https://images.unsplash.com/photo-1514547085879-968fe519da2c?w=700&h=420&fit=crop&auto=format",
    description: "A night of laughs with East Africa's top comedians. Doors open at 18:30.",
  },
  {
    id: "e5",
    title: "Kigali Art Exhibition",
    category: "Exhibition",
    emoji: "🎨",
    venue: "Inema Arts Centre, Kimironko",
    date: "1–31 Oct 2026",
    time: "09:00–18:00",
    ticketPrice: 5000,
    image: "https://images.unsplash.com/photo-1779900275257-aaadab6d9285?w=700&h=420&fit=crop&auto=format",
    description: "A month-long showcase of contemporary Rwandan art from 30+ local and international artists.",
  },
  {
    id: "e6",
    title: "Gorilla Marathon 2026",
    category: "Sports",
    emoji: "🏃",
    venue: "Musanze District",
    date: "Sat 15 Nov 2026",
    time: "07:00",
    ticketPrice: 30000,
    image: "https://images.unsplash.com/photo-1621414050946-1b936a78491f?w=700&h=420&fit=crop&auto=format",
    description: "Run through the lush hills of Musanze in one of Africa's most scenic marathons.",
  },
]

const CATEGORIES = ["All", "Concert", "Sports", "Festival", "Comedy", "Exhibition"]

interface ExperienceBuilder {
  eventId: string
  hasDinner: boolean
  hasTransport: boolean
  hasHotel: boolean
}

export function EventsPage({ setPage }: AppState) {
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null)
  const [builder, setBuilder] = useState<ExperienceBuilder | null>(null)

  const filtered =
    activeCategory === "All"
      ? EVENTS
      : EVENTS.filter((e) => e.category === activeCategory)

  if (selectedEvent) {
    const dinnerCost = 35000
    const transportCost = 10000
    const hotelCost = 45000
    const total =
      selectedEvent.ticketPrice +
      (builder?.hasDinner ? dinnerCost : 0) +
      (builder?.hasTransport ? transportCost : 0) +
      (builder?.hasHotel ? hotelCost : 0)

    return (
      <div className="min-h-screen bg-forest-50">
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => { setSelectedEvent(null); setBuilder(null) }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-semibold text-charcoal text-base">Event Details</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Event card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-56 bg-forest-100">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge color="green">{selectedEvent.emoji} {selectedEvent.category}</Badge>
                <h2 className="font-display text-xl font-semibold text-white mt-1">{selectedEvent.title}</h2>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <span>📅</span> {selectedEvent.date}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>⏰</span> {selectedEvent.time}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>📍</span> {selectedEvent.venue}
                </div>
                <div className="flex items-center gap-2 font-semibold text-forest-700">
                  <span>🎫</span> ~{formatRWF(selectedEvent.ticketPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Make it a complete experience */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-display font-semibold text-charcoal text-base mb-1">
              🌟 Make This a Complete Experience
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              Add services to turn this event into a full night out
            </p>

            <div className="space-y-3">
              {/* Ticket (always included) */}
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span>🎫</span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">Event Ticket</p>
                    <p className="text-xs text-gray-500">Always included</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-forest-700">{formatRWF(selectedEvent.ticketPrice)}</span>
                  <div className="w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              </div>

              {[
                { key: "hasDinner", emoji: "🍽️", label: "Dinner", sub: "Repub Lounge, Kigali", cost: dinnerCost },
                { key: "hasTransport", emoji: "🚗", label: "Transport", sub: "Private Taxi (return)", cost: transportCost },
                { key: "hasHotel", emoji: "🏨", label: "Accommodation", sub: "Gorillas Hotel, Kigali", cost: hotelCost },
              ].map(({ key, emoji, label, sub, cost }) => {
                const checked = builder ? (builder as any)[key] : false
                return (
                  <button
                    key={key}
                    onClick={() =>
                      setBuilder((b) => ({
                        eventId: selectedEvent.id,
                        hasDinner: b?.hasDinner ?? false,
                        hasTransport: b?.hasTransport ?? false,
                        hasHotel: b?.hasHotel ?? false,
                        [key]: !checked,
                      }))
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      checked
                        ? "border-forest-500 bg-forest-50"
                        : "border-gray-100 bg-white hover:border-forest-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-lg">{emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-charcoal">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-charcoal">+{formatRWF(cost)}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        checked ? "bg-forest-600" : "bg-gray-100"
                      }`}>
                        <span className={`text-xs ${checked ? "text-white" : "text-gray-400"}`}>
                          {checked ? "✓" : "+"}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 bg-charcoal rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-sm">Complete Experience Total</span>
                <span className="text-gold-300 font-bold text-lg">{formatRWF(total)}</span>
              </div>
              {builder && (builder.hasDinner || builder.hasTransport || builder.hasHotel) && (
                <div className="text-white/60 text-xs mt-1">
                  Ticket + {[
                    builder.hasDinner && "Dinner",
                    builder.hasTransport && "Transport",
                    builder.hasHotel && "Hotel",
                  ].filter(Boolean).join(" + ")}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Btn className="w-full justify-center" size="lg" onClick={() => setPage("builder")}>
              Build Full Experience →
            </Btn>
            <Btn variant="outline" className="w-full justify-center" size="lg">
              🎫 Add to Experience
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-1">Events Happening</h1>
          <p className="text-gray-500 text-sm">
            Don&apos;t just buy a ticket — build a complete experience around it
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 flex gap-2 overflow-x-auto py-3">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border-2 whitespace-nowrap transition-all ${
                activeCategory === c
                  ? "border-forest-600 bg-forest-700 text-white"
                  : "border-gray-200 text-gray-600 bg-white hover:border-forest-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="relative h-44 bg-forest-100 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge color="green">{event.emoji} {event.category}</Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs font-semibold">~{formatRWF(event.ticketPrice)}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-charcoal text-sm mb-2">{event.title}</h3>
                <div className="space-y-1 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <span>📅</span> {event.date} · {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📍</span> {event.venue}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Btn
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => setSelectedEvent(event)}
                  >
                    🌟 Build My Night
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEvent(event)}
                  >
                    View
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

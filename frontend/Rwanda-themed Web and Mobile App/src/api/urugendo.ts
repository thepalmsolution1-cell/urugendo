import { api } from "./client"

export type ProviderCategory =
  | "RESTAURANT"
  | "CAFE"
  | "ACTIVITY"
  | "ATTRACTION"
  | "HOTEL"
  | "TRANSPORT"
  | "EVENT"
  | "OTHER"

export interface Provider {
  id: string
  name: string
  category: ProviderCategory
  description?: string | null
  contactEmail: string
  contactPhone: string
  location: string
  verificationStatus: string
  priceRangeMin?: number | null
  priceRangeMax?: number | null
  photos?: string[]
  rating?: number | null
  _count?: { experiences: number; menuItems: number; reservations: number }
}

export interface Reservation {
  id: string
  providerId: string
  experienceId?: string | null
  reservedDate: string
  reservedTime?: string | null
  people: number
  specialRequest?: string | null
  status: "REQUESTED" | "PROCESSING" | "CONFIRMED" | "REJECTED" | "CANCELLED"
  providerNote?: string | null
  provider?: { id: string; name: string; location?: string }
  experience?: { id: string; name: string; priceRwf: number } | null
  user?: { id: string; name: string; email?: string | null; contactPhone?: string | null }
}

export interface ExperienceCard {
  id: string
  name: string
  description?: string | null
  category: string
  location: string
  priceRwf: number
  durationMinutes?: number | null
  capacity?: number | null
  photos?: string[]
  provider?: { id: string; name: string; verificationStatus?: string } | null
}

export function mapBusinessCategory(label: string): ProviderCategory {
  const map: Record<string, ProviderCategory> = {
    "Hotels & Guesthouses": "HOTEL",
    "Restaurants & Cafes": "RESTAURANT",
    "Transport Providers": "TRANSPORT",
    "Tour Operators & Guides": "ACTIVITY",
    "Event Organizers": "EVENT",
    Venues: "OTHER",
    "Photographers & Videographers": "OTHER",
    "Cake & Decorations": "OTHER",
    Entertainment: "EVENT",
    "Activity Providers": "ACTIVITY",
    Other: "OTHER",
  }
  return map[label] || "OTHER"
}

export async function registerProvider(body: {
  name: string
  category: ProviderCategory
  description?: string
  contactEmail: string
  contactPhone: string
  location: string
  priceRangeMin?: number
  priceRangeMax?: number
}) {
  const res = await api.post<{ data: Provider }>("/api/v1/providers", body)
  return res.data
}

export async function listMyProviders() {
  const res = await api.get<{ data: Provider[] }>("/api/v1/providers/me")
  return res.data
}

export async function listPublicProviders(params?: { location?: string; category?: string }) {
  const q = new URLSearchParams()
  if (params?.location) q.set("location", params.location)
  if (params?.category) q.set("category", params.category)
  const qs = q.toString()
  const res = await api.get<{ data: Provider[] }>(`/api/v1/providers${qs ? `?${qs}` : ""}`)
  return res.data
}

export async function listProviderReservations(providerId: string) {
  const res = await api.get<{ data: Reservation[] }>(
    `/api/v1/providers/${providerId}/reservations`
  )
  return res.data
}

export async function updateReservationStatus(
  providerId: string,
  reservationId: string,
  status: "PROCESSING" | "CONFIRMED" | "REJECTED",
  providerNote?: string
) {
  const res = await api.patch<{ data: Reservation }>(
    `/api/v1/providers/${providerId}/reservations/${reservationId}/status`,
    { status, providerNote }
  )
  return res.data
}

export async function createReservation(body: {
  providerId: string
  experienceId?: string
  reservedDate: string
  reservedTime?: string
  people?: number
  specialRequest?: string
}) {
  const res = await api.post<{ data: Reservation }>("/api/v1/reservations", body)
  return res.data
}

export async function listMyReservations() {
  const res = await api.get<{ data: Reservation[] }>("/api/v1/reservations/me")
  return res.data
}

export async function searchExperiences(params?: {
  location?: string
  category?: string
  price_max?: number
  q?: string
  limit?: number
}) {
  const q = new URLSearchParams()
  if (params?.location) q.set("location", params.location)
  if (params?.category) q.set("category", params.category)
  if (params?.price_max != null) q.set("price_max", String(params.price_max))
  if (params?.q) q.set("q", params.q)
  if (params?.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  const res = await api.get<{ status: string; data: any }>(
    `/api/v1/experiences${qs ? `?${qs}` : ""}`
  )
  const data = res.data
  if (Array.isArray(data)) return data as ExperienceCard[]
  if (Array.isArray(data?.items)) return data.items as ExperienceCard[]
  if (Array.isArray(data?.experiences)) return data.experiences as ExperienceCard[]
  if (Array.isArray(data?.data)) return data.data as ExperienceCard[]
  return []
}

export async function submitExperienceRequest(text: string) {
  const res = await api.post<{ status: string; data: any }>("/api/v1/experience-request", {
    text,
  })
  return res.data
}

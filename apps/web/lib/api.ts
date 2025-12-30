import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export interface Event {
  id: string
  slug: string
  title: string
  description?: string
  coverImageUrl?: string
  startDate: string
  endDate?: string
  timezone: string
  location?: string
  locationType: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  onlineLink?: string
  capacity?: number
  priceType: 'FREE' | 'PAID'
  priceAmount?: number
  priceCurrency?: string
  isPublic: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  questions?: EventQuestion[]
  _count?: {
    rsvps: number
  }
}

export interface EventQuestion {
  id: string
  question: string
  type: string
  isRequired: boolean
  options?: string
  order: number
}

export interface RSVP {
  id: string
  eventId: string
  userId: string
  status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED'
  guestCount: number
  name?: string
  email?: string
  phone?: string
  consentGiven: boolean
  answers?: RSVPAnswer[]
}

export interface RSVPAnswer {
  id: string
  questionId: string
  answer: string
  question?: EventQuestion
}

// Auth
export async function authenticateTelegram(initData: string) {
  const response = await api.post('/auth/telegram', { initData })
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token)
  }
  return response.data
}

// Events
export async function getEvents(filters?: { status?: string; userId?: string }) {
  const response = await api.get<Event[]>('/events', { params: filters })
  return response.data
}

export async function getEvent(idOrSlug: string) {
  const response = await api.get<Event>(`/events/${idOrSlug}`)
  return response.data
}

export async function createEvent(data: any) {
  const response = await api.post<Event>('/events', data)
  return response.data
}

export async function updateEvent(id: string, data: any) {
  const response = await api.patch<Event>(`/events/${id}`, data)
  return response.data
}

export async function deleteEvent(id: string) {
  const response = await api.delete(`/events/${id}`)
  return response.data
}

// RSVP
export async function createRSVP(eventId: string, data: any) {
  const response = await api.post<RSVP>(`/events/${eventId}/rsvp`, data)
  return response.data
}

export async function getMyRSVP(eventId: string) {
  const response = await api.get<RSVP>(`/events/${eventId}/rsvp/me`)
  return response.data
}

export async function cancelRSVP(eventId: string) {
  const response = await api.delete(`/events/${eventId}/rsvp`)
  return response.data
}

// Host Dashboard
export async function getAttendees(eventId: string) {
  const response = await api.get(`/events/${eventId}/attendees`)
  return response.data
}

export async function getAnalytics(eventId: string) {
  const response = await api.get(`/events/${eventId}/analytics`)
  return response.data
}

export async function exportCSV(eventId: string) {
  const response = await api.get(`/events/${eventId}/export`)
  return response.data
}

export async function checkIn(eventId: string, rsvpId: string) {
  const response = await api.post(`/events/${eventId}/checkin`, { rsvpId })
  return response.data
}


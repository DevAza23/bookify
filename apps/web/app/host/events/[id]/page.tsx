'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEvent, getAttendees, getAnalytics, exportCSV, Event } from '@/lib/api'
import { formatEventDate } from '@/lib/utils'
import { useTelegram } from '@/app/providers/telegram-provider'

interface Attendee {
  id: string
  name?: string
  email?: string
  phone?: string
  guestCount: number
  status: string
  createdAt: string
  user: {
    firstName?: string
    lastName?: string
    username?: string
  }
  checkIns: any[]
}

export default function HostDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { initData, isReady } = useTelegram()

  useEffect(() => {
    if (isReady && eventId) {
      authenticate()
      loadData()
    }
  }, [isReady, eventId])

  async function authenticate() {
    if (initData && !localStorage.getItem('auth_token')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        })
        const data = await response.json()
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
      } catch (error) {
        console.error('Auth failed:', error)
      }
    }
  }

  async function loadData() {
    try {
      const [eventData, attendeesData, analyticsData] = await Promise.all([
        getEvent(eventId),
        getAttendees(eventId),
        getAnalytics(eventId),
      ])
      setEvent(eventData)
      setAttendees(attendeesData)
      setAnalytics(analyticsData)
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('You do not have permission to view this dashboard')
        router.push('/')
      }
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleExportCSV() {
    try {
      const data = await exportCSV(eventId)
      const blob = new Blob([data.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-hint">Loading...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-hint">Event not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">{event.title}</h1>
            <p className="text-hint">{formatEventDate(event.startDate, event.timezone)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/host/events/${eventId}/checkin`}
              className="px-4 py-2 bg-button text-buttonText rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Check-In Scanner
            </Link>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-secondaryBg transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-secondaryBg rounded-xl p-6">
              <p className="text-hint text-sm mb-1">Total RSVPs</p>
              <p className="text-3xl font-bold text-text">{analytics.totalRSVPs}</p>
            </div>
            <div className="bg-secondaryBg rounded-xl p-6">
              <p className="text-hint text-sm mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-text">{analytics.confirmedRSVPs}</p>
            </div>
            <div className="bg-secondaryBg rounded-xl p-6">
              <p className="text-hint text-sm mb-1">Waitlisted</p>
              <p className="text-3xl font-bold text-text">{analytics.waitlistedRSVPs}</p>
            </div>
            <div className="bg-secondaryBg rounded-xl p-6">
              <p className="text-hint text-sm mb-1">Checked In</p>
              <p className="text-3xl font-bold text-text">{analytics.checkedIn}</p>
            </div>
          </div>
        )}

        <div className="bg-secondaryBg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-4">Attendees ({attendees.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-4 text-text font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-text font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-text font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-text font-medium">Guests</th>
                  <th className="text-left py-3 px-4 text-text font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text font-medium">Checked In</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b border-gray-200">
                    <td className="py-3 px-4 text-text">
                      {attendee.name ||
                        `${attendee.user.firstName || ''} ${attendee.user.lastName || ''}`.trim() ||
                        attendee.user.username ||
                        'Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-text">{attendee.email || '-'}</td>
                    <td className="py-3 px-4 text-text">{attendee.phone || '-'}</td>
                    <td className="py-3 px-4 text-text">{attendee.guestCount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          attendee.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : attendee.status === 'WAITLISTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {attendee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text">
                      {attendee.checkIns.length > 0 ? '✅ Yes' : '❌ No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


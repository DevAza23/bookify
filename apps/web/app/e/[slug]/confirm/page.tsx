'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import { createEvent } from 'ics'
import { getEvent, getMyRSVP, Event, RSVP } from '@/lib/api'
import { formatEventDate, copyToClipboard } from '@/lib/utils'

export default function ConfirmPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const rsvpId = searchParams.get('rsvpId')
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvp, setRSVP] = useState<RSVP | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (slug && rsvpId) {
      loadData()
    }
  }, [slug, rsvpId])

  async function loadData() {
    try {
      const [eventData, rsvpData] = await Promise.all([
        getEvent(slug),
        getMyRSVP((await getEvent(slug)).id),
      ])
      setEvent(eventData)
      setRSVP(rsvpData)

      // Generate QR code
      if (rsvpData) {
        const qrData = JSON.stringify({ rsvpId: rsvpData.id, eventId: eventData.id })
        const qrUrl = await QRCode.toDataURL(qrData)
        setQrCodeUrl(qrUrl)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  function handleAddToCalendar() {
    if (!event || !rsvp) return

    const startDate = new Date(event.startDate)
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

    createEvent({
      title: event.title,
      description: event.description || '',
      location: event.location || event.onlineLink || '',
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ],
      url: typeof window !== 'undefined' ? window.location.origin + `/e/${slug}` : '',
    }, (error, value) => {
      if (error) {
        console.error('Failed to create calendar event:', error)
        return
      }
      if (value) {
        const blob = new Blob([value], { type: 'text/calendar' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${event.slug}.ics`
        link.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  if (!event || !rsvp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-hint">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-text mb-2">
            {rsvp.status === 'WAITLISTED' ? "You're on the waitlist!" : "You're confirmed!"}
          </h1>
          <p className="text-hint">
            {rsvp.status === 'WAITLISTED'
              ? "We'll notify you if a spot becomes available."
              : `See you at ${event.title}!`}
          </p>
        </div>

        <div className="bg-secondaryBg rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-text mb-4">Event Details</h2>
          <div className="space-y-2 text-text">
            <p>
              <strong>Event:</strong> {event.title}
            </p>
            <p>
              <strong>Date:</strong> {formatEventDate(event.startDate, event.timezone)}
            </p>
            {rsvp.name && (
              <p>
                <strong>Name:</strong> {rsvp.name}
              </p>
            )}
            {rsvp.email && (
              <p>
                <strong>Email:</strong> {rsvp.email}
              </p>
            )}
            <p>
              <strong>Guests:</strong> {rsvp.guestCount}
            </p>
            <p>
              <strong>Status:</strong> {rsvp.status}
            </p>
          </div>
        </div>

        {rsvp.status === 'CONFIRMED' && qrCodeUrl && (
          <div className="bg-secondaryBg rounded-xl p-6 mb-6 text-center">
            <h2 className="text-xl font-bold text-text mb-4">Your Ticket</h2>
            <div className="flex justify-center mb-4">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-hint">Show this QR code at check-in</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAddToCalendar}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-secondaryBg transition-colors"
          >
            Add to Calendar
          </button>
          <button
            onClick={() => copyToClipboard(window.location.href)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-secondaryBg transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEvent, Event } from '@/lib/api'
import { formatEventDate, copyToClipboard, shareTelegram } from '@/lib/utils'
import { useTelegram } from '@/app/providers/telegram-provider'

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const { isReady } = useTelegram()

  useEffect(() => {
    if (isReady && slug) {
      loadEvent()
    }
  }, [isReady, slug])

  async function loadEvent() {
    try {
      const data = await getEvent(slug)
      setEvent(data)
    } catch (error) {
      console.error('Failed to load event:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleShare() {
    const url = window.location.href
    copyToClipboard(url)
    // Show Telegram share option
    shareTelegram(`Check out this event: ${event?.title}`, url)
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

  const eventUrl = typeof window !== 'undefined' ? window.location.href : ''
  const confirmedCount = event._count?.rsvps || 0
  const isFull = event.capacity && confirmedCount >= event.capacity

  return (
    <div className="min-h-screen bg-background">
      {event.coverImageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-text mb-4">{event.title}</h1>
          <div className="flex items-center gap-4 text-hint mb-4">
            <span>{formatEventDate(event.startDate, event.timezone)}</span>
            {event.locationType === 'IN_PERSON' && event.location && (
              <span>📍 {event.location}</span>
            )}
            {event.locationType === 'ONLINE' && event.onlineLink && (
              <span>🌐 Online</span>
            )}
          </div>
          {event.description && (
            <p className="text-text text-lg mb-6 whitespace-pre-wrap">{event.description}</p>
          )}
        </div>

        <div className="bg-secondaryBg rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-text">
                {confirmedCount} {confirmedCount === 1 ? 'attendee' : 'attendees'}
              </p>
              {event.capacity && (
                <p className="text-hint text-sm">
                  {event.capacity - confirmedCount} spots remaining
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text">
                {event.priceType === 'FREE' ? 'Free' : `$${event.priceAmount}`}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/e/${slug}/rsvp`}
              className="flex-1 px-6 py-3 bg-button text-buttonText rounded-lg font-medium text-center hover:opacity-90 transition-opacity"
            >
              {isFull ? 'Join Waitlist' : 'RSVP'}
            </Link>
            <button
              onClick={handleShare}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-secondaryBg transition-colors"
            >
              Share
            </button>
          </div>
        </div>

        {event.locationType === 'IN_PERSON' && event.location && (
          <div className="bg-secondaryBg rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-text mb-2">Location</h2>
            <p className="text-text">{event.location}</p>
          </div>
        )}

        {event.locationType === 'ONLINE' && event.onlineLink && (
          <div className="bg-secondaryBg rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-text mb-2">Join Online</h2>
            <a
              href={event.onlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link underline"
            >
              {event.onlineLink}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getEvents, Event } from '@/lib/api'
import { formatEventDate } from '@/lib/utils'
import { useTelegram } from './providers/telegram-provider'

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { isReady } = useTelegram()

  useEffect(() => {
    if (isReady) {
      loadEvents()
    }
  }, [isReady])

  async function loadEvents() {
    try {
      const data = await getEvents({ status: 'PUBLISHED' })
      setEvents(data)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text">Events</h1>
          <Link
            href="/events/new"
            className="px-4 py-2 bg-button text-buttonText rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Event
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-hint">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-hint text-lg">No events found</p>
            <Link
              href="/events/new"
              className="mt-4 inline-block px-6 py-3 bg-button text-buttonText rounded-lg font-medium"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/e/${event.slug}`}
                className="block bg-secondaryBg rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {event.coverImageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={event.coverImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-text mb-2">{event.title}</h2>
                  {event.description && (
                    <p className="text-hint text-sm mb-4 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-hint">
                      {formatEventDate(event.startDate, event.timezone)}
                    </span>
                    {event._count && (
                      <span className="text-hint">
                        {event._count.rsvps} {event._count.rsvps === 1 ? 'attendee' : 'attendees'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

